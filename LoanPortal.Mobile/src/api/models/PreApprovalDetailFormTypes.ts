import { ZodType, z } from "zod";

export type PreApprovalDetailFormData = {
  userId?: string;
  preApprovalId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastSubmittedFormNo?: number;
  statusUpdatedAt?: string | null;
};

export const preApprovalDetailFormDataSchema: ZodType<PreApprovalDetailFormData> =
  z.object({
    userId: z.string().trim().min(1, "Borrower name is required"),
    preApprovalId: z.string().trim().min(1, "Borrower name is required"),
    createdAt: z.string().trim().min(1, "Borrower name is required"),
    updatedAt: z.string().trim().min(1, "Borrower name is required"),
    statusUpdatedAt: z.string().trim().nullable().optional(),
  });
