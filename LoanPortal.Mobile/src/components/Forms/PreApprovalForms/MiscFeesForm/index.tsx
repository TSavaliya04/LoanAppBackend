"use client";

import {
  Box,
  Grid,
  TextField,
  Typography,
  Collapse,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SVGs from "@/components/SVGs";
import { Controller, useFormContext } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import { NumericFormat } from "react-number-format";

type MiscFeesFormProps = {
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
};

export default function MiscFeesForm({
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
}: MiscFeesFormProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

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
            Misc Fees
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
                  <SVGs name="Misc_fees_icon" />
                ) : (
                  <SVGs name="Misc_fees_icon" />
                )}
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Misc Fees
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
          <Grid container spacing={0}>
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
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>Misc Fee 1</Typography>
                <Controller
                  name="miscFees.miscFee1"
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
                      error={!!errors.miscFees?.miscFee1}
                      helperText={errors.miscFees?.miscFee1?.message}
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
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>Misc Fee 2</Typography>
                <Controller
                  name="miscFees.miscFee2"
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
                      error={!!errors.miscFees?.miscFee2}
                      helperText={errors.miscFees?.miscFee2?.message}
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
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>Misc Fee 3</Typography>
                <Controller
                  name="miscFees.miscFee3"
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
                      error={!!errors.miscFees?.miscFee3}
                      helperText={errors.miscFees?.miscFee3?.message}
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
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>Misc Fee 4</Typography>
                <Controller
                  name="miscFees.miscFee4"
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
                      error={!!errors.miscFees?.miscFee4}
                      helperText={errors.miscFees?.miscFee4?.message}
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
