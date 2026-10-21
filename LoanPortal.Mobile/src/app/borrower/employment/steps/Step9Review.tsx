"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { useWatch } from "react-hook-form";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { EmploymentFormValues, ReviewSectionId, buildReviewSections } from "../formModel";
import { BackRow, PRIMARY, PrimaryBtn } from "./primitives";

const ICONS: Record<ReviewSectionId, React.ReactNode> = {
  personal: <PersonIcon sx={{ fontSize: 20, color: PRIMARY }} />,
  current: <BusinessIcon sx={{ fontSize: 20, color: PRIMARY }} />,
  previous: <WorkHistoryOutlinedIcon sx={{ fontSize: 20, color: PRIMARY }} />,
  income: <LocationOnOutlinedIcon sx={{ fontSize: 20, color: PRIMARY }} />,
  additional: <InfoOutlinedIcon sx={{ fontSize: 20, color: PRIMARY }} />,
  self: <BusinessIcon sx={{ fontSize: 20, color: PRIMARY }} />,
  business: <LocationOnOutlinedIcon sx={{ fontSize: 20, color: PRIMARY }} />,
  military: <MilitaryTechIcon sx={{ fontSize: 20, color: PRIMARY }} />,
  militaryIncome: <LocationOnOutlinedIcon sx={{ fontSize: 20, color: PRIMARY }} />,
};

// Step each review section is edited on (steps 4–6 branch by employment category)
const SECTION_STEP: Record<ReviewSectionId, number> = {
  personal: 2,
  current: 4,
  self: 4,
  military: 4,
  business: 5,
  militaryIncome: 5,
  income: 6,
  additional: 7,
  previous: 8,
};

/* Step 9 – Review & Submit */
const Step9Review = ({
  onSubmit,
  onBack,
  onEdit,
  isSubmitting,
  error,
}: {
  onSubmit: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  isSubmitting: boolean;
  error?: string | null;
}) => {
  const values = useWatch<EmploymentFormValues>() as EmploymentFormValues;
  const sections = buildReviewSections(values);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <BackRow onBack={onBack} />
      <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "text.primary" }}>
        Review Your Information
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: "100%" }}>
        {sections.map((s) => (
          <Box
            key={s.id}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              bgcolor: "#fff",
              border: "1px solid #E5E8F5",
              borderRadius: "10px",
              px: 2,
              py: 1.5,
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  bgcolor: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {ICONS[s.id]}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "text.primary" }}>
                  {s.title}
                </Typography>
                {s.detail.split("\n").map((line, i) => (
                  <Typography key={i} sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                    {line}
                  </Typography>
                ))}
              </Box>
            </Box>
            <Typography
              role="button"
              tabIndex={0}
              onClick={() => onEdit(SECTION_STEP[s.id])}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onEdit(SECTION_STEP[s.id]);
              }}
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: PRIMARY,
                cursor: "pointer",
                flexShrink: 0,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Edit
            </Typography>
          </Box>
        ))}
      </Box>

      <PrimaryBtn onClick={onSubmit} disabled={isSubmitting}>Submit</PrimaryBtn>
      {error && (
        <Typography role="alert" sx={{ fontSize: "0.78rem", color: "#FC3A27", textAlign: "center" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default Step9Review;
