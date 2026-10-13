import { ZodType, z } from "zod";

export type DebtEntry = {
  debtType: string;
  balance: number;
  monthlyPayment: number;
};

export type BorrowerIncomeEntry = {
  borrowerName: string;
  ficoScore: string;
  monthlyIncome: number;
  debts: DebtEntry[];
};

export type BorrowersIncomeAPIPayload = {
  borrowerName: string;
  ficoScore: string;
  monthlyIncome: number;
  debts: {
    preApprovalId: string | null;
    debtType: number;
    balance: number;
    monthlyPayment: number;
  }[];
}[];

export type BorrowersIncomeDataFormData = {
  borrowerIncome: BorrowerIncomeEntry[];
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

export const borrowersIncomeDataSchema = z.object({
  borrowerIncome: z
    .array(
      z.object({
        borrowerName: z.string().trim().min(1, "Borrower name is required"),
        ficoScore: z
          .string()
          .trim()
          .optional()
          .refine(
            (val) => {
              if (!val) return true; // optional
              const num = Number(val);
              return !isNaN(num) && num >= 300 && num <= 850;
            },
            {
              message: "FICO score must be between 300 and 850",
            },
          ),
        monthlyIncome: z.number({
          invalid_type_error: "Monthly income must be 0 or higher",
        }),

        debts: z.array(debtSchema),
      }),
    )
    .min(1, "At least one borrower income entry is required"),
});

export type BorrowersIncomeDataSchemaType = z.infer<
  typeof borrowersIncomeDataSchema
>;
