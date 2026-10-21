"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { useWatch } from "react-hook-form";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import { EmploymentCategory } from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues } from "../formModel";
import { PRIMARY, PrimaryBtn, GhostBtn } from "./primitives";

/* Step 1 – Welcome */
const Step1Welcome = ({ onNext }: { onNext: () => void }) => {
  const category = useWatch<EmploymentFormValues, "employmentCategory">({ name: "employmentCategory" });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5, width: "100%" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.6rem", color: "text.primary" }}>
          Let&apos;s get started
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mt: 0.5, lineHeight: 1.6 }}>
          {category === EmploymentCategory.SelfEmployed
            ? "We'll ask for your self-employment and income details to help your loan officer complete your loan application."
            : category === EmploymentCategory.Military
              ? "We'll ask for your military service and income details to help your loan officer complete your loan application."
              : "Please provide your employment information to help your loan officer complete your loan application."}
        </Typography>
      </Box>

      <Box
        sx={{
          width: 110,
          height: 110,
          borderRadius: "50%",
          bgcolor: "#EEF2FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <WorkHistoryOutlinedIcon sx={{ fontSize: 52, color: PRIMARY }} />
      </Box>

      {[
        { icon: <LockOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />, text: "Secure and encrypted" },
        { icon: <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />, text: "Takes about 5–10 minutes" },
        { icon: <SaveOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />, text: "You can save and return anytime" },
      ].map((item) => (
        <Box
          key={item.text}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            bgcolor: "#F8F9FF",
            border: "1px solid #E5E8F5",
            borderRadius: "10px",
            px: 2,
            py: 1.2,
          }}
        >
          {item.icon}
          <Typography sx={{ fontSize: "0.82rem", color: "text.primary" }}>{item.text}</Typography>
        </Box>
      ))}

      <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
      <GhostBtn>Need help? Contact your loan officer</GhostBtn>
    </Box>
  );
};

export default Step1Welcome;
