import { ZodType, z } from "zod";

export type BorrowersEntry = {
  monthlyIncome: number;
  debts: number;
  ficoScore: number;
};

export type LoanProgramFormData = {
  // loanProgram: string;
  frontEndRatio: number;
  backEndRatio: number;
  // price: number;
  // interestRate: number;
  baseLoanAmount: number;
  upmipAmount: number;
  upmipRate: number;
  annualMIPRate: number;
  finalLoanAmount: number;
  mmi: number;
  term: number;
  // downPaymentPercentage: number;
  downPaymentAmount: number;
  clearingCart: number;
  propertyTax: number;
  totalNeededToClear: number;
  principalAndInterest: number;
  monthlyPropertyTax: number;
  hazardInsurance: number;
  mortgageInsurance: number;
  monthlyTotal: number;
  borrowers: BorrowersEntry[];
};

export const loanProgramSchema: ZodType<LoanProgramFormData> = z.object({
  // loanProgram: z.string().trim().min(1, "Loan program is required"),
  frontEndRatio: z.number().min(0, "Front-End Ratio must be at least 0"),
  backEndRatio: z.number().min(0, "Back-End Ratio must be at least 0"),
  // price: z.number().min(0, "Price must be at least 0"),
  // interestRate: z
  //   .number({ invalid_type_error: "Interest Rate must be a number" })
  //   .min(0, "Interest Rate must be at least 0")
  //   .max(100, "Interest Rate cannot exceed 100"),
  baseLoanAmount: z.number().min(0, "Base Loan Amount must be at least 0"),
  upmipAmount: z.number().min(0, "UPMIP Amount must be at least 0"),
  upmipRate: z
    .number({ invalid_type_error: "UPMIP Percentage must be a number" })
    .min(0, "UPMIP Percentage must be at least 0")
    .max(100, "UPMIP Percentage cannot exceed 100"),
  annualMIPRate: z
    .number({ invalid_type_error: "Annual MIP Rate must be a number" })
    .min(0, "Annual MIP Rate must be at least 0")
    .max(100, "Annual MIP Rate cannot exceed 100"),
  finalLoanAmount: z.number().min(0, "Final Loan Amount must be at least 0"),
  mmi: z.number().min(0, "MMI must be at least 0"),
  term: z.number().min(0, "Term must be at least 0"),
  // downPaymentPercentage: z
  //   .number({ invalid_type_error: "Down Payment Percentage must be a number" })
  //   .min(0, "Down Payment Percentage must be at least 0")
  //   .max(100, "Down Payment Percentage cannot exceed 100"),
  downPaymentAmount: z
    .number()
    .min(0, "Down Payment Amount must be at least 0"),
  clearingCart: z.number().min(0, "Clearing Cart must be at least 0"),
  propertyTax: z.number().min(0, "Property Tax must be at least 0"),
  totalNeededToClear: z
    .number()
    .min(0, "Total Needed To Clear must be at least 0"),
  principalAndInterest: z
    .number()
    .min(0, "Principal & Interest must be at least 0"),
  monthlyPropertyTax: z
    .number()
    .min(0, "Monthly Property Tax must be at least 0"),
  hazardInsurance: z.number().min(0, "Hazard Insurance must be at least 0"),
  mortgageInsurance: z.number().min(0, "Mortgage Insurance must be at least 0"),
  monthlyTotal: z.number().min(0, "Monthly Total must be at least 0"),

  borrowers: z
    .array(
      z.object({
        monthlyIncome: z.number().min(0, "Monthly Income must be at least 0"),
        debts: z.number().min(0, "Debts must be at least 0"),
        ficoScore: z
          .number({ invalid_type_error: "FICO Score must be a number" })
          .min(0, "FICO Score must be at least 0")
          .max(850, "FICO Score cannot exceed 850"),
      })
    )
    .min(1, "At least one borrower is required"),
});
