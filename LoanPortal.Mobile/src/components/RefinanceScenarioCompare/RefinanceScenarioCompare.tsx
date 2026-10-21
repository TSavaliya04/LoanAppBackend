"use client";

import { useEffect, useState } from "react";
import { RefinanceBottomDrawer as BottomDrawer } from "./RefinanceBottomDrawer";
import { BorrowerGoals } from "./RefinanceBorrowerGoals";
import { RefinanceBorrowerProfile as BorrowerProfile } from "./RefinanceBorrowerProfile";
import { RefinanceBorrowerSidebar as BorrowerSidebar } from "./RefinanceBorrowerSidebar";
import { DocumentPanel } from "./RefinanceDocumentPanel";
import { PresenterToggle } from "./RefinancePresenterToggle";
import { RecommendationPanel } from "./RefinanceRecommendationPanel";
import { RefinanceScenarioCard as ScenarioCard } from "./RefinanceScenarioCard";
import { getRankedScenarios } from "@/lib/refinance-mortgage";
import {
  Scenario,
  type GoalId,
  type TabId,
} from "@/lib/refinance-scenario-data";
import { Box, Paper, Typography, Avatar, GlobalStyles, Snackbar, Chip } from "@mui/material";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { CombinedRefinancePreApprovalFormData as CombinedPreApprovalFormData } from "@/api/models/refinance/combinedPreApprovalSchema";
import { AIStrategySummary } from "./RefinanceAIStrategySummary";
import { RefinanceAIStrategySidebar } from "./RefinanceAIStrategySidebar";
import { generateAIStrategySummary } from "@/api/network/getAllPreApprovals";

type ScenarioCompareProps = {
  isPresenterModeOn?: boolean;
  onTogglePresenterMode?: () => void;
  /** The preApprovalId used when calling the AI strategy endpoint */
  preApprovalId?: string | null;
  /** Called when user confirms PDF generation from DocumentPanel */
  onDocumentGenerate?: (
    pdfType: string,
    scenarioIndex: number | null,
    pdfName: string,
    language: string,
  ) => void;
  /** Called when the drawer Save button is clicked (after local save logic) */
  onSave?: () => void;
  /** Called when a field changes inside the drawer (triggers recalculation) */
  onFieldChange?: (index: number) => void;
};

export default function ScenarioCompare({ isPresenterModeOn, onTogglePresenterMode, preApprovalId, onDocumentGenerate, onSave, onFieldChange }: ScenarioCompareProps = {}) {
  const [activeGoal, setActiveGoal] = useState<GoalId>("lowestMonthlyPayment");
  const [activeScenarioId, setActiveScenarioId] = useState<string>("scenario-1");
  const [activeTab, setActiveTab] = useState<string>("refinance");
  const [isPresenterModeLocal, setIsPresenterModeLocal] = useState(false);
  const isPresenterMode = isPresenterModeOn !== undefined ? isPresenterModeOn : isPresenterModeLocal;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBorrowerSidebarOpen, setIsBorrowerSidebarOpen] = useState(false);
  const [applyToAllScenarios, setApplyToAllScenarios] = useState(false);
  const [savedStatus, setSavedStatus] = useState("Live Prototype");
  const [toast, setToast] = useState("");
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummaryData, setAiSummaryData] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);

  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

  const formValues = useWatch({ control });

  const scenarios = formValues.scenarios;
  const borrower = scenarios?.flatMap(
    (scenario) => scenario.borrowersIncomeData?.borrowerIncome || []
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "scenarios",
  });

  // Create an array to iterate over for the cards
  const renderScenarios = formValues?.scenarios?.length
    ? formValues.scenarios.map((s, idx) => ({
      id: s.id || `scenario-${idx + 1}`,
      name: s.scenarioName || `Scenario ${idx + 1}`
    } as Scenario)) : [];

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const ranked = getRankedScenarios(scenarios as any, borrower as any, activeGoal);
  const recommended = ranked[0];

  let foundIndex = renderScenarios.findIndex((item: any) => item.id === activeScenarioId);
  if (foundIndex === -1) foundIndex = 0; // Default to first scenario if not found
  const activeScenarioIndex = foundIndex + 1;
  const activeScenario = renderScenarios[foundIndex] ?? renderScenarios[0];
  const activeFullScenario = formValues?.scenarios?.[foundIndex] ?? formValues?.scenarios?.[0];

  const loanProgramMap: Record<string, string> = {
    "1": "Non QM",
    "2": "Conventional",
    "3": "FHA",
  };

  const borrowerName = activeFullScenario?.borrowerInfo?.borrowerName || "";
  const borrowerInitials = borrowerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join("");
  const loanProgramLabel = loanProgramMap[String(activeFullScenario?.loanStructure?.loanProgram ?? "")] || "";
  const agentName = "";
  const updatedAtRaw = activeFullScenario?.updatedAt;
  const updatedAtLabel = updatedAtRaw
    ? new Date(updatedAtRaw).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })
    : "";

  const draft = {
    borrower,
    scenario: activeScenario,
  };
  const isDraftDirty = false;

  const [snapshot, setSnapshot] = useState<any>(null);

  function pulseSaved() {
    setSavedStatus("Auto-saved");
    window.setTimeout(() => setSavedStatus("Live Prototype"), 1600);
  }

  function showToast(message: string) {
    setToast(message);
  }

  function selectScenario(id: string) {
    setActiveScenarioId(id);
  }

  /** Maps GoalId strings to the API enum: LowestMonthlyPayment=1, LowestCashToClose=2 */
  const goalIdToApiEnum: Record<string, number> = {
    lowestMonthlyPayment: 1,
    lowestCashToCloseOrHighestCashToBorrower: 2,
  };

  async function handleGenerateAI() {
    if (!preApprovalId) {
      setAiError("No pre-approval ID found. Please save the form first.");
      showToast("No pre-approval ID found. Please save the form first.");
      return;
    }
    const borrowerGoalEnum = goalIdToApiEnum[activeGoal] ?? 1;
    setIsAILoading(true);
    setAiError(null);
    try {
      const response = await generateAIStrategySummary(preApprovalId, borrowerGoalEnum);
      console.log("response =>", response);

      const data = response.data?.data ?? response.data;
      setAiSummaryData(data);
      setIsAIGenerated(true);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to generate AI strategy. Please try again.";
      setAiError(message);
      showToast(message);
    } finally {
      setIsAILoading(false);
    }
  }

  function handleToggleDrawer() {
    if (!isDrawerOpen) {
      setSnapshot(JSON.parse(JSON.stringify(getValues("scenarios"))));
    }
    setIsDrawerOpen((prev) => !prev);
  }

  function handleDiscard() {
    if (snapshot) {
      setValue("scenarios", snapshot);
    }
    setIsDrawerOpen(false);
    showToast("Draft changes discarded");
  }

  function handleSave() {
    pulseSaved();
    showToast(`${activeScenario.name} saved and recalculated`);
    setSnapshot(JSON.parse(JSON.stringify(getValues("scenarios"))));
    onSave?.();
  }

  return (
    <>
      <GlobalStyles styles={{
        body: {
          margin: 0,
          minHeight: '100%',
          fontFamily: '"Avenir Next", "SF Pro Display", "Segoe UI", sans-serif',
          background: 'primary',
          color: '#20144d'
        }
      }} />

      <Box
        sx={{
          minHeight: "100vh",
          padding: "10px 8px 160px",
          display: "flex",
          justifyContent: "center",
          transform: isPresenterMode ? "scale(1.02)" : "scale(1)",
          transformOrigin: "top center",
          transition: "transform 0.18s ease",
        }}
      >
        <Box component="main" sx={{ position: "relative", width: "min(100%, 1380px)", display: "flex", flexDirection: "column", gap: "12px" }}>

          <Paper
            elevation={0}
            sx={{
              padding: "14px 18px",
              borderRadius: "28px",
              backgroundColor: "rgba(255, 255, 255, 0.82)",
              border: "1px solid rgba(109, 76, 196, 0.14)",
              backdropFilter: "blur(18px)",
            }}
          >

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "4px", flexWrap: "wrap", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "flex-start", md: "center" } }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "auto minmax(180px, auto) minmax(260px, 1fr)" }, alignItems: "start", gap: "14px", minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #7a3ff2 0%, #aa88ff 100%)",
                    fontWeight: 800,
                    fontSize: "1rem"
                  }}
                >
                  {borrowerInitials || "?"}
                </Avatar>
                <Box sx={{ display: "grid", gap: "4px", alignSelf: "center" }}>
                  <Typography variant="h2" sx={{ fontSize: "0.98rem", m: 0, fontWeight: 700 }}>
                    {borrowerName || "—"}
                  </Typography>
                  <Typography sx={{ color: "#74689c", m: 0, fontSize: "0.875rem" }}>
                    Refinance{loanProgramLabel ? ` • ${loanProgramLabel}` : ""}
                  </Typography>
                </Box>
                {/* <Typography sx={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.56)", color: "#74689c", fontSize: "0.84rem", alignSelf: "center" }}>
                  456 Maple Ave, Los Angeles, CA 90210
                </Typography> */}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.56)", color: "#74689c", fontSize: "0.84rem" }}>
                <Typography component="span" sx={{ fontSize: "inherit" }}>
                  {updatedAtLabel ? `Last updated: ${updatedAtLabel}` : "Last updated: —"}{agentName ? ` by ${agentName}` : ""}
                </Typography>
                <Chip
                  label={savedStatus}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(49, 179, 122, 0.12)",
                    color: "#19744d",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    borderRadius: "10px"
                  }}
                />
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: "grid", gap: "14px", gridTemplateColumns: { xs: "1fr", lg: "240px minmax(0, 1fr) 350px" }, alignItems: "start" }}>
            <Box sx={{ display: "grid", gap: "10px", alignContent: "start" }}>
              <BorrowerProfile activeScenario={activeFullScenario} onOpenDebts={() => setIsBorrowerSidebarOpen(true)} />
              <BorrowerGoals
                activeGoal={activeGoal}
                onSelect={(goal) => {
                  setActiveGoal(goal);
                  // Reset AI summary if goal changes
                  setIsAIGenerated(false);
                  setAiSummaryData(null);
                  setAiError(null);
                  pulseSaved();
                }}
                onGenerateAI={handleGenerateAI}
              />
              <DocumentPanel
                activeScenarioIndex={renderScenarios.length > 0 ? foundIndex : null}
                onGenerate={(pdfType, scenarioIndex, pdfName, language) => {
                  if (onDocumentGenerate) {
                    onDocumentGenerate(pdfType, scenarioIndex, pdfName, language);
                  } else {
                    showToast(`Generating ${pdfType}…`);
                  }
                }}
              />
            </Box>

            <Box sx={{ display: "grid", gap: "10px", alignContent: "start" }}>
              <Paper
                elevation={0}
                sx={{
                  padding: "14px",
                  borderRadius: "28px",
                  backgroundColor: "rgba(255, 255, 255, 0.82)",
                  border: "1px solid rgba(109, 76, 196, 0.14)",
                  backdropFilter: "blur(18px)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", mb: 2 }}>
                  <Typography sx={{ margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.69rem", color: "#74689c" }}>
                    Live compare
                  </Typography>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: "14px" }}>
                  {fields.map((field, index) => {
                    const scenarioId = renderScenarios[index]?.id || `scenario-${index + 1}`;
                    return (
                      <ScenarioCard
                        key={field.id}
                        index={index}
                        isRecommended={recommended.scenario === formValues?.scenarios?.[index]}
                        isActive={activeScenarioId === scenarioId}
                        onSelect={() => selectScenario(scenarioId)}
                      />
                    );
                  })}
                </Box>
              </Paper>
            </Box>

            <Box sx={{ display: "grid", gap: "10px", alignContent: "start" }}>
              <AIStrategySummary
                activeGoal={activeGoal}
                scenario={recommended.scenario}
                activeFullScenario={activeFullScenario}
                isGenerated={isAIGenerated}
                isLoading={isAILoading}
                summaryData={aiSummaryData}
                error={aiError}
                onOpenSidebar={() => setIsAISidebarOpen(true)}
              />
              <RecommendationPanel
                activeGoal={activeGoal}
                scenario={recommended.scenario}
                metrics={recommended.metrics}
                activeFullScenario={activeFullScenario}
              />
            </Box>
          </Box>

          <BottomDrawer
            activeScenarioId={activeScenarioId}
            activeScenarioIndex={activeScenarioIndex}
            activeTab={activeTab}
            isDrawerOpen={isDrawerOpen}
            isDraftDirty={isDraftDirty}
            applyToAllScenarios={applyToAllScenarios}
            onToggleDrawer={handleToggleDrawer}
            onChangeTab={setActiveTab}
            onFieldChange={(index) => onFieldChange?.(index)}
            onUpdateBorrowerList={() => { }}
            onToggleApplyAll={() => setApplyToAllScenarios((value) => !value)}
            onSelectScenario={selectScenario}
            onDiscard={handleDiscard}
            onSave={handleSave}
          />
        </Box>
      </Box>

      <BorrowerSidebar
        open={isBorrowerSidebarOpen}
        onClose={() => setIsBorrowerSidebarOpen(false)}
        activeScenarioIndex={activeScenarioIndex}
        onFieldChange={(index) => onFieldChange?.(index)}
        onSave={() => {
          pulseSaved();
          onSave?.();
        }}
      />

      <RefinanceAIStrategySidebar
        open={isAISidebarOpen}
        onClose={() => setIsAISidebarOpen(false)}
        summaryData={aiSummaryData}
        error={aiError}
      />

      <Snackbar
        open={Boolean(toast)}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "rgba(32, 20, 77, 0.92)",
            color: "white",
            borderRadius: "999px",
            fontSize: "0.92rem",
            justifyContent: "center",
          }
        }}
      />
    </>
  );
}
