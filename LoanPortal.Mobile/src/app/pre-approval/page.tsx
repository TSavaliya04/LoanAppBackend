"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Container,
  AppBar,
  Toolbar,
  Button,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Menu,
  Divider,
  Tabs,
  Tab,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import BorrowerInfoForm from "@/components/Forms/PreApprovalForms/BorrowerInfoForm";
import PurchaseInfoForm from "@/components/Forms/PreApprovalForms/PurchaseInfoForm";
import PropertyIncomeOffsetForm from "@/components/Forms/PreApprovalForms/PropertyIncomeOffsetForm";
import LenderFeesForm from "@/components/Forms/PreApprovalForms/LenderFeesForm";
import PrepaidItemsForm from "@/components/Forms/PreApprovalForms/PrepaidItemsForm";
import MiscFeesForm from "@/components/Forms/PreApprovalForms/MiscFeesForm";
import { PresenterToggle } from "@/components/ScenarioCompare/PresenterToggle";
import {
  CombinedPreApprovalFormData,
  combinedPreApprovalSchema,
} from "@/api/models/combinedPreApprovalSchema";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreatePreApproval,
  useGetPreApprovalById,
  useGetPreApprovalByIdOnGenerate,
  useGetPreApprovalByIdOnSubmit,
} from "@/api/reactQueriesHooks/usePreApproval";
import BorrowersIncomeDataForm from "@/components/Forms/PreApprovalForms/BorrowsIncomeDataForm";
import LoanProgramForm from "@/components/Forms/PreApprovalForms/LoanProgramForm";
import {
  BorrowerIncomeEntry,
  DebtEntry,
} from "@/api/models/BorrowersInncomeDataFormTypes";
import {
  BorrowerIncomeEntry as RefinanceBorrowerIncomeEntry,
  DebtEntry as RefinanceDebtEntry,
} from "@/api/models/refinance/BorrowersInncomeDataFormTypes";
import { useSessionStore } from "@/stores/SessionStore";
import {
  usePreApprovalIndexStore,
  usePreApprovalStore,
} from "@/store/usePreApprovalStore";
import { useSnackBarStore } from "@/store/SnackBarStore";
import CustomSnackBar from "@/components/CustomSnackBar";
import { pdf } from "@react-pdf/renderer";
import { FHAGFEPDF } from "@/components/PDFViews/FHAGFEPDF";
import {
  updateChangeStatusPreApproval,
  getFHAGFEReport,
  getpreApprovalReport,
  getquickQuoteReport,
  getRefinancequickQuoteReport,
  getRefinanceFeeWorksheetReport,
  getRefinanceLoanFileReport,
} from "@/api/network/getAllPreApprovals";
import { QuickQuotePDF } from "@/components/PDFViews/QuickQuotePDF";
import { PreApprovalPDF } from "@/components/PDFViews/PreApprovalPDF";
import { getDaysLeftInMonth, getFormattedDate, generateUUID, formatDateOfBirth } from "@/utils/functions";
import dynamic from "next/dynamic";

const MobilePDFViewer = dynamic(
  () => import("@/components/PDFPreview/MobilePDFViewer"),
  { ssr: false }
);
import { ComparisonPDF } from "@/components/PDFViews/Comparison";
import { Delete } from "@mui/icons-material";
import PdfNameDialog from "./dialogs/PdfNameDialog";
import PdfPreviewDialog from "./dialogs/PdfPreviewDialog";
import StatusUpdatingDialog from "./dialogs/StatusUpdatingDialog";
import DeleteScenarioDialog from "./dialogs/DeleteScenarioDialog";
import XmlReportReadyDialog from "./dialogs/XmlReportReadyDialog";

import {
  FormKey,
  loanProgramNames,
  occupancyStatuses,
  PreApprovalStatus,
  propertyTypes,
  STATUS_LABELS,
} from "./types";
import { computeDisabledState } from "./formGating";
import { formatAmount, formatDate, formatDecimal, formatUSPhoneNumber, toBase64FromUrl } from "@/utils/numberFormat";
import RefinanceTab from "@/components/Forms/RefinanceTab";
import { RefinanceQuickQuotePDF } from "@/components/PDFViews/RefinanceQuickquotePDF";
import { CombinedRefinancePreApprovalFormData, combinedRefinancePreApprovalSchema } from "@/api/models/refinance/combinedPreApprovalSchema";
import { RefinanceFeeWorksheetPDF } from "@/components/PDFViews/RefinanceFeeWorksheet";
import { useRouter } from "next/navigation";
import ScenarioCompare from "@/components/ScenarioCompare/ScenarioCompare";
import { RefinanceComparisonPDF } from "@/components/PDFViews/RefinanceComparison";
import { useGetProfile } from "@/api/reactQueriesHooks/useProfile";

export default function PreApproval() {
  const router = useRouter();
  const { user } = useSessionStore();
  const [userDisplayName, setUserDisplayName] = useState("");
  const { openSnackBar, closeDialog, severity, message } = useSnackBarStore();
  const { openSuccessDialog, openErrorDialog } = useSnackBarStore();
  const [isAddScenarioDisable, setIsAddScenarioDisable] = useState(true);
  const [issaved, setIssaved] = useState(false);
  const [isRefinancesaved, setIsRefinanceSaved] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [isRefinanceLoading, setIsRefinanceLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);
  const [isBlockedDelete, setIsBlockedDelete] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [xmlReportOpen, setXmlReportOpen] = useState(false);
  const [xmlData, setXmlData] = useState<string | null>(null);
  const [loanType, setLoanType] = useState<number | null>(null);
  const [status, setStatus] = useState<PreApprovalStatus>(
    PreApprovalStatus.TBD,
  );
  const [expandedForms, setExpandedForms] = useState<
    Record<number, Record<FormKey, boolean>>
  >({});
  const [completedForms, setCompletedForms] = useState<
    Record<number, Record<FormKey, boolean>>
  >({});
  const [disabledForms, setDisabledForms] = useState<
    Record<number, Record<FormKey, boolean>>
  >({});
  const [menuanchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const [isPDFbuttondisabled, setIsPDFbuttondisabled] = useState<
    Record<number, boolean>
  >({});
  const [isRefinancePDFbuttondisabled, setIsRefinancePDFbuttondisabled] = useState<
    Record<number, boolean>
  >({});
  const [isComparebuttondisabled, setIsComparebuttondisabled] = useState(true);
  const [isRefinanceComparebuttondisabled, setIsRefinanceComparebuttondisabled] = useState(true);

  const [quickQuoteloading, setQuickQuoteloading] = useState<
    Record<number, boolean>
  >({});
  const [preApprovalloading, setPreApprovalloading] = useState<
    Record<number, boolean>
  >({});
  const [FHAGFEloading, setFHAGFELoading] = useState<Record<number, boolean>>(
    {},
  );
  const [LoanFileloading, setLoanFileLoading] = useState<Record<number, boolean>>(
    {},
  );
  const [refinanceQuickQuoteloading, setRefinanceQuickQuoteloading] = useState<
    Record<number, boolean>
  >({});
  const [refinanceFeeWorksheetloading, setRefinanceFeeWorksheetloading] = useState<
    Record<number, boolean>
  >({});
  const [refinanceLoanFileloading, setRefinanceLoanFileloading] = useState<
    Record<number, boolean>
  >({});
  const [compareloading, setCompareLoading] = useState(false);
  const [refinanceCompareLoading, setRefinanceCompareLoading] = useState(false);

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<
    number | null
  >(null);
  const [selectedPdf, setSelectedPdf] = useState<Record<number, string>>({});
  const [currentPDF, setCurrentPDF] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [isAndroid, setIsAndroid] = useState(false);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [isPresenterModeDisabled, setIsPresenterModeDisabled] = useState(true);
  const menuopen = Boolean(menuanchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClick = async (nextStatus: PreApprovalStatus) => {
    if (!preApprovalId) return;
    try {
      setMenuOpen(true);
      const response = await updateChangeStatusPreApproval(preApprovalId, nextStatus);
      console.log("response =>", response.data.data.statusUpdatedAt);
      if (response.data.data.statusUpdatedAt) {
        setValue(`preapprovalDetail.statusUpdatedAt`, response.data.data.statusUpdatedAt);
      }
      openSuccessDialog("Status changed successfully.");
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setMenuOpen(false);
    }
  };
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }
  const methods = useForm<CombinedPreApprovalFormData>({
    resolver: zodResolver(combinedPreApprovalSchema),
    defaultValues: {
      preapprovalDetail: {
        userId: "",
        preApprovalId: "",
        createdAt: "",
        updatedAt: "",
        lastSubmittedFormNo: 0,
      },
      scenarios: [
        {
          id: undefined,
          scenarioOrder: 0,
          scenarioName: "Scenario 1",
          createdAt: undefined,
          borrowerInfo: {
            borrowerName: "",
            coBorrowerName: "",
            // ficoScore: undefined,
            // coBorrowerFicoScore: undefined,
            borrowerCellNumber: "",
            coBorrowerCellNumber: "",
            borrowerEmail: "",
            dateOfBirth: undefined,
            currentAddress: "",
            ssn: "",
            maritalStatus: null
          },
          purchaseInfo: {
            loanProgram: "",
            propertyType: "",
            occupancyStatus: "",
            downPayment: 0,
            hazardInsurance: 150,
            associationFee: 0,
            monthlyPropertyTaxPercentage: 1.25,
          },
          propertyIncomeOffset: {
            monthlyGrossRentalIncome: 0,
            rentalPercentage: 75,
            subjectPropertyPITIA: 0,
            qualifyingRentalIncome: 0,
            netMonthlyImpactToDTI: 0,
          },
          borrowersIncomeData: {
            borrowerIncome: [
              {
                borrowerName: "",
                ficoScore: "",
                monthlyIncome: 0,
                debts: [],
              },
            ],
          },
          lenderFees: {
            agentName: userDisplayName, // set default here
            loanOriginationFeePercentage: 0,
            discountFeePercentage: 0,
            upfrontMipPercentage: 0,
            appraisalFee: 800,
            escrowFees: 3000,
            titleFees: 3000,
            thirdPartyLenderFee: 2495,
          },
          prepaidItems: {
            prepaidInterestDays: getDaysLeftInMonth(),
            hazardInsuranceMonths: 6,
            propertyTaxMonths: 6,
          },
          miscFees: {
            earnestMoneyDeposit: 0,
            sellerCredit: 0,
            lenderCredit: 0,
            miscFee4: 0,
          },
        },
      ],
    },
  });
  const {
    control,
    setValue,
    resetField,
    getValues,
    watch,
    formState: { isDirty, dirtyFields, errors },
  } = methods;

  useEffect(() => {
    if (isPresenterModeDisabled && isPresenterMode) {
      setIsPresenterMode(false);
    }
  }, [isPresenterModeDisabled, isPresenterMode]);

  const refinanceMethods = useForm<CombinedRefinancePreApprovalFormData>({
    resolver: zodResolver(combinedRefinancePreApprovalSchema),
    defaultValues: {
      preapprovalDetail: {
        userId: "",
        preApprovalId: "",
        createdAt: "",
        updatedAt: "",
        lastSubmittedFormNo: 0,
      },
      scenarios: [
        {
          id: undefined,
          scenarioOrder: 0,
          scenarioName: "Scenario 1",
          createdAt: undefined,
          borrowerInfo: {
            borrowerName: "",
            coBorrowerName: "",
            // ficoScore: undefined,
            // coBorrowerFicoScore: undefined,
            borrowerCellNumber: "",
            coBorrowerCellNumber: "",
            borrowerEmail: "",
            dateOfBirth: undefined,
            currentAddress: "",
            ssn: "",
            maritalStatus: null
          },
          loanStructure: {
            loanProgram: "",
            lienPosition: "",
          },
          refinanceInfo: {
            propertyType: "",
            occupancyStatus: "",
            creditLimit: undefined,
            currentDrawAmount: undefined,
            refinanceType: "1",
            monthlyTaxAmount: 0,
            annualTaxAmount: 0,
            hazardInsurance: 150,
            associationFee: 0,
          },
          lenderFees: {
            agentName: userDisplayName, // set default here
            loanOriginationFeePercentage: 0,
            discountFeePercentage: 0,
            upfrontMipPercentage: 0,
            appraisalFee: 800,
            escrowFees: 3000,
            titleFees: 3000,
            thirdPartyLenderFee: 2495,
          },
          borrowersIncomeData: {
            borrowerIncome: [
              {
                borrowerName: "",
                ficoScore: "",
                monthlyIncome: 0,
                debts: [],
              },
            ],
          },
        },
      ],
    },
  });
  const {
    control: refinanceControl,
    setValue: refinanceSetValue,
    formState: {
      isDirty: refinanceIsDirty,
      dirtyFields: refinanceDirtyFields,
      errors: refinanceErrors,
    },
  } = refinanceMethods;
  const handleFieldChange = async (index: number) => {
    // console.log("preApprovalIndexStore =>", preApprovalIndexStore);
    const currentFormValues = getValues(`scenarios.${index}`);
    const calculatedFormValues = await calculatePreApproval(index, {
      formValues: currentFormValues,
      storeValues: preApprovalIndexStore,
      occupancyStatus: getValues(`scenarios.0.purchaseInfo.occupancyStatus`),
      borrowerIncome: getValues("scenarios.0.borrowersIncomeData.borrowerIncome")
    });
    usePreApprovalIndexStore.getState().setFrontEndRatio(index, calculatedFormValues.loanProgram.frontEndRatio);
    usePreApprovalIndexStore.getState().setBackEndRatio(index, calculatedFormValues.loanProgram.backEndRatio);
    // const ficoscore = calculatedFormValues.borrowersIncomeData.borrowerIncome[0].ficoScore;
    resetField(`scenarios.${index}.purchaseInfo.loanProgram`, { defaultValue: getValues(`scenarios.${index}.purchaseInfo.loanProgram`), });
    setValue(`scenarios.${index}.purchaseInfo.mipFundingFee`, calculatedFormValues.purchaseInfo.mipFundingFee,);
    setValue(`scenarios.${index}.purchaseInfo.miPercent`, calculatedFormValues.purchaseInfo.miPercent,);
    if (dirtyFields.scenarios?.[index]?.purchaseInfo?.downPayment) {
      resetField(`scenarios.${index}.purchaseInfo.downPayment`, { defaultValue: getValues(`scenarios.${index}.purchaseInfo.downPayment`), });
      setValue(`scenarios.${index}.purchaseInfo.loanAmount`, calculatedFormValues.purchaseInfo.loanAmount);
    } else if (dirtyFields.scenarios?.[index]?.purchaseInfo?.loanAmount) {
      resetField(`scenarios.${index}.purchaseInfo.loanAmount`, { defaultValue: getValues(`scenarios.${index}.purchaseInfo.loanAmount`), });
      setValue(`scenarios.${index}.purchaseInfo.downPayment`, calculatedFormValues.purchaseInfo.downPayment);
    } else {
      setValue(`scenarios.${index}.purchaseInfo.downPayment`, calculatedFormValues.purchaseInfo.downPayment);
      setValue(`scenarios.${index}.purchaseInfo.loanAmount`, calculatedFormValues.purchaseInfo.loanAmount);
    }
    // setValue(`scenarios.${index}.purchaseInfo.loanAmount`, calculatedFormValues.purchaseInfo.loanAmount,);
    setValue(`scenarios.${index}.propertyIncomeOffset.qualifyingRentalIncome`, calculatedFormValues.propertyIncomeOffset.qualifyingRentalIncome,);
    setValue(`scenarios.${index}.propertyIncomeOffset.netMonthlyImpactToDTI`, calculatedFormValues.propertyIncomeOffset.netMonthlyImpactToDTI,);
    setValue(`scenarios.${index}.lenderFees.loanOriginationFee`, calculatedFormValues.lenderFees.loanOriginationFee,);
    setValue(`scenarios.${index}.lenderFees.discountFee`, calculatedFormValues.lenderFees.discountFee,);
    setValue(`scenarios.${index}.lenderFees.upfrontMipPercentage`, calculatedFormValues.lenderFees.upfrontMipPercentage,);
    setValue(`scenarios.${index}.lenderFees.upfrontMip`, calculatedFormValues.lenderFees.upfrontMip,);
    setValue(`scenarios.${index}.prepaidItems.propertyTaxAmount`, calculatedFormValues.prepaidItems.propertyTaxAmount,);
    setValue(`scenarios.${index}.prepaidItems.propertyTaxMonths`, calculatedFormValues.prepaidItems.propertyTaxMonths,);
    setValue(`scenarios.${index}.prepaidItems.prepaidInterestAmount`, calculatedFormValues.prepaidItems.prepaidInterestAmount,);
    setValue(`scenarios.${index}.prepaidItems.hazardInsurance`, calculatedFormValues.prepaidItems.hazardInsurance,);
    setValue(`scenarios.${index}.prepaidItems.hazardInsuranceReserves`, calculatedFormValues.prepaidItems.hazardInsuranceReserves,);
    // setValue(`scenarios.${index}.borrowersIncomeData`, calculatedFormValues.borrowersIncomeData);
    // setValue(`scenarios.${index}.borrowersIncomeData.borrowerIncome.${index}.borrowerName`,calculatedFormValues.borrowersIncomeData.borrowerIncome[0].borrowerName.trim());
    // setValue(`scenarios.${index}.borrowersIncomeData.borrowerIncome.${index}.ficoScore`,ficoscore === "" ? undefined : ficoscore);
    setValue(`scenarios.${index}.loanProgram.frontEndRatio`, calculatedFormValues.loanProgram.frontEndRatio,);
    setValue(`scenarios.${index}.loanProgram.backEndRatio`, calculatedFormValues.loanProgram.backEndRatio,);
    setValue(`scenarios.${index}.loanProgram.downPaymentAmount`, calculatedFormValues.loanProgram.downPaymentAmount,);
    setValue(`scenarios.${index}.loanProgram.baseLoanAmount`, calculatedFormValues.loanProgram.baseLoanAmount,);
    setValue(`scenarios.${index}.loanProgram.finalLoanAmount`, calculatedFormValues.loanProgram.finalLoanAmount,);
    // setValue(`scenarios.${index}.loanProgram.mmi`,calculatedFormValues.loanProgram.mmi,);
    setValue(`scenarios.${index}.loanProgram.totalNeededToClear`, calculatedFormValues.loanProgram.totalNeededToClear,);
    // setValue(`scenarios.${index}.loanProgram.upmipAmount`,calculatedFormValues.loanProgram.upmipAmount,);
    setValue(`scenarios.${index}.loanProgram.principalAndInterest`, calculatedFormValues.loanProgram.principalAndInterest,);
    setValue(`scenarios.${index}.loanProgram.mortgageInsurance`, calculatedFormValues.loanProgram.mortgageInsurance,);
    setValue(`scenarios.${index}.loanProgram.monthlyTotal`, calculatedFormValues.loanProgram.monthlyTotal,);
    setValue(`scenarios.${index}.loanProgram.clearingCart`, calculatedFormValues.loanProgram.clearingCart,);
    // setValue(`scenarios.${index}.loanProgram.propertyTax`,calculatedFormValues.loanProgram.propertyTax,);
    setValue(`scenarios.${index}.purchaseInfo.monthlyPropertyTax`, calculatedFormValues.purchaseInfo.monthlyPropertyTax,);
    // setValue(`scenarios.${index}.loanProgram.hazardInsurance`,calculatedFormValues.loanProgram.hazardInsurance,);
    setValue(`scenarios.${index}.loanProgram.borrowers`, calculatedFormValues.loanProgram.borrowers,);
    // console.log("working", currentFormValues);
  };
  async function calculatePreApproval(
    index: number,
    values: any,
  ): Promise<any> {
    const { formValues, storeValues } = values;

    // console.log("formValues =>", formValues);
    // console.log("calculation called!");
    // console.log("storeValues =>",storeValues[0]);

    // const ficoScoreStore = storeValues[index].ficoScore;
    // const borrowerNameStore = storeValues[index].borrowerName;
    // const setMonthlyIncome = usePreApprovalIndexStore(
    //   (state) => state.setMonthlyIncome
    // );
    // const setBackEndRatio = usePreApprovalIndexStore(
    //   (state) => state.setBackEndRatio
    // );
    let SVficoScore = 0;
    let SVborrowerName = "";
    let SVcalculatedAnnualMIPRate = 0;
    let SVcalcmiPercent = 0;
    let SVloanAmount = 0;
    let SVqualifyingRentalIncome = 0;
    let SVnetMonthlyImpactToDTI = 0;
    let SVprepaidItemshazardInsurance = 0;
    let SVloanProgramhazardInsurance = 0;
    let SVloanOriginationFee = 0;
    let SVdiscountFee = 0;
    let SVupfrontMip = 0;
    let SVclosingCosts = 0;
    let SVpropertyTaxAmount = 0;
    let SVpropertyTaxMonths = 0;
    let SVpropertyTax = 0;
    let SVmonthlyPropertyTax = 0;
    let SVprepaidInterestAmount = 0;
    let SVhazardInsuranceReserves = 0;
    let SVborrowers: { monthlyIncome: number; debts: number; ficoScore: string }[] = [];
    let SVupfrontMipPercentage = 0;
    let SVfrontEndRatio = 0;
    let SVbackEndRatio = 0;
    let SVdownPayment = 0;
    let SVdownPaymentAmount = 0;
    let SVbaseLoanAmount = 0;
    let SVupmipAmount = 0;
    let SVfinalLoanAmount = 0;
    let SVmmi = 0;
    let SVtotalNeededToClear = 0;
    let SVprincipalAndInterest = 0;
    let SVmortgageInsurance = 0;
    let SVmonthlyTotal = 0;

    // const ficoScore = formValues?.borrowerInfo?.ficoScore;
    // const borrowerName = formValues?.borrowerInfo?.borrowerName;
    // if (ficoScoreStore == null) {
    //   SVficoScore = ficoScore === "" ? undefined : ficoScore;
    // }
    // if (borrowerNameStore == "") {
    //   SVborrowerName = borrowerName.trim();
    // }

    const loanProgram = formValues?.purchaseInfo?.loanProgram;
    const purchasePrice = formValues?.purchaseInfo?.purchasePrice;
    const downPayment = formValues?.purchaseInfo?.downPayment;
    const loanAmount = formValues?.purchaseInfo?.loanAmount;
    //   const annualInterestRate = formValues?.purchaseInfo?.annualInterestRate;
    const hazardInsurance = formValues?.purchaseInfo?.hazardInsurance;
    const mipFundingFee = formValues?.purchaseInfo?.mipFundingFee;

    if (purchasePrice > 0 && dirtyFields.scenarios?.[index]?.purchaseInfo?.downPayment) {
      SVdownPayment = downPayment;
      SVdownPaymentAmount = (purchasePrice * downPayment) / 100;
      SVloanAmount = purchasePrice - SVdownPaymentAmount;
    } else if (purchasePrice > 0 && dirtyFields.scenarios?.[index]?.purchaseInfo?.loanAmount) {
      SVdownPaymentAmount = purchasePrice - loanAmount;
      SVloanAmount = loanAmount;
      SVdownPayment = parseFloat(((SVdownPaymentAmount / purchasePrice) * 100).toFixed(5));
    } else {
      if (purchasePrice > 0 && downPayment > 0 && !dirtyFields.scenarios?.[index]?.purchaseInfo?.downPayment) {
        SVdownPayment = downPayment;
        SVdownPaymentAmount = (purchasePrice * downPayment) / 100;
        SVloanAmount = purchasePrice - SVdownPaymentAmount;
      } else if (purchasePrice > 0 && loanAmount > 0 && !dirtyFields.scenarios?.[index]?.purchaseInfo?.loanAmount) {
        SVloanAmount = loanAmount;
        SVdownPaymentAmount = purchasePrice - loanAmount;
        SVdownPayment = parseFloat(((SVdownPaymentAmount / purchasePrice) * 100).toFixed(5));
      }
    }

    const ltv = (SVloanAmount / purchasePrice) * 100;
    let calculatedAnnualMIPRate = 0;

    let calcmiPercent = 0;
    if (loanProgram == "3") {
      if (SVloanAmount <= 726200) {
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
      if (dirtyFields.scenarios?.[index]?.purchaseInfo?.loanProgram) {
        if (loanProgram == "4") {
          calculatedAnnualMIPRate = 3.3;
        } else {
          calculatedAnnualMIPRate = 0;
        }
      } else {
        calculatedAnnualMIPRate = mipFundingFee;
      }
      // calculatedAnnualMIPRate = mipFundingFee || 0;
    }
    calcmiPercent = Math.round(
      (SVloanAmount * calculatedAnnualMIPRate) / 100 / 12,
    );
    SVcalculatedAnnualMIPRate = calculatedAnnualMIPRate;
    SVcalcmiPercent = calcmiPercent;

    const monthlyGrossRentalIncome = formValues?.propertyIncomeOffset?.monthlyGrossRentalIncome;
    const rentalPercentage = formValues?.propertyIncomeOffset?.rentalPercentage;
    const subjectPropertyPITIA = formValues?.propertyIncomeOffset?.subjectPropertyPITIA;

    if (values.occupancyStatus === "3") {
      if (monthlyGrossRentalIncome > 0 && rentalPercentage > 0) {
        const qualifyingRentalIncome = (monthlyGrossRentalIncome * rentalPercentage) / 100;
        SVqualifyingRentalIncome = qualifyingRentalIncome;
        if (subjectPropertyPITIA > 0) {
          const netMonthlyImpactToDTI = qualifyingRentalIncome - subjectPropertyPITIA;
          SVnetMonthlyImpactToDTI = netMonthlyImpactToDTI;
        }
      }
    }

    if (Number(hazardInsurance) > 0) {
      SVprepaidItemshazardInsurance = Number(hazardInsurance) * 12;
      SVloanProgramhazardInsurance = Number(hazardInsurance);
    }

    const loanOriginationFeePercentage =
      formValues?.lenderFees?.loanOriginationFeePercentage;
    const discountFeePercentage = formValues?.lenderFees?.discountFeePercentage;
    const upfrontMipPercentage = formValues?.lenderFees?.upfrontMipPercentage;

    if (loanProgram !== "3") {
      if (dirtyFields.scenarios?.[index]?.purchaseInfo?.loanProgram) {
        SVupfrontMipPercentage = 0;
      } else {
        SVupfrontMipPercentage = Number(upfrontMipPercentage);
      }
    } else {
      SVupfrontMipPercentage = 1.75;
    }
    if (SVupfrontMipPercentage == undefined) {
      if (loanProgram != "3") {
        SVupfrontMipPercentage = 0;
      } else {
        SVupfrontMipPercentage = 1.75;
      }
    }

    if (SVloanAmount > 0) {
      const loanOriginationFee = Math.round(
        (Number(loanOriginationFeePercentage) / 100) * SVloanAmount,
      );
      const upfrontMip = Math.floor(
        (SVupfrontMipPercentage / 100) * SVloanAmount * 100
      ) / 100;

      SVloanOriginationFee = loanOriginationFee;
      SVupfrontMip = upfrontMip;
    }

    const appraisalFee = formValues?.lenderFees?.appraisalFee;
    const prepaidInterestAmount =
      formValues?.prepaidItems?.prepaidInterestAmount;
    const prepaidHazardInsurance = formValues?.prepaidItems?.hazardInsurance;
    const hazardInsuranceReserves =
      formValues?.prepaidItems?.hazardInsuranceReserves;
    const propertyTaxAmount = formValues?.prepaidItems?.propertyTaxAmount;
    const escrowFees = formValues?.lenderFees?.escrowFees;
    const titleFees = formValues?.lenderFees?.titleFees;
    const thirdPartyLenderFee = formValues?.lenderFees?.thirdPartyLenderFee;

    const annualInterestRate = formValues?.purchaseInfo?.annualInterestRate;
    const prepaidInterestDays = formValues?.prepaidItems?.prepaidInterestDays;
    const hazardInsuranceMonths =
      formValues?.prepaidItems?.hazardInsuranceMonths;
    const propertyTaxMonths = formValues?.prepaidItems?.propertyTaxMonths;
    const monthlyPropertyTaxPercentage =
      formValues?.purchaseInfo?.monthlyPropertyTaxPercentage;

    let checkpropertyTaxMonths = 0;
    if (propertyTaxMonths == undefined) {
      checkpropertyTaxMonths = 6;
    } else {
      checkpropertyTaxMonths = propertyTaxMonths;
    }
    let checkmonthlyPropertyTaxPercentage = 0;
    if (monthlyPropertyTaxPercentage == undefined) {
      checkmonthlyPropertyTaxPercentage = 1.25;
    } else {
      checkmonthlyPropertyTaxPercentage = monthlyPropertyTaxPercentage;
    }

    // if (purchasePrice > 0 && propertyTaxMonths > 0) {
    // const months =
    //   propertyTaxMonths && propertyTaxMonths > 0 ? propertyTaxMonths : 12;
    const topLevelPropertyTax =
      (purchasePrice * (checkmonthlyPropertyTaxPercentage / 100)) / 12;
    const calPropertyTaxAmount = Math.round(
      topLevelPropertyTax * checkpropertyTaxMonths,
    );

    // const propertyTax = Math.round(calPropertyTaxAmount);
    SVpropertyTaxAmount = Math.round(calPropertyTaxAmount);
    SVpropertyTaxMonths = checkpropertyTaxMonths;
    SVpropertyTax = Math.round(calPropertyTaxAmount);
    SVmonthlyPropertyTax = Math.round(topLevelPropertyTax);
    // } else {
    //   SVpropertyTaxAmount = 0;
    // }

    // if (
    //   typeof loanAmount === "number" &&
    //   typeof annualInterestRate === "number" &&
    //   typeof prepaidInterestDays === "number"
    // ) {
    let checkprepaidInterestDays = 0;
    if (prepaidInterestDays == undefined) {
      checkprepaidInterestDays = getDaysLeftInMonth();
    } else {
      checkprepaidInterestDays = prepaidInterestDays;
    }
    const interest =
      ((SVloanAmount * (annualInterestRate / 100)) / 365) *
      checkprepaidInterestDays;
    SVprepaidInterestAmount = Math.round(interest);
    // }

    let checkhazardInsuranceMonths = 0;
    if (hazardInsuranceMonths == undefined) {
      checkhazardInsuranceMonths = 6;
    } else {
      checkhazardInsuranceMonths = hazardInsuranceMonths;
    }
    const reserve = hazardInsurance * checkhazardInsuranceMonths;
    SVhazardInsuranceReserves = parseFloat(reserve.toFixed(2));

    const borrowerIncome =
      values.borrowerIncome ??
      formValues?.borrowersIncomeData?.borrowerIncome ??
      formValues?.borrowerIncomes;
    const principalAndInterest = formValues?.loanProgram?.principalAndInterest;
    const propertyTax = formValues?.loanProgram?.propertyTax;
    //   const mortgageInsurance = formValues?.loanProgram?.mortgageInsurance;
    const mortgageInsurance = formValues?.purchaseInfo?.miPercent;
    const associationFee = formValues?.purchaseInfo?.associationFee;

    let totalIncome = 0;
    let totalPayment = 0;
    borrowerIncome?.forEach((borrower: any) => {
      totalIncome += Number(borrower.monthlyIncome) || 0;
      borrower?.debts?.forEach((debt: any) => {
        totalPayment += Number(debt.monthlyPayment) || 0;
      });
    });
    if (values.occupancyStatus === "3") {
      totalPayment += Math.abs(SVnetMonthlyImpactToDTI);
    }

    if (borrowerIncome) {
      const loanProgramBorrowers = borrowerIncome.map((borrower: any) => {
        const totalDebts = borrower.debts?.reduce(
          (sum: any, debt: any) => sum + (Number(debt.monthlyPayment) || 0),
          0,
        );

        return {
          monthlyIncome: Number(borrower.monthlyIncome) || 0,
          debts: totalDebts,
          ficoScore: borrower.ficoScore ? String(borrower.ficoScore) : "",
        };
      });
      SVborrowers = loanProgramBorrowers;
    }

    const upmipRate = formValues?.lenderFees?.upfrontMipPercentage;
    const earnestMoneyDeposit = formValues?.miscFees?.earnestMoneyDeposit;
    const sellerCredit = formValues?.miscFees?.sellerCredit;
    const lenderCredit = formValues?.miscFees?.lenderCredit;
    const miscFee4 = formValues?.miscFees?.miscFee4;
    // const annualMIPRate = formValues?.loanProgram?.annualMIPRate;
    const interestRate = formValues?.purchaseInfo?.annualInterestRate;
    const term = formValues?.loanProgram?.term;

    const upmipAmount = SVloanAmount * (Number(upmipRate) / 100);
    const finalLoanAmount = SVloanAmount + upmipAmount;

    if (finalLoanAmount > 0) {
      const discountFee = Math.round(
        (Number(discountFeePercentage) / 100) * finalLoanAmount,
      );
      SVdiscountFee = discountFee;
    }

    const closingCosts =
      SVloanOriginationFee +
      SVdiscountFee +
      // upfrontMip +
      Number(appraisalFee) +
      SVprepaidInterestAmount +
      SVprepaidItemshazardInsurance +
      SVhazardInsuranceReserves +
      SVpropertyTaxAmount +
      Number(escrowFees) +
      Number(titleFees) +
      Number(thirdPartyLenderFee);

    SVclosingCosts = Math.round(closingCosts);

    const totalNeededToClear =
      SVdownPaymentAmount +
      closingCosts -
      (Number(earnestMoneyDeposit) + Number(sellerCredit) + Number(lenderCredit));
    // (earnestMoneyDeposit + sellerCredit + lenderCredit + miscFee4);

    const calmmi = (SVloanAmount * (calculatedAnnualMIPRate / 100)) / 12;

    let checkterm = 0;
    if (term == undefined) {
      checkterm = 30;
    } else {
      checkterm = term;
    }

    const P = finalLoanAmount;
    const r = interestRate / 100 / 12;
    const n = checkterm * 12;

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
      SVmonthlyPropertyTax +
      Number(hazardInsurance) +
      SVcalcmiPercent +
      associationFeeAmount;

    const calcPrincipalAndInterest = isNaN(monthlyPI)
      ? 0
      : +monthlyPI.toFixed(2);
    const calMortgageInsurance = isNaN(mortgageInsurance)
      ? 0
      : +mortgageInsurance.toFixed(2);

    const monthlyHousingExpenses =
      calcPrincipalAndInterest +
      SVmonthlyPropertyTax +
      calMortgageInsurance +
      associationFeeAmount;

    // const ratioBack = parseFloat(
    //   (((monthlyHousingExpenses + totalPayment) / totalIncome) * 100).toFixed(2)
    // );
    // setBackEndRatio(index, ratioBack);

    const calculatedFrontEndRatio =
      totalIncome > 0
        ? parseFloat(((monthlyHousingExpenses / totalIncome) * 100).toFixed(2))
        : 0;

    const frontEnd = !isFinite(calculatedFrontEndRatio)
      ? 0
      : calculatedFrontEndRatio;

    // usePreApprovalIndexStore.getState().setFrontEndRatio(index, frontEnd);

    let calculatedBackEndRatio = 0;

    calculatedBackEndRatio = Number(
      (((monthlyHousingExpenses + totalPayment) / totalIncome) * 100).toFixed(
        2,
      ),
    );

    const backEnd = !isFinite(calculatedBackEndRatio)
      ? 0
      : calculatedBackEndRatio;

    // usePreApprovalIndexStore.getState().setBackEndRatio(index, backEnd);

    SVfrontEndRatio = frontEnd;
    SVbackEndRatio = backEnd;
    SVdownPaymentAmount = isNaN(SVdownPaymentAmount)
      ? 0
      : +SVdownPaymentAmount.toFixed(2);
    SVbaseLoanAmount = isNaN(SVloanAmount) ? 0 : +SVloanAmount.toFixed(2);
    SVupmipAmount = isNaN(upmipAmount) ? 0 : +upmipAmount.toFixed(2);
    SVfinalLoanAmount = isNaN(finalLoanAmount)
      ? 0
      : +finalLoanAmount.toFixed(2);
    SVmmi = isNaN(calmmi) ? 0 : +calmmi.toFixed(2);
    SVtotalNeededToClear = isNaN(totalNeededToClear) ? 0 : +totalNeededToClear;
    SVprincipalAndInterest = isNaN(monthlyPI) ? 0 : +monthlyPI.toFixed(0);
    SVmortgageInsurance = isNaN(mortgageInsurance)
      ? 0
      : +mortgageInsurance.toFixed(0);
    SVmonthlyTotal = isNaN(monthlyTotal) ? 0 : +monthlyTotal.toFixed(0);

    return {
      purchaseInfo: {
        mipFundingFee: SVcalculatedAnnualMIPRate,
        miPercent: SVcalcmiPercent,
        downPayment: SVdownPayment,
        loanAmount: SVloanAmount,
        monthlyPropertyTax: SVmonthlyPropertyTax,
      },
      propertyIncomeOffset: {
        qualifyingRentalIncome: SVqualifyingRentalIncome,
        netMonthlyImpactToDTI: SVnetMonthlyImpactToDTI,
      },
      lenderFees: {
        loanOriginationFee: SVloanOriginationFee,
        discountFee: SVdiscountFee,
        upfrontMipPercentage: SVupfrontMipPercentage,
        upfrontMip: SVupfrontMip,
      },
      prepaidItems: {
        propertyTaxAmount: SVpropertyTaxAmount,
        propertyTaxMonths: SVpropertyTaxMonths,
        hazardInsurance: SVprepaidItemshazardInsurance,
        prepaidInterestAmount: SVprepaidInterestAmount,
        hazardInsuranceReserves: SVhazardInsuranceReserves,
      },
      borrowersIncomeData: {
        borrowerIncome: [
          {
            borrowerName: SVborrowerName,
            ficoScore: SVficoScore,
          },
        ],
      },
      loanProgram: {
        frontEndRatio: SVfrontEndRatio,
        backEndRatio: SVbackEndRatio,
        downPaymentAmount: SVdownPaymentAmount,
        baseLoanAmount: SVbaseLoanAmount,
        finalLoanAmount: SVfinalLoanAmount,
        mmi: SVmmi,
        totalNeededToClear: SVtotalNeededToClear,
        upmipAmount: SVupmipAmount,
        principalAndInterest: SVprincipalAndInterest,
        mortgageInsurance: SVmortgageInsurance,
        monthlyTotal: SVmonthlyTotal,
        clearingCart: SVclosingCosts,
        propertyTax: SVpropertyTax,
        borrowers: SVborrowers,
        hazardInsurance: SVloanProgramhazardInsurance,
      },
    };
  }
  const { fields, append, remove } = useFieldArray({
    control,
    name: "scenarios",
  });
  useEffect(() => {
    if (user) {
      setUserDisplayName(user.displayName || "");
    }
  }, [user]);

  const [preApprovalIdFromURL, setPreApprovalIdFromURL] = useState<
    string | null
  >(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPreApprovalIdFromURL(params.get("preApprovalId"));
  }, []);
  const [preApprovalId, setPreApprovalId] = useState<string | null>(null);

  // Stores the initial county {id, county} per scenario so PurchaseInfoForm
  // can pre-populate its Autocomplete when loading existing data
  const [scenarioCounties, setScenarioCounties] = useState<
    Record<number, { id: string; county: string }>
  >({});

  useEffect(() => {
    if (preApprovalIdFromURL) {
      setPreApprovalId(preApprovalIdFromURL);
    }
  }, [preApprovalIdFromURL]);

  const { data: fetchedData, refetch } = useGetPreApprovalById(
    preApprovalIdFromURL || preApprovalId || "",
  );

  const { data: fetchedDataonSubmit, refetch: refetchPreApprovalonSubmit } =
    useGetPreApprovalByIdOnSubmit(preApprovalIdFromURL || preApprovalId || "");

  const { data: fetchedDataonGenerate, refetch: refetchPreApprovalonGenerate } =
    useGetPreApprovalByIdOnGenerate(
      preApprovalIdFromURL || preApprovalId || "",
    );

  const setPreApprovalIdStore = usePreApprovalStore(
    (state) => state.setPreApprovalId,
  );

  const preApprovalIndexStore = usePreApprovalIndexStore(
    (state) => state.ratios,
  );
  const {
    initializeIndex,
    setBorrowerName,
    setFicoScore,
    setFrontEndRatio,
    setBackEndRatio,
  } = usePreApprovalIndexStore.getState();
  useEffect(() => {
    if (preApprovalId) {
      setPreApprovalIdStore(preApprovalId);
    }
  }, [preApprovalId]);
  useEffect(() => {
    if (fetchedData) {
      async function setForm() {
        const formatedFetchedData = fetchedData.data;
        if (formatedFetchedData.loanType == 0) {
          setLoanType(0);
          setTabValue(0);
          const scenariosData = formatedFetchedData.scenarios;
          let scenariosFormData: Record<string, unknown>[] = [];

          const preApprovalDetails = {
            preApprovalId: formatedFetchedData.id ?? "",
            userId: formatedFetchedData.userId ?? "",
            createdAt: formatedFetchedData.createdAt ?? "",
            updatedAt: formatedFetchedData.updatedAt ?? "",
            lastSubmittedFormNo: formatedFetchedData.lastSubmittedFormNo ?? 0,
            lastSubmittedScenarioNo: formatedFetchedData.lastSubmittedScenarioNo,
            loanType: formatedFetchedData.loanType ?? 0,
            statusUpdatedAt: formatedFetchedData.statusUpdatedAt ?? null
          };

          if (scenariosData.length > 1) {
            setIsComparebuttondisabled(false);
          }

          // console.log("scenariosData length =>", scenariosData.length);

          for (let index = 0; index < scenariosData.length; index++) {
            const scenario = scenariosData[index];
            const formData = formatedFetchedData.scenarios[index].purchase;
            let scenarioIndex = index + 1;

            // console.log("formatedFetchedData =>", formatedFetchedData);
            // return;
            // const firstIncome = scenario.borrowerIncomes?.[0];
            // console.log("income data =>",firstIncome);

            // if (firstIncome) {
            // console.log("if working");

            //   setBorrowerName(index, firstIncome.borrowerName);
            //   setFicoScore(index, firstIncome.ficoScore);
            // }
            // console.log("store values =>",preApprovalIndexStore);

            if (scenario.purchase.loanProgram !== null) {
              setIsPDFbuttondisabled((prev) => ({ ...prev, [index]: false }));
            } else {
              setIsPDFbuttondisabled((prev) => ({ ...prev, [index]: true }));
            }

            if (formatedFetchedData.status) {
              setStatus(formatedFetchedData.status);
            }

            // console.log("fetched scenario =>", formatedFetchedData.scenarios[index]);
            // console.log("form fetched data");

            const calculatedvalues = await calculatePreApproval(index, {
              formValues: formatedFetchedData.scenarios[index].purchase,
              storeValues: preApprovalIndexStore,
              occupancyStatuse: formatedFetchedData.scenarios[0].purchase.purchaseInfo?.occupancyStatus,
              borrowerIncome: formatedFetchedData.scenarios[0].purchase.borrowersIncomeData?.borrowerIncome ?? formatedFetchedData.scenarios[0].purchase.borrowerIncomes,
            });
            setFrontEndRatio(index, calculatedvalues.loanProgram.frontEndRatio);
            setBackEndRatio(index, calculatedvalues.loanProgram.backEndRatio);

            // console.log("calculated values =>", calculatedvalues.loanProgram);

            scenariosFormData.push({
              id: scenario.id,
              scenarioOrder: scenarioIndex,
              scenarioName: "",
              createdAt: scenario.createdAt,
              updatedAt: getFormattedDate(),
              lastSubmittedFormNo: 1,
              borrowerInfo: {
                borrowerName: formData.borrowerInfo.borrowerName ?? "",
                coBorrowerName: formData.borrowerInfo.coBorrowerName ?? "",
                borrowerCellNumber: formData.borrowerInfo.borrowerCellNumber ?? "",
                coBorrowerCellNumber: formData.borrowerInfo.coBorrowerCellNumber ?? "",
                borrowerEmail: formData.borrowerInfo.borrowerEmail ?? "",
                dateOfBirth: formData.borrowerInfo.dateOfBirth ? new Date(formData.borrowerInfo.dateOfBirth) : null,
                currentAddress: formData.borrowerInfo.currentAddress ?? "",
                ssn: formData.borrowerInfo.ssn ?? "",
                maritalStatus: formData.borrowerInfo.maritalStatus ?? 0,
              },
              purchaseInfo: {
                loanProgram: String(formData.purchaseInfo?.loanProgram ?? "",),
                propertyType: String(formData.purchaseInfo?.propertyType ?? "",),
                countyID: String(formData.purchaseInfo?.countyID ?? "",),
                occupancyStatus: String(formData.purchaseInfo?.occupancyStatus ?? "",),
                purchasePrice: formData.purchaseInfo?.purchasePrice ?? "",
                downPayment: formData.purchaseInfo?.downPayment ?? 0,
                loanAmount: formData.purchaseInfo?.loanAmount ?? "",
                annualInterestRate: formData.purchaseInfo?.annualInterestRate ?? "",
                mipFundingFee: formData.purchaseInfo?.mipFundingFee ? formData.purchaseInfo.mipFundingFee : formData.purchaseInfo?.loanProgram == 3 ? 1.75 : 0,
                hazardInsurance: formData.purchaseInfo?.hazardInsurance ?? 150,
                associationFee: formData.purchaseInfo?.associationFee ?? 0,
                miPercent: formData.purchaseInfo?.miPercent ?? 0,
                monthlyPropertyTaxPercentage: formData.purchaseInfo?.monthlyPropertyTaxPercentage ?? 1.25,
                monthlyPropertyTax: formData.purchaseInfo?.monthlyPropertyTax ?? calculatedvalues.purchaseInfo.monthlyPropertyTax,
              },
              propertyIncomeOffset: {
                monthlyGrossRentalIncome: formData.propertyIncomeOffset?.monthlyGrossRentalIncome ?? 0,
                rentalPercentage: formData.propertyIncomeOffset?.rentalPercentage ?? 75,
                subjectPropertyPITIA: formData.propertyIncomeOffset?.subjectPropertyPITIA ?? 0,
                qualifyingRentalIncome: formData.propertyIncomeOffset?.qualifyingRentalIncome ?? calculatedvalues.propertyIncomeOffset?.qualifyingRentalIncome ?? 0,
                netMonthlyImpactToDTI: formData.propertyIncomeOffset?.netMonthlyImpactToDTI ?? calculatedvalues.propertyIncomeOffset?.netMonthlyImpactToDTI ?? 0,
              },
              lenderFees: {
                agentName: formData.lenderFees?.agentName ?? userDisplayName,
                loanOriginationFee: formData.lenderFees?.loanOriginationFee ?? 0,
                loanOriginationFeePercentage: formData.lenderFees?.loanOriginationFeePercentage ?? 0,
                discountFeePercentage: formData.lenderFees?.discountFeePercentage ?? 0,
                discountFee: formData.lenderFees?.discountFee ?? 0,
                upfrontMipPercentage: formData.lenderFees?.upfrontMipPercentage ?? calculatedvalues.lenderFees.upfrontMipPercentage ?? 0,
                upfrontMip: formData.lenderFees?.upfrontMip ?? calculatedvalues.lenderFees.upfrontMip ?? 0,
                appraisalFee: formData.lenderFees?.appraisalFee ?? 800,
                escrowFees: formData.lenderFees?.escrowFees ?? 3000,
                titleFees: formData.lenderFees?.titleFees ?? 3000,
                thirdPartyLenderFee: formData.lenderFees?.thirdPartyLenderFee ?? 2495,
              },
              prepaidItems: {
                prepaidInterestDays: formData.prepaidItems?.prepaidInterestDays ?? getDaysLeftInMonth(),
                prepaidInterestAmount: formData.prepaidItems?.prepaidInterestAmount ?? calculatedvalues.prepaidItems.prepaidInterestAmount,
                hazardInsurance: formData.prepaidItems?.hazardInsurance ?? calculatedvalues.prepaidItems.hazardInsurance,
                hazardInsuranceMonths: formData.prepaidItems?.hazardInsuranceMonths ?? 6,
                hazardInsuranceReserves: formData.prepaidItems?.hazardInsuranceReserves ?? calculatedvalues.prepaidItems.hazardInsuranceReserves,
                propertyTaxMonths: formData.prepaidItems?.propertyTaxMonths ?? 6,
                propertyTaxAmount: formData.prepaidItems?.propertyTaxAmount ?? calculatedvalues.prepaidItems.propertyTaxAmount,
              },
              miscFees: {
                earnestMoneyDeposit: formData.miscFees?.earnestMoneyDeposit ?? 0,
                sellerCredit: formData.miscFees?.sellerCredit ?? 0,
                lenderCredit: formData.miscFees?.lenderCredit ?? 0,
                miscFee4: formData.miscFees?.miscFee4 ?? 0,
              },
              borrowersIncomeData: {
                borrowerIncome: formData.borrowerIncomes?.map(
                  (income: BorrowerIncomeEntry): BorrowerIncomeEntry => ({
                    borrowerName: income.borrowerName ?? "",
                    ficoScore: income.ficoScore ? String(income.ficoScore) : "",
                    monthlyIncome: income.monthlyIncome ?? undefined,
                    debts:
                      income.debts?.map(
                        (debt: DebtEntry): DebtEntry => ({
                          debtType: String(debt.debtType) ?? "3",
                          balance: debt.balance ?? undefined,
                          monthlyPayment: debt.monthlyPayment ?? undefined,
                        }),
                      ) ?? [],
                  }),
                ) ?? [
                    {
                      borrowerName:
                        formData.borrowerInfo
                          .borrowerName,
                      ficoScore:
                        "",
                      monthlyIncome: 0,
                      debts: [],
                    },
                  ],
              },
              loanProgram: {
                frontEndRatio: formData.loanProgram?.frontEndRatio ?? calculatedvalues.loanProgram.frontEndRatio,
                backEndRatio: formData.loanProgram?.backEndRatio ?? calculatedvalues.loanProgram.backEndRatio,
                baseLoanAmount: formData.loanProgram?.baseLoanAmount ?? calculatedvalues.loanProgram.baseLoanAmount,
                upmipAmount: formData.lenderFees?.upfrontMip ?? calculatedvalues.lenderFees.upfrontMip,
                finalLoanAmount: formData.loanProgram?.finalLoanAmount ?? calculatedvalues.loanProgram.finalLoanAmount,
                term: formData.loanProgram?.term ?? 30,
                downPaymentAmount: formData.loanProgram?.downPaymentAmount ?? calculatedvalues.loanProgram.downPaymentAmount,
                clearingCart: formData.loanProgram?.clearingCart ?? calculatedvalues.loanProgram.clearingCart,
                totalNeededToClear: formData.loanProgram?.totalNeededToClear ?? calculatedvalues.loanProgram.totalNeededToClear,
                principalAndInterest: formData.loanProgram?.principalAndInterest ?? calculatedvalues.loanProgram.principalAndInterest,
                mortgageInsurance: formData.loanProgram?.mortgageInsurance ?? 0,
                monthlyTotal: formData.loanProgram?.monthlyTotal ?? calculatedvalues.loanProgram.monthlyTotal,
                borrowers: calculatedvalues.loanProgram.borrowers,
              },
            });

            // Store county display info for this scenario so the Autocomplete pre-populates
            if (formData.purchaseInfo?.countyID && formData.purchaseInfo?.countyName) {
              setScenarioCounties((prev) => ({
                ...prev,
                [index]: {
                  id: formData.purchaseInfo.countyID,
                  county: formData.purchaseInfo.countyName,
                },
              }));
            }
          }

          const formOrder: FormKey[] = [
            "borrowerInfo",
            "purchaseInfo",
            "propertyIncomeOffset",
            "lenderFees",
            "prepaidItems",
            "miscFees",
            "borrowersIncomeData",
            "loanProgram",
          ];

          const expanded: typeof expandedForms = {};
          const completed: typeof completedForms = {};
          const disabled: typeof disabledForms = {};

          formatedFetchedData.scenarios.forEach(
            (scenario: any, scenarioIndex: number) => {
              const completedState = createCompletedState();
              const disabledState = createDisabledState();
              const expandedState = createFormState();

              const resolveSectionKey = (key: FormKey) =>
                key === "borrowersIncomeData" ? "borrowerIncomes" : key;

              formOrder.forEach((formKey) => {
                const sectionKey = resolveSectionKey(formKey);
                const sectionData = scenario.purchase[sectionKey];

                const hasData = Array.isArray(sectionData)
                  ? sectionData.length > 0
                  : sectionData != null;

                completedState[formKey] = hasData;
                expandedState[formKey] = false;
              });

              // Every earlier required form must be complete to unlock a form
              Object.assign(
                disabledState,
                computeDisabledState(
                  completedState,
                  scenario?.purchase?.purchaseInfo?.occupancyStatus,
                ),
              );

              // Pre-filled data behind a locked form (e.g. income data from the
              // borrower's employment history) must not show as submitted
              formOrder.forEach((formKey) => {
                if (disabledState[formKey]) completedState[formKey] = false;
              });

              /**
               * Expand current form in progress
               * Assumes lastSubmittedFormNo is 1-based
               */
              if (
                scenarioIndex ===
                formatedFetchedData.scenarios[0].lastSubmittedFormNo
              ) {
                const currentFormIndex =
                  formatedFetchedData.scenarios[0].lastSubmittedFormNo - 1;

                const currentFormKey = formOrder[currentFormIndex];

                if (currentFormKey) {
                  expandedState[currentFormKey] = true;
                  disabledState[currentFormKey] = false;
                }
              }

              expanded[scenarioIndex] = expandedState;
              completed[scenarioIndex] = completedState;
              disabled[scenarioIndex] = disabledState;
            },
          );

          setExpandedForms(expanded);
          setCompletedForms(completed);
          setDisabledForms(disabled);

          methods.reset({
            preapprovalDetail: preApprovalDetails,
            scenarios: scenariosFormData,
          });
          // console.log("inside fetched isFormDirty =>",isFormDirty);

          if (scenariosData[0].purchase.loanProgram) {
            setIsAddScenarioDisable(false);
            setIssaved(true);

            if (tabValue === 0) {
              setIsPresenterModeDisabled(false);
            }
          }
        }
      }
      setForm();
    }
    // }, [fetchedData, user?.displayName, methods]);
  }, [fetchedData]);

  const createFormState = () => ({
    borrowerInfo: true,
    purchaseInfo: false,
    propertyIncomeOffset: false,
    lenderFees: false,
    prepaidItems: false,
    miscFees: false,
    borrowersIncomeData: false,
    loanProgram: false,
  });

  const createCompletedState = () => ({
    borrowerInfo: false,
    purchaseInfo: false,
    propertyIncomeOffset: false,
    lenderFees: false,
    prepaidItems: false,
    miscFees: false,
    borrowersIncomeData: false,
    loanProgram: false,
  });

  const createDisabledState = () => ({
    borrowerInfo: false,
    purchaseInfo: true,
    propertyIncomeOffset: true,
    lenderFees: true,
    prepaidItems: true,
    miscFees: true,
    borrowersIncomeData: true,
    loanProgram: true,
  });

  const handleRemoveClick = (index: number) => {
    if (fields.length === 1) {
      setIsBlockedDelete(true);
      setDeleteOpen(true);
      return;
    }

    setIsBlockedDelete(false);
    setDeleteIndex(index);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex); // react-hook-form useFieldArray remove
    }
    setDeleteIndex(null);
    setDeleteOpen(false);
  };

  useEffect(() => {
    if (Object.keys(expandedForms).length == 0) {
      let expanded: typeof expandedForms = {};
      let completed: typeof completedForms = {};
      let disabled: typeof disabledForms = {};
      fields.forEach((_, index) => {
        expanded[index] = createFormState();
        completed[index] = createCompletedState();
        disabled[index] = createDisabledState();
      });
      setExpandedForms(expanded);
      setCompletedForms(completed);
      setDisabledForms(disabled);
    }
    if (Object.keys(preApprovalIndexStore).length == 0) {
      initializeIndex(0);
    }
  }, [fields]);

  const handleAddNewState = () => {
    const newIndex = fields.length;

    setExpandedForms((prev) => ({
      ...prev,
      [newIndex]: {
        borrowerInfo: true,
        purchaseInfo: false,
        propertyIncomeOffset: false,
        lenderFees: false,
        prepaidItems: false,
        miscFees: false,
        borrowersIncomeData: false,
        loanProgram: false,
      },
    }));

    setCompletedForms((prev) => ({
      ...prev,
      [newIndex]: {
        borrowerInfo: false,
        purchaseInfo: false,
        propertyIncomeOffset: false,
        lenderFees: false,
        prepaidItems: false,
        miscFees: false,
        borrowersIncomeData: false,
        loanProgram: false,
      },
    }));

    setDisabledForms((prev) => ({
      ...prev,
      [newIndex]: {
        borrowerInfo: false,
        purchaseInfo: false,
        propertyIncomeOffset: false,
        lenderFees: false,
        prepaidItems: false,
        miscFees: false,
        borrowersIncomeData: false,
        loanProgram: false,
      },
    }));

    setIsPDFbuttondisabled((prev) => ({ ...prev, [newIndex]: true }));
  };

  const formOrder: FormKey[] = [
    "borrowerInfo",
    "purchaseInfo",
    "propertyIncomeOffset",
    "lenderFees",
    "prepaidItems",
    "miscFees",
    "borrowersIncomeData",
    "loanProgram",
  ];

  const expandNextForm = (scenarioIndex: number, currentForm: FormKey) => {
    const currentIndex = formOrder.indexOf(currentForm);
    const nextForm = formOrder[currentIndex + 1];

    if (!nextForm) return;

    setExpandedForms((prev) => {
      const resetState = Object.fromEntries(
        formOrder.map((key) => [key, false]),
      ) as Record<FormKey, boolean>;

      return {
        ...prev,
        [scenarioIndex]: {
          ...resetState,
          [nextForm]: true,
        },
      };
    });

    setDisabledForms((prev) => ({
      ...prev,
      [scenarioIndex]: {
        ...prev[scenarioIndex],
        [nextForm]: false,
      },
    }));
  };

  const handleToggle = (scenarioIndex: number, form: FormKey) => {
    setExpandedForms((prev) => {
      const resetState = Object.fromEntries(
        formOrder.map((key) => [key, false]),
      ) as Record<FormKey, boolean>;

      return {
        ...prev,
        [scenarioIndex]: {
          ...resetState,
          [form]: true,
          // [form]: !prev[scenarioIndex]?.[form],
        },
      };
    });
  };

  const { mutateAsync: submitPreApproval } = useCreatePreApproval();

  const handleCreateSuccess = () => {
    openSuccessDialog("Data submitted successfully.");
  };

  const handleError = () => { };

  const handleSubmitExpandedForm = async () => {
    const { preapprovalDetail, scenarios } = methods.getValues();
    if (preApprovalId) {
      await refetchPreApprovalonSubmit();
    }

    let scenarioPayload: Record<string, unknown>[] = [];

    try {
      let preApprovalData: Record<string, unknown> = {};
      let response;
      let lastSubmittedScenarioNo = 0;
      for (let index = 0; index < scenarios.length; index++) {
        lastSubmittedScenarioNo++;
        const scenario = scenarios[index];
        let scenarioIndex = index + 1;
        // console.log("scenario index =>", scenarioIndex);
        const {
          borrowerInfo,
          purchaseInfo,
          propertyIncomeOffset,
          lenderFees,
          prepaidItems,
          miscFees,
          borrowersIncomeData,
          loanProgram,
        } = scenario;

        const { purchaseInfo: firstPurchaseInfo, propertyIncomeOffset: firstPropertyIncomeOffset, borrowersIncomeData: firstBorrowersIncomeData } = scenarios[0];

        const borrowerInfopayload = {
          preApprovalId,
          borrowerName: borrowerInfo.borrowerName,
          coBorrowerName: borrowerInfo.coBorrowerName,
          // ficoScore: Number(borrowerInfo.ficoScore),
          // coBorrowerFicoScore: Number(borrowerInfo.coBorrowerFicoScore),
          borrowerCellNumber: borrowerInfo.borrowerCellNumber,
          coBorrowerCellNumber: borrowerInfo.coBorrowerCellNumber,
          borrowerEmail: borrowerInfo.borrowerEmail,
          dateOfBirth: borrowerInfo.dateOfBirth ? formatDateOfBirth(borrowerInfo.dateOfBirth) : null,
          currentAddress: borrowerInfo.currentAddress,
          ssn: borrowerInfo.ssn,
          maritalStatus: borrowerInfo.maritalStatus,
        };

        const purchaseInfopayload = {
          preApprovalId,
          loanProgram: purchaseInfo.loanProgram,
          propertyType: purchaseInfo.propertyType,
          countyID: purchaseInfo.countyID || null,
          occupancyStatus: firstPurchaseInfo.occupancyStatus,
          purchasePrice: purchaseInfo.purchasePrice,
          downPayment: purchaseInfo.downPayment,
          loanAmount: purchaseInfo.loanAmount,
          annualInterestRate: purchaseInfo.annualInterestRate,
          mipFundingFee: purchaseInfo.mipFundingFee,
          hazardInsurance: purchaseInfo.hazardInsurance ? Number(purchaseInfo.hazardInsurance) : 0,
          associationFee: purchaseInfo.associationFee ? Number(purchaseInfo.associationFee) : 0,
          miPercent: purchaseInfo.miPercent,
          monthlyPropertyTaxPercentage: purchaseInfo.monthlyPropertyTaxPercentage,
          monthlyPropertyTax: purchaseInfo.monthlyPropertyTax,
        };

        const propertyIncomeOffsetpayload = {
          preApprovalId,
          monthlyGrossRentalIncome: firstPropertyIncomeOffset.monthlyGrossRentalIncome ? Number(firstPropertyIncomeOffset.monthlyGrossRentalIncome) : 0,
          rentalPercentage: firstPropertyIncomeOffset.rentalPercentage ? Number(firstPropertyIncomeOffset.rentalPercentage) : 0,
          subjectPropertyPITIA: firstPropertyIncomeOffset.subjectPropertyPITIA ? Number(firstPropertyIncomeOffset.subjectPropertyPITIA) : 0,
          qualifyingRentalIncome: firstPropertyIncomeOffset.qualifyingRentalIncome ? Number(firstPropertyIncomeOffset.qualifyingRentalIncome) : 0,
          netMonthlyImpactToDTI: firstPropertyIncomeOffset.netMonthlyImpactToDTI ? Number(firstPropertyIncomeOffset.netMonthlyImpactToDTI) : 0,
        };

        const lenderFeespayload = {
          preApprovalId,
          agentName: lenderFees.agentName,
          loanOriginationFeePercentage: lenderFees.loanOriginationFeePercentage ? Number(lenderFees.loanOriginationFeePercentage) : 0,
          loanOriginationFee: lenderFees.loanOriginationFee,
          discountFeePercentage: lenderFees.discountFeePercentage ? Number(lenderFees.discountFeePercentage) : 0,
          discountFee: lenderFees.discountFee,
          upfrontMipPercentage: lenderFees.upfrontMipPercentage ? Number(lenderFees.upfrontMipPercentage) : 0,
          upfrontMip: lenderFees.upfrontMip,
          appraisalFee: lenderFees.appraisalFee ? Number(lenderFees.appraisalFee) : 0,
          escrowFees: lenderFees.escrowFees ? Number(lenderFees.escrowFees) : 0,
          titleFees: lenderFees.titleFees ? Number(lenderFees.titleFees) : 0,
          thirdPartyLenderFee: lenderFees.thirdPartyLenderFee ? Number(lenderFees.thirdPartyLenderFee) : 0,
        };

        const prepaidItemspayload = {
          preApprovalId,
          prepaidInterestDays: prepaidItems.prepaidInterestDays,
          prepaidInterestAmount: prepaidItems.prepaidInterestAmount,
          hazardInsurance: prepaidItems.hazardInsurance,
          hazardInsuranceMonths: prepaidItems.hazardInsuranceMonths,
          hazardInsuranceReserves: prepaidItems.hazardInsuranceReserves,
          propertyTaxMonths: prepaidItems.propertyTaxMonths,
          propertyTaxAmount: prepaidItems.propertyTaxAmount,
        };

        const miscFeespayload = {
          preApprovalId,
          earnestMoneyDeposit: miscFees.earnestMoneyDeposit ? Number(miscFees.earnestMoneyDeposit) : 0,
          sellerCredit: miscFees.sellerCredit ? Number(miscFees.sellerCredit) : 0,
          lenderCredit: miscFees.lenderCredit ? Number(miscFees.lenderCredit) : 0,
          miscFee4: miscFees.miscFee4 ? Number(miscFees.miscFee4) : 0,
        };

        const borrowersIncomeDatapayload =
          firstBorrowersIncomeData.borrowerIncome.map((entry) => ({
            preApprovalId,
            borrowerName: entry.borrowerName,
            ficoScore: entry.ficoScore ? Number(entry.ficoScore) : null,
            monthlyIncome: entry.monthlyIncome,
            debts: entry.debts.map((debt) => ({
              preApprovalId,
              debtType: Number(debt.debtType), // if it's a string and needs to be number
              balance: Number(debt.balance),
              monthlyPayment: Number(debt.monthlyPayment),
            })),
          }));


        const loanProgrampayload = {
          preApprovalId,
          loanProgram: purchaseInfo.loanProgram,
          frontEndRatio: loanProgram.frontEndRatio,
          backEndRatio: loanProgram.backEndRatio,
          // price: loanProgram.price,
          price: purchaseInfo.purchasePrice,
          // interestRate: loanProgram.interestRate,
          interestRate: purchaseInfo.annualInterestRate,
          baseLoanAmount: loanProgram.baseLoanAmount,
          upmipRate: lenderFees.upfrontMipPercentage ? Number(lenderFees.upfrontMipPercentage) : 0,
          // upmipAmount: loanProgram.upmipAmount,
          upmipAmount: lenderFees.upfrontMip,
          finalLoanAmount: loanProgram.finalLoanAmount,
          // mmi: loanProgram.mmi,
          mmi: purchaseInfo.miPercent,
          term: loanProgram.term,
          downPaymentAmount: loanProgram.downPaymentAmount,
          // downPaymentPercentage: loanProgram.downPaymentPercentage,
          downPaymentPercentage: purchaseInfo.downPayment,
          clearingCart: loanProgram.clearingCart,
          propertyTax: prepaidItems.propertyTaxAmount,
          totalNeededToClear: loanProgram.totalNeededToClear,
          principalAndInterest: loanProgram.principalAndInterest,
          hazardInsurance: purchaseInfo.hazardInsurance ? Number(purchaseInfo.hazardInsurance) : 0,
          mortgageInsurance: loanProgram.mortgageInsurance,
          hoaFee: purchaseInfo.associationFee ? Number(purchaseInfo.associationFee) : 0,
          monthlyTotal: loanProgram.monthlyTotal,
          annualMIPRate: purchaseInfo.mipFundingFee,
          borrowers: loanProgram.borrowers.map((borrower) => ({
            monthlyIncome: borrower.monthlyIncome,
            debts: borrower.debts,
            ficoScore: borrower.ficoScore ? Number(borrower.ficoScore) : null,
          })),
        };

        if (scenarios.length > 1) {
          const isborrowerInfoValid = await methods.trigger(
            `scenarios.${index}.borrowerInfo`,
          );
          if (!isborrowerInfoValid) {
            console.log("isborrowerInfoValid");
            handleToggle(index, "borrowerInfo");
            return;
          }
          const isPurchaseInfoValid = await methods.trigger(
            `scenarios.${index}.purchaseInfo`,
          );
          if (!isPurchaseInfoValid) {
            console.log("isPurchaseInfoValid");
            handleToggle(index, "purchaseInfo");
            return;
          }
          if (firstPurchaseInfo.occupancyStatus === "3") {
            const ispropertyIncomeOffsetValid = await methods.trigger(
              `scenarios.${index}.propertyIncomeOffset`,
            );
            if (!ispropertyIncomeOffsetValid) {
              console.log("ispropertyIncomeOffsetValid");
              handleToggle(index, "propertyIncomeOffset");
              return;
            }
          }
          const islenderFeesValid = await methods.trigger(
            `scenarios.${index}.lenderFees`,
          );
          if (!islenderFeesValid) {
            console.log("islenderFeesValid");
            handleToggle(index, "lenderFees");
            return;
          }
          const isprepaidItemsValid = await methods.trigger(
            `scenarios.${index}.prepaidItems`,
          );
          if (!isprepaidItemsValid) {
            console.log("isprepaidItemsValid");
            handleToggle(index, "prepaidItems");
            return;
          }
          const ismiscFeesValid = await methods.trigger(
            `scenarios.${index}.miscFees`,
          );
          if (!ismiscFeesValid) {
            console.log("ismiscFeesValid");
            handleToggle(index, "miscFees");
            return;
          }
          const isborrowersIncomeDataValid = await methods.trigger(
            `scenarios.${index}.borrowersIncomeData`,
          );
          if (!isborrowersIncomeDataValid) {
            console.log("isborrowersIncomeDataValid");
            handleToggle(index, "borrowersIncomeData");
            return;
          }
          const isloanProgramValid = await methods.trigger(
            `scenarios.${index}.loanProgram`,
          );
          if (!isloanProgramValid) {
            console.log("isloanProgramValid");
            handleToggle(index, "loanProgram");
            return;
          }
          setIsloading(true);

          scenarioPayload.push({
            id: scenario.id ?? generateUUID(),
            scenarioOrder: scenarioIndex,
            scenarioName: "",
            createdAt: scenario.createdAt,
            updatedAt: getFormattedDate(),
            lastSubmittedFormNo: 2,
            refinance: null,
            purchase: {
              borrowerInfo: borrowerInfopayload,
              purchaseInfo: purchaseInfopayload,
              propertyIncomeOffset: propertyIncomeOffsetpayload,
              lenderFees: lenderFeespayload,
              prepaidItems: prepaidItemspayload,
              miscFees: miscFeespayload,
              borrowerIncomes: borrowersIncomeDatapayload,
              loanProgram: loanProgrampayload,
            },
          });
        } else {
          if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.purchase.borrowerInfo) {
            const isborrowerInfoValid = await methods.trigger(
              `scenarios.${index}.borrowerInfo`,
            );
            if (!isborrowerInfoValid) {
              console.log("isborrowerInfoValid");
              handleToggle(index, "borrowerInfo");
              return;
            }
          }
          if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.purchase.purchaseInfo) {
            const isPurchaseInfoValid = await methods.trigger(
              `scenarios.${index}.purchaseInfo`,
            );
            if (!isPurchaseInfoValid) {
              console.log("isPurchaseInfoValid");
              handleToggle(index, "purchaseInfo");
              return;
            }
          }
          if (firstPurchaseInfo.occupancyStatus === "3") {
            if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.purchase.lenderFees) {
              const ispropertyIncomeOffsetValid = await methods.trigger(
                `scenarios.${index}.propertyIncomeOffset`,
              );
              if (!ispropertyIncomeOffsetValid) {
                console.log("ispropertyIncomeOffsetValid");
                handleToggle(index, "propertyIncomeOffset");
                return;
              }
            }
          }
          if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.purchase.lenderFees) {
            const islenderFeesValid = await methods.trigger(
              `scenarios.${index}.lenderFees`,
            );
            if (!islenderFeesValid) {
              console.log("islenderFeesValid");
              handleToggle(index, "lenderFees");
              return;
            }
          }
          if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.purchase.prepaidItems) {
            const isprepaidItemsValid = await methods.trigger(
              `scenarios.${index}.prepaidItems`,
            );
            if (!isprepaidItemsValid) {
              console.log("isprepaidItemsValid");
              handleToggle(index, "prepaidItems");
              return;
            }
          }
          if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.purchase.miscFees) {
            const ismiscFeesValid = await methods.trigger(
              `scenarios.${index}.miscFees`,
            );
            if (!ismiscFeesValid) {
              console.log("ismiscFeesValid");
              handleToggle(index, "miscFees");
              return;
            }
          }
          if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.purchase.borrowerIncomes) {
            const isborrowersIncomeDataValid = await methods.trigger(
              `scenarios.${index}.borrowersIncomeData`,
            );
            if (!isborrowersIncomeDataValid) {
              console.log("isborrowersIncomeDataValid");
              handleToggle(index, "borrowersIncomeData");
              return;
            }
          }
          if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.purchase.loanProgram) {
            const isloanProgramValid = await methods.trigger(
              `scenarios.${index}.loanProgram`,
            );
            if (!isloanProgramValid) {
              console.log("isloanProgramValid");
              handleToggle(index, "loanProgram");
              return;
            }
          }
          if (expandedForms[index]?.borrowerInfo) {
            const isValid = await methods.trigger(
              `scenarios.${index}.borrowerInfo`,
            );
            if (!isValid) return;
            setIsloading(true);

            if (
              fetchedDataonSubmit &&
              fetchedDataonSubmit.data.lastSubmittedFormNo >= 1
            ) {
              scenarioPayload.push({
                id: scenario.id,
                scenarioOrder: scenarioIndex,
                scenarioName: "",
                createdAt: scenario.createdAt,
                updatedAt: getFormattedDate(),
                lastSubmittedFormNo: 1,
                refinance: null,
                purchase: {
                  borrowerInfo: borrowerInfopayload,
                  purchaseInfo: fetchedDataonSubmit.data.scenarios[index].purchase.purchaseInfo ? purchaseInfopayload : null,
                  propertyIncomeOffset: fetchedDataonSubmit.data.scenarios[0].purchase.propertyIncomeOffset ? propertyIncomeOffsetpayload : null,
                  lenderFees: fetchedDataonSubmit.data.scenarios[index].purchase.lenderFees ? lenderFeespayload : null,
                  prepaidItems: fetchedDataonSubmit.data.scenarios[index].purchase.prepaidItems ? prepaidItemspayload : null,
                  miscFees: fetchedDataonSubmit.data.scenarios[index].purchase.miscFees ? miscFeespayload : null,
                  borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].purchase.borrowerIncomes ? borrowersIncomeDatapayload : null,
                  loanProgram: fetchedDataonSubmit.data.scenarios[index].purchase.loanProgram ? loanProgrampayload : null,
                },
              });
            } else {
              scenarioPayload.push({
                id: generateUUID(),
                scenarioOrder: scenarioIndex,
                scenarioName: "",
                createdAt: getFormattedDate(),
                updatedAt: getFormattedDate(),
                lastSubmittedFormNo: 1,
                refinance: null,
                purchase: {
                  borrowerInfo: borrowerInfopayload,
                  purchaseInfo: null,
                  propertyIncomeOffset: null,
                  lenderFees: null,
                  prepaidItems: null,
                  miscFees: null,
                  borrowerIncomes: null,
                  loanProgram: null,
                },
              });
            }
          } else if (expandedForms[index]?.purchaseInfo) {
            const isValid = await methods.trigger(
              `scenarios.${index}.purchaseInfo`,
            );
            if (!isValid) return;
            setIsloading(true);

            scenarioPayload.push({
              id: scenario.id,
              scenarioOrder: scenarioIndex,
              scenarioName: "",
              createdAt: scenario.createdAt,
              updatedAt: getFormattedDate(),
              lastSubmittedFormNo: 2,
              refinance: null,
              purchase: {
                borrowerInfo: borrowerInfopayload,
                purchaseInfo: purchaseInfopayload,
                propertyIncomeOffset: fetchedDataonSubmit.data.scenarios[0].purchase.propertyIncomeOffset ? propertyIncomeOffsetpayload : null,
                lenderFees: fetchedDataonSubmit.data.scenarios[index].purchase.lenderFees ? lenderFeespayload : null,
                prepaidItems: fetchedDataonSubmit.data.scenarios[index].purchase.prepaidItems ? prepaidItemspayload : null,
                miscFees: fetchedDataonSubmit.data.scenarios[index].purchase.miscFees ? miscFeespayload : null,
                borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].purchase.borrowerIncomes ? borrowersIncomeDatapayload : null,
                loanProgram: fetchedDataonSubmit.data.scenarios[index].purchase.loanProgram ? loanProgrampayload : null,
              },
            });
          } else if (expandedForms[index]?.propertyIncomeOffset) {
            const isValid = await methods.trigger(
              `scenarios.${index}.propertyIncomeOffset`,
            );
            if (!isValid) return;
            setIsloading(true);

            scenarioPayload.push({
              id: scenario.id,
              scenarioOrder: scenarioIndex,
              scenarioName: "",
              createdAt: scenario.createdAt,
              updatedAt: getFormattedDate(),
              lastSubmittedFormNo: 2,
              refinance: null,
              purchase: {
                borrowerInfo: borrowerInfopayload,
                purchaseInfo: purchaseInfopayload,
                propertyIncomeOffset: propertyIncomeOffsetpayload,
                lenderFees: fetchedDataonSubmit.data.scenarios[index].purchase.lenderFees ? lenderFeespayload : null,
                prepaidItems: fetchedDataonSubmit.data.scenarios[index].purchase.prepaidItems ? prepaidItemspayload : null,
                miscFees: fetchedDataonSubmit.data.scenarios[index].purchase.miscFees ? miscFeespayload : null,
                borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].purchase.borrowerIncomes ? borrowersIncomeDatapayload : null,
                loanProgram: fetchedDataonSubmit.data.scenarios[index].purchase.loanProgram ? loanProgrampayload : null,
              },
            });
          } else if (expandedForms[index]?.lenderFees) {
            const isValid = await methods.trigger(
              `scenarios.${index}.lenderFees`,
            );
            if (!isValid) return;
            setIsloading(true);

            scenarioPayload.push({
              id: scenario.id,
              scenarioOrder: scenarioIndex,
              scenarioName: "",
              createdAt: scenario.createdAt,
              updatedAt: getFormattedDate(),
              lastSubmittedFormNo: 2,
              refinance: null,
              purchase: {
                borrowerInfo: borrowerInfopayload,
                purchaseInfo: purchaseInfopayload,
                propertyIncomeOffset: propertyIncomeOffsetpayload,
                lenderFees: lenderFeespayload,
                prepaidItems: fetchedDataonSubmit.data.scenarios[index].purchase.prepaidItems ? prepaidItemspayload : null,
                miscFees: fetchedDataonSubmit.data.scenarios[index].purchase.miscFees ? miscFeespayload : null,
                borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].purchase.borrowerIncomes ? borrowersIncomeDatapayload : null,
                loanProgram: fetchedDataonSubmit.data.scenarios[index].purchase.loanProgram ? loanProgrampayload : null,
              },
            });
          } else if (expandedForms[index]?.prepaidItems) {
            const isValid = await methods.trigger(
              `scenarios.${index}.prepaidItems`,
            );
            if (!isValid) return;
            setIsloading(true);

            scenarioPayload.push({
              id: scenario.id,
              scenarioOrder: scenarioIndex,
              scenarioName: "",
              createdAt: scenario.createdAt,
              updatedAt: getFormattedDate(),
              lastSubmittedFormNo: 2,
              refinance: null,
              purchase: {
                borrowerInfo: borrowerInfopayload,
                purchaseInfo: purchaseInfopayload,
                propertyIncomeOffset: propertyIncomeOffsetpayload,
                lenderFees: lenderFeespayload,
                prepaidItems: prepaidItemspayload,
                miscFees: fetchedDataonSubmit.data.scenarios[index].purchase.miscFees ? miscFeespayload : null,
                borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].purchase.borrowerIncomes ? borrowersIncomeDatapayload : null,
                loanProgram: fetchedDataonSubmit.data.scenarios[index].purchase.loanProgram ? loanProgrampayload : null,
              },
            });
          } else if (expandedForms[index]?.miscFees) {
            const isValid = await methods.trigger(
              `scenarios.${index}.miscFees`,
            );
            if (!isValid) return;
            setIsloading(true);

            scenarioPayload.push({
              id: scenario.id,
              scenarioOrder: scenarioIndex,
              scenarioName: "",
              createdAt: scenario.createdAt,
              updatedAt: getFormattedDate(),
              lastSubmittedFormNo: 2,
              refinance: null,
              purchase: {
                borrowerInfo: borrowerInfopayload,
                purchaseInfo: purchaseInfopayload,
                propertyIncomeOffset: propertyIncomeOffsetpayload,
                lenderFees: lenderFeespayload,
                prepaidItems: prepaidItemspayload,
                miscFees: miscFeespayload,
                borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].purchase.borrowerIncomes ? borrowersIncomeDatapayload : null,
                loanProgram: fetchedDataonSubmit.data.scenarios[index].purchase.loanProgram ? loanProgrampayload : null,
              },
            });
          } else if (expandedForms[index]?.borrowersIncomeData) {
            const isValid = await methods.trigger(
              `scenarios.${index}.borrowersIncomeData`,
            );
            if (!isValid) return;
            setIsloading(true);

            scenarioPayload.push({
              id: scenario.id,
              scenarioOrder: scenarioIndex,
              scenarioName: "",
              createdAt: scenario.createdAt,
              updatedAt: getFormattedDate(),
              lastSubmittedFormNo: 2,
              refinance: null,
              purchase: {
                borrowerInfo: borrowerInfopayload,
                purchaseInfo: purchaseInfopayload,
                propertyIncomeOffset: propertyIncomeOffsetpayload,
                lenderFees: lenderFeespayload,
                prepaidItems: prepaidItemspayload,
                miscFees: miscFeespayload,
                borrowerIncomes: borrowersIncomeDatapayload,
                loanProgram: fetchedDataonSubmit.data.scenarios[index].purchase.loanProgram ? loanProgrampayload : null,
              },
            });

            if (preApprovalId) {
              await refetchPreApprovalonSubmit();
            }
          } else if (expandedForms[index]?.loanProgram) {
            const isValid = await methods.trigger(
              `scenarios.${index}.loanProgram`,
            );
            if (!isValid) return;
            const isPurchaseInfoValid = await methods.trigger(
              `scenarios.${index}.purchaseInfo`,
            );
            if (!isPurchaseInfoValid) return;
            setIsloading(true);

            scenarioPayload.push({
              id: scenario.id,
              scenarioOrder: scenarioIndex,
              scenarioName: "",
              createdAt: scenario.createdAt,
              updatedAt: getFormattedDate(),
              lastSubmittedFormNo: 2,
              refinance: null,
              purchase: {
                borrowerInfo: borrowerInfopayload,
                purchaseInfo: purchaseInfopayload,
                propertyIncomeOffset: propertyIncomeOffsetpayload,
                lenderFees: lenderFeespayload,
                prepaidItems: prepaidItemspayload,
                miscFees: miscFeespayload,
                borrowerIncomes: borrowersIncomeDatapayload,
                loanProgram: loanProgrampayload,
              },
            });
          } else {
            const isborrowerInfoValid = await methods.trigger(
              `scenarios.${index}.borrowerInfo`,
            );
            if (!isborrowerInfoValid) {
              console.log("isborrowerInfoValid");
              handleToggle(index, "borrowerInfo");
              return;
            }
            const isPurchaseInfoValid = await methods.trigger(
              `scenarios.${index}.purchaseInfo`,
            );
            if (!isPurchaseInfoValid) {
              console.log("isPurchaseInfoValid");
              handleToggle(index, "purchaseInfo");
              return;
            }
            if (firstPurchaseInfo.occupancyStatus === "3") {
              const ispropertyIncomeOffsetValid = await methods.trigger(
                `scenarios.${index}.propertyIncomeOffset`,
              );
              if (!ispropertyIncomeOffsetValid) {
                console.log("ispropertyIncomeOffsetValid");
                handleToggle(index, "propertyIncomeOffset");
                return;
              }
            }
            const islenderFeesValid = await methods.trigger(
              `scenarios.${index}.lenderFees`,
            );
            if (!islenderFeesValid) {
              console.log("islenderFeesValid");
              handleToggle(index, "lenderFees");
              return;
            }
            const isprepaidItemsValid = await methods.trigger(
              `scenarios.${index}.prepaidItems`,
            );
            if (!isprepaidItemsValid) {
              console.log("isprepaidItemsValid");
              handleToggle(index, "prepaidItems");
              return;
            }
            const ismiscFeesValid = await methods.trigger(
              `scenarios.${index}.miscFees`,
            );
            if (!ismiscFeesValid) {
              console.log("ismiscFeesValid");
              handleToggle(index, "miscFees");
              return;
            }
            const isborrowersIncomeDataValid = await methods.trigger(
              `scenarios.${index}.borrowersIncomeData`,
            );
            if (!isborrowersIncomeDataValid) {
              console.log("isborrowersIncomeDataValid");
              handleToggle(index, "borrowersIncomeData");
              return;
            }
            const isloanProgramValid = await methods.trigger(
              `scenarios.${index}.loanProgram`,
            );
            if (!isloanProgramValid) {
              console.log("isloanProgramValid");
              handleToggle(index, "loanProgram");
              return;
            }
            setIsloading(true);

            scenarioPayload.push({
              id: scenario.id,
              scenarioOrder: scenarioIndex,
              scenarioName: "",
              createdAt: scenario.createdAt,
              updatedAt: getFormattedDate(),
              lastSubmittedFormNo: 2,
              refinance: null,
              purchase: {
                borrowerInfo: borrowerInfopayload,
                purchaseInfo: purchaseInfopayload,
                propertyIncomeOffset: propertyIncomeOffsetpayload,
                lenderFees: lenderFeespayload,
                prepaidItems: prepaidItemspayload,
                miscFees: miscFeespayload,
                borrowerIncomes: borrowersIncomeDatapayload,
                loanProgram: loanProgrampayload,
              },
            });
          }
        }
      }

      if (
        fetchedDataonSubmit &&
        fetchedDataonSubmit.data.lastSubmittedFormNo >= 1
      ) {
        preApprovalData = {
          id: preapprovalDetail.preApprovalId,
          userId: null,
          loanType: 0,
          status: status,
          createdAt: preapprovalDetail.createdAt,
          updatedAt: getFormattedDate(),
          lastSubmittedFormNo: 1,
          lastSubmittedScenarioNo: lastSubmittedScenarioNo,
          scenarios: scenarioPayload,
          statusUpdatedAt: preapprovalDetail.statusUpdatedAt
        };
      } else {
        preApprovalData = {
          id: null,
          userId: null,
          loanType: 0,
          status: status,
          createdAt: getFormattedDate(),
          updatedAt: getFormattedDate(),
          lastSubmittedFormNo: 1,
          lastSubmittedScenarioNo: lastSubmittedScenarioNo,
          scenarios: scenarioPayload,
          statusUpdatedAt: null
        };
      }

      response = await submitPreApproval(preApprovalData);

      if (response.data.scenarios.length > 1) {
        setIsComparebuttondisabled(false);
      }

      if (!response?.data) return;
      if (response.data.scenarios[0].purchase.loanProgram !== null) {
        setIsAddScenarioDisable(false);
        setIssaved(true);
        setIsPresenterModeDisabled(false);
      }

      const scenariosResponse = response.data.scenarios || [];

      const currentValues = methods.getValues();
      // console.log("scenariosResponse =>", scenariosResponse);
      // console.log("currentValues =>", currentValues);
      const updatedScenarios = currentValues.scenarios.map(
        (scenario, index) => {
          const apiScenario = scenariosResponse[index];

          if (!apiScenario) return scenario;

          return {
            ...scenario,
            id: apiScenario.id,
            createdAt: apiScenario.createdAt,
            updatedAt: apiScenario.updatedAt,
          };
        },
      );
      // console.log("updatedScenarios =>", updatedScenarios);

      methods.reset({
        ...currentValues,
        preapprovalDetail: {
          ...currentValues.preapprovalDetail,
          preApprovalId: response.data.id,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          statusUpdatedAt: response.data.statusUpdatedAt
        },
        scenarios: updatedScenarios,
      });
      // console.log("inside submit isFormDirty =>",isFormDirty);
      if (response?.data?.id) {
        setPreApprovalId(response.data.id);
      }

      if (response?.data?.scenarios) {
        response?.data?.scenarios.forEach((scenario: any, index: number) => {
          const formatedFetchedData = scenario;
          if (formatedFetchedData.purchase.loanProgram !== null) {
            setIsPDFbuttondisabled((prev) => ({ ...prev, [index]: false }));
          } else {
            setIsPDFbuttondisabled((prev) => ({ ...prev, [index]: true }));
          }
          // console.log("response scenario =>",scenario);

          // console.log("formatedFetchedData =>", formatedFetchedData);
        });
      }

      for (let index = 0; index < scenarios.length; index++) {
        const occupancyStatus = response?.data?.scenarios[0]?.purchase?.purchaseInfo?.occupancyStatus;
        if (expandedForms[index]?.borrowerInfo) {
          setCompletedForms((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              borrowerInfo: true,
            },
          }));

          expandNextForm(index, "borrowerInfo");
        }
        if (expandedForms[index]?.purchaseInfo) {
          setCompletedForms((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              purchaseInfo: true,
            },
          }));
          if (occupancyStatus && occupancyStatus != 3) {
            expandNextForm(index, "propertyIncomeOffset");
          } else {
            expandNextForm(index, "purchaseInfo");
          }
        }
        if (occupancyStatus && occupancyStatus == 3) {
          if (expandedForms[index]?.propertyIncomeOffset) {
            setCompletedForms((prev) => ({
              ...prev,
              [index]: {
                ...prev[index],
                propertyIncomeOffset: true,
              },
            }));

            expandNextForm(index, "propertyIncomeOffset");
          }
        }
        if (expandedForms[index]?.lenderFees) {
          setCompletedForms((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              lenderFees: true,
            },
          }));

          expandNextForm(index, "lenderFees");
        }
        if (expandedForms[index]?.prepaidItems) {
          setCompletedForms((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              prepaidItems: true,
            },
          }));

          expandNextForm(index, "prepaidItems");
        }
        if (expandedForms[index]?.miscFees) {
          setCompletedForms((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              miscFees: true,
            },
          }));

          expandNextForm(index, "miscFees");
        }
        if (expandedForms[index]?.borrowersIncomeData) {
          setCompletedForms((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              borrowersIncomeData: true,
            },
          }));

          expandNextForm(index, "borrowersIncomeData");
        }
        if (expandedForms[index]?.loanProgram) {
          setCompletedForms((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              loanProgram: true,
            },
          }));
        }
      }

      setIsloading(false);
      handleCreateSuccess();
      return;
    } catch (err) {
      console.error("Form submission failed:", err);
      handleError();
    }
  };

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsAndroid(/android/i.test(navigator.userAgent));
    }
  }, []);

  const handleClickOpen = (currentScenarioIndex: number | null) => {
    console.log("currentScenarioIndex =>", currentScenarioIndex);
    if (currentScenarioIndex !== null) {
      setCurrentScenarioIndex(currentScenarioIndex);
    } else {
      setCurrentScenarioIndex(null);
      setPdfName("Compare PDF");
    }
    setOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;
    console.log("formJson =>", formJson);

    const pdfname = formJson.pdfname;
    let language = "off";
    if (formJson.language === "on") {
      language = "on";
    }
    handleGenerate(pdfname, language);
    handleClose();
  };

  const handleGenerate = (pdfname: string, language: string) => {
    console.log("selectedPdf =>", selectedPdf);

    if (currentScenarioIndex !== null) {
      if (selectedPdf[currentScenarioIndex] === "preApproval") {
        if (preApprovalId) {
          generatePreApproval(preApprovalId, currentScenarioIndex, pdfname);
        }
      } else if (selectedPdf[currentScenarioIndex] === "FHAGFE") {
        if (preApprovalId) {
          generateFHAGFE(
            preApprovalId,
            currentScenarioIndex,
            pdfname,
            language,
          );
        }
      } else if (selectedPdf[currentScenarioIndex] === "quickQuote") {
        if (preApprovalId) {
          generateQuickQuote(
            preApprovalId,
            currentScenarioIndex,
            pdfname,
            language,
          );
        }
      } else if (selectedPdf[currentScenarioIndex] === "LoanFile") {
        if (preApprovalId) {
          generateLoanFile(
            preApprovalId,
            currentScenarioIndex,
            pdfname,
            language,
          );
        }
      } else if (selectedPdf[currentScenarioIndex] === "refinancequickQuote") {
        if (preApprovalId) {
          console.log("preApprovalId =>", preApprovalId);
          generateRefinanceQuickQuote(
            preApprovalId,
            currentScenarioIndex,
            pdfname,
            language,
          );
        }
      } else if (selectedPdf[currentScenarioIndex] === "refinanceFeeWorksheet") {
        if (preApprovalId) {
          console.log("preApprovalId =>", preApprovalId);
          generateRefinanceFeeWorksheet(
            preApprovalId,
            currentScenarioIndex,
            pdfname,
            language,
          );
        }
      } else if (selectedPdf[currentScenarioIndex] === "refinanceLoanFile") {
        if (preApprovalId) {
          console.log("preApprovalId =>", preApprovalId);
          generateRefinanceLoanFile(
            preApprovalId,
            currentScenarioIndex,
            pdfname,
            language,
          );
        }
      }
    } else {
      if (preApprovalId) {
        if (tabValue == 0) {
          generateCompare(preApprovalId, pdfname, language);
        } else if (tabValue == 1) {
          generateRefinanceCompare(preApprovalId, pdfname, language);
        }
      }
    }
  };

  const { refetch: refetchProfile } = useGetProfile(false);
  // enabled: false so it doesn't auto-fire on mount; we trigger it manually below

  const generatePreApproval = async (
    preApprovalId: string,
    currentScenarioIndex: number,
    pdfName: string,
  ) => {
    // setPreApprovalloading(true);
    setPreApprovalloading((prev) => ({
      ...prev,
      [currentScenarioIndex]: true,
    }));

    try {
      const currentScenarioId = methods.getValues(
        `scenarios.${currentScenarioIndex}.id`,
      );
      if (!currentScenarioId) return;
      const response = await getpreApprovalReport(
        preApprovalId,
        currentScenarioId,
      );
      const preApprovalReportData = response.data.data;

      const profileBase64 = preApprovalReportData.agentInfo.profile
        ? await toBase64FromUrl(preApprovalReportData.agentInfo.profile)
        : "";

      const mockData = {
        agentName: `${preApprovalReportData.agentInfo.firstName} ${preApprovalReportData.agentInfo.lastName}`,
        agentjobTitle: preApprovalReportData.agentInfo.jobTitle || "",
        agentnmls: preApprovalReportData.agentInfo.nmls || "",
        agentphone: formatUSPhoneNumber(
          preApprovalReportData.agentInfo.phone || "",
        ),
        agentemail: preApprovalReportData.agentInfo.email || "",
        agentcompanyname: preApprovalReportData.agentInfo.companyName || "",
        agentprofile: profileBase64,
        borrowerName: preApprovalReportData.borrowerName,
        borrowers: preApprovalReportData.borrowers,
        date: formatDate(preApprovalReportData.date),
        downPaymentAmount: formatAmount(
          preApprovalReportData.downPaymentAmount,
        ),
        downPaymentPercentage: preApprovalReportData.downPaymentPercentage,
        firstMortgageAmount: formatAmount(
          preApprovalReportData.firstMortgageAmount,
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
      openErrorDialog(`Failed to generate PDF.${err}`);
      console.error("PDF generation failed", err);
    } finally {
      // setPreApprovalloading(false);
      setPreApprovalloading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }
  };

  const generateFHAGFE = async (
    preApprovalId: string,
    currentScenarioIndex: number,
    pdfName: string,
    language: string,
  ) => {
    // setFHAGFELoading(true);
    setFHAGFELoading((prev) => ({
      ...prev,
      [currentScenarioIndex]: true,
    }));

    try {
      // 1. Fetch user/profile data first
      const { data: profileResult, isError: profileError } = await refetchProfile();
      if (profileError || !profileResult) {
        throw new Error("Failed to fetch user profile data");
      }
      const profileData = profileResult?.data;

      // 2. Once profile data is available, proceed to fetch the report
      const currentScenarioId = methods.getValues(
        `scenarios.${currentScenarioIndex}.id`,
      );
      if (!currentScenarioId) return;
      const response = await getFHAGFEReport(preApprovalId, currentScenarioId);
      const FHAGFEReportData = response.data.data;
      const prepaidInterestPerDay =
        FHAGFEReportData.estimatedClosingCost.prepaidInterest /
        FHAGFEReportData.estimatedClosingCost.prepaidInterestDays;
      const hazInsPremiumMonthly =
        FHAGFEReportData.estimatedClosingCost.hazInsPremium / 12;
      const { earnestMoneyDeposit, sellerCredit, lenderCredit } =
        FHAGFEReportData.estimatedClosingCost;
      console.log(FHAGFEReportData);

      const FHAGFEPDFData = {
        spanish: language === "on" ? true : false,
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
        coverageRate: formatAmount(FHAGFEReportData.coverageRate),
        totalMonthlyPayment: formatAmount(FHAGFEReportData.totalMonthlyPayment),
        hoaDues: formatAmount(FHAGFEReportData.hoaDues),
        appraisalFee: formatAmount(
          FHAGFEReportData.estimatedClosingCost.appraisalFee,
        ),
        discountFee: formatAmount(
          FHAGFEReportData.estimatedClosingCost.discountFee,
        ),
        discountFeePercent:
          FHAGFEReportData.estimatedClosingCost.discountFeePercent,
        prepaidInterest: formatAmount(
          FHAGFEReportData.estimatedClosingCost.prepaidInterest,
        ),
        hazInsReserve: formatAmount(
          FHAGFEReportData.estimatedClosingCost.hazInsReserve,
        ),
        hazInsReserveMonths:
          FHAGFEReportData.estimatedClosingCost.hazInsReserveMonths,
        originationFee: formatAmount(
          FHAGFEReportData.estimatedClosingCost.originationFee,
        ),
        originationFeePercent:
          FHAGFEReportData.estimatedClosingCost.originationFeePercent,
        escrowFees: formatAmount(
          FHAGFEReportData.estimatedClosingCost.escrowFees,
        ),
        ppdPropTaxes: formatAmount(
          FHAGFEReportData.estimatedClosingCost.ppdPropTaxes,
        ),
        ppdPropTaxesMonths:
          FHAGFEReportData.estimatedClosingCost.ppdPropTaxesMonths,
        titleInsurance: formatAmount(
          FHAGFEReportData.estimatedClosingCost.titleInsurance,
        ),
        thirdPartyLenderFee: formatAmount(
          FHAGFEReportData.estimatedClosingCost.thirdPartyLenderFee,
        ),
        estClosingCost: formatAmount(
          FHAGFEReportData.estimatedClosingCost.estClosingCost,
        ),
        estPrepaidItemReserves: formatAmount(
          FHAGFEReportData.estimatedClosingCost.estPrepaidItemReserves,
        ),
        hazInsPremium: formatAmount(
          FHAGFEReportData.estimatedClosingCost.hazInsPremium,
        ),
        hazInsPremiumMonthly: formatAmount(hazInsPremiumMonthly),
        totalEstSettlementCharges: formatAmount(
          FHAGFEReportData.estimatedClosingCost.totalEstSettlementCharges,
        ),
        earnestMoneyDeposit:
          earnestMoneyDeposit != null && earnestMoneyDeposit > 0
            ? formatAmount(earnestMoneyDeposit)
            : "",
        sellerCredit:
          sellerCredit != null && sellerCredit > 0
            ? formatAmount(sellerCredit)
            : "",
        lenderCredit:
          lenderCredit != null && lenderCredit > 0
            ? formatAmount(lenderCredit)
            : "",
        totalEstFundToClose: formatAmount(
          FHAGFEReportData.estimatedClosingCost.totalEstFundToClose,
        ),
        prepaidInterestDays:
          FHAGFEReportData.estimatedClosingCost.prepaidInterestDays,
        prepaidInterestPerDay: formatAmount(prepaidInterestPerDay),
        lockRequested: true,
        lockRate: FHAGFEReportData.interestRate,
        lockExpiration: formatDate(FHAGFEReportData.expirationDate),
        // Agent header fields from profile
        agentName: `${profileData?.firstName ?? ""} ${profileData?.lastName ?? ""}`.trim(),
        agentNmls: profileData?.nmls ?? "",
        agentPhone: profileData?.phone ?? "",
        agentEmail: profileData?.email ?? "",
        agentProfile: profileData?.profile ?? "",
        agentInitials: `${profileData?.firstName?.[0] ?? ""}${profileData?.lastName?.[0] ?? ""}`.toUpperCase(),
      };

      const blob = await pdf(<FHAGFEPDF data={FHAGFEPDFData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (err) {
      openErrorDialog(`Failed to generate PDF.${err}`);
      console.error("PDF generation failed", err);
    } finally {
      // setPreApprovalloading(false);
      setPreApprovalloading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }

    // Simulate async action
    setTimeout(() => {
      // setFHAGFELoading(false);
      setFHAGFELoading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }, 2000);
  };

  const generateQuickQuote = async (
    preApprovalId: string,
    currentScenarioIndex: number,
    pdfName: string,
    language: string,
  ) => {
    // setQuickQuoteloading(true);
    setQuickQuoteloading((prev) => ({
      ...prev,
      [currentScenarioIndex]: true,
    }));

    try {
      // 1. Fetch user/profile data first
      const { data: profileResult, isError: profileError } = await refetchProfile();
      if (profileError || !profileResult) {
        throw new Error("Failed to fetch user profile data");
      }
      const profileData = profileResult?.data;

      const currentScenarioId = methods.getValues(
        `scenarios.${currentScenarioIndex}.id`,
      );
      if (!currentScenarioId) return;

      const response = await getquickQuoteReport(
        preApprovalId,
        currentScenarioId,
      );
      const quickQuoteReportData = response.data.data;
      const { earnestMoneyDeposit, sellerCredit, lenderCredit, miscFee4 } =
        quickQuoteReportData;

      // const profileBase64 = preApprovalReportData.agentInfo.profile
      //   ? await toBase64FromUrl(preApprovalReportData.agentInfo.profile)
      //   : "";

      const quickQuoteData = {
        spanish: language === "on" ? true : false,
        loanProgram:
          loanProgramNames[
          quickQuoteReportData.loanProgram as keyof typeof loanProgramNames
          ] || "",
        homeValue: formatAmount(quickQuoteReportData.homeValue),
        interestRate: quickQuoteReportData.interestRate,
        downPayment: quickQuoteReportData.downPaymentPercent,
        principalInterest: formatAmount(
          quickQuoteReportData.principalAndInterest,
        ),
        propertyTax: formatAmount(quickQuoteReportData.propertyTax),
        hazardInsurance: formatAmount(quickQuoteReportData.hazardInsurance),
        mortgageInsurance: formatAmount(quickQuoteReportData.mortgageInsurance),
        hoaFee: formatAmount(quickQuoteReportData.hoaFee),
        monthlyTotal: formatAmount(quickQuoteReportData.monthlyTotal),
        closingDownPayment: formatAmount(quickQuoteReportData.downPayment),
        closingCosts: formatAmount(quickQuoteReportData.closingCosts),
        prepaids: formatAmount(quickQuoteReportData.prepaids),
        earnestMoneyDeposit:
          earnestMoneyDeposit != null && earnestMoneyDeposit > 0
            ? formatAmount(earnestMoneyDeposit)
            : "",
        sellerCredit:
          sellerCredit != null && sellerCredit > 0
            ? formatAmount(sellerCredit)
            : "",
        lenderCredit:
          lenderCredit != null && lenderCredit > 0
            ? formatAmount(lenderCredit)
            : "",
        miscFee4:
          miscFee4 != null && miscFee4 > 0 ? formatAmount(miscFee4) : "",
        totalRequired: formatAmount(quickQuoteReportData.totalRequired),
        // Agent header fields from profile
        agentName: `${profileData?.firstName ?? ""} ${profileData?.lastName ?? ""}`.trim(),
        agentNmls: profileData?.nmls ?? "",
        agentPhone: profileData?.phone ?? "",
        agentEmail: profileData?.email ?? "",
        agentProfile: profileData?.profile ?? "",
        agentInitials: `${profileData?.firstName?.[0] ?? ""}${profileData?.lastName?.[0] ?? ""}`.toUpperCase(),
        borrowerName: quickQuoteReportData.borrowerName ?? "",
      };

      console.log(quickQuoteData);

      const blob = await pdf(<QuickQuotePDF data={quickQuoteData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (err) {
      openErrorDialog(`Failed to generate PDF.${err}`);
      console.error("PDF generation failed", err);
    } finally {
      // setQuickQuoteloading(false);
      setQuickQuoteloading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }
  };

  const generateLoanFile = async (
    preApprovalId: string,
    currentScenarioIndex: number,
    pdfName: string,
    language: string,
  ) => {
    setLoanFileLoading((prev) => ({
      ...prev,
      [currentScenarioIndex]: true,
    }));

    try {
      const currentScenarioId = methods.getValues(
        `scenarios.${currentScenarioIndex}.id`,
      );
      if (!currentScenarioId) return;
      const response = await getRefinanceLoanFileReport(
        preApprovalId,
        currentScenarioId
      );
      const fetchedXmlData = response.data.data.xmlData;
      setXmlData(fetchedXmlData ?? null);
      setXmlReportOpen(true);
    } catch (err) {
      openErrorDialog(`Failed to generate PDF.${err}`);
      console.error("PDF generation failed", err);
    } finally {
      setLoanFileLoading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }

    // Simulate async action
    setTimeout(() => {
      // setFHAGFELoading(false);
      setLoanFileLoading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }, 2000);
  };

  const generateRefinanceQuickQuote = async (
    preApprovalId: string,
    currentScenarioIndex: number,
    pdfName: string,
    language: string,
  ) => {
    setRefinanceQuickQuoteloading((prev) => ({
      ...prev,
      [currentScenarioIndex]: true,
    }));

    try {
      // 1. Fetch user/profile data first
      const { data: profileResult, isError: profileError } = await refetchProfile();
      if (profileError || !profileResult) {
        throw new Error("Failed to fetch user profile data");
      }
      const profileData = profileResult?.data;

      const response = await getRefinancequickQuoteReport(
        preApprovalId,
      );
      const refinanceQuickQuoteResponse = response.data.data;
      const refinanceQuickQuoteReportData = refinanceQuickQuoteResponse.scenarios[currentScenarioIndex].refinance;
      const firstrefinanceQuickQuoteReportData = refinanceQuickQuoteResponse.scenarios[0].refinance;

      const newLoanAmount =
        refinanceQuickQuoteReportData.refinanceInfo.currentLoanBalance +
        refinanceQuickQuoteReportData.loanProgram.closingCosts +
        refinanceQuickQuoteReportData.refinanceInfo.desiredCashOut;

      const totalDebtToBePaidOff = firstrefinanceQuickQuoteReportData?.borrowerIncomes
        ?.flatMap((borrower: RefinanceBorrowerIncomeEntry) => borrower.debts)
        ?.filter((debt: RefinanceDebtEntry) => debt.debtToBePaidOff === true)
        ?.reduce((sum: number, debt: RefinanceDebtEntry) => sum + debt.monthlyPayment, 0) ?? 0;

      // const cashToClose =
      //   refinanceQuickQuoteReportData.refinanceInfo.loanAmount -
      //   refinanceQuickQuoteReportData.refinanceInfo.currentLoanBalance -
      //   refinanceQuickQuoteReportData.loanProgram.closingCosts -
      //   totalDebtToBePaidOff;
      console.log("refinanceQuickQuoteData =>", refinanceQuickQuoteReportData);

      let cashToClose = 0;
      if (firstrefinanceQuickQuoteReportData.loanStructure.loanProgram == 5) {
        cashToClose =
          firstrefinanceQuickQuoteReportData.refinanceInfo.currentDrawAmount -
          firstrefinanceQuickQuoteReportData.loanProgram.closingCosts -
          totalDebtToBePaidOff;
      } else {
        cashToClose =
          firstrefinanceQuickQuoteReportData.refinanceInfo.loanAmount -
          firstrefinanceQuickQuoteReportData.loanProgram.closingCosts -
          totalDebtToBePaidOff;
      }

      console.log("refinanceQuickQuoteReportData =>", refinanceQuickQuoteReportData);


      const quickQuoteData = {
        spanish: language === "on" ? true : false,
        loanProgram: refinanceQuickQuoteReportData.loanStructure.loanProgram,
        refiType: refinanceQuickQuoteReportData.refinanceInfo.refinanceType,
        homeValue: formatAmount(refinanceQuickQuoteReportData.refinanceInfo.estimatedPropertyValue),
        currentLoanBalance: formatAmount(refinanceQuickQuoteReportData.refinanceInfo.currentLoanBalance),
        loanAmount: formatAmount(refinanceQuickQuoteReportData.refinanceInfo.loanAmount),
        currentDrawAmount: formatAmount(refinanceQuickQuoteReportData.refinanceInfo.currentDrawAmount),
        interestRate: refinanceQuickQuoteReportData.refinanceInfo.interestRate,
        term: refinanceQuickQuoteReportData.loanProgram.term,
        principalInterest: formatAmount(
          refinanceQuickQuoteReportData.loanProgram.principalAndInterest,
        ),
        propertyTax: formatAmount(refinanceQuickQuoteReportData.loanProgram.monthlyPropertyTax),
        hazardInsurance: formatAmount(refinanceQuickQuoteReportData.loanProgram.hazardInsurance),
        hoaFee: formatAmount(refinanceQuickQuoteReportData.refinanceInfo.associationFee),
        monthlyTotal: formatAmount(refinanceQuickQuoteReportData.loanProgram.monthlyTotal),
        ltv: formatDecimal(refinanceQuickQuoteReportData.refinanceInfo.ltv),
        currentpropertytax: formatAmount(refinanceQuickQuoteReportData.refinanceInfo.monthlyTaxAmount),
        mortgageInsurance: formatAmount(refinanceQuickQuoteReportData.refinanceInfo.mi),
        totalMonthlyPayment: formatAmount(0),
        estimatedMonthlySavings: formatAmount(refinanceQuickQuoteReportData.refinanceInfo.monthlyTaxAmount + refinanceQuickQuoteReportData.refinanceInfo.mi),
        estimatedClosingCosts: formatAmount(refinanceQuickQuoteReportData.loanProgram.closingCosts),
        totalClosingCosts: formatAmount(refinanceQuickQuoteReportData.loanProgram.closingCosts),
        newLoanAmount: formatAmount(newLoanAmount),
        cashToClose: formatAmount(cashToClose),
        cashToCloseIsPositive: cashToClose > 0 ? true : false,
        totalDebtToBePaidOff: formatAmount(totalDebtToBePaidOff),
        // Agent header fields from profile
        agentName: `${profileData?.firstName ?? ""} ${profileData?.lastName ?? ""}`.trim(),
        agentNmls: profileData?.nmls ?? "",
        agentPhone: profileData?.phone ?? "",
        agentEmail: profileData?.email ?? "",
        agentProfile: profileData?.profile ?? "",
        agentInitials: `${profileData?.firstName?.[0] ?? ""}${profileData?.lastName?.[0] ?? ""}`.toUpperCase(),
        borrowerName: refinanceQuickQuoteReportData.borrowerName ?? "",
      };

      console.log(quickQuoteData);

      const blob = await pdf(<RefinanceQuickQuotePDF data={quickQuoteData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (err) {
      openErrorDialog(`Failed to generate PDF.${err}`);
      console.error("PDF generation failed", err);
    } finally {
      setRefinanceQuickQuoteloading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }
  };

  const generateRefinanceFeeWorksheet = async (
    preApprovalId: string,
    currentScenarioIndex: number,
    pdfName: string,
    language: string,
  ) => {
    setRefinanceFeeWorksheetloading((prev) => ({
      ...prev,
      [currentScenarioIndex]: true,
    }));

    try {
      // 1. Fetch user/profile data first
      const { data: profileResult, isError: profileError } = await refetchProfile();
      if (profileError || !profileResult) {
        throw new Error("Failed to fetch user profile data");
      }
      const profileData = profileResult?.data;

      const response = await getRefinanceFeeWorksheetReport(
        preApprovalId,
      );
      const refinanceFeeWorksheetResponse = response.data.data;
      const refinanceFeeWorksheetReportData = refinanceFeeWorksheetResponse.scenarios[currentScenarioIndex].refinance;
      const firstrefinanceFeeWorksheetReportData = refinanceFeeWorksheetResponse.scenarios[0].refinance;
      console.log("refinanceFeeWorksheetResponse =>", refinanceFeeWorksheetResponse);

      const newLoanAmount =
        refinanceFeeWorksheetReportData.refinanceInfo.currentLoanBalance +
        refinanceFeeWorksheetReportData.loanProgram.closingCosts +
        refinanceFeeWorksheetReportData.refinanceInfo.desiredCashOut;

      // const cashToClose =
      //   newLoanAmount -
      //   refinanceFeeWorksheetReportData.loanProgram.closingCosts -
      //   refinanceFeeWorksheetReportData.refinanceInfo.currentLoanBalance;

      const totalDebtToBePaidOff = firstrefinanceFeeWorksheetReportData?.borrowerIncomes
        ?.flatMap((borrower: RefinanceBorrowerIncomeEntry) => borrower.debts)
        ?.filter((debt: RefinanceDebtEntry) => debt.debtToBePaidOff === true)
        ?.reduce((sum: number, debt: RefinanceDebtEntry) => sum + debt.monthlyPayment, 0) ?? 0;

      // const cashToClose =
      //   refinanceFeeWorksheetReportData.refinanceInfo.loanAmount -
      //   refinanceFeeWorksheetReportData.refinanceInfo.currentLoanBalance -
      //   refinanceFeeWorksheetReportData.loanProgram.closingCosts -
      //   totalDebtToBePaidOff;
      console.log("totalDebtToBePaidOff=>", totalDebtToBePaidOff);
      let cashToClose = 0;
      if (refinanceFeeWorksheetReportData.loanStructure.loanProgram == 5) {
        cashToClose =
          refinanceFeeWorksheetReportData.refinanceInfo.currentDrawAmount -
          refinanceFeeWorksheetReportData.loanProgram.closingCosts -
          totalDebtToBePaidOff;
      } else {
        cashToClose =
          refinanceFeeWorksheetReportData.refinanceInfo.loanAmount -
          refinanceFeeWorksheetReportData.loanProgram.closingCosts -
          totalDebtToBePaidOff;
      }

      // ── New derived values for redesigned PDF ──
      const _rawCurrentBalance = refinanceFeeWorksheetReportData.refinanceInfo.currentLoanBalance;
      const _rawLoanAmount = refinanceFeeWorksheetReportData.refinanceInfo.loanAmount;
      const _rawHomeValue = refinanceFeeWorksheetReportData.refinanceInfo.estimatedPropertyValue;
      const _lienPosMapPdf: Record<string, string> = { "1": "First Lien", "2": "Second Lien" };
      const _lienPosLabelPdf = _lienPosMapPdf[String(refinanceFeeWorksheetReportData.loanStructure.lienPosition ?? "")] ?? "";
      const _loanTypeNamePdf = loanProgramNames[refinanceFeeWorksheetReportData.loanStructure.loanProgram as keyof typeof loanProgramNames] || "";
      const _totalCombined = _rawCurrentBalance + _rawLoanAmount;
      const _ltv = _rawHomeValue > 0 ? (_totalCombined / _rawHomeValue * 100) : 0;
      const totalCombinedDebt = `$${formatAmount(_totalCombined)} (${_ltv.toFixed(2)}%)`;
      const aboutNote = _lienPosLabelPdf
        ? `This is a ${_loanTypeNamePdf} in ${_lienPosLabelPdf.toLowerCase()} position. Your existing first mortgage of $${formatAmount(_rawCurrentBalance)} will remain in place and a new ${_lienPosLabelPdf.toLowerCase()} loan of $${formatAmount(_rawLoanAmount)} will be added. Total combined loan amount is $${formatAmount(_totalCombined)}.`
        : `This is a ${_loanTypeNamePdf} refinance. The new loan amount is $${formatAmount(_rawLoanAmount)}.`;
      const transactionRows = [
        ...(_lienPosLabelPdf === "Second Lien" ? [{
          lienPosition: "1st Lien",
          loanType: "First Mortgage (Existing)",
          loanAmount: `$${formatAmount(_rawCurrentBalance)}`,
          interestRate: "\u2014",
          loanTerm: "\u2014",
          monthlyPandI: "\u2014",
          status: "Remains in Place",
        }] : []),
        {
          lienPosition: _lienPosLabelPdf === "Second Lien" ? "2nd Lien" : "1st Lien",
          loanType: _loanTypeNamePdf,
          loanAmount: `$${formatAmount(_rawLoanAmount)}`,
          interestRate: `${refinanceFeeWorksheetReportData.refinanceInfo.interestRate}%`,
          loanTerm: `${refinanceFeeWorksheetReportData.loanProgram.term} Years`,
          monthlyPandI: `$${formatAmount(refinanceFeeWorksheetReportData.loanProgram.principalAndInterest)}`,
          status: "New Loan",
        },
      ];

      const refinanceFeeWorksheetPDFData = {
        spanish: language === "on" ? true : false,
        borrower: refinanceFeeWorksheetReportData.borrowerInfo.borrowerName,
        loanProgram: refinanceFeeWorksheetReportData.loanStructure.loanProgram,
        loanType:
          loanProgramNames[
          refinanceFeeWorksheetReportData.loanStructure.loanProgram as keyof typeof loanProgramNames
          ] || "",
        refiType: refinanceFeeWorksheetReportData.refinanceInfo.refinanceType,
        lienPosition: (() => {
          const lienPosMap: Record<string, string> = { "1": "First Lien", "2": "Second Lien" };
          return lienPosMap[String(refinanceFeeWorksheetReportData.loanStructure.lienPosition ?? "")] ?? "";
        })(),
        loanPurpose: (() => {
          const refiTypeMap: Record<string, string> = { "1": "Rate and Term", "2": "Cash-Out" };
          const lienPosMap: Record<string, string> = { "1": "First Lien", "2": "Second Lien" };
          const rt = String(refinanceFeeWorksheetReportData.refinanceInfo.refinanceType ?? "");
          const lp = String(refinanceFeeWorksheetReportData.loanStructure.lienPosition ?? "");
          const rtLabel = refiTypeMap[rt] ?? rt;
          const lpLabel = lienPosMap[lp];
          return lpLabel ? `${rtLabel} Refinance (${lpLabel})` : `${rtLabel} Refinance`;
        })(),
        date: formatDate(new Date().toISOString()),
        propertyAddress: "TBD",
        homeValue: formatAmount(refinanceFeeWorksheetReportData.refinanceInfo.estimatedPropertyValue),
        currentLoanBalance: formatAmount(refinanceFeeWorksheetReportData.refinanceInfo.currentLoanBalance),
        loanAmount: formatAmount(refinanceFeeWorksheetReportData.refinanceInfo.loanAmount),
        currentDrawLimit: formatAmount(refinanceFeeWorksheetReportData.refinanceInfo.currentDrawAmount),
        interestRate: refinanceFeeWorksheetReportData.refinanceInfo.interestRate,
        loanTerm: refinanceFeeWorksheetReportData.loanProgram.term,
        principalInterest: formatAmount(
          refinanceFeeWorksheetReportData.loanProgram.principalAndInterest,
        ),
        propertyTax: formatAmount(refinanceFeeWorksheetReportData.loanProgram.monthlyPropertyTax),
        hazardInsurance: formatAmount(refinanceFeeWorksheetReportData.loanProgram.hazardInsurance),
        mortgageInsurance: formatAmount(refinanceFeeWorksheetReportData.refinanceInfo.mi),
        hoaFee: formatAmount(refinanceFeeWorksheetReportData.refinanceInfo.associationFee),
        monthlyTotal: formatAmount(refinanceFeeWorksheetReportData.loanProgram.monthlyTotal),
        originationFee: formatAmount(
          refinanceFeeWorksheetReportData.lenderFees.loanOriginationFee,
        ),
        originationFeePercent:
          refinanceFeeWorksheetReportData.lenderFees.loanOriginationFeePercent,
        discountFee: formatAmount(
          refinanceFeeWorksheetReportData.lenderFees.discountFee,
        ),
        discountFeePercent:
          refinanceFeeWorksheetReportData.lenderFees.discountFeePercentage,
        appraisalFee: formatAmount(
          refinanceFeeWorksheetReportData.lenderFees.appraisalFee,
        ),
        escrowFees: formatAmount(
          refinanceFeeWorksheetReportData.lenderFees.escrowFees,
        ),
        titleFees: formatAmount(
          refinanceFeeWorksheetReportData.lenderFees.titleFees,
        ),
        thirdPartyLenderFee: formatAmount(
          refinanceFeeWorksheetReportData.lenderFees.thirdPartyLenderFee,
        ),
        totalClosingCosts: formatAmount(refinanceFeeWorksheetReportData.loanProgram.closingCosts),
        newLoanAmount: formatAmount(newLoanAmount),
        cashToClose: formatAmount(cashToClose),
        cashToCloseIsPositive: cashToClose > 0 ? true : false,
        totalDebtToBePaidOff: formatAmount(totalDebtToBePaidOff),
        // New fields for redesigned PDF
        totalCombinedDebt,
        firstMortgagePayoff: "0.00",
        otherCostsPaidByBorrower: formatAmount(totalDebtToBePaidOff),
        aboutNote,
        transactionRows,
        // Agent header fields from profile
        agentName: `${profileData?.firstName ?? ""} ${profileData?.lastName ?? ""}`.trim(),
        agentNmls: profileData?.nmls ?? "",
        agentPhone: profileData?.phone ?? "",
        agentEmail: profileData?.email ?? "",
        agentProfile: profileData?.profile ?? "",
        agentInitials: `${profileData?.firstName?.[0] ?? ""}${profileData?.lastName?.[0] ?? ""}`.toUpperCase(),
      };

      const blob = await pdf(<RefinanceFeeWorksheetPDF data={refinanceFeeWorksheetPDFData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (err) {
      openErrorDialog(`Failed to generate PDF.${err}`);
      console.error("PDF generation failed", err);
    } finally {
      setRefinanceFeeWorksheetloading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }

    // Simulate async action
    setTimeout(() => {
      // setFHAGFELoading(false);
      setFHAGFELoading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }, 2000);
  };

  const generateRefinanceLoanFile = async (
    preApprovalId: string,
    currentScenarioIndex: number,
    pdfName: string,
    language: string,
  ) => {
    setRefinanceLoanFileloading((prev) => ({
      ...prev,
      [currentScenarioIndex]: true,
    }));

    try {
      const currentScenarioId = refinanceMethods.getValues(
        `scenarios.${currentScenarioIndex}.id`,
      );
      if (!currentScenarioId) return;
      const response = await getRefinanceLoanFileReport(
        preApprovalId,
        currentScenarioId
      );
      const fetchedXmlData = response.data.data.xmlData;
      setXmlData(fetchedXmlData ?? null);
      setXmlReportOpen(true);
    } catch (err) {
      openErrorDialog(`Failed to generate PDF.${err}`);
      console.error("PDF generation failed", err);
    } finally {
      setRefinanceLoanFileloading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }

    // Simulate async action
    setTimeout(() => {
      // setFHAGFELoading(false);
      setRefinanceLoanFileloading((prev) => ({
        ...prev,
        [currentScenarioIndex]: false,
      }));
    }, 2000);
  };

  const generateCompare = async (
    preApprovalId: string,
    pdfName: string,
    language: string,
  ) => {
    console.log(preApprovalId);
    console.log(pdfName);
    console.log(language);

    setCompareLoading(true);

    try {
      type ComparisonDataType = {
        spanish: (boolean)[];
        loanProgram: (string | number)[];
        price: (string | number)[];
        annualInterestRate: (string | number)[];
        loanAmount: (string | number)[];
        upmipRate: (string | number)[];
        upmipAmount: (string | number)[];
        annualMIPRate: (string | number)[];
        finalLoanAmount: (string | number)[];
        mmi: (string | number)[];
        term: (string | number)[];
        principalAndInterest: (string | number)[];
        monthlyPropertyTax: (string | number)[];
        hazardInsurance: (string | number)[];
        mortgageInsurance: (string | number)[];
        associationFee: (string | number)[];
        monthlyTotal: (string | number)[];
        downPayment: (string | number)[];
        downPaymentAmount: (string | number)[];
        clearingCart: (string | number)[];
        propertyTax: (string | number)[];
        earnestMoneyDeposit: (string | number)[];
        sellerCredit: (string | number)[];
        lenderCredit: (string | number)[];
        totalNeededToClear: (string | number)[];
      };
      const ComparisonData: ComparisonDataType = {
        spanish: [],
        loanProgram: [],
        price: [],
        annualInterestRate: [],
        loanAmount: [],
        upmipRate: [],
        upmipAmount: [],
        annualMIPRate: [],
        finalLoanAmount: [],
        mmi: [],
        term: [],
        principalAndInterest: [],
        monthlyPropertyTax: [],
        hazardInsurance: [],
        mortgageInsurance: [],
        associationFee: [],
        monthlyTotal: [],
        downPayment: [],
        downPaymentAmount: [],
        clearingCart: [],
        propertyTax: [],
        earnestMoneyDeposit: [],
        sellerCredit: [],
        lenderCredit: [],
        totalNeededToClear: [],
      };
      const fetchedDataonGenerate = await refetchPreApprovalonGenerate();
      const response = fetchedDataonGenerate.data.data.scenarios;

      console.log(
        "fetchedDataonGenerate from generate =>",
        fetchedDataonGenerate.data.data.scenarios,
      );

      response.forEach((data: any) => {
        ComparisonData.spanish.push(language === "on" ? true : false),
          ComparisonData.loanProgram.push(
            loanProgramNames[
            data.purchase.purchaseInfo.loanProgram as keyof typeof loanProgramNames
            ] || "",
          );
        ComparisonData.price.push(
          formatAmount(data.purchase.purchaseInfo.purchasePrice),
        );
        ComparisonData.annualInterestRate.push(
          data.purchase.purchaseInfo.annualInterestRate,
        );
        ComparisonData.loanAmount.push(
          formatAmount(data.purchase.purchaseInfo.loanAmount),
        );
        ComparisonData.upmipRate.push(data.purchase.lenderFees.upfrontMipPercentage);
        ComparisonData.upmipAmount.push(
          formatAmount(data.purchase.loanProgram.upmipAmount),
        );
        ComparisonData.annualMIPRate.push(data.purchase.loanProgram.annualMIPRate);
        ComparisonData.finalLoanAmount.push(
          formatAmount(data.purchase.loanProgram.finalLoanAmount),
        );
        ComparisonData.mmi.push(formatAmount(data.purchase.loanProgram.mmi));
        ComparisonData.term.push(data.purchase.loanProgram.term);
        ComparisonData.principalAndInterest.push(
          formatAmount(data.purchase.loanProgram.principalAndInterest),
        );
        ComparisonData.monthlyPropertyTax.push(
          formatAmount(data.purchase.purchaseInfo.monthlyPropertyTax),
        );
        ComparisonData.hazardInsurance.push(
          formatAmount(data.purchase.loanProgram.hazardInsurance),
        );
        ComparisonData.mortgageInsurance.push(
          formatAmount(data.purchase.loanProgram.mortgageInsurance),
        );
        ComparisonData.associationFee.push(
          formatAmount(data.purchase.purchaseInfo.associationFee),
        );
        ComparisonData.monthlyTotal.push(
          formatAmount(data.purchase.loanProgram.monthlyTotal),
        );
        ComparisonData.downPayment.push(data.purchase.purchaseInfo.downPayment);
        ComparisonData.downPaymentAmount.push(
          formatAmount(data.purchase.loanProgram.downPaymentAmount),
        );
        ComparisonData.clearingCart.push(
          formatAmount(data.purchase.loanProgram.clearingCart),
        );
        ComparisonData.propertyTax.push(
          formatAmount(data.purchase.loanProgram.propertyTax),
        );
        ComparisonData.earnestMoneyDeposit.push(
          data.purchase.miscFees.earnestMoneyDeposit != null && data.purchase.miscFees.earnestMoneyDeposit > 0
            ? formatAmount(data.purchase.miscFees.earnestMoneyDeposit)
            : "",
        );
        ComparisonData.sellerCredit.push(
          data.purchase.miscFees.sellerCredit != null && data.purchase.miscFees.sellerCredit > 0
            ? formatAmount(data.purchase.miscFees.sellerCredit)
            : "",
        );
        ComparisonData.lenderCredit.push(
          data.purchase.miscFees.lenderCredit != null && data.purchase.miscFees.lenderCredit > 0
            ? formatAmount(data.purchase.miscFees.lenderCredit)
            : "",
        );
        ComparisonData.totalNeededToClear.push(
          formatAmount(data.purchase.loanProgram.totalNeededToClear),
        );
      });
      console.log("ComparisonData =>", ComparisonData);

      const blob = await pdf(<ComparisonPDF data={ComparisonData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (err) {
      openErrorDialog(`Failed to generate PDF.${err}`);
      console.error("PDF generation failed", err);
    } finally {
      // setFHAGFELoading(false);
      setCompareLoading(false);
    }

    // Simulate async action
    setTimeout(() => {
      // setFHAGFELoading(false);
      setCompareLoading(false);
    }, 2000);
  };

  const generateRefinanceCompare = async (
    preApprovalId: string,
    pdfName: string,
    language: string,
  ) => {
    console.log(preApprovalId);
    console.log(pdfName);
    console.log(language);

    setCompareLoading(true);

    try {
      type ComparisonDataType = {
        spanish: (boolean)[];
        loanProgram: (string | number)[];
        estimatedPropertyValue: (string | number)[];
        interestRate
        : (string | number)[];
        loanAmount: (string | number)[];
        upmipRate: (string | number)[];
        upmipAmount: (string | number)[];
        annualMIPRate: (string | number)[];
        mmi: (string | number)[];
        term: (string | number)[];
        finalLoanAmount: (string | number)[];
        ltv: (string | number)[];
        closingCosts: (string | number)[];
        propertyTax: (string | number)[];
        cashOutAmount: (string | number)[];
        principalAndInterest: (string | number)[];
        monthlyPropertyTax: (string | number)[];
        hazardInsurance: (string | number)[];
        mortgageInsurance: (string | number)[];
        associationFee: (string | number)[];
        monthlyTotal: (string | number)[];
        currentLoanBalance: (string | number)[];
        cashToClose: (string | number)[];
        cashToCloseIsPositive: (boolean)[];
        totalDebtToBePaidOff: (string | number)[];
      };
      const ComparisonData: ComparisonDataType = {
        spanish: [],
        loanProgram: [],
        estimatedPropertyValue: [],
        interestRate
          : [],
        loanAmount: [],
        upmipRate: [],
        upmipAmount: [],
        annualMIPRate: [],
        mmi: [],
        term: [],
        finalLoanAmount: [],
        ltv: [],
        closingCosts: [],
        propertyTax: [],
        cashOutAmount: [],
        principalAndInterest: [],
        monthlyPropertyTax: [],
        hazardInsurance: [],
        mortgageInsurance: [],
        associationFee: [],
        monthlyTotal: [],
        currentLoanBalance: [],
        cashToClose: [],
        cashToCloseIsPositive: [],
        totalDebtToBePaidOff: [],
      };
      const fetchedDataonGenerate = await refetchPreApprovalonGenerate();
      const response = fetchedDataonGenerate.data.data.scenarios;
      const firstRefinanceReportData = fetchedDataonGenerate.data.data.scenarios[0].refinance;

      const totalDebtToBePaidOff = firstRefinanceReportData?.borrowerIncomes
        ?.flatMap((borrower: RefinanceBorrowerIncomeEntry) => borrower.debts)
        ?.filter((debt: RefinanceDebtEntry) => debt.debtToBePaidOff === true)
        ?.reduce((sum: number, debt: RefinanceDebtEntry) => sum + debt.monthlyPayment, 0) ?? 0;

      console.log(
        "fetchedDataonGenerate from generate in refinance =>",
        fetchedDataonGenerate.data.data.scenarios,
      );

      response.forEach((data: any) => {
        // const cashToClose =
        //   data.refinance.refinanceInfo.loanAmount -
        //   data.refinance.refinanceInfo.currentLoanBalance -
        //   data.refinance.loanProgram.closingCosts -
        //   totalDebtToBePaidOff;
        let cashToClose = 0;
        if (data.refinance.loanStructure.loanProgram === 5) {
          cashToClose =
            data.refinance.refinanceInfo.currentDrawAmount -
            data.refinance.loanProgram.closingCosts -
            totalDebtToBePaidOff;
        } else {
          cashToClose =
            data.refinance.refinanceInfo.loanAmount -
            data.refinance.loanProgram.closingCosts -
            totalDebtToBePaidOff;
        }
        ComparisonData.spanish.push(language === "on" ? true : false),
          ComparisonData.loanProgram.push(
            loanProgramNames[
            data.refinance.loanStructure.loanProgram as keyof typeof loanProgramNames
            ] || "",
          );
        ComparisonData.estimatedPropertyValue.push(
          formatAmount(data.refinance.refinanceInfo.estimatedPropertyValue),
        );
        ComparisonData.interestRate
          .push(
            data.refinance.refinanceInfo.interestRate
            ,
          );
        ComparisonData.loanAmount.push(
          formatAmount(data.refinance.refinanceInfo.loanAmount),
        );
        ComparisonData.upmipRate.push(data.refinance.lenderFees.upfrontMipPercentage);
        ComparisonData.upmipAmount.push(
          formatAmount(data.refinance.loanProgram.upmipAmount),
        );
        ComparisonData.annualMIPRate.push(data.refinance.loanProgram.annualMIPRate);
        ComparisonData.mmi.push(formatAmount(data.refinance.loanProgram.mmi));
        ComparisonData.term.push(data.refinance.loanProgram.term);
        ComparisonData.finalLoanAmount.push(
          formatAmount(data.refinance.loanProgram.finalLoanAmount),
        );
        ComparisonData.ltv.push(
          data.refinance.refinanceInfo.ltv,
        );
        ComparisonData.closingCosts.push(
          formatAmount(data.refinance.loanProgram.closingCosts),
        );
        ComparisonData.propertyTax.push(
          formatAmount(data.refinance.loanProgram.propertyTax),
        );
        ComparisonData.cashOutAmount.push(
          formatAmount(data.refinance.loanProgram.cashOutAmount),
        );
        ComparisonData.principalAndInterest.push(
          formatAmount(data.refinance.loanProgram.principalAndInterest),
        );
        ComparisonData.monthlyPropertyTax.push(
          formatAmount(data.refinance.loanProgram.monthlyPropertyTax),
        );
        ComparisonData.hazardInsurance.push(
          formatAmount(data.refinance.loanProgram.hazardInsurance),
        );
        ComparisonData.mortgageInsurance.push(
          formatAmount(data.refinance.loanProgram.mortgageInsurance),
        );
        ComparisonData.associationFee.push(
          formatAmount(data.refinance.refinanceInfo.associationFee),
        );
        ComparisonData.monthlyTotal.push(
          formatAmount(data.refinance.loanProgram.monthlyTotal),
        );
        ComparisonData.currentLoanBalance.push(
          formatAmount(data.refinance.refinanceInfo.currentLoanBalance),
        );
        ComparisonData.cashToClose.push(
          formatAmount(cashToClose),
        );
        ComparisonData.cashToCloseIsPositive.push(cashToClose > 0 ? true : false,);
        ComparisonData.totalDebtToBePaidOff.push(
          formatAmount(totalDebtToBePaidOff),
        );
      });
      console.log("ComparisonData =>", ComparisonData);

      // ── Key Summary: compute best values across all scenarios ──────────────
      // Helper: parse a formatted amount string (e.g. "53,632.00") back to a number
      const parseAmt = (v: string | number) =>
        typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, "")) || 0;

      // 1. Best Rate — lowest interest rate
      let bestRateIdx = 0;
      ComparisonData.interestRate.forEach((rate, i) => {
        if (parseAmt(rate) < parseAmt(ComparisonData.interestRate[bestRateIdx])) {
          bestRateIdx = i;
        }
      });

      // 2. Lowest Payment — lowest monthly total
      let lowestPaymentIdx = 0;
      ComparisonData.monthlyTotal.forEach((total, i) => {
        if (parseAmt(total) < parseAmt(ComparisonData.monthlyTotal[lowestPaymentIdx])) {
          lowestPaymentIdx = i;
        }
      });

      // 3. Best Cash to Close — highest value wins:
      //    positive = borrower receives cash (great), negative = borrower pays (least to pay is best)
      let bestCTCIdx = 0;
      ComparisonData.cashToClose.forEach((ctc, i) => {
        if (parseAmt(ctc) > parseAmt(ComparisonData.cashToClose[bestCTCIdx])) {
          bestCTCIdx = i;
        }
      });

      const keySummary = {
        bestRateValue: ComparisonData.interestRate[bestRateIdx],
        bestRateOption: bestRateIdx + 1,
        lowestPaymentValue: ComparisonData.monthlyTotal[lowestPaymentIdx],
        lowestPaymentOption: lowestPaymentIdx + 1,
        bestCTCValue: ComparisonData.cashToClose[bestCTCIdx],
        bestCTCOption: bestCTCIdx + 1,
        bestCTCIsPositive: ComparisonData.cashToCloseIsPositive[bestCTCIdx],
      };

      const blob = await pdf(<RefinanceComparisonPDF data={{ ...ComparisonData, keySummary }} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (err) {
      openErrorDialog(`Failed to generate PDF.${err}`);
      console.error("PDF generation failed", err);
    } finally {
      // setFHAGFELoading(false);
      setCompareLoading(false);
    }

    // Simulate async action
    setTimeout(() => {
      // setFHAGFELoading(false);
      setCompareLoading(false);
    }, 2000);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ProtectedRoute allow={["user"]}>
      <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
        {/* Header */}
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "white",
            boxShadow: "none",
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          <Toolbar sx={{ px: 2, minHeight: 56 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" sx={{ color: "black" }} onClick={() => router.back()}>
                  <ArrowBackIcon fontSize="medium" />
                </IconButton>
                <Typography
                  sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
                >
                  {isPresenterMode ? "Scenario Comparison" : "Create Pre-approval"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}>
                  <PresenterToggle
                    isActive={isPresenterMode}
                    onToggle={() => setIsPresenterMode(!isPresenterMode)}
                    disabled={isPresenterModeDisabled}
                  />
                </Box>
                {!isPresenterMode && (<div>
                  <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-controls={menuopen ? "long-menu" : undefined}
                    aria-expanded={menuopen ? "true" : undefined}
                    aria-haspopup="true"
                    onClick={handleClick}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="long-menu"
                    anchorEl={menuanchorEl}
                    open={menuopen}
                    onClose={handleCloseMenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    slotProps={{
                      paper: {
                        sx: {
                          width: "15ch",
                          mt: 0.5,
                        },
                      },
                    }}
                  >
                    <Typography
                      fontWeight={600}
                      sx={{ padding: "0 10px 10px 16px" }}
                    >
                      Move File to:
                    </Typography>
                    {(
                      Object.values(PreApprovalStatus).filter(
                        (v) => typeof v === "number",
                      ) as PreApprovalStatus[]
                    ).map((value) => (
                      <MenuItem
                        key={value}
                        selected={status === value}
                        onClick={async () => {
                          setStatus(value);
                          handleMenuClick(value);
                          handleCloseMenu();
                        }}
                      >
                        {STATUS_LABELS[value]}
                      </MenuItem>
                    ))}
                  </Menu>
                </div>)}

              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
          <CustomSnackBar
            open={openSnackBar}
            onClose={closeDialog}
            severity={severity}
            errorMessage={message}
          ></CustomSnackBar>
          <Box maxWidth={isPresenterMode ? "100%" : 768} mx="auto" bgcolor="#fbeac8" minHeight="100vh">
            {isPresenterMode ? null : (

              <Box maxWidth={420} sx={{ mb: 2, mx: 'auto' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="loan type tabs"
                  sx={{
                    minHeight: 'unset',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    p: 0.5,
                    bgcolor: 'background.paper',
                    '& .MuiTabs-indicator': {
                      display: 'none',
                    },
                    '& .MuiButtonBase-root': {
                      padding: '8px 16px',
                    },
                  }}
                >
                  <Tab
                    label="Purchase"
                    disabled={loanType === 1}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "16px",
                      borderRadius: "6px",
                      flex: 1,
                      minHeight: 0,
                      color: "text.primary",
                      "&.Mui-selected": {
                        color: "#fff",
                        bgcolor: "#7444F5",
                      },
                    }}
                  />
                  <Tab
                    label="Refinance"
                    disabled={loanType === 0}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "16px",
                      borderRadius: "6px",
                      flex: 1,
                      minHeight: 0,
                      color: "text.primary",
                      "&.Mui-selected": {
                        color: "#fff",
                        bgcolor: "#7444F5",
                      },
                    }}
                  />
                </Tabs>
              </Box>
            )}
            {/* Sliding tab panels */}
            <Box sx={{ overflow: 'hidden', width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: '200%',
                  transform: tabValue === 0 ? 'translateX(0%)' : 'translateX(-50%)',
                  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Purchase tab panel */}
                <Box sx={{ width: '50%', flexShrink: 0 }}>
                  <FormProvider {...methods}>
                    <form
                      id="purchase-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitExpandedForm();
                      }}
                    >
                      <Box sx={{ display: "none" }}>
                        <Controller
                          name={`preapprovalDetail.userId`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label=""
                              error={!!errors.preapprovalDetail?.userId}
                              helperText={errors.preapprovalDetail?.userId?.message}
                            />
                          )}
                        />
                        <Controller
                          name={`preapprovalDetail.preApprovalId`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label=""
                              error={!!errors.preapprovalDetail?.preApprovalId}
                              helperText={
                                errors.preapprovalDetail?.preApprovalId?.message
                              }
                            />
                          )}
                        />
                        <Controller
                          name={`preapprovalDetail.createdAt`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label=""
                              error={!!errors.preapprovalDetail?.createdAt}
                              helperText={
                                errors.preapprovalDetail?.createdAt?.message
                              }
                            />
                          )}
                        />
                        <Controller
                          name={`preapprovalDetail.updatedAt`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label=""
                              error={!!errors.preapprovalDetail?.updatedAt}
                              helperText={
                                errors.preapprovalDetail?.updatedAt?.message
                              }
                            />
                          )}
                        />
                        <Controller
                          name={`preapprovalDetail.statusUpdatedAt`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label=""
                              error={!!errors.preapprovalDetail?.statusUpdatedAt}
                              helperText={
                                errors.preapprovalDetail?.statusUpdatedAt?.message
                              }
                            />
                          )}
                        />
                      </Box>
                      {isPresenterMode ? (<>
                        <ScenarioCompare
                          isPresenterModeOn={true}
                          onTogglePresenterMode={() => setIsPresenterMode(false)}
                          preApprovalId={preApprovalId}
                          onSave={handleSubmitExpandedForm}
                          onFieldChange={handleFieldChange}
                          onDocumentGenerate={(pdfType, scenarioIndex, pdfName, language) => {
                            if (scenarioIndex !== null) {
                              setCurrentScenarioIndex(scenarioIndex);
                              setSelectedPdf((prev) => ({ ...prev, [scenarioIndex]: pdfType }));
                              if (pdfType === "preApproval" && preApprovalId) {
                                generatePreApproval(preApprovalId, scenarioIndex, pdfName);
                              } else if (pdfType === "FHAGFE" && preApprovalId) {
                                generateFHAGFE(preApprovalId, scenarioIndex, pdfName, language);
                              } else if (pdfType === "quickQuote" && preApprovalId) {
                                generateQuickQuote(preApprovalId, scenarioIndex, pdfName, language);
                              } else if (pdfType === "LoanFile" && preApprovalId) {
                                generateLoanFile(preApprovalId, scenarioIndex, pdfName, language);
                              } else if (pdfType === "refinancequickQuote" && preApprovalId) {
                                generateRefinanceQuickQuote(preApprovalId, scenarioIndex, pdfName, language);
                              } else if (pdfType === "refinanceFeeWorksheet" && preApprovalId) {
                                generateRefinanceFeeWorksheet(preApprovalId, scenarioIndex, pdfName, language);
                              } else if (pdfType === "refinanceloanfile" && preApprovalId) {
                                generateRefinanceLoanFile(preApprovalId, scenarioIndex, pdfName, language);
                              }
                            } else {
                              if (preApprovalId) {
                                generateCompare(preApprovalId, pdfName, language);
                              }
                            }
                          }}
                        />
                      </>) : <Box></Box>}
                      <Box
                        sx={{ display: isPresenterMode ? "none" : "flex", flexDirection: "column", gap: "15px" }}
                      >
                        {fields.map((field, index) => (
                          <Box
                            key={field.id}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "15px",
                            }}
                          >
                            <Divider
                              sx={{
                                "&::before, &::after": {
                                  borderColor: "primary.main",
                                },
                                color: "primary.main",
                                fontWeight: 600,
                              }}
                            >
                              Scenario {index + 1}
                            </Divider>

                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="end"
                            >
                              <Button sx={{ p: 0 }} color="error" onClick={() => handleRemoveClick(index)}>
                                <Delete />
                              </Button>
                            </Box>

                            <BorrowerInfoForm
                              index={index}
                              expanded={expandedForms[index]?.borrowerInfo}
                              onToggle={() => handleToggle(index, "borrowerInfo")}
                              isCompleted={completedForms[index]?.borrowerInfo}
                              isDisabled={disabledForms[index]?.borrowerInfo}
                              handleFieldChange={handleFieldChange}
                            />
                            <PurchaseInfoForm
                              index={index}
                              expanded={expandedForms[index]?.purchaseInfo}
                              onToggle={() => handleToggle(index, "purchaseInfo")}
                              isCompleted={completedForms[index]?.purchaseInfo}
                              isDisabled={disabledForms[index]?.purchaseInfo}
                              handleFieldChange={handleFieldChange}
                              initialCounty={scenarioCounties[index]}
                            />
                            <PropertyIncomeOffsetForm
                              index={index}
                              expanded={expandedForms[index]?.propertyIncomeOffset}
                              onToggle={() => handleToggle(index, "propertyIncomeOffset")}
                              isCompleted={completedForms[index]?.propertyIncomeOffset}
                              isDisabled={disabledForms[index]?.propertyIncomeOffset}
                              handleFieldChange={handleFieldChange}
                            />
                            <LenderFeesForm
                              index={index}
                              expanded={expandedForms[index]?.lenderFees}
                              onToggle={() => handleToggle(index, "lenderFees")}
                              isCompleted={completedForms[index]?.lenderFees}
                              isDisabled={disabledForms[index]?.lenderFees}
                              handleFieldChange={handleFieldChange}
                            />
                            <PrepaidItemsForm
                              index={index}
                              expanded={expandedForms[index]?.prepaidItems}
                              onToggle={() => handleToggle(index, "prepaidItems")}
                              isCompleted={completedForms[index]?.prepaidItems}
                              isDisabled={disabledForms[index]?.prepaidItems}
                              handleFieldChange={handleFieldChange}
                            />
                            <MiscFeesForm
                              index={index}
                              expanded={expandedForms[index]?.miscFees}
                              onToggle={() => handleToggle(index, "miscFees")}
                              isCompleted={completedForms[index]?.miscFees}
                              isDisabled={disabledForms[index]?.miscFees}
                              handleFieldChange={handleFieldChange}
                            />
                            <BorrowersIncomeDataForm
                              index={index}
                              expanded={expandedForms[index]?.borrowersIncomeData}
                              onToggle={() =>
                                handleToggle(index, "borrowersIncomeData")
                              }
                              isCompleted={completedForms[index]?.borrowersIncomeData}
                              isDisabled={disabledForms[index]?.borrowersIncomeData}
                              handleFieldChange={handleFieldChange}
                            />
                            <LoanProgramForm
                              index={index}
                              expanded={expandedForms[index]?.loanProgram}
                              onToggle={() => handleToggle(index, "loanProgram")}
                              isCompleted={completedForms[index]?.loanProgram}
                              isDisabled={disabledForms[index]?.loanProgram}
                              handleFieldChange={handleFieldChange}
                            />
                            <Grid container spacing={2}>

                              <Grid size={{ xs: 12, md: 8 }}>
                                <Box>
                                  <FormControl
                                    variant="outlined"
                                    sx={{ width: "100%" }}
                                    disabled={
                                      isDirty ||
                                      quickQuoteloading[index] ||
                                      preApprovalloading[index] ||
                                      FHAGFEloading[index] ||
                                      LoanFileloading[index] ||
                                      isPDFbuttondisabled[index]
                                    }
                                  >
                                    <InputLabel>Take an action</InputLabel>

                                    <Select
                                      value={selectedPdf[index] || ""}
                                      onChange={(e) => {
                                        setSelectedPdf((prev) => ({
                                          ...prev,
                                          [index]: e.target.value,
                                        }));
                                        setCurrentPDF(e.target.value);
                                      }}

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

                                      <MenuItem
                                        value="LoanFile"
                                        data-name="XML file"
                                        onClick={(e) =>
                                          setPdfName(e.currentTarget.dataset.name ?? "")
                                        }
                                      >
                                        Create loan file
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, md: 4 }}>
                                <Box height={"100%"}>
                                  <Button
                                    onClick={() => handleClickOpen(index)}
                                    fullWidth
                                    disabled={
                                      isDirty ||
                                      !selectedPdf[index] ||
                                      // quickQuoteloading[index] ||
                                      // preApprovalloading[index] ||
                                      // FHAGFEloading[index] ||
                                      // isFormDirty ||
                                      isPDFbuttondisabled[index]
                                    }
                                    variant="outlined"
                                    sx={{
                                      height: "100%",
                                      color: "#7444F5",
                                      borderColor: "#7444F5",
                                      borderRadius: 2,
                                      borderWidth: 2,
                                      py: 1.25,
                                      ":hover": {
                                        backgroundColor: "#f3e6fd",
                                        borderColor: "#C1A9F5",
                                      },
                                    }}
                                  >
                                    {quickQuoteloading[index] ||
                                      preApprovalloading[index] ||
                                      FHAGFEloading[index] ||
                                      LoanFileloading[index] ? (
                                      <CircularProgress
                                        size={24}
                                        sx={{ color: "#7444F5" }}
                                      />
                                    ) : (
                                      <Typography
                                        fontWeight={500}
                                        color={
                                          !selectedPdf[index] ||
                                            isPDFbuttondisabled[index]
                                            ? "rgba(0, 0, 0, 0.26)"
                                            : "#7444F5"
                                        }
                                      >
                                        {selectedPdf[index] === "LoanFile" ? "GENERATE FILE" : "GENERATE PDF"}
                                      </Typography>
                                    )}
                                  </Button>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Box>

                      {isPresenterMode ? null : (

                        <Grid size={{ xs: 12 }} sx={{ mt: 2, mb: 7 }}>
                          <Button
                            disabled={isAddScenarioDisable}
                            onClick={async () => {
                              await handleAddNewState();
                              await append({
                                id: undefined,
                                scenarioOrder: 0,
                                scenarioName: "",
                                createdAt: undefined,
                                borrowerInfo: {
                                  borrowerName: methods.getValues(
                                    `scenarios.${0}.borrowerInfo.borrowerName`,
                                  ),
                                  coBorrowerName: methods.getValues(
                                    `scenarios.${0}.borrowerInfo.coBorrowerName`,
                                  ),
                                  // ficoScore: methods.getValues(
                                  //   `scenarios.${0}.borrowerInfo.ficoScore`,
                                  // ),
                                  // coBorrowerFicoScore: methods.getValues(
                                  //   `scenarios.${0}.borrowerInfo.coBorrowerFicoScore`,
                                  // ),
                                  borrowerCellNumber: methods.getValues(
                                    `scenarios.${0}.borrowerInfo.borrowerCellNumber`,
                                  ),
                                  coBorrowerCellNumber: methods.getValues(
                                    `scenarios.${0}.borrowerInfo.coBorrowerCellNumber`,
                                  ),
                                  borrowerEmail: methods.getValues(
                                    `scenarios.${0}.borrowerInfo.borrowerEmail`,
                                  ),
                                },
                                purchaseInfo: {
                                  loanProgram: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.loanProgram`,
                                  ),
                                  propertyType: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.propertyType`,
                                  ),
                                  occupancyStatus: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.occupancyStatus`,
                                  ),
                                  purchasePrice: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.purchasePrice`,
                                  ),
                                  downPayment: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.downPayment`,
                                  ),
                                  loanAmount: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.loanAmount`,
                                  ),
                                  annualInterestRate: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.annualInterestRate`,
                                  ),
                                  mipFundingFee: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.mipFundingFee`,
                                  ),
                                  hazardInsurance: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.hazardInsurance`,
                                  ),
                                  associationFee: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.associationFee`,
                                  ),
                                  miPercent: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.miPercent`,
                                  ),
                                  monthlyPropertyTaxPercentage: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.monthlyPropertyTaxPercentage`,
                                  ),
                                  monthlyPropertyTax: methods.getValues(
                                    `scenarios.${0}.purchaseInfo.monthlyPropertyTax`,
                                  ),
                                },
                                propertyIncomeOffset: {
                                  monthlyGrossRentalIncome: methods.getValues(
                                    `scenarios.${0}.propertyIncomeOffset.monthlyGrossRentalIncome`,
                                  ),
                                  rentalPercentage: methods.getValues(
                                    `scenarios.${0}.propertyIncomeOffset.rentalPercentage`,
                                  ),
                                  subjectPropertyPITIA: methods.getValues(
                                    `scenarios.${0}.propertyIncomeOffset.subjectPropertyPITIA`,
                                  ),
                                  qualifyingRentalIncome: methods.getValues(
                                    `scenarios.${0}.propertyIncomeOffset.qualifyingRentalIncome`,
                                  ),
                                  netMonthlyImpactToDTI: methods.getValues(
                                    `scenarios.${0}.propertyIncomeOffset.netMonthlyImpactToDTI`,
                                  ),
                                },
                                lenderFees: {
                                  agentName: userDisplayName, // set default here
                                  loanOriginationFeePercentage: methods.getValues(
                                    `scenarios.${0}.lenderFees.loanOriginationFeePercentage`,
                                  ),
                                  loanOriginationFee: methods.getValues(
                                    `scenarios.${0}.lenderFees.loanOriginationFee`,
                                  ),
                                  discountFeePercentage: methods.getValues(
                                    `scenarios.${0}.lenderFees.discountFeePercentage`,
                                  ),
                                  discountFee: methods.getValues(
                                    `scenarios.${0}.lenderFees.discountFee`,
                                  ),
                                  upfrontMipPercentage: methods.getValues(
                                    `scenarios.${0}.lenderFees.upfrontMipPercentage`,
                                  ),
                                  upfrontMip: methods.getValues(
                                    `scenarios.${0}.lenderFees.upfrontMip`,
                                  ),
                                  appraisalFee: methods.getValues(
                                    `scenarios.${0}.lenderFees.appraisalFee`,
                                  ),
                                  escrowFees: methods.getValues(
                                    `scenarios.${0}.lenderFees.escrowFees`,
                                  ),
                                  titleFees: methods.getValues(
                                    `scenarios.${0}.lenderFees.titleFees`,
                                  ),
                                  thirdPartyLenderFee: methods.getValues(
                                    `scenarios.${0}.lenderFees.thirdPartyLenderFee`,
                                  ),
                                },
                                prepaidItems: {
                                  prepaidInterestDays: methods.getValues(
                                    `scenarios.${0}.prepaidItems.prepaidInterestDays`,
                                  ),
                                  prepaidInterestAmount: methods.getValues(
                                    `scenarios.${0}.prepaidItems.prepaidInterestAmount`,
                                  ),
                                  hazardInsurance: methods.getValues(
                                    `scenarios.${0}.prepaidItems.hazardInsurance`,
                                  ),
                                  hazardInsuranceMonths: methods.getValues(
                                    `scenarios.${0}.prepaidItems.hazardInsuranceMonths`,
                                  ),
                                  hazardInsuranceReserves: methods.getValues(
                                    `scenarios.${0}.prepaidItems.hazardInsuranceReserves`,
                                  ),
                                  propertyTaxMonths: methods.getValues(
                                    `scenarios.${0}.prepaidItems.propertyTaxMonths`,
                                  ),
                                  propertyTaxAmount: methods.getValues(
                                    `scenarios.${0}.prepaidItems.propertyTaxAmount`,
                                  ),
                                },
                                miscFees: {
                                  earnestMoneyDeposit: methods.getValues(
                                    `scenarios.${0}.miscFees.earnestMoneyDeposit`,
                                  ),
                                  sellerCredit: methods.getValues(
                                    `scenarios.${0}.miscFees.sellerCredit`,
                                  ),
                                  lenderCredit: methods.getValues(
                                    `scenarios.${0}.miscFees.lenderCredit`,
                                  ),
                                  miscFee4: methods.getValues(
                                    `scenarios.${0}.miscFees.miscFee4`,
                                  ),
                                },
                                borrowersIncomeData: methods.getValues(
                                  `scenarios.${0}.borrowersIncomeData`,
                                ),
                                loanProgram: {
                                  frontEndRatio: methods.getValues(
                                    `scenarios.${0}.loanProgram.frontEndRatio`,
                                  ),
                                  backEndRatio: methods.getValues(
                                    `scenarios.${0}.loanProgram.backEndRatio`,
                                  ),
                                  baseLoanAmount: methods.getValues(
                                    `scenarios.${0}.loanProgram.baseLoanAmount`,
                                  ),
                                  finalLoanAmount: methods.getValues(
                                    `scenarios.${0}.loanProgram.finalLoanAmount`,
                                  ),
                                  term: methods.getValues(
                                    `scenarios.${0}.loanProgram.term`,
                                  ),
                                  downPaymentAmount: methods.getValues(
                                    `scenarios.${0}.loanProgram.downPaymentAmount`,
                                  ),
                                  clearingCart: methods.getValues(
                                    `scenarios.${0}.loanProgram.clearingCart`,
                                  ),
                                  totalNeededToClear: methods.getValues(
                                    `scenarios.${0}.loanProgram.totalNeededToClear`,
                                  ),
                                  principalAndInterest: methods.getValues(
                                    `scenarios.${0}.loanProgram.principalAndInterest`,
                                  ),
                                  mortgageInsurance: methods.getValues(
                                    `scenarios.${0}.loanProgram.mortgageInsurance`,
                                  ),
                                  monthlyTotal: methods.getValues(
                                    `scenarios.${0}.loanProgram.monthlyTotal`,
                                  ),
                                  borrowers: methods.getValues(
                                    `scenarios.${0}.loanProgram.borrowers`,
                                  ),
                                },
                              });
                            }}
                            startIcon={<AddIcon />}
                            sx={{
                              color: "#7444F5",
                              width: "100%",
                              borderColor: "#7444F54D",
                              borderWidth: 2,
                              borderRadius: 2,
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
                            ADD SCENARIO
                          </Button>
                        </Grid>
                      )}
                    </form>
                  </FormProvider>
                </Box>
                {/* Refinance tab panel */}
                <Box sx={{ width: '50%', flexShrink: 0 }}>
                  <RefinanceTab
                    methods={refinanceMethods}
                    preApprovalId={preApprovalId}
                    setPreApprovalId={setPreApprovalId}
                    preApprovalIdFromURL={preApprovalIdFromURL}
                    isRefinanceLoading={isRefinanceLoading}
                    setIsRefinanceLoading={setIsRefinanceLoading}
                    tabValue={tabValue}
                    setTabValue={setTabValue}
                    setLoanType={setLoanType}
                    status={status}
                    setStatus={setStatus}
                    fetchedData={fetchedData}
                    handleCreateSuccess={handleCreateSuccess}
                    isRefinancePDFbuttondisabled={isRefinancePDFbuttondisabled}
                    setIsRefinancePDFbuttondisabled={setIsRefinancePDFbuttondisabled}
                    refinanceQuickQuoteloading={refinanceQuickQuoteloading}
                    setRefinanceQuickQuoteloading={setRefinanceQuickQuoteloading}
                    refinanceFeeWorksheetloading={refinanceFeeWorksheetloading}
                    setRefinanceFeeWorksheetloading={setRefinanceFeeWorksheetloading}
                    setIsRefinanceComparebuttondisabled={setIsRefinanceComparebuttondisabled}
                    setIsRefinanceSaved={setIsRefinanceSaved}
                    handleClickOpen={handleClickOpen}
                    setPdfName={setPdfName}
                    setCurrentPDF={setCurrentPDF}
                    selectedPdf={selectedPdf}
                    setSelectedPdf={setSelectedPdf}
                    isPresenterMode={isPresenterMode}
                    setIsPresenterMode={setIsPresenterMode}
                    isPresenterModeDisabled={isPresenterModeDisabled}
                    setIsPresenterModeDisabled={setIsPresenterModeDisabled} onDocumentGenerate={(pdfType, scenarioIndex, pdfName, language) => {
                      if (scenarioIndex !== null) {
                        setCurrentScenarioIndex(scenarioIndex);
                        setSelectedPdf((prev) => ({ ...prev, [scenarioIndex]: pdfType }));
                        if (pdfType === "preApproval" && preApprovalId) {
                          generatePreApproval(preApprovalId, scenarioIndex, pdfName);
                        } else if (pdfType === "FHAGFE" && preApprovalId) {
                          generateFHAGFE(preApprovalId, scenarioIndex, pdfName, language);
                        } else if (pdfType === "quickQuote" && preApprovalId) {
                          generateQuickQuote(preApprovalId, scenarioIndex, pdfName, language);
                        } else if (pdfType === "LoanFile" && preApprovalId) {
                          generateLoanFile(preApprovalId, scenarioIndex, pdfName, language);
                        } else if (pdfType === "refinancequickQuote" && preApprovalId) {
                          generateRefinanceQuickQuote(preApprovalId, scenarioIndex, pdfName, language);
                        } else if (pdfType === "refinanceFeeWorksheet" && preApprovalId) {
                          generateRefinanceFeeWorksheet(preApprovalId, scenarioIndex, pdfName, language);
                        } else if (pdfType === "refinanceLoanFile" && preApprovalId) {
                          generateRefinanceLoanFile(preApprovalId, scenarioIndex, pdfName, language);
                        }
                      } else {
                        if (preApprovalId) {
                          generateRefinanceCompare(preApprovalId, pdfName, language);
                        }
                      }
                    }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>

        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: 0,
            right: 0,
            maxWidth: 420,
            mx: "auto",
            zIndex: 1000,
            px: { xs: 2, sm: 0, md: 0 },
          }}
        >
          {/* Sliding tab panels */}
          <Box sx={{ overflow: 'hidden', width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '200%',
                transform: tabValue === 0 ? 'translateX(0%)' : 'translateX(-50%)',
                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Purchase tab panel */}
              {isPresenterMode ? null : (
                <>
                  <Box sx={{ width: '50%', flexShrink: 0 }}>
                    <Button
                      form="purchase-form"
                      disabled={isloading}
                      fullWidth
                      type="submit"
                      variant="contained"
                      sx={{
                        bgcolor: isDirty || !issaved ? "#ff453b" : "#1F9A00",
                        borderRadius: 2,
                        py: 1.25,
                      }}
                    >
                      {isloading ? (
                        <CircularProgress size={24} sx={{ color: "#ff453b" }} />
                      ) : !isDirty && issaved ? (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography fontWeight={400} color="white">
                            SAVED
                          </Typography>
                          <CheckIcon fontSize="small" sx={{ color: "white" }} />
                        </Box>
                      ) : (
                        <Typography fontWeight={400} color="white">
                          SAVE
                        </Typography>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        handleClickOpen(null);
                        setCurrentPDF("");
                      }}
                      fullWidth
                      disabled={
                        compareloading || isDirty || isComparebuttondisabled
                      }
                      variant="contained"
                      sx={{
                        bgcolor: "transparent",
                        borderRadius: 2,
                        py: 1.25,
                        boxShadow: "none",

                        "&:hover": {
                          bgcolor: "transparent",
                          boxShadow: "none",
                        },

                        "&.Mui-disabled": {
                          bgcolor: "transparent",
                          boxShadow: "none",
                          opacity: 1, // prevent MUI from dimming the button
                        },
                      }}
                    >
                      {compareloading ? (
                        <CircularProgress size={24} sx={{ color: "#7444F5" }} />
                      ) : (
                        <Typography
                          fontWeight={500}
                          color={
                            compareloading || isDirty || isComparebuttondisabled
                              ? "rgba(0, 0, 0, 0.26)"
                              : "#7444F5"
                          }
                        >
                          COMPARE SCENARIOS
                        </Typography>
                      )}
                    </Button>
                  </Box>
                  <Box sx={{ width: '50%', flexShrink: 0 }}>
                    <Button
                      form="refinance-form"
                      disabled={isRefinanceLoading}
                      fullWidth
                      type="submit"
                      variant="contained"
                      sx={{
                        bgcolor: refinanceIsDirty || !isRefinancesaved ? "#ff453b" : "#1F9A00",
                        borderRadius: 2,
                        py: 1.25,
                      }}
                    >
                      {isRefinanceLoading ? (
                        <CircularProgress size={24} sx={{ color: "#ff453b" }} />
                      ) : !refinanceIsDirty && isRefinancesaved ? (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography fontWeight={400} color="white">
                            SAVED
                          </Typography>
                          <CheckIcon fontSize="small" sx={{ color: "white" }} />
                        </Box>
                      ) : (
                        <Typography fontWeight={400} color="white">
                          SAVE
                        </Typography>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        handleClickOpen(null);
                        setCurrentPDF("");
                      }}
                      fullWidth
                      disabled={
                        refinanceCompareLoading || refinanceIsDirty || isRefinanceComparebuttondisabled
                      }
                      variant="contained"
                      sx={{
                        bgcolor: "transparent",
                        borderRadius: 2,
                        py: 1.25,
                        boxShadow: "none",

                        "&:hover": {
                          bgcolor: "transparent",
                          boxShadow: "none",
                        },

                        "&.Mui-disabled": {
                          bgcolor: "transparent",
                          boxShadow: "none",
                          opacity: 1, // prevent MUI from dimming the button
                        },
                      }}
                    >
                      {refinanceCompareLoading ? (
                        <CircularProgress size={24} sx={{ color: "#7444F5" }} />
                      ) : (
                        <Typography
                          fontWeight={500}
                          color={
                            refinanceCompareLoading || refinanceIsDirty || isRefinanceComparebuttondisabled
                              ? "rgba(0, 0, 0, 0.26)"
                              : "#7444F5"
                          }
                        >
                          COMPARE SCENARIOS
                        </Typography>
                      )}
                    </Button>
                  </Box>
                </>
              )}
              {/* Refinance tab panel */}
            </Box>
          </Box>
        </Box>

      </Box>
      <PdfNameDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        pdfName={pdfName}
        setPdfName={setPdfName}
        currentPDF={currentPDF}
        currentScenarioIndex={currentScenarioIndex}
      />
      <PdfPreviewDialog
        pdfPreviewUrl={pdfPreviewUrl}
        onClose={() => setPdfPreviewUrl(null)}
        isAndroid={isAndroid}
        pdfName={pdfName}
      />
      <XmlReportReadyDialog
        open={xmlReportOpen}
        onClose={() => setXmlReportOpen(false)}
        xmlData={xmlData}
        fileName={pdfName || "loan_file"}
      />
      <StatusUpdatingDialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <DeleteScenarioDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        isBlockedDelete={isBlockedDelete}
        onDelete={handleDelete}
      />
    </ProtectedRoute>
  );
}
