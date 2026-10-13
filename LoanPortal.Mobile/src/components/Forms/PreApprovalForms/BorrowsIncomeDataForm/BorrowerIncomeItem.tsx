"use client";

import {
  Box,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  Controller,
  useFieldArray,
  Control,
  FieldErrors,
} from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import AddIcon from "@mui/icons-material/Add";
import { Delete, Calculate as CalculateIcon } from "@mui/icons-material";
import { NumericFormat } from "react-number-format";
import { useState } from "react";
import IncomeCalculatorModal from "@/components/IncomeCalculator/IncomeCalculatorModal";

type Props = {
  index: number;
  borrowerIncomeIndex: number;
  control: Control<CombinedPreApprovalFormData>;
  errors: FieldErrors<CombinedPreApprovalFormData>;
  handleFieldChange: (index: number) => void;
};

export default function BorrowerIncomeItem({
  index,
  borrowerIncomeIndex,
  control,
  errors,
  handleFieldChange,
}: Props) {
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  const {
    fields: debtFields,
    append: appendDebt,
    remove: removeDebt,
  } = useFieldArray({
    control,
    name: `scenarios.${index}.borrowersIncomeData.borrowerIncome.${borrowerIncomeIndex}.debts`,
  });

  return (
    <Box
      sx={{
        borderRadius: 3,
        backgroundColor: "#fff",
        p: 2,
        mb: 3,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "#5D24C0", mb: 2 }}
      >
        Borrower {index + 1} Income Data
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={`scenarios.${index}.borrowersIncomeData.borrowerIncome.${borrowerIncomeIndex}.borrowerName`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Borrower Name *"
                error={
                  !!errors.scenarios?.[index]?.borrowersIncomeData
                    ?.borrowerIncome?.[borrowerIncomeIndex]?.borrowerName
                }
                helperText={
                  errors.scenarios?.[index]?.borrowersIncomeData
                    ?.borrowerIncome?.[borrowerIncomeIndex]?.borrowerName
                    ?.message
                }
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={`scenarios.${index}.borrowersIncomeData.borrowerIncome.${borrowerIncomeIndex}.ficoScore`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) => {
                  field.onChange(e.target.value === "" ? "" : e.target.value);
                  handleFieldChange(index);
                }}
                value={field.value ?? ""}
                fullWidth
                label="FICO Score"
                type="text"
                inputMode="numeric"
                error={
                  !!errors.scenarios?.[index]?.borrowersIncomeData
                    ?.borrowerIncome?.[borrowerIncomeIndex]?.ficoScore
                }
                helperText={
                  errors.scenarios?.[index]?.borrowersIncomeData
                    ?.borrowerIncome?.[borrowerIncomeIndex]?.ficoScore?.message
                }
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={`scenarios.${index}.borrowersIncomeData.borrowerIncome.${borrowerIncomeIndex}.monthlyIncome`}
            control={control}
            render={({ field }) => (
              <NumericFormat
                customInput={TextField}
                fullWidth
                label="Monthly Income"
                value={field.value ?? ""}
                onValueChange={(values) => {
                  const value =
                    values.floatValue === undefined ? "" : values.floatValue;
                  field.onChange(value);
                  handleFieldChange(index);
                }}
                inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                thousandSeparator=","
                allowNegative={false}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                error={
                  !!errors.scenarios?.[index]?.borrowersIncomeData
                    ?.borrowerIncome?.[borrowerIncomeIndex]?.monthlyIncome
                }
                helperText={
                  errors.scenarios?.[index]?.borrowersIncomeData
                    ?.borrowerIncome?.[borrowerIncomeIndex]?.monthlyIncome
                    ?.message
                }
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} display="flex" alignItems="center">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CalculateIcon />}
            onClick={() => setCalculatorOpen(true)}
            sx={{
              height: "56px",
              borderRadius: "8px",
              width: { xs: "100%", md: "auto" }
            }}
          >
            Income Calculator
          </Button>
        </Grid>

        {/* Debt Fields */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Debts
          </Typography>

          {debtFields.map((debt, debtIndex) => (
            <Box
              key={debt.id}
              sx={{ mb: 2, pl: 2, borderLeft: "4px solid #EEE" }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: "#5D24C0" }}
                >
                  Debt {debtIndex + 1}
                </Typography>
                <Button color="error" onClick={() => removeDebt(debtIndex)}>
                  <Delete />
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid
                  size={{ xs: 12, md: 6 }}
                >
                  <Controller
                    name={`scenarios.${index}.borrowersIncomeData.borrowerIncome.${borrowerIncomeIndex}.debts.${debtIndex}.debtType`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Debt Type *"
                        error={
                          !!errors.scenarios?.[index]?.borrowersIncomeData
                            ?.borrowerIncome?.[borrowerIncomeIndex]?.debts?.[
                            debtIndex
                          ]?.debtType
                        }
                        helperText={
                          errors.scenarios?.[index]?.borrowersIncomeData
                            ?.borrowerIncome?.[borrowerIncomeIndex]?.debts?.[
                            debtIndex
                          ]?.debtType?.message
                        }
                      >
                        <MenuItem value="1">Mortgage Payment</MenuItem>
                        <MenuItem value="2">Car Payment</MenuItem>
                        <MenuItem value="3">Credit Card</MenuItem>
                        <MenuItem value="4">Installment</MenuItem>
                        <MenuItem value="5">Other</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Balance
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.borrowersIncomeData.borrowerIncome.${borrowerIncomeIndex}.debts.${debtIndex}.balance`}
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
                          inputProps={{
                            inputMode: "decimal",
                            pattern: "[0-9.,]*",
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.borrowersIncomeData
                              ?.borrowerIncome?.[borrowerIncomeIndex]?.debts?.[
                              debtIndex
                            ]?.balance
                          }
                          helperText={
                            errors.scenarios?.[index]?.borrowersIncomeData
                              ?.borrowerIncome?.[borrowerIncomeIndex]?.debts?.[
                              debtIndex
                            ]?.balance?.message
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
                      Monthly Payment
                    </Typography>
                    <Controller
                      name={`scenarios.${index}.borrowersIncomeData.borrowerIncome.${borrowerIncomeIndex}.debts.${debtIndex}.monthlyPayment`}
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
                          inputProps={{
                            inputMode: "decimal",
                            pattern: "[0-9.,]*",
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.scenarios?.[index]?.borrowersIncomeData
                              ?.borrowerIncome?.[borrowerIncomeIndex]?.debts?.[
                              debtIndex
                            ]?.monthlyPayment
                          }
                          helperText={
                            errors.scenarios?.[index]?.borrowersIncomeData
                              ?.borrowerIncome?.[borrowerIncomeIndex]?.debts?.[
                              debtIndex
                            ]?.monthlyPayment?.message
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
            </Box>
          ))}

          <Box textAlign="center" mt={2}>
            <Button
              variant="outlined"
              onClick={() =>
                appendDebt({
                  debtType: "3",
                  balance: 0,
                  monthlyPayment: 0,
                })
              }
              startIcon={<AddIcon />}
              sx={{
                color: "#7444F5",
                borderColor: "#7444F54D",
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
                ":hover": {
                  backgroundColor: "#f3e6fd",
                  borderColor: "#C1A9F5",
                },
              }}
            >
              ADD DEBT
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Controller
        name={`scenarios.${index}.borrowersIncomeData.borrowerIncome.${borrowerIncomeIndex}.monthlyIncome`}
        control={control}
        render={({ field }) => {
          const currentBorrowerName = control._formValues?.scenarios?.[index]?.borrowersIncomeData?.borrowerIncome?.[borrowerIncomeIndex]?.borrowerName || control._defaultValues?.scenarios?.[index]?.borrowersIncomeData?.borrowerIncome?.[borrowerIncomeIndex]?.borrowerName || `Borrower ${index + 1}`;
          const currentScenarioId = control._formValues?.scenarios?.[index]?.id || control._defaultValues?.scenarios?.[index]?.id || "";
          const currentPreApprovalId = control._formValues?.preapprovalDetail?.preApprovalId || control._defaultValues?.preapprovalDetail?.preApprovalId || "";

          return (
            <IncomeCalculatorModal
              open={calculatorOpen}
              onClose={() => setCalculatorOpen(false)}
              borrowerName={currentBorrowerName}
              scenarioId={currentScenarioId}
              preApprovalId={currentPreApprovalId}
              onIncomeCalculated={(amount: number) => {
                const roundedAmount = Math.ceil(amount * 100) / 100;
                field.onChange(roundedAmount);
                handleFieldChange(index);
              }}
            />
          );
        }}
      />
    </Box>
  );
}
