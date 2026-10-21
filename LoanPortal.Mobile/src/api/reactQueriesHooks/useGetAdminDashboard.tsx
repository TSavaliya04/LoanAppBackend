import { useMutation, useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "../network/getAdminDashboard";

export const useGetAdminDashboard = (startDate: string | null, endDate: string | null) => {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminDashboardApi.getAdminDashboard(startDate, endDate),
  });
};