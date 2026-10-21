"use client";
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { payFrequencyOptions } from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues, toggleAfterAmountChange } from "../formModel";
import { BackRow, BoundCheckbox, BoundSelect, BoundTextField, FieldName, MoneyField, PRIMARY, PrimaryBtn, Req, StepHeader } from "./primitives";

const additionalRows: { label: string; toggle: FieldName; amount: FieldName; freq: FieldName }[] = [
  { label: "Bonus", toggle: "incomeToggles.bonus", amount: "incomeDetails.bonusPay", freq: "incomeDetails.bonusFrequency" },
  { label: "Overtime", toggle: "incomeToggles.overtime", amount: "incomeDetails.overtimePay", freq: "incomeDetails.overtimeFrequency" },
  { label: "Commission", toggle: "incomeToggles.commission", amount: "incomeDetails.commissionPay", freq: "incomeDetails.commissionFrequency" },
  { label: "Other", toggle: "incomeToggles.other", amount: "incomeDetails.otherPay", freq: "incomeDetails.otherFrequency" },
];

/* Step 6 – Income Details (1/2) */
const Step6IncomeDetails = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const { setValue, getValues } = useFormContext<EmploymentFormValues>();
  const isSalary = useWatch<EmploymentFormValues, "incomeDetails.isSalary">({ name: "incomeDetails.isSalary" });
  const payType: "salary" | "hourly" = isSalary ? "salary" : "hourly";
  const setPayType = (t: "salary" | "hourly") =>
    setValue("incomeDetails.isSalary", t === "salary", { shouldDirty: true });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <BackRow onBack={onBack} />
      <StepHeader title="Income Details" counter="1 of 2" />

      <Box>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary", mb: 1 }}>
          How are you paid? <Req />
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {(["salary", "hourly"] as const).map((t) => (
            <Button
              key={t}
              onClick={() => setPayType(t)}
              sx={{
                flex: 1,
                textTransform: "capitalize",
                fontWeight: 700,
                borderRadius: "8px",
                border: `2px solid ${payType === t ? PRIMARY : "#E5E8F5"}`,
                bgcolor: payType === t ? "#EEF2FF" : "#fff",
                color: payType === t ? PRIMARY : "text.secondary",
                fontSize: "0.85rem",
                py: 0.8,
                "&:hover": { bgcolor: "#EEF2FF" },
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </Box>
      </Box>

      {isSalary ? (
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }}>
          Base Pay <Req />
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <MoneyField
            name="incomeDetails.basePay"
            placeholder="120,000"
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.9rem" } }}
          />
          <BoundSelect
            name="incomeDetails.basePayFrequency"
            options={payFrequencyOptions}
            sx={{ width: 100, borderRadius: "8px", fontSize: "0.85rem" }}
          />
        </Box>
      </Box>
      ) : (
      <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }}>
            Hourly Rate <Req />
          </Typography>
          <MoneyField
            name="incomeDetails.hourlyRate"
            placeholder="25.00"
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.9rem" } }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }}>
            Hours per Week <Req />
          </Typography>
          <BoundTextField
            name="incomeDetails.hoursPerWeek"
            placeholder="40"
            size="small"
            fullWidth
            inputProps={{ inputMode: "numeric", maxLength: 3 }}
            onValueChange={() => undefined}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.9rem" } }}
          />
        </Box>
      </Box>
      )}

      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 1 }}>
          Additional Income <span style={{ color: "#6B7280" }}>(optional)</span>
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {additionalRows.map((row) => (
            <Box key={row.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BoundCheckbox
                name={row.toggle}
                size="small"
                sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY }, p: 0 }}
              />
              <Typography sx={{ fontSize: "0.82rem", width: 84, flexShrink: 0, color: "text.primary" }}>
                {row.label}
              </Typography>
              <MoneyField
                name={row.amount}
                placeholder="$"
                onValueChange={(v) =>
                  setValue(row.toggle, toggleAfterAmountChange(!!getValues(row.toggle), v), { shouldDirty: true })
                }
                sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.85rem" } }}
              />
              <BoundSelect
                name={row.freq}
                options={payFrequencyOptions}
                sx={{ width: 90, borderRadius: "8px", fontSize: "0.8rem" }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
    </Box>
  );
};

export default Step6IncomeDetails;
