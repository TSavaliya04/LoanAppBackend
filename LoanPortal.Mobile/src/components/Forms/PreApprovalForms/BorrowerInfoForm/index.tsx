"use client";

import {
  Box,
  Grid,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Collapse,
} from "@mui/material";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import SVGs from "@/components/SVGs";
import { useEffect } from "react";

type BorrowerInfoFormProps = {
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
};

export default function BorrowerInfoForm({
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
}: BorrowerInfoFormProps) {
  const {
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

  const ficoScore = useWatch({ control, name: "borrowerInfo.ficoScore" }) ?? "";
  // const borrowerName =
  //   useWatch({ control, name: "borrowerInfo.borrowerName" }) ?? "";
  const loanProgram =
    useWatch({ control, name: "borrowerInfo.loanProgram" }) ?? "1";
  const MIPFundingFee =
    useWatch({ control, name: "purchaseInfo.mipFundingFee" }) ?? 0;

  useEffect(() => {
    let calculatedMIPFundingFee = 0;

    if (loanProgram === "3") {
      calculatedMIPFundingFee = 1.75;
    }

    if (calculatedMIPFundingFee !== MIPFundingFee) {
      setValue("purchaseInfo.mipFundingFee", calculatedMIPFundingFee);
    }
    // setValue("loanProgram.loanProgram", loanProgram);
  }, [loanProgram, setValue]);

  useEffect(() => {
    if (ficoScore) {
      const firstBorrowerficoScore = getValues(
        "borrowersIncomeData.borrowerIncome.0.ficoScore"
      );
      if (firstBorrowerficoScore && firstBorrowerficoScore == undefined) {
        console.log("Updating borrower name in income data");
        setValue("borrowersIncomeData.borrowerIncome.0.ficoScore", ficoScore);
      }
    }
  }, [ficoScore, setValue]);
  // useEffect(() => {
  //   const firstBorrowerName = getValues(
  //     "borrowersIncomeData.borrowerIncome.0.borrowerName"
  //   );
  //   console.log("firstBorrowerName =>", firstBorrowerName);
  //   console.log("Borrower Name =>", borrowerName);
  //   if (firstBorrowerName && firstBorrowerName == "") {
  //     console.log("Updating borrower name in income data");
  //     setValue(
  //       "borrowersIncomeData.borrowerIncome.0.borrowerName",
  //       borrowerName.trim()
  //     );
  //   }
  // }, [borrowerName, setValue]);

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return "";

    const [, area, prefix, line] = match;
    if (area && !prefix) return `(${area}`;
    if (area && prefix && !line) return `(${area}) ${prefix}`;
    if (area && prefix && line) return `(${area}) ${prefix}-${line}`;
    return cleaned;
  };

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
            Borrower info
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
                  <SVGs name="Borrower_info_icon" />
                ) : (
                  <SVGs name="Borrower_info_icon" />
                )}
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Borrower info
              </Typography>
            </Box>
            {isCompleted && (
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

      {/* Collapsible Form Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.borrowerName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Borrower's Name *"
                    error={!!errors.borrowerInfo?.borrowerName}
                    helperText={errors.borrowerInfo?.borrowerName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.coBorrowerName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Co-Borrower's Name"
                    error={!!errors.borrowerInfo?.coBorrowerName}
                    helperText={errors.borrowerInfo?.coBorrowerName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.ficoScore"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    value={field.value ?? ""}
                    fullWidth
                    label="FICO Score"
                    type="number"
                    inputMode="numeric"
                    error={!!errors.borrowerInfo?.ficoScore}
                    helperText={errors.borrowerInfo?.ficoScore?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.coBorrowerFicoScore"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    value={field.value ?? ""}
                    fullWidth
                    type="number"
                    inputMode="numeric"
                    label="CoBorrower's FICO Score"
                    error={!!errors.borrowerInfo?.coBorrowerFicoScore}
                    helperText={
                      errors.borrowerInfo?.coBorrowerFicoScore?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.borrowerCellNumber"
                control={control}
                render={({ field }) => {
                  const rawValue = field.value || ""; // value in state: only digits
                  const formattedValue = formatPhoneNumber(rawValue); // display only

                  return (
                    <TextField
                      {...field}
                      fullWidth
                      label="Borrower Cell Number"
                      value={formattedValue}
                      onChange={(e) => {
                        const digitsOnly = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        field.onChange(digitsOnly); // store only digits
                      }}
                      type="tel"
                      inputMode="numeric"
                      error={!!errors.borrowerInfo?.borrowerCellNumber}
                      helperText={
                        errors.borrowerInfo?.borrowerCellNumber?.message
                      }
                      inputProps={{ maxLength: 14 }} // formatted version length
                    />
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.coBorrowerCellNumber"
                control={control}
                render={({ field }) => {
                  const rawValue = field.value || ""; // value in state: only digits
                  const formattedValue = formatPhoneNumber(rawValue); // display only

                  return (
                    <TextField
                      {...field}
                      fullWidth
                      label="CoBorrower Cell Number"
                      value={formattedValue}
                      onChange={(e) => {
                        const digitsOnly = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        field.onChange(digitsOnly); // store only digits
                      }}
                      type="tel"
                      inputMode="numeric"
                      error={!!errors.borrowerInfo?.coBorrowerCellNumber}
                      helperText={
                        errors.borrowerInfo?.coBorrowerCellNumber?.message
                      }
                      inputProps={{ maxLength: 14 }} // formatted version length
                    />
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.borrowerEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Borrower's Email"
                    error={!!errors.borrowerInfo?.borrowerEmail}
                    helperText={errors.borrowerInfo?.borrowerEmail?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.loanProgram"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Loan Program *"
                    error={!!errors.borrowerInfo?.loanProgram}
                    helperText={errors.borrowerInfo?.loanProgram?.message}
                  >
                    <MenuItem value="1">Non QM</MenuItem>
                    <MenuItem value="2">Conventional</MenuItem>
                    <MenuItem value="3">FHA</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.propertyType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Property Type *"
                    error={!!errors.borrowerInfo?.propertyType}
                    helperText={errors.borrowerInfo?.propertyType?.message}
                  >
                    <MenuItem value="1">SFR</MenuItem>
                    <MenuItem value="2">2 Units</MenuItem>
                    <MenuItem value="3">3 Units</MenuItem>
                    <MenuItem value="4">4 Units</MenuItem>
                    <MenuItem value="5">Condo/Townhome</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="borrowerInfo.occupancyStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Occupancy Status *"
                    error={!!errors.borrowerInfo?.occupancyStatus}
                    helperText={errors.borrowerInfo?.occupancyStatus?.message}
                  >
                    <MenuItem value="1">Owner Occupied</MenuItem>
                    <MenuItem value="2">2nd Home</MenuItem>
                    <MenuItem value="3">Investment</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
