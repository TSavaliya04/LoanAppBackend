import { Paper, Box, Typography } from "@mui/material";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

import { useFormContext, useWatch } from "react-hook-form";
import type { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";

export function BorrowerProfile({ activeScenario, onOpenDebts }: { activeScenario: any, onOpenDebts?: () => void }) {
  const { control } = useFormContext<CombinedPreApprovalFormData>();
  const sharedIncomeData = useWatch({
    control,
    name: "scenarios.0.borrowersIncomeData.borrowerIncome"
  });
  const occupancyStatus = useWatch({
    control,
    name: "scenarios.0.purchaseInfo.occupancyStatus"
  });
  const netMonthlyImpactToDTI = useWatch({
    control,
    name: "scenarios.0.propertyIncomeOffset.netMonthlyImpactToDTI"
  });

  let totalIncome = 0;
  let totalDebts = 0;
  const purchasePrice = activeScenario?.purchaseInfo?.purchasePrice || 0;

  (sharedIncomeData || [])?.forEach((income: any) => {
    totalIncome += Number(income.monthlyIncome) || 0;
    income.debts?.forEach((debt: any) => {
      totalDebts += Number(debt.monthlyPayment) || 0;
    });
  });

  if (occupancyStatus === "3") {
    totalDebts += Number(Math.abs(netMonthlyImpactToDTI)) || 0;
  }

  const stats = [
    { label: "Income", value: `${currency.format(totalIncome)}/mo`, id: "income" },
    { label: "Purchase Price", value: currency.format(purchasePrice), id: "purchase" },
    { label: "Debts", value: `${currency.format(totalDebts)}/mo`, id: "debts", onClick: onOpenDebts },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "28px",
        backgroundColor: "rgba(255, 255, 255, 0.82)",
        border: "1px solid rgba(109, 76, 196, 0.14)",
        backdropFilter: "blur(18px)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", mb: 2 }}>
        <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: 700, m: 0 }}>
          Borrower Profile
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
        {stats.map((item) => (
          <Box
            key={item.id}
            onClick={item.onClick}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "6px",
              minWidth: 0,
              padding: "12px 14px",
              borderRadius: "16px",
              backgroundColor: item.onClick ? "rgba(122, 63, 242, 0.08)" : "rgba(255, 255, 255, 0.58)",
              border: item.onClick ? "1px solid rgba(122, 63, 242, 0.2)" : "1px solid rgba(122, 63, 242, 0.1)",
              cursor: item.onClick ? "pointer" : "default",
              transition: "all 0.2s ease",
              "&:hover": item.onClick ? {
                backgroundColor: "rgba(122, 63, 242, 0.12)",
                transform: "translateY(-1px)",
              } : {}
            }}
          >
            <Typography sx={{ color: "#74689c", fontSize: "0.72rem", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              {item.label}
            </Typography>
            <Typography sx={{ lineHeight: 1.15, fontSize: "1.02rem", fontWeight: 800 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
