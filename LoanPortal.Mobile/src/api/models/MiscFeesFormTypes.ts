import { ZodType, z } from "zod";

export type MiscFeesFormData = {
  miscFee1?: number;
  miscFee2?: number;
  miscFee3?: number;
  miscFee4?: number;
};

export const miscFeesSchema: ZodType<MiscFeesFormData> = z.object({
  miscFee1: z
    .number({ invalid_type_error: "Misc Fee 1 must be a number" })
    .nonnegative("Misc Fee 1 cannot be negative")
    .optional(),
  miscFee2: z
    .number({ invalid_type_error: "Misc Fee 2 must be a number" })
    .nonnegative("Misc Fee 2 cannot be negative")
    .optional(),
  miscFee3: z
    .number({ invalid_type_error: "Misc Fee 3 must be a number" })
    .nonnegative("Misc Fee 3 cannot be negative")
    .optional(),
  miscFee4: z
    .number({ invalid_type_error: "Misc Fee 4 must be a number" })
    .nonnegative("Misc Fee 4 cannot be negative")
    .optional(),
});

export type MiscFeesSchemaType = z.infer<typeof miscFeesSchema>;
