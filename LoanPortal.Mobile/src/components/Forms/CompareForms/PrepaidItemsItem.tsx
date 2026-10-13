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
  useWatch,
  useFormContext,
} from "react-hook-form";
import { ComparePreApprovalFormData } from "@/api/models/ComparePreApprovalSchema";
import { NumericFormat } from "react-number-format";
import { useEffect } from "react";

type Props = {
  index: number;
  control: Control<ComparePreApprovalFormData>;
  errors: FieldErrors<ComparePreApprovalFormData>;
};

export default function PrepaidItemsItem({ index, control, errors }: Props) {
  const { setValue } = useFormContext<ComparePreApprovalFormData>();

  // Watch values from form
  const purchasePrice = useWatch({
    name: `purchaseInfo.Inputs.${index}.purchasePrice`,
  });
  const annualInterestRate = useWatch({
    name: `purchaseInfo.Inputs.${index}.annualInterestRate`,
  });
  const loanAmount = useWatch({
    name: `purchaseInfo.Inputs.${index}.loanAmount`,
  });
  const hazardInsurance = useWatch({
    name: `purchaseInfo.Inputs.${index}.hazardInsurance`,
  });
  const prepaidInterestDays = useWatch({
    name: `prepaidItems.Inputs.${index}.prepaidInterestDays`,
  });
  const hazardInsuranceMonths = useWatch({
    name: `prepaidItems.Inputs.${index}.hazardInsuranceMonths`,
  });
  const monthlyPropertyTaxPercentage =
    useWatch({
      control,
      name: `loanProgram.Inputs.${index}.monthlyPropertyTaxPercentage`,
    }) ?? 1.25;
  const propertyTaxMonths = useWatch({
    name: `prepaidItems.Inputs.${index}.propertyTaxMonths`,
  });

  useEffect(() => {
    if (purchasePrice > 0 && propertyTaxMonths > 0) {
      const months =
        propertyTaxMonths && propertyTaxMonths > 0 ? propertyTaxMonths : 12;
      const topLevelPropertyTax = (purchasePrice * (monthlyPropertyTaxPercentage / 100)) / 12;
      console.log("topLevelPropertyTax =>",topLevelPropertyTax);
      
      const calPropertyTaxAmount = Math.round(topLevelPropertyTax * months);
      const propertyTax = Math.round(calPropertyTaxAmount);
      setValue(`prepaidItems.Inputs.${index}.propertyTaxAmount`, propertyTax);
      setValue(`prepaidItems.Inputs.${index}.propertyTaxMonths`, months);
      setValue(`loanProgram.Inputs.${index}.propertyTax`, propertyTax);
      setValue(
        `loanProgram.Inputs.${index}.monthlyPropertyTax`,
        Math.round(topLevelPropertyTax)
      );
    } else {
      setValue(`prepaidItems.Inputs.${index}.propertyTaxAmount`, 0);
    }
  }, [purchasePrice, monthlyPropertyTaxPercentage, propertyTaxMonths, setValue]);

  useEffect(() => {
    if (
      typeof loanAmount === "number" &&
      typeof annualInterestRate === "number" &&
      typeof prepaidInterestDays === "number"
    ) {
      const interest =
        ((loanAmount * (annualInterestRate / 100)) / 365) * prepaidInterestDays;
      setValue(
        `prepaidItems.Inputs.${index}.prepaidInterestAmount`,
        Math.round(interest) // No decimals
      );
    }
  }, [loanAmount, annualInterestRate, prepaidInterestDays, setValue]);

  // Recalculate Hazard Insurance Reserves
  useEffect(() => {
    // if (hazardInsurance && hazardInsuranceMonths) {
    const reserve = hazardInsurance * hazardInsuranceMonths;
    setValue(
      `prepaidItems.Inputs.${index}.hazardInsuranceReserves`,
      parseFloat(reserve.toFixed(2))
    );
    // }
  }, [hazardInsurance, hazardInsuranceMonths, setValue]);

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
            {/* Prepaid Interest */}
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Prepaid Interest
                </Typography>
                <Box display="flex" gap={1}>
                  <Controller
                    name={`prepaidItems.Inputs.${index}.prepaidInterestDays`}
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
                        placeholder="DD"
                        size="medium"
                        error={
                          !!errors.prepaidItems?.Inputs?.[index]
                            ?.prepaidInterestDays
                        }
                        helperText={
                          errors.prepaidItems?.Inputs?.[index]
                            ?.prepaidInterestDays?.message
                        }
                        sx={{
                          width: 60,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f7f7f7",
                            "& fieldset": { border: "none" },
                          },
                        }}
                      />
                    )}
                  />
                  <Controller
                    name={`prepaidItems.Inputs.${index}.prepaidInterestAmount`}
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        value={field.value ?? ""}
                        disabled
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
                            "& fieldset": { border: "none" },
                          },
                        }}
                        InputProps={currencyAdornment}
                        inputProps={{
                          inputMode: "decimal",
                          pattern: "[0-9.,]*",
                        }}
                        thousandSeparator=","
                        allowNegative={false}
                        error={
                          !!errors.prepaidItems?.Inputs?.[index]
                            ?.prepaidInterestAmount
                        }
                        helperText={
                          errors.prepaidItems?.Inputs?.[index]
                            ?.prepaidInterestAmount?.message
                        }
                      />
                    )}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Hazard Ins (First Year) */}
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    Hazard Ins
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (First Year)
                  </Typography>
                </Box>
                <Controller
                  name={`prepaidItems.Inputs.${index}.hazardInsurance`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      disabled
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      sx={{
                        maxWidth: 120,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": { border: "none" },
                        },
                      }}
                      InputProps={currencyAdornment}
                      thousandSeparator=","
                      allowNegative={false}
                      error={
                        !!errors.prepaidItems?.Inputs?.[index]?.hazardInsurance
                      }
                      helperText={
                        errors.prepaidItems?.Inputs?.[index]?.hazardInsurance
                          ?.message
                      }
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Hazard Ins Reserves */}
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Hazard ins Reserves
                </Typography>
                <Box display="flex" gap={1}>
                  <Controller
                    name={`prepaidItems.Inputs.${index}.hazardInsuranceMonths`}
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
                        placeholder="MM"
                        size="medium"
                        error={
                          !!errors.prepaidItems?.Inputs?.[index]
                            ?.hazardInsuranceMonths
                        }
                        helperText={
                          errors.prepaidItems?.Inputs?.[index]
                            ?.hazardInsuranceMonths?.message
                        }
                        sx={{
                          width: 60,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f7f7f7",
                            "& fieldset": { border: "none" },
                          },
                        }}
                      />
                    )}
                  />
                  <Controller
                    name={`prepaidItems.Inputs.${index}.hazardInsuranceReserves`}
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        disabled
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
                            "& fieldset": { border: "none" },
                          },
                        }}
                        InputProps={currencyAdornment}
                        inputProps={{
                          inputMode: "decimal",
                          pattern: "[0-9.,]*",
                        }}
                        thousandSeparator=","
                        allowNegative={false}
                        error={
                          !!errors.prepaidItems?.Inputs?.[index]
                            ?.hazardInsuranceReserves
                        }
                        helperText={
                          errors.prepaidItems?.Inputs?.[index]
                            ?.hazardInsuranceReserves?.message
                        }
                      />
                    )}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Property Taxes */}
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Property Taxes
                </Typography>
                <Box display="flex" gap={1}>
                  <Controller
                    name={`prepaidItems.Inputs.${index}.propertyTaxMonths`}
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
                        placeholder="MM"
                        size="medium"
                        error={
                          !!errors.prepaidItems?.Inputs?.[index]
                            ?.propertyTaxMonths
                        }
                        helperText={
                          errors.prepaidItems?.Inputs?.[index]
                            ?.propertyTaxMonths?.message
                        }
                        sx={{
                          width: 60,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f7f7f7",
                            "& fieldset": { border: "none" },
                          },
                        }}
                      />
                    )}
                  />
                  <Controller
                    name={`prepaidItems.Inputs.${index}.propertyTaxAmount`}
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        disabled
                        value={field.value ?? ""}
                        placeholder="0"
                        onValueChange={(values) =>
                          field.onChange(
                            values.floatValue === undefined
                              ? ""
                              : values.floatValue
                          )
                        }
                        inputProps={{
                          inputMode: "decimal",
                          pattern: "[0-9.,]*",
                        }}
                        sx={{
                          maxWidth: 120,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f7f7f7",
                            "& fieldset": { border: "none" },
                          },
                        }}
                        InputProps={currencyAdornment}
                        thousandSeparator=","
                        allowNegative={false}
                        error={
                          !!errors.prepaidItems?.Inputs?.[index]
                            ?.propertyTaxAmount
                        }
                        helperText={
                          errors.prepaidItems?.Inputs?.[index]
                            ?.propertyTaxAmount?.message
                        }
                      />
                    )}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
