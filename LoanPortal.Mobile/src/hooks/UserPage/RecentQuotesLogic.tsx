import React, { useMemo, useState, useCallback } from "react";
import { GridColDef, GridPaginationModel, GridSortModel, GridEventListener } from "@mui/x-data-grid";
import { Chip, Stack, Typography } from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import dayjs from "dayjs";
import { useGetRecentQuotes } from "@/api/reactQueriesHooks/useGetUserDetails";

interface RecentQuotesLogicProps {
    userId: string;
}

const RecentQuotesLogic = ({ userId }: RecentQuotesLogicProps) => {
    // Local state for table params to avoid conflict with global store
    const [params, setParams] = useState<{
        pageNumber: number;
        pageSize: number;
        searchText: string;
        SortBy: string;
        SortByDirection: string | undefined;
    }>({
        pageNumber: 0,
        pageSize: 10,
        searchText: "",
        SortBy: "date",
        SortByDirection: "desc",
    });

    const { data, isLoading, isFetching } = useGetRecentQuotes(userId, params);

    const [rowCountState, setRowCountState] = useState(data?.totalCount || 0);

    useMemo(() => {
        if (data?.totalCount !== undefined) {
            setRowCountState(data.totalCount);
        }
    }, [data?.totalCount]);

    const handlePaginationChange = useCallback((model: GridPaginationModel) => {
        setParams(prev => ({
            ...prev,
            pageNumber: model.page,
            pageSize: model.pageSize
        }));
    }, []);

    const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
        if (sortModel.length > 0) {
            setParams(prev => ({
                ...prev,
                SortBy: sortModel[0].field,
                SortByDirection: sortModel[0].sort || undefined
            }));
        } else {
            setParams(prev => ({
                ...prev,
                SortBy: "",
                SortByDirection: ""
            }));
        }
    }, []);

    const columns: GridColDef[] = useMemo(
        () => [
            {
                field: "date", // Adjust based on actual API response field
                headerName: "Date",
                flex: 1,
                renderCell: (params) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayOutlinedIcon
                            fontSize="small"
                            sx={{ color: "#7444F5" }}
                        />
                        <Typography variant="body2">
                            {params.value ? dayjs(params.value).format("MMM DD") : "-"}
                        </Typography>
                    </Stack>
                )
            },
            {
                field: "clientName",
                headerName: "Client",
                flex: 1,
            },
            {
                field: "loanAmount",
                headerName: "Loan Amount",
                flex: 1,
                renderCell: (params) => (
                    <Typography variant="body2">
                        {params.value ? `$${Number(params.value).toLocaleString()}` : "-"}
                    </Typography>
                )
            },
            {
                field: "loanType",
                headerName: "Loan Type",
                flex: 1,
            },
            {
                field: "stage",
                headerName: "Status",
                flex: 1,
                renderCell: (params) => {
                    const status = params.value;
                    const isEscrow = status === "Escrow";
                    return (
                        <Chip
                            label={status || "Unknown"}
                            size="small"
                            sx={{
                                bgcolor: isEscrow ? "#EDE7F6" : "#F3E5F5",
                                color: isEscrow ? "#7444F5" : "#9C27B0",
                            }}
                        />
                    );
                },
            },
        ],
        []
    );

    return {
        rowCountState,
        columns,
        data,
        isLoading: isLoading || isFetching,
        params,
        handlePaginationChange,
        handleSortModelChange,
    };
};

export default RecentQuotesLogic;
