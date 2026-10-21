"use client";
import React from "react";
import {
  Box,
  Typography,
  InputAdornment,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { EmploymentFormValues } from "../formModel";
import { BackRow, FDatePicker, FInput, PrimaryBtn, PRIMARY, Req } from "./primitives";

const LOAN_TYPES = [
  { value: 0, label: "Purchase" },
  { value: 1, label: "Refinance" },
];

const LoanTypeField = () => {
  const { control } = useFormContext<EmploymentFormValues>();
  return (
    <Box>
      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary", mb: 0.3 }}>
        Loan type <Req />
      </Typography>
      <Controller
        name="personalInfo.loanType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            row
            name={field.name}
            value={field.value ?? 0}
            onChange={(e) => field.onChange(Number(e.target.value))}
          >
            {LOAN_TYPES.map(({ value, label }) => (
              <FormControlLabel
                key={value}
                value={value}
                label={label}
                control={<Radio size="small" sx={{ "&.Mui-checked": { color: PRIMARY } }} />}
                slotProps={{ typography: { fontSize: "0.88rem" } }}
              />
            ))}
          </RadioGroup>
        )}
      />
    </Box>
  );
};

/* Step 2 – Verify Identity */
const Step2VerifyIdentity = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
    <BackRow onBack={onBack} />
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: "text.primary" }}>
        Verify Your Identity
      </Typography>
      <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", mt: 0.3 }}>
        This helps keep your information secure.
      </Typography>
    </Box>

    <FInput label={<>First Name <Req /></>} placeholder="John" name="personalInfo.firstName" />
    <FInput label={<>Last Name <Req /></>} placeholder="Doe" name="personalInfo.lastName" />
    <FDatePicker label={<>Date of Birth <Req /></>} name="personalInfo.dateOfBirth" disableFuture openTo="year" />
    <FInput
      label={<>Social Security Number <Req /></>}
      placeholder="123-45-6789"
      name="personalInfo.last4SSN"
      ssn
      endAdornment={
        <InputAdornment position="end">
          <IconButton size="small">
            <VisibilityOffIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </InputAdornment>
      }
    />

    <LoanTypeField />

    <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>

    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8, mt: 0.5 }}>
      <LockOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
        Your information is encrypted.
      </Typography>
    </Box>
  </Box>
);

export default Step2VerifyIdentity;
