"use client";
import { Suspense } from "react";
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MuiTelInput } from "mui-tel-input";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SVGs from "@/components/SVGs";
import ControlledInput from "@/components/Forms/Fields/ControlledInput";
import AuthButton from "@/components/Auth/AuthButton";
import CustomSnackBar from "@/components/CustomSnackBar";
import { useSnackBarStore } from "@/store/SnackBarStore";
import {
  validateBorrowerPortalToken,
  borrowerSignUp,
  BorrowerPortalTokenData,
  BorrowerSignUpPayload,
} from "@/api/network/user";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const BorrowerSignUpSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" })
      .max(50, { message: "First name must be at most 50 characters" })
      .regex(/^[A-Za-z]+$/, { message: "First name must contain only letters" }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" })
      .max(50, { message: "Last name must be at most 50 characters" })
      .regex(/^[A-Za-z]+$/, { message: "Last name must contain only letters" }),
    email: z.string().email({ message: "Invalid email format" }),
    phone: z.string().regex(/^(1\d{10}|91\d{10})$/, {
      message: "Phone number must be a valid US (1XXXXXXXXXX) or IN (91XXXXXXXXXX) number",
    }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .regex(/[A-Za-z]/, { message: "Password must include at least one letter" })
      .regex(/\d/, { message: "Password must include at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must include at least one special character" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type BorrowerSignUpSchemaType = z.infer<typeof BorrowerSignUpSchema>;
type TokenState = "loading" | "valid" | "invalid";

const BorrowerSignUpContent = () => {
  const { openSnackBar, closeDialog, severity, message } = useSnackBarStore();
  const { openErrorDialog, openSuccessDialog } = useSnackBarStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenState, setTokenState] = useState<TokenState>("loading");
  const [portalData, setPortalData] = useState<BorrowerPortalTokenData | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = "Create Account - Loans N Stuff";
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

  const { control, handleSubmit, formState: { errors }, setError } = useForm<BorrowerSignUpSchemaType>({
    resolver: zodResolver(BorrowerSignUpSchema),
  });

  const onPhoneChange = (formattedValue: string, onChange: (value: string) => void) => {
    const digits = formattedValue.replace(/\D/g, "");
    // Country code (1 for US, 91 for IN) + at most 10 national digits
    const codeLength = digits.startsWith("91") ? 2 : 1;
    onChange(digits.slice(0, codeLength + 10));
  };

  const onSubmit: SubmitHandler<BorrowerSignUpSchemaType> = async (data) => {
    setLoading(true);
    const payload: BorrowerSignUpPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone.replace(/[+\s]/g, ""),
    };
    try {
      const res = await borrowerSignUp(payload);
      if (res.status === 200 || res.status === 201) {
        setIsSuccess(true);
        openSuccessDialog("Account created! Redirecting to sign in...");
        setTimeout(() => { router.push(`/borrower/signin?token=${encodeURIComponent(token)}`); }, 2000);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      const errData = axiosErr?.response?.data;
      const errMsg = errData?.error ?? errData?.message ?? "";
      if (errMsg.toLowerCase().includes("email")) {
        setError("email", { type: "manual", message: errMsg });
      } else if (errMsg.toLowerCase().includes("phone")) {
        setError("phone", { type: "manual", message: errMsg });
      } else {
        openErrorDialog(errMsg || "Registration failed. Please try again.");
      }
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
    gap: "20px", display: "flex", flexDirection: "column" as const,
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

  if (isSuccess) {
    return (
      <Box sx={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden", backgroundColor: "background.default" }}>
        {bgImg}
        <Container sx={{ width: { xs: "100%", sm: "420px", md: "460px" }, minHeight: "100vh", position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "32px" }}>
          <Box sx={{ ...cardSx, gap: "24px" }}>
            <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 44, color: "#1F9A00" }} />
            </Box>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "text.primary", textAlign: "center" }}>Account Created!</Typography>
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", textAlign: "center" }}>Redirecting you to sign in...</Typography>
            <CircularProgress size={28} color="primary" />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden", backgroundColor: "background.default" }}>
      <CustomSnackBar open={openSnackBar} onClose={closeDialog} severity={severity} errorMessage={message} />
      {bgImg}
      <Container sx={{ width: { xs: "100%", sm: "460px", md: "500px" }, position: "relative", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 32px", minHeight: "100vh" }}>
        {isLoading && (
          <Box sx={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.75)", backdropFilter: "blur(6px)" }}>
            <CircularProgress color="primary" size={48} />
            <Typography sx={{ mt: 2, color: "text.secondary", fontWeight: 500 }}>Creating your account...</Typography>
          </Box>
        )}
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <Box sx={cardSx}>
            <Box component="img" src="/icons/icon-96x96.png" alt="Logo" sx={{ width: "80px", height: "auto" }} />
            <Typography sx={{ color: theme.palette.primary.main, fontSize: "1.8rem", fontWeight: 800, textAlign: "center", mt: -1 }}>
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
                {portalData.loanOfficerPhone && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{portalData.loanOfficerPhone}</Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ width: "100%", textAlign: "left" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "text.primary" }}>Create your account</Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.4 }}>Fill in the details below to get started.</Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
              <Stack sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "14px" }}>
                <ControlledInput control={control} label="First Name *" size="medium" name="firstName" errorMessage={errors.firstName?.message} variant="outlined" />
                <ControlledInput control={control} label="Last Name *" size="medium" name="lastName" errorMessage={errors.lastName?.message} variant="outlined" />
              </Stack>
              <ControlledInput control={control} label="Email Address *" size="medium" name="email" errorMessage={errors.email?.message} variant="outlined" />
              <Controller
                name="phone"
                control={control}
                render={({ field: { ref: fieldRef, value, onChange, ...fieldProps }, fieldState }) => (
                  <MuiTelInput
                    forceCallingCode
                    {...fieldProps}
                    label="Phone *"
                    value={value ? `+${value}` : ""}
                    inputRef={fieldRef}
                    onlyCountries={["US", "IN"]}
                    defaultCountry="US"
                    onChange={(val) => onPhoneChange(val, onChange)}
                    helperText={fieldState.error ? fieldState.error.message : ""}
                    error={!!fieldState.error}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555555" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#888888" },
                      "& .MuiInputLabel-root": { fontSize: "16px", color: "#555555", "&.Mui-focused": { fontWeight: "bold", color: "#555555" }, "&.Mui-error": { color: theme.palette.error.main } },
                    }}
                  />
                )}
              />
              <ControlledInput control={control} label="Password *" size="medium" name="password" type="password" errorMessage={errors.password?.message} variant="outlined" />
              <ControlledInput control={control} label="Confirm Password *" size="medium" name="confirmPassword" type="password" errorMessage={errors.confirmPassword?.message} variant="outlined" />
            </Box>

            <AuthButton icon={<SVGs name="Right_arrow_icon" fill="white" height={40} width={40} />} type="submit" text="Register" />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Already have an account?</Typography>
              <Link href={`/borrower/signin?token=${encodeURIComponent(token)}`}>
                <Typography sx={{ fontSize: "0.85rem", textDecoration: "underline", color: theme.palette.primary.main, fontWeight: 600, "&:hover": { opacity: 0.75 } }}>Sign In</Typography>
              </Link>
            </Box>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

const BorrowerSignUpPage = () => (
  <Suspense fallback={<div />}>
    <BorrowerSignUpContent />
  </Suspense>
);

export default BorrowerSignUpPage;
