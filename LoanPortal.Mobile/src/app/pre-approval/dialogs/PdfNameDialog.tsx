import React from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Switch,
    styled,
} from "@mui/material";

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

interface PdfNameDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    pdfName: string;
    setPdfName: (name: string) => void;
    currentPDF: string;
    currentScenarioIndex: number | null;
}

export default function PdfNameDialog({
    open,
    onClose,
    onSubmit,
    pdfName,
    setPdfName,
    currentPDF,
    currentScenarioIndex,
}: PdfNameDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            sx={{
                "& .MuiDialog-container": {
                    alignItems: "flex-start",
                },
                "& .MuiDialog-paper": {
                    marginTop: "250px",
                    maxWidth: "420px",
                },
            }}
        >
            <DialogContent>
                <form onSubmit={onSubmit} id="pdfname-form">
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
                    {(currentPDF === "FHAGFE" ||
                        currentPDF === "quickQuote" ||
                        currentPDF === "refinancequickQuote" ||
                        currentPDF === "refinanceFeeWorksheet" ||
                        currentScenarioIndex == null) && (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
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
                    onClick={onClose}
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
                    form="pdfname-form"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3,
                        backgroundColor: "#ff453b",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#da241bff" },
                        ml: 2,
                    }}
                >
                    Generate
                </Button>
            </DialogActions>
        </Dialog>
    );
}
