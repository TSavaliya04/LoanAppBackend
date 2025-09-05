"use client";
import React, { useEffect, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SVGs from "@/components/SVGs";
import ControlledInput from "@/components/Forms/Fields/ControlledInput";
import AuthButton from "@/components/Auth/AuthButton";
import { useSnackBarStore } from "@/store/SnackBarStore";
import CustomSnackBar from "@/components/CustomSnackBar";

const ResetSchema = z.object({
  email: z.string().email(),
});

type ResetSchemaType = z.infer<typeof ResetSchema>;

const ResetPasswordPage = () => {
  const { openSnackBar, closeDialog, severity, message } = useSnackBarStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => {
    document.title = "Reset Password - Loans N Stuff";
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<ResetSchemaType>({ resolver: zodResolver(ResetSchema) });

  const [isLoading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const onSubmit: SubmitHandler<ResetSchemaType> = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }user/ResetPassword?email=${encodeURIComponent(data.email)}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        setError("email", {
          message: "Something went wrong! Please try again later",
        });
      }

      if (response.status === 200) {
        setShowInfo(true);
        setValue("email", "");
      }
    } catch (error) {
      console.error("Error resetting user password:", error);
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

  const LinksSection = () => (
    <>
      <Box>
        <Link href="../auth/SignIn" passHref>
          <Typography sx={textStyle}>Sign in</Typography>
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
      {showInfo && (
        <Box
          sx={{
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            top: "4%",
            left: "50%",
            transform: "translateX(-50%)",
            flex: 1,
            maxWidth: "440px",
            width: "85%",
            backgroundColor: "rgba(112, 54, 173, .2)",
            border: "1px solid rgb(112, 54, 173)",
            zIndex: 11,
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src="/Indication_Svgs/flag.svg"
              sx={{
                width: "24px",
                height: "24px",
                marginRight: "24px",
              }}
            />

            <Typography>
              Password reset link sent to your email. Please check.
            </Typography>
          </Stack>

          <Box
            onClick={() => setShowInfo(false)}
            component="img"
            src="/Indication_Svgs/close.svg"
            sx={{
              width: "24px",
              height: "24px",
              marginLeft: "24px",
              cursor: "pointer",
            }}
          />
        </Box>
      )}

      <Container
        sx={{
          width: {
            xs: "100%",
            sm: "400px",
            md: "480px",
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
            </Box>

            <AuthButton
              icon={<SVGs name={"Reset_icon"} fill="white" />}
              type="submit"
              text="Reset"
            />

            <LinksSection />
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
