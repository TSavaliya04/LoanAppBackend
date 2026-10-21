"use client";

import {
  Box,
  // Button,
  Grid,
  InputAdornment,
  MenuItem,
  // MenuItem,
  TextField,
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
import { useEffect, useRef } from "react";

type Props = {
  index: number;
  control: Control<ComparePreApprovalFormData>;
  errors: FieldErrors<ComparePreApprovalFormData>;
};

export default function PurchaseInfoItem({ index, control, errors }: Props) {
  const {
    setValue,
    formState: { dirtyFields },
  } = useFormContext<ComparePreApprovalFormData>();

  const renderCount = useRef(0);

  const loanProgram =
    useWatch({ control, name: `purchaseInfo.Inputs.${index}.loanProgram` }) ??
    "0";

  const purchasePrice = useWatch({
    control,
    name: `purchaseInfo.Inputs.${index}.purchasePrice`,
  });

  const downPayment = useWatch({
    control,
    name: `purchaseInfo.Inputs.${index}.downPayment`,
  });

  const annualInterestRate = useWatch({
    control,
    name: `purchaseInfo.Inputs.${index}.annualInterestRate`,
  });

  const hazardInsurance = useWatch({
    control,
    name: `purchaseInfo.Inputs.${index}.hazardInsurance`,
  });

  const mipFundingFee = useWatch({
    control,
    name: `purchaseInfo.Inputs.${index}.mipFundingFee`,
  });

  useEffect(() => {
    // console.log(typeof purchasePrice);
    // console.log(typeof downPayment);

    // if (purchasePrice && downPayment) {
    const downPaymentAmount = (purchasePrice * downPayment) / 100;
    const loanAmount = purchasePrice - downPaymentAmount;
    const ltv = (loanAmount / purchasePrice) * 100;
    let calculatedAnnualMIPRate = 0;

    let calcmiPercent = 0;
    if (loanProgram === "3") {
      if (loanAmount <= 726200) {
        if (ltv <= 90) {
          calculatedAnnualMIPRate = 0.5; // 50 bps
        } else if (ltv > 90 && ltv <= 95) {
          calculatedAnnualMIPRate = 0.55; // 55 bps
        } else if (ltv > 95) {
          calculatedAnnualMIPRate = 0.55; // 55 bps
        }
      } else {
        if (ltv <= 90) {
          calculatedAnnualMIPRate = 0.7; // 70 bps
        } else if (ltv > 90 && ltv <= 95) {
          calculatedAnnualMIPRate = 0.7; // 70 bps
        } else if (ltv > 95) {
          calculatedAnnualMIPRate = 0.75; // 75 bps
        }
      }
    } else {
      calculatedAnnualMIPRate = mipFundingFee || 0;
    }
    calcmiPercent = Math.round(
      (loanAmount * calculatedAnnualMIPRate) / 100 / 12
    );
    setValue(
      `purchaseInfo.Inputs.${index}.mipFundingFee`,
      calculatedAnnualMIPRate
    );
    setValue(`purchaseInfo.Inputs.${index}.miPercent`, calcmiPercent);
    setValue(`purchaseInfo.Inputs.${index}.loanAmount`, loanAmount);
    // } else {
    //   setValue("purchaseInfo.loanAmount", null);
    // }
  }, [
    loanProgram,
    purchasePrice,
    downPayment,
    annualInterestRate,
    mipFundingFee,
    setValue,
  ]);

  useEffect(() => {
    renderCount.current += 1;

    // Skip first 3 renders:
    // 1. initial effect
    // 2. strict mode second effect
    // 3. API reset effect
    if (renderCount.current <= 1) {
      return;
    }

    // If user manually edited the field, do not override
    if (dirtyFields?.purchaseInfo?.Inputs?.[index].mipFundingFee) {
      return;
    }

    // Auto-fill only AFTER first 3 renders
    if (loanProgram !== "3") {
      setValue(`purchaseInfo.Inputs.${index}.mipFundingFee`, 0, {
        shouldDirty: false,
      });
    } else {
      setValue(`purchaseInfo.Inputs.${index}.mipFundingFee`, 1.75, {
        shouldDirty: false,
      });
    }
  }, [loanProgram]);

  useEffect(() => {
    if (hazardInsurance > 0) {
      setValue(
        `prepaidItems.Inputs.${index}.hazardInsurance`,
        hazardInsurance * 12
      );
      setValue(`loanProgram.Inputs.${index}.hazardInsurance`, hazardInsurance);
    }
  }, [hazardInsurance, setValue]);
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
              <Controller
                name={`purchaseInfo.Inputs.${index}.loanProgram`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Loan Program *"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={
                      !!errors.purchaseInfo?.Inputs?.[index]?.loanProgram
                    }
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.loanProgram
                        ?.message
                    }
                  >
                    <MenuItem value="">Select Loan Program</MenuItem>
                    <MenuItem value="1">Non QM</MenuItem>
                    <MenuItem value="2">Conventional</MenuItem>
                    <MenuItem value="3">FHA</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.propertyType`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Property Type *"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={!!errors.purchaseInfo?.Inputs?.[index]?.propertyType}
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.propertyType
                        ?.message
                    }
                  >
                    <MenuItem value="">Select Property Type</MenuItem>
                    <MenuItem value="1">SFR</MenuItem>
                    <MenuItem value="2">2 Units</MenuItem>
                    <MenuItem value="3">3 Units</MenuItem>
                    <MenuItem value="4">4 Units</MenuItem>
                    <MenuItem value="5">Condo/Townhome</MenuItem>
                    <MenuItem value="6">Duplex</MenuItem>
                    <MenuItem value="7">Tri-plex</MenuItem>
                    <MenuItem value="8">Four-plex</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.occupancyStatus`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Occupancy Status *"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={
                      !!errors.purchaseInfo?.Inputs?.[index]?.occupancyStatus
                    }
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.occupancyStatus
                        ?.message
                    }
                  >
                    <MenuItem value="">Select Occupancy Status</MenuItem>
                    <MenuItem value="1">Owner Occupied</MenuItem>
                    <MenuItem value="2">2nd Home</MenuItem>
                    <MenuItem value="3">Investment</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.purchasePrice`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Purchase Price *"
                    value={field.value ?? ""}
                    onValueChange={(values) =>
                      field.onChange(
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={
                      !!errors.purchaseInfo?.Inputs?.[index]?.purchasePrice
                    }
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.purchasePrice
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.downPayment`}
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
                    label="Down Payment *"
                    type="number"
                    inputMode="numeric"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    error={!!errors.purchaseInfo?.Inputs?.[index]?.downPayment}
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.downPayment?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.loanAmount`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Loan Amount *"
                    value={field.value ?? ""}
                    onValueChange={(values) =>
                      field.onChange(
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    disabled
                    thousandSeparator=","
                    allowNegative={false}
                    error={!!errors.purchaseInfo?.Inputs?.[index]?.loanAmount}
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.loanAmount?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.annualInterestRate`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Interest Rate *"
                    value={field.value ?? ""}
                    onValueChange={(values) =>
                      field.onChange(
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={
                      !!errors.purchaseInfo?.Inputs?.[index]?.annualInterestRate
                    }
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.annualInterestRate
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.mipFundingFee`}
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
                    disabled={loanProgram === "3"}
                    label="MIP Rate"
                    type="number"
                    inputMode="numeric"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    error={
                      !!errors.purchaseInfo?.Inputs?.[index]?.mipFundingFee
                    }
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.mipFundingFee
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.hazardInsurance`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Hazard Insurance"
                    value={field.value ?? ""}
                    onValueChange={(values) =>
                      field.onChange(
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={
                      !!errors.purchaseInfo?.Inputs?.[index]?.hazardInsurance
                    }
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.hazardInsurance
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.associationFee`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Association Fee"
                    value={field.value ?? ""}
                    onValueChange={(values) =>
                      field.onChange(
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={
                      !!errors.purchaseInfo?.Inputs?.[index]?.associationFee
                    }
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.associationFee
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`purchaseInfo.Inputs.${index}.miPercent`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="MI"
                    value={field.value ?? ""}
                    // disabled={loanProgram === "3"}
                    disabled
                    onValueChange={(values) =>
                      field.onChange(
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={!!errors.purchaseInfo?.Inputs?.[index]?.miPercent}
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.miPercent?.message
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
