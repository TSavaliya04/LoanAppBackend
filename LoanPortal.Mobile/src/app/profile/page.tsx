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
} from "@mui/icons-material";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { useSessionStore } from '@/stores/SessionStore';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { firebaseAuth } from "@/api/instances/firebase";
// import { signOut } from "@firebase/auth";
import { useSessionStore } from "@/stores/SessionStore";

const Profile = () => {
  // const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser } = useSessionStore();
  const [selectedTab, setSelectedTab] = useState(4);

  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut();
      await localStorage.clear();
      await sessionStorage.clear();
      await setUser(null);
      router.push("/auth/SignIn");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
        {/* Header */}
        <AppBar
          position="static"
          sx={{
            position: "fixed",
            top: 0,
            bgcolor: "white",
            boxShadow: "none",
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
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton sx={{ color: "text.secondary" }}>
                <Search />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Info />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Menu />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Container>

        {/* Bottom Navigation */}
        <BottomNavigation
          value={selectedTab}
          onChange={(event, newValue) => setSelectedTab(newValue)}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: 2,
            height: "76px",
            bgcolor: "background.paper",
            borderTop: "1px solid #e5e7eb",
            "& .MuiBottomNavigationAction-root": {
              color: "text.secondary",
              "&.Mui-selected": {
                color: "error.main",
              },
            },
          }}
        >
          <BottomNavigationAction
            icon={<Home />}
            onClick={() => router.push("/dashboard")}
          />
          <BottomNavigationAction icon={<Description />} />
          <BottomNavigationAction icon={<CalendarToday />} />
          <BottomNavigationAction icon={<QuestionAnswer />} />
          <BottomNavigationAction
            icon={<Person />}
            onClick={() => router.push("/profile")}
          />
        </BottomNavigation>
      </Box>
    </ProtectedRoute>
  );
};

export default Profile;
