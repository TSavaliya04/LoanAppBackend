import { z } from "zod";
import { borrowerInfoSchema } from "./BorrowerInfoFormTypes";
import { purchaseInfoSchema } from "./PurchaseInfoFormTypes";
import { lenderFeesSchema } from "./LenderFeesFormTypes";
import { prepaiditemsSchema } from "./PrepaidItemsFormTypes";
import { miscFeesSchema } from "./MiscFeesFormTypes";
import { borrowersIncomeDataSchema } from "./BorrowersInncomeDataFormTypes";
import { loanProgramSchema } from "./LoanProgramFormTypes";

export const combinedPreApprovalSchema = z.object({
  borrowerInfo: borrowerInfoSchema,
  purchaseInfo: purchaseInfoSchema,
  lenderFees: lenderFeesSchema,
  prepaidItems: prepaiditemsSchema,
  miscFees: miscFeesSchema,
  borrowersIncomeData: borrowersIncomeDataSchema,
  // deptBreakdown: deptBreakdownSchema,
  loanProgram: loanProgramSchema,
});

export type CombinedPreApprovalFormData = z.infer<typeof combinedPreApprovalSchema>;