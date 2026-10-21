"use client";

import {
  Box,
  // Button,
  Grid,
  InputAdornment,
  // MenuItem,
  TextField,
  Typography,
  // Typography,
} from "@mui/material";
import {
  Controller,
  // useFieldArray,
  Control,
  FieldErrors,
  // useWatch,
  // useFormContext,
} from "react-hook-form";
import { ComparePreApprovalFormData } from "@/api/models/ComparePreApprovalSchema";
import { NumericFormat } from "react-number-format";
// import { useEffect } from "react";

type Props = {
  index: number;
  control: Control<ComparePreApprovalFormData>;
  errors: FieldErrors<ComparePreApprovalFormData>;
};

export default function MiscFeesItem({ index, control, errors }: Props) {
  const currencyAdornment = {
    startAdornment: (
      <InputAdornment position="start">
        <span style={{ fontWeight: "bold", color: "black" }}>$</span>
      </InputAdornment>
    ),
  };
  return (
    <Box sx={{ display: "none" }}>
      <Grid container spacing={2}>
        <Grid
          size={{ xs: 12 }}
          sx={{
            borderRadius: 3,
            backgroundColor: "#fff",
            p: 2,
          }}
        >
          <Grid container spacing={2}>
            <Grid sx={{ display: "none" }}>
              <Controller
                name={`borrowerInfo.Inputs.${index}.preApprovalId`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="preApprovalId *"
                    error={
                      !!errors.borrowerInfo?.Inputs?.[index]?.preApprovalId
                    }
                    helperText={
                      errors.borrowerInfo?.Inputs?.[index]?.preApprovalId
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Earnest Money Deposit (EMD)
                </Typography>
                <Controller
                  name={`miscFees.Inputs.${index}.earnestMoneyDeposit`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) =>
                        field.onChange(
                          values.floatValue === undefined
                            ? ""
                            : values.floatValue
                        )
                      }
                      sx={{
                        maxWidth: 120,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={currencyAdornment}
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={ !!errors.miscFees?.Inputs?.[index]
                            ?.earnestMoneyDeposit}
                      helperText={errors.miscFees?.Inputs?.[index]
                            ?.earnestMoneyDeposit?.message}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Seller Credit
                </Typography>
                <Controller
                  name={`miscFees.Inputs.${index}.sellerCredit`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) =>
                        field.onChange(
                          values.floatValue === undefined
                            ? ""
                            : values.floatValue
                        )
                      }
                      sx={{
                        maxWidth: 120,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={currencyAdornment}
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={ !!errors.miscFees?.Inputs?.[index]
                            ?.sellerCredit}
                      helperText={errors.miscFees?.Inputs?.[index]
                            ?.sellerCredit?.message}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Lender Credit
                </Typography>
                <Controller
                  name={`miscFees.Inputs.${index}.lenderCredit`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) =>
                        field.onChange(
                          values.floatValue === undefined
                            ? ""
                            : values.floatValue
                        )
                      }
                      sx={{
                        maxWidth: 120,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={currencyAdornment}
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={ !!errors.miscFees?.Inputs?.[index]
                            ?.lenderCredit}
                      helperText={errors.miscFees?.Inputs?.[index]
                            ?.lenderCredit?.message}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Misc Fee 4
                </Typography>
                <Controller
                  name={`miscFees.Inputs.${index}.miscFee4`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) =>
                        field.onChange(
                          values.floatValue === undefined
                            ? ""
                            : values.floatValue
                        )
                      }
                      sx={{
                        maxWidth: 120,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={currencyAdornment}
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={ !!errors.miscFees?.Inputs?.[index]
                            ?.miscFee4}
                      helperText={errors.miscFees?.Inputs?.[index]
                            ?.miscFee4?.message}
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
