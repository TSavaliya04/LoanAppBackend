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
  Button,
  CircularProgress,
} from "@mui/material";
import {
  useFormContext,
  Controller,
  useWatch,
  useFieldArray,
} from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import SVGs from "@/components/SVGs";
import { useEffect, useState } from "react";
import { usePreApprovalStore } from "@/store/usePreApprovalStore";
import { NumericFormat } from "react-number-format";
import { PreApprovalPDF } from "@/components/PDFViews/PreApprovalPDF";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { FHAGFEPDF } from "@/components/PDFViews/FHAGFEPDF";
import {
  getFHAGFEReport,
  getpreApprovalReport,
} from "@/api/network/getAllPreApprovals";

type LoanProgramFormProps = {
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  // preApprovalData: {
  //   data?: {
  //     borrowerIncomes?: any[];
  //     // add other properties as needed
  //   };
  //   // add other properties as needed
  // };
};

export default function LoanProgramForm({
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
}: // preApprovalData,
LoanProgramFormProps) {
  const preApprovalId = usePreApprovalStore((state) => state.preApprovalId);
  // const borrowerIncomes = preApprovalData?.data?.borrowerIncomes || [];

  const {
    control,
    setValue,
    formState: { errors, isDirty },
  } = useFormContext<CombinedPreApprovalFormData>();

  const { fields } = useFieldArray({
    control,
    name: "loanProgram.borrowers",
  });
  const frontEndRatio = usePreApprovalStore((state) => state.frontEndRatio);
  const monthlyIncome = usePreApprovalStore((state) => state.monthlyIncome);
  const frontEndRatiocolor = frontEndRatio <= 45 ? "#00CF1F" : "#F44336";

  const backEndRatio = usePreApprovalStore((state) => state.backEndRatio);
  const backEndRatiocolor = backEndRatio <= 45 ? "#00CF1F" : "#F44336";

  const borrowerIncome = useWatch({
    control,
    name: "borrowersIncomeData.borrowerIncome",
  });
  const associationFee =
    useWatch({
      control,
      name: "purchaseInfo.associationFee",
    }) ?? 0;
  const loanProgram =
    useWatch({ control, name: "borrowerInfo.loanProgram" }) ?? "1";
  const price = useWatch({ control, name: "purchaseInfo.purchasePrice" }) ?? 0;
  const downPaymentPercentage =
    useWatch({ control, name: "purchaseInfo.downPayment" }) ?? 0;
  const upmipRate = useWatch({ control, name: "loanProgram.upmipRate" }) ?? 0;
  const mmi = useWatch({ control, name: "loanProgram.mmi" }) ?? 0;
  const annualMIPRate =
    useWatch({ control, name: "loanProgram.annualMIPRate" }) ?? 0;
  const clearingCart =
    useWatch({ control, name: "loanProgram.clearingCart" }) ?? 0;
  const propertyTax =
    useWatch({ control, name: "loanProgram.propertyTax" }) ?? 0;
  const interestRate =
    useWatch({ control, name: "purchaseInfo.annualInterestRate" }) ?? 0;
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
    }

    // If you want to override form state field as well
    if (calculatedAnnualMIPRate !== annualMIPRate) {
      setValue("loanProgram.annualMIPRate", calculatedAnnualMIPRate);
    }
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
    usePreApprovalStore.setState({
      frontEndRatio: !isFinite(calculatedFrontEndRatio)
        ? 0
        : calculatedFrontEndRatio,
    });

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

    usePreApprovalStore.setState({
      backEndRatio: !isFinite(calculatedBackEndRatio)
        ? 0
        : calculatedBackEndRatio,
    });

    setValue("loanProgram.frontEndRatio", calculatedFrontEndRatio);
    setValue("loanProgram.backEndRatio", calculatedBackEndRatio);
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
      isNaN(totalNeededToClear) ? 0 : +totalNeededToClear
    );
    setValue(
      "loanProgram.principalAndInterest",
      isNaN(monthlyPI) ? 0 : +monthlyPI.toFixed(0)
    );
    setValue(
      "loanProgram.mortgageInsurance",
      isNaN(mortgageInsurance) ? 0 : +mortgageInsurance.toFixed(0)
    );
    setValue(
      "loanProgram.monthlyTotal",
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
    setValue,
  ]);

  const loanProgramNames = {
    "1": "Non QM",
    "2": "Conventional",
    "3": "FHA",
  };

  const propertyTypes = {
    "1": "SFR",
    "2": "2 Units",
    "3": "3 Units",
    "4": "4 Units",
    "5": "Condo/Townhome",
  };

  const occupancyStatuses = {
    "1": "Owner Occupied",
    "2": "2nd Home",
    "3": "Investment",
  };

  const [preApprovalloading, setPreApprovalloading] = useState(false);
  const [FHAGFEloading, setFHAGFELoading] = useState(false);

  const generatePreApproval = async (preApprovalId: string) => {
    setPreApprovalloading(true);

    try {
      const response = await getpreApprovalReport(preApprovalId);
      const preApprovalReportData = response.data.data;
      console.log(preApprovalReportData);

      const mockData = {
        borrowerName: preApprovalReportData.borrowerName,
        borrowers: preApprovalReportData.borrowers,
        date: formatDate(preApprovalReportData.date),
        downPaymentAmount: formatAmount(
          preApprovalReportData.downPaymentAmount
        ),
        downPaymentPercentage: preApprovalReportData.downPaymentPercentage,
        firstMortgageAmount: formatAmount(
          preApprovalReportData.firstMortgageAmount
        ),
        lendingCompany: preApprovalReportData.lendingCompany,
        loanProgram:
          loanProgramNames[
            preApprovalReportData.loanProgram as keyof typeof loanProgramNames
          ] || "",
        propertyType:
          propertyTypes[
            preApprovalReportData.propertyType as keyof typeof propertyTypes
          ] || "",
        purchasePrice: formatAmount(preApprovalReportData.purchasePrice),
        occupancyStatus:
          occupancyStatuses[
            preApprovalReportData.occupancyStatus as keyof typeof occupancyStatuses
          ] || "",
        address: "",
        loanUse: "Real Estate Purchase",
        firstMortgage: "",
        secondMortgage: "",
        unitCount: "",
        ppp: "",
      };

      const blob = await pdf(<PreApprovalPDF data={mockData} />).toBlob();
      saveAs(blob, "pre-approval-letter.pdf");
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setPreApprovalloading(false);
    }
  };

  const generateFHAGFE = async (preApprovalId: string) => {
    setFHAGFELoading(true);

    try {
      const response = await getFHAGFEReport(preApprovalId);
      const FHAGFEReportData = response.data.data;
      console.log(FHAGFEReportData);

      const FHAGFEPDFData = {
        borrower: FHAGFEReportData.borrowerName,
        propertyAddress: "",
        date: formatDate(FHAGFEReportData.date),
        loanType:
          loanProgramNames[
            FHAGFEReportData.loanProgram as keyof typeof loanProgramNames
          ] || "",
        salesPrice: formatAmount(FHAGFEReportData.salePrice),
        downPayment: formatAmount(FHAGFEReportData.downPaymentAmount),
        subFinancing: formatAmount(FHAGFEReportData.subFinancing),
        otherFinanced: formatAmount(FHAGFEReportData.otherFinancedItems),
        upfrontMIP: FHAGFEReportData.upfrontMipPercent,
        loanAmount: formatAmount(FHAGFEReportData.totalLoanAmount),
        interestRate: FHAGFEReportData.interestRate,
        loanTerm: FHAGFEReportData.loanTerm,
        monthlyTaxes: formatAmount(FHAGFEReportData.propertyTax),
        piLoanAmount: formatAmount(FHAGFEReportData.piLoanAmount),
        hazardInsurance: formatAmount(FHAGFEReportData.hazardInsurancePremium),
        mortgageInsurance: formatAmount(FHAGFEReportData.mortgageInsurance),
        loanOriginationFees: formatAmount(FHAGFEReportData.loanOriginationFees),
        discountFee: formatAmount(FHAGFEReportData.discountFee),
        CoverageRate: formatAmount(FHAGFEReportData.CoverageRate),
        TotalMonthlyPayment: formatAmount(FHAGFEReportData.TotalMonthlyPayment),
        appraisalFee: formatAmount(
          FHAGFEReportData.estimatedClosingCost.appraisalFee
        ),
        prepaidInterest: formatAmount(
          FHAGFEReportData.estimatedClosingCost.prepaidInterest
        ),
        hazInsReserve: formatAmount(
          FHAGFEReportData.estimatedClosingCost.hazInsReserve
        ),
        escrowFee: formatAmount(
          FHAGFEReportData.estimatedClosingCost.escrowFee
        ),
        titleInsurance: formatAmount(
          FHAGFEReportData.estimatedClosingCost.titleInsurance
        ),
        estClosingCost: formatAmount(
          FHAGFEReportData.estimatedClosingCost.estClosingCost
        ),
        estPrepaidItemReserves: formatAmount(
          FHAGFEReportData.estimatedClosingCost.estPrepaidItemReserves
        ),
        totalEstSettlementCharges: formatAmount(
          FHAGFEReportData.estimatedClosingCost.totalEstSettlementCharges
        ),
        totalEstFundToClose: formatAmount(
          FHAGFEReportData.estimatedClosingCost.totalEstFundToClose
        ),
        hoaDues: formatAmount(FHAGFEReportData.estimatedClosingCost.hoaDues),
        prepaidInterestDays:
          FHAGFEReportData.estimatedClosingCost.prepaidInterestDays,
        lockRequested: true,
        lockRate: FHAGFEReportData.interestRate,
        lockExpiration: formatDate(FHAGFEReportData.expirationDate),
      };
      const blob = await pdf(<FHAGFEPDF data={FHAGFEPDFData} />).toBlob();
      saveAs(blob, "FHAGFE-report.pdf");
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setPreApprovalloading(false);
    }

    // Simulate async action
    setTimeout(() => {
      setFHAGFELoading(false);
    }, 2000);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    // Get month, day, and year
    const month = date.getMonth() + 1; // Months are 0-based
    const day = date.getDate();
    const year = date.getFullYear() % 100; // Last two digits

    return `${month}/${day}/${year}`;
  };

  function formatAmount(amount: number) {
    if (isNaN(amount)) return "0.00";
    return Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

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
                name="borrowerInfo.loanProgram"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Loan Program *"
                    error={!!errors.borrowerInfo?.loanProgram}
                    helperText={errors.borrowerInfo?.loanProgram?.message}
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
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Price
                </Typography>
                <Controller
                  name="purchaseInfo.purchasePrice"
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
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.purchaseInfo?.purchasePrice}
                      helperText={errors.purchaseInfo?.purchasePrice?.message}
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
                  name="purchaseInfo.annualInterestRate"
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
                      error={!!errors.purchaseInfo?.annualInterestRate}
                      helperText={
                        errors.purchaseInfo?.annualInterestRate?.message
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
                    name="loanProgram.upmipRate"
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
                        error={!!errors.loanProgram?.upmipRate}
                        helperText={errors.loanProgram?.upmipRate?.message}
                        sx={{
                          maxWidth: 76,
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
                  Annual MIP Rate
                </Typography>
                <Controller
                  name="loanProgram.annualMIPRate"
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
                      error={!!errors.loanProgram?.annualMIPRate}
                      helperText={errors.loanProgram?.annualMIPRate?.message}
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
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Final Loan Amount
                </Typography>
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
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  MMI
                </Typography>
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
                  Term
                </Typography>
                <Controller
                  name="loanProgram.term"
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
                      error={!!errors.loanProgram?.term}
                      helperText={errors.loanProgram?.term?.message}
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
                  Down Payment
                </Typography>

                <Box display="flex" gap={1} alignItems="center">
                  {/* Percentage Field */}
                  <Controller
                    name="purchaseInfo.downPayment"
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
                        error={!!errors.purchaseInfo?.downPayment}
                        helperText={errors.purchaseInfo?.downPayment?.message}
                        sx={{
                          maxWidth: 76,
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
                  name="loanProgram.clearingCart"
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
                            : values.floatValue
                        )
                      }
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.loanProgram?.clearingCart}
                      helperText={errors.loanProgram?.clearingCart?.message}
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
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Property Tax
                </Typography>
                <Controller
                  name="loanProgram.propertyTax"
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
                            : values.floatValue
                        )
                      }
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.loanProgram?.propertyTax}
                      helperText={errors.loanProgram?.propertyTax?.message}
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
                  Total Needed to Clear
                </Typography>
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

            <Grid
              size={{ xs: 12 }}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                p: 2,
              }}
            >
              {fields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{ borderBottom: "2px solid #f0f0f0", mb: 2, pb: 2 }}
                >
                  <Typography fontWeight={600} color="primary">
                    Borrower {index + 1}
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
                      name={`loanProgram.borrowers.${index}.monthlyIncome`}
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
                            !!errors.loanProgram?.borrowers?.[index]
                              ?.monthlyIncome
                          }
                          helperText={
                            errors.loanProgram?.borrowers?.[index]
                              ?.monthlyIncome?.message
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
                      name={`loanProgram.borrowers.${index}.debts`}
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
                            !!errors.loanProgram?.borrowers?.[index]?.debts
                          }
                          helperText={
                            errors.loanProgram?.borrowers?.[index]?.debts
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
                      name={`loanProgram.borrowers.${index}.ficoScore`}
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
                            !!errors.loanProgram?.borrowers?.[index]?.ficoScore
                          }
                          helperText={
                            errors.loanProgram?.borrowers?.[index]?.ficoScore
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
                        />
                      )}
                    />
                  </Box>
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
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Property Tax
                </Typography>
                <Controller
                  name="loanProgram.monthlyPropertyTax"
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
                            : values.floatValue
                        )
                      }
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.loanProgram?.monthlyPropertyTax}
                      helperText={
                        errors.loanProgram?.monthlyPropertyTax?.message
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
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Haz Insurance
                </Typography>
                <Controller
                  name="loanProgram.hazardInsurance"
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
                            : values.floatValue
                        )
                      }
                      inputProps={{ inputMode: "decimal", pattern: "[0-9.,]*" }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.loanProgram?.hazardInsurance}
                      helperText={errors.loanProgram?.hazardInsurance?.message}
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
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Mortgage Insurance
                </Typography>
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
                  borderBottom: "1px solid #f0f0f0",
                  paddingLeft: 0.5,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Monthly Total
                </Typography>
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
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  gap: "1rem",
                }}
              >
                <Button
                  onClick={() => generatePreApproval(preApprovalId)}
                  disabled={preApprovalloading || isDirty}
                  variant="outlined"
                  sx={{
                    width: "165px",
                    borderRadius: "999px",
                    borderColor: "#ff453b",
                    color: "#ff453b",
                    fontWeight: "bold",
                    px: 3,
                    py: 1.2,
                    "&:hover": {
                      backgroundColor: "#ffe6e6",
                      borderColor: "#ff453b",
                    },
                  }}
                >
                  {preApprovalloading ? (
                    <CircularProgress size={20} sx={{ color: "#ff453b" }} />
                  ) : (
                    <Typography
                      fontWeight={600}
                      color={isDirty ? "rgba(0, 0, 0, 0.26)" : "#ff453b"}
                      sx={{
                        whiteSpace: "nowrap", // Keeps the text on a single line
                        overflow: "hidden", // Hides overflowed text
                        textOverflow: "ellipsis", // Adds "..." if text overflows
                      }}
                    >
                      PRE APPROVAL
                    </Typography>
                  )}
                </Button>
                <Button
                  onClick={() => generateFHAGFE(preApprovalId)}
                  disabled={FHAGFEloading || isDirty}
                  variant="outlined"
                  sx={{
                    width: "117px",
                    borderRadius: "999px",
                    borderColor: "#ff453b",
                    color: "#ff453b",
                    fontWeight: "bold",
                    px: 3,
                    py: 1.2,
                    "&:hover": {
                      backgroundColor: "#ffe6e6",
                      borderColor: "#ff453b",
                    },
                  }}
                >
                  {FHAGFEloading ? (
                    <CircularProgress size={20} sx={{ color: "#ff453b" }} />
                  ) : (
                    <Typography fontWeight={600} color={isDirty ? "rgba(0, 0, 0, 0.26)" : "#ff453b"}>
                      FHA/GFE
                    </Typography>
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
