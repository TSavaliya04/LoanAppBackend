import { recommendationCopyByGoal, type GoalId, type Scenario } from "@/lib/refinance-scenario-data";
import { Paper, Box, Typography, Chip } from "@mui/material";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

type RecommendationPanelProps = {
  activeGoal: GoalId;
  scenario: Scenario;
  metrics: {
    totalPayment: number;
    cashToClose: number;
  };
  activeFullScenario?: any;
};

export function RecommendationPanel({
  activeGoal,
  scenario,
  metrics,
  activeFullScenario,
}: RecommendationPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        padding: "16px",
        borderRadius: "28px",
        backgroundColor: "rgba(255, 255, 255, 0.82)",
        border: "1px solid rgba(109, 76, 196, 0.14)",
        backdropFilter: "blur(18px)",
        mb: "14px"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", mb: 2 }}>
        <Box>
          <Typography sx={{ margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.69rem", color: "#74689c" }}>
            System pick
          </Typography>
          <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: 700, m: 0 }}>
            Recommendation
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "14px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(49, 179, 122, 0.12), rgba(36, 184, 217, 0.07)), rgba(255, 255, 255, 0.62)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <Box>
            <Typography sx={{ margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.69rem", color: "#74689c" }}>
              Recommended scenario
            </Typography>
            <Typography sx={{ fontSize: "0.96rem", fontWeight: 800, lineHeight: 1.2 }}>
              {scenario.name}
            </Typography>
          </Box>
          <Chip label="Best Fit" size="small" sx={{ backgroundColor: "rgba(49, 179, 122, 0.12)", color: "#19744d", fontWeight: 700, fontSize: "0.75rem", borderRadius: "10px" }} />
        </Box>
        <Box>
          <Typography sx={{ lineHeight: 1.42, fontSize: "0.84rem", color: "#74689c" }}>
            {recommendationCopyByGoal[activeGoal]}
          </Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", paddingTop: "2px" }}>
          <Box sx={{ padding: "10px 11px", borderRadius: "14px", backgroundColor: "rgba(255, 255, 255, 0.7)", textAlign: "center" }}>
            <Typography sx={{ display: "block", marginBottom: "4px", color: "#74689c", fontSize: "0.78rem" }}>
              Monthly payment
            </Typography>
            <Typography component="strong" sx={{ display: "block", fontSize: "1rem", whiteSpace: "nowrap", fontWeight: 700 }}>
              <strong>{currency.format(metrics.totalPayment)}</strong>
            </Typography>
          </Box>
          <Box sx={{ padding: "10px 11px", borderRadius: "14px", backgroundColor: "rgba(255, 255, 255, 0.7)", textAlign: "center" }}>
            <Typography sx={{ display: "block", marginBottom: "4px", color: "#74689c", fontSize: "0.78rem" }}>
              {metrics.cashToClose >= 0 ? "Cash to Borrower" : "Cash to Close"}
            </Typography>
            <Typography component="strong" sx={{ display: "block", fontSize: "1rem", whiteSpace: "nowrap", fontWeight: 700 }}>
              <strong>{currency.format(Math.abs(metrics.cashToClose))}</strong>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
