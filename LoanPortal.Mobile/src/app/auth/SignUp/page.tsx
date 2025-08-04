"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MuiTelInput } from "mui-tel-input";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
// import ReCAPTCHA from "react-google-recaptcha";
// <ReCAPTCHA
//             sitekey="6LdCwQAqAAAAAOS1ivI7lEOoyuJQHxSGBsGxmwKb"
//             ref={captchaRef}
//           />

import SVGs from "@/components/SVGs";
// import Loader from "@/components/CassavaLoader";
import ControlledInput from "@/components/Forms/Fields/ControlledInput";
import { AddRegisterUserPayload } from "@/api/models/user";
// import theme from "@/styles/mui/theme";
// import AuthContainer from "../Components/AuthContainer";
import AuthButton from "@/components/Auth/AuthButton";
import { useSnackBarStore } from "@/store/SnackBarStore";
import { useRouter } from "next/navigation";
import CustomSnackBar from "@/components/CustomSnackBar";

interface ErrorResponse {
  data: null;
  error: string;
  message: string;
  statusCode: number;
  success: boolean;
}

const SignUpSchema = z
  .object({
    id: z.string(),

    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters long" })
      .max(50, { message: "First name must be at most 50 characters long" })
      .regex(/^[A-Za-z]+$/, {
        message: "First name must contain only letters",
      }),

    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters long" })
      .max(50, { message: "Last name must be at most 50 characters long" })
      .regex(/^[A-Za-z]+$/, { message: "Last name must contain only letters" }),

    email: z.string().email({ message: "Invalid email format" }),

    phone: z.string().regex(/^(1\d{10}|91\d{10})$/, {
      message:
        "Phone number must be a valid US (1XXXXXXXXXX) or IN (91XXXXXXXXXX) number",
    }),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/[A-Za-z]/, {
        message: "Password must include at least one letter",
      })
      .regex(/\d/, { message: "Password must include at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must include at least one special character",
      }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignUpSchemaType = z.infer<typeof SignUpSchema>;

const SignUpPage = () => {
  const { openSnackBar, closeDialog, severity, message } = useSnackBarStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => {
    document.title = "Sign up - Loans N Stuff";
  }, []);

  const onPhoneChange = (
    formattedValue: string,
    onChange: (value: string) => void
  ) => {
    const digitsOnly = formattedValue.replace(/\D/g, "");
    onChange(digitsOnly);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    // clearErrors,
    // getValues,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      id: uuidv4(),
      password: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setLoading] = useState(false);
  // const captchaRef = createRef<ReCAPTCHA>();
  const { openErrorDialog, openSuccessDialog } = useSnackBarStore();
  const router = useRouter();

  const handleCreateSuccess = () => {
    handleCancel();
    openSuccessDialog("You have been registered successfully.");
  };

  const handleError = (response: ErrorResponse): void => {
    // handleCancel();
    
    if (response.error && response.error.toLowerCase().includes("phone")) {
      setError("phone", {
        type: "manual",
        message: response.error,
      });
      return;
    } else if (response.error && response.error.toLowerCase().includes("email")) {
      setError("email", {
        type: "manual", 
        message: response.error,
      });
      return;
    } 
    // else if (response.error && response.error.toLowerCase().includes("username")) {
    //   setError("userName", {
    //     type: "manual",
    //     message: response.error,
    //   });
    //   return;
    // }
    const errorMessage = "Something went wrong, try again";
    openErrorDialog(errorMessage);
  };

  const handleCancel = () => {
    router.push("/auth/SignIn");
  };

  const onSubmit: SubmitHandler<SignUpSchemaType> = async (data) => {
    const payload = {
      // id1: data.id,
      firstname: data.firstName,
      lastname: data.lastName,
      // username: data.email,
      email: data.email,
      phone: data.phone.replace(/[+\s]/g, ""),
      password: data.password,
    };
    // const captchaValue = captchaRef.current?.getValue() || null;

    try {
      // await verifyCaptcha(captchaValue);
      setLoading(true);
      await registerUser(payload);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // const verifyCaptcha = async (captchaValue: string | null) => {
  //   if (!captchaValue) {
  //     throw new Error("Please verify the reCAPTCHA!");
  //   }
  //   const captchaPayload = {
  //     Token: captchaValue,
  //   };

  //   const gresponse = await fetch(
  //     `${process.env.NEXT_PUBLIC_API_BASE_URL}user/verify-recaptcha`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(captchaPayload),
  //     }
  //   );
  //   const gdata = await gresponse.json();

  //   if (!gdata.success) {
  //     throw new Error("reCAPTCHA validation failed!");
  //   }
  // };

  const registerUser = async (payload: AddRegisterUserPayload) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}user/SignUp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      
      const errorData: ErrorResponse = await response.json();
      handleError(errorData);
    }
    if (response.status == 200) {
      handleCreateSuccess();
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        // height: "100vh",
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
            xs: "100%",
            sm: "400px",
            md: "480px",
          },
          // height: "100vh",
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
                xs: "82.6%",
                sm: "400px",
                md: "89.6%",
              },
              height: "902.83px",
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
              zindex: 9999,
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
              sx={{ marginTop: -4, color: theme.palette.text.secondary }}
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
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                  gap: "16px",
                }}
              >
                <ControlledInput
                  control={control}
                  label="First Name *"
                  size="medium"
                  name={"firstName"}
                  errorMessage={errors.firstName?.message}
                  variant="outlined"
                />

                <ControlledInput
                  control={control}
                  label="Last Name *"
                  size="medium"
                  name={"lastName"}
                  errorMessage={errors.lastName?.message}
                  variant="outlined"
                />
              </Stack>

              <ControlledInput
                control={control}
                label="Email Address *"
                size="medium"
                name={"email"}
                errorMessage={errors.email?.message}
                variant="outlined"
              />

              <Controller
                name="phone"
                control={control}
                render={({
                  field: { ref: fieldRef, value, onChange, ...fieldProps },
                  fieldState,
                }) => (
                  <MuiTelInput
                    forceCallingCode
                    {...fieldProps}
                    label="Phone"
                    value={value ? `+${value}` : ""}
                    inputRef={fieldRef}
                    onlyCountries={["US", "IN"]}
                    defaultCountry="US"
                    onChange={(value) => onPhoneChange(value, onChange)}
                    helperText={fieldState.error ? fieldState.error.message : ""}
                    error={!!fieldState.error}
                    sx={{
                      fontSize: "16px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#555555",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#888888",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#555555",
                      },
                      "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.error.main,
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "16px",
                        color: "#555555",
                        "&.Mui-focused": {
                          fontWeight: "bold",
                          color: "#555555",
                        },
                        "&.Mui-error": {
                          color: theme.palette.error.main,
                        },
                      },
                    }}
                  />
                )}
              />

              <ControlledInput
                control={control}
                label="Password *"
                size="medium"
                name="password"
                type="password"
                errorMessage={errors.password?.message}
                variant="outlined"
              />

              <ControlledInput
                control={control}
                label="Confirm Password *"
                size="medium"
                name="confirmPassword"
                type="password"
                errorMessage={errors.confirmPassword?.message}
                variant="outlined"
              />
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></Box>
            </Box>

            <AuthButton
              icon={<SVGs name={"Right_arrow_icon"} fill="white" height={40} width={40} />}
              type="submit"
              text="Register"
            />

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Link href={"../auth/SignIn"}>
                <Typography
                  sx={{
                    textDecoration: "underline",
                    color: theme.palette.text.secondary,
                    fontWeight: "600",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  Already have an account?
                </Typography>
              </Link>
            </Box>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default SignUpPage;
