import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Switch,
  CircularProgress,
  styled,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

// ─── Styled Android-style switch ────────────────────────────────────────────
const Android12Switch = styled(Switch)(() => ({
  padding: 8,
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: 2,
  },
}));

// ─── Document definitions ────────────────────────────────────────────────────
type DocumentDefinition = {
  label: string;
  pdfType: string;
  /** when true the document needs a scenario selected; false = compare (no scenario needed) */
  needsScenario: boolean;
  /** Show the language toggle in the dialog */
  hasLanguageToggle: boolean;
};

const DOCUMENTS: DocumentDefinition[] = [
  { label: "Quick Quote", pdfType: "refinancequickQuote", needsScenario: true, hasLanguageToggle: true },
  { label: "Fee Worksheet", pdfType: "refinanceFeeWorksheet", needsScenario: true, hasLanguageToggle: true },
  { label: "Loan File", pdfType: "refinanceLoanFile", needsScenario: true, hasLanguageToggle: false },
  { label: "Scenario Comparison", pdfType: "compare", needsScenario: false, hasLanguageToggle: true },
];

// ─── Props ───────────────────────────────────────────────────────────────────
type DocumentPanelProps = {
  /** 0-based index of the currently active scenario, or null if none is active */
  activeScenarioIndex: number | null;
  /** Called when the user confirms the dialog; parent handles actual PDF generation */
  onGenerate: (
    pdfType: string,
    scenarioIndex: number | null,
    pdfName: string,
    language: string,
  ) => void;
  /** Whether any generation is in progress (shows spinner overlay on buttons) */
  isGenerating?: boolean;
};

export function DocumentPanel({
  activeScenarioIndex,
  onGenerate,
  isGenerating = false,
}: DocumentPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [pendingDoc, setPendingDoc] = useState<DocumentDefinition | null>(null);

  const hasActiveScenario = activeScenarioIndex !== null;

  function openDialog(doc: DocumentDefinition) {
    setPendingDoc(doc);
    // Pre-fill the default name
    setPdfName(doc.label);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setPendingDoc(null);
    setPdfName("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingDoc) return;

    const formData = new FormData(e.currentTarget);
    const formJson = Object.fromEntries(formData.entries()) as Record<string, string>;

    const name = formJson.pdfname || pendingDoc.label;
    const language = formJson.language === "on" ? "on" : "off";

    const scenarioIdx = pendingDoc.needsScenario ? activeScenarioIndex : null;
    onGenerate(pendingDoc.pdfType, scenarioIdx, name, language);
    handleClose();
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          padding: "16px",
          borderRadius: "28px",
          backgroundColor: "rgba(255, 255, 255, 0.82)",
          border: "1px solid rgba(109, 76, 196, 0.14)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", mb: 2 }}>
          <Box>
            <Typography sx={{ margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.69rem", color: "#74689c" }}>
              Send PDF
            </Typography>
            <Typography variant="h3" sx={{ fontSize: "1rem", fontWeight: 700, m: 0 }}>
              Select document
            </Typography>
          </Box>
          <PictureAsPdfIcon sx={{ color: "#7a3ff2", opacity: 0.7, fontSize: "1.4rem" }} />
        </Box>

        {!hasActiveScenario && (
          <Typography sx={{ fontSize: "0.78rem", color: "#74689c", mb: 1.5, fontStyle: "italic" }}>
            Select a scenario to enable PDF generation.
          </Typography>
        )}

        <Box sx={{ display: "grid", gap: "12px" }}>
          {DOCUMENTS.map((doc) => {
            const disabled = isGenerating || (doc.needsScenario && !hasActiveScenario);
            return (
              <Button
                key={doc.label}
                variant="contained"
                disabled={disabled}
                onClick={() => openDialog(doc)}
                sx={{
                  minHeight: "42px",
                  padding: "0 16px",
                  borderRadius: "12px",
                  backgroundColor: disabled
                    ? "rgba(122, 63, 242, 0.04)"
                    : "rgba(122, 63, 242, 0.08)",
                  color: disabled ? "rgba(0,0,0,0.26)" : "#5620d2",
                  boxShadow: "none",
                  fontWeight: 700,
                  textTransform: "none",
                  transition: "transform 0.18s ease, background 0.18s ease",
                  "&:hover": {
                    backgroundColor: "rgba(122, 63, 242, 0.12)",
                    boxShadow: "none",
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "rgba(122, 63, 242, 0.04)",
                    color: "rgba(0,0,0,0.26)",
                    boxShadow: "none",
                  },
                }}
              >
                {isGenerating ? (
                  <CircularProgress size={18} sx={{ color: "#7a3ff2" }} />
                ) : (
                  doc.label
                )}
              </Button>
            );
          })}
        </Box>
      </Paper>

      {/* ── PDF Name & Language Dialog ─────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        sx={{
          "& .MuiDialog-container": { alignItems: "flex-start" },
          "& .MuiDialog-paper": { marginTop: "250px", maxWidth: "420px", width: "100%" },
        }}
      >
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#20144d" }}>
            {pendingDoc?.label}
          </Typography>
          <form onSubmit={handleSubmit} id="doc-panel-pdf-form">
            <TextField
              autoFocus
              required
              margin="dense"
              id="pdfname"
              name="pdfname"
              label="Document Name"
              type="text"
              fullWidth
              variant="standard"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
            />
            {pendingDoc?.hasLanguageToggle && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography>English</Typography>
                <FormGroup>
                  <FormControlLabel
                    sx={{ marginRight: 0, marginLeft: 0 }}
                    control={<Android12Switch />}
                    label=""
                    name="language"
                  />
                </FormGroup>
                <Typography>Spanish</Typography>
              </Box>
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              backgroundColor: "#f5f5f5",
              color: "#000",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="doc-panel-pdf-form"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              backgroundColor: "#7a3ff2",
              color: "#fff",
              "&:hover": { backgroundColor: "#5620d2" },
              ml: 2,
            }}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
