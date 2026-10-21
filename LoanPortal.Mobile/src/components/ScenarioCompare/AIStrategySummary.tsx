"use client";

import { goalConfig, type GoalId, type Scenario } from "@/lib/scenario-data";
import { Paper, Box, Typography, Chip, CircularProgress } from "@mui/material";

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

type AIStrategySummaryProps = {
    activeGoal: GoalId;
    scenario: Scenario;
    activeFullScenario?: any;
    /** Controlled: pass true after "Generate AI Strategy" is clicked */
    isGenerated?: boolean;
    /** True while the API call is in-flight */
    isLoading?: boolean;
    /** The raw data returned from the AI strategy API */
    summaryData?: any;
    /** Error message if the API call failed */
    error?: string | null;
    /** Called when user clicks "Expand AI Strategy" to open the sidebar */
    onOpenSidebar?: () => void;
};

// ─── Sparkle SVG icon (matches screenshot) ─────────────────────────────────
function SparkleIcon({ size = 56, color = "#5b21e6" }: { size?: number; color?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 2L13.09 8.26L19 6L15.45 11.11L22 12L15.45 12.89L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.89L2 12L8.55 11.11L5 6L10.91 8.26L12 2Z"
                fill={color}
                fillOpacity="0.85"
            />
            <path d="M6 2L6.5 4.5L9 5L6.5 5.5L6 8L5.5 5.5L3 5L5.5 4.5L6 2Z" fill={color} />
            <path d="M19 1L19.4 2.6L21 3L19.4 3.4L19 5L18.6 3.4L17 3L18.6 2.6L19 1Z" fill={color} />
        </svg>
    );
}

// ─── Feature row used in the before-state ───────────────────────────────────
function FeatureRow({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "14px",
                backgroundColor: "rgba(255,255,255,0.56)",
                border: "1px solid rgba(122, 63, 242, 0.10)",
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, rgba(122, 63, 242, 0.12), rgba(36, 184, 217, 0.08))",
                    border: "1px solid rgba(122, 63, 242, 0.13)",
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography sx={{ fontSize: "0.87rem", fontWeight: 700, color: "#20144d", lineHeight: 1.3 }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: "0.79rem", color: "#74689c", lineHeight: 1.35, mt: "2px" }}>
                    {description}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Before-state panel ─────────────────────────────────────────────────────
function BeforeGeneration({ activeGoal }: { activeGoal: GoalId }) {
    const selectedGoalLabel = goalConfig.find((g) => g.id === activeGoal)?.label ?? "";

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Header row */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Small sparkle for header */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 2L13.09 8.26L19 6L15.45 11.11L22 12L15.45 12.89L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.89L2 12L8.55 11.11L5 6L10.91 8.26L12 2Z"
                            fill="#5b21e6"
                            fillOpacity="0.85"
                        />
                        <path d="M6 2L6.5 4.5L9 5L6.5 5.5L6 8L5.5 5.5L3 5L5.5 4.5L6 2Z" fill="#5b21e6" />
                        <path d="M19 1L19.4 2.6L21 3L19.4 3.4L19 5L18.6 3.4L17 3L18.6 2.6L19 1Z" fill="#5b21e6" />
                    </svg>
                    <Typography
                        sx={{
                            fontSize: "0.69rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.13em",
                            color: "#20144d",
                        }}
                    >
                        AI Strategy Summary
                    </Typography>
                </Box>
                <Chip
                    label="New"
                    size="small"
                    sx={{
                        height: "20px",
                        backgroundColor: "rgba(49, 179, 122, 0.14)",
                        color: "#19744d",
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        borderRadius: "8px",
                        px: "2px",
                    }}
                />
            </Box>

            {/* Hero illustration area */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "10px",
                    py: "12px",
                }}
            >
                <Box
                    sx={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "20px",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(135deg, rgba(122, 63, 242, 0.13), rgba(36, 184, 217, 0.09))",
                        border: "1.5px solid rgba(122, 63, 242, 0.16)",
                        boxShadow: "0 4px 20px rgba(122, 63, 242, 0.12)",
                    }}
                >
                    <SparkleIcon size={36} color="#7a3ff2" />
                </Box>
                <Box>
                    <Typography
                        sx={{
                            fontSize: "1.02rem",
                            fontWeight: 800,
                            color: "#20144d",
                            lineHeight: 1.3,
                            mb: "6px",
                        }}
                    >
                        Get your AI-powered<br />strategy recommendation
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: "0.82rem",
                            color: "#74689c",
                            lineHeight: 1.5,
                            maxWidth: "210px",
                            mx: "auto",
                        }}
                    >
                        Click the button in the left panel to generate a personalized strategy based on your goal and scenario comparison.
                    </Typography>
                </Box>
            </Box>

            {/* Selected goal chip */}
            <Box
                sx={{
                    padding: "10px 14px",
                    borderRadius: "14px",
                    border: "1px solid rgba(122, 63, 242, 0.16)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                }}
            >
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#74689c", textTransform: "uppercase", letterSpacing: "0.1em", mb: "6px" }}>
                    Your selected goal:
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Box
                        sx={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "999px",
                            backgroundColor: "#7a3ff2",
                            flexShrink: 0,
                        }}
                    />
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#20144d" }}>
                        {selectedGoalLabel}
                    </Typography>
                </Box>
            </Box>

            {/* Feature rows */}
            <Box sx={{ display: "grid", gap: "8px" }}>
                <FeatureRow
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#7a3ff2" strokeWidth="1.5" strokeOpacity="0.7" />
                            <path d="M8 12C8 9.8 9.8 8 12 8s4 1.8 4 4-1.8 4-4 4" stroke="#7a3ff2" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="2" fill="#7a3ff2" fillOpacity="0.7" />
                        </svg>
                    }
                    title="Personalized Analysis"
                    description="AI will analyze both scenarios against your goal"
                />
                <FeatureRow
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="8" height="8" rx="2" stroke="#7a3ff2" strokeWidth="1.5" strokeOpacity="0.7" />
                            <rect x="13" y="3" width="8" height="8" rx="2" stroke="#7a3ff2" strokeWidth="1.5" strokeOpacity="0.7" />
                            <rect x="3" y="13" width="8" height="8" rx="2" stroke="#7a3ff2" strokeWidth="1.5" strokeOpacity="0.7" />
                            <path d="M13 17h8M17 13v8" stroke="#7a3ff2" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    }
                    title="Smart Recommendations"
                    description="Get specific insights and suggestions"
                />
                <FeatureRow
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12h6M9 8h6M9 16h4" stroke="#7a3ff2" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#7a3ff2" strokeWidth="1.5" strokeOpacity="0.7" />
                        </svg>
                    }
                    title="Best Fit Scenario"
                    description="See which scenario best aligns with your objective"
                />
            </Box>

            {/* Footer CTA */}
            <Box
                sx={{
                    textAlign: "center",
                    padding: "14px 12px 10px",
                    borderTop: "1px solid rgba(122, 63, 242, 0.10)",
                    mt: "2px",
                }}
            >
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#20144d", mb: "4px" }}>
                    Ready to get started?
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#74689c", lineHeight: 1.45 }}>
                    Click "Generate AI Strategy" to receive your personalized recommendation.
                </Typography>
            </Box>
        </Box>
    );
}

// ─── After-state panel ──────────────────────────────────────────────────────
function AfterGeneration({
    activeGoal,
    scenario,
    activeFullScenario,
    summaryData,
    error,
    onOpenSidebar,
}: {
    activeGoal: GoalId;
    scenario: Scenario;
    activeFullScenario?: any;
    summaryData?: any;
    error?: string | null;
    onOpenSidebar?: () => void;
}) {
    const rec = summaryData?.recommendedScenario;
    const scenarioNarratives: { scenarioNo: number; label: string; highlights: string[] }[] =
        summaryData?.scenarioNarratives ?? [];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* ── Header ── */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L13.09 8.26L19 6L15.45 11.11L22 12L15.45 12.89L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.89L2 12L8.55 11.11L5 6L10.91 8.26L12 2Z" fill="#5b21e6" fillOpacity="0.85" />
                        <path d="M6 2L6.5 4.5L9 5L6.5 5.5L6 8L5.5 5.5L3 5L5.5 4.5L6 2Z" fill="#5b21e6" />
                        <path d="M19 1L19.4 2.6L21 3L19.4 3.4L19 5L18.6 3.4L17 3L18.6 2.6L19 1Z" fill="#5b21e6" />
                    </svg>
                    <Typography sx={{ fontSize: "0.69rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.13em", color: "#20144d" }}>
                        AI Strategy Summary
                    </Typography>
                </Box>
                {rec?.fitScoreLabel && (
                    <Chip
                        label={rec.fitScoreLabel}
                        size="small"
                        sx={{
                            height: "20px",
                            backgroundColor: rec.fitScoreLabel === "Great Fit"
                                ? "rgba(49, 179, 122, 0.14)"
                                : rec.fitScoreLabel === "Fair Fit"
                                    ? "rgba(255, 167, 38, 0.14)"
                                    : "rgba(122, 63, 242, 0.12)",
                            color: rec.fitScoreLabel === "Great Fit"
                                ? "#19744d"
                                : rec.fitScoreLabel === "Fair Fit"
                                    ? "#b45309"
                                    : "#5b21e6",
                            fontWeight: 700,
                            fontSize: "0.68rem",
                            borderRadius: "8px",
                            px: "2px",
                        }}
                    />
                )}
            </Box>

            {/* ── Error state ── */}
            {error && (
                <Box sx={{ padding: "14px", borderRadius: "14px", border: "1px solid rgba(211,47,47,0.2)", backgroundColor: "rgba(211,47,47,0.06)", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="12" cy="12" r="10" stroke="#d32f2f" strokeWidth="1.5" />
                        <path d="M12 7v5M12 16v1" stroke="#d32f2f" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <Typography sx={{ fontSize: "0.83rem", color: "#c62828", lineHeight: 1.45 }}>{error}</Typography>
                </Box>
            )}

            {!error && summaryData && (
                <>
                    {/* ── Recommended Scenario hero card ── */}
                    {rec && (
                        <Box>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#74689c", mb: "4px" }}>
                                Recommended Scenario
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "4px" }}>
                                <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#19744d", lineHeight: 1.2 }}>
                                    {rec.title}
                                </Typography>
                                {/* small sparkle */}
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L13.09 8.26L19 6L15.45 11.11L22 12L15.45 12.89L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.89L2 12L8.55 11.11L5 6L10.91 8.26L12 2Z" fill="#19744d" fillOpacity="0.7" />
                                </svg>
                            </Box>
                            {rec.reason && (
                                <Typography sx={{ fontSize: "0.83rem", color: "#74689c", lineHeight: 1.5 }}>
                                    {rec.reason}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* ── Metrics row ── */}
                    {rec && (
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "8px",
                                padding: "12px 10px",
                                borderRadius: "16px",
                                border: "1px solid rgba(122, 63, 242, 0.12)",
                                backgroundColor: "rgba(255,255,255,0.56)",
                            }}
                        >
                            {/* Monthly Savings */}
                            <Box sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontSize: "0.65rem", color: "#74689c", fontWeight: 600, mb: "4px", lineHeight: 1.2 }}>
                                    Monthly Savings
                                </Typography>
                                <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#5b21e6", lineHeight: 1.1 }}>
                                    {rec.monthlySavings != null
                                        ? `$${Math.abs(rec.monthlySavings).toLocaleString()}`
                                        : "—"}
                                </Typography>
                                <Typography sx={{ fontSize: "0.62rem", color: "#74689c", mt: "2px" }}>
                                    vs. other scenario
                                </Typography>
                            </Box>

                            {/* AI Fit Score */}
                            <Box sx={{ textAlign: "center", borderLeft: "1px solid rgba(122,63,242,0.10)", borderRight: "1px solid rgba(122,63,242,0.10)", px: "4px" }}>
                                <Typography sx={{ fontSize: "0.65rem", color: "#74689c", fontWeight: 600, mb: "4px", lineHeight: 1.2 }}>
                                    AI Fit Score
                                </Typography>
                                <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#5b21e6", lineHeight: 1.1 }}>
                                    {rec.aiFitScore != null ? `${rec.aiFitScore}/100` : "—"}
                                </Typography>
                                <Typography sx={{ fontSize: "0.62rem", color: "#74689c", mt: "2px" }}>
                                    {rec.fitScoreLabel ?? ""}
                                </Typography>
                            </Box>

                            {/* Approval Likelihood */}
                            <Box sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontSize: "0.65rem", color: "#74689c", fontWeight: 600, mb: "4px", lineHeight: 1.2 }}>
                                    Approval Likelihood
                                </Typography>
                                <Typography sx={{
                                    fontSize: "1.05rem", fontWeight: 800, lineHeight: 1.1,
                                    color: rec.approvalLikelihoodLabel === "High" ? "#19744d"
                                        : rec.approvalLikelihoodLabel === "Moderate" ? "#b45309"
                                            : "#5b21e6"
                                }}>
                                    {rec.approvalLikelihoodLabel ?? "—"}
                                </Typography>
                                {rec.likelihoodDelta != null && rec.likelihoodDelta !== 0 && (
                                    <Typography sx={{ fontSize: "0.62rem", color: "#74689c", mt: "2px" }}>
                                        {rec.likelihoodDelta > 0 ? `+${rec.likelihoodDelta}%` : `${rec.likelihoodDelta}%`}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* ── Expand AI Strategy button ── */}
                    <Box
                        component="button"
                        onClick={onOpenSidebar}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "14px",
                            border: "1.5px solid rgba(122,63,242,0.28)",
                            backgroundColor: "rgba(255,255,255,0.60)",
                            cursor: "pointer",
                            transition: "all 0.18s",
                            color: "#5b21e6",
                            fontFamily: "inherit",
                            "&:hover": {
                                backgroundColor: "rgba(122,63,242,0.07)",
                                borderColor: "#7a3ff2",
                                transform: "translateY(-1px)",
                                boxShadow: "0 4px 16px rgba(122,63,242,0.14)",
                            },
                            "&:active": { transform: "translateY(0px)" },
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L13.09 8.26L19 6L15.45 11.11L22 12L15.45 12.89L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.89L2 12L8.55 11.11L5 6L10.91 8.26L12 2Z" fill="#5b21e6" fillOpacity="0.85" />
                            <path d="M6 2L6.5 4.5L9 5L6.5 5.5L6 8L5.5 5.5L3 5L5.5 4.5L6 2Z" fill="#5b21e6" />
                        </svg>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#5b21e6" }}>
                            Expand AI Strategy
                        </Typography>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9l6 6 6-6" stroke="#5b21e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Box>
                </>
            )}
        </Box>
    );
}


// ─── Main export ─────────────────────────────────────────────────────────────
export function AIStrategySummary({
    activeGoal,
    scenario,
    activeFullScenario,
    isGenerated = false,
    isLoading = false,
    summaryData,
    error,
    onOpenSidebar,
}: AIStrategySummaryProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                padding: "16px",
                borderRadius: "28px",
                backgroundColor: "rgba(255, 255, 255, 0.82)",
                border: "1px solid rgba(109, 76, 196, 0.14)",
                backdropFilter: "blur(18px)",
                mb: "14px",
                position: "relative",
            }}
        >
            {/* Loading overlay */}
            {isLoading && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "28px",
                        backgroundColor: "rgba(255,255,255,0.78)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        zIndex: 10,
                    }}
                >
                    <CircularProgress
                        size={36}
                        thickness={4}
                        sx={{ color: "#7a3ff2" }}
                    />
                    <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#74689c" }}>
                        Generating AI strategy…
                    </Typography>
                </Box>
            )}

            {isGenerated ? (
                <AfterGeneration
                    activeGoal={activeGoal}
                    scenario={scenario}
                    activeFullScenario={activeFullScenario}
                    summaryData={summaryData}
                    error={error}
                    onOpenSidebar={onOpenSidebar}
                />
            ) : (
                <BeforeGeneration activeGoal={activeGoal} />
            )}
        </Paper>
    );
}