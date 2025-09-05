"use client";
import React, { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from "@firebase/auth";
import SVGs from "@/components/SVGs";
// import Loader from "@/components/CassavaLoader";
import ControlledInput from "@/components/Forms/Fields/ControlledInput";
// import { User } from "@/api/models/user";
import { getOfficeUser } from "@/api/network/user";
import { useSessionStore } from "@/stores/SessionStore";
// import { useUserOrganisationStore } from "@/store/useUserOrganisationStore";
// import theme from "@/styles/mui/theme";
// import AuthContainer from "../Components/AuthContainer";
import AuthButton from "@/components/Auth/AuthButton";
import { useSnackBarStore } from "@/store/SnackBarStore";
import CustomSnackBar from "@/components/CustomSnackBar";
import { firebaseAuth as auth } from "@/api/instances/firebase";

type OfficeUserResponse = {
  status: string;
  // add more fields if needed, like user info, token, etc.
};

const SignInSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(1, {
      message: "Password must be at least 1 character long",
    })
    .max(20, {
      message: "Password cannot exceed 20 characters",
    }),
});

type SignInSchemaType = z.infer<typeof SignInSchema>;

const SignInPage = () => {
  const { openSnackBar, closeDialog, severity, message } = useSnackBarStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => {
    document.title = "Sign in - Loans N Stuff";
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    // setError,
  } = useForm<SignInSchemaType>({ resolver: zodResolver(SignInSchema) });

  const router = useRouter();
  const { setUser } = useSessionStore();
  // const { setUserOrganizations } = useUserOrganisationStore();
  // const { setVerificationId } = useSessionStore();
  const { openErrorDialog } = useSnackBarStore();
  const [isLoading, setLoading] = useState(false);

  const [attempts, setAttempts] = useState(0); // Track login attempts
  const [isRateLimited, setRateLimited] = useState(false); // Rate limit state
  const cooldownDuration = 6000; // 30 seconds

  // const auth = getAuth();

  // 🔹 Ensure Firebase session persistence
  useEffect(() => {
    console.log("Setting Firebase session persistence...");
    let unsubscribe: () => void;

    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log("Session persistence set. Listening for auth changes...");
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log("Auth state changed:", firebaseUser);

          if (firebaseUser) {
            const token = await firebaseUser.getIdToken();

            // console.log("User is authenticated. Token:", token);

            const customUser = {
              token,
              displayName: firebaseUser.displayName ?? "",
              firstName: "", // You might fetch or derive this elsewhere
              lastName: "", // You might fetch or derive this elsewhere
              userId: firebaseUser.uid,
              phone: firebaseUser.phoneNumber ?? "",
              email: firebaseUser.email ?? "",
              profilePicture: firebaseUser.photoURL ?? "",
            };
            // console.log("111", customUser);
            
            setUser(customUser);
          } else {
            // console.log("222");
            setUser(null);
          }

          setLoading(false);
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error setting Firebase persistence:", error);
      });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setUser]);

  const onSubmit: SubmitHandler<SignInSchemaType> = async (data) => {
    if (isRateLimited) {
      openErrorDialog("Too many failed attempts, please try after some time!");
      return;
    } // Prevent form submission if rate limited

    setLoading(true);

    try {
      // const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      const token = await user?.getIdToken();
      // console.log("token =>", token);

      if (user && token) {
        const axiosResponse = await getOfficeUser(await token);
        const response: OfficeUserResponse = {
          status: String(axiosResponse.status),
        };
        if (response.status === "499") {
          router.push("/downtime");
        } else {
          // console.log("Log new =>", axiosResponse?.data?.data);
          // console.log("user id =>",user.uid);
          
          const customUser = {
            token,
            displayName: user.displayName ?? "",
            firstName: axiosResponse?.data?.data?.firstName, // You might fetch or derive this elsewhere
            lastName: axiosResponse?.data?.data?.lastName, // You might fetch or derive this elsewhere
            userId: user.uid,
            phone: user.phoneNumber ?? "",
            email: user.email ?? "",
          };
          // console.log("111111",customUser);
          setUser(customUser);
          if (axiosResponse) {
            router.push("/dashboard");
          }
          // }
        }
      }
    } catch (error: unknown) {
      console.log(typeof error, error);

      const errorMessage = (error as Error).message;
      console.log("errorMessage =>", errorMessage);

      switch (errorMessage) {
        case "Firebase: Error (auth/invalid-credential).":
          openErrorDialog("Login failed: incorrect credentials.");
          break;
        case "Firebase: Error (auth/wrong-password).":
          openErrorDialog("Login failed: incorrect credentials.");
          break;
        case "Firebase: Error (auth/user-not-found).":
          openErrorDialog("Login failed: incorrect credentials.");
          break;
        default:
          // var error = error.response?.data as any;
          // const errorMessage = error ? error["errorMessage"] : "Login failed: incorrect credentials.";
          openErrorDialog("Login failed: incorrect credentials.");
          break;
      }

      // Increment login attempts after each failed attempt
      setAttempts((prev) => prev + 1);

      if (attempts >= 4) {
        setRateLimited(true);
        setTimeout(() => {
          setRateLimited(false);
          setAttempts(0);
        }, cooldownDuration);
      }
    } finally {
      setLoading(false);
    }
  };

  const textStyle = {
    textDecoration: "underline",
    color: theme.palette.text.secondary,
    fontWeight: "600",
    "&:hover": {
      color: theme.palette.primary.main,
    },
  };

  const Separator = () => (
    <Box
      sx={{
        width: "4px",
        height: "4px",
        borderRadius: "2px",
        backgroundColor: theme.palette.text.secondary,
        mx: "16px",
      }}
    />
  );

  const LinksSection = () => (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" }, // column on mobile, row on tablets/desktops
          gap: 1.5, // optional: adds spacing between items
        }}
      >
        <Link href="../auth/SignUp" passHref>
          <Typography sx={textStyle}>Create Account</Typography>
        </Link>

        <Separator />

        <Link href="../auth/ResetPassword" passHref>
          <Typography sx={textStyle}>Forgot your password?</Typography>
        </Link>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <CustomSnackBar
        open={openSnackBar}
        onClose={closeDialog}
        severity={severity}
        errorMessage={message}
      ></CustomSnackBar>
      <Box
        component="img"
        src={
          isMobile
            ? "/Background_Svgs/authBackground-mobile.svg"
            : "/Background_Svgs/authBackground.svg"
        }
        sx={{
          position: "absolute",
          zIndex: 1,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          left: ".1%",
        }}
      />

      <Container
        sx={{
          width: {
            xs: "100%", // for mobile (xs)
            sm: "400px", // for tablets (sm)
            md: "480px", // for desktops (md and up)
          },
          height: "100vh",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "32px",
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              width: {
                xs: "82.6%", // for mobile (xs)
                sm: "400px", // for tablets (sm)
                md: "89.6%", // for desktops (md and up)
              },
              height: "527.83px",
              borderRadius: "24px",
              padding: "32px",
              gap: "32px",
              display: "flex",
              flexDirection: "column",
              boxShadow: 1,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              webkitBackdropFilter: "blur(10px)",
            }}
          >
            {/* <Loader /> */}
            <Box
              component="img"
              src="/icons/icon-96x96.png"
              alt="Logo"
              sx={{
                width: "96px",
                height: "auto",
                marginBottom: "32px",
              }}
            />

            <Typography
              sx={{
                marginTop: -4,
                color: theme.palette.text.secondary,
              }}
            >
              Stand by...
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              borderRadius: "24px",
              padding: "32px",
              gap: "32px",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "background.paper",
              boxShadow: 1,
              alignItems: "center",
              ...(isLoading && {
                backdropFilter: "blur(10px)",
                webkitBackdropFilter: "blur(10px)",
              }),
            }}
          >
            <Box
              component="img"
              src="/icons/icon-96x96.png"
              alt="Logo"
              sx={{
                width: "96px",
                height: "auto",
              }}
            />

            <Typography
              sx={{
                color: theme.palette.primary.main,
                fontSize: "2rem",
                fontWeight: 800,
                textAlign: "center",
              }}
            >
              Loans <span style={{ color: "#F44336", fontWeight: 700 }}>N</span>{" "}
              Stuff
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
              }}
            >
              <ControlledInput
                control={control}
                label="Email Address"
                size="medium"
                name={"email"}
                errorMessage={errors.email?.message}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              <ControlledInput
                control={control}
                label="Password"
                type="password"
                size="medium"
                name={"password"}
                errorMessage={errors.password?.message}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <AuthButton
              icon={<SVGs name={"Right_arrow_icon"} fill="white" />}
              type="submit"
              text="Login"
            />

            <LinksSection />
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default SignInPage;
