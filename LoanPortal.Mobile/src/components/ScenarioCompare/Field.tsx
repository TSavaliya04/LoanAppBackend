import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export function Field({ label, input }: { label: string; input: ReactNode }) {
  return (
    <Box sx={{ display: "grid", gap: "8px" }}>
      <Typography component="label" sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#74689c" }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minHeight: "44px",
          padding: "0 14px",
          borderRadius: "9px",
          border: "1px solid rgba(122, 63, 242, 0.1)",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          "& input, & select": {
            width: "100%",
            minHeight: "42px",
            padding: 0,
            border: 0,
            backgroundColor: "transparent",
            color: "#20144d",
            appearance: "none",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "1rem"
          }
        }}
      >
        {input}
      </Box>
    </Box>
  );
}

export function ReadOnlyField({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <Box sx={{ display: "grid", gap: "8px" }}>
      <Typography component="label" sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#74689c" }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minHeight: "44px",
          padding: "0 14px",
          borderRadius: "9px",
          border: "1px solid rgba(122, 63, 242, 0.1)",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          justifyContent: "space-between",
          fontWeight: 700
        }}
      >
        <Typography component="span" sx={{ fontWeight: "inherit" }}>{value}</Typography>
        {meta ? <Typography component="span" sx={{ color: "#74689c", fontSize: "0.82rem", ml: 1 }}>{meta}</Typography> : null}
      </Box>
    </Box>
  );
}
