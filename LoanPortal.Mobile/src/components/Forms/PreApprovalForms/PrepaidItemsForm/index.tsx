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
import { usePreApprovalStore } from "@/store/usePreApprovalStore";

type PrepaidItemsFormProps = {
  expanded: boolean;
  onToggle: () => void;
};

export default function PrepaidItemsForm({
  expanded,
  onToggle,
}: PrepaidItemsFormProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

  // Values from store
  const { annualInterestRate, hazardInsurance } = usePreApprovalStore();

  // Watch values from form
  const loanAmount = useWatch({ name: "purchaseInfo.loanAmount" });
  const prepaidInterestDays = useWatch({
    name: "prepaidItems.prepaidInterestDays",
  });
  const hazardInsuranceMonths = useWatch({
    name: "prepaidItems.hazardInsuranceMonths",
  });

  useEffect(() => {
    if (
      typeof loanAmount === "number" &&
      typeof annualInterestRate === "number" &&
      typeof prepaidInterestDays === "number"
    ) {
      const interest =
        ((loanAmount * (annualInterestRate / 100)) / 365) * prepaidInterestDays;
      setValue(
        "prepaidItems.prepaidInterestAmount",
        Math.round(interest) // No decimals
      );
    }
  }, [loanAmount, annualInterestRate, prepaidInterestDays, setValue]);

  // Recalculate Hazard Insurance Reserves
  useEffect(() => {
    // if (hazardInsurance && hazardInsuranceMonths) {
      const reserve = hazardInsurance * hazardInsuranceMonths;
      setValue(
        "prepaidItems.hazardInsuranceReserves",
        parseFloat(reserve.toFixed(2))
      );
      setValue(
        "prepaidItems.hazardInsurance",
        hazardInsurance
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
    <Box
      sx={{
        borderRadius: 4,
        backgroundColor: expanded ? "#fff" : "transparent",
        padding: expanded ? "15px" : "0px",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        onClick={onToggle}
        sx={{ cursor: "pointer" }}
      >
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
                  backgroundColor: "#7444F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <CheckIcon sx={{ color: "#fff" }} /> */}
                <SVGs name="Prepaid_items_icon" />
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Prepaid items
              </Typography>
            </Box>
            <IconButton size="small" sx={{ color: "black" }}>
              {/* <EditIcon fontSize="small" /> */}
              <SVGs name="Edit_icon" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Collapsible Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Prepaid Interest */}
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
              >
                <Typography fontWeight={600}>Prepaid Interest</Typography>
                <Box display="flex" gap={1}>
                  <Controller
                    name="prepaidItems.prepaidInterestDays"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                        value={field.value ?? ""}
                        fullWidth
                        type="number"
                        placeholder="DD"
                        size="medium"
                        error={!!errors.prepaidItems?.prepaidInterestDays}
                        helperText={
                          errors.prepaidItems?.prepaidInterestDays?.message
                        }
                        sx={{
                          width: 80,
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
                    name="prepaidItems.prepaidInterestAmount"
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
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
                          maxWidth: 160,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f7f7f7",
                            "& fieldset": { border: "none" },
                          },
                        }}
                        InputProps={currencyAdornment}
                        thousandSeparator=","
                        allowNegative={false}
                        error={!!errors.prepaidItems?.prepaidInterestAmount}
                        helperText={
                          errors.prepaidItems?.prepaidInterestAmount?.message
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
                  <Typography fontWeight={600}>Hazard Ins</Typography>
                  <Typography variant="caption" color="text.secondary">
                    (First Year)
                  </Typography>
                </Box>
                <Controller
                  name="prepaidItems.hazardInsurance"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
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
                        maxWidth: 160,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": { border: "none" },
                        },
                      }}
                      InputProps={currencyAdornment}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.prepaidItems?.hazardInsurance}
                      helperText={errors.prepaidItems?.hazardInsurance?.message}
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
                <Typography fontWeight={600}>Hazard ins Reserves</Typography>
                <Box display="flex" gap={1}>
                  <Controller
                    name="prepaidItems.hazardInsuranceMonths"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                        value={field.value ?? ""}
                        fullWidth
                        type="number"
                        placeholder="MM"
                        size="medium"
                        error={!!errors.prepaidItems?.hazardInsuranceMonths}
                        helperText={
                          errors.prepaidItems?.hazardInsuranceMonths?.message
                        }
                        sx={{
                          width: 80,
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
                    name="prepaidItems.hazardInsuranceReserves"
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
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
                          maxWidth: 160,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f7f7f7",
                            "& fieldset": { border: "none" },
                          },
                        }}
                        InputProps={currencyAdornment}
                        thousandSeparator=","
                        allowNegative={false}
                        error={!!errors.prepaidItems?.hazardInsuranceReserves}
                        helperText={
                          errors.prepaidItems?.hazardInsuranceReserves?.message
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
                <Typography fontWeight={600}>Property Taxes</Typography>
                <Box display="flex" gap={1}>
                  <Controller
                    name="prepaidItems.propertyTaxMonths"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                        value={field.value ?? ""}
                        fullWidth
                        type="number"
                        placeholder="MM"
                        size="medium"
                        error={!!errors.prepaidItems?.propertyTaxMonths}
                        helperText={
                          errors.prepaidItems?.propertyTaxMonths?.message
                        }
                        sx={{
                          width: 80,
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
                    name="prepaidItems.propertyTaxAmount"
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
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
                          maxWidth: 160,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f7f7f7",
                            "& fieldset": { border: "none" },
                          },
                        }}
                        InputProps={currencyAdornment}
                        thousandSeparator=","
                        allowNegative={false}
                        error={!!errors.prepaidItems?.propertyTaxAmount}
                        helperText={
                          errors.prepaidItems?.propertyTaxAmount?.message
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
