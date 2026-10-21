import { z } from "zod";
import { borrowerInfoSchema } from "./BorrowerInfoFormTypes";
import { purchaseInfoSchema } from "./PurchaseInfoFormTypes";
import { lenderFeesSchema } from "./LenderFeesFormTypes";
import { prepaiditemsSchema } from "./PrepaidItemsFormTypes";
import { miscFeesSchema } from "./MiscFeesFormTypes";
import { borrowersIncomeDataSchema } from "./BorrowersInncomeDataFormTypes";
import { loanProgramSchema } from "./LoanProgramFormTypes";
import { preApprovalDetailFormDataSchema } from "./PreApprovalDetailFormTypes";
import { propertyIncomeOffsetSchema } from "./PropertyIncomeOffsetFormTypes";

export const scenarioSchema = z.object({
  id: z.string().uuid().optional(),
  scenarioOrder: z.number(),
  scenarioName: z.string().min(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastSubmittedFormNo: z.number().optional(),
  pdfType: z.enum(["quickQuote", "preApproval", "FHAGFE", ""]).optional(),
  borrowerInfo: borrowerInfoSchema,
  purchaseInfo: purchaseInfoSchema,
  propertyIncomeOffset: propertyIncomeOffsetSchema,
  lenderFees: lenderFeesSchema,
  prepaidItems: prepaiditemsSchema,
  miscFees: miscFeesSchema,
  borrowersIncomeData: borrowersIncomeDataSchema,
  // deptBreakdown: deptBreakdownSchema,
  loanProgram: loanProgramSchema,
});

export type ScenarioFormData = z.infer<typeof scenarioSchema>;

export const combinedPreApprovalSchema = z.object({
  preapprovalDetail: preApprovalDetailFormDataSchema,

  scenarios: z.array(scenarioSchema).min(1, {
    message: "At least one scenario is required",
  }),
});

// export const combinedPreApprovalSchema = z.object({
//   preapprovalDetail: preApprovalDetailFormDataSchema,
//   borrowerInfo: borrowerInfoSchema,
//   purchaseInfo: purchaseInfoSchema,
//   lenderFees: lenderFeesSchema,
//   prepaidItems: prepaiditemsSchema,
//   miscFees: miscFeesSchema,
//   borrowersIncomeData: borrowersIncomeDataSchema,
//   // deptBreakdown: deptBreakdownSchema,
//   loanProgram: loanProgramSchema,
// });

export type CombinedPreApprovalFormData = z.infer<
  typeof combinedPreApprovalSchema
>;
