"use client";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  styled,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddIcon from "@mui/icons-material/Add";
import {
  useFieldArray,
  Control,
  FieldErrors,
  useWatch,
  useFormContext,
  Controller,
} from "react-hook-form";
import { pdf } from "@react-pdf/renderer";
import { ComparePreApprovalFormData } from "@/api/models/ComparePreApprovalSchema";
import BorrowerIncomeItem from "../CompareForms/BorrowerIncomeItem";
import { useEffect, useMemo, useState } from "react";
import { usePreApprovalStore } from "@/store/compareStore/usePreApprovalStore";
import {
  getFHAGFEReport,
  getpreApprovalReport,
  getquickQuoteReport,
} from "@/api/network/getAllPreApprovals";
import { QuickQuotePDF } from "@/components/PDFViews/QuickQuotePDF";
import { PreApprovalPDF } from "@/components/PDFViews/PreApprovalPDF";
import { FHAGFEPDF } from "@/components/PDFViews/FHAGFEPDF";

type Props = {
  index: number;
  control: Control<ComparePreApprovalFormData>;
  errors: FieldErrors<ComparePreApprovalFormData>;
  isPDFbuttondisabled: boolean;
  isloading: boolean;
};

export default function BorrowsIncomeDataItem({
  index,
  control,
  errors,
  isPDFbuttondisabled,
  isloading
}: Props) {
  const [open, setOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const setMonthlyIncome = usePreApprovalStore(
    (state) => state.setMonthlyIncome
  );
  const setBackEndRatio = usePreApprovalStore((state) => state.setBackEndRatio);
  const {
    setValue,
    getValues,
    formState: { isDirty },
  } = useFormContext<ComparePreApprovalFormData>();
  const { fields, append } = useFieldArray({
    control,
    name: `borrowersIncomeData.Inputs.${index}.borrowerIncome`,
  });

  const borrowerIncome = useWatch({
    control,
    name: `borrowersIncomeData.Inputs.${index}.borrowerIncome`,
  });

  const principalAndInterest =
    useWatch({
      control,
      name: `loanProgram.Inputs.${index}.principalAndInterest`,
    }) ?? 0;
  const propertyTax =
    useWatch({ control, name: `loanProgram.Inputs.${index}.propertyTax` }) ?? 0;
  const mortgageInsurance =
    useWatch({
      control,
      name: `loanProgram.Inputs.${index}.mortgageInsurance`,
    }) ?? 0;
  const associationFee =
    useWatch({
      control,
      name: `purchaseInfo.Inputs.${index}.associationFee`,
    }) ?? 0;

  const calMonthlyIncome = useMemo(() => {
    let totalIncome = 0;

    borrowerIncome?.forEach((borrower) => {
      totalIncome += Number(borrower.monthlyIncome) || 0;
    });

    return totalIncome;
  }, [borrowerIncome]);

  useEffect(() => {
    setMonthlyIncome(index, calMonthlyIncome);
  }, [calMonthlyIncome, setMonthlyIncome]);

  const ratioBack = useMemo(() => {
    let totalIncome = 0;
    let totalPayment = 0;

    borrowerIncome?.forEach((borrower) => {
      totalIncome += Number(borrower.monthlyIncome) || 0;
      borrower?.debts?.forEach((debt) => {
        totalPayment += Number(debt.monthlyPayment) || 0;
      });
    });

    const monthlyHousingExpenses =
      principalAndInterest + propertyTax + mortgageInsurance + associationFee;

    if (totalIncome === 0) return 0;

    return parseFloat(
      (((monthlyHousingExpenses + totalPayment) / totalIncome) * 100).toFixed(2)
    );
  }, [
    principalAndInterest,
    propertyTax,
    mortgageInsurance,
    associationFee,
    borrowerIncome,
  ]);

  useEffect(() => {
    if (!borrowerIncome) return;

    const loanProgramBorrowers = borrowerIncome.map((borrower) => {
      const totalDebts = borrower.debts?.reduce(
        (sum, debt) => sum + (Number(debt.monthlyPayment) || 0),
        0
      );

      return {
        monthlyIncome: Number(borrower.monthlyIncome) || 0,
        debts: totalDebts,
        ficoScore: borrower.ficoScore,
      };
    });

    setValue(`loanProgram.Inputs.${index}.borrowers`, loanProgramBorrowers);
  }, [borrowerIncome, setValue]);

  useEffect(() => {
    setBackEndRatio(index, ratioBack);
  }, [ratioBack, setBackEndRatio]);

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
    "6": "Duplex",
    "7": "Tri-plex",
    "8": "Four-plex",
  };

  const occupancyStatuses = {
    "1": "Owner Occupied",
    "2": "2nd Home",
    "3": "Investment",
  };

  const [quickQuoteloading, setQuickQuoteloading] = useState(false);
  const [preApprovalloading, setPreApprovalloading] = useState(false);
  const [FHAGFEloading, setFHAGFELoading] = useState(false);

  const [selectedPdf, setSelectedPdf] = useState("");
  const [pdfName, setPdfName] = useState("");

  const handleGenerate = (pdfname: string, language: string) => {
    const preApprovalId = getValues(
      `borrowersIncomeData.Inputs.${index}.preApprovalId`
    );
    if (selectedPdf === "preApproval") {
      if (preApprovalId) {
        generatePreApproval(preApprovalId, pdfname);
      }
    } else if (selectedPdf === "FHAGFE") {
      if (preApprovalId) {
        generateFHAGFE(preApprovalId, pdfname, language);
      }
    } else if (selectedPdf === "quickQuote") {
      if (preApprovalId) {
        generateQuickQuote(preApprovalId, pdfname, language);
      }
    }
  };

  const isLoading =
    (selectedPdf === "quickQuote" && quickQuoteloading) ||
    (selectedPdf === "preApproval" && preApprovalloading) ||
    (selectedPdf === "FHAGFE" && FHAGFEloading);

  const generateQuickQuote = async (
    preApprovalId: string,
    pdfName: string,
    language: string
  ) => {
    // setQuickQuoteloading(true);

    // try {
    //   const response = await getquickQuoteReport(preApprovalId, "1");
    //   const quickQuoteReportData = response.data.data;
    //   const { earnestMoneyDeposit, sellerCredit, lenderCredit, miscFee4 } =
    //     quickQuoteReportData;

    //   // const profileBase64 = preApprovalReportData.agentInfo.profile
    //   //   ? await toBase64FromUrl(preApprovalReportData.agentInfo.profile)
    //   //   : "";

    //   const quickQuoteData = {
    //     spanish: language === "on" ? true : false,
    //     loanProgram:
    //       loanProgramNames[
    //       quickQuoteReportData.loanProgram as keyof typeof loanProgramNames
    //       ] || "",
    //     homeValue: formatAmount(quickQuoteReportData.homeValue),
    //     interestRate: quickQuoteReportData.interestRate,
    //     downPayment: quickQuoteReportData.downPaymentPercent,
    //     principalInterest: formatAmount(
    //       quickQuoteReportData.principalAndInterest
    //     ),
    //     propertyTax: formatAmount(quickQuoteReportData.propertyTax),
    //     hazardInsurance: formatAmount(quickQuoteReportData.hazardInsurance),
    //     mortgageInsurance: formatAmount(quickQuoteReportData.mortgageInsurance),
    //     hoaFee: formatAmount(quickQuoteReportData.hoaFee),
    //     monthlyTotal: formatAmount(quickQuoteReportData.monthlyTotal),
    //     closingDownPayment: formatAmount(quickQuoteReportData.downPayment),
    //     closingCosts: formatAmount(quickQuoteReportData.closingCosts),
    //     prepaids: formatAmount(quickQuoteReportData.prepaids),
    //     earnestMoneyDeposit:
    //       earnestMoneyDeposit != null && earnestMoneyDeposit > 0
    //         ? formatAmount(earnestMoneyDeposit)
    //         : "",
    //     sellerCredit:
    //       sellerCredit != null && sellerCredit > 0
    //         ? formatAmount(sellerCredit)
    //         : "",
    //     lenderCredit:
    //       lenderCredit != null && lenderCredit > 0
    //         ? formatAmount(lenderCredit)
    //         : "",
    //     miscFee4:
    //       miscFee4 != null && miscFee4 > 0 ? formatAmount(miscFee4) : "",
    //     totalRequired: formatAmount(quickQuoteReportData.totalRequired),
    //   };

    //   console.log(quickQuoteData);

    //   const blob = await pdf(<QuickQuotePDF data={quickQuoteData} />).toBlob();
    //   const url = URL.createObjectURL(blob);
    //   setPdfPreviewUrl(url);
    // } catch (err) {
    //   console.error("PDF generation failed", err);
    // } finally {
    //   setQuickQuoteloading(false);
    // }
  };

  const generatePreApproval = async (
    preApprovalId: string,
    pdfName: string
  ) => {
    console.log(pdfName);

    setPreApprovalloading(true);

    try {
      const response = await getpreApprovalReport(preApprovalId, "1");
      const preApprovalReportData = response.data.data;

      const profileBase64 = preApprovalReportData.agentInfo.profile
        ? await toBase64FromUrl(preApprovalReportData.agentInfo.profile)
        : "";

      const mockData = {
        agentName: `${preApprovalReportData.agentInfo.firstName} ${preApprovalReportData.agentInfo.lastName}`,
        agentjobTitle: preApprovalReportData.agentInfo.jobTitle || "",
        agentnmls: preApprovalReportData.agentInfo.nmls || "",
        agentphone: formatUSPhoneNumber(
          preApprovalReportData.agentInfo.phone || ""
        ),
        agentemail: preApprovalReportData.agentInfo.email || "",
        agentcompanyname: preApprovalReportData.agentInfo.companyName || "",
        agentprofile: profileBase64,
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

      console.log(mockData);

      const blob = await pdf(<PreApprovalPDF data={mockData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setPreApprovalloading(false);
    }
  };

  const toBase64FromUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const generateFHAGFE = async (
    preApprovalId: string,
    pdfName: string,
    language: string
  ) => {
    // setFHAGFELoading(true);

    // try {
    //   const response = await getFHAGFEReport(preApprovalId, "1");
    //   const FHAGFEReportData = response.data.data;
    //   const prepaidInterestPerDay =
    //     FHAGFEReportData.estimatedClosingCost.prepaidInterest /
    //     FHAGFEReportData.estimatedClosingCost.prepaidInterestDays;
    //   const hazInsPremiumMonthly =
    //     FHAGFEReportData.estimatedClosingCost.hazInsPremium / 12;
    //   const { earnestMoneyDeposit, sellerCredit, lenderCredit } =
    //     FHAGFEReportData.estimatedClosingCost;
    //   console.log(FHAGFEReportData);

    //   const FHAGFEPDFData = {
    //     spanish: language === "on" ? true : false,
    //     borrower: FHAGFEReportData.borrowerName,
    //     propertyAddress: "",
    //     date: formatDate(FHAGFEReportData.date),
    //     loanType:
    //       loanProgramNames[
    //       FHAGFEReportData.loanProgram as keyof typeof loanProgramNames
    //       ] || "",
    //     salesPrice: formatAmount(FHAGFEReportData.salePrice),
    //     downPayment: formatAmount(FHAGFEReportData.downPaymentAmount),
    //     subFinancing: formatAmount(FHAGFEReportData.subFinancing),
    //     otherFinanced: formatAmount(FHAGFEReportData.otherFinancedItems),
    //     upfrontMIP: FHAGFEReportData.upfrontMipPercent,
    //     loanAmount: formatAmount(FHAGFEReportData.totalLoanAmount),
    //     interestRate: FHAGFEReportData.interestRate,
    //     loanTerm: FHAGFEReportData.loanTerm,
    //     monthlyTaxes: formatAmount(FHAGFEReportData.propertyTax),
    //     piLoanAmount: formatAmount(FHAGFEReportData.piLoanAmount),
    //     hazardInsurance: formatAmount(FHAGFEReportData.hazardInsurancePremium),
    //     mortgageInsurance: formatAmount(FHAGFEReportData.mortgageInsurance),
    //     coverageRate: formatAmount(FHAGFEReportData.coverageRate),
    //     totalMonthlyPayment: formatAmount(FHAGFEReportData.totalMonthlyPayment),
    //     hoaDues: formatAmount(FHAGFEReportData.hoaDues),
    //     appraisalFee: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.appraisalFee
    //     ),
    //     discountFee: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.discountFee
    //     ),
    //     discountFeePercent:
    //       FHAGFEReportData.estimatedClosingCost.discountFeePercent,
    //     prepaidInterest: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.prepaidInterest
    //     ),
    //     hazInsReserve: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.hazInsReserve
    //     ),
    //     hazInsReserveMonths:
    //       FHAGFEReportData.estimatedClosingCost.hazInsReserveMonths,
    //     originationFee: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.originationFee
    //     ),
    //     originationFeePercent:
    //       FHAGFEReportData.estimatedClosingCost.originationFeePercent,
    //     escrowFees: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.escrowFees
    //     ),
    //     ppdPropTaxes: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.ppdPropTaxes
    //     ),
    //     ppdPropTaxesMonths:
    //       FHAGFEReportData.estimatedClosingCost.ppdPropTaxesMonths,
    //     titleInsurance: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.titleInsurance
    //     ),
    //     thirdPartyLenderFee: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.thirdPartyLenderFee
    //     ),
    //     estClosingCost: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.estClosingCost
    //     ),
    //     estPrepaidItemReserves: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.estPrepaidItemReserves
    //     ),
    //     hazInsPremium: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.hazInsPremium
    //     ),
    //     hazInsPremiumMonthly: formatAmount(hazInsPremiumMonthly),
    //     totalEstSettlementCharges: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.totalEstSettlementCharges
    //     ),
    //     earnestMoneyDeposit:
    //       earnestMoneyDeposit != null && earnestMoneyDeposit > 0
    //         ? formatAmount(earnestMoneyDeposit)
    //         : "",
    //     sellerCredit:
    //       sellerCredit != null && sellerCredit > 0
    //         ? formatAmount(sellerCredit)
    //         : "",
    //     lenderCredit:
    //       lenderCredit != null && lenderCredit > 0
    //         ? formatAmount(lenderCredit)
    //         : "",
    //     totalEstFundToClose: formatAmount(
    //       FHAGFEReportData.estimatedClosingCost.totalEstFundToClose
    //     ),
    //     prepaidInterestDays:
    //       FHAGFEReportData.estimatedClosingCost.prepaidInterestDays,
    //     prepaidInterestPerDay: formatAmount(prepaidInterestPerDay),
    //     lockRequested: true,
    //     lockRate: FHAGFEReportData.interestRate,
    //     lockExpiration: formatDate(FHAGFEReportData.expirationDate),
    //   };

    //   const blob = await pdf(<FHAGFEPDF data={FHAGFEPDFData} />).toBlob();
    //   const url = URL.createObjectURL(blob);
    //   setPdfPreviewUrl(url);
    // } catch (err) {
    //   console.error("PDF generation failed", err);
    // } finally {
    //   setPreApprovalloading(false);
    // }

    // // Simulate async action
    // setTimeout(() => {
    //   setFHAGFELoading(false);
    // }, 2000);
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

  function formatUSPhoneNumber(input: string) {
    const digits = input.replace(/\D/g, "");
    const last10 = digits.slice(-10);
    if (last10.length !== 10) {
      return "Invalid number"; // Not enough digits
    }
    return `(${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    const form = document.getElementById("pdfname-form") as HTMLDivElement;

    // Cast the NodeList so TypeScript knows these are Inputs or Selects
    const inputs = form.querySelectorAll("input, select");

    // Fix 1: Define specific types for the values (string or boolean)
    const data: Record<string, string | boolean> = {};

    // Fix 2: Type 'el' as HTMLInputElement to access .name, .type, .checked, and .value
    inputs.forEach((el) => {
      const inputEl = el as HTMLInputElement;
      data[inputEl.name] =
        inputEl.type === "checkbox" ? inputEl.checked : inputEl.value;
    });

    // Note: data.pdfname might be boolean technically, so you might need to cast it to string
    // if you are sure it's a text input, or use String(data.pdfname)
    const pdfname = data.pdfname as string;
    const language = data.language ? "on" : "off";

    handleGenerate(pdfname, language);
    handleClose();
  };

  const Android12Switch = styled(Switch)(({ }) => ({
    padding: 8,
    "& .MuiSwitch-track": {
      borderRadius: 22 / 2,
      "&::before, &::after": {
        content: '""',
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: 16,
        height: 16,
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "none",
      width: 16,
      height: 16,
      margin: 2,
    },
  }));

  const handleShare = async () => {
    if (!pdfPreviewUrl) return;

    try {
      // 1. Convert the Blob URL back into a Blob/File object
      const response = await fetch(pdfPreviewUrl);
      const blob = await response.blob();
      const file = new File([blob], `${pdfName}.pdf`, {
        type: "application/pdf",
      });

      // 2. Check if the browser supports sharing files
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Exported PDF",
          text: "Here is the PDF document you requested.",
        });
      } else {
        // 3. Fallback: If native sharing isn't supported (e.g., some desktop browsers),
        // trigger a standard download.
        const link = document.createElement("a");
        link.href = pdfPreviewUrl;
        link.download = `${pdfName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };
  return (
    <Box pt={2}>
      <Grid container spacing={2}>
        <Grid
          size={{ xs: 12 }}
          sx={{
            borderRadius: 3,
            backgroundColor: "#fff",
            p: 2,
          }}
        >
          <Box>
            <Grid sx={{ display: "none" }}>
              <Controller
                name={`borrowersIncomeData.Inputs.${index}.preApprovalId`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="preApprovalId *"
                    error={
                      !!errors.borrowersIncomeData?.Inputs?.[index]
                        ?.preApprovalId
                    }
                    helperText={
                      errors.borrowersIncomeData?.Inputs?.[index]?.preApprovalId
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            {fields.map((field, BorrowerIncomeindex) => (
              <BorrowerIncomeItem
                key={field.id}
                index={index}
                BorrowerIncomeindex={BorrowerIncomeindex}
                control={control}
                errors={errors}
              />
            ))}
            <Box textAlign="center">
              <Button
                onClick={() =>
                  append({
                    borrowerName: "",
                    ficoScore:
                      getValues(`borrowerInfo.Inputs.${index}.ficoScore`) ?? 0,
                    monthlyIncome: 0,
                    debts: [
                      {
                        debtType: "3",
                        balance: 0,
                        monthlyPayment: 0,
                      },
                    ],
                  })
                }
                startIcon={<AddIcon />}
                sx={{
                  color: "#7444F5",
                  width: "100%",
                  borderColor: "#7444F54D",
                  borderWidth: 2,
                  borderRadius: 999,
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: "transparent",
                  ":hover": {
                    backgroundColor: "#f3e6fd",
                    borderColor: "#C1A9F5",
                  },
                }}
                variant="outlined"
              >
                ADD BORROWER
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ mb: 7 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <FormControl
              variant="outlined"
              sx={{
                width: "100%",
              }}
              disabled={isDirty || isLoading}
            >
              <InputLabel>Select PDF</InputLabel>
              <Select
                value={selectedPdf}
                onChange={(e) => setSelectedPdf(e.target.value)}
                label="Select PDF"
              >
                <MenuItem
                  value="quickQuote"
                  data-name="Quick Quote"
                  onClick={(e) =>
                    setPdfName(e.currentTarget.dataset.name ?? "")
                  }
                >
                  Quick Quote
                </MenuItem>
                <MenuItem
                  value="preApproval"
                  data-name="Pre Approval"
                  onClick={(e) =>
                    setPdfName(e.currentTarget.dataset.name ?? "")
                  }
                >
                  Pre Approval
                </MenuItem>
                <MenuItem
                  value="FHAGFE"
                  data-name="Fee Worksheet"
                  onClick={(e) =>
                    setPdfName(e.currentTarget.dataset.name ?? "")
                  }
                >
                  Fee Worksheet
                </MenuItem>
              </Select>
            </FormControl>
            <Button
              disabled={isloading}
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#ff453b",
                borderRadius: 99,
                py: 1.25,
              }}
            >
              {isloading ? (
                <CircularProgress size={24} sx={{ color: "#ff453b" }} />
              ) : (
                <Typography
                  fontWeight={400}
                  color={isloading ? "rgba(0, 0, 0, 0.26)" : "white"}
                >
                  SAVE
                </Typography>
              )}
            </Button>
            <Button
              onClick={handleClickOpen}
              fullWidth
              disabled={
                !selectedPdf || isLoading || isDirty || isPDFbuttondisabled
              }
              variant="contained"
              sx={{
                bgcolor: "#ff453b",
                borderRadius: 99,
                py: 1.25,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "#ff453b" }} />
              ) : (
                <Typography
                  fontWeight={400}
                  color={
                    isDirty || !selectedPdf ? "rgba(0, 0, 0, 0.26)" : "white"
                  }
                >
                  GENERATE PDF
                </Typography>
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start", // <--- Aligns dialog to top
          },
          "& .MuiDialog-paper": {
            marginTop: "250px", // Optional spacing from top
            maxWidth: "420px",
          },
        }}
      >
        <DialogContent>
          <Box id="pdfname-form">
            <TextField
              autoFocus
              required
              margin="dense"
              id="pdfname"
              name="pdfname"
              label="Document Name"
              type="text"
              fullWidth
              variant="standard"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
            />
            {(selectedPdf === "FHAGFE" || selectedPdf === "quickQuote") && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography>English</Typography>
                <FormGroup>
                  <FormControlLabel
                    sx={{ marginRight: 0, marginLeft: 0 }}
                    control={<Android12Switch />}
                    label=""
                    name="language"
                  />
                </FormGroup>
                <Typography>Spanish</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              backgroundColor: "#f5f5f5",
              color: "#000",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              backgroundColor: "#ff453b",
              color: "#fff",
              "&:hover": { backgroundColor: "#da241bff" },
              ml: 2,
            }}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
      {/* PDF Preview Dialog */}
      <Dialog
        open={!!pdfPreviewUrl}
        onClose={() => {
          setPdfPreviewUrl(null);
          // Optional: Revoke URL to free memory
          if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ height: "80vh", padding: 0, overflow: "hidden" }}>
          {pdfPreviewUrl && (
            <Box sx={{ width: "100%", height: "100%" }}>
              <object
                data={pdfPreviewUrl}
                // data={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                width="100%"
                height="100%"
              >
                <Typography sx={{ p: 2 }}>
                  Your browser does not support PDFs.
                  <a href={pdfPreviewUrl} download="preview.pdf">
                    Download the PDF
                  </a>
                  .
                </Typography>
              </object>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPdfPreviewUrl(null)}>Close</Button>
          <Button
            onClick={handleShare}
            endIcon={<IosShareIcon />}
            color="primary"
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
