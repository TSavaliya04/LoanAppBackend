export type GoalId = "lowestMonthlyPayment" | "lowestDownPayment" | "lowestCashToClose";
export type TabId = "purchase" | "terms" | "borrowers" | "debts";
export type Occupancy = "Single-Family" | "Primary Residence" | "Second Home" | "Investment";
export type LoanType = "Non QM" | "Conventional" | "FHA";

export type BorrowerDebt = {
  debtType: string;
  debtToBePaidOff: boolean;
  balance: number;
  monthlyPayment: number;
};

export type BorrowerData = {
  borrowerName: string;
  ficoScore: string;
  monthlyIncome: number;
  debts: BorrowerDebt[];
};

export type Borrower = {
  monthlyIncome: number;
  creditScore: number;
  purchasePrice: number;
  occupancy: Occupancy;
  monthlyDebts: number;
  borrowersList: BorrowerData[];
};

export type Scenario = {
  id: string;
  name: string;
  summary: string;
  termYears: number;
  rate: number;
  priceAdjustment: number;
  downPaymentPercent: number;
  propertyTaxMonthly: number;
  hazardInsuranceMonthly: number;
  hoaMonthly: number;
  closingCosts: number;
  prepaidItems: number;
  type: LoanType;
  color: "primary" | "secondary" | "warning";
  monthlyPropertyTaxPercentage?: number;
};

export type DraftState = {
  borrower: Borrower;
  scenario: Scenario;
};

export const STORAGE_KEY = "loans-n-stuff-nextjs-scenarios";

export const goalConfig: Array<{ id: GoalId; label: string }> = [
  { id: "lowestMonthlyPayment", label: "Lowest Monthly Payment" },
  { id: "lowestDownPayment", label: "Lowest Down Payment" },
  { id: "lowestCashToClose", label: "Lowest Cash to Close" },
];

export const tabConfig: Array<{ id: TabId; label: string }> = [
  { id: "purchase", label: "Purchase" },
  { id: "terms", label: "Terms" },
  { id: "debts", label: "Debts" },
];

export const recommendationCopyByGoal: Record<GoalId, string> = {
  lowestMonthlyPayment:
    "Best fit for borrowers prioritizing the lowest monthly payment while staying within loan limits.",
  lowestDownPayment: "Best fit for borrowers prioritizing the smallest down payment upfront.",
  lowestCashToClose: "Best fit for borrowers prioritizing the least cash needed at closing.",
};
