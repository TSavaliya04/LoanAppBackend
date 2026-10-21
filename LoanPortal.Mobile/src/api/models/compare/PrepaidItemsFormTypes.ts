import { ZodType, z } from "zod";

export type PrepaidItemsEntry = {
  preApprovalId?: string;
  prepaidInterestDays: number;
  prepaidInterestAmount: number;
  hazardInsurance: number;
  hazardInsuranceMonths: number;
  hazardInsuranceReserves: number;
  propertyTaxMonths: number;
  propertyTaxAmount: number;
};

export type PrepaidItemsFormData = {
  Inputs: PrepaidItemsEntry[];
};

export const prepaidItemsSchema: ZodType<PrepaidItemsFormData> = z.object({
  Inputs: z.array(
    z.object({
      prepaidInterestDays: z
        .number({
          invalid_type_error: "Prepaid Interest Days must be a number",
        })
        .min(0, "Prepaid Interest Days must be at least 0"),
      prepaidInterestAmount: z
        .number({
          invalid_type_error: "Prepaid Interest Amount must be a number",
        })
        .min(0, "Prepaid Interest Amount must be at least 0"),
      hazardInsurance: z
        .number({ invalid_type_error: "Hazard Insurance must be a number" })
        .min(0, "Hazard Insurance must be at least 0"),
      hazardInsuranceMonths: z
        .number({
          invalid_type_error: "Hazard Insurance Months must be a number",
        })
        .min(0, "Hazard Insurance Months must be at least 0"),
      hazardInsuranceReserves: z
        .number({
          invalid_type_error: "Hazard Insurance Reserves must be a number",
        })
        .min(0, "Hazard Insurance Reserves must be at least 0"),
      propertyTaxMonths: z
        .number({ invalid_type_error: "Property Tax Months must be a number" })
        .min(0, "Property Tax Months must be at least 0"),
      propertyTaxAmount: z
        .number({ invalid_type_error: "Property Tax Amount must be a number" })
        .min(0, "Property Tax Amount must be at least 0"),
    })
  ),
});
