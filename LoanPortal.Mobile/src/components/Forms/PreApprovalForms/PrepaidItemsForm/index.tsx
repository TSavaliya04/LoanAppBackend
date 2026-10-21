"use client";

import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Collapse,
  InputAdornment,
} from "@mui/material";
import { useEffect } from "react";
import SVGs from "@/components/SVGs";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import { NumericFormat } from "react-number-format";

type PrepaidItemsFormProps = {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  handleFieldChange: (index: number) => void;
};

export default function PrepaidItemsForm({
  index,
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
  handleFieldChange,
}: PrepaidItemsFormProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

  // Watch values from form
  // const purchasePrice = useWatch({ name: `scenarios.${index}.purchaseInfo.purchasePrice` });
  // const annualInterestRate = useWatch({
  //   name: `scenarios.${index}.purchaseInfo.annualInterestRate`,
  // });
  // const loanAmount = useWatch({ name: `scenarios.${index}.purchaseInfo.loanAmount` });
  // const hazardInsurance = useWatch({ name: `scenarios.${index}.purchaseInfo.hazardInsurance` });
  // const prepaidInterestDays = useWatch({
  //   name: `scenarios.${index}.prepaidItems.prepaidInterestDays`,
  // });
  // const hazardInsuranceMonths = useWatch({
  //   name: `scenarios.${index}.prepaidItems.hazardInsuranceMonths`,
  // });
  // const monthlyPropertyTaxPercentage =
  //   useWatch({ control, name: `scenarios.${index}.loanProgram.monthlyPropertyTaxPercentage` }) ??
  //   1.25;
  // const propertyTaxMonths = useWatch({
  //   name: `scenarios.${index}.prepaidItems.propertyTaxMonths`,
  // });

  // useEffect(() => {
  //   if (purchasePrice > 0 && propertyTaxMonths > 0) {
  //     const months =
  //       propertyTaxMonths && propertyTaxMonths > 0 ? propertyTaxMonths : 12;
  //     const topLevelPropertyTax =
  //       (purchasePrice * (monthlyPropertyTaxPercentage / 100)) / 12;
  //     const calPropertyTaxAmount = Math.round(topLevelPropertyTax * months);
  //     const propertyTax = Math.round(calPropertyTaxAmount);
  //     setValue(`scenarios.${index}.prepaidItems.propertyTaxAmount`, propertyTax);
  //     setValue(`scenarios.${index}.prepaidItems.propertyTaxMonths`, months);
  //     setValue(`scenarios.${index}.loanProgram.propertyTax`, propertyTax);
  //     setValue(
  //       `scenarios.${index}.loanProgram.monthlyPropertyTax`,
  //       Math.round(topLevelPropertyTax)
  //     );
  //   } else {
  //     setValue(`scenarios.${index}.prepaidItems.propertyTaxAmount`, 0);
  //   }
  // }, [
  //   purchasePrice,
  //   monthlyPropertyTaxPercentage,
  //   propertyTaxMonths,
  //   setValue,
  // ]);

  // useEffect(() => {
  //   if (
  //     typeof loanAmount === "number" &&
  //     typeof annualInterestRate === "number" &&
  //     typeof prepaidInterestDays === "number"
  //   ) {
  //     const interest =
  //       ((loanAmount * (annualInterestRate / 100)) / 365) * prepaidInterestDays;
  //     setValue(
  //       `scenarios.${index}.prepaidItems.prepaidInterestAmount`,
  //       Math.round(interest) // No decimals
  //     );
  //   }
  // }, [loanAmount, annualInterestRate, prepaidInterestDays, setValue]);

  // // Recalculate Hazard Insurance Reserves
  // useEffect(() => {
  //   // if (hazardInsurance && hazardInsuranceMonths) {
  //   const reserve = hazardInsurance * hazardInsuranceMonths;
  //   setValue(
  //     `scenarios.${index}.prepaidItems.hazardInsuranceReserves`,
  //     parseFloat(reserve.toFixed(2))
  //   );
  //   // }
  // }, [hazardInsurance, hazardInsuranceMonths, setValue]);

  const currencyAdornment = {
    startAdornment: (
      <InputAdornment position="start">
        <span style={{ fontWeight: "bold", color: "black" }}>$</span>
      </InputAdornment>
    ),
  };

  return (
    <Box
      sx={{
        borderRadius: 4,
        backgroundColor: expanded ? "#fff" : "transparent",
        padding: expanded ? "15px" : "0px",
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {expanded ? (
          <Typography fontWeight={600} color="primary">
            Prepaid items
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
                  <SVGs name="Prepaid_items_icon" />
                ) : (
                  <SVGs name="Prepaid_items_icon" />
                )}
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Prepaid items
              </Typography>
            </Box>
            {!isDisabled && (
              <IconButton
                size="small"
                sx={{ color: "black" }}
                onClick={onToggle}
              >
                {/* <EditIcon fontSize="small" /> */}
                <SVGs name="Edit_icon" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Collapsible Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Prepaid Interest */}
            <Grid size={{ xs: 12, md: 6 }}>
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
                    name={`scenarios.${index}.prepaidItems.prepaidInterestDays`}
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
                        type="number"
                        inputMode="numeric"
                        placeholder="DD"
                        size="medium"
                        error={
                          !!errors.scenarios?.[index]?.prepaidItems
                            ?.prepaidInterestDays
                        }
                        helperText={
                          errors.scenarios?.[index]?.prepaidItems
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
                    name={`scenarios.${index}.prepaidItems.prepaidInterestAmount`}
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
                          !!errors.scenarios?.[index]?.prepaidItems
                            ?.prepaidInterestAmount
                        }
                        helperText={
                          errors.scenarios?.[index]?.prepaidItems
                            ?.prepaidInterestAmount?.message
                        }
                      />
                    )}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Hazard Ins (First Year) */}
            <Grid size={{ xs: 12, md: 6 }}>
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
                  name={`scenarios.${index}.prepaidItems.hazardInsurance`}
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
                        !!errors.scenarios?.[index]?.prepaidItems
                          ?.hazardInsurance
                      }
                      helperText={
                        errors.scenarios?.[index]?.prepaidItems?.hazardInsurance
                          ?.message
                      }
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Hazard Ins Reserves */}
            <Grid size={{ xs: 12, md: 6 }}>
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
                    name={`scenarios.${index}.prepaidItems.hazardInsuranceMonths`}
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
                        type="number"
                        inputMode="numeric"
                        placeholder="MM"
                        size="medium"
                        error={
                          !!errors.scenarios?.[index]?.prepaidItems
                            ?.hazardInsuranceMonths
                        }
                        helperText={
                          errors.scenarios?.[index]?.prepaidItems
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
                    name={`scenarios.${index}.prepaidItems.hazardInsuranceReserves`}
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
                          !!errors.scenarios?.[index]?.prepaidItems
                            ?.hazardInsuranceReserves
                        }
                        helperText={
                          errors.scenarios?.[index]?.prepaidItems
                            ?.hazardInsuranceReserves?.message
                        }
                      />
                    )}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Property Taxes */}
            <Grid size={{ xs: 12, md: 6 }}>
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
                    name={`scenarios.${index}.prepaidItems.propertyTaxMonths`}
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
                        type="number"
                        inputMode="numeric"
                        placeholder="MM"
                        size="medium"
                        error={
                          !!errors.scenarios?.[index]?.prepaidItems
                            ?.propertyTaxMonths
                        }
                        helperText={
                          errors.scenarios?.[index]?.prepaidItems
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
                    name={`scenarios.${index}.prepaidItems.propertyTaxAmount`}
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
                          !!errors.scenarios?.[index]?.prepaidItems
                            ?.propertyTaxAmount
                        }
                        helperText={
                          errors.scenarios?.[index]?.prepaidItems
                            ?.propertyTaxAmount?.message
                        }
                      />
                    )}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
