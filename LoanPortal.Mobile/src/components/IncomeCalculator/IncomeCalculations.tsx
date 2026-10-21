import React, { useState, useMemo } from "react";
import { Box, Typography, Button, Radio, Paper } from "@mui/material";
import { IncomeType } from "@/api/models/IncomeCalculation";

interface Props {
  incomeType?: IncomeType;
  calculatedData: any;
  employerInfo?: any;
  onUseSuggestedIncome: (suggestedAmount: number) => void;
  onSave: (suggestedAmount: number) => void;
}

export default function IncomeCalculations({ incomeType, calculatedData, employerInfo, onUseSuggestedIncome, onSave }: Props) {
  const options = useMemo(() => {
    const data = calculatedData || {};
    const ytdMonths = data.ytdMonths || 0;

    let ytdEarn = 0;
    let prior1Earn = 0;
    let prior2Earn = 0;

    switch (incomeType) {
      case IncomeType.Salary:
        ytdEarn = data.ytdSalary || 0;
        prior1Earn = data.priorYear1W2Income || 0;
        prior2Earn = data.priorYear2W2Income || 0;
        break;
      case IncomeType.Hourly:
        ytdEarn = data.ytdEarnings || 0;
        prior1Earn = data.priorYear1W2Income || 0;
        prior2Earn = data.priorYear2W2Income || 0;
        break;
      case IncomeType.OvertimeBonus:
        ytdEarn = data.ytdOvertimeBonus || 0;
        prior1Earn = data.priorYear1OvertimeBonus || 0;
        prior2Earn = data.priorYear2OvertimeBonus || 0;
        break;
      case IncomeType.Commission:
        ytdEarn = data.ytdCommission || 0;
        prior1Earn = data.priorYear1Commission || 0;
        prior2Earn = data.priorYear2Commission || 0;
        break;
      case IncomeType.ScheduleC:
        ytdEarn = data.ytdAdjustedIncome || 0;
        prior1Earn = data.priorYear1TaxReturn || 0;
        prior2Earn = data.priorYear2TaxReturn || 0;
        break;
    }

    const ytdExp = data.ytdExpenses || 0;
    const prior1Exp = data.priorYear1Expenses || 0;
    const prior2Exp = data.priorYear2Expenses || 0;

    const ytdNet = ytdEarn - (incomeType === IncomeType.Commission ? ytdExp : 0);
    const prior1Net = prior1Earn - (incomeType === IncomeType.Commission ? prior1Exp : 0);
    const prior2Net = prior2Earn - (incomeType === IncomeType.Commission ? prior2Exp : 0);

    const ytdMonthsNum = ytdMonths > 0 ? ytdMonths : 1; // avoid division by zero

    const opts = [];
    if (incomeType === IncomeType.Salary || incomeType === IncomeType.Hourly) {
      if (data.grossSalary || (data.hourlyRate && data.hoursPerWeek)) {
        let baseAmount = 0;
        if (data.grossSalary) {
          const freq = data.payFrequency || 1;
          const gross = data.grossSalary;
          switch (freq) {
            case 1: baseAmount = gross / 12; break;
            case 2: baseAmount = gross; break;
            case 3: baseAmount = (gross * 26) / 12; break;
            case 4: baseAmount = (gross * 24) / 12; break;
            case 5: baseAmount = (gross * 52) / 12; break;
          }
        } else {
          baseAmount = (data.hourlyRate * data.hoursPerWeek * 52) / 12;
        }
        opts.push({ id: "base", label: data.grossSalary ? "Annual salary" : "Current hourly income", amount: baseAmount, description: data.grossSalary ? "Based on annual salary" : "Based on current hourly income" });
      } else {
        opts.push({ id: "base", label: "Annual salary", amount: 0, description: "Based on annual salary" });
      }
    }

    if (incomeType === IncomeType.BankStatement) {
      const deposits = data.deposits || [];
      const totalDeposits = deposits.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0);
      const expenseFactor = data.expenseFactor || 0;
      const netAnnual = totalDeposits * (1 - (expenseFactor / 100));
      const monthlyCalc = netAnnual / 12;

      opts.push({ id: "total", label: "Total 12-month deposits", amount: totalDeposits, description: "Based on total deposits" });
      opts.push({ id: "net", label: `Net annual income after ${expenseFactor}% expense factor`, amount: netAnnual, description: "Based on net annual income" });
      opts.push({ id: "monthly", label: "Monthly calculated income", amount: monthlyCalc, description: `($${totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} \u2013 ${expenseFactor}%) \u00f7 12` });
    } else if (incomeType === IncomeType.OvertimeBonus || incomeType === IncomeType.Commission || incomeType === IncomeType.ScheduleC) {
      const isComm = incomeType === IncomeType.Commission;
      opts.push({ id: "ytd", label: isComm ? "YTD avg using net income" : "YTD average", amount: ytdNet / ytdMonthsNum, description: "Based on YTD average" });
      const prior1Months = data.priorYear1Months || 12;
      let label1 = "YTD + 1 year average";
      if (isComm) label1 = "YTD + 1 year avg using net income";
      if (incomeType === IncomeType.OvertimeBonus) label1 = "YTD + 1 year";

      opts.push({ id: "ytd1", label: label1, amount: (ytdNet + prior1Net) / (ytdMonthsNum + prior1Months), description: "Based on YTD + 1 year average" });

      const prior2Months = data.priorYear2Months || 12;

      let label2 = "YTD + 2 year average";
      if (isComm) label2 = "YTD + 2 year avg using net income";
      if (incomeType === IncomeType.OvertimeBonus) label2 = "YTD + 2 years";

      opts.push({ id: "ytd2", label: label2, amount: (ytdNet + prior1Net + prior2Net) / (ytdMonthsNum + prior1Months + prior2Months), description: "Based on YTD + 2 year average" });
    } else if (incomeType === IncomeType.Other) {
      const defaultItems = [
        { type: "Business Expense", amount: 6000, averagingMonths: 12 },
        { type: "Other Deduction", amount: 3000, averagingMonths: 24 }
      ];
      const items = data.items && data.items.length > 0 ? data.items : defaultItems;

      let combinedImpact = 0;

      items.forEach((item: any, index: number) => {
        const isDeduction = item.type?.toLowerCase().includes("expense") || item.type?.toLowerCase().includes("deduction");
        const val = (Number(item.amount) || 0) / (Number(item.averagingMonths) || 1);
        const signedVal = isDeduction ? -val : val;
        combinedImpact += signedVal;

        const labelText = isDeduction ? "deduction" : "income";
        opts.push({
          id: `item_${index}`,
          label: `${item.averagingMonths}-month average ${labelText}`,
          amount: signedVal,
          description: "Based on specific entry"
        });
      });

      if (items.length > 1) {
        opts.push({
          id: "combined",
          label: "Combined deduction",
          amount: combinedImpact,
          description: "Combined deduction applied"
        });
      }
    } else {
      console.log("else");
      const ytdAverage = ytdNet / ytdMonthsNum;
      const annualizedYTD = ytdAverage * 12;
      opts.push({ id: "ytd", label: "YTD average", amount: ytdAverage, description: "Based on YTD average" });
      opts.push({ id: "ytd1", label: "YTD + 1 year average", amount: (annualizedYTD + prior1Net) / 2 / 12, description: "Based on YTD + 1 year average" });
      opts.push({ id: "ytd2", label: "YTD + 2 year average", amount: (annualizedYTD + prior1Net + prior2Net) / 3 / 12, description: "Based on YTD + 2 year average" });
    }

    return opts;
  }, [calculatedData, incomeType]);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const selectedOption = useMemo(() => {
    if (options.length === 0) {
      return { id: "fallback", label: "N/A", amount: 0, description: "" };
    }
    if (selectedOptionId) {
      return options.find(o => o.id === selectedOptionId) || options[0];
    }
    if (incomeType === IncomeType.Hourly || incomeType === IncomeType.BankStatement) {
      const validOptions = options.filter(o => o.amount > 0);
      if (validOptions.length === 0) return options[0];
      return validOptions.reduce((prev, curr) => prev.amount < curr.amount ? prev : curr);
    }
    return options[0];
  }, [options, selectedOptionId, incomeType]);

  const activeOptionId = selectedOptionId || selectedOption?.id;
  const showTable = incomeType === IncomeType.Hourly;

  let subtitleText = "Select the income amount to use for qualifying.";
  if (incomeType === IncomeType.Hourly) subtitleText = "We calculate the monthly averages. Choose the income to use for qualifying.";
  if (incomeType === IncomeType.Commission) subtitleText = "We calculate the averages using net income. Choose the income to use for qualifying.";
  if (incomeType === IncomeType.BankStatement) subtitleText = "Review the calculated options and choose the income amount to use.";
  if (incomeType === IncomeType.ScheduleC) subtitleText = "Select the income amount to qualify this borrower.";
  if (incomeType === IncomeType.Other) subtitleText = "Select the deduction calculation to apply to your qualifying income.";

  return (
    <Box>
      {showTable && (
        <Box mb={4}>
          <Typography fontWeight={600} color="#101828" mb={2}>
            Income History <Typography component="span" fontWeight={400} color="#667085" fontSize={14}>(Monthly Avg)</Typography>
          </Typography>
          <Box display="flex" justifyContent="space-between" sx={{ borderBottom: "1px solid #EAECF0", pb: 1, mb: 1 }}>
            <Typography fontSize={12} color="#667085" fontWeight={500}>Source</Typography>
            <Typography fontSize={12} color="#667085" fontWeight={500}>Monthly Average</Typography>
          </Box>
          {options.map((opt, index) => (
            <Box key={`hist-${opt.id}`} display="flex" justifyContent="space-between" sx={{ borderBottom: index < options.length - 1 ? "1px solid #EAECF0" : "none", py: 1.5 }}>
              <Typography fontSize={14} color="#344054">{opt.label}</Typography>
              <Typography fontSize={14} fontWeight={index === 0 ? 600 : 500} color={index === 0 ? "#7A5AF8" : "#101828"}>
                ${Math.abs(opt.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {incomeType === IncomeType.Other && (
        <Box mb={3}>
          <Typography fontWeight={600} color="#101828" mb={2}>
            Deduction Calculations <Typography component="span" fontWeight={400} color="#667085" fontSize={14}>(Monthly Impact)</Typography>
          </Typography>
          <Box display="flex" justifyContent="space-between" sx={{ borderBottom: "1px solid #EAECF0", pb: 1, mb: 1 }}>
            <Typography fontSize={12} color="#667085" fontWeight={500}>Deduction Option</Typography>
            <Typography fontSize={12} color="#667085" fontWeight={500}>Monthly Impact</Typography>
          </Box>
        </Box>
      )}

      <Typography fontWeight={600} mb={0.5}>
        {incomeType === IncomeType.Other ? "Choose Deduction to Apply" : "Choose Income to Use"}
      </Typography>
      <Typography fontSize={14} color="#667085" mb={3}>
        {subtitleText}
      </Typography>

      {options.map((option) => (
        <Paper
          key={option.id}
          variant="outlined"
          sx={{
            mb: 1.5,
            p: 2,
            borderRadius: 2,
            borderColor: activeOptionId === option.id ? "#7A5AF8" : "#E4E7EC",
            backgroundColor: activeOptionId === option.id ? "#F4F3FF" : "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer"
          }}
          onClick={() => setSelectedOptionId(option.id)}
        >
          <Box display="flex" alignItems="center">
            <Radio
              checked={activeOptionId === option.id}
              sx={{ color: "#D0D5DD", "&.Mui-checked": { color: "#7A5AF8" }, p: 0, mr: 1.5 }}
            />
            <Typography
              fontWeight={activeOptionId === option.id ? 600 : 500}
              color={activeOptionId === option.id ? "#7A5AF8" : "#344054"}
            >
              {option.label}
            </Typography>
          </Box>
          <Typography
            fontWeight={600}
            color={activeOptionId === option.id ? "#7A5AF8" : "#101828"}
          >
            {option.amount < 0 ? "-" : ""}${Math.abs(option.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Paper>
      ))}

      <Box
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 3,
          backgroundColor: "#F4F3FF",
        }}
      >
        <Typography fontWeight={600} color="#101828" mb={1}>
          {incomeType === IncomeType.Other ? "Applied Deduction" : (incomeType === IncomeType.Hourly ? "Suggested (Lowest)" : "Suggested Income")}
        </Typography>
        <Box display="flex" alignItems="baseline" gap={1}>
          <Typography variant="h4" fontWeight={700} color={incomeType === IncomeType.Other ? "#7A5AF8" : "#101828"}>
            {selectedOption.amount < 0 ? "-" : ""}${Math.abs(selectedOption.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography color="#101828" fontWeight={600}>/mo</Typography>
        </Box>
        <Typography fontSize={14} color="#667085" mt={1}>
          {incomeType === IncomeType.BankStatement || incomeType === IncomeType.Other ? selectedOption.description : selectedOption.label}
        </Typography>
      </Box>

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3, backgroundColor: "#7A5AF8", "&:hover": { backgroundColor: "#6941C6" }, py: 1.5, borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: 16 }}
        onClick={() => onSave(selectedOption.amount)}
      >
        {incomeType === IncomeType.Other ? "Apply Deduction" : "Use Suggested Income"}
      </Button>

    </Box>
  );
}

