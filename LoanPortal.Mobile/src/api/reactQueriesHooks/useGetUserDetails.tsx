import { useFilterTablesStore } from "@/store/FilteringTable";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../reactQueryKeyStore";
import { usersApi } from "../network/getAllUsers";
import { userManagementList, userManagementListResponse, UserManagementPageGridCustom } from "../models/user";

export interface userPostParams {
    userId: string;
    pageSize: number;
}

const transformUserListSync = (DataTableList: userManagementList): UserManagementPageGridCustom => {
    const users = DataTableList?.users?.map((user) => {
        const company = user.company ? user.company : 'N/A';
        const formatedLastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A';
        return {
            ...user,
            company,
            lastLogin: formatedLastLogin,
        };
    }) || [];
    return {
        ...DataTableList,
        users,
    };
};

export const useGetAllUsers = () => {
    let { params } = useFilterTablesStore();

    return useQuery({
        queryKey: queryKeys.users.list(params).queryKey,
        queryFn: () => usersApi.getAllUsers(params),
        select: (data: userManagementList) => transformUserListSync(data),
        refetchOnWindowFocus: false,
    });
};

export const useGetUserDetails = (userId: string) => {
    return useQuery({
        queryKey: ['userDetails', userId],
        queryFn: () => usersApi.getUserDetails(userId),
        enabled: !!userId,
        refetchOnWindowFocus: false,
    });
};

export const useGetQuotesOverview = (
    startDate: string | null,
    endDate: string | null,
    userId: string
) => {
    return useQuery({
        queryKey: ['quotesOverview', startDate, endDate, userId],
        queryFn: () => usersApi.getQuotesOverview(startDate, endDate, userId),
        enabled: !!userId,
        refetchOnWindowFocus: false,
    });
};

export const useGetRecentQuotes = (userId: string, params: any) => {
    return useQuery({
        queryKey: ['recentQuotes', userId, params],
        queryFn: () => usersApi.getRecentQuotes(userId, params),
        enabled: !!userId,
        refetchOnWindowFocus: false,
    });
};