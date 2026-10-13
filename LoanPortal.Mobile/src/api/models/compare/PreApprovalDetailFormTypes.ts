import { ZodType, z } from "zod";

export type PreApprovalDetailEntry = {
  userId?: string;
  preApprovalId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PreApprovalDetailFormData = {
  Inputs: PreApprovalDetailEntry[];
};

export const preApprovalDetailFormDataSchema: ZodType<PreApprovalDetailFormData> =
  z.object({
    Inputs: z.array(
      z.object({
        userId: z.string().trim().min(1, "Borrower name is required"),
        preApprovalId: z.string().trim().min(1, "Borrower name is required"),
        createdAt: z.string().trim().min(1, "Borrower name is required"),
        updatedAt: z.string().trim().min(1, "Borrower name is required"),
      })
    ),
  });
