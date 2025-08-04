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
import { usePreApprovalStore } from "@/store/usePreApprovalStore";

type PurchaseInfoFormProps = {
  expanded: boolean;
  onToggle: () => void;
};

export default function PurchaseInfoForm({
  expanded,
  onToggle,
}: PurchaseInfoFormProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

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

  const homeOwnerInsurance = useWatch({
    control,
    name: "purchaseInfo.homeOwnerInsurance",
  });

  const hazardInsurance = useWatch({
    control,
    name: "purchaseInfo.hazardInsurance",
  });

  const associationFee = useWatch({
    control,
    name: "purchaseInfo.associationFee",
  });

  // Assuming these are from Zustand store
  const { setAnnualInterestRate, setHomeOwnerInsurance, setHazardInsurance, setAssociationFee } =
    usePreApprovalStore();

  useEffect(() => {
    if (typeof annualInterestRate === "number") {
      setAnnualInterestRate(annualInterestRate);
    }
  }, [annualInterestRate, setAnnualInterestRate]);

  useEffect(() => {
    if (typeof homeOwnerInsurance === "number") {
      setHomeOwnerInsurance(homeOwnerInsurance);
    }
  }, [homeOwnerInsurance, setHomeOwnerInsurance]);

  useEffect(() => {
    if (typeof hazardInsurance === "number") {
      setHazardInsurance(hazardInsurance);
    }
  }, [hazardInsurance, setHazardInsurance]);

  useEffect(() => {
    if (typeof associationFee === "number") {
      setAssociationFee(associationFee);
    }
  }, [associationFee, setAssociationFee]);

  useEffect(() => {
    // if (typeof purchasePrice === "number" && typeof downPayment === "number") {
    if (purchasePrice > 0 && downPayment > 0) {
      const downPaymentAmount = (purchasePrice * downPayment) / 100;
      const loanAmount = purchasePrice - downPaymentAmount;
      setValue("purchaseInfo.loanAmount", loanAmount);
    } else {
      setValue("purchaseInfo.loanAmount", null);
    }
  }, [purchasePrice, downPayment, setValue]);

  return (
    <Box
      sx={{
        borderRadius: 4,
        backgroundColor: expanded ? "#fff" : "transparent",
        padding: expanded ? "15px" : "0px",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        onClick={onToggle}
        sx={{ cursor: "pointer" }}
      >
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
                  backgroundColor: "#7444F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <CheckIcon sx={{ color: "#fff" }} /> */}
                <SVGs name="Purchase_info_icon" />
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Purchase info
              </Typography>
            </Box>
            <IconButton size="small" sx={{ color: "black" }}>
              {/* <EditIcon fontSize="small" /> */}
              <SVGs name="Edit_icon" />
            </IconButton>
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
                    onValueChange={(values) => {
                      field.onChange(
                        values.floatValue === undefined
                          ? undefined
                          : values.floatValue
                      );
                    }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={!!errors.purchaseInfo?.purchasePrice}
                    helperText={errors.purchaseInfo?.purchasePrice?.message}
                  />
                )}
              />
              {/* <Controller
                name="purchaseInfo.purchasePrice"
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
                    label="Purchase Price *"
                    type="number"
                    error={!!errors.purchaseInfo?.purchasePrice}
                    helperText={errors.purchaseInfo?.purchasePrice?.message}
                  />
                )}
              /> */}
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
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                    value={field.value ?? ""}
                    fullWidth
                    label="Down Payment *"
                    type="number"
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
                    onValueChange={(values) => {
                      field.onChange(
                        values.floatValue === undefined
                          ? undefined
                          : values.floatValue
                      );
                    }}
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
                    label="Annual Int. rate *"
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      field.onChange(
                        values.floatValue === undefined
                          ? undefined
                          : values.floatValue
                      );
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
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
                name="purchaseInfo.homeOwnerInsurance"
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Home Owner Ins."
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      field.onChange(
                        values.floatValue === undefined
                          ? undefined
                          : values.floatValue
                      );
                    }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={!!errors.purchaseInfo?.homeOwnerInsurance}
                    helperText={
                      errors.purchaseInfo?.homeOwnerInsurance?.message
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
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                    value={field.value ?? ""}
                    fullWidth
                    label="MIP/funding Fee"
                    type="number"
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
                    onValueChange={(values) => {
                      field.onChange(
                        values.floatValue === undefined
                          ? undefined
                          : values.floatValue
                      );
                    }}
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
                    onValueChange={(values) => {
                      field.onChange(
                        values.floatValue === undefined
                          ? undefined
                          : values.floatValue
                      );
                    }}
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
                    label="MI"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
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
