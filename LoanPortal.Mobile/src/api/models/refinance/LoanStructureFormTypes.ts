import { z } from "zod";

export type LoanStructureFormData = {
  loanProgram: string;
  lienPosition?: string;
};

export const loanStructureSchema = z
  .object({
    loanProgram: z.string().trim().min(1, "Loan program is required"),
    lienPosition: z.string().optional(),
  })


export type LoanStructureSchemaType = z.infer<typeof loanStructureSchema>;