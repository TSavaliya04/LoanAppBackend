"use client";

import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Collapse,
  InputAdornment,
  MenuItem,
  Slider,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import SVGs from "@/components/SVGs";
import { NumericFormat } from "react-number-format";

type PropertyIncomeOffsetFormProps = {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  handleFieldChange: (index: number) => void;
};

export default function PropertyIncomeOffsetForm({
  index,
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
  handleFieldChange,
}: PropertyIncomeOffsetFormProps) {
  const {
    control,
    setValue,
    // getValues,
    formState: { errors, dirtyFields },
  } = useFormContext<CombinedPreApprovalFormData>();

  const loanProgram =
    useWatch({
      control,
      name: `scenarios.${index}.purchaseInfo.loanProgram`,
    }) ?? "0";

  const occupancyStatus =
    useWatch({
      control,
      name: `scenarios.${0}.purchaseInfo.occupancyStatus`,
    }) ?? "0";

  const rentalPercentage =
    useWatch({
      control,
      name: `scenarios.${index}.propertyIncomeOffset.rentalPercentage`,
    }) ?? "0";

  const handleBlur = () => {
    if (rentalPercentage < 0) {
      setValue(`scenarios.${index}.propertyIncomeOffset.rentalPercentage`, 0, { shouldDirty: true });
    } else if (rentalPercentage > 100) {
      setValue(`scenarios.${index}.propertyIncomeOffset.rentalPercentage`, 100, { shouldDirty: true });
    }
  };

  return (
    <Box
      sx={{
        borderRadius: 4,
        backgroundColor: expanded ? "#fff" : "transparent",
        padding: expanded ? "15px" : "0px",
        display: occupancyStatus === "3" ? "block" : "none",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {expanded ? (
          <Typography fontWeight={600} color="primary">
            Property Income Offset
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
                Property Income Offset
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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.propertyIncomeOffset.monthlyGrossRentalIncome`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Monthly Gross Rental Income *"
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      const value =
                        values.floatValue === undefined
                          ? ""
                          : values.floatValue;
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={
                      !!errors.scenarios?.[index]?.propertyIncomeOffset?.monthlyGrossRentalIncome
                    }
                    helperText={
                      errors.scenarios?.[index]?.propertyIncomeOffset?.monthlyGrossRentalIncome
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size="grow">
                    <Typography id="input-slider" sx={{ mb: 0 }} gutterBottom>
                      Rental Percentage
                    </Typography>
                    <Slider
                      value={typeof rentalPercentage === 'number' ? rentalPercentage : 0}
                      onChange={(_event, value) => {
                        setValue(
                          `scenarios.${index}.propertyIncomeOffset.rentalPercentage`,
                          value,
                          { shouldDirty: true }
                        );
                        handleFieldChange(index);
                      }}
                      aria-labelledby="input-slider"
                      sx={{
                        "&.MuiSlider-root": {
                          padding: "10px 0"
                        }
                      }}
                    />
                  </Grid>
                  <Grid>
                    <Controller
                      name={`scenarios.${index}.propertyIncomeOffset.rentalPercentage`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          onChange={(e) => {
                            const value =
                              e.target.value === "" ? "" : Number(e.target.value);
                            field.onChange(value);
                            handleFieldChange(index);
                            // handleInputChange(e as React.ChangeEvent<HTMLInputElement>);
                          }}
                          onBlur={handleBlur}
                          value={field.value ?? ""}
                          fullWidth
                          type="number"
                          inputMode="numeric"
                          inputProps={{
                            step: 'any',
                            min: 0,
                            max: 100,
                            type: 'number',
                            'aria-labelledby': 'input-slider',
                          }}
                          error={
                            !!errors.scenarios?.[index]?.propertyIncomeOffset
                              ?.rentalPercentage
                          }
                          helperText={
                            errors.scenarios?.[index]?.propertyIncomeOffset
                              ?.rentalPercentage?.message
                          }
                        />
                      )}
                    />
                    {/* <Input
                      value={rentalPercentage}
                      size="small"
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      inputProps={{
                        step: 10,
                        min: 0,
                        max: 100,
                        type: 'number',
                        'aria-labelledby': 'input-slider',
                      }}
                    /> */}
                  </Grid>
                </Grid>
              </Box>
              {/* <Controller
                name={`scenarios.${index}.purchaseInfo.downPayment`}
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
                    label="Down Payment *"
                    type="number"
                    inputMode="numeric"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    error={
                      !!errors.scenarios?.[index]?.purchaseInfo?.downPayment
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.downPayment
                        ?.message
                    }
                  />
                )}
              /> */}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.propertyIncomeOffset.subjectPropertyPITIA`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Subject Property PITIA *"
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      const value =
                        values.floatValue === undefined
                          ? ""
                          : values.floatValue;
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={
                      !!errors.scenarios?.[index]?.propertyIncomeOffset?.subjectPropertyPITIA
                    }
                    helperText={
                      errors.scenarios?.[index]?.propertyIncomeOffset?.subjectPropertyPITIA
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Qualifying Rental Income ({rentalPercentage}%)
                </Typography>
                <Controller
                  name={`scenarios.${index}.propertyIncomeOffset.qualifyingRentalIncome`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      disabled
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue,
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={
                        !!errors.scenarios?.[index]?.propertyIncomeOffset?.qualifyingRentalIncome
                      }
                      helperText={
                        errors.scenarios?.[index]?.propertyIncomeOffset?.qualifyingRentalIncome
                          ?.message
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Subject Property PITIA
                </Typography>
                <Controller
                  name={`scenarios.${index}.propertyIncomeOffset.subjectPropertyPITIA`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      disabled
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue,
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={
                        !!errors.scenarios?.[index]?.propertyIncomeOffset?.subjectPropertyPITIA
                      }
                      helperText={
                        errors.scenarios?.[index]?.propertyIncomeOffset?.subjectPropertyPITIA
                          ?.message
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight={600} sx={{ fontSize: 14, fontWeight: "bold", color: theme => theme.palette.primary.main }}>
                  Net Monthly Impact to DTI
                </Typography>
                <Controller
                  name={`scenarios.${index}.propertyIncomeOffset.netMonthlyImpactToDTI`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      disabled
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue,
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={
                        !!errors.scenarios?.[index]?.propertyIncomeOffset?.netMonthlyImpactToDTI
                      }
                      helperText={
                        errors.scenarios?.[index]?.propertyIncomeOffset?.netMonthlyImpactToDTI
                          ?.message
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>

          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
