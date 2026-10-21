import { ZodType, z } from "zod";

export type DebtEntry = {
  debtType: string;
  balance: number;
  monthlyPayment: number;
};

export type BorrowerIncomeEntry = {
  borrowerName: string;
  ficoScore?: number;
  monthlyIncome: number;
  debts: DebtEntry[];
};

export type BorrowersIncomeAPIPayload = {
  borrowerName: string;
  ficoScore?: number;
  monthlyIncome: number;
  debts: {
    preApprovalId: string | null;
    debtType: number;
    balance: number;
    monthlyPayment: number;
  }[];
}[];

export type BorrowersIncomeDataFormDataEntry = {
  preApprovalId?: string;
  borrowerIncome: BorrowerIncomeEntry[];
};

export type BorrowersIncomeDataFormData = {
  Inputs: BorrowersIncomeDataFormDataEntry[];
};

const debtSchema = z
  .object({
    debtType: z.string().trim().min(1, "Debt Type is required"),
    balance: z
      .number({ invalid_type_error: "Balance must be 0 or higher" })
      .nonnegative("Balance cannot be negative"),
    monthlyPayment: z
      .number({ invalid_type_error: "Monthly Payment must be 0 or higher" })
      .nonnegative("Monthly Payment cannot be negative"),
  })
  .refine((data) => data.monthlyPayment <= data.balance, {
    message: "Monthly payment cannot exceed balance",
    path: ["monthlyPayment"],
  });

export const borrowersIncomeDataSchema: ZodType<BorrowersIncomeDataFormData> =
  z.object({
    Inputs: z.array(
      z.object({
        borrowerIncome: z
          .array(
            z.object({
              borrowerName: z
                .string()
                .trim()
                .min(1, "Borrower name is required"),
              ficoScore: z
                .number({ invalid_type_error: "FICO Score must be a number" })
                .min(300, "FICO Score must be at least 300")
                .max(850, "FICO Score must be at most 850")
                .optional(),
              monthlyIncome: z.number({
                invalid_type_error: "Monthly income must be 0 or higher",
              }),
              debts: z.array(debtSchema),
            })
          )
          .min(1, "At least one borrower income entry is required"),
      })
    ),
  });
