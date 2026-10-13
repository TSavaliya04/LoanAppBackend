"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import { EmploymentCategory } from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues } from "../formModel";
import { BackRow, InfoBanner, PRIMARY, PrimaryBtn } from "./primitives";

/* Step 3 – Employment Type */
const Step3EmploymentType = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const { setValue } = useFormContext<EmploymentFormValues>();
  const selected = useWatch<EmploymentFormValues, "employmentCategory">({ name: "employmentCategory" });
  const onSelect = (t: EmploymentCategory) => setValue("employmentCategory", t, { shouldDirty: true });

  const types: { id: EmploymentCategory; icon: React.ReactNode; label: string }[] = [
    {
      id: EmploymentCategory.Employed,
      icon: <BusinessIcon sx={{ fontSize: 26, color: selected === EmploymentCategory.Employed ? PRIMARY : "text.secondary" }} />,
      label: "Employed by a Company",
    },
    {
      id: EmploymentCategory.SelfEmployed,
      icon: <PersonIcon sx={{ fontSize: 26, color: selected === EmploymentCategory.SelfEmployed ? PRIMARY : "text.secondary" }} />,
      label: "Self-Employed",
    },
    {
      id: EmploymentCategory.Military,
      icon: <MilitaryTechIcon sx={{ fontSize: 26, color: selected === EmploymentCategory.Military ? PRIMARY : "text.secondary" }} />,
      label: "Military",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <BackRow onBack={onBack} />
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", color: "text.primary" }}>
          Employment Type
        </Typography>
        <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", mt: 0.3 }}>
          How are you employed? <span style={{ color: "#FC3A27" }}>*</span>
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
        {types.map((t) => (
          <Box
            key={t.id}
            onClick={() => onSelect(t.id)}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.8,
              py: 2,
              px: 1,
              border: `2px solid ${selected === t.id ? PRIMARY : "#E5E8F5"}`,
              borderRadius: "12px",
              cursor: "pointer",
              bgcolor: selected === t.id ? "#EEF2FF" : "#fff",
              transition: "all .2s",
            }}
          >
            {t.icon}
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: selected === t.id ? PRIMARY : "text.secondary",
                textAlign: "center",
              }}
            >
              {t.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <InfoBanner>
        We&apos;ll need at least 2 years of employment history. You can add multiple employers if needed.
      </InfoBanner>

      <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
    </Box>
  );
};

export default Step3EmploymentType;
