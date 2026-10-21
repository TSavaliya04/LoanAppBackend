import { Stack, Skeleton } from "@mui/material";
import { GridLoadingOverlayProps } from "@mui/x-data-grid";
import React from "react";

interface Props extends GridLoadingOverlayProps {
  count?: number;
}

const DataGridSkeleton = ({ count = 10 }: Props) => {
  return (
    <Stack
      sx={{
        height: "max-content",
        mt: 1,
      }}
      spacing={1}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={45} />
      ))}
    </Stack>
  );
};

export default DataGridSkeleton;
