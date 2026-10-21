import { ZodType, z } from "zod";

export type BorrowerInfoFormData = {
  borrowerName: string;
  coBorrowerName?: string;
  // ficoScore?: number;
  // coBorrowerFicoScore?: number;
  borrowerCellNumber?: string;
  coBorrowerCellNumber?: string;
  borrowerEmail?: string;
  dateOfBirth?: Date;
  currentAddress?: string;
  ssn?: string;
  maritalStatus?: number | null;
};

export const borrowerInfoSchema: ZodType<BorrowerInfoFormData> = z.object({
  borrowerName: z
    .string()
    .trim()
    .min(1, "Borrower name is required"),

  coBorrowerName: z
    .string()
    .trim()
    .optional(),

  // ficoScore: z
  //   .number({ invalid_type_error: "FICO Score must be a number" })
  //   .min(300, "FICO Score must be at least 300")
  //   .max(850, "FICO Score must be at most 850")
  //   .optional(),

  // coBorrowerFicoScore: z
  //   .number({ invalid_type_error: "Co-Borrower FICO Score must be a number" })
  //   .min(300, "Co-Borrower FICO Score must be at least 300")
  //   .max(850, "Co-Borrower FICO Score must be at most 850")
  //   .optional(),

  borrowerCellNumber: z
    .string()
    .trim()
    .max(10, "Borrower phone must not exceed 10 digits")
    .optional(),

  coBorrowerCellNumber: z
    .string()
    .trim()
    .max(10, "Co-Borrower phone must not exceed 10 digits")
    .optional(),

  borrowerEmail: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  dateOfBirth: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.date().optional()
  ),

  currentAddress: z
    .string()
    .trim()
    .optional(),

  ssn: z
    .string()
    .trim()
    .optional(),

  maritalStatus: z
    .number()
    .nullable()
    .optional(),
}) as unknown as ZodType<BorrowerInfoFormData>;
