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
//   MenuItem,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import { useFormContext, useFieldArray, Controller } from "react-hook-form";
// import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
// import SVGs from "@/components/SVGs";

// type DeptBreakdownFormProps = {
//   expanded: boolean;
//   onToggle: () => void;
// };

// export default function DeptBreakdownForm({ expanded, onToggle }: DeptBreakdownFormProps) {
//   const {
//     control,
//     formState: { errors },
//   } = useFormContext<CombinedPreApprovalFormData>();

//   const { fields, append } = useFieldArray({
//     control,
//     name: "deptBreakdown.dept",
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
//             Dept Breakdown
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
//                 <SVGs name="Dept_breakdown_icon" />
//               </Box>
//               <Typography sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}>
//                 Dept Breakdown
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
//                 Dept {index + 1}
//               </Typography>

//               <Grid container>
//                 <Grid size={{ xs: 12}} sx={{
//                     borderBottom: "1px solid #f0f0f0",
//                     py: 1.5,
//                   }}>
//                   <Controller
//                     name={`deptBreakdown.dept.${index}.debtType`}
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         fullWidth
//                         select
//                         label="Dept Type"
//                         error={!!errors.deptBreakdown?.dept?.[index]?.debtType}
//                         helperText={errors.deptBreakdown?.dept?.[index]?.debtType?.message}
//                       >
//                         <MenuItem value="1">Mortgage Payment</MenuItem>
//                         <MenuItem value="2">Car Payment</MenuItem>
//                         <MenuItem value="3">Credit Card</MenuItem>
//                         <MenuItem value="4">Installment</MenuItem>
//                         <MenuItem value="5">Other</MenuItem>
//                       </TextField>
//                     )}
//                   />
//                 </Grid>

//                 <Grid size={{xs: 12}}>
//                   <Box
//                     display="flex"
//                     alignItems="center"
//                     justifyContent="space-between"
//                     sx={{
//                       borderBottom: "1px solid #f0f0f0",
//                       px: 2,
//                       py: 1.5,
//                     }}
//                   >
//                     <Typography fontWeight={600}>Balance</Typography>
//                     <Controller
//                       name={`deptBreakdown.dept.${index}.balance`}
//                       control={control}
//                       render={({ field }) => (
//                         <TextField
//                           {...field}
//                           onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
//                           value={field.value ?? ""}
//                           fullWidth
//                           type="number"
//                           placeholder="0.00"
//                           size="medium"
//                           error={!!errors.deptBreakdown?.dept?.[index]?.balance}
//                           helperText={errors.deptBreakdown?.dept?.[index]?.balance?.message}
//                           sx={{
//                             maxWidth: 160,
//                             borderRadius: 2,
//                             "& .MuiOutlinedInput-root": {
//                               backgroundColor: "#f7f7f7",
//                               "& fieldset": {
//                                 border: "none",
//                               },
//                               "& input::placeholder": {
//                                 color: "#9e9e9e",
//                                 opacity: 1,
//                               },
//                             },
//                           }}
//                           InputProps={{
//                             startAdornment: (
//                               <InputAdornment position="start">
//                                 <span style={{ fontWeight: "bold", color: "black" }}>
//                                   $
//                                 </span>
//                               </InputAdornment>
//                             ),
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{xs: 12}}>
//                   <Box
//                     display="flex"
//                     alignItems="center"
//                     justifyContent="space-between"
//                     sx={{
//                       borderBottom: "1px solid #f0f0f0",
//                       px: 2,
//                       py: 1.5,
//                     }}
//                   >
//                     <Typography fontWeight={600}>High Credit</Typography>
//                     <Controller
//                       name={`deptBreakdown.dept.${index}.highCredit`}
//                       control={control}
//                       render={({ field }) => (
//                         <TextField
//                           {...field}
//                           onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
//                           value={field.value ?? ""}
//                           fullWidth
//                           type="number"
//                           placeholder="0.00"
//                           size="medium"
//                           error={!!errors.deptBreakdown?.dept?.[index]?.highCredit}
//                           helperText={errors.deptBreakdown?.dept?.[index]?.highCredit?.message}
//                           sx={{
//                             maxWidth: 160,
//                             borderRadius: 2,
//                             "& .MuiOutlinedInput-root": {
//                               backgroundColor: "#f7f7f7",
//                               "& fieldset": {
//                                 border: "none",
//                               },
//                               "& input::placeholder": {
//                                 color: "#9e9e9e",
//                                 opacity: 1,
//                               },
//                             },
//                           }}
//                           InputProps={{
//                             startAdornment: (
//                               <InputAdornment position="start">
//                                 <span style={{ fontWeight: "bold", color: "black" }}>
//                                   $
//                                 </span>
//                               </InputAdornment>
//                             ),
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>

//                 <Grid size={{xs: 12}}>
//                   <Box
//                     display="flex"
//                     alignItems="center"
//                     justifyContent="space-between"
//                     sx={{
//                       borderBottom: "1px solid #f0f0f0",
//                       px: 2,
//                       py: 1.5,
//                     }}
//                   >
//                     <Typography fontWeight={600}>Monthly Payment</Typography>
//                     <Controller
//                       name={`deptBreakdown.dept.${index}.monthlyPayment`}
//                       control={control}
//                       render={({ field }) => (
//                         <TextField
//                           {...field}
//                           onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
//                           value={field.value ?? ""}
//                           fullWidth
//                           type="number"
//                           placeholder="0.00"
//                           size="medium"
//                           error={!!errors.deptBreakdown?.dept?.[index]?.monthlyPayment}
//                           helperText={errors.deptBreakdown?.dept?.[index]?.monthlyPayment?.message}
//                           sx={{
//                             maxWidth: 160,
//                             borderRadius: 2,
//                             "& .MuiOutlinedInput-root": {
//                               backgroundColor: "#f7f7f7",
//                               "& fieldset": {
//                                 border: "none",
//                               },
//                               "& input::placeholder": {
//                                 color: "#9e9e9e",
//                                 opacity: 1,
//                               },
//                             },
//                           }}
//                           InputProps={{
//                             startAdornment: (
//                               <InputAdornment position="start">
//                                 <span style={{ fontWeight: "bold", color: "black" }}>
//                                   $
//                                 </span>
//                               </InputAdornment>
//                             ),
//                           }}
//                         />
//                       )}
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>
//           ))}

//           <Box textAlign="center">
//             <Button
//               onClick={() => append({ debtType: "", balance: 0, highCredit: 0, monthlyPayment: 0 })}
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
//               ADD DEPT
//             </Button>
//           </Box>
//         </Box>
//       </Collapse>
//     </Box>
//   );
// }
