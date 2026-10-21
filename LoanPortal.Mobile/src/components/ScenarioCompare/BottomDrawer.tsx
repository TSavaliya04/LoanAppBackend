import { getMetrics } from "@/lib/mortgage";
import { tabConfig, type Borrower, type DraftState, type Scenario, type TabId, type BorrowerData } from "@/lib/scenario-data";
import { Field, ReadOnlyField } from "../ScenarioCompare/Field";
import { Paper, Box, Typography, Button, IconButton, Switch, Grid, TextField, MenuItem, FormGroup, FormControlLabel, InputAdornment, styled, Select } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Delete } from "@mui/icons-material";
import { NumericFormat } from "react-number-format";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";

const Android12Switch = styled(Switch)(({ theme }) => ({
  padding: 8,
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16,
    },
    "&::before": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    "&::after": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: 2,
  },
}));

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const preciseCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

type BottomDrawerProps = {
  activeScenarioId: string;
  activeScenarioIndex: number;
  activeTab: TabId;
  isDrawerOpen: boolean;
  isDraftDirty: boolean;
  applyToAllScenarios: boolean;
  onToggleDrawer: () => void;
  onChangeTab: (tab: TabId) => void;
  onFieldChange: (index: number) => void;
  onUpdateBorrowerList: (list: BorrowerData[]) => void;
  onToggleApplyAll: () => void;
  onSelectScenario: (id: string) => void;
  onDiscard: () => void;
  onSave: () => void;
};

export function BottomDrawer({
  activeScenarioId,
  activeScenarioIndex,
  activeTab,
  isDrawerOpen,
  isDraftDirty,
  applyToAllScenarios,
  onToggleDrawer,
  onChangeTab,
  onFieldChange,
  onToggleApplyAll,
  onSelectScenario,
  onDiscard,
  onSave,
}: BottomDrawerProps) {
  const {
    control,
    setValue,
    // getValues,
    formState: { errors, dirtyFields },
  } = useFormContext<CombinedPreApprovalFormData>();
  const formValues = useWatch({ control });

  const sIndex = activeScenarioIndex - 1;
  const scenarioData = formValues?.scenarios?.[sIndex];

  // If no scenario data, fallback to rendering null or mock
  if (!scenarioData) return null;

  const purchasePrice = scenarioData.purchaseInfo?.purchasePrice || 0;
  const downPaymentAmount = scenarioData.loanProgram?.downPaymentAmount || 0;
  const downPaymentPercent = scenarioData.purchaseInfo?.downPayment || 0;

  const loanAmount = scenarioData.loanProgram?.baseLoanAmount || 0;
  const ltv = purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;
  const dti = scenarioData.loanProgram?.backEndRatio || 0;

  const borrowersList = scenarioData.borrowersIncomeData?.borrowerIncome || [];

  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        left: "50%",
        bottom: { xs: "12px", md: "56px" },
        transform: "translateX(-50%)",
        width: "min(calc(100% - 16px), 1380px)",
        padding: 0,
        overflow: "hidden",
        zIndex: 25,
        borderRadius: "28px",
        backgroundColor: "rgba(255, 255, 255, 0.82)",
        border: "1px solid rgba(109, 76, 196, 0.14)",
        backdropFilter: "blur(18px)",
      }}
    >
      <Box
        onClick={onToggleDrawer}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px 12px",
          borderBottom: isDrawerOpen ? "1px solid rgba(122, 63, 242, 0.08)" : "none",
          minHeight: "64px",
          cursor: "pointer",
        }}
      >
        <Box sx={{ display: "grid", gap: "2px" }}>
          <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: 700, m: 0 }}>
            {`Edit: Scenario ${activeScenarioIndex} - ${scenarioData.scenarioName || `Scenario ${activeScenarioIndex}`}`}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.82rem",
              color: isDraftDirty ? "#5620d2" : "#74689c",
              fontWeight: isDraftDirty ? 700 : 400
            }}
          >
            {isDraftDirty ? "Unsaved changes" : "Draft synced"}
          </Typography>
        </Box>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            onToggleDrawer();
          }}
          sx={{
            width: "28px",
            height: "28px",
            borderRadius: "999px",
            backgroundColor: "transparent",
            color: "#5620d2",
            fontSize: "1rem",
            border: "1px solid rgba(122, 63, 242, 0.1)",
          }}
        >
          {isDrawerOpen ? "˅" : "˄"}
        </IconButton>
      </Box>

      {isDrawerOpen ? (
        <Box>
          <Box sx={{ display: "flex", padding: "0 18px", borderBottom: "1px solid rgba(122, 63, 242, 0.1)" }}>
            {tabConfig.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                disableRipple
                sx={{
                  position: "relative",
                  padding: "14px 14px 13px",
                  borderRadius: 0,
                  backgroundColor: "transparent",
                  color: activeTab === tab.id ? "#5620d2" : "#74689c",
                  border: 0,
                  fontSize: "0.98rem",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  textTransform: "none",
                  minWidth: "auto",
                  "&:hover": {
                    backgroundColor: "transparent"
                  },
                  ...(activeTab === tab.id && {
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: "14px",
                      right: "14px",
                      bottom: "-1px",
                      height: "3px",
                      borderRadius: "3px 3px 0 0",
                      backgroundColor: "#7a3ff2",
                    }
                  })
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ padding: "14px 18px 0" }}>
            {activeTab === "purchase" ? (
              <Box sx={{ display: "grid", gap: "10px", alignContent: "start" }}>
                <Box sx={{ display: "grid", gap: "14px", alignItems: "end", gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" } }}>
                  {/* <Field
                    label="Occupancy"
                    input={
                      <select
                        name="occupancy"
                        value={scenarioData.purchaseInfo?.occupancyStatus || ""}
                        onChange={(e) => setValue(`scenarios.${sIndex}.purchaseInfo.occupancyStatus`, e.target.value)}
                      >
                        <option value="" disabled>Select</option>
                        {[
                          { value: "1", label: "Owner Occupied" },
                          { value: "2", label: "2nd Home" },
                          { value: "3", label: "Investment" },
                        ].map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    }
                  /> */}
                  <Controller
                    name={`scenarios.${sIndex}.purchaseInfo.occupancyStatus`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          onFieldChange(sIndex);
                        }}
                        fullWidth
                        select
                        label="Occupancy Status *"
                        error={
                          !!errors.scenarios?.[sIndex]?.purchaseInfo?.occupancyStatus
                        }
                        helperText={
                          errors.scenarios?.[sIndex]?.purchaseInfo?.occupancyStatus
                            ?.message
                        }
                      >
                        <MenuItem value="1">Owner Occupied</MenuItem>
                        <MenuItem value="2">2nd Home</MenuItem>
                        <MenuItem value="3">Investment</MenuItem>
                      </TextField>
                    )}
                  />
                  <Controller
                    name={`scenarios.${sIndex}.purchaseInfo.loanProgram`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === "" ? "" : String(e.target.value);
                          field.onChange(value);
                          onFieldChange(sIndex);
                        }}
                        fullWidth
                        select
                        label="Loan Program *"
                        error={
                          !!errors.scenarios?.[sIndex]?.purchaseInfo?.loanProgram
                        }
                        helperText={
                          errors.scenarios?.[sIndex]?.purchaseInfo?.loanProgram
                            ?.message
                        }
                      >
                        <MenuItem value="1">Non QM</MenuItem>
                        <MenuItem value="2">Conventional</MenuItem>
                        <MenuItem value="3">FHA</MenuItem>
                      </TextField>
                    )}
                  />
                  {/* <Field
                    label="Loan Type"
                    input={
                      <select
                        name="loanType"
                        value={scenarioData.purchaseInfo?.loanProgram || ""}
                        onChange={(e) => setValue(`scenarios.${sIndex}.purchaseInfo.loanProgram`, e.target.value)}
                      >
                        <option value="" disabled>Select</option>
                        {[
                          { value: "1", label: "Non QM" },
                          { value: "2", label: "Conventional" },
                          { value: "3", label: "FHA" },
                        ].map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    }
                  /> */}
                  {/* <Typography sx={{ color: "#74689c", fontSize: "0.82rem" }}>Save this drawer to recalculate the scenario cards above.</Typography> */}
                </Box>
                <Box sx={{ display: "grid", gap: "10px", gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" } }}>
                  {/* <Field
                    label="Purchase Price"
                    input={
                      <input
                        name="purchasePrice"
                        type="number"
                        min={0}
                        step={1000}
                        value={purchasePrice}
                        onChange={(e) => setValue(`scenarios.${sIndex}.purchaseInfo.purchasePrice`, Number(e.target.value))}
                      />
                    }
                  /> */}
                  <Controller
                    name={`scenarios.${sIndex}.purchaseInfo.purchasePrice`}
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
                          onFieldChange(sIndex);
                        }}
                        inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                        thousandSeparator=","
                        allowNegative={false}
                        error={
                          !!errors.scenarios?.[sIndex]?.purchaseInfo?.purchasePrice
                        }
                        helperText={
                          errors.scenarios?.[sIndex]?.purchaseInfo?.purchasePrice
                            ?.message
                        }
                      />
                    )}
                  />
                  {/* <Field
                    label="Down Payment %"
                    input={
                      <input
                        name="downPaymentPercent"
                        type="number"
                        min={3}
                        max={70}
                        step={0.125}
                        value={downPaymentPercent}
                        onChange={(e) => setValue(`scenarios.${sIndex}.purchaseInfo.downPayment`, Number(e.target.value))}
                      />
                    }
                  /> */}
                  <Controller
                    name={`scenarios.${sIndex}.purchaseInfo.downPayment`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === "" ? "" : Number(e.target.value);
                          field.onChange(value);
                          onFieldChange(sIndex);
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
                          !!errors.scenarios?.[sIndex]?.purchaseInfo?.downPayment
                        }
                        helperText={
                          errors.scenarios?.[sIndex]?.purchaseInfo?.downPayment
                            ?.message
                        }
                      />
                    )}
                  />
                  {/* <Field
                    label="Down Payment"
                    input={
                      <>
                        <input
                          name="downPaymentAmount"
                          type="number"
                          min={0}
                          step={1000}
                          value={Math.round(downPaymentAmount)}
                          onChange={(e) => setValue(`scenarios.${sIndex}.loanProgram.downPaymentAmount`, Number(e.target.value))}
                        />
                        <Typography component="span" sx={{ color: "#74689c", fontSize: "0.82rem" }}>({percent.format(downPaymentPercent)}%)</Typography>
                      </>
                    }
                  /> */}
                  {/* <Field
                    label="Loan Amount"
                    input={
                      <input
                        name="loanAmount"
                        type="number"
                        min={0}
                        disabled
                        step={1000}
                        value={Math.round(loanAmount)}
                        onChange={(e) => setValue(`scenarios.${sIndex}.loanProgram.baseLoanAmount`, Number(e.target.value))}
                      />
                    }
                  /> */}
                  <Controller
                    name={`scenarios.${sIndex}.loanProgram.baseLoanAmount`}
                    control={control}
                    render={({ field }) => (
                      <NumericFormat
                        customInput={TextField}
                        fullWidth
                        value={field.value ?? ""}
                        placeholder="0"
                        label="Loan Amount"
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
                          !!errors.scenarios?.[sIndex]?.loanProgram?.baseLoanAmount
                        }
                        helperText={
                          errors.scenarios?.[sIndex]?.loanProgram?.baseLoanAmount
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
                  {/* <ReadOnlyField
                    label="Loan Amount"
                    value={currency.format(loanAmount)}
                    meta={`(${percent.format(ltv)}%)`}
                  /> */}
                </Box>
              </Box>
            ) : null}

            {activeTab === "terms" ? (
              <Box sx={{ display: "grid", gap: "10px", alignContent: "start" }}>
                <Box sx={{ display: "grid", gap: "10px", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
                  {/* <Field
                    label="Rate"
                    input={
                      <>
                        <input
                          name="rate"
                          type="number"
                          min={3}
                          max={12}
                          step={0.001}
                          value={scenarioData.purchaseInfo?.annualInterestRate || 0}
                          onChange={(e) => setValue(`scenarios.${sIndex}.purchaseInfo.annualInterestRate`, Number(e.target.value))}
                        />
                        <Typography component="span" sx={{ color: "#74689c", fontSize: "0.82rem" }}>%</Typography>
                      </>
                    }
                  /> */}
                  <Controller
                    name={`scenarios.${sIndex}.purchaseInfo.annualInterestRate`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === "" ? "" : Number(e.target.value);
                          field.onChange(value);
                          onFieldChange(sIndex);
                        }}
                        value={field.value ?? ""}
                        fullWidth
                        label="Interest Rate *"
                        type="number"
                        inputMode="numeric"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        }}
                        error={
                          !!errors.scenarios?.[sIndex]?.purchaseInfo
                            ?.annualInterestRate
                        }
                        helperText={
                          errors.scenarios?.[sIndex]?.purchaseInfo
                            ?.annualInterestRate?.message
                        }
                      />
                    )}
                  />
                  <Controller
                    name={`scenarios.${sIndex}.loanProgram.term`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          onFieldChange(sIndex);
                        }}
                        size="medium"
                        error={!!errors.scenarios?.[sIndex]?.loanProgram?.term}
                        sx={{
                          width: 120,
                          maxWidth: 120,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#F6F6F6",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#F6F6F6",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#F6F6F6",
                          },
                        }}
                      >
                        <MenuItem value={10}>10 yr</MenuItem>
                        <MenuItem value={15}>15 yr</MenuItem>
                        <MenuItem value={20}>20 yr</MenuItem>
                        <MenuItem value={30}>30 yr</MenuItem>
                      </Select>
                    )}
                  />
                  {/* <Field
                    label="Loan Terms"
                    input={
                      <select
                        name="termYears"
                        value={scenarioData.loanProgram?.term ? scenarioData.loanProgram.term / 12 : 30}
                        onChange={(e) => setValue(`scenarios.${sIndex}.loanProgram.term`, Number(e.target.value) * 12)}
                      >
                        {[15, 20, 30].map((years) => (
                          <option key={years} value={years}>
                            {years}-year fixed
                          </option>
                        ))}
                      </select>
                    }
                  /> */}
                </Box>
              </Box>
            ) : null}

            {activeTab === "debts" ? (
              <Box sx={{ display: "grid", gap: "10px", alignContent: "start" }}>
                <Box sx={{ display: "grid", gap: "10px", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
                  {/* <Field
                    label="Debts"
                    input={
                      <input
                        name="monthlyDebts"
                        type="number"
                        min={0}
                        step={50}
                        value={borrowersList.reduce((sum, b) => sum + (b.debts || []).reduce((dSum, d) => dSum + (d.monthlyPayment || 0), 0), 0)}
                        readOnly
                      />
                    }
                  /> */}
                  <Field
                    label="Property Tax %"
                    input={
                      <>
                        <input
                          name="monthlyPropertyTaxPercentage"
                          type="number"
                          min={0}
                          step={0.01}
                          value={scenarioData.purchaseInfo?.monthlyPropertyTaxPercentage || 1.25}
                          onChange={(e) => {
                            setValue(`scenarios.${sIndex}.purchaseInfo.monthlyPropertyTaxPercentage`, Number(e.target.value));
                            onFieldChange(sIndex);
                          }}
                        />
                        <Typography component="span" sx={{ color: "#74689c", fontSize: "0.82rem" }}>%</Typography>
                      </>
                    }
                  />
                  <ReadOnlyField
                    label="Property Tax"
                    value={currency.format(scenarioData.purchaseInfo?.monthlyPropertyTax || 0)}
                  />
                  <Field
                    label="Haz Insurance"
                    input={
                      <input
                        name="hazardInsuranceMonthly"
                        type="number"
                        min={0}
                        step={25}
                        value={scenarioData.purchaseInfo?.hazardInsurance || 0}
                        onChange={(e) => {
                          setValue(`scenarios.${sIndex}.purchaseInfo.hazardInsurance`, Number(e.target.value));
                          onFieldChange(sIndex);
                        }}
                      />
                    }
                  />
                </Box>

                <Box sx={{ display: "grid", gap: "10px", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
                  <Field
                    label="HOA"
                    input={
                      <input
                        name="hoaMonthly"
                        type="number"
                        min={0}
                        step={25}
                        value={scenarioData.purchaseInfo?.associationFee || 0}
                        onChange={(e) => {
                          setValue(`scenarios.${sIndex}.purchaseInfo.associationFee`, Number(e.target.value));
                          onFieldChange(sIndex);
                        }}
                      />
                    }
                  />
                  <ReadOnlyField
                    label="Closing Cost"
                    value={currency.format(scenarioData.loanProgram?.clearingCart || 0)}
                  />
                  <ReadOnlyField
                    label="Pre-Paids"
                    value={currency.format(scenarioData.prepaidItems?.prepaidInterestAmount || 0)}
                  />
                </Box>

                <Box sx={{ display: "grid", gap: "10px", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>
                  <ReadOnlyField label="Monthly Total" value={preciseCurrency.format(scenarioData.loanProgram?.monthlyTotal || 0)} />
                  <ReadOnlyField label="Total Cash Required" value={currency.format(scenarioData.loanProgram?.totalNeededToClear || 0)} />
                  <ReadOnlyField
                    label="DTI / LTV"
                    value={`${percent.format(dti)}% / ${percent.format(ltv)}%`}
                  />
                </Box>
              </Box>
            ) : null}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr auto auto" }, alignItems: "center", gap: "14px", padding: "12px 18px 14px" }}>
            {/* <Box
              component="button"
              onClick={onToggleApplyAll}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: 0,
                backgroundColor: "transparent",
                color: "#74689c",
                fontSize: "0.95rem",
                border: 0,
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              <Switch
                checked={applyToAllScenarios}
                onChange={onToggleApplyAll}
                disableRipple
                sx={{
                  width: 36,
                  height: 20,
                  padding: 0,
                  "& .MuiSwitch-switchBase": {
                    padding: 0,
                    margin: "2px",
                    transitionDuration: "300ms",
                    "&.Mui-checked": {
                      transform: "translateX(16px)",
                      color: "#fff",
                      "& + .MuiSwitch-track": {
                        background: "linear-gradient(135deg, #7a3ff2, #945dff)",
                        opacity: 1,
                        border: 0,
                      },
                    },
                  },
                  "& .MuiSwitch-thumb": {
                    boxSizing: "border-box",
                    width: 16,
                    height: 16,
                    boxShadow: "0 2px 6px rgba(40, 24, 92, 0.16)",
                  },
                  "& .MuiSwitch-track": {
                    borderRadius: 12,
                    backgroundColor: "rgba(122, 63, 242, 0.12)",
                    opacity: 1,
                  },
                }}
              />
              <Typography component="span" sx={{ fontSize: "inherit" }}>Apply purchase info to all scenarios</Typography>
            </Box> */}

            <Box sx={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {formValues?.scenarios?.map((scenario, index) => (
                <Box
                  component="button"
                  type="button"
                  key={scenario.id || `scenario-${index + 1}`}
                  onClick={() => onSelectScenario(scenario.id || `scenario-${index + 1}`)}
                  aria-label={`Select ${scenario.scenarioName}`}
                  sx={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "999px",
                    backgroundColor: activeScenarioId === (scenario.id || `scenario-${index + 1}`) ? "#7a3ff2" : "rgba(122, 63, 242, 0.18)",
                    border: 0,
                    cursor: "pointer",
                    padding: 0
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: "10px" }}>
              <Button
                variant="text"
                onClick={onDiscard}
                sx={{
                  minHeight: "42px",
                  padding: "0 16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(122, 63, 242, 0.08)",
                  color: "#5620d2",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(122, 63, 242, 0.12)",
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onSave}
                sx={{
                  minHeight: "42px",
                  padding: "0 16px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #7a3ff2, #945dff)",
                  color: "white",
                  boxShadow: "0 14px 24px rgba(122, 63, 242, 0.22)",
                  fontWeight: 700,
                  textTransform: "none",
                  transition: "transform 0.18s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                  }
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Box>
      ) : null}
    </Paper>
  );
}
