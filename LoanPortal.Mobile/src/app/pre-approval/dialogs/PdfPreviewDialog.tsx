import React from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from "@mui/material";
import IosShareIcon from "@mui/icons-material/IosShare";
import dynamic from "next/dynamic";

const MobilePDFViewer = dynamic(
    () => import("@/components/PDFPreview/MobilePDFViewer"),
    { ssr: false }
);

interface PdfPreviewDialogProps {
    pdfPreviewUrl: string | null;
    onClose: () => void;
    isAndroid: boolean;
    pdfName: string;
}

export default function PdfPreviewDialog({
    pdfPreviewUrl,
    onClose,
    isAndroid,
    pdfName
}: PdfPreviewDialogProps) {
    const handleShare = async () => {
        if (!pdfPreviewUrl) return;

        try {
            // 1. Convert the Blob URL back into a Blob/File object
            const response = await fetch(pdfPreviewUrl);
            const blob = await response.blob();
            const file = new File([blob], `${pdfName}.pdf`, {
                type: "application/pdf",
            });

            // 2. Check if the browser supports sharing files
            if (
                navigator.share &&
                navigator.canShare &&
                navigator.canShare({ files: [file] })
            ) {
                await navigator.share({
                    files: [file],
                    title: "Exported PDF",
                    text: "Here is the PDF document you requested.",
                });
            } else {
                // 3. Fallback: If native sharing isn't supported (e.g., some desktop browsers),
                // trigger a standard download.
                const link = document.createElement("a");
                link.href = pdfPreviewUrl;
                link.download = `${pdfName}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.log("Error sharing:", error);
        }
    };
    return (
        <Dialog
            open={!!pdfPreviewUrl}
            onClose={() => {
                onClose();
                if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
            }}
            maxWidth="lg"
            fullWidth
        >
            <DialogContent sx={{ height: "80vh", padding: 0, overflow: "hidden" }}>
                {pdfPreviewUrl && (
                    <Box sx={{ width: "100%", height: "100%" }}>
                        {isAndroid ? (
                            <MobilePDFViewer fileUrl={pdfPreviewUrl} />
                        ) : (
                            <object
                                data={pdfPreviewUrl}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                            >
                                <Typography sx={{ p: 2 }}>
                                    PDF Preview is unavailable on this device. Please{" "}
                                    <a href={pdfPreviewUrl} download="preview.pdf">
                                        download the PDF to view
                                    </a>
                                    .
                                </Typography>
                            </object>
                        )}
                    </Box>
                )}
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
