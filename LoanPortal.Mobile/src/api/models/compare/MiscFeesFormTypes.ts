import { ZodType, z } from "zod";

export type MiscFeesEntry = {
  earnestMoneyDeposit?: number;
  sellerCredit?: number;
  lenderCredit?: number;
  miscFee4?: number;
};

export type MiscFeesFormData = {
  Inputs: MiscFeesEntry[];
};

export const miscFeesSchema: ZodType<MiscFeesFormData> = z.object({
  Inputs: z.array(
    z.object({
      earnestMoneyDeposit: z
        .number({
          invalid_type_error: "Earnest Money Deposit (EMD) must be a number",
        })
        .nonnegative("Earnest Money Deposit (EMD) cannot be negative")
        .optional(),
      sellerCredit: z
        .number({ invalid_type_error: "Seller Credit must be a number" })
        .nonnegative("Seller Credit cannot be negative")
        .optional(),
      lenderCredit: z
        .number({ invalid_type_error: "Lender Credit must be a number" })
        .nonnegative("Lender Credit cannot be negative")
        .optional(),
      miscFee4: z
        .number({ invalid_type_error: "Misc Fee 4 must be a number" })
        .nonnegative("Misc Fee 4 cannot be negative")
        .optional(),
    })
  ),
});
