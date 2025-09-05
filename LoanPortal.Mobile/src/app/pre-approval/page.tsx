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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import BorrowerInfoForm from "@/components/Forms/PreApprovalForms/BorrowerInfoForm";
import PurchaseInfoForm from "@/components/Forms/PreApprovalForms/PurchaseInfoForm";
import LenderFeesForm from "@/components/Forms/PreApprovalForms/LenderFeesForm";
import PrepaidItemsForm from "@/components/Forms/PreApprovalForms/PrepaidItemsForm";
import MiscFeesForm from "@/components/Forms/PreApprovalForms/MiscFeesForm";
import {
  CombinedPreApprovalFormData,
  combinedPreApprovalSchema,
} from "@/api/models/combinedPreApprovalSchema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateBorrowerInfo,
  useCreateBorrowersIncomeData,
  // useCreateDeptBreakDown,
  useCreateLenderFees,
  useCreateLoanProgram,
  useCreateMiscFees,
  useCreatePrepaidItems,
  useCreatePurchaseInfo,
  useGetPreApprovalById,
} from "@/api/reactQueriesHooks/usePreApproval";
import BorrowersIncomeDataForm from "@/components/Forms/PreApprovalForms/BorrowsIncomeDataForm";
// import DeptBreakdownForm from "@/components/Forms/PreApprovalForms/DeptBreakdownForm";
import LoanProgramForm from "@/components/Forms/PreApprovalForms/LoanProgramForm";
import {
  BorrowerIncomeEntry,
  DebtEntry,
} from "@/api/models/BorrowersInncomeDataFormTypes";
import { useSessionStore } from "@/stores/SessionStore";
import { usePreApprovalStore } from "@/store/usePreApprovalStore";
import { useSnackBarStore } from "@/store/SnackBarStore";
import CustomSnackBar from "@/components/CustomSnackBar";
// import { useSearchParams } from "next/navigation";

export default function PreApproval() {
  const { user } = useSessionStore();
  const { openSnackBar, closeDialog, severity, message } = useSnackBarStore();
  const { openSuccessDialog } = useSnackBarStore();
  const [isloading, setIsloading] = useState(false);
  const methods = useForm<CombinedPreApprovalFormData>({
    resolver: zodResolver(combinedPreApprovalSchema),
    defaultValues: {
      borrowerInfo: {
        borrowerName: "",
        coBorrowerName: "",
        ficoScore: undefined,
        coBorrowerFicoScore: undefined,
        borrowerCellNumber: "",
        coBorrowerCellNumber: "",
        borrowerEmail: "",
        loanProgram: "",
        propertyType: "",
        occupancyStatus: "",
      },
      purchaseInfo: {
        hazardInsurance: 150,
        associationFee: 0,
      },
      borrowersIncomeData: {
        borrowerIncome: [
          {
            borrowerName: "",
            ficoScore: undefined,
            monthlyIncome: undefined,
            debts: [
              {
                debtType: "3",
                balance: undefined,
                monthlyPayment: undefined,
              },
            ],
          },
        ],
      },
      lenderFees: {
        agentName: user?.displayName || "", // set default here
        loanOriginationFee: 0,
        discountFee: 0,
        upfrontMip: 0,
        appraisalFee: 0,
        escrowFees: 0,
        titleFees: 0,
        thirdPartyLenderFee: 0,
      },
      miscFees: {
        miscFee1: 0,
        miscFee2: 0,
        miscFee3: 0,
        miscFee4: 0,
      },
    },
  });
  useEffect(() => {
    if (user) {
      methods.reset({
        lenderFees: {
          agentName: user?.displayName || "",
        },
      });
    }
  }, [user, methods]);
  const [preApprovalIdFromURL, setPreApprovalIdFromURL] = useState<
    string | null
  >(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPreApprovalIdFromURL(params.get("preApprovalId"));
  }, []);
  const [preApprovalId, setPreApprovalId] = useState<string | null>(null);
  useEffect(() => {
    if (preApprovalIdFromURL) {
      setPreApprovalId(preApprovalIdFromURL);
    }
  }, [preApprovalIdFromURL]);
  const { data: fetchedData, refetch } = useGetPreApprovalById(
    preApprovalIdFromURL || preApprovalId || ""
  );
  const setPreApprovalIdStore = usePreApprovalStore(
    (state) => state.setPreApprovalId
  );
  useEffect(() => {
    if (preApprovalId) {
      setPreApprovalIdStore(preApprovalId);
    }
  }, [preApprovalId]);
  useEffect(() => {
    if (fetchedData) {
      const borrowerInfoFicoScore = methods.getValues("borrowerInfo.ficoScore");
      const borrowerInfoBorrowerName = methods.getValues(
        "borrowerInfo.borrowerName"
      );
      // const borrowerInfoLoanProgram = methods.getValues(
      //   "borrowerInfo.loanProgram"
      // );
      const purchaseInfoPurchasePrice = methods.getValues(
        "purchaseInfo.purchasePrice"
      );
      // const purchaseInfoDownPayment = methods.getValues(
      //   "purchaseInfo.downPayment"
      // );
      // const purchaseInfoAnnualInterestRate = methods.getValues(
      //   "purchaseInfo.annualInterestRate"
      // );
      const purchaseInfoHazardInsurance = methods.getValues(
        "purchaseInfo.hazardInsurance"
      );
      const lenderFeesLoanOriginationFee =
        methods.getValues("lenderFees.loanOriginationFee") ?? 0;
      const lenderFeesDiscountFee =
        methods.getValues("lenderFees.discountFee") ?? 0;
      const lenderFeesUpfrontMip =
        methods.getValues("lenderFees.upfrontMip") ?? 0;
      const lenderFeesAppraisalFee =
        methods.getValues("lenderFees.appraisalFee") ?? 0;
      const lenderFeesEscrowFees =
        methods.getValues("lenderFees.escrowFees") ?? 0;
      const lenderFeesTitleFees =
        methods.getValues("lenderFees.titleFees") ?? 0;
      const lenderFeesThirdPartyLenderFee =
        methods.getValues("lenderFees.thirdPartyLenderFee") ?? 0;
      const closingCosts =
        lenderFeesLoanOriginationFee +
        lenderFeesDiscountFee +
        lenderFeesUpfrontMip +
        lenderFeesAppraisalFee +
        lenderFeesEscrowFees +
        lenderFeesTitleFees +
        lenderFeesThirdPartyLenderFee;
      const prepaidItemsPropertyTaxAmount = methods.getValues(
        "prepaidItems.propertyTaxAmount"
      );
      const montlyPropertyTax = Math.round(
        (purchaseInfoPurchasePrice * 0.0125) / 12
      );

      const formatedFetchedData = fetchedData.data;
      console.log("formatedFetchedData", formatedFetchedData);

      // Set completed and disabled states based on lastSubmittedFormNo
      // const formKeys = [
      //   "borrowerInfo",
      //   "purchaseInfo",
      //   "lenderFees",
      //   "prepaidItems",
      //   "miscFees",
      //   "borrowersIncomeData",
      //   "loanProgram",
      // ] as const;

      // const completed = {
      //   borrowerInfo: false,
      //   purchaseInfo: false,
      //   lenderFees: false,
      //   prepaidItems: false,
      //   miscFees: false,
      //   borrowersIncomeData: false,
      //   loanProgram: false,
      // };

      // const disabled = {
      //   borrowerInfo: true,
      //   purchaseInfo: true,
      //   lenderFees: true,
      //   prepaidItems: true,
      //   miscFees: true,
      //   borrowersIncomeData: true,
      //   loanProgram: true,
      // };

      // formKeys.forEach((key, index) => {
      //   if (index < formatedFetchedData.lastSubmittedFormNo) {
      //     completed[key] = true;
      //     disabled[key] = false;
      //   } else if (index === formatedFetchedData.lastSubmittedFormNo) {
      //     completed[key] = false;
      //     disabled[key] = false;
      //   }
      // });

      // const expanded = {
      //   borrowerInfo: false,
      //   purchaseInfo: false,
      //   lenderFees: false,
      //   prepaidItems: false,
      //   miscFees: false,
      //   borrowersIncomeData: false,
      //   loanProgram: false,
      // };

      // const currentFormKey = formKeys[formatedFetchedData.lastSubmittedFormNo];
      // expanded[currentFormKey] = true;

      // setCompletedForms(completed);
      // setdisabledForms(disabled);
      // setExpandedForms(expanded);

      type FormKeys = (typeof formKeys)[number];

      interface FormattedFetchedData {
        borrowerInfo?: unknown;
        purchaseInfo?: unknown;
        lenderFees?: unknown;
        prepaidItems?: unknown;
        miscFees?: unknown;
        borrowerIncomes?: unknown[]; // mapped from borrowersIncomeData
        loanProgram?: unknown;
        lastSubmittedFormNo: number;
      }

      // Your form keys
      const formKeys = [
        "borrowerInfo",
        "purchaseInfo",
        "lenderFees",
        "prepaidItems",
        "miscFees",
        "borrowersIncomeData", // maps from borrowerIncomes
        "loanProgram",
      ] as const;

      const completed: Record<FormKeys, boolean> = {} as Record<
        FormKeys,
        boolean
      >;
      const disabled: Record<FormKeys, boolean> = {} as Record<
        FormKeys,
        boolean
      >;
      const expanded: Record<FormKeys, boolean> = {} as Record<
        FormKeys,
        boolean
      >;

      formKeys.forEach((key) => {
        // map borrowersIncomeData → borrowerIncomes
        const sectionKey =
          key === "borrowersIncomeData" ? "borrowerIncomes" : key;

        const sectionData =
          formatedFetchedData[sectionKey as keyof FormattedFetchedData];

        const hasData = Array.isArray(sectionData)
          ? sectionData.length > 0
          : sectionData != null;

        completed[key] = hasData;
        disabled[key] = !hasData;
        expanded[key] = false; // collapsed by default
      });

      // 👉 Optionally expand the current form in progress
      const currentFormKey = formKeys[formatedFetchedData.lastSubmittedFormNo];
      if (currentFormKey) {
        expanded[currentFormKey] = true;
      }

      setCompletedForms(completed);
      setdisabledForms(disabled);
      setExpandedForms(expanded);

      methods.reset({
        borrowerInfo: {
          borrowerName: formatedFetchedData.borrowerInfo.borrowerName ?? "",
          coBorrowerName: formatedFetchedData.borrowerInfo.coBorrowerName ?? "",
          ficoScore: formatedFetchedData.borrowerInfo.ficoScore ?? undefined,
          coBorrowerFicoScore:
            formatedFetchedData.borrowerInfo.coBorrowerFicoScore ?? undefined,
          borrowerCellNumber:
            formatedFetchedData.borrowerInfo.borrowerCellNumber ?? "",
          coBorrowerCellNumber:
            formatedFetchedData.borrowerInfo.coBorrowerCellNumber ?? "",
          borrowerEmail: formatedFetchedData.borrowerInfo.borrowerEmail ?? "",
          loanProgram: String(
            formatedFetchedData.borrowerInfo.loanProgram ?? ""
          ),
          propertyType: String(
            formatedFetchedData.borrowerInfo.propertyType ?? ""
          ),
          occupancyStatus: String(
            formatedFetchedData.borrowerInfo.occupancyStatus ?? ""
          ),
        },
        purchaseInfo: {
          purchasePrice: formatedFetchedData.purchaseInfo?.purchasePrice ?? "",
          downPayment: formatedFetchedData.purchaseInfo?.downPayment ?? "",
          loanAmount: formatedFetchedData.purchaseInfo?.loanAmount ?? "",
          annualInterestRate:
            formatedFetchedData.purchaseInfo?.annualInterestRate ?? "",
          mipFundingFee: formatedFetchedData.purchaseInfo?.mipFundingFee
            ? formatedFetchedData.purchaseInfo.mipFundingFee
            : formatedFetchedData.borrowerInfo?.loanProgram == 3
            ? 1.75
            : 0,
          hazardInsurance:
            formatedFetchedData.purchaseInfo?.hazardInsurance ?? 150,
          associationFee: formatedFetchedData.purchaseInfo?.associationFee ?? 0,
          miPercent: formatedFetchedData.purchaseInfo?.miPercent ?? 0,
        },
        lenderFees: {
          agentName:
            formatedFetchedData.lenderFees?.agentName ?? user?.displayName,
          loanOriginationFee:
            formatedFetchedData.lenderFees?.loanOriginationFee ?? 0,
          loanOriginationFeePercentage:
            formatedFetchedData.lenderFees?.loanOriginationFeePercentage ?? "",
          discountFeePercentage:
            formatedFetchedData.lenderFees?.discountFeePercentage ?? "",
          discountFee: formatedFetchedData.lenderFees?.discountFee ?? 0,
          upfrontMipPercentage:
            formatedFetchedData.lenderFees?.upfrontMipPercentage ?? "",
          upfrontMip: formatedFetchedData.lenderFees?.upfrontMip ?? 0,
          appraisalFee: formatedFetchedData.lenderFees?.appraisalFee ?? 0,
          escrowFees: formatedFetchedData.lenderFees?.escrowFees ?? 0,
          titleFees: formatedFetchedData.lenderFees?.titleFees ?? 0,
          thirdPartyLenderFee:
            formatedFetchedData.lenderFees?.thirdPartyLenderFee ?? 0,
        },
        prepaidItems: {
          prepaidInterestDays:
            formatedFetchedData.prepaidItems?.prepaidInterestDays ?? "",
          prepaidInterestAmount:
            formatedFetchedData.prepaidItems?.prepaidInterestAmount ?? "",
          hazardInsurance:
            formatedFetchedData.prepaidItems?.hazardInsurance ?? "",
          hazardInsuranceMonths:
            formatedFetchedData.prepaidItems?.hazardInsuranceMonths ?? "",
          hazardInsuranceReserves:
            formatedFetchedData.prepaidItems?.hazardInsuranceReserves ?? "",
          propertyTaxMonths:
            formatedFetchedData.prepaidItems?.propertyTaxMonths ?? "",
          propertyTaxAmount:
            formatedFetchedData.prepaidItems?.propertyTaxAmount ?? "",
        },
        miscFees: {
          miscFee1: formatedFetchedData.miscFees?.miscFee1 ?? 0,
          miscFee2: formatedFetchedData.miscFees?.miscFee2 ?? 0,
          miscFee3: formatedFetchedData.miscFees?.miscFee3 ?? 0,
          miscFee4: formatedFetchedData.miscFees?.miscFee4 ?? 0,
        },
        borrowersIncomeData: {
          borrowerIncome: formatedFetchedData.borrowerIncomes?.map(
            (income: BorrowerIncomeEntry): BorrowerIncomeEntry => ({
              borrowerName: income.borrowerName ?? "",
              ficoScore: income.ficoScore ?? borrowerInfoFicoScore,
              monthlyIncome: income.monthlyIncome ?? undefined,
              debts:
                income.debts?.map(
                  (debt: DebtEntry): DebtEntry => ({
                    debtType: String(debt.debtType) ?? "3",
                    balance: debt.balance ?? undefined,
                    monthlyPayment: debt.monthlyPayment ?? undefined,
                  })
                ) ?? [],
            })
          ) ?? [
            {
              borrowerName: borrowerInfoBorrowerName,
              ficoScore: borrowerInfoFicoScore,
              monthlyIncome: undefined,
              debts: [
                {
                  debtType: "3",
                  balance: undefined,
                  monthlyPayment: undefined,
                },
              ],
            },
          ],
        },
        loanProgram: {
          // loanProgram: String(
          //   formatedFetchedData.loanProgram?.loanProgram ??
          //     borrowerInfoLoanProgram
          // ),
          frontEndRatio: formatedFetchedData.loanProgram?.frontEndRatio ?? 0,
          backEndRatio: formatedFetchedData.loanProgram?.backEndRatio ?? 0,
          // price:
          //   formatedFetchedData.loanProgram?.price ?? purchaseInfoPurchasePrice,
          // interestRate:
          //   formatedFetchedData.loanProgram?.interestRate ??
          //   purchaseInfoAnnualInterestRate,
          baseLoanAmount: formatedFetchedData.loanProgram?.baseLoanAmount ?? 0,
          upmipAmount: formatedFetchedData.loanProgram?.upmipAmount ?? 0,
          upmipRate: formatedFetchedData.loanProgram?.upmipRate ?? 1.75,
          annualMIPRate: formatedFetchedData.loanProgram?.annualMIPRate ?? 0,
          finalLoanAmount:
            formatedFetchedData.loanProgram?.finalLoanAmount ?? 0,
          mmi: formatedFetchedData.loanProgram?.mmi ?? 0,
          term: formatedFetchedData.loanProgram?.term ?? 30,
          // downPaymentPercentage:
          //   formatedFetchedData.loanProgram?.downPaymentPercentage ??
          //   purchaseInfoDownPayment,
          downPaymentAmount:
            formatedFetchedData.loanProgram?.downPaymentAmount ?? 0,
          clearingCart:
            formatedFetchedData.loanProgram?.clearingCart ?? closingCosts,
          propertyTax:
            formatedFetchedData.loanProgram?.propertyTax ??
            prepaidItemsPropertyTaxAmount,
          totalNeededToClear:
            formatedFetchedData.loanProgram?.totalNeededToClear ?? 0,
          principalAndInterest:
            formatedFetchedData.loanProgram?.principalAndInterest ?? 0,
          monthlyPropertyTax:
            formatedFetchedData.loanProgram?.monthlyPropertyTax ??
            montlyPropertyTax,
          hazardInsurance:
            formatedFetchedData.loanProgram?.hazardInsurance ??
            purchaseInfoHazardInsurance,
          mortgageInsurance:
            formatedFetchedData.loanProgram?.mortgageInsurance ?? 0,
          monthlyTotal: formatedFetchedData.loanProgram?.monthlyTotal ?? 0,
        },

        // Optional: Include any other fields like borrowersIncomeData, etc.
      });
    }
  }, [fetchedData, user?.displayName, methods]);
  // const [preApprovalData, setPreApprovalData] = useState<object>([]);
  // console.log(preApprovalData);
  const [expandedForms, setExpandedForms] = useState({
    borrowerInfo: true,
    purchaseInfo: false,
    lenderFees: false,
    prepaidItems: false,
    miscFees: false,
    borrowersIncomeData: false,
    loanProgram: false,
  });

  const [completedForms, setCompletedForms] = useState({
    borrowerInfo: false,
    purchaseInfo: false,
    lenderFees: false,
    prepaidItems: false,
    miscFees: false,
    borrowersIncomeData: false,
    loanProgram: false,
  });

  const [disabledForms, setdisabledForms] = useState({
    borrowerInfo: false,
    purchaseInfo: true,
    lenderFees: true,
    prepaidItems: true,
    miscFees: true,
    borrowersIncomeData: true,
    loanProgram: true,
  });

  const formOrder: (keyof typeof expandedForms)[] = [
    "borrowerInfo",
    "purchaseInfo",
    "lenderFees",
    "prepaidItems",
    "miscFees",
    "borrowersIncomeData",
    "loanProgram",
  ];

  const expandNextForm = (currentForm: keyof typeof expandedForms) => {
    const currentIndex = formOrder.indexOf(currentForm);
    const nextForm = formOrder[currentIndex + 1];
    if (nextForm) {
      setExpandedForms((prev) => {
        const newState = Object.fromEntries(
          Object.keys(prev).map((key) => [key, false])
        ) as typeof expandedForms;
        return { ...newState, [nextForm]: true };
      });
    }
  };

  const handleToggle = (formKey: keyof typeof expandedForms) => {
    setExpandedForms((prev) => {
      const newState = Object.fromEntries(
        Object.entries(prev).map(([key]) => [key, false])
      ) as typeof expandedForms;

      return {
        ...newState,
        [formKey]: !prev[formKey],
      };
    });
  };

  const { mutateAsync: submitBorrowerInfo } = useCreateBorrowerInfo();
  const { mutateAsync: submitPurchaseInfo } = useCreatePurchaseInfo();
  const { mutateAsync: submitLenderFees } = useCreateLenderFees();
  const { mutateAsync: submitPrepaidItems } = useCreatePrepaidItems();
  const { mutateAsync: submitMiscFees } = useCreateMiscFees();
  const { mutateAsync: submitBorrowersIncomeData } =
    useCreateBorrowersIncomeData();
  const { mutateAsync: submitLoanProgram } = useCreateLoanProgram();

  const handleCreateSuccess = () => {
    openSuccessDialog("Data submitted successfully.");
  };

  const handleError = () => {};

  const handleSubmitExpandedForm = async () => {
    const {
      borrowerInfo,
      purchaseInfo,
      lenderFees,
      prepaidItems,
      miscFees,
      borrowersIncomeData,
      loanProgram,
    } = methods.getValues();

    try {
      if (expandedForms.borrowerInfo) {
        const isValid = await methods.trigger("borrowerInfo");
        if (!isValid) return;
        setIsloading(true);

        if (fetchedData && fetchedData.data.loanProgram) {
          const loanProgramPayload = {
            preApprovalId,
            loanProgram: borrowerInfo.loanProgram,
            frontEndRatio: loanProgram.frontEndRatio,
            backEndRatio: loanProgram.backEndRatio,
            // price: loanProgram.price,
            price: purchaseInfo.purchasePrice,
            // interestRate: loanProgram.interestRate,
            interestRate: purchaseInfo.annualInterestRate,
            baseLoanAmount: loanProgram.baseLoanAmount,
            upmipRate: loanProgram.upmipRate,
            upmipAmount: loanProgram.upmipAmount,
            finalLoanAmount: loanProgram.finalLoanAmount,
            mmi: loanProgram.mmi,
            term: loanProgram.term,
            downPaymentAmount: loanProgram.downPaymentAmount,
            // downPaymentPercentage: loanProgram.downPaymentPercentage,
            downPaymentPercentage: purchaseInfo.downPayment,
            clearingCart: loanProgram.clearingCart,
            propertyTax: loanProgram.propertyTax,
            totalNeededToClear: loanProgram.totalNeededToClear,
            principalAndInterest: loanProgram.principalAndInterest,
            monthlyPropertyTax: loanProgram.monthlyPropertyTax,
            hazardInsurance: loanProgram.hazardInsurance,
            mortgageInsurance: loanProgram.mortgageInsurance,
            monthlyTotal: loanProgram.monthlyTotal,
            annualMIPRate: loanProgram.annualMIPRate,
            borrowers: loanProgram.borrowers.map((borrower) => ({
              monthlyIncome: borrower.monthlyIncome,
              debts: borrower.debts,
              ficoScore: borrower.ficoScore,
            })),
          };

          await submitLoanProgram(loanProgramPayload);
        }

        const payload = {
          preApprovalId,
          borrowerName: borrowerInfo.borrowerName,
          coBorrowerName: borrowerInfo.coBorrowerName,
          ficoScore: Number(borrowerInfo.ficoScore),
          coBorrowerFicoScore: Number(borrowerInfo.coBorrowerFicoScore),
          borrowerCellNumber: borrowerInfo.borrowerCellNumber,
          coBorrowerCellNumber: borrowerInfo.coBorrowerCellNumber,
          borrowerEmail: borrowerInfo.borrowerEmail,
          loanProgram: borrowerInfo.loanProgram,
          propertyType: borrowerInfo.propertyType,
          occupancyStatus: borrowerInfo.occupancyStatus,
        };

        const response = await submitBorrowerInfo(payload);
        if (response?.data?.preApprovalId) {
          setPreApprovalId(response.data.preApprovalId);
        }
        setCompletedForms((prev) => ({
          ...prev,
          borrowerInfo: true,
        }));
        setdisabledForms((prev) => ({
          ...prev,
          purchaseInfo: false,
        }));
        expandNextForm("borrowerInfo");
        const currentValues = methods.getValues(); // or use getValues from useFormContext
        methods.reset(currentValues);
        setIsloading(false);
        return;
      }

      if (expandedForms.purchaseInfo) {
        const isValid = await methods.trigger("purchaseInfo");
        if (!isValid) return;
        setIsloading(true);

        if (fetchedData.data.loanProgram) {
          const loanProgramPayload = {
            preApprovalId,
            loanProgram: borrowerInfo.loanProgram,
            frontEndRatio: loanProgram.frontEndRatio,
            backEndRatio: loanProgram.backEndRatio,
            // price: loanProgram.price,
            price: purchaseInfo.purchasePrice,
            // interestRate: loanProgram.interestRate,
            interestRate: purchaseInfo.annualInterestRate,
            baseLoanAmount: loanProgram.baseLoanAmount,
            upmipRate: loanProgram.upmipRate,
            upmipAmount: loanProgram.upmipAmount,
            finalLoanAmount: loanProgram.finalLoanAmount,
            mmi: loanProgram.mmi,
            term: loanProgram.term,
            downPaymentAmount: loanProgram.downPaymentAmount,
            // downPaymentPercentage: loanProgram.downPaymentPercentage,
            downPaymentPercentage: purchaseInfo.downPayment,
            clearingCart: loanProgram.clearingCart,
            propertyTax: loanProgram.propertyTax,
            totalNeededToClear: loanProgram.totalNeededToClear,
            principalAndInterest: loanProgram.principalAndInterest,
            monthlyPropertyTax: loanProgram.monthlyPropertyTax,
            hazardInsurance: loanProgram.hazardInsurance,
            mortgageInsurance: loanProgram.mortgageInsurance,
            monthlyTotal: loanProgram.monthlyTotal,
            annualMIPRate: loanProgram.annualMIPRate,
            borrowers: loanProgram.borrowers.map((borrower) => ({
              monthlyIncome: borrower.monthlyIncome,
              debts: borrower.debts,
              ficoScore: borrower.ficoScore,
            })),
          };

          await submitLoanProgram(loanProgramPayload);
        }

        const payload = {
          preApprovalId,
          purchasePrice: purchaseInfo.purchasePrice,
          downPayment: purchaseInfo.downPayment,
          loanAmount: purchaseInfo.loanAmount,
          annualInterestRate: purchaseInfo.annualInterestRate,
          mipFundingFee: purchaseInfo.mipFundingFee,
          hazardInsurance: purchaseInfo.hazardInsurance,
          associationFee: purchaseInfo.associationFee,
          miPercent: purchaseInfo.miPercent,
        };
        await submitPurchaseInfo(payload);

        setCompletedForms((prev) => ({
          ...prev,
          purchaseInfo: true,
        }));
        setdisabledForms((prev) => ({
          ...prev,
          lenderFees: false,
        }));
        expandNextForm("purchaseInfo");
        const currentValues = methods.getValues(); // or use getValues from useFormContext
        methods.reset(currentValues);
        setIsloading(false);
        return;
      }

      if (expandedForms.lenderFees) {
        const isValid = await methods.trigger("lenderFees");
        if (!isValid) return;
        setIsloading(true);

        const payload = {
          preApprovalId,
          agentName: lenderFees.agentName,
          loanOriginationFeePercentage: lenderFees.loanOriginationFeePercentage,
          loanOriginationFee: lenderFees.loanOriginationFee,
          discountFeePercentage: lenderFees.discountFeePercentage,
          discountFee: lenderFees.discountFee,
          upfrontMipPercentage: lenderFees.upfrontMipPercentage,
          upfrontMip: lenderFees.upfrontMip,
          appraisalFee: lenderFees.appraisalFee,
          escrowFees: lenderFees.escrowFees,
          titleFees: lenderFees.titleFees,
          thirdPartyLenderFee: lenderFees.thirdPartyLenderFee,
        };
        await submitLenderFees(payload);

        setCompletedForms((prev) => ({
          ...prev,
          lenderFees: true,
        }));
        setdisabledForms((prev) => ({
          ...prev,
          prepaidItems: false,
        }));
        expandNextForm("lenderFees");
        const currentValues = methods.getValues(); // or use getValues from useFormContext
        methods.reset(currentValues);
        setIsloading(false);
        return;
      }

      if (expandedForms.prepaidItems) {
        const isValid = await methods.trigger("prepaidItems");
        if (!isValid) return;
        setIsloading(true);

        const payload = {
          preApprovalId,
          prepaidInterestDays: prepaidItems.prepaidInterestDays,
          prepaidInterestAmount: prepaidItems.prepaidInterestAmount,
          hazardInsurance: prepaidItems.hazardInsurance,
          hazardInsuranceMonths: prepaidItems.hazardInsuranceMonths,
          hazardInsuranceReserves: prepaidItems.hazardInsuranceReserves,
          propertyTaxMonths: prepaidItems.propertyTaxMonths,
          propertyTaxAmount: prepaidItems.propertyTaxAmount,
        };
        await submitPrepaidItems(payload);

        setCompletedForms((prev) => ({
          ...prev,
          prepaidItems: true,
        }));
        setdisabledForms((prev) => ({
          ...prev,
          miscFees: false,
        }));
        expandNextForm("prepaidItems");
        const currentValues = methods.getValues(); // or use getValues from useFormContext
        methods.reset(currentValues);
        setIsloading(false);
        return;
      }

      if (expandedForms.miscFees) {
        const isValid = await methods.trigger("miscFees");
        if (!isValid) return;
        setIsloading(true);

        const payload = {
          preApprovalId,
          miscFee1: miscFees.miscFee1,
          miscFee2: miscFees.miscFee2,
          miscFee3: miscFees.miscFee3,
          miscFee4: miscFees.miscFee4,
        };
        await submitMiscFees(payload);

        setCompletedForms((prev) => ({
          ...prev,
          miscFees: true,
        }));
        setdisabledForms((prev) => ({
          ...prev,
          borrowersIncomeData: false,
        }));
        expandNextForm("miscFees");
        const currentValues = methods.getValues(); // or use getValues from useFormContext
        methods.reset(currentValues);
        setIsloading(false);
        return;
      }

      if (expandedForms.borrowersIncomeData) {
        const isValid = await methods.trigger("borrowersIncomeData");
        if (!isValid) return;
        setIsloading(true);

        const payload = borrowersIncomeData.borrowerIncome.map((entry) => ({
          preApprovalId,
          borrowerName: entry.borrowerName,
          ficoScore: entry.ficoScore,
          monthlyIncome: entry.monthlyIncome,
          debts: entry.debts.map((debt) => ({
            preApprovalId,
            debtType: Number(debt.debtType), // if it's a string and needs to be number
            balance: Number(debt.balance),
            monthlyPayment: Number(debt.monthlyPayment),
          })),
        }));

        await submitBorrowersIncomeData(payload);

        if (preApprovalId) {
          await refetch();
          // const { data, error } = await refetch();
          // if (!error && data) {
          //   setPreApprovalData(data);
          // }
        }

        setCompletedForms((prev) => ({
          ...prev,
          borrowersIncomeData: true,
        }));
        setdisabledForms((prev) => ({
          ...prev,
          loanProgram: false,
        }));
        expandNextForm("borrowersIncomeData");
        const currentValues = methods.getValues(); // or use getValues from useFormContext
        methods.reset(currentValues);
        setIsloading(false);
        return;
      }

      if (expandedForms.loanProgram) {
        const isValid = await methods.trigger("loanProgram");
        if (!isValid) return;
        const isPurchaseInfoValid = await methods.trigger("purchaseInfo");
        if (!isPurchaseInfoValid) return;
        setIsloading(true);

        const payload = {
          preApprovalId,
          loanProgram: borrowerInfo.loanProgram,
          frontEndRatio: loanProgram.frontEndRatio,
          backEndRatio: loanProgram.backEndRatio,
          // price: loanProgram.price,
          price: purchaseInfo.purchasePrice,
          // interestRate: loanProgram.interestRate,
          interestRate: purchaseInfo.annualInterestRate,
          baseLoanAmount: loanProgram.baseLoanAmount,
          upmipRate: loanProgram.upmipRate,
          upmipAmount: loanProgram.upmipAmount,
          finalLoanAmount: loanProgram.finalLoanAmount,
          mmi: loanProgram.mmi,
          term: loanProgram.term,
          downPaymentAmount: loanProgram.downPaymentAmount,
          // downPaymentPercentage: loanProgram.downPaymentPercentage,
          downPaymentPercentage: purchaseInfo.downPayment,
          clearingCart: loanProgram.clearingCart,
          propertyTax: loanProgram.propertyTax,
          totalNeededToClear: loanProgram.totalNeededToClear,
          principalAndInterest: loanProgram.principalAndInterest,
          monthlyPropertyTax: loanProgram.monthlyPropertyTax,
          hazardInsurance: loanProgram.hazardInsurance,
          mortgageInsurance: loanProgram.mortgageInsurance,
          monthlyTotal: loanProgram.monthlyTotal,
          annualMIPRate: loanProgram.annualMIPRate,
          borrowers: loanProgram.borrowers.map((borrower) => ({
            monthlyIncome: borrower.monthlyIncome,
            debts: borrower.debts,
            ficoScore: borrower.ficoScore,
          })),
        };

        const borrowerpayload = {
          preApprovalId,
          borrowerName: borrowerInfo.borrowerName,
          coBorrowerName: borrowerInfo.coBorrowerName,
          ficoScore: Number(borrowerInfo.ficoScore),
          coBorrowerFicoScore: Number(borrowerInfo.coBorrowerFicoScore),
          borrowerCellNumber: borrowerInfo.borrowerCellNumber,
          coBorrowerCellNumber: borrowerInfo.coBorrowerCellNumber,
          borrowerEmail: borrowerInfo.borrowerEmail,
          loanProgram: borrowerInfo.loanProgram,
          propertyType: borrowerInfo.propertyType,
          occupancyStatus: borrowerInfo.occupancyStatus,
        };

        await submitBorrowerInfo(borrowerpayload);

        const purchasepayload = {
          preApprovalId,
          purchasePrice: purchaseInfo.purchasePrice,
          downPayment: purchaseInfo.downPayment,
          loanAmount: purchaseInfo.loanAmount,
          annualInterestRate: purchaseInfo.annualInterestRate,
          mipFundingFee: purchaseInfo.mipFundingFee,
          hazardInsurance: purchaseInfo.hazardInsurance,
          associationFee: purchaseInfo.associationFee,
          miPercent: purchaseInfo.miPercent,
        };
        await submitPurchaseInfo(purchasepayload);

        setCompletedForms((prev) => ({
          ...prev,
          loanProgram: true,
        }));
        await submitLoanProgram(payload);
        const currentValues = methods.getValues(); // or use getValues from useFormContext
        methods.reset(currentValues);
        setIsloading(false);

        // expandNextForm("borrowerInfo");
        // return;
      }

      handleCreateSuccess();
    } catch (err) {
      console.error("Form submission failed:", err);
      handleError();
    }
  };

  return (
    <ProtectedRoute>
      <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
        {/* Header */}
        <AppBar
          position="static"
          sx={{
            position: "fixed",
            top: 0,
            bgcolor: "white",
            boxShadow: "none",
            zIndex: (theme) => theme.zIndex.drawer,
          }}
        >
          <Toolbar sx={{ px: 2, minHeight: 56 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Link href="/dashboard" passHref>
                <IconButton size="small" sx={{ color: "black" }}>
                  <ArrowBackIcon fontSize="medium" />
                </IconButton>
              </Link>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Create Pre-approval
              </Typography>
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
          <Box maxWidth={420} mx="auto" bgcolor="#fbeac8" minHeight="100vh">
            <FormProvider {...methods}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitExpandedForm();
                }}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: "15px" }}
                >
                  <BorrowerInfoForm
                    expanded={expandedForms.borrowerInfo}
                    onToggle={() => handleToggle("borrowerInfo")}
                    isCompleted={completedForms.borrowerInfo}
                    isDisabled={disabledForms.borrowerInfo}
                  />
                  <PurchaseInfoForm
                    expanded={expandedForms.purchaseInfo}
                    onToggle={() => handleToggle("purchaseInfo")}
                    isCompleted={completedForms.purchaseInfo}
                    isDisabled={disabledForms.purchaseInfo}
                  />
                  <LenderFeesForm
                    expanded={expandedForms.lenderFees}
                    onToggle={() => handleToggle("lenderFees")}
                    isCompleted={completedForms.lenderFees}
                    isDisabled={disabledForms.lenderFees}
                  />
                  <PrepaidItemsForm
                    expanded={expandedForms.prepaidItems}
                    onToggle={() => handleToggle("prepaidItems")}
                    isCompleted={completedForms.prepaidItems}
                    isDisabled={disabledForms.prepaidItems}
                  />
                  <MiscFeesForm
                    expanded={expandedForms.miscFees}
                    onToggle={() => handleToggle("miscFees")}
                    isCompleted={completedForms.miscFees}
                    isDisabled={disabledForms.miscFees}
                  />
                  <BorrowersIncomeDataForm
                    expanded={expandedForms.borrowersIncomeData}
                    onToggle={() => handleToggle("borrowersIncomeData")}
                    isCompleted={completedForms.borrowersIncomeData}
                    isDisabled={disabledForms.borrowersIncomeData}
                  />
                  <LoanProgramForm
                    expanded={expandedForms.loanProgram}
                    onToggle={() => handleToggle("loanProgram")}
                    isCompleted={completedForms.loanProgram}
                    isDisabled={disabledForms.loanProgram}
                  />
                </Box>

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
                  {/* <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{ bgcolor: "#ff453b", borderRadius: 99, py: 1.25 }}
                  >
                    CONTINUE
                  </Button> */}
                  <Button
                    disabled={isloading}
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{ bgcolor: "#ff453b", borderRadius: 99, py: 1.25 }}
                  >
                    {isloading ? (
                      <CircularProgress size={24} sx={{ color: "#ff453b" }} />
                    ) : (
                      <Typography
                        fontWeight={400}
                        color={isloading ? "rgba(0, 0, 0, 0.26)" : "white"}
                      >
                        CONTINUE
                      </Typography>
                    )}
                  </Button>
                </Box>
              </form>
            </FormProvider>
          </Box>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
