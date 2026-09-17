import { useMutation, useQuery } from "@tanstack/react-query";
import { preApprovalApi } from "../network/getAllPreApprovals";

export const useGetPreApprovalById = (id: string) => {
  return useQuery({
    queryKey: ["preApproval", id],
    queryFn: () => preApprovalApi.getPreApprovalById(id),
    enabled: !!id, // only trigger if ID is present and enabled
  });
};

export const useCreateBorrowerInfo = () => {
  return useMutation({
    mutationFn: preApprovalApi.borrowerInfo,
  })
};

export const useCreatePurchaseInfo = () => {
    return useMutation({
    mutationFn: preApprovalApi.purchaseInfo,
  })
};

export const useCreateLenderFees = () => {
    return useMutation({
    mutationFn: preApprovalApi.lenderFees,
  })
};

export const useCreatePrepaidItems = () => {
  return useMutation({
    mutationFn: preApprovalApi.prepaidItems,
  })
};

export const useCreateMiscFees = () => {
  return useMutation({
    mutationFn: preApprovalApi.miscFees,
  })
};

export const useCreateBorrowersIncomeData = () => {
  return useMutation({
    mutationFn: preApprovalApi.borrowersIncomeData,
  })
};

export const useCreateDeptBreakDown = () => {
  return useMutation({
    mutationFn: preApprovalApi.deptBreakdown,
  })
};

export const useCreateLoanProgram = () => {
  return useMutation({
    mutationFn: preApprovalApi.loanProgram,
  })
};