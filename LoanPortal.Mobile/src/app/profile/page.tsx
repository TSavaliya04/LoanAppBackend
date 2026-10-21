"use client";
import React, { useEffect, useState } from "react";
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
  styled,
  FormGroup,
  FormControlLabel,
  Switch,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Link,
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
  Link as LinkIcon,
  ContentCopy,
  CheckCircleOutline,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { useSessionStore } from '@/stores/SessionStore';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { firebaseAuth } from "@/api/instances/firebase";
// import { signOut } from "@firebase/auth";
import { useSessionStore } from "@/stores/SessionStore";
import SVGs from "@/components/SVGs";
import { useGetProfile } from "@/api/reactQueriesHooks/useProfile";
import { useGetBorrowerLink } from "@/api/reactQueriesHooks/usePreApproval";
import BottomNavbar from "@/components/Common/BottomNavbar";

const LINK_TITLE = "Start Loan Application";
const LINK_INSTRUCTIONS =
  "Use the link to securely start your loan application. You will be asked to sign in, then complete the steps to share your employment and income details.";

const Profile = () => {
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "/default-avatar.png", // default or API-provided avatar
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const { setUser } = useSessionStore();
  const { data: fetchedData } = useGetProfile();
  useEffect(() => {
    console.log(fetchedData);
    if (fetchedData) {
      const profileData = fetchedData.data;
      setName(profileData.firstName);
      setEmail(profileData.email);
      setPhone(formatUSPhoneNumber(profileData.phone ?? "") ?? "");
      if (profileData.profile) {
        setAvatarUrl(profileData.profile);
      }
    }
  }, [fetchedData]);
  const [selectedTab, setSelectedTab] = useState(3);

  // --- Borrower Link Modal State ---
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const { data: borrowerLinkData, isLoading: isLoadingLink, isError: isLinkError } = useGetBorrowerLink(linkModalOpen);

  const portalUrl = (() => {
    const rawUrl = borrowerLinkData?.success ? (borrowerLinkData.data?.portalUrl as string) : null;
    if (!rawUrl) return null;
    try {
      const token = new URL(rawUrl).pathname.split("/").filter(Boolean).pop();
      if (token) return `${window.location.origin}/borrower/signup?token=${token}`;
    } catch {
      // fall through if URL parsing fails
    }
    return rawUrl;
  })();

  const handleOpenLinkModal = () => {
    setLinkModalOpen(true);
    setCopied(false);
  };

  const handleCloseLinkModal = () => {
    setLinkModalOpen(false);
  };

  const handleCopyLink = () => {
    if (portalUrl) {
      const text = `${LINK_TITLE}\n${portalUrl}\n\n${LINK_INSTRUCTIONS}`;
      const html = `<p><a href="${portalUrl}">${LINK_TITLE}</a></p><p>${LINK_INSTRUCTIONS}</p>`;
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        navigator.clipboard
          .write([
            new ClipboardItem({
              "text/html": new Blob([html], { type: "text/html" }),
              "text/plain": new Blob([text], { type: "text/plain" }),
            }),
          ])
          .catch(() => navigator.clipboard.writeText(text));
      } else {
        navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setSnackbarOpen(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut();
      await localStorage.clear();
      await sessionStorage.clear();
      await setUser(null);
      queryClient.clear();
      router.push("/auth/SignIn");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const Android12Switch = styled(Switch)(({ theme }) => ({
    padding: 8,
    "& .MuiSwitch-track": {
      borderRadius: 22 / 2,
      "&::before, &::after": {
        content: '""',
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: 16,
        height: 16,
      },
      "&::before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main),
        )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
        left: 12,
      },
      "&::after": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main),
        )}" d="M19,13H5V11H19V13Z" /></svg>')`,
        right: 12,
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "none",
      width: 16,
      height: 16,
      margin: 2,
    },
  }));

  function formatUSPhoneNumber(input: string) {
    const digits = input.replace(/\D/g, "");
    const last10 = digits.slice(-10);
    if (last10.length !== 10) {
      return "Invalid number"; // Not enough digits
    }
    return `(${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
  }

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
          <Box maxWidth={420} mx="auto" bgcolor="#fbeac8" minHeight="100vh">
            <Box
              sx={{
                borderRadius: 4,
                backgroundColor: "#fff",
                pt: "20px",
                px: "15px",
                pb: "15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <Avatar
                src={avatarUrl}
                alt="Profile"
                sx={{ width: 60, height: 60 }}
              />
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#1E1E1E",
                  marginBottom: "5px",
                }}
              >
                {name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "#888888",
                  lineHeight: "14px",
                  marginBottom: "5px",
                }}
              >
                {email}
              </Typography>
              <Typography
                sx={{ fontSize: "14px", color: "#888888", lineHeight: "14px" }}
              >
                {phone}
              </Typography>
            </Box>
            <Box
              sx={{
                borderRadius: 4,
                backgroundColor: "#fff",
                p: "15px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/edit-profile")}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Box
                    sx={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "100%",
                      backgroundColor: "rgba(136, 136, 136, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SVGs name={"Profile_Edit_icon"} fill="white" />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Edit Profile
                  </Typography>
                </Box>
                <SVGs name={"Profile_Right_arrow_icon"} fill="white" />
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: "2px",
                  my: "18px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(204, 204, 204, 0.5)",
                }}
              ></Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/change-password")}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Box
                    sx={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "100%",
                      backgroundColor: "rgba(136, 136, 136, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SVGs name={"Change_Pass_icon"} fill="white" />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Change Password
                  </Typography>
                </Box>
                <SVGs name={"Profile_Right_arrow_icon"} fill="white" />
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: "2px",
                  my: "18px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(204, 204, 204, 0.5)",
                }}
              ></Box>
              {/* Borrower Link */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
                onClick={handleOpenLinkModal}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Box
                    sx={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "100%",
                      backgroundColor: "rgba(116, 68, 245, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LinkIcon sx={{ color: "primary.main", fontSize: 18 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Borrower Link
                  </Typography>
                </Box>
                <SVGs name={"Profile_Right_arrow_icon"} fill="white" />
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: "2px",
                  my: "18px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(204, 204, 204, 0.5)",
                }}
              ></Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Box
                    sx={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "100%",
                      backgroundColor: "rgba(136, 136, 136, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SVGs name={"Notification_icon"} fill="white" />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Notifications
                  </Typography>
                </Box>
                <FormGroup>
                  <FormControlLabel
                    sx={{ marginRight: 0 }}
                    control={<Android12Switch defaultChecked />}
                    label=""
                  />
                </FormGroup>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: "2px",
                  my: "18px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(204, 204, 204, 0.5)",
                }}
              ></Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
                onClick={handleLogout}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Box
                    sx={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "100%",
                      backgroundColor: "rgba(136, 136, 136, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SVGs name={"Logout_icon"} fill="white" />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      lineHeight: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Logout
                  </Typography>
                </Box>
                <SVGs name={"Profile_Right_arrow_icon"} fill="white" />
              </Box>
            </Box>
          </Box>
        </Container>

        <BottomNavbar selectedTab={selectedTab} />

        {/* Borrower Link Modal */}
        <Dialog
          open={linkModalOpen}
          onClose={handleCloseLinkModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              p: 0.5,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pb: 1,
              pt: 2.5,
              px: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  bgcolor: "#EDE9FD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LinkIcon sx={{ color: "primary.main", fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary" }}>
                Borrower Link
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleCloseLinkModal} sx={{ color: "text.secondary" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ px: 3, pb: 1, pt: 1 }}>
            {isLoadingLink && (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {isLinkError && !isLoadingLink && (
              <Typography variant="body2" color="error" sx={{ textAlign: "center", py: 2 }}>
                Failed to fetch borrower link. Please try again.
              </Typography>
            )}

            {portalUrl && !isLoadingLink && (
              <Box
                sx={{
                  bgcolor: "#F5F7FF",
                  border: "1px solid #DDE3F5",
                  borderRadius: "12px",
                  p: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
                  <CheckCircleOutline sx={{ color: "#22A45D", fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#22A45D" }}>
                    Link Ready
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.75rem", mb: 0.5, fontWeight: 500 }}
                >
                  Message to share
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    bgcolor: "white",
                    border: "1px solid #DDE3F5",
                    borderRadius: "8px",
                    px: 1.5,
                    py: 1.25,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, mb: 0.5 }}>
                      <Link href={portalUrl} target="_blank" rel="noopener noreferrer" underline="always">
                        {LINK_TITLE}
                      </Link>
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                      {LINK_INSTRUCTIONS}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={handleCopyLink}
                    sx={{
                      flexShrink: 0,
                      color: copied ? "#22A45D" : "primary.main",
                      bgcolor: copied ? "#E6F9EE" : "#EDE9FD",
                      borderRadius: "6px",
                      p: 0.75,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: copied ? "#C8F0DA" : "#DDD5FB",
                      },
                    }}
                  >
                    {copied ? (
                      <CheckCircleOutline sx={{ fontSize: 18 }} />
                    ) : (
                      <ContentCopy sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleCloseLinkModal}
              sx={{
                borderRadius: "10px",
                px: 3,
                fontWeight: 500,
                borderColor: "divider",
                color: "text.secondary",
                "&:hover": { borderColor: "text.secondary" },
              }}
            >
              Close
            </Button>
            {portalUrl && (
              <Button
                variant="contained"
                onClick={handleCopyLink}
                startIcon={copied ? <CheckCircleOutline /> : <ContentCopy />}
                sx={{
                  borderRadius: "10px",
                  px: 3,
                  fontWeight: 600,
                  boxShadow: "none",
                  bgcolor: copied ? "#22A45D" : "primary.main",
                  "&:hover": { boxShadow: "none", bgcolor: copied ? "#1A8A4D" : undefined },
                }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Copy success snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2500}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            variant="filled"
            sx={{ borderRadius: "10px", fontWeight: 500 }}
          >
            Link copied to clipboard!
          </Alert>
        </Snackbar>
      </Box>
    </ProtectedRoute>
  );
};

export default Profile;
