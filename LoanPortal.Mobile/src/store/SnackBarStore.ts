import { create } from "zustand";
import { produce } from "immer";
import { AlertColor } from "@mui/material";

export interface SnackBarStoreState {
  severity: AlertColor;
  openSnackBar: boolean;
  message: string;
}

interface SnackBarStoreFunctions {
  resetStore: () => void;
  setSeverity: (value: AlertColor) => void;
  openDialog: (message: string) => void;
  openSuccessDialog: (message: string) => void;
  openErrorDialog: (message: string) => void;
  closeDialog: () => void;
}

type SnackBarStore = SnackBarStoreFunctions & SnackBarStoreState;
const initialState: SnackBarStoreState = {
  severity: "error",
  openSnackBar: false,
  message: "",
};
export const useSnackBarStore = create<SnackBarStore>((set) => ({
  ...initialState,
  resetStore: () => {
    set(initialState);
  },
  setSeverity: (value) => {
    set(
      produce((state: SnackBarStoreState) => {
        state.severity = value;
      })
    );
  },
  openDialog: (value) => {
    set(
      produce((state: SnackBarStoreState) => {
        state.openSnackBar = true;
        state.message = value;
      })
    );
  },
  openSuccessDialog: (value) => {
    set(
      produce((state: SnackBarStoreState) => {
        state.openSnackBar = true;
        state.message = value;
        state.severity = "success";
      })
    );
  },
  openErrorDialog: (value) => {
    set(
      produce((state: SnackBarStoreState) => {
        state.openSnackBar = true;
        state.message = value;
        state.severity = "error";
      })
    );
  },
  closeDialog: () => {
    set(
      produce((state: SnackBarStoreState) => {
        state.openSnackBar = false;
      })
    );
  },
}));
