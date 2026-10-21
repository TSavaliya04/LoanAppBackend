import { ZodType, z } from "zod";

export type MiscFeesFormData = {
  earnestMoneyDeposit?: number | string | undefined;
  sellerCredit?: number | string | undefined;
  lenderCredit?: number | string | undefined;
  miscFee4?: number | string | undefined;
};

const optionalNumber = (message?: string) =>
  z.union([
    z.number().nonnegative(message),
    z.literal("").transform(() => undefined),
  ]).optional();

export const miscFeesSchema: ZodType<MiscFeesFormData> = z.object({
  earnestMoneyDeposit: optionalNumber("Earnest Money Deposit (EMD) cannot be negative"),
  sellerCredit: optionalNumber("Seller Credit cannot be negative"),
  lenderCredit: optionalNumber("Lender Credit cannot be negative"),
  miscFee4: optionalNumber("Misc Fee 4 cannot be negative"),
});

export type MiscFeesSchemaType = z.infer<typeof miscFeesSchema>;
