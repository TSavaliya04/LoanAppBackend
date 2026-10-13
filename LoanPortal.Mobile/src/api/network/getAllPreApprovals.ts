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

export interface ContinueWorkingQuotesParams {
  pageNumber: number;
  pageSize: number;
  searchText?: string;
  sortBy?: string;
  sortByDirection?: string;
  companyId?: string;
  filterBy?: string;
  status?: number | null;
}

export const preApprovalApi = {
  getDashboardData: async () => {
    const url = `/preapproval/GetDashboardData`; // <-- adjust the endpoint if needed
    const { data } = await guardedInstance.get(url);
    return data;
  },
  getTopOpportunities: async (status?: number | null) => {
    const url =
      status !== null && status !== undefined
        ? `/preapproval/getQuoteList?status=${status}`
        : `/preapproval/getQuoteList`;

    const { data } = await guardedInstance.get(url);
    return data;
  },
  getContinueWorkingQuotes: async (params: ContinueWorkingQuotesParams) => {
    const url = `/preapproval/GetContinueWorkingQuotes`;
    const { data } = await guardedInstance.post(url, { params });
    return data;
  },
  getInEscrow: async () => {
    const url = `/preapproval/GetInEscrowList`; // <-- adjust the endpoint if needed
    const { data } = await guardedInstance.get(url);
    return data;
  },
  getTBDS: async () => {
    const url = `/preapproval/GetTBDsList`; // <-- adjust the endpoint if needed
    const { data } = await guardedInstance.get(url);
    return data;
  },
  getPreApprovalById: async (id: string) => {
    const url = `/preapproval/GetPreApproval?id=${id}`;
    const { data } = await guardedInstance.get(url);
    return data;
  },
  createPreApproval: async (payload: unknown) => {
    const url = `/preapproval/SavePreApproval`;
    const { data } = await guardedInstance.post(url, payload);
    return data;
  },
  deletePreApproval: async (payload: string[]) => {
    const url = `/preapproval/DeletePreApproval`;
    const { data } = await guardedInstance.delete(url, { data: payload });
    return data;
  },
  changeStatusPreApproval: async (preApprovalId: string, status: number) => {
    const url = `/preapproval/UpdateApplicationStatus?id=${preApprovalId}&status=${status}`;
    const { data } = await guardedInstance.put(url);
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
  getBorrowerLink: async () => {
    const url = `/EmploymentLink/Me`;
    const { data } = await guardedInstance.get(url);
    return data;
  },
};

export function updateChangeStatusPreApproval(preApprovalId: string, status: number) {
  return guardedInstance.put(
    `/preapproval/UpdateApplicationStatus?id=${preApprovalId}&status=${status}`
  );
}

export function getquickQuoteReport(preApprovalId: string, scenarioId: string) {
  return guardedInstance.get(
    `/preapproval/QuickQuote?preApprovalId=${preApprovalId}&scenarioId=${scenarioId}`
  );
}

export function getRefinancequickQuoteReport(preApprovalId: string) {
  return guardedInstance.get(
    `/preapproval/GetPreApproval?id=${preApprovalId}`
  );
}

export function getRefinanceFeeWorksheetReport(preApprovalId: string) {
  return guardedInstance.get(
    `/preapproval/GetPreApproval?id=${preApprovalId}`
  );
}

export function getRefinanceLoanFileReport(preApprovalId: string, scenarioId: string) {
  return guardedInstance.get(
    `/preapproval/CreateLoanFile?preApprovalId=${preApprovalId}&scenarioId=${scenarioId}`
  );
}

export function getpreApprovalReport(preApprovalId: string, scenarioId: string) {
  return guardedInstance.get(
    `/preapproval/PreApprovalReport?preApprovalId=${preApprovalId}&scenarioId=${scenarioId}`
  );
}

export function getFHAGFEReport(preApprovalId: string, scenarioId: string) {
  return guardedInstance.get(
    `/preapproval/FHAReport?preApprovalId=${preApprovalId}&scenarioId=${scenarioId}`
  );
}

export function generateAIStrategySummary(preApprovalId: string, borrowerGoal: number) {
  return guardedInstance.post(`/aistrategy/GenerateSummary`, {
    preApprovalId,
    borrowerGoal,
  });
}
