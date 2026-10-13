import { create } from "zustand";

type Ratio = {
  frontEndRatio: number;
  backEndRatio: number;
  monthlyIncome: number;
};

type RatioStore = {
  ratios: Record<number, Ratio>; // key = index
  setFrontEndRatio: (index: number, value: number) => void;
  setBackEndRatio: (index: number, value: number) => void;
  setMonthlyIncome: (index: number, value: number) => void;
  resetRatio: (index: number) => void;
};

export const usePreApprovalStore = create<RatioStore>((set) => ({
  ratios: {},

  setFrontEndRatio: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: {
          ...state.ratios[index],
          frontEndRatio: value,
        },
      },
    })),

  setBackEndRatio: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: {
          ...state.ratios[index],
          backEndRatio: value,
        },
      },
    })),

  setMonthlyIncome: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: {
          ...state.ratios[index],
          monthlyIncome: value,
        },
      },
    })),

  resetRatio: (index) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { frontEndRatio: 0, backEndRatio: 0, monthlyIncome: 0 },
      },
    })),
}));
