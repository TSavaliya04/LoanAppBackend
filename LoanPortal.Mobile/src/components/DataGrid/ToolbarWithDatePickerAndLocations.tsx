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
// import TmiLocationMultiSelect from "../Forms/FormFields/TmiLocationMultiSelect";
// import { add, startOfToday, sub } from "date-fns";
// import { useFilterTablesStore } from "@/store/FilteringTable";

// const ToolbarWithDatePickerAndLocations = () => {
//   const { rangeDateValue, setRangeDateValue } = useDateRangePickerStore();
//   const { params, updateStartDate, updateEndDate, updateOfficeIds } =
//   useFilterTablesStore();
 
//   // useEffect(() => {
//   //   updateStartDate(sub(startOfToday(), { days: 10 }));
//   //   updateEndDate(add(startOfToday(), { days: 10 }));

//   //   setRangeDateValue([
//   //     sub(startOfToday(), { days: 10 }),
//   //     add(startOfToday(), { days: 10 }),
//   //   ]);

//   // }, []);

//   const SetDefaultDate = () => {   
//     updateStartDate(undefined);
//     updateEndDate(undefined);
//     setRangeDateValue([null,null ]);
     
//   }

//   function ActionList(props: PickersActionBarProps) {
//     return (
//       <Stack className={props.className} direction={"row"} sx={{ p: 2 }}>
//         <Button onClick={SetDefaultDate}>
//           {"Reset"}
//         </Button>
//       </Stack>
//     );
//   }

//   const updateDate = (date: DateRange<unknown> | Date[]) => {
//     updateStartDate(date[0] as Date);
//     updateEndDate(date[1] as Date);
//   };
//   return (
//     <Stack
//       direction={"row"}
//       gap={2}
//       sx={{
//         p: 0.5,
//         pt: 1,
//         pb: 0,
//       }}
//     >
//       <GridToolbarQuickFilter
//         label="Search by"
//         variant={"outlined"}
//         sx={{ width: "100%", flexGrow: 1 }}
//         size="small"
//         placeholder=""
//         quickFilterParser={(searchInput: string) => {
//           return searchInput
//             .split(",")
//             .map((value) => value.trim())
//             .filter((value) => value !== "");
//         }}
//         debounceMs={500}
//       />
//       <TmiLocationMultiSelect
//         label={"Filter by Location"}
//         name={"offices"}
//         callback={(office) => {
//           if (office && office.length > 0) {
//             var officeIds = office.map((a) => parseInt(a.value));
//             updateOfficeIds(officeIds);
//           } else {
//             office = [];
//             updateOfficeIds([]);
//           }
//         }}
//       />
//       <Box>
//         <DateRangePicker
          
//           slots={{ field: SingleInputDateRangeField , actionBar: ActionList}}
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
// export default ToolbarWithDatePickerAndLocations;
