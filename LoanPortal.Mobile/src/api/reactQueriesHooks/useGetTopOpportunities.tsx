import { useQuery } from "@tanstack/react-query";
import { preApprovalApi } from "../network/getAllPreApprovals";
import { ContinueWorkingQuotesParams } from "../network/getAllPreApprovals";

export const useGetAllTopOpportunities = (status: number | null) => {
  return useQuery({
    queryKey: ["topOpportunities"],
    queryFn: () => preApprovalApi.getTopOpportunities(status),
  });
};
export const useGetAllContinueWorkingQuotes = (params: ContinueWorkingQuotesParams) => {
  return useQuery({
    queryKey: ["continueWorkingQuotes", params],
    queryFn: () => preApprovalApi.getContinueWorkingQuotes(params),
  });
};
export const useGetAllInEscrow = () => {
  return useQuery({
    queryKey: ["inEscrow"],
    queryFn: () => preApprovalApi.getInEscrow(),
  });
};
export const useGetAllgetTBDS = () => {
  return useQuery({
    queryKey: ["TBDS"],
    queryFn: () => preApprovalApi.getTBDS(),
  });
};
// export const useGetAllTopOpportunities = () => {
//   let { params } = useFilterTablesStore();

//   return useQuery(
//     queryKeys.users.list(params).queryKey,
//     () => usersApi.getAllUsers(params),
//     {
//       select: (data: CassavaUserManagementList) => transformUserListSync(data),
//       refetchOnWindowFocus: false,
//     }
//   );
// };
