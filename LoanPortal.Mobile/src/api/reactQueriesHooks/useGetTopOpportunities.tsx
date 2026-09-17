import { useQuery } from "@tanstack/react-query";
import { preApprovalApi } from "../network/getAllPreApprovals";

export const useGetAllTopOpportunities = () => {
  return useQuery({
    queryKey: ["topOpportunities"],
    queryFn: () => preApprovalApi.getTopOpportunities(),
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
