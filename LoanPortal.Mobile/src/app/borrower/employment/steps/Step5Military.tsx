"use client";
import React from "react";
import { Box, Typography, FormControlLabel } from "@mui/material";
import { useWatch } from "react-hook-form";
import { militaryPayFrequencyOptions } from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues } from "../formModel";
import { BackRow, BoundCheckbox, FSelect, MoneyField, PRIMARY, PrimaryBtn, Req } from "./primitives";

type Toggle = keyof EmploymentFormValues["militaryToggles"];
type AmountField =
  | "bahAmount"
  | "basAmount"
  | "vhaAmount"
  | "flightPayAmount"
  | "hazardPayAmount"
  | "specialPayAmount"
  | "otherPayAmount";

const allowances: { label: string; toggle: Toggle; amount: AmountField; placeholder: string }[] = [
  { label: "Basic Allowance for Housing (BAH)", toggle: "bah", amount: "bahAmount", placeholder: "2,400.00" },
  { label: "Basic Allowance for Subsistence (BAS)", toggle: "bas", amount: "basAmount", placeholder: "460.00" },
  { label: "Variable Housing Allowance (VHA)", toggle: "vha", amount: "vhaAmount", placeholder: "0.00" },
];

const otherIncome: { label: string; toggle: Toggle; amount: AmountField }[] = [
  { label: "Flight Pay", toggle: "flight", amount: "flightPayAmount" },
  { label: "Hazard Pay", toggle: "hazard", amount: "hazardPayAmount" },
  { label: "Special Pay", toggle: "special", amount: "specialPayAmount" },
  { label: "Other", toggle: "other", amount: "otherPayAmount" },
];

/* Step 5 MIL – Military Income Details */
const Step5Military = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const toggles = useWatch<EmploymentFormValues, "militaryToggles">({ name: "militaryToggles" });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <BackRow onBack={onBack} />
      <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary" }}>
        Military Income
      </Typography>

      {/* Base Pay */}
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary", mb: 1 }}>
          Base Pay
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ width: "100%" }}>
            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }}>
              Monthly Base Pay <Req />
            </Typography>
            <MoneyField
              fullWidth
              name="militaryService.monthlyBasePay"
              placeholder="3,500.00"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.9rem", backgroundColor: "#fff" } }}
            />
          </Box>
          <FSelect
            label="Pay Frequency"
            options={militaryPayFrequencyOptions}
            name="militaryService.basePayFrequency"
          />
        </Box>
      </Box>

      {/* Allowances */}
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary", mb: 1 }}>
          Allowances{" "}
          <span style={{ fontWeight: 400, color: "#6B7280", fontSize: "0.82rem" }}>(if applicable)</span>
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {allowances.map((item) => {
            const checked = !!toggles?.[item.toggle];
            return (
              <Box key={item.label}>
                <FormControlLabel
                  control={
                    <BoundCheckbox
                      name={`militaryToggles.${item.toggle}`}
                      size="small"
                      sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY }, p: 0.5 }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.82rem", color: "text.primary" }}>
                      {item.label}
                    </Typography>
                  }
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 3.5 }}>
                  <MoneyField
                    name={`militaryService.${item.amount}`}
                    placeholder={item.placeholder}
                    disabled={!checked}
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.88rem", backgroundColor: checked ? "#fff" : "#F9FAFB" },
                    }}
                  />
                  <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", flexShrink: 0 }}>
                    / month
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Other Military Income */}
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary", mb: 1 }}>
          Other Military Income{" "}
          <span style={{ fontWeight: 400, color: "#6B7280", fontSize: "0.82rem" }}>(optional)</span>
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {otherIncome.map((item) => {
            const checked = !!toggles?.[item.toggle];
            return (
              <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BoundCheckbox
                  name={`militaryToggles.${item.toggle}`}
                  size="small"
                  sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY }, p: 0.5 }}
                />
                <Typography sx={{ fontSize: "0.82rem", width: 90, flexShrink: 0, color: "text.primary" }}>
                  {item.label}
                </Typography>
                <MoneyField
                  name={`militaryService.${item.amount}`}
                  placeholder="0.00"
                  disabled={!checked}
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.85rem", backgroundColor: checked ? "#fff" : "#F9FAFB" },
                  }}
                />
                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", flexShrink: 0 }}>
                  / month
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
    </Box>
  );
};

export default Step5Military;
