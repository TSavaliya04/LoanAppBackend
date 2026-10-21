// import { useDateRangePickerStore } from "@/store/useDateRangePicker";
// import { Box, Button, Stack } from "@mui/material";
// import { GridToolbarQuickFilter } from "@mui/x-data-grid";
// import {
//   DateRange,
//   DateRangePicker,
//   PickersActionBarProps,
//   SingleInputDateRangeField,
// } from "@mui/x-date-pickers-pro";
// import React, { useEffect } from "react";
// import SVGs, { SVGLIST } from "../SVGs";
// import { add, startOfToday, sub } from "date-fns";
// import { useFilterTablesStore } from "@/store/FilteringTable";

// const ToolbarWithDatePicker = () => {
//   const { rangeDateValue, setRangeDateValue } = useDateRangePickerStore();
//   const { params, updateStartDate, updateEndDate, updateOfficeIds } =
//     useFilterTablesStore();


//   // const SetDefaultDate = () => {
//   //   updateStartDate(sub(startOfToday(), { days: 10 }));
//   //   updateEndDate(add(startOfToday(), { days: 10 }));
//   //   setRangeDateValue([
//   //     sub(startOfToday(), { days: 10 }),
//   //     add(startOfToday(), { days: 10 }),
//   //   ]);
//   // }
//   // useEffect(() => {
//   //   SetDefaultDate();
//   // }, []);

//   const SetDefaultDate = () => {
//     updateStartDate(undefined);
//     updateEndDate(undefined);
//     setRangeDateValue([null, null]);

//   }

//   const updateDate = (date: DateRange<unknown> | Date[]) => {
//     updateStartDate(date[0] as Date);
//     updateEndDate(date[1] as Date);
//   };

//   function ActionList(props: PickersActionBarProps) {
//     return (
//       <Stack className={props.className} direction={"row"} sx={{ p: 2 }}>
//         <Button onClick={SetDefaultDate}>
//           {"Reset"}
//         </Button>
//       </Stack>
//     );
//   }

//   return (
//     <Stack
//       direction={"row"}
//       justifyContent="space-between"
//       gap={2}
//       sx={{
//         p: 0,
//         pt: 1,
//         pb: "20px",
//       }}
//     >
//       <GridToolbarQuickFilter
//         label=""
//         variant={"outlined"}
//         sx={{ width: "35%"}}
//         size="small"
//         placeholder="Search by"
//         quickFilterParser={(searchInput: string) => {
//           return searchInput
//             .split(",")
//             .map((value) => value.trim())
//             .filter((value) => value !== "");
//         }}
//         debounceMs={500}
//       />
//       <Box>
//         <DateRangePicker
//           slots={{ field: SingleInputDateRangeField, actionBar: ActionList }}
//           slotProps={{
//             textField: {
//               size: "small",
//               label: "",
//               sx: { minWidth: "320px", "& input": { paddingLeft: "15px" } },
//               InputProps: { startAdornment: <SVGs name={SVGLIST.dateRange} /> },
//             },
//           }}
//           value={rangeDateValue}
//           onChange={(date) => {
//             setRangeDateValue(date);
//             updateDate(date);
//           }}
//         />
//       </Box>
//     </Stack>
//   );
// };
// export default ToolbarWithDatePicker;
