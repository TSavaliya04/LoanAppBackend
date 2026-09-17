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
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import SVGs from "@/components/SVGs";
import { NumericFormat } from "react-number-format";

type PurchaseInfoFormProps = {
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
};

export default function PurchaseInfoForm({
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
}: PurchaseInfoFormProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

  const loanProgram =
    useWatch({ control, name: "borrowerInfo.loanProgram" }) ?? "0";

  const purchasePrice = useWatch({
    control,
    name: "purchaseInfo.purchasePrice",
  });

  const downPayment = useWatch({
    control,
    name: "purchaseInfo.downPayment",
  });

  const annualInterestRate = useWatch({
    control,
    name: "purchaseInfo.annualInterestRate",
  });

  const hazardInsurance = useWatch({
    control,
    name: "purchaseInfo.hazardInsurance",
  });

  useEffect(() => {
    if (purchasePrice > 0 && downPayment > 0) {
      const downPaymentAmount = (purchasePrice * downPayment) / 100;
      const loanAmount = purchasePrice - downPaymentAmount;

      let calcmiPercent = 0;
      if (loanProgram === "3") {
        calcmiPercent = Math.round((loanAmount * 0.55) / 100 / 12); // no decimals
      }

      setValue("purchaseInfo.miPercent", calcmiPercent);
      setValue("purchaseInfo.loanAmount", loanAmount);
    } else {
      setValue("purchaseInfo.loanAmount", null);
    }
    // setValue("loanProgram.price", purchasePrice);
    // setValue("loanProgram.interestRate", annualInterestRate);
    // setValue("loanProgram.downPaymentPercentage", downPayment);
  }, [loanProgram, purchasePrice, downPayment, annualInterestRate, setValue]);

  useEffect(() => {
    if (hazardInsurance > 0) {
      setValue("prepaidItems.hazardInsurance", hazardInsurance * 12);
      setValue("loanProgram.hazardInsurance", hazardInsurance);
    }
  }, [hazardInsurance, setValue]);

  return (
    <Box
      sx={{
        borderRadius: 4,
        backgroundColor: expanded ? "#fff" : "transparent",
        padding: expanded ? "15px" : "0px",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {expanded ? (
          <Typography fontWeight={600} color="primary">
            Purchase info
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
                Purchase info
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
            <Grid size={{ xs: 6 }}>
              <Controller
                name="purchaseInfo.purchasePrice"
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
                    error={!!errors.purchaseInfo?.purchasePrice}
                    helperText={errors.purchaseInfo?.purchasePrice?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="purchaseInfo.downPayment"
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
                    error={!!errors.purchaseInfo?.downPayment}
                    helperText={errors.purchaseInfo?.downPayment?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name="purchaseInfo.loanAmount"
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
                    error={!!errors.purchaseInfo?.loanAmount}
                    helperText={errors.purchaseInfo?.loanAmount?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="purchaseInfo.annualInterestRate"
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
                    error={!!errors.purchaseInfo?.annualInterestRate}
                    helperText={
                      errors.purchaseInfo?.annualInterestRate?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name="purchaseInfo.mipFundingFee"
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
                    label="MIP/funding Fee"
                    type="number"
                    inputMode="numeric"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    error={!!errors.purchaseInfo?.mipFundingFee}
                    helperText={errors.purchaseInfo?.mipFundingFee?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="purchaseInfo.hazardInsurance"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Hazard Insurance *"
                    value={field.value ?? ""}
                    onValueChange={(values) =>
                      field.onChange(
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={!!errors.purchaseInfo?.hazardInsurance}
                    helperText={errors.purchaseInfo?.hazardInsurance?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name="purchaseInfo.associationFee"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Association Fee *"
                    value={field.value ?? ""}
                    onValueChange={(values) =>
                      field.onChange(
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={!!errors.purchaseInfo?.associationFee}
                    helperText={errors.purchaseInfo?.associationFee?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="purchaseInfo.miPercent"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="MI *"
                    value={field.value ?? ""}
                    onValueChange={(values) =>
                      field.onChange(
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={!!errors.purchaseInfo?.miPercent}
                    helperText={errors.purchaseInfo?.miPercent?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
