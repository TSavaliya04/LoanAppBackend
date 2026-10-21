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
import SVGs from "@/components/SVGs";
import React, { useEffect } from "react";
import { usePreApprovalStore } from "@/store/usePreApprovalStore";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { CombinedRefinancePreApprovalFormData } from "@/api/models/refinance/combinedPreApprovalSchema";

type BorrowerInfoFormProps = {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  handleFieldChange: (index: number) => void;
};

export default function RefinanceBorrowerInfoForm({
  index,
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
  handleFieldChange,
}: BorrowerInfoFormProps) {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CombinedRefinancePreApprovalFormData>();

  const [dateOfBirth, setDateOfBirth] = React.useState<Dayjs | null>(dayjs(getValues(`scenarios.${index}.borrowerInfo.dateOfBirth`)));
  // const borrowerNameStore = usePreApprovalStore((state) => state.borrowerName);
  // const ficoScoreStore = usePreApprovalStore((state) => state.ficoScore);

  // const ficoScore = useWatch({ control, name: `scenarios.${index}.borrowerInfo.ficoScore` }) ?? "";
  // const borrowerName =
  //   useWatch({ control, name: `scenarios.${index}.borrowerInfo.borrowerName` }) ?? "";

  // useEffect(() => {
  //   if (ficoScoreStore == null) {
  //     setValue(
  //       `scenarios.${index}.borrowersIncomeData.borrowerIncome.0.ficoScore`,
  //       ficoScore === "" ? undefined : ficoScore
  //     );
  //   }
  // }, [ficoScore, setValue]);
  // useEffect(() => {
  //   if (borrowerNameStore == "") {
  //     setValue(
  //       `scenarios.${index}.borrowersIncomeData.borrowerIncome.0.borrowerName`,
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
            {isCompleted ? (
              <IconButton
                size="small"
                sx={{ color: "black" }}
                onClick={onToggle}
              >
                <SVGs name="Edit_icon" />
              </IconButton>
            ) : !isDisabled ? (
              <IconButton
                size="small"
                sx={{ color: "black" }}
                onClick={onToggle}
              >
                <SVGs name="Edit_icon" />
              </IconButton>
            ) : null}
          </Box>
        )}
      </Box>

      {/* Collapsible Form Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.borrowerName`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : e.target.value;
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    fullWidth
                    label="Borrower's Name *"
                    error={!!errors.scenarios?.[index]?.borrowerInfo?.borrowerName}
                    helperText={errors.scenarios?.[index]?.borrowerInfo?.borrowerName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.coBorrowerName`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Co-Borrower's Name"
                    error={!!errors.scenarios?.[index]?.borrowerInfo?.coBorrowerName}
                    helperText={errors.scenarios?.[index]?.borrowerInfo?.coBorrowerName?.message}
                  />
                )}
              />
            </Grid>

            {/* <Grid size={{ xs: 12 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.ficoScore`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : Number(e.target.value);
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    value={field.value ?? ""}
                    fullWidth
                    label="FICO Score"
                    type="number"
                    inputMode="numeric"
                    error={!!errors.scenarios?.[index]?.borrowerInfo?.ficoScore}
                    helperText={errors.scenarios?.[index]?.borrowerInfo?.ficoScore?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.coBorrowerFicoScore`}
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
                    error={!!errors.scenarios?.[index]?.borrowerInfo?.coBorrowerFicoScore}
                    helperText={
                      errors.scenarios?.[index]?.borrowerInfo?.coBorrowerFicoScore?.message
                    }
                  />
                )}
              />
            </Grid> */}

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.borrowerCellNumber`}
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
                      error={!!errors.scenarios?.[index]?.borrowerInfo?.borrowerCellNumber}
                      helperText={
                        errors.scenarios?.[index]?.borrowerInfo?.borrowerCellNumber?.message
                      }
                      inputProps={{ maxLength: 14 }} // formatted version length
                    />
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.coBorrowerCellNumber`}
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
                      error={!!errors.scenarios?.[index]?.borrowerInfo?.coBorrowerCellNumber}
                      helperText={
                        errors.scenarios?.[index]?.borrowerInfo?.coBorrowerCellNumber?.message
                      }
                      inputProps={{ maxLength: 14 }} // formatted version length
                    />
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.borrowerEmail`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Borrower's Email"
                    error={!!errors.scenarios?.[index]?.borrowerInfo?.borrowerEmail}
                    helperText={errors.scenarios?.[index]?.borrowerInfo?.borrowerEmail?.message}
                  />
                )}
              />
            </Grid>

            {/* Date of Birth */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.dateOfBirth`}
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => {
                        setDateOfBirth(date);
                        field.onChange(date ? date.toDate() : undefined);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.scenarios?.[index]?.borrowerInfo?.dateOfBirth,
                          helperText: errors.scenarios?.[index]?.borrowerInfo?.dateOfBirth?.message,
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              />
            </Grid>

            {/* Current Address */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.currentAddress`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Current Address"
                    error={!!errors.scenarios?.[index]?.borrowerInfo?.currentAddress}
                    helperText={errors.scenarios?.[index]?.borrowerInfo?.currentAddress?.message}
                  />
                )}
              />
            </Grid>

            {/* SSN */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.ssn`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : e.target.value;
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    value={field.value ?? ""}
                    fullWidth
                    label="SSN"
                    type="number"
                    inputMode="numeric"
                    error={!!errors.scenarios?.[index]?.borrowerInfo?.ssn}
                    helperText={errors.scenarios?.[index]?.borrowerInfo?.ssn?.message}
                  />
                )}
              />
            </Grid>

            {/* Marital Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.borrowerInfo.maritalStatus`}
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Marital Status"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : Number(val));
                      handleFieldChange(index);
                    }}
                    error={!!errors.scenarios?.[index]?.borrowerInfo?.maritalStatus}
                    helperText={errors.scenarios?.[index]?.borrowerInfo?.maritalStatus?.message}
                  >
                    <MenuItem value="">N/A</MenuItem>
                    <MenuItem value={0}>Single</MenuItem>
                    <MenuItem value={1}>Married</MenuItem>
                    <MenuItem value={2}>Divorced</MenuItem>
                    <MenuItem value={3}>Widowed</MenuItem>
                    <MenuItem value={4}>Separated</MenuItem>
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
