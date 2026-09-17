// "use client";

// import {
//   Box,
//   Grid,
//   TextField,
//   Typography,
//   IconButton,
//   Collapse,
//   InputAdornment,
//   Button,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import { useFormContext, useFieldArray, Controller } from "react-hook-form";
// import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
// import SVGs from "@/components/SVGs";

// type BorrowersIncomeDataFormProps = {
//   expanded: boolean;
//   onToggle: () => void;
// };

// export default function BorrowersIncomeDataForm({ expanded, onToggle }: BorrowersIncomeDataFormProps) {
//   const {
//     control,
//     formState: { errors },
//   } = useFormContext<CombinedPreApprovalFormData>();

//   const { fields, append } = useFieldArray({
//     control,
//     name: "borrowersIncomeData.borrowerIncome",
//   });

//   return (
//     <Box
//       sx={{
//         borderRadius: 4,
//         // backgroundColor: expanded ? "#fff" : "transparent",
//         // padding: expanded ? "15px" : "0px",
//       }}
//     >
//       <Box
//         display="flex"
//         alignItems="center"
//         justifyContent="space-between"
//         onClick={onToggle}
//         sx={{ cursor: "pointer" }}
//       >
//         {expanded ? (
//           <Typography display={"none"} fontWeight={600} color="primary">
//             Borrower&apos;s Income Data
//           </Typography>
//         ) : (
//           <Box
//             sx={{
//               width: "100%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               gap: 1,
//               border: "1px solid",
//               borderColor: "#888888",
//               borderRadius: 2,
//               padding: "8px 15px 8px 9px",
//             }}
//           >
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <Box
//                 sx={{
//                   width: 40,
//                   height: 40,
//                   borderRadius: 2,
//                   backgroundColor: "#7444F5",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <SVGs name="Borrowers_income_data_icon" />
//               </Box>
//               <Typography sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}>
//                 Borrower&apos;s Income Data
//               </Typography>
//             </Box>
//             <IconButton size="small" sx={{ color: "black" }}>
//               <SVGs name="Edit_icon" />
//             </IconButton>
//           </Box>
//         )}
//       </Box>

//       {/* Collapsible Form Content */}
//       <Collapse in={expanded} timeout="auto" unmountOnExit>
//         <Box >
//           {fields.map((field, index) => (
//             <Box
//               key={field.id}
//               sx={{
//                 borderRadius: 3,
//                 backgroundColor: "#fff",
//                 p: 2,
//                 mb: 3,
//               }}
//             >
//               <Typography
//                 variant="subtitle1"
//                 sx={{ fontWeight: 600, color: "#5D24C0", mb: 2 }}
//               >
//                 Borrower {index + 1} Income Data
//               </Typography>

//               <Grid container spacing={2}>
//                 <Grid size={{xs: 12}}>
//                   <Controller
//                     name={`borrowersIncomeData.borrowerIncome.${index}.borrowerName`}
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         fullWidth
//                         label="Borrower Name"
//                         error={!!errors.borrowersIncomeData?.borrowerIncome?.[index]?.borrowerName}
//                         helperText={errors.borrowersIncomeData?.borrowerIncome?.[index]?.borrowerName?.message}
//                       />
//                     )}
//                   />
//                 </Grid>

//                 <Grid size={{xs: 12}}>
//                   <Controller
//                     name={`borrowersIncomeData.borrowerIncome.${index}.employer`}
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         fullWidth
//                         label="Employer"
//                         error={!!errors.borrowersIncomeData?.borrowerIncome?.[index]?.employer}
//                         helperText={errors.borrowersIncomeData?.borrowerIncome?.[index]?.employer?.message}
//                       />
//                     )}
//                   />
//                 </Grid>

//                 <Grid size={{xs: 12}}>
//                   <Controller
//                     name={`borrowersIncomeData.borrowerIncome.${index}.monthlyIncome`}
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
//                         value={field.value ?? ""}
//                         fullWidth
//                         label="Monthly Income"
//                         placeholder="Enter here"
//                         type="number"
//                         InputProps={{
//                           startAdornment: <InputAdornment position="start">$</InputAdornment>,
//                           inputMode: "decimal",
//                         }}
//                         error={!!errors.borrowersIncomeData?.borrowerIncome?.[index]?.monthlyIncome}
//                         helperText={errors.borrowersIncomeData?.borrowerIncome?.[index]?.monthlyIncome?.message}
//                       />
//                     )}
//                   />
//                 </Grid>
//               </Grid>
//             </Box>
//           ))}

//           <Box textAlign="center">
//             <Button
//               onClick={() => append({ borrowerName: "", employer: "", monthlyIncome: 0 })}
//               startIcon={<AddIcon />}
//               sx={{
//                 color: "#7444F5",
//                 width: "100%",
//                 borderColor: "#7444F54D",
//                 borderWidth: 2,
//                 borderRadius: 999,
//                 px: 4,
//                 textTransform: "none",
//                 fontWeight: 600,
//                 backgroundColor: "transparent",
//                 ":hover": {
//                   backgroundColor: "#f3e6fd",
//                   borderColor: "#C1A9F5",
//                 },
//               }}
//               variant="outlined"
//             >
//               ADD BORROWER
//             </Button>
//           </Box>
//         </Box>
//       </Collapse>
//     </Box>
//   );
// }
