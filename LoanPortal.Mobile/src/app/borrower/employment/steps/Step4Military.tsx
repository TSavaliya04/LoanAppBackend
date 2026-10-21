"use client";
import React from "react";
import { Box, Typography, FormControlLabel } from "@mui/material";
import { useWatch } from "react-hook-form";
import { branchOfServiceOptions, militaryStatusOptions } from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues } from "../formModel";
import { BackRow, BoundCheckbox, FDatePicker, FInput, FSelect, InfoBanner, PRIMARY, PrimaryBtn, Req } from "./primitives";

/* Step 4 MIL – Military Service Details */
const Step4Military = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const currentlyServing = useWatch<EmploymentFormValues, "militaryService.isCurrentlyServing">({
    name: "militaryService.isCurrentlyServing",
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <BackRow onBack={onBack} />
      <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary" }}>
        Military Service
      </Typography>

      <FSelect
        label={<>Branch of Service <Req /></>}
        options={branchOfServiceOptions}
        name="militaryService.branchOfService"
      />

      <FSelect
        label={<>Status <Req /></>}
        options={militaryStatusOptions}
        name="militaryService.status"
      />

      <FInput
        label={<>Rank / Pay Grade <Req /></>}
        placeholder="E-5 (Petty Officer Second Class)"
        name="militaryService.rankPayGrade"
      />

      <FInput
        label={
          <>
            Military Occupational Specialty (MOS){" "}
            <span style={{ color: "#6B7280" }}>(optional)</span>
          </>
        }
        placeholder="IT Specialist"
        name="militaryService.militaryOccupationalSpecialty"
      />

      <FDatePicker label={<>Start Date <Req /></>} name="militaryService.startDate" />

      <FormControlLabel
        control={
          <BoundCheckbox
            name="militaryService.isCurrentlyServing"
            size="small"
            sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
          />
        }
        label={
          <Typography sx={{ fontSize: "0.82rem", color: "text.primary" }}>
            I am currently serving
          </Typography>
        }
      />

      {!currentlyServing && (
        <FDatePicker label={<>Separation Date <Req /></>} name="militaryService.separationDate" />
      )}

      {currentlyServing && (
        <InfoBanner>
          If you are no longer serving, please provide your separation date.
        </InfoBanner>
      )}

      <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
    </Box>
  );
};

export default Step4Military;
