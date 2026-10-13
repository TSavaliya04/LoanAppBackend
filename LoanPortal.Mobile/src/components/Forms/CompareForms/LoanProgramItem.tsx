"use client";

import {
  Box,
  // Button,
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
  useWatch,
  useFormContext,
} from "react-hook-form";
import { ComparePreApprovalFormData } from "@/api/models/ComparePreApprovalSchema";
import { NumericFormat } from "react-number-format";
import { useEffect, useRef } from "react";
import { usePreApprovalStore } from "@/store/compareStore/usePreApprovalStore";

type Props = {
  index: number;
  control: Control<ComparePreApprovalFormData>;
  errors: FieldErrors<ComparePreApprovalFormData>;
};

export default function LoanProgramItem({ index, control, errors }: Props) {
  const {
    setValue,
    formState: { dirtyFields },
  } = useFormContext<ComparePreApprovalFormData>();

  const renderCount = useRef(0);

  const { fields } = useFieldArray({
    control,
    name: `loanProgram.Inputs.${index}.borrowers`,
  });

  const frontEndRatio = usePreApprovalStore(
    (state) => state.ratios[index]?.frontEndRatio ?? 0
  );
  const monthlyIncome = usePreApprovalStore(
    (state) => state.ratios[index]?.monthlyIncome ?? 0
  );
  const setFrontEndRatio = usePreApprovalStore(
    (state) => state.setFrontEndRatio
  );
  const frontEndRatiocolor = frontEndRatio <= 45 ? "#00CF1F" : "#F44336";

  const backEndRatio = usePreApprovalStore(
    (state) => state.ratios[index]?.backEndRatio ?? 0
  );
  const setBackEndRatio = usePreApprovalStore((state) => state.setBackEndRatio);
  const backEndRatiocolor = backEndRatio <= 45 ? "#00CF1F" : "#F44336";

  const borrowerIncome = useWatch({
    control,
    name: `borrowersIncomeData.Inputs.${index}.borrowerIncome`,
  });
  const associationFee =
    useWatch({
      control,
      name: `purchaseInfo.Inputs.${index}.associationFee`,
    }) ?? 0;
  const loanProgram =
    useWatch({ control, name: `purchaseInfo.Inputs.${index}.loanProgram` }) ??
    "1";
  const price =
    useWatch({ control, name: `purchaseInfo.Inputs.${index}.purchasePrice` }) ??
    0;
  const downPaymentPercentage =
    useWatch({ control, name: `purchaseInfo.Inputs.${index}.downPayment` }) ??
    0;
  const upmipRate =
    useWatch({
      control,
      name: `lenderFees.Inputs.${index}.upfrontMipPercentage`,
    }) ?? 0;
  const mmi =
    useWatch({ control, name: `loanProgram.Inputs.${index}.mmi` }) ?? 0;
  const annualMIPRate =
    useWatch({ control, name: `purchaseInfo.Inputs.${index}.mipFundingFee` }) ??
    0;
  const clearingCart =
    useWatch({ control, name: `loanProgram.Inputs.${index}.clearingCart` }) ??
    0;
  const propertyTax =
    useWatch({ control, name: `loanProgram.Inputs.${index}.propertyTax` }) ?? 0;
  const interestRate =
    useWatch({
      control,
      name: `purchaseInfo.Inputs.${index}.annualInterestRate`,
    }) ?? 0;
  const term =
    useWatch({ control, name: `loanProgram.Inputs.${index}.term` }) ?? 0;
  const monthlyPropertyTax =
    useWatch({
      control,
      name: `loanProgram.Inputs.${index}.monthlyPropertyTax`,
    }) ?? 0;
  const hazardInsurance =
    useWatch({
      control,
      name: `loanProgram.Inputs.${index}.hazardInsurance`,
    }) ?? 0;
  const principalAndInterest =
    useWatch({
      control,
      name: `loanProgram.Inputs.${index}.principalAndInterest`,
    }) ?? 0;
  const earnestMoneyDeposit =
    useWatch({
      control,
      name: `miscFees.Inputs.${index}.earnestMoneyDeposit`,
    }) ?? 0;
  const sellerCredit =
    useWatch({ control, name: `miscFees.Inputs.${index}.sellerCredit` }) ?? 0;
  const lenderCredit =
    useWatch({ control, name: `miscFees.Inputs.${index}.lenderCredit` }) ?? 0;
  // const mortgageInsurance =
  //   useWatch({ control, name: "loanProgram.mortgageInsurance" }) ?? 0;

  useEffect(() => {
    const downPaymentAmount = price * (downPaymentPercentage / 100);
    const baseLoanAmount = price - downPaymentAmount;
    let calculatedAnnualMIPRate = 0;

    const ltv = (baseLoanAmount / price) * 100; // in percentage

    if (loanProgram === "3") {
      if (baseLoanAmount <= 726200) {
        if (ltv <= 90) {
          calculatedAnnualMIPRate = 0.5; // 50 bps
        } else if (ltv > 90 && ltv <= 95) {
          calculatedAnnualMIPRate = 0.55; // 55 bps
        } else if (ltv > 95) {
          calculatedAnnualMIPRate = 0.55; // 55 bps
        }
      } else {
        if (ltv <= 90) {
          calculatedAnnualMIPRate = 0.7; // 70 bps
        } else if (ltv > 90 && ltv <= 95) {
          calculatedAnnualMIPRate = 0.7; // 70 bps
        } else if (ltv > 95) {
          calculatedAnnualMIPRate = 0.75; // 75 bps
        }
      }
    } else {
      calculatedAnnualMIPRate = annualMIPRate;
    }

    // If you want to override form state field as well
    if (calculatedAnnualMIPRate !== annualMIPRate) {
      setValue(
        `purchaseInfo.Inputs.${index}.mipFundingFee`,
        calculatedAnnualMIPRate
      );
    }
    const upmipAmount = baseLoanAmount * (upmipRate / 100);
    const finalLoanAmount = baseLoanAmount + upmipAmount;

    const totalNeededToClear =
      downPaymentAmount +
      clearingCart -
      earnestMoneyDeposit -
      sellerCredit -
      lenderCredit;

    const mortgageInsurance = (baseLoanAmount * (annualMIPRate / 100)) / 12;

    const calmmi = (baseLoanAmount * (annualMIPRate / 100)) / 12;

    const P = finalLoanAmount;
    const r = interestRate / 100 / 12;
    const n = term * 12;

    const monthlyPI =
      r === 0
        ? P / n
        : (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

    let associationFeeAmount = 0;
    if (associationFee) {
      associationFeeAmount = associationFee;
    }

    const monthlyTotal =
      monthlyPI +
      monthlyPropertyTax +
      hazardInsurance +
      mortgageInsurance +
      associationFeeAmount;

    const calcPrincipalAndInterest = isNaN(monthlyPI)
      ? 0
      : +monthlyPI.toFixed(2);
    const calMortgageInsurance = isNaN(mortgageInsurance)
      ? 0
      : +mortgageInsurance.toFixed(2);

    const monthlyHousingExpenses =
      calcPrincipalAndInterest +
      monthlyPropertyTax +
      calMortgageInsurance +
      associationFee;

    const calculatedFrontEndRatio =
      monthlyIncome > 0
        ? parseFloat(
          ((monthlyHousingExpenses / monthlyIncome) * 100).toFixed(2)
        )
        : 0;

    // Update the store
    setFrontEndRatio(
      index,
      !isFinite(calculatedFrontEndRatio) ? 0 : calculatedFrontEndRatio
    );

    let calculatedBackEndRatio = 0;
    let totalIncome = 0;
    let totalPayment = 0;

    borrowerIncome?.forEach((borrower) => {
      totalIncome += Number(borrower.monthlyIncome) || 0;
      borrower?.debts?.forEach((debt) => {
        totalPayment += Number(debt.monthlyPayment) || 0;
      });
    });

    calculatedBackEndRatio = Number(
      (((monthlyHousingExpenses + totalPayment) / totalIncome) * 100).toFixed(2)
    );

    setBackEndRatio(
      index,
      !isFinite(calculatedBackEndRatio) ? 0 : calculatedBackEndRatio
    );
    // usePreApprovalStore.setState({
    //   backEndRatio: !isFinite(calculatedBackEndRatio)
    //     ? 0
    //     : calculatedBackEndRatio,
    // });

    setValue(
      `loanProgram.Inputs.${index}.frontEndRatio`,
      calculatedFrontEndRatio
    );
    setValue(
      `loanProgram.Inputs.${index}.backEndRatio`,
      calculatedBackEndRatio
    );
    setValue(
      `loanProgram.Inputs.${index}.downPaymentAmount`,
      isNaN(downPaymentAmount) ? 0 : +downPaymentAmount.toFixed(2)
    );
    setValue(
      `loanProgram.Inputs.${index}.baseLoanAmount`,
      isNaN(baseLoanAmount) ? 0 : +baseLoanAmount.toFixed(2)
    );
    setValue(
      `loanProgram.Inputs.${index}.upmipAmount`,
      isNaN(upmipAmount) ? 0 : +upmipAmount.toFixed(2)
    );
    setValue(
      `loanProgram.Inputs.${index}.finalLoanAmount`,
      isNaN(finalLoanAmount) ? 0 : +finalLoanAmount.toFixed(2)
    );
    setValue(
      `loanProgram.Inputs.${index}.mmi`,
      isNaN(calmmi) ? 0 : +calmmi.toFixed(2)
    );
    setValue(
      `loanProgram.Inputs.${index}.totalNeededToClear`,
      isNaN(totalNeededToClear) ? 0 : +totalNeededToClear
    );
    setValue(
      `loanProgram.Inputs.${index}.principalAndInterest`,
      isNaN(monthlyPI) ? 0 : +monthlyPI.toFixed(0)
    );
    setValue(
      `loanProgram.Inputs.${index}.mortgageInsurance`,
      isNaN(mortgageInsurance) ? 0 : +mortgageInsurance.toFixed(0)
    );
    setValue(
      `loanProgram.Inputs.${index}.monthlyTotal`,
      isNaN(monthlyTotal) ? 0 : +monthlyTotal.toFixed(0)
    );
  }, [
    borrowerIncome,
    backEndRatio,
    loanProgram,
    price,
    downPaymentPercentage,
    upmipRate,
    clearingCart,
    propertyTax,
    interestRate,
    term,
    mmi,
    annualMIPRate,
    monthlyPropertyTax,
    principalAndInterest,
    associationFee,
    monthlyIncome,
    hazardInsurance,
    earnestMoneyDeposit,
    sellerCredit,
    lenderCredit,
    setValue,
  ]);

  useEffect(() => {
    renderCount.current += 1;

    if (renderCount.current <= 1) {
      return;
    }
    if (dirtyFields?.lenderFees?.Inputs?.[index].upfrontMipPercentage) {
      return;
    }
    if (loanProgram !== "3") {
      setValue(`lenderFees.Inputs.${index}.upfrontMipPercentage`, 0);
    } else {
      setValue(`lenderFees.Inputs.${index}.upfrontMipPercentage`, 1.75);
    }
  }, [loanProgram]);
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid sx={{ display: "none" }}>
          <Controller
            name={`loanProgram.Inputs.${index}.preApprovalId`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="preApprovalId *"
                error={!!errors.loanProgram?.Inputs?.[index]?.preApprovalId}
                helperText={
                  errors.loanProgram?.Inputs?.[index]?.preApprovalId?.message
                }
              />
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
          <Controller
            name={`purchaseInfo.Inputs.${index}.loanProgram`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                select
                label="Loan Program *"
                error={!!errors.purchaseInfo?.Inputs?.[index]?.loanProgram}
                helperText={
                  errors.purchaseInfo?.Inputs?.[index]?.loanProgram?.message
                }
              >
                <MenuItem value="1">Non QM</MenuItem>
                <MenuItem value="2">Conventional</MenuItem>
                <MenuItem value="3">FHA</MenuItem>
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
              Price
            </Typography>
            <Controller
              name={`purchaseInfo.Inputs.${index}.purchasePrice`}
              control={control}
              render={({ field }) => (
                <NumericFormat
                  customInput={TextField}
                  fullWidth
                  value={field.value ?? ""}
                  placeholder="0"
                  onValueChange={(values) =>
                    field.onChange(
                      values.floatValue === undefined ? "" : values.floatValue
                    )
                  }
                  inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={!!errors.purchaseInfo?.Inputs?.[index]?.purchasePrice}
                  helperText={
                    errors.purchaseInfo?.Inputs?.[index]?.purchasePrice?.message
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              paddingLeft: 0.5,
              py: 1.5,
            }}
          >
            <Typography fontWeight={600} sx={{ fontSize: 14 }}>
              Annual Interest Rate
            </Typography>
            <Controller
              name={`purchaseInfo.Inputs.${index}.annualInterestRate`}
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
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  size="medium"
                  error={
                    !!errors.purchaseInfo?.Inputs?.[index]?.annualInterestRate
                  }
                  helperText={
                    errors.purchaseInfo?.Inputs?.[index]?.annualInterestRate
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
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

        <Grid
          size={{ xs: 12 }}
          sx={{
            borderRadius: 3,
            backgroundColor: "#fff",
            p: 2,
          }}
        >
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
              Base Loan Amount
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.baseLoanAmount`}
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
                        : values.floatValue
                    );
                  }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={!!errors.loanProgram?.Inputs?.[index]?.baseLoanAmount}
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.baseLoanAmount?.message
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
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
              UPMIP
            </Typography>

            <Box display="flex" gap={1} alignItems="center">
              {/* Percentage Field */}
              <Controller
                name={`lenderFees.Inputs.${index}.upfrontMipPercentage`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    disabled={loanProgram === "3"}
                    value={field.value ?? ""}
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    size="small"
                    error={
                      !!errors.lenderFees?.Inputs?.[index]?.upfrontMipPercentage
                    }
                    helperText={
                      errors.lenderFees?.Inputs?.[index]?.upfrontMipPercentage
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" sx={{ marginLeft: 0 }}>
                          <span style={{ fontWeight: "bold", color: "black" }}>
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
                name={`loanProgram.Inputs.${index}.upmipAmount`}
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
                          : values.floatValue
                      );
                    }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={!!errors.loanProgram?.Inputs?.[index]?.upmipAmount}
                    helperText={
                      errors.loanProgram?.Inputs?.[index]?.upmipAmount?.message
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
                          <span style={{ fontWeight: "bold", color: "black" }}>
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
              MIP Rate
            </Typography>
            <Controller
              name={`purchaseInfo.Inputs.${index}.mipFundingFee`}
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
                  disabled={loanProgram === "3"}
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  size="medium"
                  error={!!errors.purchaseInfo?.Inputs?.[index]?.mipFundingFee}
                  helperText={
                    errors.purchaseInfo?.Inputs?.[index]?.mipFundingFee?.message
                  }
                  sx={{
                    maxWidth: 120,
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: loanProgram === "3" ? "#f7f7f7" : "#fff", // ✅ match your other disabled fields
                      "& fieldset": {
                        border:
                          loanProgram === "3" ? "none" : "1px solid #F6F6F6", // ✅ border removed if disabled
                      },
                      "&:hover fieldset": {
                        borderColor: loanProgram === "3" ? "none" : "#F6F6F6",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: loanProgram === "3" ? "none" : "#F6F6F6",
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          %
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
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
              Final Loan Amount
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.finalLoanAmount`}
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
                        : values.floatValue
                    );
                  }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={!!errors.loanProgram?.Inputs?.[index]?.finalLoanAmount}
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.finalLoanAmount
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
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
              MMI
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.mmi`}
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
                        : values.floatValue
                    );
                  }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={!!errors.loanProgram?.Inputs?.[index]?.mmi}
                  helperText={errors.loanProgram?.Inputs?.[index]?.mmi?.message}
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              paddingLeft: 0.5,
              py: 1.5,
            }}
          >
            <Typography fontWeight={600} sx={{ fontSize: 14 }}>
              Term
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.term`}
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
                  type="number"
                  inputMode="numeric"
                  size="medium"
                  error={!!errors.loanProgram?.Inputs?.[index]?.term}
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.term?.message
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

        <Grid
          size={{ xs: 12 }}
          sx={{
            borderRadius: 3,
            backgroundColor: "#fff",
            p: 2,
          }}
        >
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
              Principal & Interest
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.principalAndInterest`}
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
                        : values.floatValue
                    );
                  }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={
                    !!errors.loanProgram?.Inputs?.[index]?.principalAndInterest
                  }
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.principalAndInterest
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
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
              Property Tax
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Controller
                name={`loanProgram.Inputs.${index}.monthlyPropertyTaxPercentage`}
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
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    size="small"
                    error={
                      !!errors.loanProgram?.Inputs?.[index]?.monthlyPropertyTaxPercentage}
                    helperText={
                      errors.loanProgram?.Inputs?.[index]?.monthlyPropertyTaxPercentage
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" sx={{ marginLeft: 0 }}>
                          <span style={{ fontWeight: "bold", color: "black" }}>
                            %
                          </span>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Controller
                name={`loanProgram.Inputs.${index}.monthlyPropertyTax`}
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
                        values.floatValue === undefined ? "" : values.floatValue
                      )
                    }
                    inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={
                      !!errors.loanProgram?.Inputs?.[index]?.monthlyPropertyTax
                    }
                    helperText={
                      errors.loanProgram?.Inputs?.[index]?.monthlyPropertyTax
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
                          <span style={{ fontWeight: "bold", color: "black" }}>
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
              Haz Insurance
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.hazardInsurance`}
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
                      values.floatValue === undefined ? "" : values.floatValue
                    )
                  }
                  inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={!!errors.loanProgram?.Inputs?.[index]?.hazardInsurance}
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.hazardInsurance
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
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
              Mortgage Insurance
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.mortgageInsurance`}
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
                        : values.floatValue
                    );
                  }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={
                    !!errors.loanProgram?.Inputs?.[index]?.mortgageInsurance
                  }
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.mortgageInsurance
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
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
              HOA Dues
            </Typography>
            <Controller
              name={`purchaseInfo.Inputs.${index}.associationFee`}
              control={control}
              render={({ field }) => (
                <NumericFormat
                  customInput={TextField}
                  fullWidth
                  value={field.value ?? ""}
                  placeholder="0"
                  onValueChange={(values) =>
                    field.onChange(
                      values.floatValue === undefined ? "" : values.floatValue
                    )
                  }
                  inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={!!errors.purchaseInfo?.Inputs?.[index]?.associationFee}
                  helperText={
                    errors.purchaseInfo?.Inputs?.[index]?.associationFee
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
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
              Monthly Total
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.monthlyTotal`}
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
                        : values.floatValue
                    );
                  }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={!!errors.loanProgram?.Inputs?.[index]?.monthlyTotal}
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.monthlyTotal?.message
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
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

        <Grid
          size={{ xs: 12 }}
          sx={{
            borderRadius: 3,
            backgroundColor: "#fff",
            p: 2,
          }}
        >
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
              Down Payment
            </Typography>

            <Box display="flex" gap={1} alignItems="center">
              {/* Percentage Field */}
              <Controller
                name={`purchaseInfo.Inputs.${index}.downPayment`}
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
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    size="small"
                    error={!!errors.purchaseInfo?.Inputs?.[index]?.downPayment}
                    helperText={
                      errors.purchaseInfo?.Inputs?.[index]?.downPayment?.message
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" sx={{ marginLeft: 0 }}>
                          <span style={{ fontWeight: "bold", color: "black" }}>
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
                name={`loanProgram.Inputs.${index}.downPaymentAmount`}
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
                          : values.floatValue
                      );
                    }}
                    thousandSeparator=","
                    allowNegative={false}
                    error={
                      !!errors.loanProgram?.Inputs?.[index]?.downPaymentAmount
                    }
                    helperText={
                      errors.loanProgram?.Inputs?.[index]?.downPaymentAmount
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
                          <span style={{ fontWeight: "bold", color: "black" }}>
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
              Closing Costs
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.clearingCart`}
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
                      values.floatValue === undefined ? "" : values.floatValue
                    )
                  }
                  inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={!!errors.loanProgram?.Inputs?.[index]?.clearingCart}
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.clearingCart?.message
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
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
              Property Tax
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.propertyTax`}
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
                      values.floatValue === undefined ? "" : values.floatValue
                    )
                  }
                  inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={!!errors.loanProgram?.Inputs?.[index]?.propertyTax}
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.propertyTax?.message
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
                          $
                        </span>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              paddingLeft: 0.5,
              py: 1.5,
            }}
          >
            <Typography fontWeight={600} sx={{ fontSize: 14 }}>
              Total Needed to Clear
            </Typography>
            <Controller
              name={`loanProgram.Inputs.${index}.totalNeededToClear`}
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
                        : values.floatValue
                    );
                  }}
                  thousandSeparator=","
                  allowNegative={false}
                  error={
                    !!errors.loanProgram?.Inputs?.[index]?.totalNeededToClear
                  }
                  helperText={
                    errors.loanProgram?.Inputs?.[index]?.totalNeededToClear
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
                        <span style={{ fontWeight: "bold", color: "black" }}>
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
                  <Typography variant="subtitle2" sx={{ marginLeft: "8px" }}>
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
                  <Controller
                    name={`loanProgram.Inputs.${index}.frontEndRatio`}
                    control={control}
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                </Box>
              </Box>

              <Box width={"43%"}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="subtitle2" sx={{ marginLeft: "8px" }}>
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
                  <Controller
                    name={`loanProgram.Inputs.${index}.backEndRatio`}
                    control={control}
                    render={({ field }) => <input type="hidden" {...field} />}
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
            display: "none",
          }}
        >
          {fields.map((field, borrowerindex) => (
            <Box
              key={field.id}
              sx={{ borderBottom: "2px solid #f0f0f0", mb: 2, pb: 2 }}
            >
              <Typography fontWeight={600} color="primary">
                Borrower {borrowerindex + 1}
              </Typography>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Monthly Income
                </Typography>
                <Controller
                  name={`loanProgram.Inputs.${index}.borrowers.${borrowerindex}.monthlyIncome`}
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
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={
                        !!errors.loanProgram?.Inputs?.[index]?.borrowers?.[
                          borrowerindex
                        ]?.monthlyIncome
                      }
                      helperText={
                        errors.loanProgram?.Inputs?.[index]?.borrowers?.[
                          borrowerindex
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

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Debts
                </Typography>
                <Controller
                  name={`loanProgram.Inputs.${index}.borrowers.${borrowerindex}.debts`}
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
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={
                        !!errors.loanProgram?.Inputs?.[index]?.borrowers?.[
                          borrowerindex
                        ]?.debts
                      }
                      helperText={
                        errors.loanProgram?.Inputs?.[index]?.borrowers?.[
                          borrowerindex
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

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  FICO Score
                </Typography>
                <Controller
                  name={`loanProgram.Inputs.${index}.borrowers.${borrowerindex}.ficoScore`}
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
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={
                        !!errors.loanProgram?.Inputs?.[index]?.borrowers?.[
                          borrowerindex
                        ]?.ficoScore
                      }
                      helperText={
                        errors.loanProgram?.Inputs?.[index]?.borrowers?.[
                          borrowerindex
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
              </Box>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}
