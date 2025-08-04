import { ZodType, z } from "zod";

export type BorrowerInfoFormData = {
  borrowerName: string;
  coBorrowerName?: string;
  ficoScore: number;
  coBorrowerFicoScore?: number;
  borrowerCellNumber: string;
  coBorrowerCellNumber?: string;
  borrowerEmail: string;
  loanProgram: string;
  propertyType: string;
  occupancyStatus: string;
};

export const borrowerInfoSchema: ZodType<BorrowerInfoFormData> = z.object({
  borrowerName: z
    .string()
    .trim()
    .min(1, "Borrower name is required")
    .regex(/^[^\d]*$/, "Borrower name should not contain numbers"),

  coBorrowerName: z
    .string()
    .trim()
    .regex(/^[^\d]*$/, "Co-Borrower name should not contain numbers")
    .optional(),

  ficoScore: z
    .number({ invalid_type_error: "FICO Score must be a number" })
    .min(300, "FICO Score must be at least 300")
    .max(850, "FICO Score must be at most 850"),

  coBorrowerFicoScore: z
    .number({ invalid_type_error: "Co-Borrower FICO Score must be a number" })
    .min(300, "Co-Borrower FICO Score must be at least 300")
    .max(850, "Co-Borrower FICO Score must be at most 850")
    .optional(),

  borrowerCellNumber: z
    .string()
    .trim()
    .min(1, "Borrower phone is required")
    .max(10, "Borrower phone must not exceed 10 digits"),

  coBorrowerCellNumber: z
    .string()
    .trim()
    .max(10, "Co-Borrower phone must not exceed 10 digits")
    .optional(),

  borrowerEmail: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  loanProgram: z.string().trim().min(1, "Loan program is required"),
  propertyType: z.string().trim().min(1, "Property type is required"),
  occupancyStatus: z.string().trim().min(1, "Occupancy status is required"),
});
