import { Alert, AlertColor, Snackbar, Typography } from "@mui/material";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  errorMessage: string;
  severity?: AlertColor;
};

const CustomSnackBar = ({
  onClose,
  open,
  errorMessage,
  severity = "error",
}: Props) => {
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      autoHideDuration={2000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
        <Typography>{errorMessage}</Typography>
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackBar;
