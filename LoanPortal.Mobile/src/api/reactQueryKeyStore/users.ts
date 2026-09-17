// import { FilterTableParams } from "@/store/FilteringTable";
// import {
//   createQueryKeys,
//   inferQueryKeys,
// } from "@lukemorales/query-key-factory";
// import { userPostParams } from "../reactQueriesHooks/useGetUserDetails";

// export const users = createQueryKeys("users", {
//   detail: (userId: string) => [userId],
//   tcScore: (userId: string) => [userId],
//   list: (filters: FilterTableParams) => ({
//     queryKey: [{ filters }],
//   }),
//   listOptions: () => ({
//     queryKey: ["listOptions"],
//   }),
//   listDetails: (filters: FilterTableParams) => ({
//     queryKey: [{ filters }],
//   }),
//   activeDetail: (filters: userPostParams) => ({
//     queryKey: [{ filters }],
//   }),
//   flaggedDetail: (filters: userPostParams) => ({
//     queryKey: [{ filters }],
//   }),
//   requestOfflist: (filters: FilterTableParams) => ({
//     queryKey: [{ filters }],
//   }),
//   officeListOptions: () => ({
//     queryKey: ["officeListOptions"],
//   }),
//   scheduleResourcesOptions: () => ({
//     queryKey: ["scheduleResourcesOptions"],
//   }),
//   scheduleEventsOptions: () => ({
//     queryKey: ["scheduleEventsOptions"],
//   }),
// });

// export type UsersKeys = inferQueryKeys<typeof users>;
