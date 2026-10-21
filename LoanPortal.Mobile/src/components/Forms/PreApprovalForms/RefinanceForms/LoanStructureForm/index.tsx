"use client";

import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Collapse,
  MenuItem,
  Paper,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useEffect, useRef } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import SVGs from "@/components/SVGs";
import { CombinedRefinancePreApprovalFormData } from "@/api/models/refinance/combinedPreApprovalSchema";

type RefinanceLoanStructureFormProps = {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  handleFieldChange: (index: number) => void;
};

export default function RefinanceLoanStructureForm({
  index,
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
  handleFieldChange,
}: RefinanceLoanStructureFormProps) {
  const {
    control,
    setValue,
    formState: { errors, dirtyFields },
  } = useFormContext<CombinedRefinancePreApprovalFormData>();

  const loanProgram =
    useWatch({
      control,
      name: `scenarios.${index}.loanStructure.loanProgram`,
    }) ?? "0";

  const lienPosition = useWatch({
    control,
    name: `scenarios.${index}.loanStructure.lienPosition`,
  });

  const isHelocOrHeLoan = loanProgram === "5" || loanProgram === "6";

  // Auto-select "Cash Out" and lock it when loanProgram is HELOC (5) or HE Loan (6)
  useEffect(() => {
    if (isHelocOrHeLoan) {
      setValue(`scenarios.${index}.refinanceInfo.refinanceType`, "2", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [isHelocOrHeLoan, index, setValue]);

  // Auto-set lienPosition based on loanProgram
  useEffect(() => {
    if (["1", "2", "3", "4"].includes(loanProgram)) {
      setValue(`scenarios.${index}.loanStructure.lienPosition`, "1", {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else if (["5", "6"].includes(loanProgram)) {
      setValue(`scenarios.${index}.loanStructure.lienPosition`, "2", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [loanProgram, index, setValue]);

  return (
    <Box
      sx={{
        borderRadius: 4,
        backgroundColor: expanded ? "#fff" : "transparent",
        padding: expanded ? "15px" : "0px",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {expanded ? (
          <Typography fontWeight={600} color="primary">
            Loan Structure
          </Typography>
        ) : (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              border: "1px solid",
              borderColor: "#888888",
              borderRadius: 2,
              padding: "8px 15px 8px 9px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: isCompleted
                    ? "#1F9A00"
                    : isDisabled
                      ? "gray"
                      : "#7444F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <CheckIcon sx={{ color: "#fff" }} /> */}
                {isCompleted ? (
                  <SVGs name="Check_Mark_icon" />
                ) : isDisabled ? (
                  <SVGs name="Purchase_info_icon" />
                ) : (
                  <SVGs name="Purchase_info_icon" />
                )}
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Loan Structure
              </Typography>
            </Box>
            {!isDisabled && (
              <IconButton
                size="small"
                sx={{ color: "black" }}
                onClick={onToggle}
              >
                <SVGs name="Edit_icon" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.loanStructure.loanProgram`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : String(e.target.value);
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    fullWidth
                    select
                    label="Refi Product *"
                    error={
                      !!errors.scenarios?.[index]?.loanStructure?.loanProgram
                    }
                    helperText={
                      errors.scenarios?.[index]?.loanStructure?.loanProgram
                        ?.message
                    }
                  >
                    <MenuItem value="1">Non QM</MenuItem>
                    <MenuItem value="2">Conventional</MenuItem>
                    <MenuItem value="3">FHA</MenuItem>
                    <MenuItem value="4">VA</MenuItem>
                    <MenuItem value="5">HELOC</MenuItem>
                    <MenuItem value="6">HE Loan (Closed-End Second)</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
                display: "none"
              }}
            >
              <Controller
                name={`scenarios.${index}.loanStructure.lienPosition`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleFieldChange(index);
                    }}
                    fullWidth
                    select
                    label="Lien Position *"
                    error={
                      !!errors.scenarios?.[index]?.loanStructure?.lienPosition
                    }
                    helperText={
                      errors.scenarios?.[index]?.loanStructure?.lienPosition
                        ?.message
                    }
                  >
                    <MenuItem value="1">First Lien</MenuItem>
                    <MenuItem value="2">Second Lien</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Lien Position Note */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: "14px 18px",
                  borderRadius: 3,
                  backgroundColor: "#F0EDFC",
                  border: "1px solid #E0D9FA",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: "#EDE9FC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <LockIcon sx={{ color: "#7444F5", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", mb: 0.25 }}
                  >
                    Lien Position
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "#7444F5", lineHeight: 1.2 }}
                  >
                    {lienPosition === "2" ? "Second Lien" : lienPosition === "1" ? "First Lien" : "—"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
                  >
                    Automatically set based on your loan product.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
