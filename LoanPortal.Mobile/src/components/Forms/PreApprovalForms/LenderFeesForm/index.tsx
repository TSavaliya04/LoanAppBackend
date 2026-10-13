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
import SVGs from "@/components/SVGs";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
// import { useSessionStore } from "@/stores/SessionStore";
import { NumericFormat } from "react-number-format";
import { useEffect } from "react";

type LenderFeesFormProps = {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  handleFieldChange: (index: number) => void;
};

export default function LenderFeesForm({
  index,
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
  handleFieldChange,
}: LenderFeesFormProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

  const loanProgram =
    useWatch({
      control,
      name: `scenarios.${index}.purchaseInfo.loanProgram`,
    }) ?? 0;
  // const loanAmount =
  //   useWatch({ control, name: `scenarios.${index}.purchaseInfo.loanAmount` }) ?? 0;
  // const loanOriginationFee =
  //   useWatch({ control, name: `scenarios.${index}.lenderFees.loanOriginationFee` }) ?? 0;
  // const loanOriginationFeePercentage =
  //   useWatch({ control, name: `scenarios.${index}.lenderFees.loanOriginationFeePercentage` }) ?? 0;
  // const discountFee =
  //   useWatch({ control, name: `scenarios.${index}.lenderFees.discountFee` }) ?? 0;
  // const discountFeePercentage =
  //   useWatch({ control, name: `scenarios.${index}.lenderFees.discountFeePercentage` }) ?? 0;
  // // const upfrontMip = useWatch({ control, name: "lenderFees.upfrontMip" }) ?? 0;
  // const upfrontMipPercentage =
  //   useWatch({ control, name: `scenarios.${index}.lenderFees.upfrontMipPercentage` }) ?? 0;
  // const appraisalFee =
  //   useWatch({ control, name: `scenarios.${index}.lenderFees.appraisalFee` }) ?? 0;
  // const escrowFees = useWatch({ control, name: `scenarios.${index}.lenderFees.escrowFees` }) ?? 0;
  // const titleFees = useWatch({ control, name: `scenarios.${index}.lenderFees.titleFees` }) ?? 0;
  // const thirdPartyLenderFee =
  //   useWatch({
  //     control,
  //     name: `scenarios.${index}.lenderFees.thirdPartyLenderFee`,
  //   }) ?? 0;
  // const prepaidInterestAmount = useWatch({ control, name: `scenarios.${index}.prepaidItems.prepaidInterestAmount` }) ?? 0;
  // const hazardInsurance = useWatch({ control, name: `scenarios.${index}.prepaidItems.hazardInsurance` }) ?? 0;
  // const hazardInsuranceReserves = useWatch({ control, name: `scenarios.${index}.prepaidItems.hazardInsuranceReserves` }) ?? 0;
  // const propertyTaxAmount = useWatch({ control, name: `scenarios.${index}.prepaidItems.propertyTaxAmount` }) ?? 0;

  // useEffect(() => {
  //   if (loanAmount > 0) {
  //     const loanOriginationFee = Math.round(
  //       (loanOriginationFeePercentage / 100) * loanAmount
  //     );
  //     const discountFee = Math.round(
  //       (discountFeePercentage / 100) * loanAmount
  //     );
  //     const upfrontMip = Math.round((upfrontMipPercentage / 100) * loanAmount);

  //     setValue(`scenarios.${index}.lenderFees.loanOriginationFee`, loanOriginationFee);
  //     setValue(`scenarios.${index}.lenderFees.discountFee`, discountFee);
  //     setValue(`scenarios.${index}.lenderFees.upfrontMip`, upfrontMip);
  //   }
  // }, [
  //   loanAmount,
  //   loanOriginationFeePercentage,
  //   discountFeePercentage,
  //   upfrontMipPercentage,
  //   setValue,
  // ]);

  // useEffect(() => {
  //   const closingCosts =
  //     loanOriginationFee +
  //     discountFee +
  //     // upfrontMip +
  //     appraisalFee +
  //     prepaidInterestAmount +
  //     hazardInsurance +
  //     hazardInsuranceReserves +
  //     propertyTaxAmount +
  //     escrowFees +
  //     titleFees +
  //     thirdPartyLenderFee;
  //     // console.log("============================");
  //     // console.log("loanOriginationFee =>", loanOriginationFee);
  //     // console.log("discountFee =>", discountFee);
  //     // console.log("appraisalFee =>", appraisalFee);
  //     // console.log("prepaidInterestAmount =>", prepaidInterestAmount);
  //     // console.log("hazardInsurance =>", hazardInsurance);
  //     // console.log("hazardInsuranceReserves =>", hazardInsuranceReserves);
  //     // console.log("propertyTaxAmount =>", propertyTaxAmount);
  //     // console.log("escrowFees =>", escrowFees);
  //     // console.log("titleFees =>", titleFees);
  //     // console.log("thirdPartyLenderFee =>", thirdPartyLenderFee);

  //     // console.log("closingCosts =>",closingCosts);

  //     setValue(`scenarios.${index}.loanProgram.clearingCart`, Math.round(closingCosts));
  // }, [
  //   loanOriginationFee,
  //   discountFee,
  //   // upfrontMip,
  //   appraisalFee,
  //   prepaidInterestAmount,
  //   hazardInsurance,
  //   hazardInsuranceReserves,
  //   propertyTaxAmount,
  //   escrowFees,
  //   titleFees,
  //   thirdPartyLenderFee,
  //   setValue,
  // ]);

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
            Lender Fees
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
                  <SVGs name="Lender_fees_icon" />
                ) : (
                  <SVGs name="Lender_fees_icon" />
                )}
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Lender Fees
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

      {/* Collapsible Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Agent Name Full Width */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name={`scenarios.${index}.lenderFees.agentName`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Agent Name *"
                    error={!!errors.scenarios?.[index]?.lenderFees?.agentName}
                    helperText={
                      errors.scenarios?.[index]?.lenderFees?.agentName?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Loan Orig. Fee
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <Controller
                    name={`scenarios.${index}.lenderFees.loanOriginationFeePercentage`}
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
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        size="small"
                        error={
                          !!errors.scenarios?.[index]?.lenderFees
                            ?.loanOriginationFeePercentage
                        }
                        helperText={
                          errors.scenarios?.[index]?.lenderFees
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
                        inputProps={{
                          step: 0.01
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
                    name={`scenarios.${index}.lenderFees.loanOriginationFee`}
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
                          !!errors.scenarios?.[index]?.lenderFees
                            ?.loanOriginationFee
                        }
                        helperText={
                          errors.scenarios?.[index]?.lenderFees
                            ?.loanOriginationFee?.message
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Discount Fee
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <Controller
                    name={`scenarios.${index}.lenderFees.discountFeePercentage`}
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
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        size="small"
                        error={
                          !!errors.scenarios?.[index]?.lenderFees
                            ?.discountFeePercentage
                        }
                        helperText={
                          errors.scenarios?.[index]?.lenderFees
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
                        inputProps={{
                          step: 0.01
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
                    name={`scenarios.${index}.lenderFees.discountFee`}
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
                          !!errors.scenarios?.[index]?.lenderFees?.discountFee
                        }
                        helperText={
                          errors.scenarios?.[index]?.lenderFees?.discountFee
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
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
                    name={`scenarios.${index}.lenderFees.upfrontMipPercentage`}
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
                        disabled={loanProgram === "3"}
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        size="small"
                        error={
                          !!errors.scenarios?.[index]?.lenderFees
                            ?.upfrontMipPercentage
                        }
                        helperText={
                          errors.scenarios?.[index]?.lenderFees
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
                        inputProps={{
                          step: 0.01
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
                    name={`scenarios.${index}.lenderFees.upfrontMip`}
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
                          !!errors.scenarios?.[index]?.lenderFees?.upfrontMip
                        }
                        helperText={
                          errors.scenarios?.[index]?.lenderFees?.upfrontMip
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    Appraisal Fee
                  </Typography>
                </Box>
                <Controller
                  name={`scenarios.${index}.lenderFees.appraisalFee`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
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
                        !!errors.scenarios?.[index]?.lenderFees?.appraisalFee
                      }
                      helperText={
                        errors.scenarios?.[index]?.lenderFees?.appraisalFee
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    Escrow Fees
                  </Typography>
                </Box>
                <Controller
                  name={`scenarios.${index}.lenderFees.escrowFees`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
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
                        !!errors.scenarios?.[index]?.lenderFees?.escrowFees
                      }
                      helperText={
                        errors.scenarios?.[index]?.lenderFees?.escrowFees
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    Title Fees
                  </Typography>
                </Box>
                <Controller
                  name={`scenarios.${index}.lenderFees.titleFees`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
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
                      error={!!errors.scenarios?.[index]?.lenderFees?.titleFees}
                      helperText={
                        errors.scenarios?.[index]?.lenderFees?.titleFees
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                    3rd Party Lender Fee
                  </Typography>
                </Box>
                <Controller
                  name={`scenarios.${index}.lenderFees.thirdPartyLenderFee`}
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
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
                        !!errors.scenarios?.[index]?.lenderFees
                          ?.thirdPartyLenderFee
                      }
                      helperText={
                        errors.scenarios?.[index]?.lenderFees
                          ?.thirdPartyLenderFee?.message
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
