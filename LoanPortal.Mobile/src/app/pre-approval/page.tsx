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
// import { useSearchParams } from "next/navigation";

export default function PreApproval() {
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
      borrowersIncomeData: {
        borrowerIncome: [
          {
            borrowerName: "",
            employer: "",
            monthlyIncome: undefined,
            debts: [
              {
                debtType: "",
                balance: undefined,
                highCredit: undefined,
                monthlyPayment: undefined,
              },
            ],
          },
        ],
      },
    },
  });
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
  const { data: fetchedData } = useGetPreApprovalById(
    preApprovalIdFromURL ?? ""
  );
  useEffect(() => {
    if (fetchedData) {
      const formatedFetchedData = fetchedData.data;
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
          loanProgram: formatedFetchedData.borrowerInfo.loanProgram ?? "",
          propertyType: formatedFetchedData.borrowerInfo.propertyType ?? "",
          occupancyStatus:
            formatedFetchedData.borrowerInfo.occupancyStatus ?? "",
        },
        purchaseInfo: {
          purchasePrice: formatedFetchedData.purchaseInfo?.purchasePrice ?? "",
          downPayment: formatedFetchedData.purchaseInfo?.downPayment ?? "",
          loanAmount: formatedFetchedData.purchaseInfo?.loanAmount ?? "",
          annualInterestRate:
            formatedFetchedData.purchaseInfo?.annualInterestRate ?? "",
          homeOwnerInsurance:
            formatedFetchedData.purchaseInfo?.homeOwnerInsurance ?? "",
          mipFundingFee: formatedFetchedData.purchaseInfo?.mipFundingFee ?? "",
          hazardInsurance:
            formatedFetchedData.purchaseInfo?.hazardInsurance ?? "",
          associationFee:
            formatedFetchedData.purchaseInfo?.associationFee ?? "",
          miPercent: formatedFetchedData.purchaseInfo?.miPercent ?? "",
        },
        lenderFees: {
          agentName: formatedFetchedData.lenderFees?.agentName ?? "",
          loanOriginationFee:
            formatedFetchedData.lenderFees?.loanOriginationFee ?? "",
          discountFee: formatedFetchedData.lenderFees?.discountFee ?? "",
          upfrontMip: formatedFetchedData.lenderFees?.upfrontMip ?? "",
          appraisalFee: formatedFetchedData.lenderFees?.appraisalFee ?? "",
          escrowFees: formatedFetchedData.lenderFees?.escrowFees ?? "",
          titleFees: formatedFetchedData.lenderFees?.titleFees ?? "",
          thirdPartyLenderFee:
            formatedFetchedData.lenderFees?.thirdPartyLenderFee ?? "",
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
          miscFee1: formatedFetchedData.miscFees?.miscFee1 ?? "",
          miscFee2: formatedFetchedData.miscFees?.miscFee2 ?? "",
          miscFee3: formatedFetchedData.miscFees?.miscFee3 ?? "",
          miscFee4: formatedFetchedData.miscFees?.miscFee4 ?? "",
        },
        borrowersIncomeData: {
          borrowerIncome:
            formatedFetchedData.borrowerIncomes?.map(
              (income: BorrowerIncomeEntry): BorrowerIncomeEntry => ({
                borrowerName: income.borrowerName ?? "",
                employer: income.employer ?? "",
                monthlyIncome: income.monthlyIncome ?? undefined,
                debts:
                  income.debts?.map(
                    (debt: DebtEntry): DebtEntry => ({
                      debtType: debt.debtType ?? "",
                      balance: debt.balance ?? undefined,
                      highCredit: debt.highCredit ?? undefined,
                      monthlyPayment: debt.monthlyPayment ?? undefined,
                    })
                  ) ?? [],
              })
            ) ?? [],
        },

        // Optional: Include any other fields like borrowersIncomeData, etc.
      });
    }
  }, [fetchedData, methods]);
  const [preApprovalData] = useState<object>([]);
  const [expandedForms, setExpandedForms] = useState({
    borrowerInfo: true,
    purchaseInfo: false,
    lenderFees: false,
    prepaidItems: false,
    miscFees: false,
    borrowersIncomeData: false,
    loanProgram: false,
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
  const { mutateAsync: submitLoanProgram } =
    useCreateLoanProgram();

  const handleCreateSuccess = () => {};

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
        console.log("Borrower Info Payload:", payload);

        const response = await submitBorrowerInfo(payload);
        if (response?.data?.preApprovalId) {
          setPreApprovalId(response.data.preApprovalId);
        }
        expandNextForm("borrowerInfo");
        return;
      }

      if (expandedForms.purchaseInfo) {
        const isValid = await methods.trigger("purchaseInfo");
        if (!isValid) return;

        const payload = {
          preApprovalId,
          purchasePrice: purchaseInfo.purchasePrice,
          downPayment: purchaseInfo.downPayment,
          loanAmount: purchaseInfo.loanAmount,
          annualInterestRate: purchaseInfo.annualInterestRate,
          homeOwnerInsurance: purchaseInfo.homeOwnerInsurance,
          mipFundingFee: purchaseInfo.mipFundingFee,
          hazardInsurance: purchaseInfo.hazardInsurance,
          associationFee: purchaseInfo.associationFee,
          miPercent: purchaseInfo.miPercent,
        };
        await submitPurchaseInfo(payload);

        expandNextForm("purchaseInfo");
        return;
      }

      if (expandedForms.lenderFees) {
        const isValid = await methods.trigger("lenderFees");
        if (!isValid) return;

        const payload = {
          preApprovalId,
          agentName: lenderFees.agentName,
          loanOriginationFee: lenderFees.loanOriginationFee,
          discountFee: lenderFees.discountFee,
          upfrontMip: lenderFees.upfrontMip,
          appraisalFee: lenderFees.appraisalFee,
          escrowFees: lenderFees.escrowFees,
          titleFees: lenderFees.titleFees,
          thirdPartyLenderFee: lenderFees.thirdPartyLenderFee,
        };
        await submitLenderFees(payload);

        expandNextForm("lenderFees");
        return;
      }

      if (expandedForms.prepaidItems) {
        const isValid = await methods.trigger("prepaidItems");
        if (!isValid) return;

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

        expandNextForm("prepaidItems");
        return;
      }

      if (expandedForms.miscFees) {
        const isValid = await methods.trigger("miscFees");
        if (!isValid) return;

        const payload = {
          preApprovalId,
          miscFee1: miscFees.miscFee1,
          miscFee2: miscFees.miscFee2,
          miscFee3: miscFees.miscFee3,
          miscFee4: miscFees.miscFee4,
        };
        await submitMiscFees(payload);

        expandNextForm("miscFees");
        return;
      }

      if (expandedForms.borrowersIncomeData) {
        const isValid = await methods.trigger("borrowersIncomeData");
        if (!isValid) return;

        const payload = borrowersIncomeData.borrowerIncome.map((entry) => ({
          preApprovalId,
          borrowerName: entry.borrowerName,
          employer: entry.employer,
          monthlyIncome: entry.monthlyIncome,
          debts: entry.debts.map((debt) => ({
            preApprovalId,
            debtType: Number(debt.debtType), // if it's a string and needs to be number
            balance: Number(debt.balance),
            highCredit: Number(debt.highCredit),
            monthlyPayment: Number(debt.monthlyPayment),
          })),
        }));

        await submitBorrowersIncomeData(payload);

        // if (preApprovalId) {
        //   console.log('test');

        //   const { data, isLoading, error } =
        //   await useGetPreApprovalById(preApprovalId);
        //   console.log('test 2');
        //   if (!isLoading && !error && data) {
        //     console.log(data);
        //     // setPreApprovalData(data);
        //   }
        // }

        expandNextForm("borrowersIncomeData");
        return;
      }

      if (expandedForms.loanProgram) {

        const isValid = await methods.trigger("loanProgram");
        console.log(isValid);
        
        if (!isValid) return;

        const payload = {
          preApprovalId,
          loanProgram: loanProgram.loanProgram,
          frontEndRatio: loanProgram.frontEndRatio,
          backEndRatio: loanProgram.backEndRatio,
          price: loanProgram.price,
          interestRate: loanProgram.interestRate,          
          baseLoanAmount: loanProgram.baseLoanAmount,          
          upmipRate: loanProgram.upmipRate,          
          upmipAmount: loanProgram.upmipAmount,          
          finalLoanAmount: loanProgram.finalLoanAmount,          
          mmi: loanProgram.mmi,          
          term: loanProgram.term,          
          downPaymentAmount: loanProgram.downPaymentAmount,          
          downPaymentPercentage: loanProgram.downPaymentPercentage,          
          clearingCart: loanProgram.clearingCart,          
          propertyTax: loanProgram.propertyTax,          
          totalNeededToClear: loanProgram.totalNeededToClear,          
          principalAndInterest: loanProgram.principalAndInterest,          
          monthlyPropertyTax: loanProgram.monthlyPropertyTax,          
          hazardInsurance: loanProgram.hazardInsurance,          
          mortgageInsurance: loanProgram.mortgageInsurance,          
          monthlyTotal: loanProgram.monthlyTotal,          
          annualMIPRate: loanProgram.annualMIPRate,          
        };

        await submitLoanProgram(payload);

        // expandNextForm("borrowerInfo");
        return;
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
            zIndex: 9999,
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
                  />
                  <PurchaseInfoForm
                    expanded={expandedForms.purchaseInfo}
                    onToggle={() => handleToggle("purchaseInfo")}
                  />
                  <LenderFeesForm
                    expanded={expandedForms.lenderFees}
                    onToggle={() => handleToggle("lenderFees")}
                  />
                  <PrepaidItemsForm
                    expanded={expandedForms.prepaidItems}
                    onToggle={() => handleToggle("prepaidItems")}
                  />
                  <MiscFeesForm
                    expanded={expandedForms.miscFees}
                    onToggle={() => handleToggle("miscFees")}
                  />
                  <BorrowersIncomeDataForm
                    expanded={expandedForms.borrowersIncomeData}
                    onToggle={() => handleToggle("borrowersIncomeData")}
                  />
                  <LoanProgramForm
                    expanded={expandedForms.loanProgram}
                    onToggle={() => handleToggle("loanProgram")}
                    preApprovalData={preApprovalData}
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
                  }}
                >
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{ bgcolor: "#ff453b", borderRadius: 99, py: 1.25 }}
                  >
                    CONTINUE
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
