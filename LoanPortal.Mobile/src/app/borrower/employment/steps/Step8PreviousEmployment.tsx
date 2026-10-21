"use client";
import React, { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import { EmploymentCategory, employmentTypeOptions } from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues, defaultPreviousEmployer } from "../formModel";
import { BackRow, BoundTextField, FDatePicker, FInput, FSelect, PRIMARY, PrimaryBtn, Req } from "./primitives";

const CURRENT_JOB_LABEL: Record<number, string> = {
  [EmploymentCategory.Employed]: "employment",
  [EmploymentCategory.SelfEmployed]: "self-employment",
  [EmploymentCategory.Military]: "military service",
};

const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.9rem" } };

/** One previous employer, edited inline. */
const PreviousEmployerFields = ({
  index,
  onRemove,
  showHeading,
}: {
  index: number;
  onRemove?: () => void;
  showHeading: boolean;
}) => {
  const prefix = `previousEmployers.${index}` as const;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      {showHeading && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}>
            Previous Employer {index + 1}
          </Typography>
          {onRemove && (
            <Button size="small" onClick={onRemove} sx={{ textTransform: "none", fontWeight: 600, color: "#FC3A27" }}>
              Remove
            </Button>
          )}
        </Box>
      )}

      <FInput label={<>Employer Name <Req /></>} placeholder="ABC Construction Inc." name={`${prefix}.employerName`} />
      <FInput label={<>Job Title <Req /></>} placeholder="Project Manager" name={`${prefix}.jobTitle`} />
      <FSelect
        label={<>Employment Type <Req /></>}
        options={employmentTypeOptions}
        name={`${prefix}.employmentType`}
      />
      <FDatePicker label={<>Start Date <Req /></>} name={`${prefix}.startDate`} />
      <FDatePicker label={<>End Date <Req /></>} name={`${prefix}.endDate`} />

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <Box sx={{ flex: 1 }}>
          <FInput label="Work Phone" placeholder="(562) 555-1234" name={`${prefix}.workPhone`} phone />
        </Box>
        <BoundTextField
          name={`${prefix}.phoneExtension`}
          size="small"
          placeholder="Ext."
          sx={{ width: 70, ...fieldSx }}
        />
      </Box>

      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }}>Employer Address</Typography>
        <BoundTextField
          name={`${prefix}.addressLine1`}
          fullWidth
          size="small"
          placeholder="1234 Industrial Ave"
          sx={{ ...fieldSx, mb: 1 }}
        />
        <BoundTextField
          name={`${prefix}.addressLine2`}
          fullWidth
          size="small"
          placeholder="Long Beach, CA 90813"
          sx={fieldSx}
        />
      </Box>
    </Box>
  );
};

/* Step 8 – Previous Employment (only shown when the current job is under 2 years) */
const Step8PreviousEmployment = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const { control, getValues } = useFormContext<EmploymentFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "previousEmployers" });
  const category = useWatch({ control, name: "employmentCategory" });

  // Start with one blank employer so the form is visible straight away
  useEffect(() => {
    if (getValues("previousEmployers").length === 0) append({ ...defaultPreviousEmployer });
  }, [append, getValues]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <BackRow onBack={onBack} />
      <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "text.primary" }}>
        Previous Employment
      </Typography>

      <Box
        sx={{
          bgcolor: "#EEF2FF",
          border: "1px solid #C7D2FE",
          borderRadius: "10px",
          p: "12px 14px",
          display: "flex",
          gap: 1,
        }}
      >
        <WorkHistoryOutlinedIcon sx={{ fontSize: 20, color: PRIMARY, flexShrink: 0, mt: "1px" }} />
        <Box>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: PRIMARY }}>
            We need at least 2 years of employment history.
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.3, lineHeight: 1.5 }}>
            Your current {CURRENT_JOB_LABEL[category] ?? "employment"} is less than 2 years. Please add your previous employer.
          </Typography>
        </Box>
      </Box>

      {fields.map((field, i) => (
        <PreviousEmployerFields
          key={field.id}
          index={i}
          showHeading={fields.length > 1}
          onRemove={fields.length > 1 ? () => remove(i) : undefined}
        />
      ))}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => append({ ...defaultPreviousEmployer })}
        sx={{
          borderRadius: "10px",
          py: 1.3,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.9rem",
          borderColor: PRIMARY,
          color: PRIMARY,
          "&:hover": { bgcolor: "#EEF2FF" },
        }}
      >
        Add Another Previous Employer
      </Button>

      <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
    </Box>
  );
};

export default Step8PreviousEmployment;
