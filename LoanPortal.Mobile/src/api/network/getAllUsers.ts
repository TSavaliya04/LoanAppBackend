import { FilterStoreState, FilterTableParams } from "@/store/FilteringTable";
import guardedInstance from "../instances/guardedInstance";
import {
    userManagementList,
    userManagementListResponse,
} from "../models/user";

export interface userParams {
    page: number;
    pageSize: number;
}
type searchParams = string | undefined;

export interface SortParams {
    SortBy: string;
    SortByDirection: string | undefined;
}

export const usersApi = {
    getAllUsers: async (params: FilterTableParams) => {
        let url = "/admin/GetUsers";
        const { data } = await guardedInstance.post<userManagementListResponse>(url, {
            params: params,
        });
        return data.data;
    },
    getUserDetails: async (userId: string) => {
        let url = `/admin/user/GetUserDetails?userId=${userId}`;
        const { data } = await guardedInstance.get(url);
        return data.data;
    },
    getQuotesOverview: async (
        startDate: string | null,
        endDate: string | null,
        userId: string
    ) => {
        let url = "/admin/user/QuotesOverview";

        // Build query params
        const params = new URLSearchParams();
        if (startDate && endDate) {
            params.append("startDate", startDate);
            params.append("endDate", endDate);
        }
        params.append("userId", userId);

        url += `?${params.toString()}`;

        const { data } = await guardedInstance.get(url);
        return data;
    },
    getRecentQuotes: async (userId: string, params: any) => {
        let url = "/admin/user/RecentQuotes";
        const { data } = await guardedInstance.post(url, {
            params: params,
            userId: userId
        });
        return data.data;
    },
};
