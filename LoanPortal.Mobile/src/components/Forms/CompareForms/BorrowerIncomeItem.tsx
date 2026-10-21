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
import AddIcon from "@mui/icons-material/Add";
import { Delete } from "@mui/icons-material";
import { NumericFormat } from "react-number-format";
import { ComparePreApprovalFormData } from "@/api/models/ComparePreApprovalSchema";

type Props = {
  index: number;
  BorrowerIncomeindex: number;
  control: Control<ComparePreApprovalFormData>;
  errors: FieldErrors<ComparePreApprovalFormData>;
};

export default function BorrowerIncomeItem({
  index,
  BorrowerIncomeindex,
  control,
  errors,
}: Props) {
  const {
    fields: debtFields,
    append: appendDebt,
    remove: removeDebt,
  } = useFieldArray({
    control,
    name: `borrowersIncomeData.Inputs.${index}.borrowerIncome.${BorrowerIncomeindex}.debts`,
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
        Borrower {BorrowerIncomeindex + 1} Income Data
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name={`borrowersIncomeData.Inputs.${index}.borrowerIncome.${BorrowerIncomeindex}.borrowerName`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Borrower Name *"
                error={
                  !!errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]?.borrowerName
                }
                helperText={
                  errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]?.borrowerName?.message
                }
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name={`borrowersIncomeData.Inputs.${index}.borrowerIncome.${BorrowerIncomeindex}.ficoScore`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                value={field.value ?? ""}
                fullWidth
                label="FICO Score"
                type="number"
                inputMode="numeric"
                error={
                  !!errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]?.ficoScore
                }
                helperText={
                  errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]?.ficoScore
                    ?.message
                }
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name={`borrowersIncomeData.Inputs.${index}.borrowerIncome.${BorrowerIncomeindex}.monthlyIncome`}
            control={control}
            render={({ field }) => (
              <NumericFormat
                customInput={TextField}
                fullWidth
                label="Monthly Income"
                value={field.value ?? ""}
                onValueChange={(values) =>
                  field.onChange(
                    values.floatValue === undefined ? "" : values.floatValue
                  )
                }
                inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                thousandSeparator=","
                allowNegative={false}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                error={
                  !!errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]?.monthlyIncome
                }
                helperText={
                  errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]?.monthlyIncome?.message
                }
              />
            )}
          />
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

              <Grid container>
                <Grid
                  size={{ xs: 12 }}
                  sx={{
                    borderBottom: "1px solid #f0f0f0",
                    py: 1.5,
                  }}
                >
                  <Controller
                    name={`borrowersIncomeData.Inputs.${index}.borrowerIncome.${BorrowerIncomeindex}.debts.${debtIndex}.debtType`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Debt Type *"
                        error={
                          !!errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]
                            ?.debts?.[debtIndex]?.debtType
                        }
                        helperText={
                          errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]
                            ?.debts?.[debtIndex]?.debtType?.message
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

                <Grid size={{ xs: 12 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      borderBottom: "1px solid #f0f0f0",
                      paddingLeft: 0.5,
                      py: 1.5,
                    }}
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Balance
                    </Typography>
                    <Controller
                      name={`borrowersIncomeData.Inputs.${index}.borrowerIncome.${BorrowerIncomeindex}.debts.${debtIndex}.balance`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          onValueChange={(values) =>
                            field.onChange(
                              values.floatValue === undefined
                                ? ""
                                : values.floatValue
                            )
                          }
                          inputProps={{
                            inputMode: "decimal",
                            pattern: "[0-9.,]*",
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]
                            ?.debts?.[debtIndex]?.balance
                          }
                          helperText={
                            errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]
                            ?.debts?.[debtIndex]?.balance?.message
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

                <Grid size={{ xs: 12 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      borderBottom: "1px solid #f0f0f0",
                      paddingLeft: 0.5,
                      py: 1.5,
                    }}
                  >
                    <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                      Monthly Payment
                    </Typography>
                    <Controller
                      name={`borrowersIncomeData.Inputs.${index}.borrowerIncome.${BorrowerIncomeindex}.debts.${debtIndex}.monthlyPayment`}
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          customInput={TextField}
                          fullWidth
                          value={field.value ?? ""}
                          placeholder="0"
                          onValueChange={(values) =>
                            field.onChange(
                              values.floatValue === undefined
                                ? ""
                                : values.floatValue
                            )
                          }
                          inputProps={{
                            inputMode: "decimal",
                            pattern: "[0-9.,]*",
                          }}
                          thousandSeparator=","
                          allowNegative={false}
                          error={
                            !!errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]
                            ?.debts?.[debtIndex]?.monthlyPayment
                          }
                          helperText={
                            errors.borrowersIncomeData?.Inputs?.[index]?.borrowerIncome?.[BorrowerIncomeindex]
                            ?.debts?.[debtIndex]?.monthlyPayment?.message
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
    </Box>
  );
}
