"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import {
  Search,
  Info,
  Menu,
  Home,
  Description,
  CalendarToday,
  QuestionAnswer,
  Person,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomSnackBar from "@/components/CustomSnackBar";
import { useSnackBarStore } from "@/store/SnackBarStore";
import { z } from "zod";
import {
  AuthError,
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
} from "@firebase/auth";
import BottomNavbar from "@/components/Common/BottomNavbar";

type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/[A-Za-z]/, {
        message: "Password must include at least one letter",
      })
      .regex(/\d/, { message: "Password must include at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must include at least one special character",
      }),

    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const ChangePassword = () => {
  const { openSnackBar, closeDialog, severity, message } = useSnackBarStore();
  const { openSuccessDialog, openErrorDialog } = useSnackBarStore();
  const [isloading, setIsloading] = useState(false);
  const methods = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange", // 👈 validate on every change
    reValidateMode: "onChange", // 👈 revalidate on change instead of blur
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const {
    control,
    // setValue,
    formState: { errors },
  } = methods;

  // const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(3);

  const handleCreateSuccess = () => {
    openSuccessDialog("Password updated successfully.");
    router.push("/profile");
  };

  const handleCreateFail = (message: string) => {
    openErrorDialog(message);
  };

  async function changePassword(currentPassword: string, newPassword: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user?.email) throw new Error("User not logged in");

    // Reauthenticate using the current password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  }

  const handleSubmitForm = async () => {
    const { currentPassword, newPassword } = methods.getValues();
    const isValid = await methods.trigger();
    if (!isValid) return;

    setIsloading(true);

    try {
      await changePassword(currentPassword, newPassword);
      handleCreateSuccess(); // e.g. show success toast or close modal
    } catch (error: unknown) {
      const err = error as AuthError;
      if (err.code === "auth/invalid-credential") {
        handleCreateFail("Wrong Current Password.");
      } else {
        handleCreateFail("Something went wrong. Please try again letter.");
      }
      console.error(err);
      // You can use your toast/snackbar here
      // e.g. toast.error(error.message || "Failed to change password");
    } finally {
      setIsloading(false);
    }
  };

  return (
    <ProtectedRoute allow={["user"]}>
      <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
        {/* Header */}
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "white",
            boxShadow: "none",
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  width={32}
                  height={32}
                  src={"/icons/icon-192x192.png"}
                  alt="Logo"
                />
              </Box>
              <Typography
                sx={{
                  color: "text.primary",
                  fontSize: "1.6rem",
                  fontWeight: 400,
                }}
                component="div" // <-- Change from <p> to <div>
              >
                <Typography
                  sx={{
                    display: "inline-block",
                    color: "primary.main",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                  }}
                  component="span" // <-- Inline element
                >
                  Loans
                </Typography>{" "}
                N Stuff
              </Typography>
            </Box>
            {/* <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton sx={{ color: "text.secondary" }}>
                <Search />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Info />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Menu />
              </IconButton>
            </Box> */}
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
          <CustomSnackBar
            open={openSnackBar}
            onClose={closeDialog}
            severity={severity}
            errorMessage={message}
          ></CustomSnackBar>
          <FormProvider {...methods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitForm();
              }}
            >
              <Box maxWidth={420} mx="auto" bgcolor="#fbeac8" minHeight="100vh">
                <Box
                  sx={{
                    borderRadius: 4,
                    backgroundColor: "#fff",
                    p: "20px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <Controller
                      name="currentPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Current Password *"
                          error={!!errors.currentPassword}
                          helperText={errors.currentPassword?.message}
                        />
                      )}
                    />
                    <Controller
                      name="newPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="New Password *"
                          error={!!errors.newPassword}
                          helperText={errors.newPassword?.message}
                        />
                      )}
                    />
                    <Controller
                      name="confirmNewPassword"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Confirm Password *"
                          error={!!errors.confirmNewPassword}
                          helperText={errors.confirmNewPassword?.message}
                        />
                      )}
                    />

                    <Button
                      disabled={isloading}
                      fullWidth
                      type="submit"
                      variant="contained"
                      sx={{ bgcolor: "#ff453b", borderRadius: 99, py: 1.25 }}
                    >
                      {isloading ? (
                        <CircularProgress size={24} sx={{ color: "#ff453b" }} />
                      ) : (
                        <Typography
                          fontWeight={400}
                          color={isloading ? "rgba(0, 0, 0, 0.26)" : "white"}
                        >
                          SAVE
                        </Typography>
                      )}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </form>
          </FormProvider>
          {/* <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button> */}
        </Container>

        <BottomNavbar selectedTab={selectedTab} />
      </Box>
    </ProtectedRoute>
  );
};

export default ChangePassword;
