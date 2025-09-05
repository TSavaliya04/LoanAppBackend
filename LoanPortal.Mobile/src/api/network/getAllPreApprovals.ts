import guardedInstance from "../instances/guardedInstance";
import { BorrowerInfoFormData } from "../models/BorrowerInfoFormTypes";
import { BorrowersIncomeAPIPayload } from "../models/BorrowersInncomeDataFormTypes";
import { DeptBreakdownAPIPayload } from "../models/DeptBreakdownFormTypes";
import { LenderFeesFormData } from "../models/LenderFeesFormTypes";
import { LoanProgramFormData } from "../models/LoanProgramFormTypes";
import { MiscFeesFormData } from "../models/MiscFeesFormTypes";
import { PrepaidItemsFormData } from "../models/PrepaidItemsFormTypes";
import { PurchaseInfoFormData } from "../models/PurchaseInfoFormTypes";

export interface userParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  SortBy: string;
  SortByDirection: string | undefined;
}

export const preApprovalApi = {
  getTopOpportunities: async () => {
    const url = `/preapproval/TopOpportunities`; // <-- adjust the endpoint if needed
    const { data } = await guardedInstance.get(url);
    return data;
  },
  getPreApprovalById: async (id: string) => {
    const url = `/preapproval/GetPreApproval?id=${id}`;
    const { data } = await guardedInstance.get(url);
    return data;
  },
  borrowerInfo: async (payload: BorrowerInfoFormData) => {
    const url = `/preapproval/BorrowerInfo`;
    const { data } = await guardedInstance.post(url, payload);
    return data;
  },
  purchaseInfo: async (payload: PurchaseInfoFormData) => {
    const url = `/preapproval/PurchaseInfo`;
    const { data } = await guardedInstance.post(url, payload);
    return data;
  },
  lenderFees: async (payload: LenderFeesFormData) => {
    const url = `/preapproval/LenderFees`;
    const { data } = await guardedInstance.post(url, payload);
    return data;
  },
  prepaidItems: async (payload: PrepaidItemsFormData) => {
    const url = `/preapproval/PrepaidItems`;
    const { data } = await guardedInstance.post(url, payload);
    return data;
  },
  miscFees: async (payload: MiscFeesFormData) => {
    const url = `/preapproval/MiscFees`;
    const { data } = await guardedInstance.post(url, payload);
    return data;
  },
  borrowersIncomeData: async (payload: BorrowersIncomeAPIPayload) => {
    const url = `/preapproval/BorrowerIncomeData`;
    const { data } = await guardedInstance.post(url, payload);
    return data;
  },
  deptBreakdown: async (payload: DeptBreakdownAPIPayload) => {
    const url = `/preapproval/DebtBreakdown`;
    const { data } = await guardedInstance.post(url, payload);
    return data;
  },
  loanProgram: async (payload: LoanProgramFormData) => {
    const url = `/preapproval/LoanProgram`;
    const { data } = await guardedInstance.post(url, payload);
    return data;
  },
};

export function getpreApprovalReport(preApprovalId: string) {
  return guardedInstance.get(`/preapproval/PreApprovalReport?preApprovalId=${preApprovalId}`);
}

export function getFHAGFEReport(preApprovalId: string) {
  return guardedInstance.get(`/preapproval/FHAReport?preApprovalId=${preApprovalId}`);
}
