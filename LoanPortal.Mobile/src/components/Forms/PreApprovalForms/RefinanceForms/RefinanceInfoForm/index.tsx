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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Alert,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useRef, useState } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import SVGs from "@/components/SVGs";
import { NumericFormat } from "react-number-format";
import { CombinedRefinancePreApprovalFormData } from "@/api/models/refinance/combinedPreApprovalSchema";

type RefinanceRefinanceInfoFormProps = {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  handleFieldChange: (index: number) => void;
  initialCounty?: { id: string; county: string };
};

export default function RefinanceRefinanceInfoForm({
  index,
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
  handleFieldChange,
  initialCounty,
}: RefinanceRefinanceInfoFormProps) {
  const {
    control,
    setValue,
    // getValues,
    formState: { errors, dirtyFields },
  } = useFormContext<CombinedRefinancePreApprovalFormData>();

  // ── County state ─────────────────────────────────────────────────────
  type CountyOption = { id: string; county: string };
  const [allCounties, setAllCounties] = useState<CountyOption[]>([]);
  const [countyInputValue, setCountyInputValue] = useState("");
  const [countyLoading, setCountyLoading] = useState(false);

  // Fetch all counties once on mount
  useEffect(() => {
    let cancelled = false;
    const fetchCounties = async () => {
      setCountyLoading(true);
      try {
        const guardedInstance = (await import("@/api/instances/guardedInstance")).default;
        const res = await guardedInstance.get("countyloanlimit/GetAllCounties");
        if (!cancelled && res.data?.success) {
          setAllCounties(res.data.data ?? []);
        }
      } catch {
        if (!cancelled) setAllCounties([]);
      } finally {
        if (!cancelled) setCountyLoading(false);
      }
    };
    fetchCounties();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed input value from initialCounty so the saved county name is shown
  useEffect(() => {
    if (initialCounty?.county) {
      setCountyInputValue(initialCounty.county);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ─────────────────────────────────────────────────────────────────────

  const loanProgram =
    useWatch({
      control,
      name: `scenarios.${index}.loanStructure.loanProgram`,
    }) ?? "0";

  const refinanceType =
    useWatch({
      control,
      name: `scenarios.${index}.refinanceInfo.refinanceType`,
    }) ?? "0";

  const lienPosition =
    useWatch({
      control,
      name: `scenarios.${index}.loanStructure.lienPosition`,
    }) ?? "";

  const maxAllowed =
    useWatch({
      control,
      name: `scenarios.${index}.refinanceInfo.maxAllowed`,
    }) ?? "0";

  const baseLoanAmount =
    useWatch({
      control,
      name: `scenarios.${index}.loanProgram.baseLoanAmount`,
    }) ?? 0;

  const estimatedPropertyValue =
    useWatch({
      control,
      name: `scenarios.${index}.refinanceInfo.estimatedPropertyValue`,
    }) ?? 0;

  const currentLoanBalance =
    useWatch({
      control,
      name: `scenarios.${index}.refinanceInfo.currentLoanBalance`,
    }) ?? 0;

  const ltvPercent =
    estimatedPropertyValue > 0
      ? ((Number(currentLoanBalance) / estimatedPropertyValue) * 100).toFixed(2)
      : "0.00";

  const cltvPercent =
    estimatedPropertyValue > 0
      ? (((Number(currentLoanBalance) + baseLoanAmount) / estimatedPropertyValue) * 100).toFixed(2)
      : "0.00";

  const isHelocOrHeLoan = loanProgram === "5" || loanProgram === "6";
  const isSecondLien = lienPosition === "2";

  // Watch the remaining trigger fields for loan-limit validation
  const watchedCountyId = useWatch({
    control,
    name: `scenarios.${index}.refinanceInfo.countyID`,
  });
  const watchedPropertyType = useWatch({
    control,
    name: `scenarios.${index}.refinanceInfo.propertyType`,
  });
  const watchedLtv = useWatch({
    control,
    name: `scenarios.${index}.refinanceInfo.ltv`,
  });
  const watchedLoanAmount = useWatch({
    control,
    name: `scenarios.${index}.refinanceInfo.loanAmount`,
  });

  // ── County loan limit state ───────────────────────────────────────────────
  const [countyLoanLimit, setCountyLoanLimit] = useState<number | null>(null);
  const loanLimitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only relevant when loanProgram is FHA (3)
    if (loanProgram !== "3" || !watchedCountyId || !watchedPropertyType) {
      setCountyLoanLimit(null);
      return;
    }

    if (loanLimitDebounceRef.current) clearTimeout(loanLimitDebounceRef.current);
    loanLimitDebounceRef.current = setTimeout(async () => {
      try {
        const guardedInstance = (await import("@/api/instances/guardedInstance")).default;
        const res = await guardedInstance.get(
          `countyloanlimit/GetLoanLimit?countyId=${encodeURIComponent(watchedCountyId)}&propertyType=${watchedPropertyType}`
        );
        if (res.data?.success) {
          setCountyLoanLimit(res.data.data ?? null);
        } else {
          setCountyLoanLimit(null);
        }
      } catch {
        setCountyLoanLimit(null);
      }
    }, 400);

    return () => {
      if (loanLimitDebounceRef.current) clearTimeout(loanLimitDebounceRef.current);
    };
  }, [
    loanProgram,
    watchedCountyId,
    watchedPropertyType,
    estimatedPropertyValue,
    watchedLtv,
    watchedLoanAmount,
  ]);

  const loanAmountExceedsLimit =
    countyLoanLimit !== null &&
    typeof watchedLoanAmount === "number" &&
    watchedLoanAmount > countyLoanLimit;

  // Auto-select "Cash Out" and lock it when loanProgram is HELOC (5) or HE Loan (6)
  useEffect(() => {
    if (isHelocOrHeLoan) {
      setValue(`scenarios.${index}.refinanceInfo.refinanceType`, "2", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [isHelocOrHeLoan, index, setValue]);

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
            Refinance info
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
                Refinance info
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

            {/* County searchable select — only visible for FHA (loanProgram = 3) */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: loanProgram === "3" ? "block" : "none" }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.countyID`}
                control={control}
                render={({ field }) => {
                  const selectedOption =
                    allCounties.find((o) => o.id === field.value) ??
                    (field.value ? { id: field.value, county: field.value } : null);
                  return (
                    <Autocomplete<CountyOption, false, false, false>
                      options={allCounties}
                      getOptionLabel={(o) => o.county}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      value={selectedOption}
                      inputValue={countyInputValue}
                      onInputChange={(_, val) => setCountyInputValue(val)}
                      onChange={(_, selected) => {
                        field.onChange(selected ? selected.id : "");
                        handleFieldChange(index);
                      }}
                      loading={countyLoading}
                      filterOptions={(options, state) =>
                        options.filter((o) =>
                          o.county
                            .toLowerCase()
                            .includes(state.inputValue.toLowerCase())
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="County"
                          error={!!errors.scenarios?.[index]?.refinanceInfo?.countyID}
                          helperText={
                            errors.scenarios?.[index]?.refinanceInfo?.countyID?.message
                          }
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {countyLoading && (
                                  <CircularProgress color="inherit" size={16} />
                                )}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.propertyType`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Property Type *"
                    error={
                      !!errors.scenarios?.[index]?.refinanceInfo?.propertyType
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.propertyType
                        ?.message
                    }
                  >
                    <MenuItem value="1">SFR</MenuItem>
                    <MenuItem value="2">Duplex</MenuItem>
                    <MenuItem value="3">Tri-plex</MenuItem>
                    <MenuItem value="4">Four-plex</MenuItem>
                    <MenuItem value="5">Condo/Townhome</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.occupancyStatus`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Occupancy Status *"
                    error={
                      !!errors.scenarios?.[index]?.refinanceInfo?.occupancyStatus
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.occupancyStatus
                        ?.message
                    }
                  >
                    <MenuItem value="1">Owner Occupied</MenuItem>
                    <MenuItem value="2">2nd Home</MenuItem>
                    <MenuItem value="3">Investment</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 8, md: 4 }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.estimatedPropertyValue`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Estimated Property Value *"
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
                      !!errors.scenarios?.[index]?.refinanceInfo?.estimatedPropertyValue
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.estimatedPropertyValue
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 4, md: 2 }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.ltv`}
                control={control}
                render={({ field }) => {
                  const isHigh = Number(field.value) > 80;

                  return (
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
                      label="LTV *"
                      type="number"
                      inputMode="numeric"
                      inputProps={{
                        step: 0.01
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                      error={!!errors.scenarios?.[index]?.refinanceInfo?.ltv}
                      helperText={
                        errors.scenarios?.[index]?.refinanceInfo?.ltv?.message
                      }
                      sx={{
                        // Input text
                        "& .MuiInputBase-input": {
                          color: isHigh ? "red" : "inherit",
                        },

                        // Label
                        "& .MuiInputLabel-root": {
                          color: isHigh ? "red" : undefined,
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: isHigh ? "red" : undefined,
                        },

                        // Border (default)
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: isHigh ? "red" : undefined,
                        },

                        // Border (hover)
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: isHigh ? "red" : undefined,
                        },

                        // Border (focused)
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: isHigh ? "red" : undefined,
                        },
                      }}
                    />
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.loanAmount`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Loan Amount *"
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      const value =
                        values.floatValue === undefined
                          ? ""
                          : values.floatValue;
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={
                      !!errors.scenarios?.[index]?.refinanceInfo?.loanAmount
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.loanAmount
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            {loanAmountExceedsLimit && countyLoanLimit !== null && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="warning" sx={{ fontSize: "0.78rem", py: 0.5 }}>
                  Loan amount exceeds the county loan limit of{" "}
                  <strong>${countyLoanLimit.toLocaleString()}</strong>{" "}
                  for the selected county.
                </Alert>
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.currentLoanBalance`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Current Loan Balance"
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      const value =
                        values.floatValue === undefined
                          ? ""
                          : values.floatValue;
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    thousandSeparator=","
                    allowNegative={false}
                  />
                )}
              />
            </Grid>

            {/* ── HELOC-only section (loanProgram = 5) ── */}
            {loanProgram === "5" && (
              <>
                {/* Info note */}
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      backgroundColor: "#f0ebff",
                      border: "1px solid #d4c5fc",
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <SVGs name="Purchase_info_icon" />
                    <Typography variant="body2" color="text.secondary">
                      A HELOC is a revolving line of credit. Enter the total
                      credit limit and the current amount drawn.
                    </Typography>
                  </Box>
                </Grid>

                {/* Credit Limit */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name={`scenarios.${index}.refinanceInfo.creditLimit`}
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        disabled
                        label="Credit Limit *"
                        value={field.value ?? ""}
                        onValueChange={(values) => {
                          field.onChange(
                            values.floatValue === undefined
                              ? undefined
                              : values.floatValue
                          );
                          handleFieldChange(index);
                        }}
                        inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                        thousandSeparator=","
                        allowNegative={false}
                        error={
                          !!errors.scenarios?.[index]?.refinanceInfo?.creditLimit
                        }
                        helperText={
                          errors.scenarios?.[index]?.refinanceInfo?.creditLimit
                            ?.message
                        }
                      />
                    )}
                  />
                </Grid>

                {/* Current Draw Amount */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name={`scenarios.${index}.refinanceInfo.currentDrawAmount`}
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        label="Current Draw Amount *"
                        value={field.value ?? ""}
                        onValueChange={(values) => {
                          field.onChange(
                            values.floatValue === undefined
                              ? undefined
                              : values.floatValue
                          );
                          handleFieldChange(index);
                        }}
                        inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                        thousandSeparator=","
                        allowNegative={false}
                        error={
                          !!errors.scenarios?.[index]?.refinanceInfo
                            ?.currentDrawAmount
                        }
                        helperText={
                          errors.scenarios?.[index]?.refinanceInfo
                            ?.currentDrawAmount?.message
                        }
                      />
                    )}
                  />
                </Grid>

                {/* Amber payment note */}
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      backgroundColor: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <SVGs name="Bulb_icon" />
                    <Typography variant="body2" color="text.secondary">
                      Payments will be based on the current draw amount during
                      the draw period.
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}

            {/* LTV and CLTV boxes */}
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2}>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      p: 2,
                      height: "100%",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                      <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                        Current LTV
                      </Typography>
                      <SVGs name="Purchase_info_icon" />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#7444F5",
                        mb: 1.5,
                      }}
                    >
                      {ltvPercent}%
                    </Typography>
                    <Box sx={{ borderTop: "1px solid #e0e0e0", pt: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                        New HE Loan / Property Value
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5} flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary">
                          ${Number(currentLoanBalance).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">/</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${Number(estimatedPropertyValue).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        (New lien amount)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      p: 2,
                      height: "100%",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                      <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                        CLTV (Combined Loan-to-Value)
                      </Typography>
                      <SVGs name="Purchase_info_icon" />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: Number(cltvPercent) > 100 ? "red" : "#7444F5",
                        mb: 1.5,
                      }}
                    >
                      {cltvPercent}%
                    </Typography>
                    <Box sx={{ borderTop: "1px solid #e0e0e0", pt: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                        (First Mortgage + New HE Loan) / Property Value
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5} flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary">
                          (${Number(baseLoanAmount).toLocaleString()}+${Number(currentLoanBalance).toLocaleString()})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">/</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${Number(estimatedPropertyValue).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        (Combined liens)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>


            <Grid size={{ xs: 12 }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.refinanceType`}
                control={control}
                render={({ field }) => (
                  <FormControl
                    error={
                      !!errors.scenarios?.[index]?.refinanceInfo?.refinanceType
                    }
                  >
                    <FormLabel>Refinance Type *</FormLabel>
                    <RadioGroup
                      {...field}
                      row
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        handleFieldChange(index);
                      }}
                    >
                      {!isHelocOrHeLoan && (
                        <FormControlLabel
                          value="1"
                          control={<Radio />}
                          label="Rate and Term"
                        />
                      )}
                      <FormControlLabel
                        value="2"
                        control={<Radio />}
                        label="Cash Out"
                      />
                    </RadioGroup>
                    <FormHelperText>
                      {errors.scenarios?.[index]?.refinanceInfo?.refinanceType
                        ?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
              {/* {refinanceType === "2" && (
                <>
                  <Typography color="orange">
                    Suggested Max Allowed: ${maxAllowed}
                  </Typography>

                </>
              )} */}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ display: refinanceType === "2" && !isHelocOrHeLoan ? "block" : "none" }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.desiredCashOut`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Desired Cash Out"
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      field.onChange(
                        values.floatValue === undefined ? undefined : values.floatValue
                      );
                      handleFieldChange(index);
                    }}
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={!!errors.scenarios?.[index]?.refinanceInfo?.desiredCashOut}
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.desiredCashOut
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 6 }} sx={{ display: "none" }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.maxAllowed`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Max Allowed"
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
                    error={!!errors.scenarios?.[index]?.refinanceInfo?.maxAllowed}
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.maxAllowed
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.interestRate`}
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
                    label="Int. Rate"
                    type="number"
                    inputMode="numeric"
                    inputProps={{
                      step: 0.01
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    error={
                      !!errors.scenarios?.[index]?.refinanceInfo
                        ?.interestRate
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo
                        ?.interestRate?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }} sx={{ display: isHelocOrHeLoan ? "none" : undefined }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.monthlyTaxAmount`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Monthly Tax Amount"
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
                      !!errors.scenarios?.[index]?.refinanceInfo?.monthlyTaxAmount
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.monthlyTaxAmount
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }} sx={{ display: isHelocOrHeLoan ? "none" : undefined }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.annualTaxAmount`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Annual Tax Amount"
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
                      !!errors.scenarios?.[index]?.refinanceInfo?.annualTaxAmount
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.annualTaxAmount
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }} sx={{ display: isHelocOrHeLoan ? "none" : undefined }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.mipRate`}
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
                    disabled={loanProgram == "3"}
                    label="MIP Rate"
                    type="number"
                    inputMode="numeric"
                    inputProps={{
                      step: 0.01
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    error={
                      !!errors.scenarios?.[index]?.refinanceInfo?.mipRate
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.mipRate
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }} sx={{ display: isHelocOrHeLoan ? "none" : undefined }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.hazardInsurance`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Hazard Insurance"
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
                      !!errors.scenarios?.[index]?.refinanceInfo?.hazardInsurance
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.hazardInsurance
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }} sx={{ display: isHelocOrHeLoan ? "none" : undefined }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.associationFee`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Association Fee"
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
                      !!errors.scenarios?.[index]?.refinanceInfo?.associationFee
                    }
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.associationFee
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }} sx={{ display: isHelocOrHeLoan ? "none" : undefined }}>
              <Controller
                name={`scenarios.${index}.refinanceInfo.mi`}
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
                    error={!!errors.scenarios?.[index]?.refinanceInfo?.mi}
                    helperText={
                      errors.scenarios?.[index]?.refinanceInfo?.mi
                        ?.message
                    }
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
