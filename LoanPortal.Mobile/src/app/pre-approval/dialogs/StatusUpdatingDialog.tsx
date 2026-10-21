import React from "react";
import {
    Dialog,
    DialogContent,
    Typography,
} from "@mui/material";

interface StatusUpdatingDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function StatusUpdatingDialog({
    open,
    onClose,
}: StatusUpdatingDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    backgroundColor: "transparent",
                    boxShadow: "none",
                },
            }}
        >
            <DialogContent
                sx={{
                    padding: 2,
                    overflow: "hidden",
                    backgroundColor: "transparent",
                }}
            >
                <Typography sx={{ fontWeight: 500, fontSize: "18px", color: "white" }}>
                    Status Updating..
                </Typography>
            </DialogContent>
        </Dialog>
    );
}
