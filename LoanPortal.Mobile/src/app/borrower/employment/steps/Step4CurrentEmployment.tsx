"use client";
import React from "react";
import { Box, Typography, FormControlLabel } from "@mui/material";
import { employmentTypeOptions } from "@/api/models/BorrowerPortalDraftTypes";
import { BackRow, BoundCheckbox, FDatePicker, FInput, FSelect, PRIMARY, PrimaryBtn, Req, StepHeader } from "./primitives";

/* Step 4 – Current Employment (1/2) */
const Step4CurrentEmployment = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
    <BackRow onBack={onBack} />
    <StepHeader title="Current Employment" counter="1 of 2" />

    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}>
      Employer Information
    </Typography>

    <FInput label={<>Employer Name <Req /></>} placeholder="ABC Construction Inc." name="currentEmployer.employerName" />
    <FInput label={<>Job Title <Req /></>} placeholder="Project Manager" name="currentEmployer.jobTitle" />

    <FSelect
      label={<>Employment Type <Req /></>}
      options={employmentTypeOptions}
      name="currentEmployer.employmentType"
    />

    <FormControlLabel
      control={
        <BoundCheckbox
          name="currentEmployer.isCurrentlyWorking"
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

    <FDatePicker label={<>Start Date <Req /></>} name="currentEmployer.startDate" />

    <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
  </Box>
);

export default Step4CurrentEmployment;
