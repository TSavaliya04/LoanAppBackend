import { z } from "zod";
import { loanProgramSchema } from "./compare/LoanProgramFormTypes";
import { purchaseInfoSchema } from "./compare/PurchaseInfoFormTypes";
import { borrowerInfoSchema } from "./compare/BorrowerInfoFormTypes";
import { borrowersIncomeDataSchema } from "./compare/BorrowersInncomeDataFormTypes";
import { prepaidItemsSchema } from "./compare/PrepaidItemsFormTypes";
import { miscFeesSchema } from "./compare/MiscFeesFormTypes";
import { lenderFeesSchema } from "./compare/LenderFeesFormTypes";
import { preApprovalDetailFormDataSchema } from "./compare/PreApprovalDetailFormTypes";

export const ComparePreApprovalSchema = z.object({
  preapprovalDetail: preApprovalDetailFormDataSchema,
  borrowerInfo: borrowerInfoSchema,
  purchaseInfo: purchaseInfoSchema,
  lenderFees: lenderFeesSchema,
  prepaidItems: prepaidItemsSchema,
  miscFees: miscFeesSchema,
  borrowersIncomeData: borrowersIncomeDataSchema,
  loanProgram: loanProgramSchema,
});

export type ComparePreApprovalFormData = z.infer<typeof ComparePreApprovalSchema>;