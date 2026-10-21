import { ZodType, z } from "zod";

const optionalNumber = (message?: string) =>
  z.union([
    z.number().nonnegative(message),
    z.literal("").transform(() => undefined),
  ]).optional();


export type PropertyIncomeOffsetFormData = {
  monthlyGrossRentalIncome: number;
  rentalPercentage: number;
  subjectPropertyPITIA: number;
  qualifyingRentalIncome: number;
  netMonthlyImpactToDTI: number;
};

export const propertyIncomeOffsetSchema: ZodType<PropertyIncomeOffsetFormData> = z.object({
  monthlyGrossRentalIncome: z
    .number({ invalid_type_error: "Monthly gross rental income is required" })
    .nonnegative("Must be 0 or greater"),

  rentalPercentage: z
    .number({ invalid_type_error: "Rental percentage is required" })
    .min(0, "Must be 0 or greater")
    .max(100, "Cannot exceed 100%"),

  subjectPropertyPITIA: z
    .number({ invalid_type_error: "Subject property PITIA is required" })
    .nonnegative("Must be 0 or greater"),

  qualifyingRentalIncome: z
    .number({ invalid_type_error: "Qualifying rental income is required" })
    .nonnegative("Must be 0 or greater"),

  netMonthlyImpactToDTI: z
    .number({ invalid_type_error: "Net monthly impact to DTI is required" })
    .nonnegative("Must be 0 or greater"),
});

export type PropertyIncomeOffsetSchemaType = z.infer<typeof propertyIncomeOffsetSchema>;