import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from "@mui/material";
import IosShareIcon from "@mui/icons-material/IosShare";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

interface XmlReportReadyDialogProps {
    open: boolean;
    onClose: () => void;
    xmlData: string | null;
    fileName?: string;
}

export default function XmlReportReadyDialog({
    open,
    onClose,
    xmlData,
    fileName = "loan_file",
}: XmlReportReadyDialogProps) {
    const handleShare = async () => {
        if (!xmlData) return;

        try {
            // 1. Build a Blob/File from the XML string
            const blob = new Blob([xmlData], { type: "application/xml" });
            const file = new File([blob], `${fileName}.xml`, {
                type: "application/xml",
            });

            // 2. Check if the browser supports sharing files (iOS Safari, etc.)
            // Note: share files alone — some iOS versions reject share() when
            // title/text are combined with files, even if canShare() returned true.
            if (
                navigator.share &&
                navigator.canShare &&
                navigator.canShare({ files: [file] })
            ) {
                try {
                    await navigator.share({ files: [file] });
                    return;
                } catch (shareError) {
                    // iOS can throw NotAllowedError here even when canShare()
                    // returned true (lost user-activation, webview restrictions,
                    // etc). Fall through to the direct-download fallback below
                    // rather than failing silently.
                    console.log("navigator.share failed, falling back to download:", shareError);
                }
            }

            // 3. Fallback: direct download (also used if share() above failed)
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.xml`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.log("Error exporting XML:", error);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                {/* Accent header bar */}
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)",
                        py: 3,
                        px: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <DescriptionOutlinedIcon sx={{ color: "#fff", fontSize: 36 }} />
                    </Box>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ color: "#fff", textAlign: "center" }}
                    >
                        XML Report Ready
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        backgroundColor: "rgba(25, 118, 210, 0.06)",
                        borderRadius: 2,
                        p: 2,
                        mt: 2,
                        border: "1px solid rgba(25, 118, 210, 0.15)",
                    }}
                >
                    <CheckCircleOutlineIcon
                        sx={{ color: "success.main", mt: 0.25, flexShrink: 0 }}
                    />
                    <Box>
                        <Typography variant="body1" fontWeight={600} gutterBottom>
                            Your loan file has been generated
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            The XML report is ready to export. Click{" "}
                            <strong>Export</strong> to download or share the file.
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button onClick={handleShare} endIcon={<IosShareIcon />} color="primary">
                    Export
                </Button>
            </DialogActions>
        </Dialog>
    );
}