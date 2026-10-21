"use client";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CompareIcon from "@mui/icons-material/Compare";
import IosShareIcon from "@mui/icons-material/IosShare";
import { pdf } from "@react-pdf/renderer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  // useFormContext,
} from "react-hook-form";
import {
  ComparePreApprovalFormData,
  ComparePreApprovalSchema,
} from "@/api/models/ComparePreApprovalSchema";
import LoanProgramItem from "@/components/Forms/CompareForms/LoanProgramItem";
import { zodResolver } from "@hookform/resolvers/zod";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState } from "react";
import { useEffect } from "react";
// import { useSearchParams } from "next/navigation";
import {
  // useCreateBorrowerInfo,
  // useCreateBorrowersIncomeData,
  // useCreateLoanProgram,
  useCreatePreApproval,
  // useCreatePurchaseInfo,
  useGetMultiplePreApprovalById,
} from "@/api/reactQueriesHooks/usePreApproval";
import PurchaseInfoItem from "@/components/Forms/CompareForms/PurchaseInfoItem";
import BorrowerInfoItem from "@/components/Forms/CompareForms/BorrowerInfoItem";
import BorrowsIncomeDataItem from "@/components/Forms/CompareForms/BorrowsIncomeDataItem";
import {
  BorrowerIncomeEntry,
  DebtEntry,
} from "@/api/models/compare/BorrowersInncomeDataFormTypes";
import PrepaidItemsItem from "@/components/Forms/CompareForms/PrepaidItemsItem";
import MiscFeesItem from "@/components/Forms/CompareForms/MiscFeesItem";
import LenderFeesItem from "@/components/Forms/CompareForms/LenderFeesItem";
import { ComparisonPDF } from "@/components/PDFViews/Comparison";

export default function ComparePreApprovals() {
  // const [isFormInitialized, setIsFormInitialized] = useState(false);
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  // const [open, setOpen] = useState(false);
  // const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  // const [isLoading, setLoading] = useState(true);
  // const [isloading, setIsloading] = useState(false);
  // const [ids, setIds] = useState<string[]>([]);
  // const [isPDFbuttondisabled, setIsPDFbuttondisabled] = useState(true);
  // // parse ids from query string on client only and avoid state updates during render
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   setIds(params.get("ids")?.split(",") || []);
  // }, []);

  // const fetchedDataQueries = useGetMultiplePreApprovalById(ids);
  // const fetchedData = fetchedDataQueries.map((query) => query.data?.data);

  // // Find this function in your code
  // const refetchAll = async () => {
  //   const results = await Promise.all(
  //     fetchedDataQueries.map((query) => query.refetch())
  //   );
  //   // Extract the fresh data directly from the refetch result
  //   return results.map((result) => result.data?.data);
  // };

  // const methods = useForm<ComparePreApprovalFormData>({
  //   resolver: zodResolver(ComparePreApprovalSchema),
  //   defaultValues: {
  //     loanProgram: {
  //       Inputs: [],
  //     },
  //   },
  // });
  // const {
  //   control,
  //   // setValue,
  //   // getValues,
  //   formState: { errors, isDirty },
  // } = methods;

  // const { fields } = useFieldArray({
  //   control,
  //   name: "loanProgram.Inputs",
  // });

  // useEffect(() => {
  //   if (isFormInitialized || fetchedData.every((data) => !data)) {
  //     return;
  //   }

  //   const allFetched = fetchedData.every((data) => data);

  //   if (allFetched) {
  //     setIsPDFbuttondisabled(false);
  //     const combinedInputs = fetchedData.map((formatedFetchedData) => {
  //       return {
  //         preapprovalDetail: {
  //           userId: formatedFetchedData.userId,
  //           preApprovalId: formatedFetchedData.id,
  //           createdAt: formatedFetchedData.createdAt,
  //           updatedAt: formatedFetchedData.updatedAt,
  //         },
  //         borrowerInfo: {
  //           preApprovalId: formatedFetchedData.id,
  //           borrowerName: formatedFetchedData.borrowerInfo.borrowerName ?? "",
  //           coBorrowerName:
  //             formatedFetchedData.borrowerInfo.coBorrowerName ?? "",
  //           ficoScore: formatedFetchedData.borrowerInfo.ficoScore ?? undefined,
  //           coBorrowerFicoScore:
  //             formatedFetchedData.borrowerInfo.coBorrowerFicoScore ?? undefined,
  //           borrowerCellNumber:
  //             formatedFetchedData.borrowerInfo.borrowerCellNumber ?? "",
  //           coBorrowerCellNumber:
  //             formatedFetchedData.borrowerInfo.coBorrowerCellNumber ?? "",
  //           borrowerEmail: formatedFetchedData.borrowerInfo.borrowerEmail ?? "",
  //         },
  //         purchaseInfo: {
  //           preApprovalId: formatedFetchedData.id,
  //           loanProgram: String(
  //             formatedFetchedData.purchaseInfo?.loanProgram ?? ""
  //           ),
  //           propertyType: String(
  //             formatedFetchedData.purchaseInfo?.propertyType ?? ""
  //           ),
  //           occupancyStatus: String(
  //             formatedFetchedData.purchaseInfo?.occupancyStatus ?? ""
  //           ),
  //           purchasePrice:
  //             formatedFetchedData.purchaseInfo?.purchasePrice ?? "",
  //           downPayment: formatedFetchedData.purchaseInfo?.downPayment ?? 0,
  //           loanAmount: formatedFetchedData.purchaseInfo?.loanAmount ?? "",
  //           annualInterestRate:
  //             formatedFetchedData.purchaseInfo?.annualInterestRate ?? "",
  //           mipFundingFee: formatedFetchedData.purchaseInfo?.mipFundingFee
  //             ? formatedFetchedData.purchaseInfo.mipFundingFee
  //             : formatedFetchedData.purchaseInfo?.loanProgram == 3
  //             ? 1.75
  //             : 0,
  //           hazardInsurance:
  //             formatedFetchedData.purchaseInfo?.hazardInsurance ?? 150,
  //           associationFee:
  //             formatedFetchedData.purchaseInfo?.associationFee ?? 0,
  //           miPercent: formatedFetchedData.purchaseInfo?.miPercent ?? 0,
  //         },
  //         lenderFees: {
  //           agentName: formatedFetchedData.lenderFees?.agentName ?? "",
  //           loanOriginationFee:
  //             formatedFetchedData.lenderFees?.loanOriginationFee ?? 0,
  //           loanOriginationFeePercentage:
  //             formatedFetchedData.lenderFees?.loanOriginationFeePercentage ?? 0,
  //           discountFeePercentage:
  //             formatedFetchedData.lenderFees?.discountFeePercentage ?? 0,
  //           discountFee: formatedFetchedData.lenderFees?.discountFee ?? 0,
  //           upfrontMipPercentage: formatedFetchedData.lenderFees
  //             ?.upfrontMipPercentage
  //             ? formatedFetchedData.lenderFees.upfrontMipPercentage
  //             : formatedFetchedData.purchaseInfo?.loanProgram == 3
  //             ? 1.75
  //             : 0,
  //           upfrontMip: formatedFetchedData.lenderFees?.upfrontMip ?? 0,
  //           appraisalFee: formatedFetchedData.lenderFees?.appraisalFee ?? 800,
  //           escrowFees: formatedFetchedData.lenderFees?.escrowFees ?? 3000,
  //           titleFees: formatedFetchedData.lenderFees?.titleFees ?? 3000,
  //           thirdPartyLenderFee:
  //             formatedFetchedData.lenderFees?.thirdPartyLenderFee ?? 2495,
  //         },
  //         prepaidItems: {
  //           prepaidInterestDays:
  //             formatedFetchedData.prepaidItems?.prepaidInterestDays ??
  //             getDaysLeftInMonth(),
  //           prepaidInterestAmount:
  //             formatedFetchedData.prepaidItems?.prepaidInterestAmount ?? "",
  //           hazardInsurance:
  //             formatedFetchedData.prepaidItems?.hazardInsurance ?? 1800,
  //           hazardInsuranceMonths:
  //             formatedFetchedData.prepaidItems?.hazardInsuranceMonths ?? 6,
  //           hazardInsuranceReserves:
  //             formatedFetchedData.prepaidItems?.hazardInsuranceReserves ?? 900,
  //           propertyTaxMonths:
  //             formatedFetchedData.prepaidItems?.propertyTaxMonths ?? 6,
  //           propertyTaxAmount:
  //             formatedFetchedData.prepaidItems?.propertyTaxAmount ?? "",
  //         },
  //         miscFees: {
  //           earnestMoneyDeposit:
  //             formatedFetchedData.miscFees?.earnestMoneyDeposit ?? 0,
  //           sellerCredit: formatedFetchedData.miscFees?.sellerCredit ?? 0,
  //           lenderCredit: formatedFetchedData.miscFees?.lenderCredit ?? 0,
  //           miscFee4: formatedFetchedData.miscFees?.miscFee4 ?? 0,
  //         },
  //         borrowersIncomeData: {
  //           preApprovalId: formatedFetchedData.id,
  //           borrowerIncome: formatedFetchedData.borrowerIncomes?.map(
  //             (income: BorrowerIncomeEntry): BorrowerIncomeEntry => ({
  //               borrowerName: income.borrowerName ?? "",
  //               ficoScore:
  //                 income.ficoScore ??
  //                 formatedFetchedData.borrowerInfo.ficoScore,
  //               monthlyIncome: income.monthlyIncome ?? undefined,
  //               debts:
  //                 income.debts?.map(
  //                   (debt: DebtEntry): DebtEntry => ({
  //                     debtType: String(debt.debtType) ?? "3",
  //                     balance: debt.balance ?? undefined,
  //                     monthlyPayment: debt.monthlyPayment ?? undefined,
  //                   })
  //                 ) ?? [],
  //             })
  //           ) ?? [
  //             {
  //               borrowerName: formatedFetchedData.borrowerInfo.borrowerName,
  //               ficoScore: formatedFetchedData.borrowerInfo.ficoScore,
  //               monthlyIncome: 0,
  //               debts: [],
  //             },
  //           ],
  //         },
  //         loanProgram: {
  //           preApprovalId: formatedFetchedData.id,
  //           // loanProgram: String(
  //           //   formatedFetchedData.loanProgram?.loanProgram ??
  //           //     borrowerInfoLoanProgram
  //           // ),
  //           frontEndRatio: formatedFetchedData.loanProgram?.frontEndRatio ?? 0,
  //           backEndRatio: formatedFetchedData.loanProgram?.backEndRatio ?? 0,
  //           // price:
  //           //   formatedFetchedData.loanProgram?.price ?? purchaseInfoPurchasePrice,
  //           // interestRate:
  //           //   formatedFetchedData.loanProgram?.interestRate ??
  //           //   purchaseInfoAnnualInterestRate,
  //           baseLoanAmount:
  //             formatedFetchedData.loanProgram?.baseLoanAmount ?? 0,
  //           upmipAmount: formatedFetchedData.loanProgram?.upmipAmount ?? 0,
  //           // upmipRate: formatedFetchedData.loanProgram?.upmipRate ?? 1.75,
  //           // annualMIPRate: formatedFetchedData.loanProgram?.annualMIPRate ?? 0,
  //           finalLoanAmount:
  //             formatedFetchedData.loanProgram?.finalLoanAmount ?? 0,
  //           mmi: formatedFetchedData.loanProgram?.mmi ?? 0,
  //           term: formatedFetchedData.loanProgram?.term ?? 30,
  //           // downPaymentPercentage:
  //           //   formatedFetchedData.loanProgram?.downPaymentPercentage ??
  //           //   purchaseInfoDownPayment,
  //           downPaymentAmount:
  //             formatedFetchedData.loanProgram?.downPaymentAmount ?? 0,
  //           clearingCart: formatedFetchedData.loanProgram?.clearingCart ?? 0,
  //           propertyTax: formatedFetchedData.loanProgram?.propertyTax ?? 0,
  //           totalNeededToClear:
  //             formatedFetchedData.loanProgram?.totalNeededToClear ?? 0,
  //           principalAndInterest:
  //             formatedFetchedData.loanProgram?.principalAndInterest ?? 0,
  //           monthlyPropertyTaxPercentage:
  //             formatedFetchedData.loanProgram?.monthlyPropertyTaxPercentage ??
  //             1.25,
  //           monthlyPropertyTax:
  //             formatedFetchedData.loanProgram?.monthlyPropertyTax ?? 0,
  //           hazardInsurance:
  //             formatedFetchedData.loanProgram?.hazardInsurance ?? 0,
  //           mortgageInsurance:
  //             formatedFetchedData.loanProgram?.mortgageInsurance ?? 0,
  //           monthlyTotal: formatedFetchedData.loanProgram?.monthlyTotal ?? 0,
  //         },
  //       };
  //     });

  //     console.log(combinedInputs);

  //     methods.reset({
  //       preapprovalDetail: {
  //         Inputs: combinedInputs.map((item) => item.preapprovalDetail),
  //       },
  //       borrowerInfo: {
  //         Inputs: combinedInputs.map((item) => item.borrowerInfo),
  //       },
  //       purchaseInfo: {
  //         Inputs: combinedInputs.map((item) => item.purchaseInfo),
  //       },
  //       lenderFees: {
  //         Inputs: combinedInputs.map((item) => item.lenderFees),
  //       },
  //       prepaidItems: {
  //         Inputs: combinedInputs.map((item) => item.prepaidItems),
  //       },
  //       miscFees: {
  //         Inputs: combinedInputs.map((item) => item.miscFees),
  //       },
  //       borrowersIncomeData: {
  //         Inputs: combinedInputs.map((item) => item.borrowersIncomeData),
  //       },
  //       loanProgram: {
  //         Inputs: combinedInputs.map((item) => item.loanProgram),
  //       },
  //     });

  //     setIsFormInitialized(true);

  //     setLoading(false);
  //   }
  // }, [fetchedData, isFormInitialized, methods]);

  // useEffect(() => {
  //   if (fields && fields.length > 0) {
  //     setLoading(false);
  //   }
  // }, [fields]);

  // const { mutateAsync: submitPreApproval } = useCreatePreApproval();
  // // const { mutateAsync: submitBorrowerInfo } = useCreateBorrowerInfo();
  // // const { mutateAsync: submitPurchaseInfo } = useCreatePurchaseInfo();
  // // const { mutateAsync: submitBorrowersIncomeData } =
  // //   useCreateBorrowersIncomeData();
  // // const { mutateAsync: submitLoanProgram } = useCreateLoanProgram();

  // const handleSubmitForm = async () => {
  //   const {
  //     preapprovalDetail,
  //     borrowerInfo,
  //     purchaseInfo,
  //     lenderFees,
  //     prepaidItems,
  //     miscFees,
  //     borrowersIncomeData,
  //     loanProgram,
  //   } = methods.getValues();

  //   console.log(methods.getValues());

  //   try {
  //     const isValid = await methods.trigger("loanProgram.Inputs");
  //     const isPurchaseInfoValid = await methods.trigger("purchaseInfo.Inputs");
  //     const isborrowersIncomeDataValid = await methods.trigger(
  //       "borrowersIncomeData.Inputs"
  //     );
  //     if (!isValid || !isPurchaseInfoValid || !isborrowersIncomeDataValid)
  //       return;
  //     setIsloading(true);

  //     for (let i = 0; i < loanProgram.Inputs.length; i++) {
  //       const preapproval = preapprovalDetail.Inputs[i];
  //       const borrower = borrowerInfo.Inputs[i];
  //       const purchase = purchaseInfo.Inputs[i];
  //       const lender = lenderFees.Inputs[i];
  //       const prepaid = prepaidItems.Inputs[i];
  //       const misc = miscFees.Inputs[i];
  //       const borrowersIncome = borrowersIncomeData.Inputs[i];
  //       const loan = loanProgram.Inputs[i];

  //       const preapprovalDetailpayload = {
  //         userId: preapproval.userId,
  //         id: preapproval.preApprovalId,
  //         createdAt: preapproval.createdAt,
  //         updatedAt: preapproval.updatedAt,
  //       };

  //       const borrowerInfopayload = {
  //         preApprovalId: loan.preApprovalId,
  //         createdAt: preapprovalDetailpayload.createdAt,
  //         updatedAt: getFormattedDate(),
  //         borrowerName: borrower.borrowerName,
  //         coBorrowerName: borrower.coBorrowerName,
  //         ficoScore: Number(borrower.ficoScore),
  //         coBorrowerFicoScore: Number(borrower.coBorrowerFicoScore),
  //         borrowerCellNumber: borrower.borrowerCellNumber,
  //         coBorrowerCellNumber: borrower.coBorrowerCellNumber,
  //         borrowerEmail: borrower.borrowerEmail,
  //       };

  //       const purchaseInfopayload = {
  //         preApprovalId: loan.preApprovalId,
  //         createdAt: preapprovalDetailpayload.createdAt,
  //         updatedAt: getFormattedDate(),
  //         loanProgram: purchase.loanProgram,
  //         propertyType: purchase.propertyType,
  //         occupancyStatus: purchase.occupancyStatus,
  //         purchasePrice: purchase.purchasePrice,
  //         downPayment: purchase.downPayment,
  //         loanAmount: purchase.loanAmount,
  //         annualInterestRate: purchase.annualInterestRate,
  //         mipFundingFee: purchase.mipFundingFee,
  //         hazardInsurance: purchase.hazardInsurance,
  //         associationFee: purchase.associationFee,
  //         miPercent: purchase.miPercent,
  //       };

  //       const lenderFeespayload = {
  //         preApprovalId: loan.preApprovalId,
  //         createdAt: preapprovalDetailpayload.createdAt,
  //         updatedAt: getFormattedDate(),
  //         agentName: lender.agentName,
  //         loanOriginationFeePercentage: lender.loanOriginationFeePercentage,
  //         loanOriginationFee: lender.loanOriginationFee,
  //         discountFeePercentage: lender.discountFeePercentage,
  //         discountFee: lender.discountFee,
  //         upfrontMipPercentage: lender.upfrontMipPercentage,
  //         upfrontMip: lender.upfrontMip,
  //         appraisalFee: lender.appraisalFee,
  //         escrowFees: lender.escrowFees,
  //         titleFees: lender.titleFees,
  //         thirdPartyLenderFee: lender.thirdPartyLenderFee,
  //       };

  //       const prepaidItemspayload = {
  //         preApprovalId: loan.preApprovalId,
  //         createdAt: preapprovalDetailpayload.createdAt,
  //         updatedAt: getFormattedDate(),
  //         prepaidInterestDays: prepaid.prepaidInterestDays,
  //         prepaidInterestAmount: prepaid.prepaidInterestAmount,
  //         hazardInsurance: prepaid.hazardInsurance,
  //         hazardInsuranceMonths: prepaid.hazardInsuranceMonths,
  //         hazardInsuranceReserves: prepaid.hazardInsuranceReserves,
  //         propertyTaxMonths: prepaid.propertyTaxMonths,
  //         propertyTaxAmount: prepaid.propertyTaxAmount,
  //       };

  //       const miscFeespayload = {
  //         preApprovalId: loan.preApprovalId,
  //         createdAt: preapprovalDetailpayload.createdAt,
  //         updatedAt: getFormattedDate(),
  //         earnestMoneyDeposit: misc.earnestMoneyDeposit,
  //         sellerCredit: misc.sellerCredit,
  //         lenderCredit: misc.lenderCredit,
  //         miscFee4: misc.miscFee4,
  //       };

  //       const borrowersIncomeDatapayload = borrowersIncome.borrowerIncome.map(
  //         (entry) => ({
  //           preApprovalId: loan.preApprovalId ?? null,
  //           createdAt: preapprovalDetailpayload.createdAt,
  //           updatedAt: getFormattedDate(),
  //           borrowerName: entry.borrowerName,
  //           ficoScore: entry.ficoScore,
  //           monthlyIncome: entry.monthlyIncome,
  //           debts: entry.debts.map((debt) => ({
  //             preApprovalId: loan.preApprovalId ?? null,
  //             createdAt: preapprovalDetailpayload.createdAt,
  //             updatedAt: getFormattedDate(),
  //             debtType: Number(debt.debtType), // if it's a string and needs to be number
  //             balance: Number(debt.balance),
  //             monthlyPayment: Number(debt.monthlyPayment),
  //           })),
  //         })
  //       );

  //       const loanProgrampayload = {
  //         preApprovalId: loan.preApprovalId,
  //         createdAt: preapprovalDetailpayload.createdAt,
  //         updatedAt: getFormattedDate(),
  //         loanProgram: purchase.loanProgram,
  //         frontEndRatio: loan.frontEndRatio,
  //         backEndRatio: loan.backEndRatio,
  //         // price: loan.price,
  //         price: purchase.purchasePrice,
  //         // interestRate: loan.interestRate,
  //         interestRate: purchase.annualInterestRate,
  //         baseLoanAmount: loan.baseLoanAmount,
  //         upmipRate: lender.upfrontMipPercentage,
  //         upmipAmount: loan.upmipAmount,
  //         finalLoanAmount: loan.finalLoanAmount,
  //         mmi: loan.mmi,
  //         term: loan.term,
  //         downPaymentAmount: loan.downPaymentAmount,
  //         // downPaymentPercentage: loan.downPaymentPercentage,
  //         downPaymentPercentage: purchase.downPayment,
  //         clearingCart: loan.clearingCart,
  //         propertyTax: loan.propertyTax,
  //         totalNeededToClear: loan.totalNeededToClear,
  //         principalAndInterest: loan.principalAndInterest,
  //         monthlyPropertyTaxPercentage: loan.monthlyPropertyTaxPercentage,
  //         monthlyPropertyTax: loan.monthlyPropertyTax,
  //         hazardInsurance: loan.hazardInsurance,
  //         mortgageInsurance: loan.mortgageInsurance,
  //         hoaFee: purchase.associationFee,
  //         monthlyTotal: loan.monthlyTotal,
  //         annualMIPRate: purchase.mipFundingFee,
  //         borrowers: loan.borrowers.map((borrower) => ({
  //           monthlyIncome: borrower.monthlyIncome,
  //           debts: borrower.debts,
  //           ficoScore: borrower.ficoScore,
  //         })),
  //       };

  //       const preApprovalData = {
  //         userId: preapprovalDetailpayload.userId,
  //         id: preapprovalDetailpayload.id,
  //         createdAt: preapprovalDetailpayload.createdAt,
  //         updatedAt: getFormattedDate(),
  //         lastSubmittedFormNo: 7,
  //         borrowerInfo: borrowerInfopayload,
  //         purchaseInfo: purchaseInfopayload,
  //         lenderFees: lenderFeespayload,
  //         prepaidItems: prepaidItemspayload,
  //         miscFees: miscFeespayload,
  //         borrowerIncomes: borrowersIncomeDatapayload,
  //         loanProgram: loanProgrampayload,
  //       };

  //       await submitPreApproval(preApprovalData);
  //     }
  //     const currentValues = methods.getValues(); // or use getValues from useFormContext
  //     methods.reset(currentValues);
  //     setIsloading(false);
  //     setIsPDFbuttondisabled(false);
  //   } catch (err) {
  //     console.error("Form submission failed:", err);
  //     // handleError();
  //   }
  // };

  // function getDaysLeftInMonth() {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = today.getMonth();

  //   // Get the last day of the current month
  //   const lastDay = new Date(year, month + 1, 0).getDate();

  //   // Days left = last day - today's date
  //   return lastDay - today.getDate();
  // }

  // function getFormattedDate() {
  //   const date = new Date();
  //   const iso = date.toISOString(); // e.g., "2025-11-26T16:45:34.378Z"

  //   // Trim milliseconds to 2 digits → ".37Z"
  //   return iso.replace(/(\.\d{2})\dZ$/, "$1Z");
  // }

  // const loanProgramNames = {
  //   "1": "Non QM",
  //   "2": "Conventional",
  //   "3": "FHA",
  // };

  // // const propertyTypes = {
  // //   "1": "SFR",
  // //   "2": "2 Units",
  // //   "3": "3 Units",
  // //   "4": "4 Units",
  // //   "5": "Condo/Townhome",
  // // };

  // // const occupancyStatuses = {
  // //   "1": "Owner Occupied",
  // //   "2": "2nd Home",
  // //   "3": "Investment",
  // // };

  // const [FHAGFEloading, setFHAGFELoading] = useState(false);

  // const [selectedPdf] = useState("compare");
  // const [pdfName, setPdfName] = useState("Compare Document");

  // const handleGenerate = (pdfname: string, language: string) => {
  //   const preApprovalIds = ids;
  //   if (selectedPdf === "compare") {
  //     if (preApprovalIds.length > 0) {
  //       generateFHAGFE(preApprovalIds, pdfname, language);
  //     }
  //   }
  // };

  // const isGeneratingLoading = selectedPdf === "compare" && FHAGFEloading;

  // const generateFHAGFE = async (
  //   preApprovalIds: object,
  //   pdfName: string,
  //   language: string
  // ) => {
  //   console.log(preApprovalIds);
  //   console.log(pdfName);
  //   console.log(language);

  //   setFHAGFELoading(true);

  //   try {
  //     type ComparisonDataType = {
  //       loanProgram: (string | number)[];
  //       price: (string | number)[];
  //       annualInterestRate: (string | number)[];
  //       loanAmount: (string | number)[];
  //       upmipRate: (string | number)[];
  //       upmipAmount: (string | number)[];
  //       annualMIPRate: (string | number)[];
  //       finalLoanAmount: (string | number)[];
  //       mmi: (string | number)[];
  //       term: (string | number)[];
  //       principalAndInterest: (string | number)[];
  //       monthlyPropertyTax: (string | number)[];
  //       hazardInsurance: (string | number)[];
  //       mortgageInsurance: (string | number)[];
  //       associationFee: (string | number)[];
  //       monthlyTotal: (string | number)[];
  //       downPayment: (string | number)[];
  //       downPaymentAmount: (string | number)[];
  //       clearingCart: (string | number)[];
  //       propertyTax: (string | number)[];
  //       totalNeededToClear: (string | number)[];
  //     };
  //     const ComparisonData: ComparisonDataType = {
  //       loanProgram: [],
  //       price: [],
  //       annualInterestRate: [],
  //       loanAmount: [],
  //       upmipRate: [],
  //       upmipAmount: [],
  //       annualMIPRate: [],
  //       finalLoanAmount: [],
  //       mmi: [],
  //       term: [],
  //       principalAndInterest: [],
  //       monthlyPropertyTax: [],
  //       hazardInsurance: [],
  //       mortgageInsurance: [],
  //       associationFee: [],
  //       monthlyTotal: [],
  //       downPayment: [],
  //       downPaymentAmount: [],
  //       clearingCart: [],
  //       propertyTax: [],
  //       totalNeededToClear: [],
  //     };
  //     const response = await refetchAll();
  //     response.forEach((data) => {
  //       console.log(data);

  //       ComparisonData.loanProgram.push(
  //         loanProgramNames[
  //           data.purchaseInfo.loanProgram as keyof typeof loanProgramNames
  //         ] || ""
  //       );
  //       ComparisonData.price.push(
  //         formatAmount(data.purchaseInfo.purchasePrice)
  //       );
  //       ComparisonData.annualInterestRate.push(
  //         data.purchaseInfo.annualInterestRate
  //       );
  //       ComparisonData.loanAmount.push(
  //         formatAmount(data.purchaseInfo.loanAmount)
  //       );
  //       ComparisonData.upmipRate.push(data.lenderFees.upfrontMipPercentage);
  //       ComparisonData.upmipAmount.push(
  //         formatAmount(data.loanProgram.upmipAmount)
  //       );
  //       ComparisonData.annualMIPRate.push(data.loanProgram.annualMIPRate);
  //       ComparisonData.finalLoanAmount.push(
  //         formatAmount(data.loanProgram.finalLoanAmount)
  //       );
  //       ComparisonData.mmi.push(formatAmount(data.loanProgram.mmi));
  //       ComparisonData.term.push(data.loanProgram.term);
  //       ComparisonData.principalAndInterest.push(
  //         formatAmount(data.loanProgram.principalAndInterest)
  //       );
  //       ComparisonData.monthlyPropertyTax.push(
  //         formatAmount(data.loanProgram.monthlyPropertyTax)
  //       );
  //       ComparisonData.hazardInsurance.push(
  //         formatAmount(data.loanProgram.hazardInsurance)
  //       );
  //       ComparisonData.mortgageInsurance.push(
  //         formatAmount(data.loanProgram.mortgageInsurance)
  //       );
  //       ComparisonData.associationFee.push(
  //         formatAmount(data.purchaseInfo.associationFee)
  //       );
  //       ComparisonData.monthlyTotal.push(
  //         formatAmount(data.loanProgram.monthlyTotal)
  //       );
  //       ComparisonData.downPayment.push(data.purchaseInfo.downPayment);
  //       ComparisonData.downPaymentAmount.push(
  //         formatAmount(data.loanProgram.downPaymentAmount)
  //       );
  //       ComparisonData.clearingCart.push(
  //         formatAmount(data.loanProgram.clearingCart)
  //       );
  //       ComparisonData.propertyTax.push(
  //         formatAmount(data.loanProgram.propertyTax)
  //       );
  //       ComparisonData.totalNeededToClear.push(
  //         formatAmount(data.loanProgram.totalNeededToClear)
  //       );
  //     });
  //     console.log(ComparisonData);

  //     const blob = await pdf(<ComparisonPDF data={ComparisonData} />).toBlob();
  //     const url = URL.createObjectURL(blob);
  //     setPdfPreviewUrl(url);
  //   } catch (err) {
  //     console.error("PDF generation failed", err);
  //   } finally {
  //     setFHAGFELoading(false);
  //   }

  //   // Simulate async action
  //   setTimeout(() => {
  //     setFHAGFELoading(false);
  //   }, 2000);
  // };

  // // const formatDate = (dateString: string): string => {
  // //   const date = new Date(dateString);

  // //   // Get month, day, and year
  // //   const month = date.getMonth() + 1; // Months are 0-based
  // //   const day = date.getDate();
  // //   const year = date.getFullYear() % 100; // Last two digits

  // //   return `${month}/${day}/${year}`;
  // // };

  // function formatAmount(amount: number) {
  //   if (isNaN(amount)) return "0.00";
  //   return Number(amount).toLocaleString("en-US", {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   });
  // }

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };

  // const handleSubmit = () => {
  //   const form = document.getElementById("pdfname-form") as HTMLDivElement;

  //   // Cast the NodeList so TypeScript knows these are Inputs or Selects
  //   const inputs = form.querySelectorAll("input, select");

  //   // Fix 1: Define specific types for the values (string or boolean)
  //   const data: Record<string, string | boolean> = {};

  //   // Fix 2: Type 'el' as HTMLInputElement to access .name, .type, .checked, and .value
  //   inputs.forEach((el) => {
  //     const inputEl = el as HTMLInputElement;
  //     data[inputEl.name] =
  //       inputEl.type === "checkbox" ? inputEl.checked : inputEl.value;
  //   });

  //   // Note: data.pdfname might be boolean technically, so you might need to cast it to string
  //   // if you are sure it's a text input, or use String(data.pdfname)
  //   const pdfname = data.pdfname as string;
  //   const language = data.language ? "on" : "off";

  //   handleGenerate(pdfname, language);
  //   handleClose();
  // };

  // const handleShare = async () => {
  //   if (!pdfPreviewUrl) return;

  //   try {
  //     // 1. Convert the Blob URL back into a Blob/File object
  //     const response = await fetch(pdfPreviewUrl);
  //     const blob = await response.blob();
  //     const file = new File([blob], `${pdfName}.pdf`, {
  //       type: "application/pdf",
  //     });

  //     // 2. Check if the browser supports sharing files
  //     if (
  //       navigator.share &&
  //       navigator.canShare &&
  //       navigator.canShare({ files: [file] })
  //     ) {
  //       await navigator.share({
  //         files: [file],
  //         title: "Exported PDF",
  //         text: "Here is the PDF document you requested.",
  //       });
  //     } else {
  //       // 3. Fallback: If native sharing isn't supported (e.g., some desktop browsers),
  //       // trigger a standard download.
  //       const link = document.createElement("a");
  //       link.href = pdfPreviewUrl;
  //       link.download = `${pdfName}.pdf`;
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     }
  //   } catch (error) {
  //     console.log("Error sharing:", error);
  //   }
  // };

  return (<></>
    // <ProtectedRoute>
    //   <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
    //     {/* Header */}
    //     <AppBar
    //       position="static"
    //       sx={{
    //         position: "fixed",
    //         top: 0,
    //         bgcolor: "white",
    //         boxShadow: "none",
    //         zIndex: (theme) => theme.zIndex.drawer,
    //       }}
    //     >
    //       <Toolbar sx={{ px: 2, minHeight: 56 }}>
    //         <Box
    //           sx={{
    //             display: "flex",
    //             alignItems: "center",
    //             justifyContent: "space-between",
    //             width: "100%",
    //           }}
    //         >
    //           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    //             <Link href="/top-opportunities?compare=true" passHref>
    //               <IconButton size="small" sx={{ color: "black" }}>
    //                 <ArrowBackIcon fontSize="medium" />
    //               </IconButton>
    //             </Link>
    //             <Typography
    //               sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
    //             >
    //               Comparison
    //             </Typography>
    //           </Box>
    //           <Box>
    //             <Button
    //               onClick={handleClickOpen}
    //               fullWidth
    //               disabled={
    //                 isGeneratingLoading || isDirty || isPDFbuttondisabled
    //               }
    //               variant="contained"
    //               sx={{
    //                 bgcolor: "#ff453b",
    //                 borderRadius: 3,
    //                 px: 0.75,
    //                 display: "flex",
    //                 alignItems: "center",
    //                 justifyContent: "center",
    //               }}
    //             >
    //               {isGeneratingLoading ? (
    //                 <CircularProgress size={24} sx={{ color: "#ff453b" }} />
    //               ) : (
    //                 <CompareIcon
    //                   sx={{
    //                     color: isDirty ? "rgba(0, 0, 0, 0.26)" : "white",
    //                     fontSize: 28,
    //                   }}
    //                 />
    //               )}
    //             </Button>
    //           </Box>
    //         </Box>
    //       </Toolbar>
    //     </AppBar>

    //     <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
    //       <Box mx="auto" bgcolor="#fbeac8" minHeight="100vh">
    //         <FormProvider {...methods}>
    //           <form
    //             onSubmit={(e) => {
    //               e.preventDefault();
    //               handleSubmitForm();
    //             }}
    //           >
    //             {/* {fields.map((field, index) => (
    //               <LoanProgramItem
    //                 key={field.id}
    //                 index={index}
    //                 control={control}
    //                 errors={errors}
    //               />
    //             ))} */}
    //             <Box sx={{ width: "100%" }}>
    //               {isLoading ? (
    //                 <Typography sx={{ textAlign: "center", py: 2 }}>
    //                   Loading...
    //                 </Typography>
    //               ) : (
    //                 <Slider
    //                   dots={true}
    //                   infinite={false}
    //                   speed={500}
    //                   slidesToShow={isMobile ? 1 : isTablet ? 2 : 4}
    //                   slidesToScroll={1}
    //                   arrows={true}
    //                   responsive={[
    //                     {
    //                       breakpoint: 1024,
    //                       settings: {
    //                         slidesToShow: 2,
    //                         slidesToScroll: 1,
    //                         arrows: true,
    //                       },
    //                     },
    //                     {
    //                       breakpoint: 600,
    //                       settings: {
    //                         slidesToShow: 1,
    //                         slidesToScroll: 1,
    //                         arrows: true,
    //                         dots: true,
    //                       },
    //                     },
    //                   ]}
    //                 >
    //                   {fields.map((field, index) => (
    //                     <Box
    //                       key={field.id}
    //                       sx={{
    //                         px: 1,
    //                         boxSizing: "border-box",
    //                       }}
    //                     >
    //                       <Box sx={{ display: "none" }}>
    //                         <Controller
    //                           name={`preapprovalDetail.Inputs.${index}.userId`}
    //                           control={control}
    //                           render={({ field }) => (
    //                             <TextField
    //                               {...field}
    //                               fullWidth
    //                               label=""
    //                               error={
    //                                 !!errors.preapprovalDetail?.Inputs?.[index]
    //                                   ?.userId
    //                               }
    //                               helperText={
    //                                 errors.preapprovalDetail?.Inputs?.[index]
    //                                   ?.userId?.message
    //                               }
    //                             />
    //                           )}
    //                         />
    //                         <Controller
    //                           name={`preapprovalDetail.Inputs.${index}.preApprovalId`}
    //                           control={control}
    //                           render={({ field }) => (
    //                             <TextField
    //                               {...field}
    //                               fullWidth
    //                               label=""
    //                               error={
    //                                 !!errors.preapprovalDetail?.Inputs?.[index]
    //                                   ?.preApprovalId
    //                               }
    //                               helperText={
    //                                 errors.preapprovalDetail?.Inputs?.[index]
    //                                   ?.preApprovalId?.message
    //                               }
    //                             />
    //                           )}
    //                         />
    //                         <Controller
    //                           name={`preapprovalDetail.Inputs.${index}.createdAt`}
    //                           control={control}
    //                           render={({ field }) => (
    //                             <TextField
    //                               {...field}
    //                               fullWidth
    //                               label=""
    //                               error={
    //                                 !!errors.preapprovalDetail?.Inputs?.[index]
    //                                   ?.createdAt
    //                               }
    //                               helperText={
    //                                 errors.preapprovalDetail?.Inputs?.[index]
    //                                   ?.createdAt?.message
    //                               }
    //                             />
    //                           )}
    //                         />
    //                         <Controller
    //                           name={`preapprovalDetail.Inputs.${index}.updatedAt`}
    //                           control={control}
    //                           render={({ field }) => (
    //                             <TextField
    //                               {...field}
    //                               fullWidth
    //                               label=""
    //                               error={
    //                                 !!errors.preapprovalDetail?.Inputs?.[index]
    //                                   ?.updatedAt
    //                               }
    //                               helperText={
    //                                 errors.preapprovalDetail?.Inputs?.[index]
    //                                   ?.updatedAt?.message
    //                               }
    //                             />
    //                           )}
    //                         />
    //                       </Box>
    //                       <BorrowerInfoItem
    //                         index={index}
    //                         control={control}
    //                         errors={errors}
    //                       />
    //                       <PurchaseInfoItem
    //                         index={index}
    //                         control={control}
    //                         errors={errors}
    //                       />
    //                       <LenderFeesItem
    //                         index={index}
    //                         control={control}
    //                         errors={errors}
    //                       />
    //                       <PrepaidItemsItem
    //                         index={index}
    //                         control={control}
    //                         errors={errors}
    //                       />
    //                       <MiscFeesItem
    //                         index={index}
    //                         control={control}
    //                         errors={errors}
    //                       />
    //                       <LoanProgramItem
    //                         index={index}
    //                         control={control}
    //                         errors={errors}
    //                       />
    //                       <BorrowsIncomeDataItem
    //                         index={index}
    //                         control={control}
    //                         errors={errors}
    //                         isPDFbuttondisabled={isPDFbuttondisabled}
    //                         isloading={isloading}
    //                       />
    //                     </Box>
    //                   ))}
    //                 </Slider>
    //               )}
    //             </Box>
    //             {/* <Box
    //               sx={{
    //                 position: "fixed",
    //                 bottom: 16,
    //                 left: 0,
    //                 right: 0,
    //                 maxWidth: 420,
    //                 mx: "auto",
    //                 zIndex: 1000,
    //                 px: { xs: 2, sm: 0, md: 0 },
    //               }}
    //             >
    //               <Button
    //                 disabled={isloading}
    //                 fullWidth
    //                 type="submit"
    //                 variant="contained"
    //                 sx={{
    //                   bgcolor: "#ff453b",
    //                   borderRadius: 99,
    //                   py: 1.25,
    //                   mb: 1,
    //                 }}
    //               >
    //                 {isloading ? (
    //                   <CircularProgress size={24} sx={{ color: "#ff453b" }} />
    //                 ) : (
    //                   <Typography
    //                     fontWeight={400}
    //                     color={isloading ? "rgba(0, 0, 0, 0.26)" : "white"}
    //                   >
    //                     SAVE
    //                   </Typography>
    //                 )}
    //               </Button>
    //             </Box> */}
    //           </form>
    //         </FormProvider>
    //       </Box>
    //     </Container>
    //   </Box>
    //   <Dialog
    //     open={open}
    //     onClose={handleClose}
    //     sx={{
    //       "& .MuiDialog-container": {
    //         alignItems: "flex-start", // <--- Aligns dialog to top
    //       },
    //       "& .MuiDialog-paper": {
    //         marginTop: "250px", // Optional spacing from top
    //         maxWidth: "420px",
    //       },
    //     }}
    //   >
    //     <DialogContent>
    //       <Box id="pdfname-form">
    //         <TextField
    //           autoFocus
    //           required
    //           margin="dense"
    //           id="pdfname"
    //           name="pdfname"
    //           label="Document Name"
    //           type="text"
    //           fullWidth
    //           variant="standard"
    //           value={pdfName}
    //           onChange={(e) => setPdfName(e.target.value)}
    //         />
    //         {/* {(selectedPdf === "FHAGFE" || selectedPdf === "quickQuote") && (
    //           <Box
    //             sx={{
    //               display: "flex",
    //               justifyContent: "space-between",
    //               alignItems: "center",
    //             }}
    //           >
    //             <Typography>English</Typography>
    //             <FormGroup>
    //               <FormControlLabel
    //                 sx={{ marginRight: 0, marginLeft: 0 }}
    //                 control={<Android12Switch />}
    //                 label=""
    //                 name="language"
    //               />
    //             </FormGroup>
    //             <Typography>Spanish</Typography>
    //           </Box>
    //         )} */}
    //       </Box>
    //     </DialogContent>
    //     <DialogActions>
    //       <Button
    //         onClick={handleClose}
    //         sx={{
    //           textTransform: "none",
    //           borderRadius: 2,
    //           px: 3,
    //           backgroundColor: "#f5f5f5",
    //           color: "#000",
    //           "&:hover": { backgroundColor: "#e0e0e0" },
    //         }}
    //       >
    //         Cancel
    //       </Button>
    //       <Button
    //         onClick={handleSubmit}
    //         sx={{
    //           textTransform: "none",
    //           borderRadius: 2,
    //           px: 3,
    //           backgroundColor: "#ff453b",
    //           color: "#fff",
    //           "&:hover": { backgroundColor: "#da241bff" },
    //           ml: 2,
    //         }}
    //       >
    //         Generate
    //       </Button>
    //     </DialogActions>
    //   </Dialog>
    //   <Dialog
    //     open={!!pdfPreviewUrl}
    //     onClose={() => {
    //       setPdfPreviewUrl(null);
    //       // Optional: Revoke URL to free memory
    //       if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    //     }}
    //     maxWidth="lg"
    //     fullWidth
    //   >
    //     <DialogContent sx={{ height: "80vh", padding: 0, overflow: "hidden" }}>
    //       {pdfPreviewUrl && (
    //         <Box sx={{ width: "100%", height: "100%" }}>
    //           <object
    //             data={pdfPreviewUrl}
    //             // data={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
    //             type="application/pdf"
    //             width="100%"
    //             height="100%"
    //           >
    //             <Typography sx={{ p: 2 }}>
    //               Your browser does not support PDFs.
    //               <a href={pdfPreviewUrl} download="preview.pdf">
    //                 Download the PDF
    //               </a>
    //               .
    //             </Typography>
    //           </object>
    //         </Box>
    //       )}
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={() => setPdfPreviewUrl(null)}>Close</Button>
    //       <Button
    //         onClick={handleShare}
    //         endIcon={<IosShareIcon />}
    //         color="primary"
    //       >
    //         Export
    //       </Button>
    //     </DialogActions>
    //   </Dialog>
    // </ProtectedRoute>
  );
}
