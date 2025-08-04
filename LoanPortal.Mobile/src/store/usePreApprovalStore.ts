import { create } from "zustand";

type RatioStore = {
  frontEndRatio: number;
  backEndRatio: number;
  annualInterestRate: number;
  homeOwnerInsurance: number;
  hazardInsurance: number;
  associationFee: number;
  monthlyIncome: number; // ✅ new field
  setFrontEndRatio: (value: number) => void;
  setBackEndRatio: (value: number) => void;
  setAnnualInterestRate: (value: number) => void;
  setHomeOwnerInsurance: (value: number) => void;
  setHazardInsurance: (value: number) => void;
  setAssociationFee: (value: number) => void;
  setMonthlyIncome: (value: number) => void; // ✅ new setter
};

export const usePreApprovalStore = create<RatioStore>((set) => ({
  frontEndRatio: 0,
  backEndRatio: 0,
  annualInterestRate: 0,
  homeOwnerInsurance: 0,
  hazardInsurance: 0,
  associationFee: 0,
  monthlyIncome: 0, // ✅ default value
  setFrontEndRatio: (value) => set({ frontEndRatio: value }),
  setBackEndRatio: (value) => set({ backEndRatio: value }),
  setAnnualInterestRate: (value) => set({ annualInterestRate: value }),
  setHomeOwnerInsurance: (value) => set({ homeOwnerInsurance: value }),
  setHazardInsurance: (value) => set({ hazardInsurance: value }),
  setAssociationFee: (value) => set({ associationFee: value }),
  setMonthlyIncome: (value) => set({ monthlyIncome: value }), // ✅ setter implementation
}));
