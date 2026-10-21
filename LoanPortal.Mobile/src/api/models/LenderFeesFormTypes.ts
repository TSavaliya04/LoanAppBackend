import { ZodType, z } from "zod";

const optionalNumber = (message?: string) =>
  z.union([
    z.number().nonnegative(message),
    z.literal("").transform(() => undefined),
  ]).optional();

const optionalPercentage = (fieldName: string) =>
  z
    .union([
      z
        .number({
          invalid_type_error: `${fieldName} must be a number`,
        })
        .min(0, `${fieldName} must be at least 0`)
        .max(100, `${fieldName} cannot exceed 100`),
      z.literal("").transform(() => undefined),
    ])
    .optional();

export type LenderFeesFormData = {
  agentName: string;
  loanOriginationFeePercentage?: number | string | undefined;
  loanOriginationFee?: number;
  discountFeePercentage?: number | string | undefined;
  discountFee?: number;
  upfrontMipPercentage?: number | string | undefined;
  upfrontMip?: number;
  appraisalFee?: number | string | undefined;
  escrowFees?: number | string | undefined;
  titleFees?: number | string | undefined;
  thirdPartyLenderFee?: number | string | undefined;
};

export const lenderFeesSchema: ZodType<LenderFeesFormData> = z.object({
  agentName: z.string().trim().min(1, "Agent name is required"),

  loanOriginationFeePercentage: optionalPercentage("Loan Organization Fee Percentage"),

  loanOriginationFee: z
    .number({ invalid_type_error: "Loan Origination Fee must be a number" })
    .nonnegative("Loan Origination Fee cannot be negative")
    .optional(),

  discountFeePercentage: optionalPercentage("Discount Fee Percentage"),

  discountFee: z
    .number({ invalid_type_error: "Discount Fee must be a number" })
    .nonnegative("Discount Fee cannot be negative")
    .optional(),

  upfrontMipPercentage: optionalPercentage("Upfront MIP Percentage"),

  upfrontMip: z
    .number({ invalid_type_error: "Upfront MIP must be a number" })
    .nonnegative("Upfront MIP cannot be negative")
    .optional(),

  appraisalFee: optionalNumber("Must be 0 or greater"),

  escrowFees: optionalNumber("Must be 0 or greater"),

  titleFees: optionalNumber("Must be 0 or greater"),

  thirdPartyLenderFee: optionalNumber("Must be 0 or greater"),
});

export type LenderFeesSchemaType = z.infer<typeof lenderFeesSchema>;
