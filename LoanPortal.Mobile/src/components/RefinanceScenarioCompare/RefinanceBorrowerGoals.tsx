import { goalConfig, type GoalId } from "@/lib/refinance-scenario-data";
import { Paper, Box, Typography, Button } from "@mui/material";

type BorrowerGoalsProps = {
  activeGoal: GoalId;
  onSelect: (goal: GoalId) => void;
  onGenerateAI?: () => void;
};



export function BorrowerGoals({ activeGoal, onSelect, onGenerateAI }: BorrowerGoalsProps) {
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
          Borrower Goals
        </Typography>

      </Box>
      <Box sx={{ display: "grid", gap: "10px", alignContent: "start" }}>
        {goalConfig.map((goal) => (
          <Button
            key={goal.id}
            onClick={() => onSelect(goal.id)}
            sx={{
              display: "grid",
              gridTemplateColumns: "18px minmax(0, 1fr)",
              alignItems: "center",
              columnGap: "12px",
              width: "100%",
              minHeight: "56px",
              padding: "14px",
              borderRadius: "16px",
              border: "1px solid",
              borderColor: activeGoal === goal.id ? "rgba(122, 63, 242, 0.24)" : "rgba(122, 63, 242, 0.12)",
              backgroundColor: activeGoal === goal.id ? "transparent" : "rgba(255, 255, 255, 0.58)",
              backgroundImage: activeGoal === goal.id ? "linear-gradient(135deg, rgba(122, 63, 242, 0.11), rgba(36, 184, 217, 0.09))" : "none",
              color: "#20144d",
              textAlign: "left",
              textTransform: "none",
              boxShadow: activeGoal === goal.id ? "inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 10px 22px rgba(122, 63, 242, 0.08)" : "none",
            }}
          >
            <Box
              sx={{
                display: "inline-grid",
                placeItems: "center",
                width: "18px",
                height: "18px",
                borderRadius: "999px",
                border: "1.5px solid rgba(122, 63, 242, 0.24)",
                backgroundColor: "rgba(255, 255, 255, 0.88)",
                "&::after": {
                  content: '""',
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  backgroundColor: activeGoal === goal.id ? "#7a3ff2" : "transparent"
                }
              }}
            />
            <Typography sx={{ fontSize: "0.97rem", fontWeight: 600 }}>
              {goal.label}
            </Typography>
          </Button>
        ))}
        <Box
          sx={{
            marginTop: "4px",
            padding: "14px 14px 12px",
            borderRadius: "16px",
            border: "1px solid rgba(122, 63, 242, 0.12)",
            background: "linear-gradient(135deg, rgba(122, 63, 242, 0.08), rgba(36, 184, 217, 0.06)), rgba(255, 255, 255, 0.8)",
          }}
        >
          <Typography sx={{ display: "block", marginBottom: "6px", color: "#74689c", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Active Goal
          </Typography>
          <Typography sx={{ display: "block", marginBottom: "6px", fontSize: "0.98rem", lineHeight: 1.2, fontWeight: 700 }}>
            {goalConfig.find((g) => g.id === activeGoal)?.label}
          </Typography>
          <Typography sx={{ fontSize: "0.86rem", lineHeight: 1.35, color: "#74689c" }}>
            Recommendations prioritize this borrower outcome first.
          </Typography>
        </Box>
        {/* Generate AI Strategy button */}
        <Button
          onClick={onGenerateAI}
          startIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L19 6L15.45 11.11L22 12L15.45 12.89L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.89L2 12L8.55 11.11L5 6L10.91 8.26L12 2Z" fill="white" fillOpacity="0.9"/>
              <path d="M6 2L6.5 4.5L9 5L6.5 5.5L6 8L5.5 5.5L3 5L5.5 4.5L6 2Z" fill="white"/>
              <path d="M19 1L19.4 2.6L21 3L19.4 3.4L19 5L18.6 3.4L17 3L18.6 2.6L19 1Z" fill="white"/>
            </svg>
          }
          sx={{
            marginTop: "12px",
            width: "100%",
            padding: "13px 20px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #5b21e6 0%, #7a3ff2 50%, #9b6ef7 100%)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "0.93rem",
            textTransform: "none",
            letterSpacing: "0.01em",
            boxShadow: "0 4px 18px rgba(122, 63, 242, 0.38), inset 0 1px 0 rgba(255,255,255,0.18)",
            transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "&:hover": {
              background: "linear-gradient(135deg, #4c17d4 0%, #6b2fe0 50%, #8a5ef5 100%)",
              boxShadow: "0 6px 24px rgba(122, 63, 242, 0.52), inset 0 1px 0 rgba(255,255,255,0.22)",
              transform: "translateY(-1px) scale(1.01)",
            },
            "&:active": {
              transform: "translateY(0px) scale(0.99)",
              boxShadow: "0 2px 10px rgba(122, 63, 242, 0.3)",
            },
          }}
        >
          Generate AI Strategy
        </Button>
      </Box>
    </Paper>
  );
}
