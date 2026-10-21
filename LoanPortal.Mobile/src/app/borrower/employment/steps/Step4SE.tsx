"use client";
import React from "react";
import { Box, Typography, FormControlLabel } from "@mui/material";
import { BackRow, BoundCheckbox, FDatePicker, FInput, PRIMARY, PrimaryBtn, Req } from "./primitives";

/* Step 4 SE – Self-Employment Details */
const Step4SE = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
    <BackRow onBack={onBack} />
    <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary" }}>
      Self-Employment Details
    </Typography>

    <FInput label={<>Business Name <Req /></>} placeholder="Doe Consulting LLC" name="selfEmployment.businessName" />
    <FInput label={<>Position / Title <Req /></>} placeholder="Owner" name="selfEmployment.positionTitle" />

    <FormControlLabel
      control={
        <BoundCheckbox
          name="selfEmployment.isCurrentlyWorking"
          size="small"
          sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
        />
      }
      label={
        <Typography sx={{ fontSize: "0.82rem", color: "text.primary" }}>
          I currently work here
        </Typography>
      }
    />

    <FormControlLabel
      control={
        <BoundCheckbox
          name="selfEmployment.isPrimaryIncome"
          size="small"
          sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
        />
      }
      label={
        <Typography sx={{ fontSize: "0.82rem", color: "text.primary" }}>
          This is my primary income
        </Typography>
      }
    />

    <FDatePicker label={<>Start Date <Req /></>} name="selfEmployment.startDate" />

    <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
  </Box>
);

export default Step4SE;
