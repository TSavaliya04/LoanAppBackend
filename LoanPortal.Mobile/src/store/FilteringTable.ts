// import { create } from "zustand";
// import { produce } from "immer";

// export interface FilterTableParams {
//   pageSize: number;
//   pageNumber: number;
//   searchText?: string;
//   SortBy?: string;
//   SortByDirection?: string;
//   OfficeIds?: string;
//   StartDate?: Date | string;
//   EndDate?: Date | string;
//   organisationid?: string;
// }

// export interface FilterStoreState {
//   params: FilterTableParams;
// }

// interface FilterTableStoreFunctions {
//   resetStore: () => void;
//   updateSearchText: (value: string) => void;
//   updatePagination: (pageNumber: number, pageSize: number) => void;
//   updateSorting: (SortBy?: string, SortByDirection?: string) => void;
//   updateOfficeIds: (OfficeIds: any[]) => void;
//   updateStartDate: (date?: Date) => void;
//   updateEndDate: (date?: Date) => void;
//   updateOrganization: (organizationid?: string) => void;
// }

// type FilterTablesStore = FilterTableStoreFunctions & FilterStoreState;
// const initialState: FilterStoreState = {
//   params: {
//     pageNumber: 0,
//     pageSize: 50,
//     searchText: "",
//     SortBy: "",
//     SortByDirection: "",
//   },
// };
// export const useFilterTablesStore = create<FilterTablesStore>((set) => ({
//   ...initialState,
//   resetStore: () => {
//     set(initialState);
//   },
//   updateSearchText: (value) => {
//     set(
//       produce((state: FilterTablesStore) => {
//         state.params.searchText = value.length > 0 ? value : undefined;
//       })
//     );
//   },
//   updatePagination: (pageNumber, pageSize) => {
//     set(
//       produce((state: FilterTablesStore) => {
//         state.params.pageNumber = pageNumber;
//         state.params.pageSize = pageSize;
//       })
//     );
//   },
//   updateSorting: (SortByParam, SortByDirectionParam) => {
//     set(
//       produce((state: FilterTablesStore) => {
//         state.params.SortBy = SortByParam ? SortByParam : undefined;
//         state.params.SortByDirection = SortByDirectionParam
//           ? SortByDirectionParam
//           : undefined;
//       })
//     );
//   },
//   updateOfficeIds: (value) => {
//     set(
//       produce((state: FilterTablesStore) => {
//         state.params.OfficeIds = value.length > 0 ? value.join(",") : undefined;
//       })
//     );
//   },
//   updateStartDate: (date) => {
//     set(
//       produce((state: FilterTablesStore) => {
//         state.params.StartDate = date?.toDateString();
//       })
//     );
//   },
//   updateEndDate: (date) => {
//     set(
//       produce((state: FilterTablesStore) => {
//         state.params.EndDate = date?.toDateString();
//       })
//     );
//   },
//   updateOrganization: (organisationId) => {
//     set(
//       produce((state: FilterTablesStore) => {
//         state.params.organisationid = organisationId;
//       })
//     );
//   },
// }));
