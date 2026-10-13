import React from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

interface DeleteScenarioDialogProps {
    open: boolean;
    onClose: () => void;
    isBlockedDelete: boolean;
    onDelete: () => void;
}

export default function DeleteScenarioDialog({
    open,
    onClose,
    isBlockedDelete,
    onDelete,
}: DeleteScenarioDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 500, fontSize: "18px" }}>
                    {isBlockedDelete
                        ? "You can't delete the last scenario."
                        : "Are you sure you want to delete this scenario?"}
                </Typography>
            </DialogContent>

            <DialogActions>
                {isBlockedDelete ? (
                    <Button variant="contained" onClick={onClose}>
                        OK
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={onClose}
                            variant="contained"
                            sx={{
                                backgroundColor: "#E0E0E0",
                                color: "#000",
                                "&:hover": { backgroundColor: "#D5D5D5" },
                            }}
                        >
                            No
                        </Button>

                        <Button onClick={onDelete} variant="contained" color="error">
                            Yes, Delete
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
