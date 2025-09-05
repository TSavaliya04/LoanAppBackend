import { ZodType, z } from "zod";

export type PurchaseInfoFormData = {
  purchasePrice: number;
  downPayment: number;
  loanAmount: number | null;
  annualInterestRate: number;
  mipFundingFee?: number;
  hazardInsurance: number;
  associationFee?: number;
  miPercent?: number;
};

export const purchaseInfoSchema: ZodType<PurchaseInfoFormData> = z.object({
  purchasePrice: z
    .number({ invalid_type_error: "Purchase price is required" })
    .nonnegative("Must be 0 or greater"),

  downPayment: z
    .number({ invalid_type_error: "Down payment is required" })
    .min(0, "Must be 0 or greater")
    .max(100, "Cannot exceed 100%"),

  loanAmount: z
    .number({ invalid_type_error: "Loan amount is required" })
    .nonnegative("Must be 0 or greater"),

  hazardInsurance: z
    .number({ invalid_type_error: "Hazard insurance is required" })
    .nonnegative("Must be 0 or greater"),

  annualInterestRate: z
    .number()
    .min(0, "Must be 0 or greater")
    .max(100, "Cannot exceed 100%"),

  mipFundingFee: z
    .number()
    .min(0, "Must be 0 or greater")
    .max(100, "Cannot exceed 100%")
    .optional(),

  associationFee: z
    .number()
    .nonnegative("Must be 0 or greater")
    .optional(), // ✅ optional here too for consistency

  miPercent: z
    .number({ invalid_type_error: "MI is required" })
    .nonnegative("Must be 0 or greater"),
});

export type PurchaseInfoSchemaType = z.infer<typeof purchaseInfoSchema>;
