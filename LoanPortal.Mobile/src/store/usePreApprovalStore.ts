import { create } from "zustand";

type RatioIndexValues = {
  borrowerName: string;
  ficoScore: number | null;
  frontEndRatio: number;
  backEndRatio: number;
  monthlyIncome: number;
};

type RatioIndexStore = {
  ratios: Record<number, RatioIndexValues>;

  setBorrowerName: (index: number, value: string) => void;
  setFicoScore: (index: number, value: number | null) => void;
  setFrontEndRatio: (index: number, value: number) => void;
  setBackEndRatio: (index: number, value: number) => void;
  setMonthlyIncome: (index: number, value: number) => void;

  initializeIndex: (index: number) => void;
};

const defaultRatioValues: RatioIndexValues = {
  borrowerName: "",
  ficoScore: null,
  frontEndRatio: 0,
  backEndRatio: 0,
  monthlyIncome: 0,
};

export const usePreApprovalIndexStore = create<RatioIndexStore>((set) => ({
  ratios: {},

  initializeIndex: (index) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: state.ratios[index] ?? { ...defaultRatioValues },
      },
    })),

  setBorrowerName: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], borrowerName: value },
      },
    })),

  setFicoScore: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], ficoScore: value },
      },
    })),

  setFrontEndRatio: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], frontEndRatio: value },
      },
    })),

  setBackEndRatio: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], backEndRatio: value },
      },
    })),

  setMonthlyIncome: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], monthlyIncome: value },
      },
    })),
}));

type RefinanceRatioIndexValues = {
  borrowerName: string;
  ficoScore: number | null;
  frontEndRatio: number;
  backEndRatio: number;
  monthlyIncome: number;
};

type RefinanceRatioIndexStore = {
  ratios: Record<number, RefinanceRatioIndexValues>;

  setBorrowerName: (index: number, value: string) => void;
  setFicoScore: (index: number, value: number | null) => void;
  setFrontEndRatio: (index: number, value: number) => void;
  setBackEndRatio: (index: number, value: number) => void;
  setMonthlyIncome: (index: number, value: number) => void;

  initializeIndex: (index: number) => void;
};

const defaultRefinanceRatioValues: RefinanceRatioIndexValues = {
  borrowerName: "",
  ficoScore: null,
  frontEndRatio: 0,
  backEndRatio: 0,
  monthlyIncome: 0,
};

export const useRefinancePreApprovalIndexStore = create<RefinanceRatioIndexStore>((set) => ({
  ratios: {},

  initializeIndex: (index) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: state.ratios[index] ?? { ...defaultRefinanceRatioValues },
      },
    })),

  setBorrowerName: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], borrowerName: value },
      },
    })),

  setFicoScore: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], ficoScore: value },
      },
    })),

  setFrontEndRatio: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], frontEndRatio: value },
      },
    })),

  setBackEndRatio: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], backEndRatio: value },
      },
    })),

  setMonthlyIncome: (index, value) =>
    set((state) => ({
      ratios: {
        ...state.ratios,
        [index]: { ...state.ratios[index], monthlyIncome: value },
      },
    })),
}));

type RatioStore = {
  preApprovalId: string;
  setPreApprovalId: (value: string) => void;
};

export const usePreApprovalStore = create<RatioStore>((set) => ({
  preApprovalId: "",
  setPreApprovalId: (value) => set({ preApprovalId: value }),
}));
