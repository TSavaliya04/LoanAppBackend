import { create } from "zustand";

type RatioStore = {
  frontEndRatio: number;
  backEndRatio: number;
  monthlyIncome: number;
  preApprovalId: string;
  setFrontEndRatio: (value: number) => void;
  setBackEndRatio: (value: number) => void;
  setMonthlyIncome: (value: number) => void;
  setPreApprovalId: (value: string) => void;
};

export const usePreApprovalStore = create<RatioStore>((set) => ({
  frontEndRatio: 0,
  backEndRatio: 0,
  monthlyIncome: 0,
  preApprovalId: "",
  setFrontEndRatio: (value) => set({ frontEndRatio: value }),
  setBackEndRatio: (value) => set({ backEndRatio: value }),
  setMonthlyIncome: (value) => set({ monthlyIncome: value }),
  setPreApprovalId: (value) => set({ preApprovalId: value }),
}));
