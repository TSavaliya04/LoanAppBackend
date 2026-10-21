"use client";
import { useEffect, useState } from "react";
import { Home, Person, Add, NotificationsNone } from "@mui/icons-material";
import SourceIcon from "@mui/icons-material/Source";
import { Box, Fab, Typography } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import { useRouter, usePathname } from "next/navigation";

type props = {
  selectedTab?: number;
};

// Each page mounts its own navbar, so remember the last highlighted slot at module level.
// The glass indicator starts from it and slides to the new slot after mount.
let lastSlot = 0;

// Tab index -> slot in the 5-column layout (slot 2 is the FAB spacer)
const tabToSlot = (tab: number) => (tab >= 2 ? tab + 1 : tab);

const lensStretch = keyframes`
  0% { transform: scale(1.18, 0.92); }
  60% { transform: scale(0.97, 1.04); }
  100% { transform: scale(1, 1); }
`;

const NavItem = ({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      flex: 1,
      position: "relative",
      zIndex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "3px",
      cursor: "pointer",
      height: "100%",
      WebkitTapHighlightColor: "transparent",
      transition: "transform 0.2s ease",
      "&:active": { transform: "scale(0.9)" },
    }}
  >
    <Box
      sx={{
        color: isActive ? "primary.main" : "text.secondary",
        display: "flex",
        transform: isActive ? "translateY(-1px) scale(1.12)" : "none",
        transition:
          "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.25s ease",
      }}
    >
      {icon}
    </Box>
    <Typography
      sx={{
        fontSize: "10px",
        fontWeight: isActive ? 700 : 400,
        color: isActive ? "primary.main" : "text.secondary",
        lineHeight: 1,
        transition: "color 0.25s ease",
      }}
    >
      {label}
    </Typography>
  </Box>
);

const BottomNavbar = ({ selectedTab }: props) => {
  const router = useRouter();
  const pathname = usePathname();

  // Derive active tab from pathname
  const getActiveTab = () => {
    if (selectedTab !== undefined) return selectedTab;
    if (pathname === "/dashboard") return 0;
    if (pathname?.startsWith("/top-opportunities") || pathname?.startsWith("/tbds")) return 1;
    if (pathname?.startsWith("/activity")) return 3;
    if (pathname?.startsWith("/profile")) return 4;
    return 0;
  };

  const activeTab = getActiveTab();
  const activeSlot = tabToSlot(activeTab);

  // Start where the previous page left the indicator, then slide to the current slot
  const [indicatorSlot, setIndicatorSlot] = useState(lastSlot);
  useEffect(() => {
    setIndicatorSlot(activeSlot);
    lastSlot = activeSlot;
  }, [activeSlot]);

  return (
    // Outer wrapper: provides the space so content doesn't hide behind navbar
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "calc(76px + 12px + env(safe-area-inset-bottom, 0px))",
        zIndex: 1300,
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* Floating glass pill */}
      <Box
        sx={(theme) => ({
          position: "absolute",
          bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: 440,
          height: 64,
          boxSizing: "border-box",
          padding: "6px",
          borderRadius: "999px",
          display: "flex",
          alignItems: "stretch",
          pointerEvents: "auto",
          overflow: "hidden",
          // Glassmorphism
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.72)}, ${alpha(theme.palette.background.paper, 0.45)})`,
          backdropFilter: "blur(22px) saturate(180%)",
          WebkitBackdropFilter: "blur(22px) saturate(180%)",
          border: `1px solid ${alpha("#ffffff", 0.65)}`,
          boxShadow:
            "0 8px 32px rgba(31, 38, 135, 0.16), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(255,255,255,0.25)",
          animation: "navbarIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          "@keyframes navbarIn": {
            from: { opacity: 0, transform: "translateX(-50%) translateY(24px)" },
            to: { opacity: 1, transform: "translateX(-50%) translateY(0)" },
          },
        })}
      >
        {/* Sliding glass lens behind the active item */}
        <Box
          sx={{
            position: "absolute",
            top: 6,
            bottom: 6,
            left: 6,
            width: "calc((100% - 12px) / 5)",
            transform: `translateX(${indicatorSlot * 100}%)`,
            transition: "transform 0.55s cubic-bezier(0.34, 1.4, 0.64, 1)",
            pointerEvents: "none",
          }}
        >
          <Box
            key={activeSlot}
            sx={(theme) => ({
              width: "100%",
              height: "100%",
              borderRadius: "999px",
              background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.08)})`,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: `1px solid ${alpha("#ffffff", 0.7)}`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.2)}, inset 0 1px 0 rgba(255,255,255,0.7)`,
              animation: `${lensStretch} 0.55s ease-out`,
            })}
          />
        </Box>

        {/* Home */}
        <NavItem
          icon={<Home sx={{ fontSize: "26px" }} />}
          label="Home"
          isActive={activeTab === 0}
          onClick={() => router.push("/dashboard")}
        />

        {/* Pipeline */}
        <NavItem
          icon={<SourceIcon sx={{ fontSize: "26px" }} />}
          label="Pipeline"
          isActive={activeTab === 1}
          onClick={() => router.push("/top-opportunities")}
        />

        {/* Center spacer — invisible placeholder for the FAB */}
        <Box sx={{ flex: 1 }} />

        {/* Activity */}
        <NavItem
          icon={<NotificationsNone sx={{ fontSize: "26px" }} />}
          label="Activity"
          isActive={activeTab === 2}
          onClick={() => router.push("/activity")}
        />

        {/* Profile */}
        <NavItem
          icon={<Person sx={{ fontSize: "26px" }} />}
          label="Profile"
          isActive={activeTab === 3}
          onClick={() => router.push("/profile")}
        />
      </Box>

      {/* Create Quote FAB — centered, protruding slightly above the glass pill */}
      <Box
        sx={{
          position: "absolute",
          bottom: "calc(11px + 12px + env(safe-area-inset-bottom, 0px))",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          pointerEvents: "auto",
          cursor: "pointer",
        }}
        onClick={() => router.push("/pre-approval")}
      >
        <Fab
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            width: 60,
            height: 60,
            border: `3px solid ${alpha("#ffffff", 0.75)}`,
            boxShadow: "0 6px 20px rgba(116,68,245,0.5)",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&:active": {
              transform: "scale(0.92)",
            },
            transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <Add sx={{ fontSize: "32px" }} />
        </Fab>
        <Typography
          sx={{
            fontSize: "10px",
            color: "text.secondary",
            fontWeight: 400,
            lineHeight: 1,
          }}
        >
          Create Quote
        </Typography>
      </Box>
    </Box>
  );
};

export default BottomNavbar;
