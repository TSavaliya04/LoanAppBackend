import React, { useMemo, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid, InputAdornment, MenuItem, Radio } from "@mui/material";
import { IncomeType } from "@/api/models/IncomeCalculation";
import { NumericFormat } from "react-number-format";

interface Props {
  incomeType: IncomeType;
  initialData?: any;
  employerInfo?: any;
  onCalculate: (data: any) => void;
}

export default function IncomeDetailsForm({ incomeType, initialData, employerInfo, onCalculate }: Props) {
  const [formData, setFormData] = React.useState<any>(initialData || {});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleValueChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const ytdMonths = useMemo(() => {
    const date = employerInfo?.ytdPeriodEnding ? new Date(employerInfo.ytdPeriodEnding) : new Date();
    if (isNaN(date.getTime())) return 0;
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) + 1;
    return Math.round((days / (365 / 12)) * 10) / 10;
  }, [employerInfo?.ytdPeriodEnding]);

  const renderNumberField = (label: string, fieldName: string) => (
    <Grid size={{ xs: 12 }}>
      <NumericFormat
        customInput={TextField}
        fullWidth
        label={label}
        value={formData[fieldName] || ""}
        onValueChange={(v) => handleValueChange(fieldName, v.floatValue)}
        thousandSeparator=","
        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
      />
    </Grid>
  );

  const renderMonthsField = (label: string, fieldName: string, value?: number) => (
    <Grid size={{ xs: 12 }}>
      <TextField
        fullWidth
        label={label}
        type="number"
        value={value !== undefined ? value : (formData[fieldName] || "")}
        onChange={value === undefined ? ((e) => handleValueChange(fieldName, Number(e.target.value))) : undefined}
        InputProps={value !== undefined ? { readOnly: true } : undefined}
      />
    </Grid>
  );

  const renderHistoryRow = (label: string, fieldName: string, monthsLabel: string, monthsValue: number, monthsFieldName?: string) => {
    // Only render editable months field when a monthsFieldName is provided
    const monthsFieldValue = monthsFieldName
      ? (formData[monthsFieldName] !== undefined ? formData[monthsFieldName] : monthsValue)
      : monthsValue;
    return (
      <Box sx={{ mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography fontSize={14} color="#344054">{label}</Typography>
          <NumericFormat
            customInput={TextField}
            value={formData[fieldName] || ""}
            onValueChange={(v) => handleValueChange(fieldName, v.floatValue)}
            thousandSeparator=","
            variant="outlined"
            placeholder="0.00"
            size="small"
            InputProps={{ 
              startAdornment: <Typography color="#101828" fontWeight={600} mr={0.5}>$</Typography>
            }}
            inputProps={{ 
              style: { textAlign: 'right', fontWeight: 600, color: "#101828" } 
            }}
            sx={{ width: '130px', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderBottom: "1px solid #F2F4F7", pb: 1 }}>
          <Typography fontSize={14} color="#667085">{monthsLabel}</Typography>
          {monthsFieldName ? (
            <TextField
              type="number"
              size="small"
              value={monthsFieldValue}
              onChange={(e) => handleValueChange(monthsFieldName, Number(e.target.value))}
              inputProps={{
                min: 0,
                style: { textAlign: 'right', fontWeight: 600, color: "#101828", width: '60px' }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiOutlinedInput-input': { py: '6px', px: 1 } }}
            />
          ) : (
            <Typography fontSize={14} fontWeight={600} color="#101828">{monthsValue}</Typography>
          )}
        </Box>
      </Box>
    );
  };

  const getCalculatedMonthlyBase = () => {
    const freq = formData.payFrequency || 1;
    const gross = formData.grossSalary || 0;
    
    switch (freq) {
      case 1: return { amount: gross / 12, label: `$${gross.toLocaleString()} ÷ 12` };
      case 2: return { amount: gross, label: `$${gross.toLocaleString()} × 1` };
      case 3: return { amount: (gross * 26) / 12, label: `($${gross.toLocaleString()} × 26) ÷ 12` };
      case 4: return { amount: (gross * 24) / 12, label: `($${gross.toLocaleString()} × 24) ÷ 12` };
      case 5: return { amount: (gross * 52) / 12, label: `($${gross.toLocaleString()} × 52) ÷ 12` };
      default: return { amount: 0, label: "" };
    }
  };

  const renderSalaryForm = () => {
    const baseCalc = getCalculatedMonthlyBase();
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            fullWidth
            label="Pay Frequency"
            value={formData.payFrequency || 1}
            onChange={(e) => handleValueChange("payFrequency", e.target.value)}
          >
            <MenuItem value={1}>Annual</MenuItem>
            <MenuItem value={2}>Monthly</MenuItem>
            <MenuItem value={3}>BiWeekly</MenuItem>
            <MenuItem value={4}>SemiMonthly</MenuItem>
            <MenuItem value={5}>Weekly</MenuItem>
          </TextField>
        </Grid>
        
        {renderNumberField("Gross Salary", "grossSalary")}

        <Grid size={{ xs: 12 }}>
          <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: 2, p: 2, border: "1px solid #EAECF0" }}>
            <Typography fontSize={12} color="#667085" mb={1}>Other supported frequencies</Typography>
            <Typography fontSize={12} color="#344054">Monthly, Bi-Weekly, Semi-Monthly, Weekly</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ backgroundColor: "#F4F3FF", borderRadius: 2, p: 2 }}>
            <Typography fontSize={12} fontWeight={600} color="#344054" mb={0.5}>Calculated Monthly Base</Typography>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h5" fontWeight={700} color="#101828">
                ${baseCalc.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography color="#667085" fontSize={14}>/mo</Typography>
            </Box>
            <Typography fontSize={12} color="#667085" mt={0.5}>{baseCalc.label}</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography fontWeight={600} color="#101828" mt={2} mb={2}>Salary History</Typography>
          
          {renderHistoryRow("YTD Salary", "ytdSalary", "Months", ytdMonths, "ytdMonths")}
          {renderHistoryRow("2025 W-2 Income", "priorYear1W2Income", "Months", 12)}
          {renderHistoryRow("2024 W-2 Income", "priorYear2W2Income", "Months", 12)}
        </Grid>
      </Grid>
    );
  };

  const renderHourlyForm = () => {
    const hourlyRate = formData.hourlyRate || 0;
    const hoursPerWeek = formData.hoursPerWeek || 0;
    const calculatedBase = (hourlyRate * hoursPerWeek * 52) / 12;
    const label = `$${hourlyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${hoursPerWeek} × 52 ÷ 12`;

    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography fontWeight={600} color="#101828" mt={0} mb={0}>Current Pay</Typography>
        </Grid>
        
        {renderNumberField("Hourly Rate", "hourlyRate")}
        
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Hours per Week"
            type="number"
            value={formData.hoursPerWeek || ""}
            onChange={(e) => handleValueChange("hoursPerWeek", Number(e.target.value))}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ backgroundColor: "#F4F3FF", borderRadius: 2, p: 2 }}>
            <Typography fontSize={12} fontWeight={600} color="#344054" mb={0.5}>Calculated Monthly Base</Typography>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h5" fontWeight={700} color="#101828">
                ${calculatedBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography color="#667085" fontSize={14}>/mo</Typography>
            </Box>
            <Typography fontSize={12} color="#667085" mt={0.5}>{label}</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography fontWeight={600} color="#101828" mt={2} mb={2}>Income History</Typography>
          {renderHistoryRow("YTD Earnings", "ytdEarnings", "Months", ytdMonths, "ytdMonths")}
          {renderHistoryRow("2025 W-2 Income", "priorYear1W2Income", "Months", 12)}
          {renderHistoryRow("2024 W-2 Income", "priorYear2W2Income", "Months", 12)}
        </Grid>
      </Grid>
    );
  };

  const renderOvertimeBonusForm = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography fontWeight={600} color="#101828" mt={0} mb={2}>Income History</Typography>
        {renderHistoryRow("YTD Overtime / Bonus", "ytdOvertimeBonus", "Months", ytdMonths, "ytdMonths")}
        {renderHistoryRow("2025 Overtime / Bonus", "priorYear1OvertimeBonus", "Months", 12)}
        {renderHistoryRow("2024 Overtime / Bonus", "priorYear2OvertimeBonus", "Months", 12)}
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Box sx={{ mt: 1, p: 2, backgroundColor: "#F9F5FF", border: "1px solid #E9D7FE", borderRadius: 2, display: "flex", gap: 1.5 }}>
          <Typography color="#7A5AF8" sx={{ fontSize: 18 }}>ⓘ</Typography>
          <Box>
            <Typography fontSize={14} fontWeight={600} color="#7A5AF8">Annualization note</Typography>
            <Typography fontSize={12} color="#667085" mt={0.5}>Use YTD only when required by guidelines.</Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );

  const renderCommissionRow = (yearLabel: string, commField: string, expField: string, monthsValue: number, monthsFieldName?: string) => {
    const monthsFieldValue = monthsFieldName
      ? (formData[monthsFieldName] !== undefined ? formData[monthsFieldName] : monthsValue)
      : monthsValue;
    return (
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography fontSize={14} color="#344054">{yearLabel} Commission</Typography>
          <NumericFormat
            customInput={TextField}
            value={formData[commField] || ""}
            onValueChange={(v) => handleValueChange(commField, v.floatValue)}
            thousandSeparator=","
            variant="outlined"
            placeholder="0.00"
            size="small"
            InputProps={{ startAdornment: <Typography color="#101828" fontWeight={600} mr={0.5}>$</Typography> }}
            inputProps={{ style: { textAlign: 'right', fontWeight: 600, color: "#101828" } }}
            sx={{ width: '130px', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography fontSize={14} color="#344054">{yearLabel} Expenses</Typography>
          <NumericFormat
            customInput={TextField}
            value={formData[expField] || ""}
            onValueChange={(v) => handleValueChange(expField, v.floatValue)}
            thousandSeparator=","
            variant="outlined"
            placeholder="0.00"
            size="small"
            InputProps={{ startAdornment: <Typography color="#101828" fontWeight={600} mr={0.5}>$</Typography> }}
            inputProps={{ style: { textAlign: 'right', fontWeight: 600, color: "#101828" } }}
            sx={{ width: '130px', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderBottom: "1px solid #F2F4F7", pb: 1.5 }}>
          <Typography fontSize={14} color="#667085">Months</Typography>
          {monthsFieldName ? (
            <TextField
              type="number"
              size="small"
              value={monthsFieldValue}
              onChange={(e) => handleValueChange(monthsFieldName, Number(e.target.value))}
              inputProps={{
                min: 0,
                style: { textAlign: 'right', fontWeight: 600, color: "#101828", width: '60px' }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiOutlinedInput-input': { py: '6px', px: 1 } }}
            />
          ) : (
            <Typography fontSize={14} fontWeight={600} color="#101828">{monthsValue}</Typography>
          )}
        </Box>
      </Box>
    );
  };

  const renderCommissionForm = () => {
    const ytdCommission = formData.ytdCommission || 0;
    const ytdExpenses = formData.ytdExpenses || 0;
    const ytdNet = ytdCommission - ytdExpenses;

    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          {renderCommissionRow("YTD", "ytdCommission", "ytdExpenses", ytdMonths, "ytdMonths")}
          {renderCommissionRow("2025", "priorYear1Commission", "priorYear1Expenses", 12)}
          {renderCommissionRow("2024", "priorYear2Commission", "priorYear2Expenses", 12)}
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mt: 1, p: 2, backgroundColor: "#F4F3FF", borderRadius: 2, display: "flex", gap: 1.5, alignItems: "center" }}>
            <Box sx={{ backgroundColor: "#E9D7FE", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography color="#7A5AF8" fontWeight={600}>$</Typography>
            </Box>
            <Box>
              <Typography fontSize={14} fontWeight={600} color="#101828">Net Income</Typography>
              <Typography fontSize={14} color="#667085">
                YTD net: <Typography component="span" fontWeight={600} color="#101828">${ytdNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  };

  const renderStackedNumberField = (label: string, fieldName: string) => (
    <Grid size={{ xs: 12 }}>
      <Typography fontSize={14} color="#344054" mb={0.5}>{label}</Typography>
      <NumericFormat
        customInput={TextField}
        fullWidth
        value={formData[fieldName] || ""}
        onValueChange={(v) => handleValueChange(fieldName, v.floatValue)}
        thousandSeparator=","
        InputProps={{ startAdornment: <InputAdornment position="start"><Typography color="#101828" fontWeight={500}>$</Typography></InputAdornment> }}
      />
    </Grid>
  );

  const renderStackedMonthsField = (label: string, fieldName: string, value?: number) => (
    <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>
      <Typography fontSize={14} color="#344054" mb={0.5}>{label}</Typography>
      <TextField
        fullWidth
        type="number"
        value={value !== undefined ? value : (formData[fieldName] || "")}
        onChange={value === undefined ? ((e) => handleValueChange(fieldName, Number(e.target.value))) : undefined}
        InputProps={value !== undefined ? { readOnly: true } : undefined}
      />
    </Grid>
  );

  const renderScheduleCForm = () => {
    const income2025 = formData.priorYear1TaxReturn || 0;
    const income2024 = formData.priorYear2TaxReturn || 0;
    const method = formData.calculationMethod || "1year";

    const qualifyingMonthly =
      method === "1year"
        ? income2025 / 12
        : (income2025 + income2024) / 24;

    const methodDescription =
      method === "1year"
        ? "Based on 1-year average (2025 income ÷ 12)"
        : "Based on 2-year average ((2025 + 2024 income) ÷ 24)";

    return (
      <Grid container spacing={2.5}>
        {/* 2025 Adjusted Schedule C Income */}
        <Grid size={{ xs: 12 }}>
          <Typography fontSize={14} fontWeight={600} color="#101828" mb={1}>
            2025 Adjusted Schedule C Income
          </Typography>
          <NumericFormat
            customInput={TextField}
            fullWidth
            value={formData.priorYear1TaxReturn || ""}
            onValueChange={(v) => handleValueChange("priorYear1TaxReturn", v.floatValue)}
            thousandSeparator=","
            placeholder="0"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography color="#101828" fontWeight={500}>$</Typography>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* 2024 Adjusted Schedule C Income */}
        <Grid size={{ xs: 12 }}>
          <Typography fontSize={14} fontWeight={600} color="#101828" mb={1}>
            2024 Adjusted Schedule C Income
          </Typography>
          <NumericFormat
            customInput={TextField}
            fullWidth
            value={formData.priorYear2TaxReturn || ""}
            onValueChange={(v) => handleValueChange("priorYear2TaxReturn", v.floatValue)}
            thousandSeparator=","
            placeholder="0"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography color="#101828" fontWeight={500}>$</Typography>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Income Calculation Method */}
        <Grid size={{ xs: 12 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Typography fontSize={14} fontWeight={600} color="#101828">Income Calculation Method</Typography>
            <Typography color="#667085" fontSize={16} lineHeight={1}>ⓘ</Typography>
          </Box>
          <Box display="flex" gap={2}>
            {/* 1-Year Average */}
            <Box
              flex={1}
              onClick={() => handleValueChange("calculationMethod", "1year")}
              sx={{
                border: `2px solid ${method === "1year" ? "#7A5AF8" : "#E4E7EC"}`,
                backgroundColor: method === "1year" ? "#F4F3FF" : "#FFF",
                borderRadius: 2,
                p: 2,
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <Radio
                checked={method === "1year"}
                sx={{ color: "#D0D5DD", "&.Mui-checked": { color: "#7A5AF8" }, p: 0, mt: 0.2 }}
                onChange={() => handleValueChange("calculationMethod", "1year")}
              />
              <Box>
                <Typography fontSize={14} fontWeight={600} color={method === "1year" ? "#7A5AF8" : "#344054"}>
                  1-Year Average
                </Typography>
                <Typography fontSize={12} color="#667085" mt={0.25}>
                  Use 2025 income only{"\n"}(÷ 12 months)
                </Typography>
              </Box>
            </Box>

            {/* 2-Year Average */}
            <Box
              flex={1}
              onClick={() => handleValueChange("calculationMethod", "2year")}
              sx={{
                border: `2px solid ${method === "2year" ? "#7A5AF8" : "#E4E7EC"}`,
                backgroundColor: method === "2year" ? "#F4F3FF" : "#FFF",
                borderRadius: 2,
                p: 2,
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <Radio
                checked={method === "2year"}
                sx={{ color: "#D0D5DD", "&.Mui-checked": { color: "#7A5AF8" }, p: 0, mt: 0.2 }}
                onChange={() => handleValueChange("calculationMethod", "2year")}
              />
              <Box>
                <Typography fontSize={14} fontWeight={600} color={method === "2year" ? "#7A5AF8" : "#344054"}>
                  2-Year Average
                </Typography>
                <Typography fontSize={12} color="#667085" mt={0.25}>
                  Use 2024 &amp; 2025 income{"\n"}(÷ 24 months)
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Qualifying Monthly Income */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              backgroundColor: "#F4F3FF",
              borderRadius: 2,
              p: 2.5,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography fontSize={14} fontWeight={600} color="#344054">Qualifying Monthly Income</Typography>
              <Typography color="#667085" fontSize={16} lineHeight={1}>ⓘ</Typography>
            </Box>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h4" fontWeight={700} color="#7A5AF8">
                ${qualifyingMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography fontSize={16} color="#667085">/ month</Typography>
            </Box>
            <Typography fontSize={13} color="#667085" mt={0.75}>
              {methodDescription}
            </Typography>
          </Box>
        </Grid>

        {/* Info note */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: "#F0F9FF",
              border: "1px solid #BAE6FD",
              borderRadius: 2,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <Typography color="#0284C7" fontSize={18} lineHeight={1.2}>ⓘ</Typography>
            <Typography fontSize={13} color="#344054">
              Enter adjusted Schedule C income <em>after add-backs and deductions.</em>{" "}
              Do not include other business income (e.g., K-1) in this section.
            </Typography>
          </Box>
        </Grid>

        {/* Use This Income button */}
        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#7A5AF8",
              "&:hover": { backgroundColor: "#6941C6" },
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 16,
            }}
            onClick={() => {
              onCalculate({
                ...formData,
                priorYear1TaxReturn: income2025,
                priorYear2TaxReturn: income2024,
                calculationMethod: method,
                monthlyIncomeFromSource: qualifyingMonthly,
              });
            }}
          >
            Use This Income
          </Button>
        </Grid>
      </Grid>
    );
  };

  const handleDepositChange = (index: number, value: any) => {
    const currentDeposits = formData.deposits || Array(12).fill(0);
    const newDeposits = [...currentDeposits];
    newDeposits[index] = value || 0;
    handleValueChange("deposits", newDeposits);
  };

  const renderBankStatementForm = () => {
    const deposits = formData.deposits || Array(12).fill(0);
    const totalDeposits = deposits.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
    const expenseFactor = formData.expenseFactor || 0;
    const expenseAmount = totalDeposits * (expenseFactor / 100);
    const netAnnual = totalDeposits - expenseAmount;

    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography fontWeight={600} color="#101828" mt={0} mb={2}>12-Month Deposits</Typography>
          
          {Array.from({ length: 12 }).map((_, index) => (
            <Box key={`month-${index}`} display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography fontSize={14} color="#344054">Month {index + 1}</Typography>
              <NumericFormat
                customInput={TextField}
                value={deposits[index] || ""}
                onValueChange={(v) => handleDepositChange(index, v.floatValue)}
                thousandSeparator=","
                variant="outlined"
                placeholder="0.00"
                size="small"
                InputProps={{ startAdornment: <Typography color="#101828" fontWeight={600} mr={0.5}>$</Typography> }}
                inputProps={{ style: { textAlign: 'right', fontWeight: 600, color: "#101828" } }}
                sx={{ width: '130px', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          ))}

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} mt={3}>
            <Typography fontSize={14} color="#344054">Expense Factor</Typography>
            <NumericFormat
              customInput={TextField}
              value={formData.expenseFactor || ""}
              onValueChange={(v) => handleValueChange("expenseFactor", v.floatValue)}
              variant="outlined"
              placeholder="0"
              size="small"
              InputProps={{ endAdornment: <Typography color="#101828" fontWeight={600} ml={0.5}>%</Typography> }}
              inputProps={{ style: { textAlign: 'right', fontWeight: 600, color: "#101828" } }}
              sx={{ width: '130px', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ mt: 1, p: 2, backgroundColor: "#F4F3FF", borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography fontSize={14} color="#344054">Total Deposits</Typography>
              <Typography fontSize={14} fontWeight={600} color="#101828">${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography fontSize={14} color="#344054">Less Expenses ({expenseFactor}%)</Typography>
              <Typography fontSize={14} fontWeight={600} color="#101828">-${expenseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" pt={1.5} sx={{ borderTop: "1px solid #E9D7FE" }}>
              <Typography fontSize={14} fontWeight={600} color="#101828">Net Annual Income</Typography>
              <Typography fontSize={14} fontWeight={600} color="#7A5AF8">${netAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" pt={1.5}>
              <Typography fontSize={14} fontWeight={600} color="#101828">Net Monthly Income</Typography>
              <Typography fontSize={14} fontWeight={600} color="#7A5AF8">${(netAnnual / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const defaultItems = [
      { type: "Business Expense", amount: 6000, averagingMonths: 12 },
      { type: "Other Deduction", amount: 3000, averagingMonths: 24 }
    ];
    const currentItems = formData.items && formData.items.length > 0 ? formData.items : defaultItems;
    const newItems = [...currentItems];
    newItems[index] = { ...newItems[index], [field]: value };
    handleValueChange("items", newItems);
  };

  const renderOtherForm = () => {
    const defaultItems = [
      { type: "Business Expense", amount: 6000, averagingMonths: 12 },
      { type: "Other Deduction", amount: 3000, averagingMonths: 24 }
    ];
    const items = formData.items && formData.items.length > 0 ? formData.items : defaultItems;

    let combinedImpact = 0;
    items.forEach((item: any) => {
      const isDeduction = item.type?.toLowerCase().includes("expense") || item.type?.toLowerCase().includes("deduction");
      const val = (Number(item.amount) || 0) / (Number(item.averagingMonths) || 1);
      combinedImpact += isDeduction ? -val : val;
    });

    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          {items.map((item: any, index: number) => (
            <Box key={`item-${index}`} mb={4}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography fontSize={14} color="#344054" mb={0.5}>Type</Typography>
                  <TextField
                    fullWidth
                    select
                    value={item.type || ""}
                    onChange={(e) => handleItemChange(index, "type", e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="Business Expense">Business Expense</option>
                    <option value="Other Deduction">Other Deduction</option>
                    <option value="Other Income">Other Income</option>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography fontSize={14} color="#344054" mb={0.5}>Amount</Typography>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    value={item.amount || ""}
                    onValueChange={(v) => handleItemChange(index, "amount", v.floatValue)}
                    thousandSeparator=","
                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography color="#101828" fontWeight={500}>$</Typography></InputAdornment> }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography fontSize={14} color="#344054" mb={0.5}>Averaging Method</Typography>
                  <TextField
                    fullWidth
                    select
                    value={item.averagingMonths || 12}
                    onChange={(e) => handleItemChange(index, "averagingMonths", Number(e.target.value))}
                    SelectProps={{ native: true }}
                  >
                    <option value={12}>12 months</option>
                    <option value={24}>24 months</option>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          ))}
          
          <Box sx={{ mt: 1, p: 2, backgroundColor: "#F4F3FF", borderRadius: 2 }}>
            <Typography fontSize={14} fontWeight={600} color="#101828" mb={1}>Estimated Monthly Impact</Typography>
            <Box display="flex" alignItems="baseline" gap={1}>
              <Typography variant="h4" fontWeight={700} color="#7A5AF8">
                {combinedImpact < 0 ? "-" : ""}${Math.abs(combinedImpact).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography color="#667085" fontWeight={600}>/mo</Typography>
            </Box>
            <Typography fontSize={14} color="#667085" mt={1}>Impact on qualifying income</Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };

  const getFormTitle = () => {
    switch (incomeType) {
      case IncomeType.Salary: return "Salary Income";
      case IncomeType.Hourly: return "Hourly Income";
      case IncomeType.OvertimeBonus: return "Overtime / Bonus Income";
      case IncomeType.Commission: return "Commission Income";
      case IncomeType.ScheduleC: return "Schedule C Income";
      case IncomeType.BankStatement: return "Bank Statement Income";
      case IncomeType.Other: return "Other / Deductions";
      default: return "Income Details";
    }
  };

  const renderFormFields = () => {
    switch (incomeType) {
      case IncomeType.Salary: return renderSalaryForm();
      case IncomeType.Hourly: return renderHourlyForm();
      case IncomeType.OvertimeBonus: return renderOvertimeBonusForm();
      case IncomeType.Commission: return renderCommissionForm();
      case IncomeType.ScheduleC: return renderScheduleCForm();
      case IncomeType.BankStatement: return renderBankStatementForm();
      case IncomeType.Other: return renderOtherForm();
      default: return null;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: incomeType === IncomeType.ScheduleC ? 0 : 3 }}>
        {renderFormFields()}
      </Box>

      {(incomeType === IncomeType.BankStatement || incomeType === IncomeType.Other) && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: "#F4F3FF", borderRadius: 2, display: "flex", gap: 1 }}>
          <Typography color="#7A5AF8" sx={{ width: 20 }}>ⓘ</Typography>
          <Box>
            <Typography fontSize={14} fontWeight={600} color="#344054">{getFormTitle()}</Typography>
            <Typography fontSize={12} color="#667085">Ensure to use adjusted numbers where applicable.</Typography>
          </Box>
        </Box>
      )}

      {incomeType !== IncomeType.ScheduleC && (
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, backgroundColor: "#7A5AF8", "&:hover": { backgroundColor: "#6941C6" }, py: 1.5, borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: 16 }}
          onClick={() => {
            // Ensure ytdMonths is always set; for salary it comes from formData (user-editable),
            // for other types it's auto-computed and needs to be injected here.
            const ytdMonthsValue = formData.ytdMonths !== undefined ? formData.ytdMonths : ytdMonths;
            onCalculate({ ...formData, ytdMonths: ytdMonthsValue });
          }}
        >
          Calculate
        </Button>
      )}
    </Box>
  );
}

