import { z } from "zod";
import { RefinancePreApprovalDetailFormDataSchema } from "./PreApprovalDetailFormTypes";
import { borrowerInfoSchema } from "./BorrowerInfoFormTypes";
import { refinanceInfoSchema } from "./RefinanceInfoFormTypes";
import { loanStructureSchema } from "./LoanStructureFormTypes";
import { lenderFeesSchema } from "./LenderFeesFormTypes";
import { borrowersIncomeDataSchema } from "./BorrowersInncomeDataFormTypes";
import { loanProgramSchema } from "./LoanProgramFormTypes";

export const scenarioSchema = z.object({
  id: z.string().uuid().optional(),
  scenarioOrder: z.number(),
  scenarioName: z.string().min(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastSubmittedFormNo: z.number().optional(),
  pdfType: z.enum(["quickQuote", "preApproval", "FHAGFE", ""]).optional(),
  borrowerInfo: borrowerInfoSchema,
  loanStructure: loanStructureSchema,
  refinanceInfo: refinanceInfoSchema,
  lenderFees: lenderFeesSchema,
  borrowersIncomeData: borrowersIncomeDataSchema,
  loanProgram: loanProgramSchema,
});

export type ScenarioFormData = z.infer<typeof scenarioSchema>;

export const combinedRefinancePreApprovalSchema = z.object({
  preapprovalDetail: RefinancePreApprovalDetailFormDataSchema,

  scenarios: z.array(scenarioSchema).min(1, {
    message: "At least one scenario is required",
  }),
});

export type CombinedRefinancePreApprovalFormData = z.input<
  typeof combinedRefinancePreApprovalSchema
>;
