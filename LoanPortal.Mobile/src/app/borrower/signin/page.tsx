"use client";
import { Suspense } from "react";
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { firebaseAuth as auth } from "@/api/instances/firebase";
import { useSessionStore } from "@/stores/SessionStore";
import SVGs from "@/components/SVGs";
import ControlledInput from "@/components/Forms/Fields/ControlledInput";
import AuthButton from "@/components/Auth/AuthButton";
import CustomSnackBar from "@/components/CustomSnackBar";
import { useSnackBarStore } from "@/store/SnackBarStore";
import {
  validateBorrowerPortalToken,
  validateBorrowerToken,
  BorrowerPortalTokenData,
} from "@/api/network/user";
import PersonIcon from "@mui/icons-material/Person";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const BORROWER_ROLE = 3;

const BorrowerSignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type BorrowerSignInSchemaType = z.infer<typeof BorrowerSignInSchema>;
type TokenState = "loading" | "valid" | "invalid";

const BorrowerSignInContent = () => {
  const { openSnackBar, closeDialog, severity, message } = useSnackBarStore();
  const { openErrorDialog } = useSnackBarStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenState, setTokenState] = useState<TokenState>("loading");
  const [portalData, setPortalData] = useState<BorrowerPortalTokenData | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isRateLimited, setRateLimited] = useState(false);
  const { setUser, setHasHydrated } = useSessionStore();

  useEffect(() => {
    document.title = "Sign In - Loans N Stuff";
  }, []);

  useEffect(() => {
    if (!token) { setTokenState("invalid"); return; }
    const validate = async () => {
      try {
        const res = await validateBorrowerPortalToken(token);
        if (res.data?.success && res.data?.data) {
          setPortalData(res.data.data);
          setTokenState("valid");
        } else {
          setTokenState("invalid");
        }
      } catch {
        setTokenState("invalid");
      }
    };
    validate();
  }, [token]);

  const { control, handleSubmit, formState: { errors } } = useForm<BorrowerSignInSchemaType>({
    resolver: zodResolver(BorrowerSignInSchema),
  });

  const onSubmit: SubmitHandler<BorrowerSignInSchemaType> = async (data) => {
    if (isRateLimited) {
      openErrorDialog("Too many failed attempts, please try after some time!");
      return;
    }
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const fbUser = credential.user;
      console.log("credential =>", credential);

      const firebaseToken = await fbUser.getIdToken();
      const refreshToken = fbUser.refreshToken;

      const validation = await validateBorrowerToken(firebaseToken);
      const newFirebaseToken = await fbUser.getIdToken(true);
      
      if (validation.data?.success === false) {
        await auth.signOut();
        openErrorDialog("Incorrect email or password. Please try again.");
        return;
      }

      // Only borrowers (Role 3) may use the borrower portal; agents must use the agent sign in
      const borrower = validation.data?.data;
      if (Number(borrower?.role) !== BORROWER_ROLE) {
        await auth.signOut();
        openErrorDialog("Incorrect email or password. Please try again.");
        return;
      }

      // Mark this session as a borrower so ProtectedRoute blocks agent pages
      setUser({
        userId: fbUser.uid,
        displayName: fbUser.displayName ?? "",
        firstName: "",
        lastName: "",
        email: fbUser.email ?? "",
        phone: fbUser.phoneNumber ?? "",
        // token: firebaseToken,
        token: newFirebaseToken,
        refreshToken,
        isAdmin: false,
        isBorrower: true,
      });
      setHasHydrated(true);
      // Redirect to borrower employment history
      router.push(`/borrower/employment?token=${encodeURIComponent(token)}`);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message ?? "";
      if (
        errorMessage.includes("auth/invalid-credential") ||
        errorMessage.includes("auth/wrong-password") ||
        errorMessage.includes("auth/user-not-found")
      ) {
        openErrorDialog("Incorrect email or password. Please try again.");
      } else {
        openErrorDialog("Sign in failed. Please try again.");
      }
      setAttempts((prev) => {
        const next = prev + 1;
        if (next >= 5) {
          setRateLimited(true);
          setTimeout(() => { setRateLimited(false); setAttempts(0); }, 30000);
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const bgImg = (
    <Box
      component="img"
      src={isMobile ? "/Background_Svgs/authBackground-mobile.svg" : "/Background_Svgs/authBackground.svg"}
      sx={{ position: "absolute", zIndex: 0, width: "100vw", height: "100%", minHeight: "100vh", objectFit: "cover", left: ".1%" }}
    />
  );

  const cardSx = {
    position: "relative" as const, width: "100%", borderRadius: "24px", padding: "32px",
    gap: "24px", display: "flex", flexDirection: "column" as const,
    backgroundColor: "background.paper", boxShadow: "0 8px 40px rgba(0,0,0,0.12)", alignItems: "center",
  };

  if (tokenState === "loading") {
    return (
      <Box sx={{ position: "relative", width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "background.default", overflow: "hidden" }}>
        {bgImg}
        <Box sx={{ zIndex: 1, textAlign: "center" }}>
          <CircularProgress color="primary" size={48} />
          <Typography sx={{ mt: 2, color: "text.secondary" }}>Validating your invitation link...</Typography>
        </Box>
      </Box>
    );
  }

  if (tokenState === "invalid") {
    return (
      <Box sx={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden", backgroundColor: "background.default" }}>
        {bgImg}
        <Container sx={{ width: { xs: "100%", sm: "420px", md: "460px" }, minHeight: "100vh", position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "32px" }}>
          <Box sx={cardSx}>
            <Box component="img" src="/icons/icon-96x96.png" alt="Logo" sx={{ width: "72px", height: "auto" }} />
            <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ErrorOutlineIcon sx={{ fontSize: 40, color: "#F44336" }} />
            </Box>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "text.primary", textAlign: "center" }}>Link Expired or Invalid</Typography>
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", textAlign: "center", lineHeight: 1.7 }}>
              This invitation link is no longer valid or has expired. Please ask your loan officer to send you a new link.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden", backgroundColor: "background.default" }}>
      <CustomSnackBar open={openSnackBar} onClose={closeDialog} severity={severity} errorMessage={message} />
      {bgImg}
      <Container sx={{ width: { xs: "100%", sm: "420px", md: "480px" }, minHeight: "100vh", position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 32px" }}>
        {isLoading && (
          <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.75)", backdropFilter: "blur(6px)" }}>
            <CircularProgress color="primary" size={48} />
            <Typography sx={{ mt: 2, color: "text.secondary", fontWeight: 500 }}>Signing you in...</Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <Box sx={cardSx}>
            <Box component="img" src="/icons/icon-96x96.png" alt="Logo" sx={{ width: "80px", height: "auto" }} />
            <Typography sx={{ color: theme.palette.primary.main, fontSize: "2rem", fontWeight: 800, textAlign: "center" }}>
              Loans <span style={{ color: "#F44336", fontWeight: 700 }}>N</span> Stuff
            </Typography>

            {portalData && (
              <Box sx={{ width: "100%", borderRadius: "12px", bgcolor: "#F0F4FF", border: "1px solid #D0DBFF", px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 0.6 }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: theme.palette.primary.main, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {"You've been invited by"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.95rem" }}>{portalData.loanOfficerName}</Typography>
                </Box>
              </Box>
            )}

            <Box sx={{ width: "100%", textAlign: "left" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "text.primary" }}>Welcome!</Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.4 }}>Sign in to fill out your employment history</Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
              <ControlledInput
                control={control}
                label="Email Address"
                size="medium"
                name="email"
                errorMessage={errors.email?.message}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <ControlledInput
                control={control}
                label="Password"
                type="password"
                size="medium"
                name="password"
                errorMessage={errors.password?.message}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <AuthButton icon={<SVGs name="Right_arrow_icon" fill="white" />} type="submit" text="Sign In" />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>{"Don't have an account?"}</Typography>
              <Link href={`/borrower/signup?token=${encodeURIComponent(token)}`}>
                <Typography sx={{ fontSize: "0.85rem", textDecoration: "underline", color: theme.palette.primary.main, fontWeight: 600, "&:hover": { opacity: 0.75 } }}>
                  Create Account
                </Typography>
              </Link>
            </Box>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

const BorrowerSignInPage = () => (
  <Suspense fallback={<div />}>
    <BorrowerSignInContent />
  </Suspense>
);

export default BorrowerSignInPage;
