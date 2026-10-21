"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { useWatch } from "react-hook-form";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { EmploymentCategory } from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues } from "../formModel";
import { PRIMARY } from "./primitives";

/* Step 10 – Success */
const Step10Success = () => {
  const category = useWatch<EmploymentFormValues, "employmentCategory">({ name: "employmentCategory" });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5, width: "100%" }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "#DCFCE7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 44, color: "#16A34A" }} />
      </Box>

      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.6rem", color: "text.primary" }}>
          All set!
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mt: 0.5, lineHeight: 1.6 }}>
          Your {category === EmploymentCategory.SelfEmployed ? "self-employment" : category === EmploymentCategory.Military ? "military service" : "employment"} information has been submitted to your loan officer.
        </Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          bgcolor: "#F8F9FF",
          border: "1px solid #E5E8F5",
          borderRadius: "12px",
          px: 2.5,
          py: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "text.primary", mb: 1.5 }}>
          What happens next?
        </Typography>
        {[
          "Your loan officer will review your information.",
          "They may reach out if they need any additional details.",
          "You can return to this link anytime to make updates (if needed).",
        ].map((text, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                bgcolor: PRIMARY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#fff" }}>{i + 1}</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", lineHeight: 1.6 }}>
              {text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Step10Success;
