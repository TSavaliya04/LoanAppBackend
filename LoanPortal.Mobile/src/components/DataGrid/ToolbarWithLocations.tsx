// import { useFilterTablesStore } from "@/store/FilteringTable";
// import { Stack } from "@mui/material";
// import { GridToolbarQuickFilter } from "@mui/x-data-grid";
// import TmiLocationMultiSelect from "../Forms/FormFields/TmiLocationMultiSelect";

// const ToolbarWithLocations = () => {
//   const { updateOfficeIds } = useFilterTablesStore();

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
//       {/* <GridToolbarQuickFilter
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
//       /> */}
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
//     </Stack>
//   );
// };
// export default ToolbarWithLocations;
