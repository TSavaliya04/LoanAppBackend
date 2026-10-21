"use client";
import React from "react";
import { Box, Typography, FormControlLabel, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { BackRow, BoundCheckbox, BoundTextField, FInput, PRIMARY, PrimaryBtn, Req, StepHeader } from "./primitives";

/* Step 5 – Employer Contact & Address (2/2) */
const Step5EmployerContact = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
    <BackRow onBack={onBack} />
    <StepHeader title="Employer Contact" counter="2 of 2" />

    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
      <Box sx={{ flex: 1 }}>
        <FInput label={<>Work Phone <Req /></>} placeholder="(562) 555-1234" name="currentEmployer.workPhone" phone />
      </Box>
      <BoundTextField
        name="currentEmployer.phoneExtension"
        size="small"
        placeholder="Ext."
        sx={{
          width: 70,
          "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.85rem" },
        }}
      />
    </Box>

    <Box sx={{ width: "100%" }}>
      <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }}>
        Employer Address <Req />
      </Typography>
      <BoundTextField
        name="currentEmployer.addressLine1"
        fullWidth
        size="small"
        placeholder="1234 Industrial Ave"
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.9rem" }, mb: 1 }}
      />
      <BoundTextField
        name="currentEmployer.addressLine2"
        fullWidth
        size="small"
        placeholder="Long Beach, CA 90813"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.9rem" } }}
      />
    </Box>

    <FormControlLabel
      control={
        <BoundCheckbox
          name="currentEmployer.isPrimaryIncome"
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

    <PrimaryBtn onClick={onNext}>Save & Continue</PrimaryBtn>
  </Box>
);

export default Step5EmployerContact;
