import type { Borrower, Scenario } from "@/lib/refinance-scenario-data";
import { Box, Typography, Chip, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import { useFormContext, useWatch } from "react-hook-form";
import type { CombinedRefinancePreApprovalFormData as CombinedPreApprovalFormData } from "@/api/models/refinance/combinedPreApprovalSchema";
import { useEffect } from "react";

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

type ScenarioCardProps = {
  index: number;
  isRecommended: boolean;
  isActive: boolean;
  onSelect: () => void;
};

export function RefinanceScenarioCard({
  index,
  isRecommended,
  isActive,
  onSelect,
}: ScenarioCardProps) {
  const { control } = useFormContext<CombinedPreApprovalFormData>();
  const formValues = useWatch({ control });

  const scenarioData = formValues?.scenarios?.[index];
  const firstScenarioData = formValues?.scenarios?.[0];

  const backEndRatio = Number(scenarioData?.loanProgram?.backEndRatio || 0);
  const frontEndRatio = Number(scenarioData?.loanProgram?.frontEndRatio || 0);

  const getDtiStyles = (value: number) => {
    if (value <= 36) {
      return { label: "Strong", color: "#2e7d32", bgColor: "rgba(46, 125, 50, 0.11)" };
    } else if (value <= 43) {
      return { label: "Good", color: "#2e7d32", bgColor: "rgba(46, 125, 50, 0.11)" };
    } else if (value <= 50) {
      return { label: "High", color: "#e65100", bgColor: "rgba(230, 81, 0, 0.11)" };
    } else {
      return { label: "Very High", color: "#d32f2f", bgColor: "rgba(211, 47, 47, 0.11)" };
    }
  };

  const getDtiIcon = (label: string, color: string) => {
    const iconProps = { sx: { fontSize: "13px !important", color: `${color} !important` } };
    switch (label) {
      case "Strong":
      case "Good":
        return <CheckCircleIcon {...iconProps} />;
      case "High":
        return <WarningIcon {...iconProps} />;
      case "Very High":
        return <ErrorIcon {...iconProps} />;
      default:
        return undefined;
    }
  };

  const frontEndStyles = getDtiStyles(frontEndRatio);
  const backEndStyles = getDtiStyles(backEndRatio);

  const estimatedPropertyValue = useWatch({
    control,
    name: `scenarios.${index}.refinanceInfo.estimatedPropertyValue`,
  });

  const scenarioMapping: Record<string, string> = {
    "1": "Non QM", "2": "Conventional", "3": "FHA",
  };

  const loanTypeRaw = scenarioData?.loanStructure?.loanProgram;
  const loanType = scenarioMapping[String(loanTypeRaw)] || "";

  const interestRate = Number(scenarioData?.refinanceInfo?.interestRate || 0);
  const currentLoanBalance = Number(scenarioData?.refinanceInfo?.currentLoanBalance || 0);
  const loanAmount = Number(scenarioData?.refinanceInfo?.loanAmount || 0);
  const ltv = estimatedPropertyValue > 0 ? (loanAmount / estimatedPropertyValue) * 100 : 0;

  // const principalAndInterest = Number(scenarioData?.loanProgram?.principalAndInterest || 0);
  const principalAndInterest = useWatch({
    control,
    name: `scenarios.${index}.loanProgram.principalAndInterest`,
  });
  // useEffect(() => {
  //   console.log("principalAndInterest =>", principalAndInterest);
  // }, [principalAndInterest]);
  const propertyTaxMonthly = Number(scenarioData?.refinanceInfo?.monthlyTaxAmount || 0);
  const hazardInsuranceMonthly = Number(scenarioData?.refinanceInfo?.hazardInsurance || 0);
  const mortgageInsuranceMonthly = Number(scenarioData?.refinanceInfo?.mi || 0);
  const hoaMonthly = Number(scenarioData?.refinanceInfo?.associationFee || 0);
  const monthlyTotal = Number(scenarioData?.loanProgram?.monthlyTotal || 0);

  const closingCosts = Number(scenarioData?.loanProgram?.clearingCart || 0);

  const totalDebtToBePaidOff = firstScenarioData?.borrowersIncomeData?.borrowerIncome
    ?.flatMap((borrower: any) => borrower.debts)
    ?.filter((debt: any) => debt.debtToBePaidOff === true)
    ?.reduce((sum: number, debt: any) => sum + debt.monthlyPayment, 0) ?? 0;


  const cashToClose =
    Number(scenarioData?.refinanceInfo?.loanAmount || 0) -
    Number(scenarioData?.refinanceInfo?.currentLoanBalance || 0) -
    Number(scenarioData?.loanProgram?.clearingCart || 0) -
    Number(totalDebtToBePaidOff || 0);


  return (
    <Box sx={{ display: "grid", gap: "8px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "0 6px" }}>
        <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#5620d2" }}>
          Scenario {index + 1}
        </Typography>
        {isActive ? (
          <Chip
            label="Editing in drawer"
            size="small"
            sx={{
              backgroundColor: "rgba(122, 63, 242, 0.12)",
              color: "#5620d2",
              fontSize: "0.72rem",
              fontWeight: 800,
              height: "24px",
              "& .MuiChip-label": { padding: "0 10px" }
            }}
          />
        ) : null}
      </Box>

      <Box
        component="button"
        type="button"
        onClick={onSelect}
        sx={{
          textAlign: "left",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          fontFamily: "inherit",
          border: 0,
          cursor: "pointer",
          p: 0,
          overflow: "hidden",
          borderRadius: "18px",
          backgroundColor: isRecommended ? "transparent" : "rgba(255, 255, 255, 0.96)",
          background: isRecommended
            ? "linear-gradient(180deg, rgba(122, 63, 242, 0.09) 0%, rgba(255, 255, 255, 0.96) 30%), rgba(255, 255, 255, 0.96)"
            : "rgba(255, 255, 255, 0.96)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: isActive ? "rgba(86, 32, 210, 0.55)" : "rgba(122, 63, 242, 0.12)",
          boxShadow: isActive ? "inset 0 0 0 3px rgba(86, 32, 210, 0.3), 0 18px 34px rgba(86, 32, 210, 0.12)" : "none",
          transition: "transform 0.18s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #7a3ff2, #24b8d9)",
          }
        }}
      >
        <Box sx={{ padding: "16px", width: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(248, 250, 252, 0.6)",
            borderRadius: "16px",
            padding: "16px 20px",
            border: "1px solid rgba(226, 232, 240, 0.8)"
          }}>
            {/* Front-End DTI Block */}
            <Box sx={{ flex: 1, display: "flex", gap: "14px", alignItems: "center" }}>
              <Box sx={{
                width: "40px",
                height: "38px",
                borderRadius: "8px",
                backgroundColor: "rgba(122, 63, 242, 0.08)",
                color: "#5620d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                fontWeight: 700,
                flexShrink: 0
              }}>
                DTI
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <Typography sx={{ color: "#475569", fontSize: "0.75rem", fontWeight: 600 }}>
                  Front-End DTI
                </Typography>
                <Typography sx={{ color: "#0f172a", fontSize: "1.25rem", fontWeight: 800, lineHeight: 1.1 }}>
                  {percent.format(frontEndRatio)}%
                </Typography>
                <Chip
                  icon={getDtiIcon(frontEndStyles.label, frontEndStyles.color)}
                  label={frontEndStyles.label}
                  size="small"
                  sx={{
                    width: "fit-content",
                    backgroundColor: frontEndStyles.bgColor,
                    color: frontEndStyles.color,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    height: "20px",
                    marginTop: "2px",
                    "& .MuiChip-label": { padding: "0 8px", paddingLeft: "2px" },
                    "& .MuiChip-icon": { marginLeft: "6px", marginRight: "2px" }
                  }}
                />
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(226, 232, 240, 0.8)", margin: "0 16px" }} />

            {/* Back-End DTI Block */}
            <Box sx={{ flex: 1, display: "flex", gap: "14px", alignItems: "center" }}>
              <Box sx={{
                width: "40px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "rgba(122, 63, 242, 0.08)",
                color: "#5620d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                fontWeight: 700,
                flexShrink: 0
              }}>
                DTI
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <Typography sx={{ color: "#475569", fontSize: "0.75rem", fontWeight: 600 }}>
                  Back-End DTI
                </Typography>
                <Typography sx={{ color: "#0f172a", fontSize: "1.25rem", fontWeight: 800, lineHeight: 1.1 }}>
                  {percent.format(backEndRatio)}%
                </Typography>
                <Chip
                  icon={getDtiIcon(backEndStyles.label, backEndStyles.color)}
                  label={backEndStyles.label}
                  size="small"
                  sx={{
                    width: "fit-content",
                    backgroundColor: backEndStyles.bgColor,
                    color: backEndStyles.color,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    height: "20px",
                    marginTop: "2px",
                    "& .MuiChip-label": { padding: "0 8px", paddingLeft: "2px" },
                    "& .MuiChip-icon": { marginLeft: "6px", marginRight: "2px" }
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gap: "6px", margin: "14px 0 12px" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
              <Typography component="span" sx={{ color: "#74689c" }}>Property Value</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{currency.format(estimatedPropertyValue)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
              <Typography component="span" sx={{ color: "#74689c" }}>Loan Type</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{loanType}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
              <Typography component="span" sx={{ color: "#74689c" }}>Interest Rate</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{percent.format(interestRate)}%</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
              <Typography component="span" sx={{ color: "#74689c" }}>LTV</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{percent.format(ltv)}%</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 14px", padding: "9px 12px", borderRadius: "12px", border: "1px solid rgba(25, 35, 74, 0.08)", backgroundColor: "rgba(247, 248, 252, 0.92)", color: "#20144d", fontWeight: 700 }}>
            <Typography component="span" sx={{ color: "#74689c" }}>Loan Amount</Typography>
            <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{currency.format(loanAmount)}</Typography>
          </Box>

          <Box sx={{ display: "grid", gap: "10px", paddingTop: "12px", borderTop: "1px solid rgba(32, 20, 77, 0.08)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" sx={{ color: "#000000" }}>Principal & Interest</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{preciseCurrency.format(principalAndInterest)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" sx={{ color: "#000000" }}>Property Tax</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{preciseCurrency.format(propertyTaxMonthly)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" >Haz Insurance</Typography>
              <Typography component="strong" sx={{ fontWeight: 700 }}>{preciseCurrency.format(hazardInsuranceMonthly)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" sx={{ color: "#000000" }}>Mortgage Insurance</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>
                {mortgageInsuranceMonthly > 0 ? preciseCurrency.format(mortgageInsuranceMonthly) : "-"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" sx={{ color: "#000000" }}>HOA</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>
                {hoaMonthly > 0 ? preciseCurrency.format(hoaMonthly) : "-"}
              </Typography>
            </Box>
            <Box sx={{ mt: "6px", padding: "11px 13px", borderRadius: "12px", border: "1px solid rgba(122, 63, 242, 0.18)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, rgba(122, 63, 242, 0.18), rgba(122, 63, 242, 0.08)), rgba(255, 255, 255, 0.96)", boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.58), 0 8px 18px rgba(122, 63, 242, 0.08)" }}>
              <Typography component="span" sx={{ color: "#5620d2", fontSize: "0.98rem", fontWeight: 800 }}>Monthly Total</Typography>
              <Typography component="strong" sx={{ color: "#5620d2", fontSize: "1.12rem", lineHeight: 1.1, fontWeight: 800 }}>{preciseCurrency.format(monthlyTotal)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gap: "8px", mt: "14px", padding: "12px", borderRadius: "14px", border: "1px solid rgba(122, 63, 242, 0.12)", background: "linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(122, 63, 242, 0.04)), rgba(255, 255, 255, 0.92)" }}>
            <Typography sx={{ color: "#5620d2", fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Transaction Summary
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" sx={{ fontSize: "inherit", color: "#74689c" }}>Mortgage Payoff</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{currency.format(currentLoanBalance)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" sx={{ fontSize: "inherit", color: "#74689c" }}>Estimated Closing Costs</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{currency.format(closingCosts)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" sx={{ fontSize: "inherit", color: "#74689c" }}>New Loan Amount</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{currency.format(loanAmount)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" sx={{ fontSize: "inherit", color: "#74689c" }}>Debt to be paid off</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "#000000" }}>{currency.format(totalDebtToBePaidOff)}</Typography>
            </Box>
            {/* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.92rem", gap: "18px" }}>
              <Typography component="span" sx={{ fontSize: "inherit", color: "#74689c" }}>Lender Credit</Typography>
              <Typography component="strong" sx={{ fontWeight: 700, color: "red" }}>-{currency.format(lenderCredit)}</Typography>
            </Box> */}
            <Box sx={{
              mt: "6px",
              padding: "11px 13px",
              borderRadius: "12px",
              border: cashToClose >= 0
                ? "1px solid rgba(34, 197, 94, 0.28)"
                : "1px solid rgba(239, 68, 68, 0.28)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: cashToClose >= 0
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(34, 197, 94, 0.08)), rgba(255, 255, 255, 0.96)"
                : "linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(239, 68, 68, 0.08)), rgba(255, 255, 255, 0.96)",
              boxShadow: cashToClose >= 0
                ? "inset 0 1px 0 rgba(255, 255, 255, 0.58), 0 8px 18px rgba(34, 197, 94, 0.08)"
                : "inset 0 1px 0 rgba(255, 255, 255, 0.58), 0 8px 18px rgba(239, 68, 68, 0.08)"
            }}>
              <Typography component="span" sx={{
                color: cashToClose >= 0 ? "#16a34a" : "#dc2626",
                fontSize: "0.98rem",
                fontWeight: 800
              }}>
                {cashToClose >= 0 ? "Cash to Borrower" : "Cash to Close"}
              </Typography>
              <Typography component="strong" sx={{
                color: cashToClose >= 0 ? "#16a34a" : "#dc2626",
                fontSize: "1.12rem",
                lineHeight: 1.1,
                fontWeight: 800
              }}>
                {currency.format(Math.abs(cashToClose))}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
