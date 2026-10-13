import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Stack,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Image from "next/image";
import React, { useState } from "react";
import { firebaseAuth } from "@/api/instances/firebase";
import { useSessionStore } from "@/stores/SessionStore";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { setUser } = useSessionStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    // router.push("/profile");
  };

  const handleLogout = async () => {
    handleClose();
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
  return (
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
          >
            Admin Dashboard
          </Typography>
        </Box>
        {/* Right */}
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton>
            <NotificationsNoneOutlinedIcon />
          </IconButton>

          <IconButton onClick={handleAvatarClick}>
            <Avatar />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonOutlineOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
