"use client";

import { Box, Typography, Chip, Drawer, IconButton } from "@mui/material";

type AIStrategySidebarProps = {
    open: boolean;
    onClose: () => void;
    summaryData?: any;
    error?: string | null;
};

function SparkleIcon({ size = 16, color = "#5b21e6" }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

function CheckIcon({ color = "#19744d" }: { color?: string }) {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function RefinanceAIStrategySidebar({ open, onClose, summaryData, error }: AIStrategySidebarProps) {
    const rec = summaryData?.recommendedScenario;
    const scenarioNarratives: { scenarioNo: number; label: string; highlights: string[] }[] =
        summaryData?.scenarioNarratives ?? [];

    const strategyInsights = [
        {
            data: summaryData?.buyingPowerAnalysis,
            color: "#5b21e6",
            bgColor: "rgba(122,63,242,0.09)",
            borderColor: "rgba(122,63,242,0.18)",
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#5b21e6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 22V12h6v10" stroke="#5b21e6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        },
        {
            data: summaryData?.cashToCloseImpact,
            color: "#0891b2",
            bgColor: "rgba(8,145,178,0.09)",
            borderColor: "rgba(8,145,178,0.18)",
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="3" stroke="#0891b2" strokeWidth="1.6" />
                    <path d="M2 10h20" stroke="#0891b2" strokeWidth="1.6" />
                    <path d="M6 15h4" stroke="#0891b2" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            data: summaryData?.shoppingStrategy,
            color: "#d97706",
            bgColor: "rgba(217,119,6,0.09)",
            borderColor: "rgba(217,119,6,0.18)",
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#d97706" strokeWidth="1.6" />
                    <circle cx="12" cy="9" r="2.5" stroke="#d97706" strokeWidth="1.6" />
                </svg>
            ),
        },
        {
            data: summaryData?.financingStrategy,
            color: "#19744d",
            bgColor: "rgba(49,179,122,0.09)",
            borderColor: "rgba(49,179,122,0.18)",
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#19744d" strokeWidth="1.6" />
                    <path d="M12 7v5l3 3" stroke="#19744d" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            ),
        },
    ].filter((item) => item.data);

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100vw", sm: 460 },
                    background: "linear-gradient(160deg, #f8f5ff 0%, #f0f8ff 60%, #f5fff9 100%)",
                    borderLeft: "1px solid rgba(122,63,242,0.13)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                },
            }}
            SlideProps={{ timeout: 280 }}
        >
            {/* Sticky Header */}
            <Box
                sx={{
                    px: "20px",
                    py: "14px",
                    borderBottom: "1px solid rgba(122,63,242,0.10)",
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <SparkleIcon size={17} color="#5b21e6" />
                    <Typography sx={{ fontSize: "0.70rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.13em", color: "#20144d" }}>
                        AI Strategy Summary
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "8px",
                        color: "#74689c",
                        border: "1px solid rgba(122,63,242,0.14)",
                        "&:hover": { backgroundColor: "rgba(122,63,242,0.08)", color: "#5b21e6" },
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </IconButton>
            </Box>

            {/* Scrollable content */}
            <Box sx={{ flex: 1, overflowY: "auto", px: "20px", py: "18px", display: "flex", flexDirection: "column", gap: "20px" }}>

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
                        {/* Recommended scenario hero */}
                        {rec && (
                            <Box>
                                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#74689c", mb: "5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    Recommended Scenario
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "6px" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Typography sx={{ fontSize: "1.18rem", fontWeight: 800, color: "#19744d" }}>
                                            {rec.title}
                                        </Typography>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2L13.09 8.26L19 6L15.45 11.11L22 12L15.45 12.89L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.89L2 12L8.55 11.11L5 6L10.91 8.26L12 2Z" fill="#19744d" fillOpacity="0.7" />
                                        </svg>
                                    </Box>
                                    {rec.fitScoreLabel && (
                                        <Chip
                                            label={rec.fitScoreLabel}
                                            size="small"
                                            sx={{
                                                height: "22px",
                                                backgroundColor: rec.fitScoreLabel === "Great Fit" ? "rgba(49,179,122,0.14)" : rec.fitScoreLabel === "Fair Fit" ? "rgba(255,167,38,0.14)" : "rgba(122,63,242,0.12)",
                                                color: rec.fitScoreLabel === "Great Fit" ? "#19744d" : rec.fitScoreLabel === "Fair Fit" ? "#b45309" : "#5b21e6",
                                                fontWeight: 700,
                                                fontSize: "0.70rem",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    )}
                                </Box>
                                {rec.reason && (
                                    <Typography sx={{ fontSize: "0.84rem", color: "#44396b", lineHeight: 1.6 }}>
                                        {rec.reason}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Metrics row */}
                        {rec && (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "8px",
                                    padding: "14px 12px",
                                    borderRadius: "18px",
                                    border: "1px solid rgba(122,63,242,0.13)",
                                    backgroundColor: "rgba(255,255,255,0.72)",
                                    boxShadow: "0 2px 12px rgba(122,63,242,0.06)",
                                }}
                            >
                                <Box sx={{ textAlign: "center" }}>
                                    <Typography sx={{ fontSize: "0.65rem", color: "#74689c", fontWeight: 600, mb: "4px", lineHeight: 1.2 }}>Monthly Savings</Typography>
                                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#5b21e6", lineHeight: 1.1 }}>
                                        {rec.monthlySavings != null ? `$${Math.abs(rec.monthlySavings).toLocaleString()}` : "—"}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.62rem", color: "#74689c", mt: "2px" }}>vs. other scenario</Typography>
                                </Box>

                                <Box sx={{ textAlign: "center", borderLeft: "1px solid rgba(122,63,242,0.10)", borderRight: "1px solid rgba(122,63,242,0.10)", px: "4px" }}>
                                    <Typography sx={{ fontSize: "0.65rem", color: "#74689c", fontWeight: 600, mb: "4px", lineHeight: 1.2 }}>AI Fit Score</Typography>
                                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#5b21e6", lineHeight: 1.1 }}>
                                        {rec.aiFitScore != null ? `${rec.aiFitScore}/100` : "—"}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.62rem", color: "#74689c", mt: "2px" }}>{rec.fitScoreLabel ?? ""}</Typography>
                                </Box>

                                <Box sx={{ textAlign: "center" }}>
                                    <Typography sx={{ fontSize: "0.65rem", color: "#74689c", fontWeight: 600, mb: "4px", lineHeight: 1.2 }}>Approval Likelihood</Typography>
                                    <Typography sx={{
                                        fontSize: "1.1rem", fontWeight: 800, lineHeight: 1.1,
                                        color: rec.approvalLikelihoodLabel === "Very High" || rec.approvalLikelihoodLabel === "High" ? "#19744d"
                                            : rec.approvalLikelihoodLabel === "Moderate" ? "#b45309"
                                                : "#5b21e6"
                                    }}>
                                        {rec.approvalLikelihoodLabel ?? "—"}
                                    </Typography>
                                    {rec.likelihoodDelta != null && rec.likelihoodDelta !== 0 && (
                                        <Typography sx={{ fontSize: "0.62rem", color: "#74689c", mt: "2px" }}>
                                            {rec.likelihoodDelta > 0 ? `> ${rec.likelihoodDelta}%` : `${rec.likelihoodDelta}%`}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* Scenario Breakdown */}
                        {scenarioNarratives.length > 0 && (
                            <Box>
                                <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#20144d", mb: "12px" }}>
                                    Scenario Breakdown
                                </Typography>
                                <Box sx={{ display: "grid", gap: "10px" }}>
                                    {scenarioNarratives.map((narrative, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                borderRadius: "16px",
                                                border: `1px solid ${i === 0 ? "rgba(49,179,122,0.22)" : "rgba(122,63,242,0.18)"}`,
                                                backgroundColor: "rgba(255,255,255,0.70)",
                                                overflow: "hidden",
                                                boxShadow: "0 1px 6px rgba(122,63,242,0.05)",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    padding: "10px 14px",
                                                    borderBottom: `1px solid ${i === 0 ? "rgba(49,179,122,0.10)" : "rgba(122,63,242,0.08)"}`,
                                                    background: i === 0
                                                        ? "linear-gradient(90deg, rgba(49,179,122,0.10), rgba(36,184,217,0.06))"
                                                        : "linear-gradient(90deg, rgba(122,63,242,0.08), rgba(36,184,217,0.05))",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: "22px",
                                                        height: "22px",
                                                        borderRadius: "50%",
                                                        display: "grid",
                                                        placeItems: "center",
                                                        backgroundColor: i === 0 ? "rgba(49,179,122,0.22)" : "rgba(122,63,242,0.18)",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                                        <path d="M20 6L9 17l-5-5" stroke={i === 0 ? "#19744d" : "#5b21e6"} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </Box>
                                                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: i === 0 ? "#19744d" : "#5b21e6", lineHeight: 1.3 }}>
                                                    {narrative.label}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ padding: "10px 14px", display: "grid", gap: "7px" }}>
                                                {narrative.highlights.map((h, hi) => (
                                                    <Box key={hi} sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                                        <Box sx={{ flexShrink: 0, mt: "2px" }}>
                                                            <CheckIcon color={i === 0 ? "#19744d" : "#5b21e6"} />
                                                        </Box>
                                                        <Typography sx={{ fontSize: "0.80rem", color: "#20144d", lineHeight: 1.5 }}>
                                                            {h}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Strategy Insights */}
                        {strategyInsights.length > 0 && (
                            <Box>
                                <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#20144d", mb: "12px" }}>
                                    Strategy Insights
                                </Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                                    {strategyInsights.map((item, i) => (
                                        <Box
                                            key={i}
                                            sx={{
                                                padding: "12px",
                                                borderRadius: "14px",
                                                border: `1px solid ${item.borderColor}`,
                                                backgroundColor: "rgba(255,255,255,0.70)",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "8px",
                                                boxShadow: "0 1px 6px rgba(122,63,242,0.04)",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: "30px",
                                                    height: "30px",
                                                    borderRadius: "9px",
                                                    display: "grid",
                                                    placeItems: "center",
                                                    backgroundColor: item.bgColor,
                                                    border: `1px solid ${item.borderColor}`,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {item.icon}
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: "0.80rem", fontWeight: 700, color: item.color, lineHeight: 1.3, mb: "3px" }}>
                                                    {item.data.title}
                                                </Typography>
                                                <Typography sx={{ fontSize: "0.75rem", color: "#74689c", lineHeight: 1.5 }}>
                                                    {item.data.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Drawer>
    );
}
