import { Box, Switch, Typography } from "@mui/material";

type PresenterToggleProps = {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function PresenterToggle({ isActive, onToggle, disabled = false }: PresenterToggleProps) {
  return (
    <Box
      onClick={disabled ? undefined : onToggle}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        minHeight: "42px",
        padding: "8px 12px",
        borderRadius: "14px",
        backgroundColor: disabled ? "#f0f0f0" : (isActive ? "rgba(122, 63, 242, 0.08)" : "rgba(255, 255, 255, 0.82)"),
        color: disabled ? "#a0a0a0" : "#5620d2",
        border: "1px solid",
        borderColor: isActive ? "rgba(122, 63, 242, 0.2)" : "rgba(122, 63, 242, 0.12)",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.18s ease",
        "&:hover": {
          transform: disabled ? "none" : "translateY(-1px)",
        },
      }}
      role="switch"
      aria-checked={isActive}
    >
      <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Presenter Mode</Typography>
      <Switch
        checked={isActive}
        onChange={onToggle}
        disabled={disabled}
        disableRipple
        sx={{
          width: 40,
          height: 24,
          padding: 0,
          "& .MuiSwitch-switchBase": {
            padding: 0,
            margin: "3px",
            transitionDuration: "300ms",
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#fff",
              "& + .MuiSwitch-track": {
                background: "linear-gradient(135deg, #7a3ff2, #945dff)",
                opacity: 1,
                border: 0,
              },
            },
          },
          "& .MuiSwitch-thumb": {
            boxSizing: "border-box",
            width: 18,
            height: 18,
            boxShadow: "0 2px 6px rgba(40, 24, 92, 0.18)",
          },
          "& .MuiSwitch-track": {
            borderRadius: 12,
            backgroundColor: "rgba(122, 63, 242, 0.14)",
            opacity: 1,
            transition: "background 0.18s ease",
          },
        }}
      />
      <Typography sx={{ minWidth: "24px", fontSize: "0.82rem", fontWeight: 700, color: "#74689c" }}>
        {isActive ? "On" : "Off"}
      </Typography>
    </Box>
  );
}
