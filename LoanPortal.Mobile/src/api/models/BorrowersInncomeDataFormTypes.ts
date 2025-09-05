import { ZodType, z } from "zod";

// Individual Debt Entry
export type DebtEntry = {
  debtType: string;
  balance: number;
  monthlyPayment: number;
};

// Borrower Income Entry with Nested Debts
export type BorrowerIncomeEntry = {
  borrowerName: string;
  ficoScore: number;
  monthlyIncome: number;
  debts: DebtEntry[];
};

export type BorrowersIncomeAPIPayload = {
  borrowerName: string;
  ficoScore: number;
  monthlyIncome: number;
  debts: {
    preApprovalId: string | null;
    debtType: number;
    balance: number;
    monthlyPayment: number;
  }[];
}[];

// Final Form Type
export type BorrowersIncomeDataFormData = {
  borrowerIncome: BorrowerIncomeEntry[];
};

const debtSchema = z
  .object({
    debtType: z.string().trim().min(1, "Debt Type is required"),
    balance: z
      .number({ invalid_type_error: "Balance must be a number" })
      .nonnegative("Balance cannot be negative"),
    monthlyPayment: z
      .number({ invalid_type_error: "Monthly Payment must be a number" })
      .nonnegative("Monthly Payment cannot be negative"),
  })
  .refine((data) => data.monthlyPayment <= data.balance, {
    message: "Monthly payment cannot exceed balance",
    path: ["monthlyPayment"], // attach error to the correct field
  });

// Zod Schema for Borrower Income with nested debts
export const borrowersIncomeDataSchema: ZodType<BorrowersIncomeDataFormData> =
  z.object({
    borrowerIncome: z
      .array(
        z.object({
          borrowerName: z.string().trim().min(1, "Borrower name is required"),
          ficoScore: z
            .number({ invalid_type_error: "FICO Score must be a number" })
            .min(300, "FICO Score must be at least 300")
            .max(850, "FICO Score must be at most 850"),
          monthlyIncome: z
            .number({ invalid_type_error: "Monthly income must be a number" })
            .min(0.01, "Monthly income must be greater than 0"),
          debts: z.array(debtSchema), // allow 0 or more debts per borrower
        })
      )
      .min(1, "At least one borrower income entry is required"),
  });

export type BorrowersIncomeDataSchemaType = z.infer<
  typeof borrowersIncomeDataSchema
>;
