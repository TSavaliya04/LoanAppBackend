import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { preApprovalApi } from "../network/getAllPreApprovals";
import { saveBorrowerDraft, fetchBorrowerDrafts, submitBorrowerEmployment } from "../network/user";
import { SaveDraftPayload, SubmitEmploymentPayload } from "../models/BorrowerPortalDraftTypes";

export const useGetDashboardData = () => {
  return useQuery({
    queryKey: ["getDashboardData"],
    queryFn: () => preApprovalApi.getDashboardData(),
    refetchOnWindowFocus: false,
  });
};

export const useGetPreApprovalById = (id: string) => {
  return useQuery({
    queryKey: ["preApproval", id],
    queryFn: () => preApprovalApi.getPreApprovalById(id),
    enabled: !!id, // only trigger if ID is present and enabled
    refetchOnWindowFocus: false,
  });
};

export const useGetPreApprovalByIdOnSubmit = (id: string) => {
  return useQuery({
    queryKey: ["preApprovalOnSubmit", id],
    queryFn: () => preApprovalApi.getPreApprovalById(id),
    enabled: !!id, // only trigger if ID is present and enabled
    refetchOnWindowFocus: false,
  });
};

export const useGetPreApprovalByIdOnGenerate = (id: string) => {
  return useQuery({
    queryKey: ["preApprovalOnGenerate", id],
    queryFn: () => preApprovalApi.getPreApprovalById(id),
    enabled: !!id, // only trigger if ID is present and enabled
    refetchOnWindowFocus: false,
  });
};

export const useGetMultiplePreApprovalById = (ids: string[]) => {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["preApproval", id],
      queryFn: () => preApprovalApi.getPreApprovalById(id),
      enabled: !!id,
      refetchOnWindowFocus: false,
    })),
  });
};

export const useCreatePreApproval = () => {
  return useMutation({
    mutationFn: preApprovalApi.createPreApproval,
  });
}

export const useDeletePreApproval = () => {
  return useMutation({
    mutationFn: preApprovalApi.deletePreApproval,
  });
}

export const useCreateBorrowerInfo = () => {
  return useMutation({
    mutationFn: preApprovalApi.borrowerInfo,
  });
};

export const useCreatePurchaseInfo = () => {
  return useMutation({
    mutationFn: preApprovalApi.purchaseInfo,
  });
};

export const useCreateLenderFees = () => {
  return useMutation({
    mutationFn: preApprovalApi.lenderFees,
  });
};

export const useCreatePrepaidItems = () => {
  return useMutation({
    mutationFn: preApprovalApi.prepaidItems,
  });
};

export const useCreateMiscFees = () => {
  return useMutation({
    mutationFn: preApprovalApi.miscFees,
  });
};

export const useCreateBorrowersIncomeData = () => {
  return useMutation({
    mutationFn: preApprovalApi.borrowersIncomeData,
  });
};

export const useCreateDeptBreakDown = () => {
  return useMutation({
    mutationFn: preApprovalApi.deptBreakdown,
  });
};

export const useCreateLoanProgram = () => {
  return useMutation({
    mutationFn: preApprovalApi.loanProgram,
  });
};

export const useGetBorrowerLink = (enabled: boolean) => {
  return useQuery({
    queryKey: ["getBorrowerLink"],
    queryFn: () => preApprovalApi.getBorrowerLink(),
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Mutation hook for saving the borrower employment draft.
 * Call mutate(payload) on every step continuation (steps 1–8).
 * Step 9 (Review/Submit) will use a separate API added later.
 */
export const useSaveBorrowerDraft = () => {
  return useMutation({
    mutationFn: (payload: SaveDraftPayload) => saveBorrowerDraft(payload),
  });
};

/**
 * Query hook for fetching the borrower's existing draft data.
 * Calls GET borrowerportal/mydrafts using the borrower auth token.
 */
export const useFetchBorrowerDrafts = (enabled: boolean) => {
  return useQuery({
    queryKey: ["borrowerDrafts"],
    queryFn: () => fetchBorrowerDrafts(),
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Mutation hook for the final borrower employment submission (Step 9).
 * Calls POST borrowerportal/submit using the borrower auth token.
 */
export const useSubmitBorrowerEmployment = () => {
  return useMutation({
    mutationFn: (payload: SubmitEmploymentPayload) => submitBorrowerEmployment(payload),
  });
};
