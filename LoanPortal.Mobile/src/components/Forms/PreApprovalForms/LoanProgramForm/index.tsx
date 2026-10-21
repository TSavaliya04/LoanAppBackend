"use client";

import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Collapse,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import {
  useFormContext,
  Controller,
  useWatch,
  useFieldArray,
} from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import SVGs from "@/components/SVGs";
import { useEffect, useRef, useState } from "react";
import {
  usePreApprovalIndexStore,
  usePreApprovalStore,
} from "@/store/usePreApprovalStore";
import { NumericFormat } from "react-number-format";

type LoanProgramFormProps = {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  handleFieldChange: (index: number) => void;
};

export default function LoanProgramForm({
  index,
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
  handleFieldChange,
}: LoanProgramFormProps) {
  const {
    control,
    setValue,
    formState: { errors, dirtyFields },
  } = useFormContext<CombinedPreApprovalFormData>();

  // const renderCount = useRef(0);
  const [frontEndRatio, setFrontEndRatio] = useState(0);
  const [backEndRatio, setBackEndRatio] = useState(0);
  const loanProgramFrontEndRatio = useWatch({
    control,
    name: `scenarios.${index}.loanProgram.frontEndRatio`,
  });
  const loanProgramBackEndRatio = useWatch({
    control,
    name: `scenarios.${index}.loanProgram.backEndRatio`,
  });
  useEffect(() => {
    setFrontEndRatio(loanProgramFrontEndRatio);
    setBackEndRatio(loanProgramBackEndRatio);
  }, [loanProgramFrontEndRatio, loanProgramBackEndRatio]);

  const { fields } = useFieldArray({
    control,
    name: `scenarios.${index}.loanProgram.borrowers`,
  });
  // const frontEndRatio = usePreApprovalIndexStore(
  //   (state) => state.ratios[index]?.frontEndRatio ?? 0
  // );
  const monthlyIncome = usePreApprovalIndexStore(
    (state) => state.ratios[index]?.monthlyIncome ?? 0,
  );
  const frontEndRatiocolor = frontEndRatio <= 45 ? "#00CF1F" : "#F44336";

  // const backEndRatio = usePreApprovalIndexStore(
  //   (state) => state.ratios[index]?.backEndRatio ?? 0
  // );
  const backEndRatiocolor = backEndRatio <= 45 ? "#00CF1F" : "#F44336";

  // const borrowerIncome = useWatch({
  //   control,
  //   name: `scenarios.${index}.borrowersIncomeData.borrowerIncome`,
  // });
  // const associationFee =
  //   useWatch({
  //     control,
  //     name: `scenarios.${index}.purchaseInfo.associationFee`,
  //   }) ?? 0;
  const loanProgram =
    useWatch({
      control,
      name: `scenarios.${index}.purchaseInfo.loanProgram`,
    }) ?? "1";

  return (
    <Box
      sx={{
        borderRadius: 4,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {expanded ? (
          <Typography display={"none"} fontWeight={600} color="primary">
            Loan Program
          </Typography>
        ) : (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              border: "1px solid",
              borderColor: "#888888",
              borderRadius: 2,
              padding: "8px 15px 8px 9px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: isCompleted
                    ? "#1F9A00"
                    : isDisabled
                      ? "gray"
                      : "#7444F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <CheckIcon sx={{ color: "#fff" }} /> */}
                {isCompleted ? (
                  <SVGs name="Check_Mark_icon" />
                ) : isDisabled ? (
                  <SVGs name="Loan_Program_icon" />
                ) : (
                  <SVGs name="Loan_Program_icon" />
                )}
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Loan Program
              </Typography>
            </Box>
            {!isDisabled && (
              <IconButton
                size="small"
                sx={{ color: "black" }}
                onClick={onToggle}
              >
                <SVGs name="Edit_icon" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Collapsible Form Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box>
          <Grid container spacing={2}>
            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
              }}
            >
              {/* <Controller
                name="loanProgram.loanProgram"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Loan Program"
                    error={!!errors.loanProgram?.loanProgram}
                    helperText={errors.loanProgram?.loanProgram?.message}
                  >
                    <MenuItem value="1">Non QM</MenuItem>
                    <MenuItem value="2">Conventional</MenuItem>
                    <MenuItem value="3">FHA</MenuItem>
                  </TextField>
                )}
              /> */}
              <Controller
                name={`scenarios.${index}.purchaseInfo.loanProgram`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : String(e.target.value);
                      field.onChange(value);
                      handleFieldChange(index);
                    }}
                    fullWidth
                    select
                    label="Loan Program *"
                    error={
                      !!errors.scenarios?.[index]?.purchaseInfo?.loanProgram
                    }
                    helperText={
                      errors.scenarios?.[index]?.purchaseInfo?.loanProgram
                        ?.message
                    }
                  >
                    <MenuItem value="1">Non QM</MenuItem>
                    <MenuItem value="2">Conventional</MenuItem>
                    <MenuItem value="3">FHA</MenuItem>
                    <MenuItem value="4">VA</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  Ratios
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <Box width={"43%"}>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{ marginLeft: "8px" }}
                      >
                        Front
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          backgroundColor: "#f7f7f7",
                          border: `1px solid ${frontEndRatiocolor}`,
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          minWidth: 100,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "1.5rem",
                            color: `${frontEndRatiocolor}`,
                            textAlign: "center",
                          }}
                        >
                          {frontEndRatio}%
                        </Typography>
                      </Box>

                      {/* Hidden Front Ratio Input */}
                      <Controller
                        name={`scenarios.${index}.loanProgram.frontEndRatio`}
                        control={control}
                        render={({ field }) => (
                          <input type="hidden" {...field} />
                        )}
                      />
                    </Box>
                  </Box>

                  <Box width={"43%"}>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{ marginLeft: "8px" }}
                      >
                        Back
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          backgroundColor: "#f7f7f7",
                          border: `1px solid ${backEndRatiocolor}`,
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          minWidth: 100,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "1.5rem",
                            color: `${backEndRatiocolor}`,
                            textAlign: "center",
                          }}
                        >
                          {backEndRatio}%
                        </Typography>
                      </Box>

                      {/* Hidden Back Ratio Input */}
                      <Controller
                        name={`scenarios.${index}.loanProgram.backEndRatio`}
                        control={control}
                        render={({ field }) => (
                          <input type="hidden" {...field} />
                        )}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Price
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.purchaseInfo.purchasePrice`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          onValueChange={(values) => {
                            const value =
                              values.floatValue === undefined
                                ? ""
                                : values.floatValue;
                            field.onChange(value);
                            handleFieldChange(index);
                          }}
                          inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.purchaseInfo?.purchasePrice
                          }
                          helperText={
                            errors.scenarios?.[index]?.purchaseInfo?.purchasePrice
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "&:hover fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Annual Interest Rate
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.purchaseInfo.annualInterestRate`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          onChange={(e) => {
                            const value =
                              e.target.value === "" ? "" : Number(e.target.value);
                            field.onChange(value);
                            handleFieldChange(index);
                          }}
                          value={field.value ?? ""}
                          fullWidth
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          size="medium"
                          error={
                            !!errors.scenarios?.[index]?.purchaseInfo
                              ?.annualInterestRate
                          }
                          helperText={
                            errors.scenarios?.[index]?.purchaseInfo
                              ?.annualInterestRate?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "&:hover fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          inputProps={{
                            step: 0.01
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  %
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Base Loan Amount
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.loanProgram.baseLoanAmount`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) => {
                            field.onChange(
                              values.floatValue === undefined
                                ? undefined
                                : values.floatValue,
                            );
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.loanProgram?.baseLoanAmount
                          }
                          helperText={
                            errors.scenarios?.[index]?.loanProgram?.baseLoanAmount
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      UPMIP
                    </Typography>

                    <Box display="flex" gap={1} alignItems="center">
                      {/* Percentage Field */}
                      <Controller
                        name={`scenarios.${index}.lenderFees.upfrontMipPercentage`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            onChange={(e) => {
                              const value =
                                e.target.value === "" ? "" : Number(e.target.value);
                              field.onChange(value);
                              handleFieldChange(index);
                            }}
                            disabled={loanProgram === "3"}
                            value={field.value ?? ""}
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            size="small"
                            error={
                              !!errors.scenarios?.[index]?.lenderFees
                                ?.upfrontMipPercentage
                            }
                            helperText={
                              errors.scenarios?.[index]?.lenderFees
                                ?.upfrontMipPercentage?.message
                            }
                            sx={{
                              maxWidth: {
                                xs: 76,   // mobile
                                sm: 85,  // tablet
                              },
                              borderRadius: 2,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                paddingRight: "8.5px",
                                "& fieldset": {
                                  borderColor: "#F6F6F6",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#F6F6F6",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#F6F6F6",
                                },
                                "& input::placeholder": {
                                  color: "#9e9e9e",
                                  opacity: 1,
                                },
                                "& input": {
                                  padding: "8.5px 0 8.5px 8.5px", // adjust as needed
                                },
                              },
                            }}
                            inputProps={{
                              step: 0.01
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment
                                  position="end"
                                  sx={{ marginLeft: 0 }}
                                >
                                  <span
                                    style={{ fontWeight: "bold", color: "black" }}
                                  >
                                    %
                                  </span>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />

                      {/* Dollar Amount Field */}
                      <Controller
                        name={`scenarios.${index}.lenderFees.upfrontMip`}
                        control={control}
                        render={({ field }) => (
                          <NumericFormat
                            customInput={TextField}
                            fullWidth
                            value={field.value ?? ""}
                            placeholder="0"
                            disabled
                            onValueChange={(values) => {
                              field.onChange(
                                values.floatValue === undefined
                                  ? undefined
                                  : values.floatValue,
                              );
                            }}
                            thousandSeparator=","
                            allowNegative={false}
                            error={
                              !!errors.scenarios?.[index]?.lenderFees?.upfrontMip
                            }
                            helperText={
                              errors.scenarios?.[index]?.lenderFees?.upfrontMip
                                ?.message
                            }
                            sx={{
                              maxWidth: 120,
                              borderRadius: 2,
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f7f7f7",
                                "& fieldset": {
                                  border: "none",
                                },
                                "& input::placeholder": {
                                  color: "#9e9e9e",
                                  opacity: 1,
                                },
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <span
                                    style={{ fontWeight: "bold", color: "black" }}
                                  >
                                    $
                                  </span>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      MIP Rate
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.purchaseInfo.mipFundingFee`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          onChange={(e) => {
                            const value =
                              e.target.value === "" ? "" : Number(e.target.value);
                            field.onChange(value);
                            handleFieldChange(index);
                          }}
                          value={field.value ?? ""}
                          fullWidth
                          disabled={loanProgram === "3"}
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          size="medium"
                          error={
                            !!errors.scenarios?.[index]?.purchaseInfo?.mipFundingFee
                          }
                          helperText={
                            errors.scenarios?.[index]?.purchaseInfo?.mipFundingFee
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor:
                                loanProgram === "3" ? "#f7f7f7" : "#fff", // ✅ match your other disabled fields
                              "& fieldset": {
                                border:
                                  loanProgram === "3"
                                    ? "none"
                                    : "1px solid #F6F6F6", // ✅ border removed if disabled
                              },
                              "&:hover fieldset": {
                                borderColor:
                                  loanProgram === "3" ? "none" : "#F6F6F6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor:
                                  loanProgram === "3" ? "none" : "#F6F6F6",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          inputProps={{
                            step: 0.01
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  %
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Final Loan Amount
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.loanProgram.finalLoanAmount`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) => {
                            field.onChange(
                              values.floatValue === undefined
                                ? undefined
                                : values.floatValue,
                            );
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.loanProgram
                              ?.finalLoanAmount
                          }
                          helperText={
                            errors.scenarios?.[index]?.loanProgram?.finalLoanAmount
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      MMI
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.purchaseInfo.miPercent`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) => {
                            field.onChange(
                              values.floatValue === undefined
                                ? undefined
                                : values.floatValue,
                            );
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={!!errors.scenarios?.[index]?.purchaseInfo?.miPercent}
                          helperText={
                            errors.scenarios?.[index]?.purchaseInfo?.miPercent?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Term
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.loanProgram.term`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          onChange={(e) => {
                            const value =
                              e.target.value === "" ? "" : Number(e.target.value);
                            field.onChange(value);
                            handleFieldChange(index);
                          }}
                          value={field.value ?? ""}
                          fullWidth
                          type="number"
                          inputMode="numeric"
                          size="medium"
                          error={!!errors.scenarios?.[index]?.loanProgram?.term}
                          helperText={
                            errors.scenarios?.[index]?.loanProgram?.term?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "&:hover fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Down Payment
                    </Typography>

                    <Box display="flex" gap={1} alignItems="center">
                      {/* Percentage Field */}
                      <Controller
                        name={`scenarios.${index}.purchaseInfo.downPayment`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            onChange={(e) => {
                              const value =
                                e.target.value === "" ? "" : Number(e.target.value);
                              field.onChange(value);
                              handleFieldChange(index);
                            }}
                            value={field.value ?? ""}
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            size="small"
                            error={
                              !!errors.scenarios?.[index]?.purchaseInfo?.downPayment
                            }
                            helperText={
                              errors.scenarios?.[index]?.purchaseInfo?.downPayment
                                ?.message
                            }
                            sx={{
                              maxWidth: {
                                xs: 76,   // mobile
                                sm: 85,  // tablet
                              },
                              borderRadius: 2,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                paddingRight: "8.5px",
                                "& fieldset": {
                                  borderColor: "#F6F6F6",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#F6F6F6",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#F6F6F6",
                                },
                                "& input::placeholder": {
                                  color: "#9e9e9e",
                                  opacity: 1,
                                },
                                "& input": {
                                  padding: "8.5px 0 8.5px 8.5px", // adjust as needed
                                },
                              },
                            }}
                            inputProps={{
                              step: 0.01
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment
                                  position="end"
                                  sx={{ marginLeft: 0 }}
                                >
                                  <span
                                    style={{ fontWeight: "bold", color: "black" }}
                                  >
                                    %
                                  </span>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />

                      {/* Amount Field */}
                      <Controller
                        name={`scenarios.${index}.loanProgram.downPaymentAmount`}
                        control={control}
                        render={({ field }) => (
                          <NumericFormat
                            customInput={TextField}
                            fullWidth
                            value={field.value ?? ""}
                            placeholder="0"
                            disabled
                            onValueChange={(values) => {
                              field.onChange(
                                values.floatValue === undefined
                                  ? undefined
                                  : values.floatValue,
                              );
                            }}
                            thousandSeparator=","
                            allowNegative={false}
                            error={
                              !!errors.scenarios?.[index]?.loanProgram
                                ?.downPaymentAmount
                            }
                            helperText={
                              errors.scenarios?.[index]?.loanProgram
                                ?.downPaymentAmount?.message
                            }
                            sx={{
                              maxWidth: 120,
                              borderRadius: 2,
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f7f7f7",
                                "& fieldset": {
                                  border: "none",
                                },
                                "& input::placeholder": {
                                  color: "#9e9e9e",
                                  opacity: 1,
                                },
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <span
                                    style={{ fontWeight: "bold", color: "black" }}
                                  >
                                    $
                                  </span>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Closing Costs
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.loanProgram.clearingCart`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) =>
                            field.onChange(
                              values.floatValue === undefined
                                ? ""
                                : values.floatValue,
                            )
                          }
                          inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.loanProgram?.clearingCart
                          }
                          helperText={
                            errors.scenarios?.[index]?.loanProgram?.clearingCart
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Property Tax
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.prepaidItems.propertyTaxAmount`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) =>
                            field.onChange(
                              values.floatValue === undefined
                                ? ""
                                : values.floatValue,
                            )
                          }
                          inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.prepaidItems?.propertyTaxAmount
                          }
                          helperText={
                            errors.scenarios?.[index]?.prepaidItems?.propertyTaxAmount
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Total Needed to Clear
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.loanProgram.totalNeededToClear`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) => {
                            field.onChange(
                              values.floatValue === undefined
                                ? undefined
                                : values.floatValue,
                            );
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.loanProgram
                              ?.totalNeededToClear
                          }
                          helperText={
                            errors.scenarios?.[index]?.loanProgram
                              ?.totalNeededToClear?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
              }}
            >
              {fields.map((field, borrowerIncomeIndex) => (
                <Box
                  key={field.id}
                >
                  <Typography fontWeight={600} color="primary">
                    Borrower {borrowerIncomeIndex + 1}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                          Monthly Income
                        </Typography>
                        <Controller
                          name={`scenarios.${index}.loanProgram.borrowers.${borrowerIncomeIndex}.monthlyIncome`}
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              customInput={TextField}
                              fullWidth
                              value={field.value ?? ""}
                              placeholder="0"
                              disabled
                              onValueChange={(values) => {
                                field.onChange(
                                  values.floatValue === undefined
                                    ? undefined
                                    : values.floatValue,
                                );
                              }}
                              thousandSeparator=","
                              allowNegative={false}
                              error={
                                !!errors.scenarios?.[index]?.loanProgram
                                  ?.borrowers?.[borrowerIncomeIndex]?.monthlyIncome
                              }
                              helperText={
                                errors.scenarios?.[index]?.loanProgram?.borrowers?.[
                                  borrowerIncomeIndex
                                ]?.monthlyIncome?.message
                              }
                              sx={{
                                maxWidth: 120,
                                borderRadius: 2,
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "#f7f7f7",
                                  "& fieldset": {
                                    border: "none",
                                  },
                                  "& input::placeholder": {
                                    color: "#9e9e9e",
                                    opacity: 1,
                                  },
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <span
                                      style={{ fontWeight: "bold", color: "black" }}
                                    >
                                      $
                                    </span>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                          Debts
                        </Typography>
                        <Controller
                          name={`scenarios.${index}.loanProgram.borrowers.${borrowerIncomeIndex}.debts`}
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              customInput={TextField}
                              fullWidth
                              value={field.value ?? ""}
                              placeholder="0"
                              disabled
                              onValueChange={(values) => {
                                field.onChange(
                                  values.floatValue === undefined
                                    ? undefined
                                    : values.floatValue,
                                );
                              }}
                              thousandSeparator=","
                              allowNegative={false}
                              error={
                                !!errors.scenarios?.[index]?.loanProgram
                                  ?.borrowers?.[borrowerIncomeIndex]?.debts
                              }
                              helperText={
                                errors.scenarios?.[index]?.loanProgram?.borrowers?.[
                                  borrowerIncomeIndex
                                ]?.debts?.message
                              }
                              sx={{
                                maxWidth: 120,
                                borderRadius: 2,
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "#f7f7f7",
                                  "& fieldset": {
                                    border: "none",
                                  },
                                  "& input::placeholder": {
                                    color: "#9e9e9e",
                                    opacity: 1,
                                  },
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <span
                                      style={{ fontWeight: "bold", color: "black" }}
                                    >
                                      $
                                    </span>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                          FICO Score
                        </Typography>
                        <Controller
                          name={`scenarios.${index}.loanProgram.borrowers.${borrowerIncomeIndex}.ficoScore`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value === "" ? "" : e.target.value);
                                handleFieldChange(index);
                              }}
                              value={field.value ?? ""}
                              disabled
                              fullWidth
                              type="text"
                              inputMode="numeric"
                              error={
                                !!errors.scenarios?.[index]?.loanProgram
                                  ?.borrowers?.[borrowerIncomeIndex]?.ficoScore
                              }
                              helperText={
                                errors.scenarios?.[index]?.loanProgram?.borrowers?.[
                                  borrowerIncomeIndex
                                ]?.ficoScore?.message
                              }
                              sx={{
                                maxWidth: 120,
                                borderRadius: 2,
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "#f7f7f7",
                                  "& fieldset": {
                                    border: "none",
                                  },
                                  "& input::placeholder": {
                                    color: "#9e9e9e",
                                    opacity: 1,
                                  },
                                },
                              }}
                            />
                          )}
                        />
                        {/* <Controller
                      name={`scenarios.${index}.loanProgram.borrowers.${borrowerIncomeIndex}.ficoScore`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) => {
                            field.onChange(
                              values.floatValue === undefined
                                ? undefined
                                : values.floatValue,
                            );
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.loanProgram
                              ?.borrowers?.[borrowerIncomeIndex]?.ficoScore
                          }
                          helperText={
                            errors.scenarios?.[index]?.loanProgram?.borrowers?.[
                              borrowerIncomeIndex
                            ]?.ficoScore?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                        />
                      )}
                    /> */}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Principal & Interest
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.loanProgram.principalAndInterest`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) => {
                            field.onChange(
                              values.floatValue === undefined
                                ? undefined
                                : values.floatValue,
                            );
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.loanProgram
                              ?.principalAndInterest
                          }
                          helperText={
                            errors.scenarios?.[index]?.loanProgram
                              ?.principalAndInterest?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Property Tax
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      {/* Percentage Field */}
                      <Controller
                        name={`scenarios.${index}.purchaseInfo.monthlyPropertyTaxPercentage`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            onChange={(e) => {
                              const value =
                                e.target.value === "" ? "" : Number(e.target.value);
                              field.onChange(value);
                              handleFieldChange(index);
                            }}
                            value={field.value ?? ""}
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            size="small"
                            error={
                              !!errors.scenarios?.[index]?.purchaseInfo
                                ?.monthlyPropertyTaxPercentage
                            }
                            helperText={
                              errors.scenarios?.[index]?.purchaseInfo
                                ?.monthlyPropertyTaxPercentage?.message
                            }
                            sx={{
                              maxWidth: {
                                xs: 76,   // mobile
                                sm: 85,  // tablet
                              },
                              borderRadius: 2,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                paddingRight: "8.5px",
                                "& fieldset": {
                                  borderColor: "#F6F6F6",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#F6F6F6",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#F6F6F6",
                                },
                                "& input::placeholder": {
                                  color: "#9e9e9e",
                                  opacity: 1,
                                },
                                "& input": {
                                  padding: "8.5px 0 8.5px 8.5px", // adjust as needed
                                },
                              },
                            }}
                            inputProps={{
                              step: 0.01
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment
                                  position="end"
                                  sx={{ marginLeft: 0 }}
                                >
                                  <span
                                    style={{ fontWeight: "bold", color: "black" }}
                                  >
                                    %
                                  </span>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                      <Controller
                        name={`scenarios.${index}.purchaseInfo.monthlyPropertyTax`}
                        control={control}
                        render={({ field }) => (
                          <NumericFormat
                            customInput={TextField}
                            fullWidth
                            value={field.value ?? ""}
                            placeholder="0"
                            disabled
                            onValueChange={(values) =>
                              field.onChange(
                                values.floatValue === undefined
                                  ? ""
                                  : values.floatValue,
                              )
                            }
                            inputProps={{
                              inputMode: "decimal",
                              pattern: "[0-9.,]*",
                            }}
                            thousandSeparator=","
                            allowNegative={false}
                            error={
                              !!errors.scenarios?.[index]?.purchaseInfo
                                ?.monthlyPropertyTax
                            }
                            helperText={
                              errors.scenarios?.[index]?.purchaseInfo
                                ?.monthlyPropertyTax?.message
                            }
                            sx={{
                              maxWidth: 120,
                              borderRadius: 2,
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#f7f7f7",
                                "& fieldset": {
                                  border: "none",
                                },
                                "& input::placeholder": {
                                  color: "#9e9e9e",
                                  opacity: 1,
                                },
                              },
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <span
                                    style={{ fontWeight: "bold", color: "black" }}
                                  >
                                    $
                                  </span>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Haz Insurance
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.purchaseInfo.hazardInsurance`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) =>
                            field.onChange(
                              values.floatValue === undefined
                                ? ""
                                : values.floatValue,
                            )
                          }
                          inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.purchaseInfo
                              ?.hazardInsurance
                          }
                          helperText={
                            errors.scenarios?.[index]?.purchaseInfo?.hazardInsurance
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Mortgage Insurance
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.purchaseInfo.miPercent`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) =>
                            field.onChange(
                              values.floatValue === undefined
                                ? ""
                                : values.floatValue,
                            )
                          }
                          inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.purchaseInfo?.miPercent
                          }
                          helperText={
                            errors.scenarios?.[index]?.purchaseInfo?.miPercent
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      HOA Dues
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.purchaseInfo.associationFee`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          onValueChange={(values) => {
                            const value =
                              values.floatValue === undefined
                                ? ""
                                : values.floatValue;
                            field.onChange(value);
                            handleFieldChange(index);
                          }}
                          inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.purchaseInfo
                              ?.associationFee
                          }
                          helperText={
                            errors.scenarios?.[index]?.purchaseInfo?.associationFee
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "&:hover fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#F6F6F6",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Monthly Total
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.loanProgram.monthlyTotal`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          disabled
                          onValueChange={(values) => {
                            field.onChange(
                              values.floatValue === undefined
                                ? undefined
                                : values.floatValue,
                            );
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.loanProgram?.monthlyTotal
                          }
                          helperText={
                            errors.scenarios?.[index]?.loanProgram?.monthlyTotal
                              ?.message
                          }
                          sx={{
                            maxWidth: 120,
                            borderRadius: 2,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f7f7f7",
                              "& fieldset": {
                                border: "none",
                              },
                              "& input::placeholder": {
                                color: "#9e9e9e",
                                opacity: 1,
                              },
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontWeight: "bold", color: "black" }}
                                >
                                  $
                                </span>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
