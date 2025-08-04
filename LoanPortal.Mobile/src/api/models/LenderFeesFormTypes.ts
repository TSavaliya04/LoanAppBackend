import { ZodType, z } from "zod";

export type LenderFeesFormData = {
  agentName: string;
  loanOriginationFee?: number;
  discountFee?: number;
  upfrontMip?: number;
  appraisalFee?: number;
  escrowFees?: number;
  titleFees?: number;
  thirdPartyLenderFee?: number;
};

export const lenderFeesSchema: ZodType<LenderFeesFormData> = z.object({
  agentName: z.string().trim().min(1, "Agent name is required"),

  loanOriginationFee: z
    .number({ invalid_type_error: "Loan Origination Fee must be a number" })
    .nonnegative("Loan Origination Fee cannot be negative")
    .optional(),

  discountFee: z
    .number({ invalid_type_error: "Discount Fee must be a number" })
    .nonnegative("Discount Fee cannot be negative")
    .optional(),

  upfrontMip: z
    .number({ invalid_type_error: "Upfront MIP must be a number" })
    .nonnegative("Upfront MIP cannot be negative")
    .optional(),

  appraisalFee: z
    .number({ invalid_type_error: "Appraisal Fee must be a number" })
    .nonnegative("Appraisal Fee cannot be negative")
    .optional(),

  escrowFees: z
    .number({ invalid_type_error: "Escrow Fees must be a number" })
    .nonnegative("Escrow Fees cannot be negative")
    .optional(),

  titleFees: z
    .number({ invalid_type_error: "Title Fees must be a number" })
    .nonnegative("Title Fees cannot be negative")
    .optional(),

  thirdPartyLenderFee: z
    .number({ invalid_type_error: "3rd Party Lender Fee must be a number" })
    .nonnegative("3rd Party Lender Fee cannot be negative")
    .optional(),
});

export type LenderFeesSchemaType = z.infer<typeof lenderFeesSchema>;
