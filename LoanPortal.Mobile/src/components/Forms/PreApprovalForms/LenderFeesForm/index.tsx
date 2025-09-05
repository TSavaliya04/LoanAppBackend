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
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
};

export default function LenderFeesForm({
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
}: LenderFeesFormProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

  const loanAmount =
    useWatch({ control, name: "purchaseInfo.loanAmount" }) ?? 0;
  const loanOriginationFee =
    useWatch({ control, name: "lenderFees.loanOriginationFee" }) ?? 0;
  const loanOriginationFeePercentage =
    useWatch({ control, name: "lenderFees.loanOriginationFeePercentage" }) ?? 0;
  const discountFee =
    useWatch({ control, name: "lenderFees.discountFee" }) ?? 0;
  const discountFeePercentage =
    useWatch({ control, name: "lenderFees.discountFeePercentage" }) ?? 0;
  const upfrontMip = useWatch({ control, name: "lenderFees.upfrontMip" }) ?? 0;
  const upfrontMipPercentage =
    useWatch({ control, name: "lenderFees.upfrontMipPercentage" }) ?? 0;
  const appraisalFee =
    useWatch({ control, name: "lenderFees.appraisalFee" }) ?? 0;
  const escrowFees = useWatch({ control, name: "lenderFees.escrowFees" }) ?? 0;
  const titleFees = useWatch({ control, name: "lenderFees.titleFees" }) ?? 0;
  const thirdPartyLenderFee =
    useWatch({
      control,
      name: "lenderFees.thirdPartyLenderFee",
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

      setValue("lenderFees.loanOriginationFee", loanOriginationFee);
      setValue("lenderFees.discountFee", discountFee);
      setValue("lenderFees.upfrontMip", upfrontMip);
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
      upfrontMip +
      appraisalFee +
      escrowFees +
      titleFees +
      thirdPartyLenderFee;
      setValue("loanProgram.clearingCart", Math.round(closingCosts));
  }, [
    loanOriginationFee,
    discountFee,
    upfrontMip,
    appraisalFee,
    escrowFees,
    titleFees,
    thirdPartyLenderFee,
    setValue,
  ]);

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
          <Grid container>
            {/* Agent Name Full Width */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="lenderFees.agentName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Agent Name *"
                    error={!!errors.lenderFees?.agentName}
                    helperText={errors.lenderFees?.agentName?.message}
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
                    name="lenderFees.loanOriginationFeePercentage"
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
                          !!errors.lenderFees?.loanOriginationFeePercentage
                        }
                        helperText={
                          errors.lenderFees?.loanOriginationFeePercentage
                            ?.message
                        }
                        sx={{
                          maxWidth: 76,
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
                    name="lenderFees.loanOriginationFee"
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
                        error={!!errors.lenderFees?.loanOriginationFee}
                        helperText={
                          errors.lenderFees?.loanOriginationFee?.message
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
                    name="lenderFees.discountFeePercentage"
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
                        error={!!errors.lenderFees?.discountFeePercentage}
                        helperText={
                          errors.lenderFees?.discountFeePercentage?.message
                        }
                        sx={{
                          maxWidth: 76,
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
                    name="lenderFees.discountFee"
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
                        error={!!errors.lenderFees?.discountFee}
                        helperText={errors.lenderFees?.discountFee?.message}
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
                    name="lenderFees.upfrontMipPercentage"
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
                        error={!!errors.lenderFees?.upfrontMipPercentage}
                        helperText={
                          errors.lenderFees?.upfrontMipPercentage?.message
                        }
                        sx={{
                          maxWidth: 76,
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
                    name="lenderFees.upfrontMip"
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
                        error={!!errors.lenderFees?.upfrontMip}
                        helperText={errors.lenderFees?.upfrontMip?.message}
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
                  name="lenderFees.appraisalFee"
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
                      error={!!errors.lenderFees?.appraisalFee}
                      helperText={errors.lenderFees?.appraisalFee?.message}
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
                  name="lenderFees.escrowFees"
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
                      error={!!errors.lenderFees?.escrowFees}
                      helperText={errors.lenderFees?.escrowFees?.message}
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
                  name="lenderFees.titleFees"
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
                      error={!!errors.lenderFees?.titleFees}
                      helperText={errors.lenderFees?.titleFees?.message}
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
                  name="lenderFees.thirdPartyLenderFee"
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
                      error={!!errors.lenderFees?.thirdPartyLenderFee}
                      helperText={
                        errors.lenderFees?.thirdPartyLenderFee?.message
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
