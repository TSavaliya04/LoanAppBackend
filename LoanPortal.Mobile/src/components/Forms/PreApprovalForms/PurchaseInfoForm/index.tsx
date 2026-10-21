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
  Autocomplete,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import SVGs from "@/components/SVGs";
import { NumericFormat } from "react-number-format";

type PurchaseInfoFormProps = {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  handleFieldChange: (index: number) => void;
  initialCounty?: { id: string; county: string };
};

export default function PurchaseInfoForm({
  index,
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
  handleFieldChange,
  initialCounty,
}: PurchaseInfoFormProps) {
  const {
    control,
    setValue,
    // getValues,
    formState: { errors, dirtyFields },
  } = useFormContext<CombinedPreApprovalFormData>();

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
  // ────────────────────────────────────────────────────────────────────

  const loanProgram =
    useWatch({
      control,
      name: `scenarios.${index}.purchaseInfo.loanProgram`,
    }) ?? "0";

  // Watch all 6 trigger fields for loan-limit validation
  const watchedPropertyType = useWatch({
    control,
    name: `scenarios.${index}.purchaseInfo.propertyType`,
  });
  const watchedCountyId = useWatch({
    control,
    name: `scenarios.${index}.purchaseInfo.countyID`,
  });
  const watchedPurchasePrice = useWatch({
    control,
    name: `scenarios.${index}.purchaseInfo.purchasePrice`,
  });
  const watchedDownPayment = useWatch({
    control,
    name: `scenarios.${index}.purchaseInfo.downPayment`,
  });
  const watchedLoanAmount = useWatch({
    control,
    name: `scenarios.${index}.purchaseInfo.loanAmount`,
  });

  // ── Loan limit state ─────────────────────────────────────────────────
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
    watchedPurchasePrice,
    watchedDownPayment,
    watchedLoanAmount,
  ]);

  const loanAmountExceedsLimit =
    countyLoanLimit !== null &&
    typeof watchedLoanAmount === "number" &&
    watchedLoanAmount > countyLoanLimit;

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
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.loanProgram`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : String(e.target.value);
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    fullWidth
                    select
                    label="Loan Program *"
                    error={
                      !!errors.scenarios?.[index]?.purchaseInfo?.loanProgram
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.loanProgram
                        ?.message
                    }
                  >
                    <MenuItem value="1">Non QM</MenuItem>
                    <MenuItem value="2">Conventional</MenuItem>
                    <MenuItem value="3">FHA</MenuItem>
                    <MenuItem value="4">VA</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.propertyType`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Property Type *"
                    error={
                      !!errors.scenarios?.[index]?.purchaseInfo?.propertyType
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.propertyType
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

            {/* County searchable select — only visible for FHA (loanProgram = 3) */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: loanProgram === "3" ? "block" : "none" }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.countyID`}
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
                          error={!!errors.scenarios?.[index]?.purchaseInfo?.countyID}
                          helperText={
                            errors.scenarios?.[index]?.purchaseInfo?.countyID?.message
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
                name={`scenarios.${0}.purchaseInfo.occupancyStatus`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : String(e.target.value);
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    fullWidth
                    select
                    label="Occupancy Status *"
                    error={
                      !!errors.scenarios?.[0]?.purchaseInfo?.occupancyStatus
                    }
                    helperText={
                      errors.scenarios?.[0]?.purchaseInfo?.occupancyStatus
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
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.purchasePrice`}
                control={control}
                render={({ field }) => (
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Purchase Price *"
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
                      !!errors.scenarios?.[index]?.purchaseInfo?.purchasePrice
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.purchasePrice
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
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
                    inputProps={{
                      step: 0.01
                    }}
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
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.loanAmount`}
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
                      !!errors.scenarios?.[index]?.purchaseInfo?.loanAmount
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.loanAmount
                        ?.message
                    }
                  />
                )}
              />
              {loanAmountExceedsLimit && countyLoanLimit !== null && (
                <Alert
                  severity="warning"
                  sx={{ mt: 1, fontSize: "0.78rem", py: 0.5 }}
                >
                  Loan amount exceeds the county loan limit of{" "}
                  <strong>
                    ${countyLoanLimit.toLocaleString()}
                  </strong>{" "}
                  for the selected county.
                </Alert>
              )}
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.annualInterestRate`}
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
                    label="Interest Rate *"
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
                      !!errors.scenarios?.[index]?.purchaseInfo
                        ?.annualInterestRate
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo
                        ?.annualInterestRate?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.mipFundingFee`}
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
                      !!errors.scenarios?.[index]?.purchaseInfo?.mipFundingFee
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.mipFundingFee
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.hazardInsurance`}
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
                      !!errors.scenarios?.[index]?.purchaseInfo?.hazardInsurance
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.hazardInsurance
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.associationFee`}
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
                      !!errors.scenarios?.[index]?.purchaseInfo?.associationFee
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.associationFee
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.miPercent`}
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
                    error={!!errors.scenarios?.[index]?.purchaseInfo?.miPercent}
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.miPercent
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.monthlyPropertyTaxPercentage`}
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
                    label="Property Tax Percentage*"
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
                      !!errors.scenarios?.[index]?.purchaseInfo
                        ?.monthlyPropertyTaxPercentage
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo
                        ?.monthlyPropertyTaxPercentage?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name={`scenarios.${index}.purchaseInfo.monthlyPropertyTax`}
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
                    disabled
                    label="Property Tax"
                    type="number"
                    inputMode="numeric"
                    inputProps={{
                      step: 0.01
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">$</InputAdornment>
                      ),
                    }}
                    error={
                      !!errors.scenarios?.[index]?.purchaseInfo?.monthlyPropertyTax
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.monthlyPropertyTax
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
