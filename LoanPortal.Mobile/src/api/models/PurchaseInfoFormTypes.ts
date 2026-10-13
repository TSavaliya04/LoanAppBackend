import { ZodType, z } from "zod";

const optionalNumber = (message?: string) =>
  z.union([
    z.number().nonnegative(message),
    z.literal("").transform(() => undefined),
  ]).optional();


export type PurchaseInfoFormData = {
  loanProgram: string;
  propertyType: string;
  countyID?: string;
  occupancyStatus: string;
  purchasePrice: number;
  downPayment: number;
  loanAmount: number | null;
  annualInterestRate: number;
  mipFundingFee?: number;
  hazardInsurance?: number | string | undefined;
  associationFee?: number | string | undefined;
  miPercent?: number;
  monthlyPropertyTaxPercentage: number;
  monthlyPropertyTax: number;
};

export const purchaseInfoSchema: ZodType<PurchaseInfoFormData> = z.object({
  loanProgram: z.string().trim().min(1, "Loan program is required"),
  propertyType: z.string().trim().min(1, "Property type is required"),
  countyID: z.string().uuid("Invalid county ID").or(z.literal("")).optional(),
  occupancyStatus: z.string().trim().min(1, "Occupancy status is required"),
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

  annualInterestRate: z
    .number()
    .min(0, "Must be 0 or greater")
    .max(100, "Cannot exceed 100%"),

  mipFundingFee: z
    .number()
    .min(0, "Must be 0 or greater")
    .max(100, "Cannot exceed 100%")
    .optional(),

  hazardInsurance: optionalNumber("Must be 0 or greater"),
  associationFee: optionalNumber("Must be 0 or greater"),

  miPercent: z
    .number({ invalid_type_error: "MI is required" })
    .nonnegative("Must be 0 or greater"),
  monthlyPropertyTaxPercentage: z
    .number({ invalid_type_error: "Monthly Property Tax is required" })
    .min(0, "Must be 0 or greater")
    .max(100, "Cannot exceed 100%"),
  monthlyPropertyTax: z
    .number()
    .min(0, "Monthly Property Tax must be at least 0"),
}).superRefine((data, ctx) => {
  if (
    data.loanAmount !== null &&
    data.loanAmount !== undefined &&
    data.purchasePrice !== undefined &&
    data.loanAmount > data.purchasePrice
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: data.purchasePrice,
      type: "number",
      inclusive: true,
      message: "Loan amount cannot exceed purchase price",
      path: ["loanAmount"],
    });
  }
});

export type PurchaseInfoSchemaType = z.infer<typeof purchaseInfoSchema>;