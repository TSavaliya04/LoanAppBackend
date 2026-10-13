import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridEventListener,
} from "@mui/x-data-grid";
import * as React from "react";

import DataGridSkeleton from "./DataGridSkeleton";

type Props = {
  columns: GridColDef[] | [];
  onRowClick?: GridEventListener<"rowClick">;
  onCellClick?: GridEventListener<"cellClick">;
  headerHeight?: number;
  isSearchVisible?: boolean;
  cellHeight?: string;
  py?: number;
  pageSize?: number;
} & DataGridProps;

export default function OGDataGrid({
  onRowClick,
  onCellClick,
  columns,
  headerHeight = 40,
  pageSize = 50,
  cellHeight = "auto",
  isSearchVisible = true,
  slots,
  ...rest
}: Props) {
  return (
    <DataGrid
      {...rest}
      initialState={{
        pagination: { paginationModel: { pageSize } },
      }}
      slots={{
        ...slots,
        loadingOverlay: DataGridSkeleton,
      }}
      onRowClick={onRowClick}
      onCellClick={onCellClick}
      columns={columns}
      // getRowId={(row) => row.id1}
    />
  );
}
