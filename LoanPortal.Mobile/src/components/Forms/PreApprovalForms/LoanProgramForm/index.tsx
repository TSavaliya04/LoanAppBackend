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
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import SVGs from "@/components/SVGs";
import { useEffect } from "react";
import { usePreApprovalStore } from "@/store/usePreApprovalStore";
import { NumericFormat } from "react-number-format";

type LoanProgramFormProps = {
  expanded: boolean;
  onToggle: () => void;
  preApprovalData: object;
};

export default function LoanProgramForm({
  expanded,
  onToggle,
  preApprovalData,
}: LoanProgramFormProps) {
  console.log(preApprovalData);

  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();
  const frontEndRatio = usePreApprovalStore((state) => state.frontEndRatio);
  const homeOwnerInsurance = usePreApprovalStore(
    (state) => state.homeOwnerInsurance
  );
  const associationFee = usePreApprovalStore((state) => state.associationFee);
  const monthlyIncome = usePreApprovalStore((state) => state.monthlyIncome);
  const frontEndRatiocolor = frontEndRatio <= 45 ? "#00CF1F" : "#F44336";

  const backEndRatio = usePreApprovalStore((state) => state.backEndRatio);
  useEffect(() => {
    setValue("loanProgram.backEndRatio", backEndRatio);
  }, [backEndRatio, setValue]);
  const backEndRatiocolor = backEndRatio <= 45 ? "#00CF1F" : "#F44336";

  const loanProgram =
    useWatch({ control, name: "loanProgram.loanProgram" }) ?? "1";
  const price = useWatch({ control, name: "loanProgram.price" }) ?? 0;
  const downPaymentPercentage =
    useWatch({ control, name: "loanProgram.downPaymentPercentage" }) ?? 0;
  const upmipRate = useWatch({ control, name: "loanProgram.upmipRate" }) ?? 0;
  const mmi = useWatch({ control, name: "loanProgram.mmi" }) ?? 0;
  const annualMIPRate =
    useWatch({ control, name: "loanProgram.annualMIPRate" }) ?? 0;
  const clearingCart =
    useWatch({ control, name: "loanProgram.clearingCart" }) ?? 0;
  const propertyTax =
    useWatch({ control, name: "loanProgram.propertyTax" }) ?? 0;
  const interestRate =
    useWatch({ control, name: "loanProgram.interestRate" }) ?? 0;
  const term = useWatch({ control, name: "loanProgram.term" }) ?? 0;
  const monthlyPropertyTax =
    useWatch({ control, name: "loanProgram.monthlyPropertyTax" }) ?? 0;
  const hazardInsurance =
    useWatch({ control, name: "loanProgram.hazardInsurance" }) ?? 0;
  const principalAndInterest =
    useWatch({ control, name: "loanProgram.principalAndInterest" }) ?? 0;
  // const mortgageInsurance =
  //   useWatch({ control, name: "loanProgram.mortgageInsurance" }) ?? 0;

  useEffect(() => {
    let calculatedAnnualMIPRate = 0;

    if (loanProgram === "3") {
      calculatedAnnualMIPRate = 0.55;
    }

    // If you want to override form state field as well
    if (calculatedAnnualMIPRate !== annualMIPRate) {
      setValue("loanProgram.annualMIPRate", calculatedAnnualMIPRate);
    }
    const downPaymentAmount = price * (downPaymentPercentage / 100);
    const baseLoanAmount = price - downPaymentAmount;
    const upmipAmount = baseLoanAmount * (upmipRate / 100);
    const finalLoanAmount = baseLoanAmount + upmipAmount;

    const totalNeededToClear = downPaymentAmount + clearingCart + propertyTax;

    const mortgageInsurance = (baseLoanAmount * (annualMIPRate / 100)) / 12;

    const calmmi = (baseLoanAmount * (annualMIPRate / 100)) / 12;

    const P = finalLoanAmount;
    const r = interestRate / 100 / 12;
    const n = term * 12;

    const monthlyPI =
      r === 0
        ? P / n
        : (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

    const monthlyTotal =
      monthlyPI + monthlyPropertyTax + hazardInsurance + mortgageInsurance;

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
    usePreApprovalStore.setState({ frontEndRatio: calculatedFrontEndRatio });

    setValue("loanProgram.frontEndRatio", calculatedFrontEndRatio);
    setValue(
      "loanProgram.downPaymentAmount",
      isNaN(downPaymentAmount) ? 0 : +downPaymentAmount.toFixed(2)
    );
    setValue(
      "loanProgram.baseLoanAmount",
      isNaN(baseLoanAmount) ? 0 : +baseLoanAmount.toFixed(2)
    );
    setValue(
      "loanProgram.upmipAmount",
      isNaN(upmipAmount) ? 0 : +upmipAmount.toFixed(2)
    );
    setValue(
      "loanProgram.finalLoanAmount",
      isNaN(finalLoanAmount) ? 0 : +finalLoanAmount.toFixed(2)
    );
    setValue("loanProgram.mmi", isNaN(calmmi) ? 0 : +calmmi.toFixed(2));
    setValue(
      "loanProgram.totalNeededToClear",
      isNaN(totalNeededToClear) ? 0 : +totalNeededToClear.toFixed(2)
    );
    setValue(
      "loanProgram.principalAndInterest",
      isNaN(monthlyPI) ? 0 : +monthlyPI.toFixed(2)
    );
    setValue(
      "loanProgram.mortgageInsurance",
      isNaN(mortgageInsurance) ? 0 : +mortgageInsurance.toFixed(2)
    );
    setValue(
      "loanProgram.monthlyTotal",
      isNaN(monthlyTotal) ? 0 : +monthlyTotal.toFixed(2)
    );
  }, [
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
    homeOwnerInsurance,
    associationFee,
    monthlyIncome,
    hazardInsurance,
    setValue,
  ]);

  return (
    <Box
      sx={{
        borderRadius: 4,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        onClick={onToggle}
        sx={{ cursor: "pointer" }}
      >
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
                  backgroundColor: "#7444F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SVGs name="Loan_Program_icon" />
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Loan Program
              </Typography>
            </Box>
            <IconButton size="small" sx={{ color: "black" }}>
              <SVGs name="Edit_icon" />
            </IconButton>
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
              <Controller
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
                        name="loanProgram.frontEndRatio"
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
                        name="loanProgram.backEndRatio"
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Price</Typography>
                <Controller
                  name="loanProgram.price"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.loanProgram?.price}
                      helperText={errors.loanProgram?.price?.message}
                      sx={{
                        maxWidth: 160,
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Annual Interest Rate</Typography>
                <Controller
                  name="loanProgram.interestRate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                      value={field.value ?? ""}
                      fullWidth
                      type="number"
                      placeholder="0"
                      size="medium"
                      error={!!errors.loanProgram?.interestRate}
                      helperText={errors.loanProgram?.interestRate?.message}
                      sx={{
                        maxWidth: 160,
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
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Base Loan Amount</Typography>
                <Controller
                  name="loanProgram.baseLoanAmount"
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
                      error={!!errors.loanProgram?.baseLoanAmount}
                      helperText={errors.loanProgram?.baseLoanAmount?.message}
                      sx={{
                        maxWidth: 160,
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
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>UPMIP</Typography>

                <Box display="flex" gap={1} alignItems="center">
                  {/* Percentage Field */}
                  <Controller
                    name="loanProgram.upmipRate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                        value={field.value ?? ""}
                        type="number"
                        placeholder="0"
                        size="small"
                        error={!!errors.loanProgram?.upmipRate}
                        helperText={errors.loanProgram?.upmipRate?.message}
                        sx={{
                          maxWidth: 84,
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
                          endAdornment: (
                            <InputAdornment position="end">
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
                    name="loanProgram.upmipAmount"
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
                        error={!!errors.loanProgram?.upmipAmount}
                        helperText={errors.loanProgram?.upmipAmount?.message}
                        sx={{
                          maxWidth: 160,
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Annual MIP Rate</Typography>
                <Controller
                  name="loanProgram.annualMIPRate"
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
                      allowNegative={false}
                      error={!!errors.loanProgram?.annualMIPRate}
                      helperText={errors.loanProgram?.annualMIPRate?.message}
                      sx={{
                        maxWidth: 160,
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
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Final Loan Amount</Typography>
                <Controller
                  name="loanProgram.finalLoanAmount"
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
                      error={!!errors.loanProgram?.finalLoanAmount}
                      helperText={errors.loanProgram?.finalLoanAmount?.message}
                      sx={{
                        maxWidth: 160,
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
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>MMI</Typography>
                <Controller
                  name="loanProgram.mmi"
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
                      error={!!errors.loanProgram?.mmi}
                      helperText={errors.loanProgram?.mmi?.message}
                      sx={{
                        maxWidth: 160,
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
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Term</Typography>
                <Controller
                  name="loanProgram.term"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                      value={field.value ?? ""}
                      fullWidth
                      type="number"
                      size="medium"
                      error={!!errors.loanProgram?.term}
                      helperText={errors.loanProgram?.term?.message}
                      sx={{
                        maxWidth: 160,
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
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Down Payment</Typography>

                <Box display="flex" gap={1} alignItems="center">
                  {/* Percentage Field */}
                  <Controller
                    name="loanProgram.downPaymentPercentage"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                        value={field.value ?? ""}
                        type="number"
                        placeholder="0"
                        size="small"
                        error={!!errors.loanProgram?.downPaymentPercentage}
                        helperText={
                          errors.loanProgram?.downPaymentPercentage?.message
                        }
                        sx={{
                          maxWidth: 84,
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
                          endAdornment: (
                            <InputAdornment position="end">
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
                    name="loanProgram.downPaymentAmount"
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
                        error={!!errors.loanProgram?.downPaymentAmount}
                        helperText={
                          errors.loanProgram?.downPaymentAmount?.message
                        }
                        sx={{
                          maxWidth: 160,
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

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Closing Costs</Typography>
                <Controller
                  name="loanProgram.clearingCart"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.loanProgram?.clearingCart}
                      helperText={errors.loanProgram?.clearingCart?.message}
                      sx={{
                        maxWidth: 160,
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Property Tax</Typography>
                <Controller
                  name="loanProgram.propertyTax"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.loanProgram?.propertyTax}
                      helperText={errors.loanProgram?.propertyTax?.message}
                      sx={{
                        maxWidth: 160,
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Total Needed to Clear</Typography>
                <Controller
                  name="loanProgram.totalNeededToClear"
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
                      error={!!errors.loanProgram?.totalNeededToClear}
                      helperText={
                        errors.loanProgram?.totalNeededToClear?.message
                      }
                      sx={{
                        maxWidth: 160,
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

            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
              }}
            >
              <Box 
                sx={{borderBottom: "2px solid #f0f0f0",}}
              >
                <Typography fontWeight={600} color="primary">
                  Borrower 1
                </Typography>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Typography fontWeight={600}>Monthly Income</Typography>
                  <Controller
                    name="loanProgram.baseLoanAmount"
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
                        error={!!errors.loanProgram?.baseLoanAmount}
                        helperText={errors.loanProgram?.baseLoanAmount?.message}
                        sx={{
                          maxWidth: 160,
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
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Typography fontWeight={600}>Debts</Typography>
                  <Controller
                    name="loanProgram.baseLoanAmount"
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
                        error={!!errors.loanProgram?.baseLoanAmount}
                        helperText={errors.loanProgram?.baseLoanAmount?.message}
                        sx={{
                          maxWidth: 160,
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
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <Typography fontWeight={600}>Fico Score</Typography>
                  <Controller
                    name="loanProgram.baseLoanAmount"
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
                        error={!!errors.loanProgram?.baseLoanAmount}
                        helperText={errors.loanProgram?.baseLoanAmount?.message}
                        sx={{
                          maxWidth: 160,
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
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Principal & Interest</Typography>
                <Controller
                  name="loanProgram.principalAndInterest"
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
                      error={!!errors.loanProgram?.principalAndInterest}
                      helperText={
                        errors.loanProgram?.principalAndInterest?.message
                      }
                      sx={{
                        maxWidth: 160,
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
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Property Tax</Typography>
                <Controller
                  name="loanProgram.monthlyPropertyTax"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.loanProgram?.monthlyPropertyTax}
                      helperText={
                        errors.loanProgram?.monthlyPropertyTax?.message
                      }
                      sx={{
                        maxWidth: 160,
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Haz Insurance</Typography>
                <Controller
                  name="loanProgram.hazardInsurance"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.loanProgram?.hazardInsurance}
                      helperText={errors.loanProgram?.hazardInsurance?.message}
                      sx={{
                        maxWidth: 160,
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Mortgage Insurance</Typography>
                <Controller
                  name="loanProgram.mortgageInsurance"
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
                      error={!!errors.loanProgram?.mortgageInsurance}
                      helperText={
                        errors.loanProgram?.mortgageInsurance?.message
                      }
                      sx={{
                        maxWidth: 160,
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
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600}>Monthly Total</Typography>
                <Controller
                  name="loanProgram.monthlyTotal"
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
                      error={!!errors.loanProgram?.monthlyTotal}
                      helperText={errors.loanProgram?.monthlyTotal?.message}
                      sx={{
                        maxWidth: 160,
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
      </Collapse>
    </Box>
  );
}
