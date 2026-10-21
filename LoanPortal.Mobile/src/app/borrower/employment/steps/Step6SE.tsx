"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import {
  DocumentationType,
  businessEntityTypeOptions,
  ownershipShareOptions,
} from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues } from "../formModel";
import { BackRow, FSelect, MoneyField, PRIMARY, PrimaryBtn, Req, StepHeader } from "./primitives";

const docTypes: { id: DocumentationType; icon: React.ReactNode; label: string }[] = [
  {
    id: DocumentationType.TaxReturns,
    icon: (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.3 }}>
        <Box sx={{ width: 20, height: 24, border: "2px solid currentColor", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontSize: "0.55rem", fontWeight: 800 }}>TAX</Typography>
        </Box>
      </Box>
    ),
    label: "Tax Returns",
  },
  {
    id: DocumentationType.BankStatements,
    icon: (
      <Box sx={{ width: 22, height: 18, border: "2px solid currentColor", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: "0.55rem", fontWeight: 800 }}>$$</Typography>
      </Box>
    ),
    label: "Bank Statements",
  },
  {
    id: DocumentationType.NotSure,
    icon: (
      <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, lineHeight: 1 }}>?</Typography>
    ),
    label: "Not Sure",
  },
];

/* Step 6 SE – Self-Employment Income Details */
const Step6SE = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const { setValue } = useFormContext<EmploymentFormValues>();
  const selectedDoc = useWatch<EmploymentFormValues, "selfEmployment.documentationType">({
    name: "selfEmployment.documentationType",
  });
  const setSelectedDoc = (id: DocumentationType) =>
    setValue("selfEmployment.documentationType", id, { shouldDirty: true });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <BackRow onBack={onBack} />
      <StepHeader title="Income Details" />

      {/* Ownership Share */}
      <FSelect
        label={<>Ownership Share <Req /></>}
        options={ownershipShareOptions}
        name="selfEmployment.ownershipShare"
      />

      {/* Business Form */}
      <FSelect
        label={<>Business Form <Req /></>}
        options={businessEntityTypeOptions}
        name="selfEmployment.businessEntityType"
      />

      {/* Monthly Income or Loss */}
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }}>
          Income or Loss (Monthly) <Req />
        </Typography>
        <MoneyField
          fullWidth
          name="selfEmployment.monthlyIncomeOrLoss"
          allowNegative
          placeholder="12,000"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.9rem" } }}
        />
      </Box>

      {/* Documentation Type */}
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.8 }}>
          Documentation Type <Req />
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {docTypes.map((d) => (
            <Box
              key={d.id}
              onClick={() => setSelectedDoc(d.id)}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.8,
                py: 1.8,
                px: 0.5,
                border: `2px solid ${selectedDoc === d.id ? PRIMARY : "#E5E8F5"}`,
                borderRadius: "12px",
                cursor: "pointer",
                bgcolor: selectedDoc === d.id ? "#EEF2FF" : "#fff",
                color: selectedDoc === d.id ? PRIMARY : "#9CA3AF",
                transition: "all .2s",
              }}
            >
              {d.icon}
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: selectedDoc === d.id ? PRIMARY : "text.secondary",
                  textAlign: "center",
                }}
              >
                {d.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
    </Box>
  );
};

export default Step6SE;
