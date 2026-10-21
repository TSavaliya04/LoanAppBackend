"use client";
import React from "react";
import { Box, Typography, FormControlLabel } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { BackRow, BoundCheckbox, FieldName, FInput, PRIMARY, PrimaryBtn, StepHeader } from "./primitives";

const disclosures: { label: string; name: FieldName }[] = [
  { label: "This is seasonal income", name: "additionalInfo.isSeasonalIncome" },
  { label: "This is foreign income", name: "additionalInfo.isForeignIncome" },
  {
    label: "I am employed by a family member, property seller, real estate agent, or other related party",
    name: "additionalInfo.isFamilyMemberEmployee",
  },
];

/* Step 7 – Additional Info (2/2) */
const Step7AdditionalInfo = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
    <BackRow onBack={onBack} />
    <StepHeader title="Additional Information" counter="2 of 2" />

    {disclosures.map(({ label, name }) => (
      <FormControlLabel
        key={label}
        control={
          <BoundCheckbox
            name={name}
            size="small"
            sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
          />
        }
        label={<Typography sx={{ fontSize: "0.82rem", color: "text.primary" }}>{label}</Typography>}
        sx={{ alignItems: "flex-start", "& .MuiCheckbox-root": { pt: 0.2 } }}
      />
    ))}

    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        bgcolor: "#F0F4FF",
        border: "1px solid #D0DBFF",
        borderRadius: "10px",
        px: 2,
        py: 1.5,
      }}
    >
      <InfoOutlinedIcon sx={{ fontSize: 16, color: PRIMARY, mt: "2px" }} />
      <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", lineHeight: 1.6 }}>
        Include any additional details your loan officer should know.
      </Typography>
    </Box>

    <FInput placeholder="Optional comments" multiline rows={3} name="additionalInfo.additionalComments" />

    <PrimaryBtn onClick={onNext}>Save & Continue</PrimaryBtn>
  </Box>
);

export default Step7AdditionalInfo;
