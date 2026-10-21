import guardedInstance from "../instances/guardedInstance";
import { ProfileFormPayloadData } from "../models/ProfileFormTypes";

export const adminDashboardApi = {
  getAdminDashboard: async (
    startDate: string | null,
    endDate: string | null,
  ) => {
    let url = "/admin/GetAdminDashboard";

    // Only add query params if BOTH values exist
    if (startDate && endDate) {
      const params = new URLSearchParams({
        startDate,
        endDate,
      }).toString();

      url += `?${params}`;
    }

    const { data } = await guardedInstance.get(url);
    return data;
  },
};
