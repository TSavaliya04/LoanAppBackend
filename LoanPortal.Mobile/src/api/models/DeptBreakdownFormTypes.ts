import { ZodType, z } from "zod";

export type DeptEntry = {
  debtType: string;
  balance: number;
  highCredit: number;
  monthlyPayment: number;
};

export type DeptBreakdownAPIPayload = DeptEntry[];

export type DeptBreakdownFormData = {
  dept: DeptEntry[];
};

export const deptBreakdownSchema: ZodType<DeptBreakdownFormData> = z.object({
  dept: z
    .array(
      z.object({
        debtType: z.string().trim().min(1, "Dept Type is required"),
        balance: z
          .number({ invalid_type_error: "Balance must be a number" })
          .nonnegative("Balance cannot be negative"),
        highCredit: z
          .number({ invalid_type_error: "High Credit must be a number" })
          .nonnegative("High Credit cannot be negative"),
        monthlyPayment: z
          .number({ invalid_type_error: "Monthly must be a number" })
          .nonnegative("Monthly cannot be negative"),
      })
    )
    .min(1, "At least one Dept entry is required"),
});

export type DeptBreakdownSchemaType = z.infer<typeof deptBreakdownSchema>;
