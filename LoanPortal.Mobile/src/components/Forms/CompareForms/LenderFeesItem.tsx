"use client";

import {
  Box,
  // Button,
  Grid,
  InputAdornment,
  // MenuItem,
  TextField,
  Typography,
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

export default function LenderFeesItem({ index, control, errors }: Props) {
  const { setValue } = useFormContext<ComparePreApprovalFormData>();

  const loanProgram =
    useWatch({ control, name: `purchaseInfo.Inputs.${index}.loanProgram` }) ??
    0;
  const loanAmount =
    useWatch({ control, name: `purchaseInfo.Inputs.${index}.loanAmount` }) ?? 0;
  const loanOriginationFee =
    useWatch({
      control,
      name: `lenderFees.Inputs.${index}.loanOriginationFee`,
    }) ?? 0;
  const loanOriginationFeePercentage =
    useWatch({
      control,
      name: `lenderFees.Inputs.${index}.loanOriginationFeePercentage`,
    }) ?? 0;
  const discountFee =
    useWatch({ control, name: `lenderFees.Inputs.${index}.discountFee` }) ?? 0;
  const discountFeePercentage =
    useWatch({
      control,
      name: `lenderFees.Inputs.${index}.discountFeePercentage`,
    }) ?? 0;
  // const upfrontMip = useWatch({ control, name: "lenderFees.upfrontMip" }) ?? 0;
  const upfrontMipPercentage =
    useWatch({
      control,
      name: `lenderFees.Inputs.${index}.upfrontMipPercentage`,
    }) ?? 0;
  const appraisalFee =
    useWatch({ control, name: `lenderFees.Inputs.${index}.appraisalFee` }) ?? 0;
  const escrowFees =
    useWatch({ control, name: `lenderFees.Inputs.${index}.escrowFees` }) ?? 0;
  const titleFees =
    useWatch({ control, name: `lenderFees.Inputs.${index}.titleFees` }) ?? 0;
  const thirdPartyLenderFee =
    useWatch({
      control,
      name: `lenderFees.Inputs.${index}.thirdPartyLenderFee`,
    }) ?? 0;
  const prepaidInterestAmount =
    useWatch({
      control,
      name: `prepaidItems.Inputs.${index}.prepaidInterestAmount`,
    }) ?? 0;
  const hazardInsurance =
    useWatch({
      control,
      name: `prepaidItems.Inputs.${index}.hazardInsurance`,
    }) ?? 0;
  const hazardInsuranceReserves =
    useWatch({
      control,
      name: `prepaidItems.Inputs.${index}.hazardInsuranceReserves`,
    }) ?? 0;
  const propertyTaxAmount =
    useWatch({
      control,
      name: `prepaidItems.Inputs.${index}.propertyTaxAmount`,
    }) ?? 0;

  useEffect(() => {
    if (loanAmount > 0) {
      const loanOriginationFee = Math.round(
        (loanOriginationFeePercentage / 100) * loanAmount
      );
      const discountFee = Math.round(
        (discountFeePercentage / 100) * loanAmount
      );
      const upfrontMip = Math.round((upfrontMipPercentage / 100) * loanAmount);

      setValue(
        `lenderFees.Inputs.${index}.loanOriginationFee`,
        loanOriginationFee
      );
      setValue(`lenderFees.Inputs.${index}.discountFee`, discountFee);
      setValue(`lenderFees.Inputs.${index}.upfrontMip`, upfrontMip);
    }
  }, [
    loanAmount,
    loanOriginationFeePercentage,
    discountFeePercentage,
    upfrontMipPercentage,
    setValue,
  ]);

  useEffect(() => {
    const closingCosts =
      loanOriginationFee +
      discountFee +
      // upfrontMip +
      appraisalFee +
      prepaidInterestAmount +
      hazardInsurance +
      hazardInsuranceReserves +
      propertyTaxAmount +
      escrowFees +
      titleFees +
      thirdPartyLenderFee;
    setValue(
      `loanProgram.Inputs.${index}.clearingCart`,
      Math.round(closingCosts)
    );
  }, [
    loanOriginationFee,
    discountFee,
    // upfrontMip,
    appraisalFee,
    prepaidInterestAmount,
    hazardInsurance,
    hazardInsuranceReserves,
    propertyTaxAmount,
    escrowFees,
    titleFees,
    thirdPartyLenderFee,
    setValue,
  ]);
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
                name={`lenderFees.Inputs.${index}.agentName`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Agent Name *"
                    error={!!errors.lenderFees?.Inputs?.[index]?.agentName}
                    helperText={
                      errors.lenderFees?.Inputs?.[index]?.agentName?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
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
                  Loan Orig. Fee
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <Controller
                    name={`lenderFees.Inputs.${index}.loanOriginationFeePercentage`}
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
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        size="small"
                        error={
                          !!errors.lenderFees?.Inputs?.[index]
                            ?.loanOriginationFeePercentage
                        }
                        helperText={
                          errors.lenderFees?.Inputs?.[index]
                            ?.loanOriginationFeePercentage?.message
                        }
                        sx={{
                          maxWidth: {
                            xs: 76,   // mobile
                            sm: 85,  // tablet
                          },
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            paddingRight: "8.5px",
                            borderRadius: 2,
                            "& fieldset": {
                              borderColor: "#F6F6F6",
                            },
                            "&:hover fieldset": {
                              borderColor: "#F6F6F6",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#F6F6F6",
                            },
                            "& input::placeholder": {
                              color: "#9e9e9e",
                              opacity: 1,
                            },
                            "& input": {
                              padding: "8.5px 0 8.5px 8.5px", // adjust as needed
                            },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment
                              position="end"
                              sx={{ marginLeft: 0 }}
                            >
                              <span
                                style={{ fontWeight: "bold", color: "black" }}
                              >
                                %
                              </span>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                  <Controller
                    name={`lenderFees.Inputs.${index}.loanOriginationFee`}
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        value={field.value ?? ""}
                        placeholder="0"
                        disabled
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
                        thousandSeparator=","
                        allowNegative={false}
                        error={
                          !!errors.lenderFees?.Inputs?.[index]
                            ?.loanOriginationFee
                        }
                        helperText={
                          errors.lenderFees?.Inputs?.[index]?.loanOriginationFee
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
              </Box>
            </Grid>
            <Grid size={12}>
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
                  Discount Fee
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <Controller
                    name={`lenderFees.Inputs.${index}.discountFeePercentage`}
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
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        size="small"
                        error={
                          !!errors.lenderFees?.Inputs?.[index]
                            ?.discountFeePercentage
                        }
                        helperText={
                          errors.lenderFees?.Inputs?.[index]
                            ?.discountFeePercentage?.message
                        }
                        sx={{
                          maxWidth: {
                            xs: 76,   // mobile
                            sm: 85,  // tablet
                          },
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            paddingRight: "8.5px",
                            "& fieldset": {
                              borderColor: "#F6F6F6",
                            },
                            "&:hover fieldset": {
                              borderColor: "#F6F6F6",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#F6F6F6",
                            },
                            "& input::placeholder": {
                              color: "#9e9e9e",
                              opacity: 1,
                            },
                            "& input": {
                              padding: "8.5px 0 8.5px 8.5px", // adjust as needed
                            },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment
                              position="end"
                              sx={{ marginLeft: 0 }}
                            >
                              <span
                                style={{ fontWeight: "bold", color: "black" }}
                              >
                                %
                              </span>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                  <Controller
                    name={`lenderFees.Inputs.${index}.discountFee`}
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        value={field.value ?? ""}
                        placeholder="0"
                        disabled
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
                        thousandSeparator=","
                        allowNegative={false}
                        error={
                          !!errors.lenderFees?.Inputs?.[index]?.discountFee
                        }
                        helperText={
                          errors.lenderFees?.Inputs?.[index]?.discountFee
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
              </Box>
            </Grid>
            <Grid size={12}>
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
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    Upfront MIP
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (1.75% of PP)
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <Controller
                    name={`lenderFees.Inputs.${index}.upfrontMipPercentage`}
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
                        disabled={loanProgram === "3"}
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        size="small"
                        error={
                          !!errors.lenderFees?.Inputs?.[index]
                            ?.upfrontMipPercentage
                        }
                        helperText={
                          errors.lenderFees?.Inputs?.[index]
                            ?.upfrontMipPercentage?.message
                        }
                        sx={{
                          maxWidth: {
                            xs: 76,   // mobile
                            sm: 85,  // tablet
                          },
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            paddingRight: "8.5px",
                            "& fieldset": {
                              borderColor: "#F6F6F6",
                            },
                            "&:hover fieldset": {
                              borderColor: "#F6F6F6",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#F6F6F6",
                            },
                            "& input::placeholder": {
                              color: "#9e9e9e",
                              opacity: 1,
                            },
                            "& input": {
                              padding: "8.5px 0 8.5px 8.5px", // adjust as needed
                            },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment
                              position="end"
                              sx={{ marginLeft: 0 }}
                            >
                              <span
                                style={{ fontWeight: "bold", color: "black" }}
                              >
                                %
                              </span>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                  <Controller
                    name={`lenderFees.Inputs.${index}.upfrontMip`}
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        value={field.value ?? ""}
                        placeholder="0"
                        disabled
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
                        thousandSeparator=","
                        allowNegative={false}
                        error={!!errors.lenderFees?.Inputs?.[index]?.upfrontMip}
                        helperText={
                          errors.lenderFees?.Inputs?.[index]?.upfrontMip
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
              </Box>
            </Grid>
            <Grid size={12}>
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
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    Appraisal Fee
                  </Typography>
                </Box>
                <Controller
                  name={`lenderFees.Inputs.${index}.appraisalFee`}
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
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.Inputs?.[index]?.appraisalFee}
                      helperText={
                        errors.lenderFees?.Inputs?.[index]?.appraisalFee
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
            <Grid size={12}>
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
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    Escrow Fees
                  </Typography>
                </Box>
                <Controller
                  name={`lenderFees.Inputs.${index}.escrowFees`}
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
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.Inputs?.[index]?.escrowFees}
                      helperText={
                        errors.lenderFees?.Inputs?.[index]?.escrowFees?.message
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
            <Grid size={12}>
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
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    Title Fees
                  </Typography>
                </Box>
                <Controller
                  name={`lenderFees.Inputs.${index}.titleFees`}
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
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.Inputs?.[index]?.titleFees}
                      helperText={
                        errors.lenderFees?.Inputs?.[index]?.titleFees?.message
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
            <Grid size={12}>
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
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    3rd Party Lender Fee
                  </Typography>
                </Box>
                <Controller
                  name={`lenderFees.Inputs.${index}.thirdPartyLenderFee`}
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
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={
                        !!errors.lenderFees?.Inputs?.[index]
                          ?.thirdPartyLenderFee
                      }
                      helperText={
                        errors.lenderFees?.Inputs?.[index]?.thirdPartyLenderFee
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
        </Grid>
      </Grid>
    </Box>
  );
}
