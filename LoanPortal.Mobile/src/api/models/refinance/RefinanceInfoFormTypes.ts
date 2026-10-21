import { ZodType, z } from "zod";

export type RefinanceInfoFormData = {
  countyID?: string;
  propertyType: string;
  occupancyStatus: string;
  estimatedPropertyValue: number;
  ltv: number;
  loanAmount: number;
  currentLoanBalance?: number | "";
  creditLimit?: number;
  currentDrawAmount?: number;
  refinanceType: string;
  maxAllowed?: number;
  desiredCashOut?: number;
  interestRate?: number | string | undefined;
  monthlyTaxAmount?: number | string | undefined;
  annualTaxAmount?: number | string | undefined;
  mipRate: number;
  hazardInsurance: number;
  associationFee?: number;
  mi?: number;
};

export const refinanceInfoSchema: ZodType<RefinanceInfoFormData> = z.object({
  countyID: z.string().uuid("Invalid county ID").or(z.literal("")).optional(),
  propertyType: z.string().trim().min(1, "Property type is required"),
  occupancyStatus: z.string().trim().min(1, "Occupancy status is required"),
  estimatedPropertyValue: z
    .number({ invalid_type_error: "Estimated property value is required" })
    .nonnegative("Must be 0 or greater"),
  ltv: z
    .number()
    .min(0, "Must be 0 or greater")
    .max(100, "Cannot exceed 100%"),
  loanAmount: z
    .number({ invalid_type_error: "Loan amount is required" })
    .nonnegative("Must be 0 or greater"),
  currentLoanBalance: z.union([z.number().nonnegative(), z.literal("")]).optional(),
  creditLimit: z
    .number({ invalid_type_error: "Credit limit is required" })
    .nonnegative("Must be 0 or greater")
    .optional(),
  currentDrawAmount: z
    .number({ invalid_type_error: "Current draw amount is required" })
    .nonnegative("Must be 0 or greater")
    .optional(),
  refinanceType: z.string().trim().min(1, "Property type is required"),
  maxAllowed: z.number().optional(),
  desiredCashOut: z
    .number({ invalid_type_error: "Desired cash out is required" })
    .nonnegative("Must be 0 or greater")
    .optional(),
  interestRate: z
    .union([z.number(), z.literal("")])
    .optional()
    .transform((val) => (val === "" || val === undefined ? undefined : val))
    .pipe(
      z
        .number()
        .min(0, "Must be 0 or greater")
        .max(100, "Cannot exceed 100%")
        .optional()
    ),
  monthlyTaxAmount: z
    .union([z.number(), z.literal("")])
    .optional()
    .transform((val) => (val === "" || val === undefined ? undefined : val))
    .pipe(
      z.number().nonnegative("Must be 0 or greater").optional()
    ),
  annualTaxAmount: z
    .union([z.number(), z.literal("")])
    .optional()
    .transform((val) => (val === "" || val === undefined ? undefined : val))
    .pipe(
      z.number().nonnegative("Must be 0 or greater").optional()
    ),
  mipRate: z
    .number()
    .min(0, "Must be 0 or greater")
    .max(100, "Cannot exceed 100%"),
  hazardInsurance: z
    .number({ invalid_type_error: "Hazard insurance is required" })
    .nonnegative("Must be 0 or greater"),
  associationFee: z.number().nonnegative("Must be 0 or greater").optional(),
  mi: z
    .number({ invalid_type_error: "MI is required" })
    .nonnegative("Must be 0 or greater"),
});

export type RefinanceInfoSchemaType = z.infer<typeof refinanceInfoSchema>;