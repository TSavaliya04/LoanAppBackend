import { useFilterTablesStore } from '@/store/FilteringTable';
import { GridPaginationModel, GridFilterModel, GridSortModel } from '@mui/x-data-grid';
import React, { useEffect } from 'react'

const useServerSideFilter = () => {
    const { updateSearchText, updateSorting, updatePagination, params, resetStore } = useFilterTablesStore();
    useEffect(() => {
        resetStore();
    }, [])

    const handlePaginationChange = (pageData: GridPaginationModel) => {
        updatePagination(pageData.page, pageData.pageSize);
    }

    const onFilterChange = React.useCallback((filterModel: GridFilterModel) => {
        updateSearchText(filterModel.quickFilterValues?.toString() as string)
    }, []);

    const handleSortModelChange = React.useCallback((sortModel: GridSortModel) => {
        if (sortModel.length > 0) {
            updateSorting(sortModel[0]?.field ?? undefined, sortModel[0]?.sort ?? undefined)

        } else {
            updateSorting(undefined, undefined);
        }

    }, []);
    return { onFilterChange, handleSortModelChange, params, handlePaginationChange, } as const;
}

export default useServerSideFilter