import { CombinedRefinancePreApprovalFormData, combinedRefinancePreApprovalSchema } from "@/api/models/refinance/combinedPreApprovalSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import { Delete, AddCircle } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import RefinanceBorrowerInfoForm from "../PreApprovalForms/RefinanceForms/BorrowerInfoForm";
import RefinanceRefinanceInfoForm from "../PreApprovalForms/RefinanceForms/RefinanceInfoForm";
import RefinanceLoanStructureForm from "../PreApprovalForms/RefinanceForms/LoanStructureForm";
import RefinanceLenderFeesForm from "../PreApprovalForms/RefinanceForms/LenderFeesForm";
import RefinanceBorrowersIncomeDataForm from "../PreApprovalForms/RefinanceForms/BorrowsIncomeDataForm";
import RefinanceLoanProgramForm from "../PreApprovalForms/RefinanceForms/LoanProgramForm";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { RefinanceFormKey } from "@/app/pre-approval/types";
import { computeRefinanceDisabledState } from "@/app/pre-approval/formGating";
import { useCreatePreApproval, useGetPreApprovalByIdOnSubmit } from "@/api/reactQueriesHooks/usePreApproval";
import { useRefinancePreApprovalIndexStore } from "@/store/usePreApprovalStore";
import { formatDateOfBirth, generateUUID, getFormattedDate } from "@/utils/functions";
import { BorrowerIncomeEntry, DebtEntry } from "@/api/models/refinance/BorrowersInncomeDataFormTypes";
import RefinanceScenarioCompare from "@/components/RefinanceScenarioCompare/RefinanceScenarioCompare";
import DeleteScenarioDialog from "@/app/pre-approval/dialogs/DeleteScenarioDialog";
import { useSessionStore } from "@/stores/SessionStore";

type RefinanceTabProps = {
    methods: any;
    preApprovalId: string | null;
    setPreApprovalId: Dispatch<SetStateAction<string | null>>;
    preApprovalIdFromURL: string | null;
    isRefinanceLoading: boolean;
    setIsRefinanceLoading: Dispatch<SetStateAction<boolean>>;
    tabValue: number;
    setTabValue: Dispatch<SetStateAction<number>>;
    setLoanType: Dispatch<SetStateAction<number | null>>;
    status: number | null;
    setStatus: Dispatch<SetStateAction<number>>;
    fetchedData: any | null;
    handleCreateSuccess: () => void;
    isRefinancePDFbuttondisabled: Record<number, boolean>;
    setIsRefinancePDFbuttondisabled: Dispatch<SetStateAction<Record<number, boolean>>>;
    refinanceQuickQuoteloading: Record<number, boolean>;
    setRefinanceQuickQuoteloading: Dispatch<SetStateAction<Record<number, boolean>>>;
    refinanceFeeWorksheetloading: Record<number, boolean>;
    setRefinanceFeeWorksheetloading: Dispatch<SetStateAction<Record<number, boolean>>>;
    handleClickOpen: (index: number) => void;
    setPdfName: (index: string) => void;
    setCurrentPDF: (index: string) => void;
    selectedPdf: Record<number, string>;
    setSelectedPdf: Dispatch<SetStateAction<Record<number, string>>>;
    setIsRefinanceComparebuttondisabled: Dispatch<SetStateAction<boolean>>;
    setIsRefinanceSaved: Dispatch<SetStateAction<boolean>>;
    isPresenterMode?: boolean;
    setIsPresenterMode?: Dispatch<SetStateAction<boolean>>;
    isPresenterModeDisabled?: boolean;
    setIsPresenterModeDisabled?: Dispatch<SetStateAction<boolean>>;
    onDocumentGenerate?: (pdfType: string, scenarioIndex: number | null, pdfName: string, language: string) => void;
};

export default function RefinanceTab(
    {
        methods,
        preApprovalId,
        setPreApprovalId,
        preApprovalIdFromURL,
        isRefinanceLoading,
        setIsRefinanceLoading,
        tabValue,
        setTabValue,
        setLoanType,
        status,
        setStatus,
        fetchedData,
        handleCreateSuccess,
        isRefinancePDFbuttondisabled,
        setIsRefinancePDFbuttondisabled,
        refinanceQuickQuoteloading,
        setRefinanceQuickQuoteloading,
        refinanceFeeWorksheetloading,
        setRefinanceFeeWorksheetloading,
        handleClickOpen,
        setPdfName,
        setCurrentPDF,
        selectedPdf,
        setSelectedPdf,
        setIsRefinanceComparebuttondisabled,
        setIsRefinanceSaved,
        isPresenterMode,
        setIsPresenterMode,
        isPresenterModeDisabled,
        setIsPresenterModeDisabled,
        onDocumentGenerate
    }: RefinanceTabProps
) {
    const { user } = useSessionStore();
    const [userDisplayName, setUserDisplayName] = useState("");
    const [isAddScenarioDisable, setIsAddScenarioDisable] = useState(true);
    const [isBlockedDelete, setIsBlockedDelete] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [expandedForms, setExpandedForms] = useState<
        Record<number, Record<RefinanceFormKey, boolean>>
    >({});
    const [completedForms, setCompletedForms] = useState<
        Record<number, Record<RefinanceFormKey, boolean>>
    >({});
    const [disabledForms, setDisabledForms] = useState<
        Record<number, Record<RefinanceFormKey, boolean>>
    >({});

    // Stores the initial county {id, county} per scenario so RefinanceRefinanceInfoForm
    // can pre-populate its Autocomplete when loading existing data
    const [scenarioCounties, setScenarioCounties] = useState<
        Record<number, { id: string; county: string }>
    >({});
    // useEffect(() => {
    //     console.log("expandedForms =>", expandedForms);
    //     console.log("completedForms =>", completedForms);
    //     console.log("disabledForms =>", disabledForms);

    // }, [expandedForms, completedForms, disabledForms]);
    const {
        control,
        setValue,
        resetField,
        getValues,
        formState: { isDirty, dirtyFields, errors },
    } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "scenarios",
    });
    useEffect(() => {
        if (user) {
            setUserDisplayName(user.displayName || "");
        }
    }, [user]);
    const handleRefinanceFieldChange = async (index: number) => {
        const currentFormValues = getValues(`scenarios.${index}`);
        const calculatedFormValues = await calculateRefinancePreApproval(index, {
            formValues: currentFormValues,
            borrowerIncome: getValues("scenarios.0.borrowersIncomeData.borrowerIncome"),
        });
        // console.log("calculatedFormValues =>", calculatedFormValues);
        if (dirtyFields.scenarios?.[index]?.refinanceInfo?.ltv) {
            resetField(`scenarios.${index}.refinanceInfo.ltv`, { defaultValue: getValues(`scenarios.${index}.refinanceInfo.ltv`), });
            setValue(`scenarios.${index}.refinanceInfo.loanAmount`, calculatedFormValues.refinanceInfo.loanAmount);
        }
        if (dirtyFields.scenarios?.[index]?.refinanceInfo?.loanAmount) {
            resetField(`scenarios.${index}.refinanceInfo.loanAmount`, { defaultValue: getValues(`scenarios.${index}.refinanceInfo.loanAmount`), });
            setValue(`scenarios.${index}.refinanceInfo.ltv`, calculatedFormValues.refinanceInfo.ltv);
        }
        setValue(`scenarios.${index}.refinanceInfo.creditLimit`, calculatedFormValues.refinanceInfo.creditLimit);
        resetField(`scenarios.${index}.loanStructure.loanProgram`, { defaultValue: getValues(`scenarios.${index}.loanStructure.loanProgram`), });
        setValue(`scenarios.${index}.refinanceInfo.maxAllowed`, calculatedFormValues.refinanceInfo.maxAllowed);
        setValue(`scenarios.${index}.refinanceInfo.desiredCashOut`, calculatedFormValues.refinanceInfo.desiredCashOut);
        if (dirtyFields.scenarios?.[index]?.refinanceInfo?.monthlyTaxAmount) {
            resetField(`scenarios.${index}.refinanceInfo.monthlyTaxAmount`, { defaultValue: getValues(`scenarios.${index}.refinanceInfo.monthlyTaxAmount`), });
            setValue(`scenarios.${index}.refinanceInfo.annualTaxAmount`, calculatedFormValues.refinanceInfo.annualTaxAmount);
        }
        if (dirtyFields.scenarios?.[index]?.refinanceInfo?.annualTaxAmount) {
            resetField(`scenarios.${index}.refinanceInfo.annualTaxAmount`, { defaultValue: getValues(`scenarios.${index}.refinanceInfo.annualTaxAmount`), });
            setValue(`scenarios.${index}.refinanceInfo.monthlyTaxAmount`, calculatedFormValues.refinanceInfo.monthlyTaxAmount);
        }
        if (getValues(`scenarios.${index}.loanStructure.loanProgram`) == "5" || getValues(`scenarios.${index}.loanStructure.loanProgram`) == "6") {
            setValue(`scenarios.${index}.refinanceInfo.monthlyTaxAmount`, 0);
            setValue(`scenarios.${index}.refinanceInfo.annualTaxAmount`, 0);
        }
        setValue(`scenarios.${index}.refinanceInfo.hazardInsurance`, calculatedFormValues.refinanceInfo.hazardInsurance);
        setValue(`scenarios.${index}.refinanceInfo.mipRate`, calculatedFormValues.refinanceInfo.mipRate);
        setValue(`scenarios.${index}.refinanceInfo.mi`, calculatedFormValues.refinanceInfo.mi);
        setValue(`scenarios.${index}.lenderFees.loanOriginationFee`, calculatedFormValues.lenderFees.loanOriginationFee);
        setValue(`scenarios.${index}.lenderFees.discountFee`, calculatedFormValues.lenderFees.discountFee);
        setValue(`scenarios.${index}.lenderFees.upfrontMipPercentage`, calculatedFormValues.lenderFees.upfrontMipPercentage);
        setValue(`scenarios.${index}.lenderFees.upfrontMip`, calculatedFormValues.lenderFees.upfrontMip);
        setValue(`scenarios.${index}.loanProgram.frontEndRatio`, calculatedFormValues.loanProgram.frontEndRatio,);
        setValue(`scenarios.${index}.loanProgram.backEndRatio`, calculatedFormValues.loanProgram.backEndRatio,);
        setValue(`scenarios.${index}.loanProgram.baseLoanAmount`, calculatedFormValues.loanProgram.baseLoanAmount,);
        setValue(`scenarios.${index}.loanProgram.finalLoanAmount`, calculatedFormValues.loanProgram.finalLoanAmount,);
        setValue(`scenarios.${index}.loanProgram.principalAndInterest`, calculatedFormValues.loanProgram.principalAndInterest,);
        setValue(`scenarios.${index}.loanProgram.monthlyTotal`, calculatedFormValues.loanProgram.monthlyTotal,);
        setValue(`scenarios.${index}.loanProgram.clearingCart`, calculatedFormValues.loanProgram.clearingCart);
        setValue(`scenarios.${index}.loanProgram.cashOutAmount`, calculatedFormValues.loanProgram.cashOutAmount);
        setValue(`scenarios.${index}.loanProgram.borrowers`, calculatedFormValues.loanProgram.borrowers);
    };
    async function calculateRefinancePreApproval(
        index: number,
        values: any,
    ): Promise<any> {
        const { formValues } = values;

        let SVltv = 0;
        let SVloanAmount = 0;
        let SVmaxAllowed = 0;
        let SVmonthlyTaxAmount = 0;
        let SVannualTaxAmount = 0;
        let SVmipRate = 0;
        let SVhazardInsurance = 0;
        let SVmi = 0;
        let SVloanOriginationFee = 0;
        let SVdiscountFee = 0;
        let SVupfrontMip = 0;
        let SVupfrontMipPercentage = 0;
        let SVfrontEndRatio = 0;
        let SVbackEndRatio = 0;
        let SVbaseLoanAmount = 0;
        let SVfinalLoanAmount = 0;
        let SVprincipalAndInterest = 0;
        let SVclearingCart = 0;
        let SVcashOutAmount = 0;
        let SVdesiredCashOut = 0;
        let SVborrowers = [];
        let SVmonthlyTotal = 0;

        const estimatedPropertyValue = formValues?.refinanceInfo?.estimatedPropertyValue;
        const ltv = formValues?.refinanceInfo?.ltv;
        const loanAmount = formValues?.refinanceInfo?.loanAmount;
        const currentLoanBalance = formValues?.refinanceInfo?.currentLoanBalance;
        const upmipRate = formValues?.lenderFees?.upfrontMipPercentage;
        const interestRate = formValues?.refinanceInfo?.interestRate;
        const term = formValues?.loanProgram?.term;
        const loanProgram = formValues?.loanStructure?.loanProgram;
        const refinanceType = formValues?.refinanceInfo?.refinanceType;
        const desiredCashOut = formValues?.refinanceInfo?.desiredCashOut;
        const monthlyTaxAmount = formValues?.refinanceInfo?.monthlyTaxAmount;
        const annualTaxAmount = formValues?.refinanceInfo?.annualTaxAmount;
        const mipRate = formValues?.refinanceInfo?.mipRate;
        const hazardInsurance = formValues?.refinanceInfo?.hazardInsurance;
        const mortgageInsurance = formValues?.refinanceInfo?.mi;
        const associationFee = formValues?.refinanceInfo?.associationFee;

        if (estimatedPropertyValue > 0 && dirtyFields.scenarios?.[index]?.refinanceInfo?.ltv) {
            SVloanAmount = (estimatedPropertyValue * ltv) / 100;
            SVltv = ltv;
        } else if (estimatedPropertyValue > 0 && dirtyFields.scenarios?.[index]?.refinanceInfo?.loanAmount) {
            SVloanAmount = loanAmount;
            SVltv = (loanAmount * 100) / estimatedPropertyValue;
        } else {
            if (estimatedPropertyValue > 0 && loanAmount > 0 && ltv > 0 && !dirtyFields.scenarios?.[index]?.refinanceInfo?.ltv) {
                SVloanAmount = loanAmount;
                SVltv = ltv;
            } else if (estimatedPropertyValue > 0 && loanAmount > 0 && ltv > 0 && !dirtyFields.scenarios?.[index]?.refinanceInfo?.loanAmount) {
                SVloanAmount = loanAmount;
                SVltv = ltv;
            }
        }

        if (refinanceType === "2" && SVloanAmount > 0 && currentLoanBalance > 0) {
            SVmaxAllowed = Math.round((estimatedPropertyValue * (SVltv / 100)) - currentLoanBalance);
        }

        if (loanProgram == "1" || loanProgram == "2" || loanProgram == "3" || loanProgram == "4") {
            if (monthlyTaxAmount > 0 && dirtyFields.scenarios?.[index]?.refinanceInfo?.monthlyTaxAmount) {
                SVmonthlyTaxAmount = monthlyTaxAmount;
                SVannualTaxAmount = monthlyTaxAmount * 12;
            } else if (annualTaxAmount > 0 && dirtyFields.scenarios?.[index]?.refinanceInfo?.annualTaxAmount) {
                const monthlyPropertyTax = annualTaxAmount / 12;
                SVmonthlyTaxAmount = monthlyPropertyTax;
                SVannualTaxAmount = annualTaxAmount;
            } else {
                if (monthlyTaxAmount > 0 && annualTaxAmount > 0) {
                    SVmonthlyTaxAmount = monthlyTaxAmount;
                    SVannualTaxAmount = annualTaxAmount;
                }
            }
        }

        let calculatedAnnualMIPRate = 0;

        let calcmiPercent = 0;
        if (loanProgram == "3") {
            if (SVloanAmount <= 726200) {
                if (SVltv <= 90) {
                    calculatedAnnualMIPRate = 0.5; // 50 bps
                } else if (SVltv > 90 && SVltv <= 95) {
                    calculatedAnnualMIPRate = 0.55; // 55 bps
                } else if (SVltv > 95) {
                    calculatedAnnualMIPRate = 0.55; // 55 bps
                }
            } else {
                if (SVltv <= 90) {
                    calculatedAnnualMIPRate = 0.7; // 70 bps
                } else if (SVltv > 90 && SVltv <= 95) {
                    calculatedAnnualMIPRate = 0.7; // 70 bps
                } else if (SVltv > 95) {
                    calculatedAnnualMIPRate = 0.75; // 75 bps
                }
            }
        } else {
            if (dirtyFields.scenarios?.[index]?.loanStructure?.loanProgram) {
                if (loanProgram == "4") {
                    calculatedAnnualMIPRate = 3.3;
                } else {
                    calculatedAnnualMIPRate = 0;
                }
            } else {
                calculatedAnnualMIPRate = mipRate;
            }
        }
        SVmipRate = calculatedAnnualMIPRate;

        SVmi = Math.round(
            (SVloanAmount * calculatedAnnualMIPRate) / 100 / 12,
        );

        if (loanProgram == "5" || loanProgram == "6") {
            SVhazardInsurance = 0;
        } else {
            SVhazardInsurance = hazardInsurance;
        }

        const loanOriginationFeePercentage =
            formValues?.lenderFees?.loanOriginationFeePercentage;
        const discountFeePercentage = formValues?.lenderFees?.discountFeePercentage;
        const upfrontMipPercentage = formValues?.lenderFees?.upfrontMipPercentage;
        const appraisalFee = formValues?.lenderFees?.appraisalFee;
        const escrowFees = formValues?.lenderFees?.escrowFees;
        const titleFees = formValues?.lenderFees?.titleFees;
        const thirdPartyLenderFee = formValues?.lenderFees?.thirdPartyLenderFee;

        if (loanProgram !== "3") {
            if (dirtyFields.scenarios?.[index]?.loanStructure?.loanProgram) {
                SVupfrontMipPercentage = 0;
            } else {
                SVupfrontMipPercentage = upfrontMipPercentage;
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
                (loanOriginationFeePercentage / 100) * SVloanAmount,
            );
            const upfrontMip = Math.floor(
                (SVupfrontMipPercentage / 100) * SVloanAmount * 100
            ) / 100;

            SVloanOriginationFee = loanOriginationFee;
            SVupfrontMip = upfrontMip;
        }

        const borrowerIncome =
            values.borrowerIncome ??
            formValues?.borrowersIncomeData?.borrowerIncome ??
            formValues?.borrowerIncomes;

        let totalIncome = 0;
        let totalPayment = 0;
        borrowerIncome?.forEach((borrower: any) => {
            totalIncome += Number(borrower.monthlyIncome) || 0;
            borrower?.debts?.forEach((debt: any) => {
                totalPayment += Number(debt.monthlyPayment) || 0;
            });
        });
        // setMonthlyIncome(index, totalIncome);
        // console.log("borrowerIncome =>",borrowerIncome);

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

        const upmipAmount = SVloanAmount * (upmipRate / 100);
        const finalLoanAmount = SVloanAmount + upmipAmount;

        // if (finalLoanAmount > 0) {
        //     const discountFee = Math.round(
        //         (discountFeePercentage / 100) * finalLoanAmount,
        //     );
        //     SVdiscountFee = discountFee;
        // }
        if (SVloanAmount > 0) {
            const discountFee = Math.round(
                (discountFeePercentage / 100) * SVloanAmount,
            );
            SVdiscountFee = discountFee;
        }

        const lenderFees = SVloanOriginationFee + SVdiscountFee + appraisalFee + escrowFees + titleFees + thirdPartyLenderFee;
        SVclearingCart = isNaN(lenderFees)
            ? 0
            : +lenderFees.toFixed(2)
        if (refinanceType === "2") {
            SVcashOutAmount = desiredCashOut - lenderFees;
            SVdesiredCashOut = desiredCashOut;
        } else {
            SVdesiredCashOut = 0;
        }

        let checkterm = 0;
        if (term == undefined) {
            checkterm = 30;
        } else {
            checkterm = term;
        }

        const P = finalLoanAmount;
        const r = Number(interestRate || 0) / 100 / 12;
        const n = checkterm * 12;

        const monthlyPI =
            r === 0
                ? P / n
                : (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

        const monthlyTotal =
            monthlyPI +
            SVmonthlyTaxAmount +
            Number(SVhazardInsurance) +
            SVmi +
            Number(associationFee);

        const calcPrincipalAndInterest = isNaN(monthlyPI)
            ? 0
            : +monthlyPI.toFixed(2);
        let calMortgageInsurance = 0;
        const numMortgageInsurance = Number(mortgageInsurance);
        if (numMortgageInsurance && numMortgageInsurance > 0) {
            calMortgageInsurance = isNaN(numMortgageInsurance)
                ? 0
                : +numMortgageInsurance.toFixed(2);
        }

        const monthlyHousingExpenses =
            calcPrincipalAndInterest +
            SVmonthlyTaxAmount +
            calMortgageInsurance +
            associationFee;

        const calculatedFrontEndRatio =
            totalIncome > 0
                ? parseFloat(((monthlyHousingExpenses / totalIncome) * 100).toFixed(2))
                : 0;

        const frontEnd = !isFinite(calculatedFrontEndRatio)
            ? 0
            : calculatedFrontEndRatio;

        let calculatedBackEndRatio = 0;

        calculatedBackEndRatio = Number(
            (((monthlyHousingExpenses + totalPayment) / totalIncome) * 100).toFixed(
                2,
            ),
        );

        const backEnd = !isFinite(calculatedBackEndRatio)
            ? 0
            : calculatedBackEndRatio;

        SVfrontEndRatio = frontEnd;
        SVbackEndRatio = backEnd;

        SVbaseLoanAmount = isNaN(SVloanAmount) ? 0 : +SVloanAmount.toFixed(2);
        SVfinalLoanAmount = isNaN(finalLoanAmount)
            ? 0
            : +finalLoanAmount.toFixed(2);
        SVprincipalAndInterest = isNaN(monthlyPI) ? 0 : +monthlyPI.toFixed(0);
        SVmonthlyTotal = isNaN(monthlyTotal) ? 0 : +Number(monthlyTotal).toFixed(0);

        return {
            refinanceInfo: {
                ltv: SVltv,
                loanAmount: SVloanAmount,
                creditLimit: SVloanAmount,
                maxAllowed: SVmaxAllowed,
                monthlyTaxAmount: SVmonthlyTaxAmount,
                desiredCashOut: SVdesiredCashOut,
                annualTaxAmount: SVannualTaxAmount,
                mipRate: SVmipRate,
                mi: SVmi,
                hazardInsurance: SVhazardInsurance
            },
            lenderFees: {
                loanOriginationFee: SVloanOriginationFee,
                discountFee: SVdiscountFee,
                upfrontMipPercentage: SVupfrontMipPercentage,
                upfrontMip: SVupfrontMip,
            },
            loanProgram: {
                frontEndRatio: SVfrontEndRatio,
                backEndRatio: SVbackEndRatio,
                baseLoanAmount: SVbaseLoanAmount,
                finalLoanAmount: SVfinalLoanAmount,
                clearingCart: SVclearingCart,
                cashOutAmount: SVcashOutAmount,
                borrowers: SVborrowers,
                principalAndInterest: SVprincipalAndInterest,
                monthlyTotal: SVmonthlyTotal,
            }
        };
    }
    const refinancePreApprovalIndexStore = useRefinancePreApprovalIndexStore(
        (state) => state.ratios,
    );
    const {
        initializeIndex,
        setBorrowerName,
        setFicoScore,
        setFrontEndRatio,
        setBackEndRatio,
    } = useRefinancePreApprovalIndexStore.getState();
    useEffect(() => {
        if (fetchedData) {
            async function setForm() {
                const formatedFetchedData = fetchedData.data;
                if (formatedFetchedData.loanType == 1) {
                    setLoanType(1);
                    setTabValue(1);

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
                        setIsRefinanceComparebuttondisabled(false);
                    }

                    for (let index = 0; index < scenariosData.length; index++) {
                        const scenario = scenariosData[index];
                        const formData = formatedFetchedData.scenarios[index].refinance;
                        let scenarioIndex = index + 1;

                        if (scenario.refinance.loanProgram !== null) {
                            setIsRefinancePDFbuttondisabled((prev) => ({ ...prev, [index]: false }));
                        } else {
                            setIsRefinancePDFbuttondisabled((prev) => ({ ...prev, [index]: true }));
                        }

                        if (formatedFetchedData.status) {
                            setStatus(formatedFetchedData.status);
                        }

                        const calculatedvalues = await calculateRefinancePreApproval(index, {
                            formValues: formatedFetchedData.scenarios[index].refinance,
                            storeValues: refinancePreApprovalIndexStore,
                        });
                        setFrontEndRatio(index, calculatedvalues.loanProgram.frontEndRatio);
                        setBackEndRatio(index, calculatedvalues.loanProgram.backEndRatio);

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
                            loanStructure: {
                                loanProgram: String(formData.loanStructure?.loanProgram ?? ""),
                                lienPosition: String(formData.loanStructure?.lienPosition ?? ""),
                            },
                            refinanceInfo: {
                                countyID: String(formData.refinanceInfo?.countyID ?? ""),
                                occupancyStatus: String(formData.refinanceInfo?.occupancyStatus ?? ""),
                                propertyType: String(formData.refinanceInfo?.propertyType ?? ""),
                                estimatedPropertyValue: formData.refinanceInfo?.estimatedPropertyValue ?? "",
                                ltv: formData.refinanceInfo?.ltv ?? "",
                                loanAmount: formData.refinanceInfo?.loanAmount ?? "",
                                currentLoanBalance: formData.refinanceInfo?.currentLoanBalance ?? "",
                                creditLimit: formData.refinanceInfo?.creditLimit ?? undefined,
                                currentDrawAmount: formData.refinanceInfo?.currentDrawAmount ?? undefined,
                                refinanceType: String(formData.refinanceInfo?.refinanceType ?? ""),
                                maxAllowed: formData.refinanceInfo?.maxAllowed ?? "",
                                desiredCashOut: formData.refinanceInfo?.desiredCashOut ?? undefined,
                                interestRate: formData.refinanceInfo?.interestRate ?? "",
                                monthlyTaxAmount: [5, 6].includes(Number(formData.loanStructure?.loanProgram))
                                    ? 0
                                    : (formData.refinanceInfo?.monthlyTaxAmount ?? ""),
                                annualTaxAmount: [5, 6].includes(Number(formData.loanStructure?.loanProgram))
                                    ? 0
                                    : (formData.refinanceInfo?.annualTaxAmount ?? ""),
                                mipRate: formData.refinanceInfo?.mipRate ? formData.refinanceInfo.mipRate : formData.loanStructure?.loanProgram == 3 ? 1.75 : 0,
                                hazardInsurance: [5, 6].includes(Number(formData.loanStructure?.loanProgram))
                                    ? 0
                                    : (formData.refinanceInfo?.hazardInsurance ?? 150),
                                associationFee: formData.refinanceInfo?.associationFee ?? 0,
                                mi: formData.refinanceInfo?.mi ?? 0,
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
                                                    debtToBePaidOff: debt.debtToBePaidOff ?? false,
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
                                cashOutAmount: formData.loanProgram?.cashOutAmount ?? calculatedvalues.loanProgram.cashOutAmount,
                                totalNeededToClear: formData.loanProgram?.totalNeededToClear ?? calculatedvalues.loanProgram.totalNeededToClear,
                                principalAndInterest: formData.loanProgram?.principalAndInterest ?? calculatedvalues.loanProgram.principalAndInterest,
                                monthlyPropertyTaxPercentage: formData.loanProgram?.monthlyPropertyTaxPercentage ?? 1.25,
                                monthlyPropertyTax: formData.loanProgram?.monthlyPropertyTax ?? calculatedvalues.loanProgram.monthlyPropertyTax,
                                mortgageInsurance: formData.loanProgram?.mortgageInsurance ?? 0,
                                monthlyTotal: formData.loanProgram?.monthlyTotal ?? calculatedvalues.loanProgram.monthlyTotal,
                                borrowers: calculatedvalues.loanProgram.borrowers,
                            },
                        });

                        // Store county display info for this scenario so the Autocomplete pre-populates
                        if (formData.refinanceInfo?.countyID && formData.refinanceInfo?.countyName) {
                            setScenarioCounties((prev) => ({
                                ...prev,
                                [index]: {
                                    id: formData.refinanceInfo.countyID,
                                    county: formData.refinanceInfo.countyName,
                                },
                            }));
                        }
                    }

                    const formOrder: RefinanceFormKey[] = [
                        "borrowerInfo",
                        "loanStructure",
                        "refinanceInfo",
                        "lenderFees",
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

                            const resolveSectionKey = (key: RefinanceFormKey) =>
                                key === "borrowersIncomeData" ? "borrowerIncomes" : key;

                            formOrder.forEach((formKey) => {
                                const sectionKey = resolveSectionKey(formKey);
                                const sectionData = scenario.refinance[sectionKey];

                                const hasData = Array.isArray(sectionData)
                                    ? sectionData.length > 0
                                    : sectionData != null;

                                completedState[formKey] = hasData;
                                expandedState[formKey] = false;
                            });

                            // Every earlier form must be complete to unlock a form
                            Object.assign(
                                disabledState,
                                computeRefinanceDisabledState(completedState),
                            );

                            // Pre-filled data behind a locked form (e.g. income data from the
                            // borrower's employment history) must not show as submitted
                            formOrder.forEach((formKey) => {
                                if (disabledState[formKey]) completedState[formKey] = false;
                            });

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

                    if (scenariosData[0].refinance.loanProgram) {
                        setIsAddScenarioDisable(false);
                        setIsRefinanceSaved(true);
                        setIsPresenterModeDisabled?.(false);
                    }
                }
            }
            setForm();
        }
    }, [fetchedData]);
    const createFormState = () => ({
        borrowerInfo: true,
        loanStructure: false,
        refinanceInfo: false,
        lenderFees: false,
        borrowersIncomeData: false,
        loanProgram: false,
    });
    const createCompletedState = () => ({
        borrowerInfo: false,
        loanStructure: false,
        refinanceInfo: false,
        lenderFees: false,
        borrowersIncomeData: false,
        loanProgram: false,
    });
    const createDisabledState = () => ({
        borrowerInfo: false,
        loanStructure: true,
        refinanceInfo: true,
        lenderFees: true,
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
            remove(deleteIndex);
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
        if (Object.keys(useRefinancePreApprovalIndexStore).length == 0) {
            initializeIndex(0);
        }
    }, [fields]);
    const handleAddNewState = () => {
        const newIndex = fields.length;

        setExpandedForms((prev) => ({
            ...prev,
            [newIndex]: {
                borrowerInfo: true,
                loanStructure: false,
                refinanceInfo: false,
                lenderFees: false,
                borrowersIncomeData: false,
                loanProgram: false,
            },
        }));

        setCompletedForms((prev) => ({
            ...prev,
            [newIndex]: {
                borrowerInfo: false,
                loanStructure: false,
                refinanceInfo: false,
                lenderFees: false,
                borrowersIncomeData: false,
                loanProgram: false,
            },
        }));

        setDisabledForms((prev) => ({
            ...prev,
            [newIndex]: {
                borrowerInfo: false,
                loanStructure: false,
                refinanceInfo: false,
                lenderFees: false,
                borrowersIncomeData: false,
                loanProgram: false,
            },
        }));

        setIsRefinancePDFbuttondisabled((prev) => ({ ...prev, [newIndex]: true }));
    };
    const refinanceFormOrder: RefinanceFormKey[] = [
        "borrowerInfo",
        "loanStructure",
        "refinanceInfo",
        "lenderFees",
        "borrowersIncomeData",
        "loanProgram",
    ];
    const expandNextForm = (scenarioIndex: number, currentForm: RefinanceFormKey) => {
        const currentIndex = refinanceFormOrder.indexOf(currentForm);
        const nextForm = refinanceFormOrder[currentIndex + 1];

        if (!nextForm) return;

        setExpandedForms((prev) => {
            const resetState = Object.fromEntries(
                refinanceFormOrder.map((key) => [key, false]),
            ) as Record<RefinanceFormKey, boolean>;

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
    const handleToggle = (scenarioIndex: number, form: RefinanceFormKey) => {
        setExpandedForms((prev) => {
            const resetState = Object.fromEntries(
                refinanceFormOrder.map((key) => [key, false]),
            ) as Record<RefinanceFormKey, boolean>;
            return {
                ...prev,
                [scenarioIndex]: {
                    ...resetState,
                    [form]: true,
                    // [form]: prev[scenarioIndex]?.[form] ? true : false,
                },
            };
        });
    };
    const { data: fetchedDataonSubmit, refetch: refetchPreApprovalonSubmit } =
        useGetPreApprovalByIdOnSubmit(preApprovalIdFromURL || preApprovalId || "");
    const { mutateAsync: submitPreApproval } = useCreatePreApproval();

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
                const {
                    borrowerInfo,
                    loanStructure,
                    refinanceInfo,
                    lenderFees,
                    borrowersIncomeData,
                    loanProgram,
                } = scenario;

                const { borrowersIncomeData: firstBorrowersIncomeData } = scenarios[0];

                const borrowerInfopayload = {
                    preApprovalId,
                    borrowerName: borrowerInfo.borrowerName,
                    coBorrowerName: borrowerInfo.coBorrowerName,
                    borrowerCellNumber: borrowerInfo.borrowerCellNumber,
                    coBorrowerCellNumber: borrowerInfo.coBorrowerCellNumber,
                    borrowerEmail: borrowerInfo.borrowerEmail,
                    dateOfBirth: borrowerInfo.dateOfBirth ? formatDateOfBirth(borrowerInfo.dateOfBirth) : null,
                    currentAddress: borrowerInfo.currentAddress,
                    ssn: borrowerInfo.ssn,
                    maritalStatus: borrowerInfo.maritalStatus,
                };

                const loanStructurepayload = {
                    preApprovalId,
                    loanProgram: loanStructure.loanProgram,
                    lienPosition: loanStructure.lienPosition != "" ? Number(loanStructure.lienPosition) : null,
                };

                const refinanceInfopayload = {
                    preApprovalId,
                    countyID: refinanceInfo.countyID || null,
                    occupancyStatus: refinanceInfo.occupancyStatus,
                    propertyType: refinanceInfo.propertyType,
                    estimatedPropertyValue: refinanceInfo.estimatedPropertyValue,
                    ltv: refinanceInfo.ltv,
                    loanAmount: refinanceInfo.loanAmount,
                    currentLoanBalance: refinanceInfo.currentLoanBalance,
                    creditLimit: refinanceInfo.creditLimit,
                    currentDrawAmount: refinanceInfo.currentDrawAmount,
                    refinanceType: refinanceInfo.refinanceType,
                    maxAllowed: refinanceInfo.maxAllowed,
                    desiredCashOut: refinanceInfo.desiredCashOut,
                    interestRate: Number(refinanceInfo.interestRate),
                    monthlyTaxAmount: Number(refinanceInfo.monthlyTaxAmount),
                    annualTaxAmount: Number(refinanceInfo.annualTaxAmount),
                    mipRate: refinanceInfo.mipRate,
                    hazardInsurance: refinanceInfo.hazardInsurance,
                    associationFee: refinanceInfo.associationFee,
                    mi: refinanceInfo.mi,
                };

                const lenderFeespayload = {
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

                const borrowersIncomeDatapayload =
                    firstBorrowersIncomeData.borrowerIncome.map((entry: any) => ({
                        preApprovalId,
                        borrowerName: entry.borrowerName,
                        ficoScore: entry.ficoScore ? Number(entry.ficoScore) : null,
                        monthlyIncome: entry.monthlyIncome,
                        debts: entry.debts.map((debt: any) => ({
                            preApprovalId,
                            debtType: Number(debt.debtType),
                            debtToBePaidOff: debt.debtToBePaidOff,
                            balance: Number(debt.balance),
                            monthlyPayment: Number(debt.monthlyPayment),
                        })),
                    }));

                const loanProgrampayload = {
                    preApprovalId,
                    loanProgram: loanStructure.loanProgram,
                    frontEndRatio: loanProgram.frontEndRatio,
                    backEndRatio: loanProgram.backEndRatio,
                    price: refinanceInfo.estimatedPropertyValue,
                    interestRate: refinanceInfo.interestRate,
                    baseLoanAmount: loanProgram.baseLoanAmount,
                    upmipRate: lenderFees.upfrontMipPercentage,
                    upmipAmount: lenderFees.upfrontMip,
                    annualMIPRate: refinanceInfo.mipRate,
                    mmi: refinanceInfo.mi,
                    term: loanProgram.term,
                    finalLoanAmount: loanProgram.finalLoanAmount,
                    ltv: refinanceInfo.ltv,
                    ltvAmount: refinanceInfo.loanAmount,
                    clearingCart: loanProgram.clearingCart,
                    closingCosts: loanProgram.clearingCart,
                    propertyTax: refinanceInfo.annualTaxAmount,
                    cashOutAmount: loanProgram.cashOutAmount,
                    borrowers: loanProgram.borrowers.map((borrower: any) => ({
                        monthlyIncome: borrower.monthlyIncome,
                        debts: borrower.debts,
                        ficoScore: borrower.ficoScore ? Number(borrower.ficoScore) : null,
                    })),
                    principalAndInterest: loanProgram.principalAndInterest,
                    monthlyPropertyTax: refinanceInfo.monthlyTaxAmount,
                    hazardInsurance: refinanceInfo.hazardInsurance,
                    mortgageInsurance: loanProgram.mortgageInsurance,
                    hoaFee: refinanceInfo.associationFee,
                    monthlyTotal: loanProgram.monthlyTotal,
                };

                if (scenarios.length > 1) {
                    const isborrowerInfoValid = await methods.trigger(
                        `scenarios.${index}.borrowerInfo`,
                    );
                    if (!isborrowerInfoValid) {
                        handleToggle(index, "borrowerInfo");
                        setIsRefinanceLoading(false);
                        return;
                    }
                    const isLoanStructureValid = await methods.trigger(
                        `scenarios.${index}.loanStructure`,
                    );
                    if (!isLoanStructureValid) {
                        handleToggle(index, "loanStructure");
                        setIsRefinanceLoading(false);
                        return;
                    }
                    const isRefinanceInfoValid = await methods.trigger(
                        `scenarios.${index}.refinanceInfo`,
                    );
                    if (!isRefinanceInfoValid) {
                        handleToggle(index, "refinanceInfo");
                        setIsRefinanceLoading(false);
                        return;
                    }
                    const islenderFeesValid = await methods.trigger(
                        `scenarios.${index}.lenderFees`,
                    );
                    if (!islenderFeesValid) {
                        handleToggle(index, "lenderFees");
                        setIsRefinanceLoading(false);
                        return;
                    }
                    const isborrowersIncomeDataValid = await methods.trigger(
                        `scenarios.${index}.borrowersIncomeData`,
                    );
                    if (!isborrowersIncomeDataValid) {
                        handleToggle(index, "borrowersIncomeData");
                        setIsRefinanceLoading(false);
                        return;
                    }
                    const isloanProgramValid = await methods.trigger(
                        `scenarios.${index}.loanProgram`,
                    );
                    if (!isloanProgramValid) {
                        handleToggle(index, "loanProgram");
                        setIsRefinanceLoading(false);
                        return;
                    }
                    setIsRefinanceLoading(true);

                    scenarioPayload.push({
                        id: scenario.id ?? generateUUID(),
                        scenarioOrder: scenarioIndex,
                        scenarioName: "",
                        createdAt: scenario.createdAt,
                        updatedAt: getFormattedDate(),
                        lastSubmittedFormNo: 2,
                        purchase: null,
                        refinance: {
                            borrowerInfo: borrowerInfopayload,
                            loanStructure: loanStructurepayload,
                            refinanceInfo: refinanceInfopayload,
                            lenderFees: lenderFeespayload,
                            borrowerIncomes: borrowersIncomeDatapayload,
                            loanProgram: loanProgrampayload,
                        }
                    });
                } else {
                    if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.refinance?.borrowerInfo) {
                        const isborrowerInfoValid = await methods.trigger(
                            `scenarios.${index}.borrowerInfo`,
                        );
                        if (!isborrowerInfoValid) {
                            console.log("isborrowerInfoValid");
                            handleToggle(index, "borrowerInfo");
                            return;
                        }
                    }
                    if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.refinance?.loanStructure) {
                        const isloanStructureValid = await methods.trigger(
                            `scenarios.${index}.loanStructure`,
                        );
                        if (!isloanStructureValid) {
                            console.log("isloanStructureValid");
                            handleToggle(index, "loanStructure");
                            return;
                        }
                    }
                    if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.refinance?.refinanceInfo) {
                        const isrefinanceInfoValid = await methods.trigger(
                            `scenarios.${index}.refinanceInfo`,
                        );
                        if (!isrefinanceInfoValid) {
                            console.log("isrefinanceInfoValid");
                            handleToggle(index, "refinanceInfo");
                            return;
                        }
                    }
                    if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.refinance?.lenderFees) {
                        const islenderFeesValid = await methods.trigger(
                            `scenarios.${index}.lenderFees`,
                        );
                        if (!islenderFeesValid) {
                            console.log("islenderFeesValid");
                            handleToggle(index, "lenderFees");
                            return;
                        }
                    }
                    if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.refinance?.borrowerIncomes) {
                        const isborrowersIncomeDataValid = await methods.trigger(
                            `scenarios.${index}.borrowersIncomeData`,
                        );
                        if (!isborrowersIncomeDataValid) {
                            console.log("isborrowersIncomeDataValid");
                            handleToggle(index, "borrowersIncomeData");
                            return;
                        }
                    }
                    if (fetchedDataonSubmit && fetchedDataonSubmit.data?.scenarios[index]?.refinance?.loanProgram) {
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
                        setIsRefinanceLoading(true);

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
                                purchase: null,
                                refinance: {
                                    borrowerInfo: borrowerInfopayload,
                                    loanStructure: fetchedDataonSubmit.data.scenarios[index].refinance.loanStructure ? loanStructurepayload : null,
                                    refinanceInfo: fetchedDataonSubmit.data.scenarios[index].refinance.refinanceInfo ? refinanceInfopayload : null,
                                    lenderFees: fetchedDataonSubmit.data.scenarios[index].refinance.lenderFees ? lenderFeespayload : null,
                                    borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].refinance.borrowerIncomes ? borrowersIncomeDatapayload : null,
                                    loanProgram: fetchedDataonSubmit.data.scenarios[index].refinance.loanProgram ? loanProgrampayload : null,
                                }
                            });
                        } else {
                            scenarioPayload.push({
                                id: generateUUID(),
                                scenarioOrder: scenarioIndex,
                                scenarioName: "",
                                createdAt: getFormattedDate(),
                                updatedAt: getFormattedDate(),
                                lastSubmittedFormNo: 1,
                                purchase: null,
                                refinance: {
                                    borrowerInfo: borrowerInfopayload,
                                    loanStructure: null,
                                    refinanceInfo: null,
                                    lenderFees: null,
                                    borrowerIncomes: null,
                                    loanProgram: null,
                                }
                            });
                        }
                    } else if (expandedForms[index]?.loanStructure) {
                        const isValid = await methods.trigger(
                            `scenarios.${index}.loanStructure`,
                        );
                        if (!isValid) return;
                        setIsRefinanceLoading(true);

                        scenarioPayload.push({
                            id: scenario.id,
                            scenarioOrder: scenarioIndex,
                            scenarioName: "",
                            createdAt: scenario.createdAt,
                            updatedAt: getFormattedDate(),
                            lastSubmittedFormNo: 2,
                            purchase: null,
                            refinance: {
                                borrowerInfo: borrowerInfopayload,
                                loanStructure: loanStructurepayload,
                                refinanceInfo: fetchedDataonSubmit.data.scenarios[index].refinance.refinanceInfo ? refinanceInfopayload : null,
                                lenderFees: fetchedDataonSubmit.data.scenarios[index].refinance.lenderFees ? lenderFeespayload : null,
                                borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].refinance.borrowerIncomes ? borrowersIncomeDatapayload : null,
                                loanProgram: fetchedDataonSubmit.data.scenarios[index].refinance.loanProgram ? loanProgrampayload : null,
                            }
                        });
                    } else if (expandedForms[index]?.refinanceInfo) {
                        const isValid = await methods.trigger(
                            `scenarios.${index}.refinanceInfo`,
                        );
                        if (!isValid) return;
                        setIsRefinanceLoading(true);

                        scenarioPayload.push({
                            id: scenario.id,
                            scenarioOrder: scenarioIndex,
                            scenarioName: "",
                            createdAt: scenario.createdAt,
                            updatedAt: getFormattedDate(),
                            lastSubmittedFormNo: 2,
                            purchase: null,
                            refinance: {
                                borrowerInfo: borrowerInfopayload,
                                loanStructure: loanStructurepayload,
                                refinanceInfo: refinanceInfopayload,
                                lenderFees: fetchedDataonSubmit.data.scenarios[index].refinance.lenderFees ? lenderFeespayload : null,
                                borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].refinance.borrowerIncomes ? borrowersIncomeDatapayload : null,
                                loanProgram: fetchedDataonSubmit.data.scenarios[index].refinance.loanProgram ? loanProgrampayload : null,
                            }
                        });
                    } else if (expandedForms[index]?.lenderFees) {
                        const isValid = await methods.trigger(
                            `scenarios.${index}.lenderFees`,
                        );
                        if (!isValid) return;
                        setIsRefinanceLoading(true);

                        scenarioPayload.push({
                            id: scenario.id,
                            scenarioOrder: scenarioIndex,
                            scenarioName: "",
                            createdAt: scenario.createdAt,
                            updatedAt: getFormattedDate(),
                            lastSubmittedFormNo: 2,
                            purchase: null,
                            refinance: {
                                borrowerInfo: borrowerInfopayload,
                                loanStructure: loanStructurepayload,
                                refinanceInfo: refinanceInfopayload,
                                lenderFees: lenderFeespayload,
                                borrowerIncomes: fetchedDataonSubmit.data.scenarios[index].refinance.borrowerIncomes ? borrowersIncomeDatapayload : null,
                                loanProgram: fetchedDataonSubmit.data.scenarios[index].refinance.loanProgram ? loanProgrampayload : null,
                            }
                        });
                    } else if (expandedForms[index]?.borrowersIncomeData) {
                        const isValid = await methods.trigger(
                            `scenarios.${index}.borrowersIncomeData`,
                        );
                        if (!isValid) return;
                        setIsRefinanceLoading(true);

                        scenarioPayload.push({
                            id: scenario.id,
                            scenarioOrder: scenarioIndex,
                            scenarioName: "",
                            createdAt: scenario.createdAt,
                            updatedAt: getFormattedDate(),
                            lastSubmittedFormNo: 2,
                            purchase: null,
                            refinance: {
                                borrowerInfo: borrowerInfopayload,
                                loanStructure: loanStructurepayload,
                                refinanceInfo: refinanceInfopayload,
                                lenderFees: lenderFeespayload,
                                borrowerIncomes: borrowersIncomeDatapayload,
                                loanProgram: fetchedDataonSubmit.data.scenarios[index].refinance.loanProgram ? loanProgrampayload : null,
                            }
                        });

                        if (preApprovalId) {
                            await refetchPreApprovalonSubmit();
                        }
                    } else if (expandedForms[index]?.loanProgram) {
                        const isValid = await methods.trigger(
                            `scenarios.${index}.loanProgram`,
                        );
                        if (!isValid) return;
                        const isloanStructureValid = await methods.trigger(
                            `scenarios.${index}.loanStructure`,
                        );
                        if (!isloanStructureValid) return;
                        const isRefinanceInfoValid = await methods.trigger(
                            `scenarios.${index}.refinanceInfo`,
                        );
                        if (!isRefinanceInfoValid) return;
                        const islenderFeesValid = await methods.trigger(
                            `scenarios.${index}.lenderFees`,
                        );
                        if (!islenderFeesValid) return;
                        setIsRefinanceLoading(true);

                        scenarioPayload.push({
                            id: scenario.id,
                            scenarioOrder: scenarioIndex,
                            scenarioName: "",
                            createdAt: scenario.createdAt,
                            updatedAt: getFormattedDate(),
                            lastSubmittedFormNo: 2,
                            purchase: null,
                            refinance: {
                                borrowerInfo: borrowerInfopayload,
                                loanStructure: loanStructurepayload,
                                refinanceInfo: refinanceInfopayload,
                                lenderFees: lenderFeespayload,
                                borrowerIncomes: borrowersIncomeDatapayload,
                                loanProgram: loanProgrampayload,
                            }
                        });
                    } else {
                        const isborrowerInfoValid = await methods.trigger(
                            `scenarios.${index}.borrowerInfo`,
                        );
                        if (!isborrowerInfoValid) {
                            handleToggle(index, "borrowerInfo");
                            return;
                        }
                        const isloanStructureValid = await methods.trigger(
                            `scenarios.${index}.loanStructure`,
                        );
                        if (!isloanStructureValid) {
                            handleToggle(index, "loanStructure");
                            return;
                        }
                        const isRefinanceInfoValid = await methods.trigger(
                            `scenarios.${index}.refinanceInfo`,
                        );
                        if (!isRefinanceInfoValid) {
                            handleToggle(index, "refinanceInfo");
                            return;
                        }
                        const islenderFeesValid = await methods.trigger(
                            `scenarios.${index}.lenderFees`,
                        );
                        if (!islenderFeesValid) {
                            handleToggle(index, "lenderFees");
                            return;
                        }
                        const isborrowersIncomeDataValid = await methods.trigger(
                            `scenarios.${index}.borrowersIncomeData`,
                        );
                        if (!isborrowersIncomeDataValid) {
                            handleToggle(index, "borrowersIncomeData");
                            return;
                        }
                        const isloanProgramValid = await methods.trigger(
                            `scenarios.${index}.loanProgram`,
                        );
                        if (!isloanProgramValid) {
                            handleToggle(index, "loanProgram");
                            return;
                        }
                        setIsRefinanceLoading(true);

                        scenarioPayload.push({
                            id: scenario.id,
                            scenarioOrder: scenarioIndex,
                            scenarioName: "",
                            createdAt: scenario.createdAt,
                            updatedAt: getFormattedDate(),
                            lastSubmittedFormNo: 2,
                            purchase: null,
                            refinance: {
                                borrowerInfo: borrowerInfopayload,
                                loanStructure: loanStructurepayload,
                                refinanceInfo: refinanceInfopayload,
                                lenderFees: lenderFeespayload,
                                borrowerIncomes: borrowersIncomeDatapayload,
                                loanProgram: loanProgrampayload,
                            }
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
                    loanType: 1,
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
                    loanType: 1,
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
                setIsRefinanceComparebuttondisabled(false);
            }

            if (!response?.data) return;
            if (response.data.scenarios[0].refinance.loanProgram !== null) {
                setIsAddScenarioDisable(false);
                setIsRefinanceSaved(true);
                setIsPresenterModeDisabled?.(false);
            }

            const scenariosResponse = response.data.scenarios || [];

            const currentValues = methods.getValues();
            const updatedScenarios = currentValues.scenarios.map(
                (scenario: any, index: number) => {
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
            if (response?.data?.id) {
                setPreApprovalId(response.data.id);
            }

            if (response?.data?.scenarios) {
                response?.data?.scenarios.forEach((scenario: any, index: number) => {
                    const formatedFetchedData = scenario;
                    if (formatedFetchedData.refinance.loanProgram !== null) {
                        setIsRefinancePDFbuttondisabled((prev) => ({ ...prev, [index]: false }));
                    } else {
                        setIsRefinancePDFbuttondisabled((prev) => ({ ...prev, [index]: true }));
                    }
                });
            }

            for (let index = 0; index < scenarios.length; index++) {
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
                if (expandedForms[index]?.loanStructure) {
                    setCompletedForms((prev) => ({
                        ...prev,
                        [index]: {
                            ...prev[index],
                            loanStructure: true,
                        },
                    }));

                    expandNextForm(index, "loanStructure");
                }
                if (expandedForms[index]?.refinanceInfo) {
                    setCompletedForms((prev) => ({
                        ...prev,
                        [index]: {
                            ...prev[index],
                            refinanceInfo: true,
                        },
                    }));

                    expandNextForm(index, "refinanceInfo");
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

            setIsRefinanceLoading(false);
            handleCreateSuccess();
            return;
        } catch (err) {
            console.error("Form submission failed:", err);
            handleError();
        }
    };
    return (
        <FormProvider {...methods}>
            <form
                id="refinance-form"
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

                {isPresenterMode ? (
                    <RefinanceScenarioCompare
                        isPresenterModeOn={true}
                        onTogglePresenterMode={() => setIsPresenterMode && setIsPresenterMode(false)}
                        preApprovalId={preApprovalId}
                        onSave={handleSubmitExpandedForm}
                        onFieldChange={handleRefinanceFieldChange}
                        onDocumentGenerate={onDocumentGenerate}
                    />
                ) : null}

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

                            <RefinanceBorrowerInfoForm
                                index={index}
                                expanded={expandedForms[index]?.borrowerInfo}
                                onToggle={() => handleToggle(index, "borrowerInfo")}
                                isCompleted={completedForms[index]?.borrowerInfo}
                                isDisabled={disabledForms[index]?.borrowerInfo}
                                handleFieldChange={handleRefinanceFieldChange}
                            />
                            <RefinanceLoanStructureForm
                                index={index}
                                expanded={expandedForms[index]?.loanStructure}
                                onToggle={() => handleToggle(index, "loanStructure")}
                                isCompleted={completedForms[index]?.loanStructure}
                                isDisabled={disabledForms[index]?.loanStructure}
                                handleFieldChange={handleRefinanceFieldChange}
                            />
                            <RefinanceRefinanceInfoForm
                                index={index}
                                expanded={expandedForms[index]?.refinanceInfo}
                                onToggle={() => handleToggle(index, "refinanceInfo")}
                                isCompleted={completedForms[index]?.refinanceInfo}
                                isDisabled={disabledForms[index]?.refinanceInfo}
                                handleFieldChange={handleRefinanceFieldChange}
                                initialCounty={scenarioCounties[index]}
                            />
                            <RefinanceLenderFeesForm
                                index={index}
                                expanded={expandedForms[index]?.lenderFees}
                                onToggle={() => handleToggle(index, "lenderFees")}
                                isCompleted={completedForms[index]?.lenderFees}
                                isDisabled={disabledForms[index]?.lenderFees}
                                handleFieldChange={handleRefinanceFieldChange}
                            />
                            <RefinanceBorrowersIncomeDataForm
                                index={index}
                                expanded={expandedForms[index]?.borrowersIncomeData}
                                onToggle={() => handleToggle(index, "borrowersIncomeData")}
                                isCompleted={completedForms[index]?.borrowersIncomeData}
                                isDisabled={disabledForms[index]?.borrowersIncomeData}
                                handleFieldChange={handleRefinanceFieldChange}
                            />
                            <RefinanceLoanProgramForm
                                index={index}
                                expanded={expandedForms[index]?.loanProgram}
                                onToggle={() => handleToggle(index, "loanProgram")}
                                isCompleted={completedForms[index]?.loanProgram}
                                isDisabled={disabledForms[index]?.loanProgram}
                                handleFieldChange={handleRefinanceFieldChange}
                            />
                            <Grid container spacing={2}>

                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Box>
                                        <FormControl
                                            variant="outlined"
                                            sx={{ width: "100%" }}
                                            disabled={
                                                isDirty ||
                                                refinanceQuickQuoteloading[index] ||
                                                refinanceFeeWorksheetloading[index] ||
                                                isRefinancePDFbuttondisabled[index]
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

                                                label="Take an action"
                                            >
                                                <MenuItem
                                                    value="refinancequickQuote"
                                                    data-name="Refinance Quick Quote"
                                                    onClick={(e) =>
                                                        setPdfName(e.currentTarget.dataset.name ?? "")
                                                    }
                                                >
                                                    Refinance Quick Quote
                                                </MenuItem>
                                                <MenuItem
                                                    value="refinanceFeeWorksheet"
                                                    data-name="Refinance Fee Worksheet"
                                                    onClick={(e) =>
                                                        setPdfName(e.currentTarget.dataset.name ?? "")
                                                    }
                                                >
                                                    Refinance Fee Worksheet
                                                </MenuItem>
                                                <MenuItem
                                                    value="refinanceLoanFile"
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
                                                isRefinancePDFbuttondisabled[index]
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
                                            {refinanceQuickQuoteloading[index] || refinanceFeeWorksheetloading[index] ? (
                                                <CircularProgress
                                                    size={24}
                                                    sx={{ color: "#7444F5" }}
                                                />
                                            ) : (
                                                <Typography
                                                    fontWeight={500}
                                                    color={
                                                        !selectedPdf[index] ||
                                                            isRefinancePDFbuttondisabled[index]
                                                            ? "rgba(0, 0, 0, 0.26)"
                                                            : "#7444F5"
                                                    }
                                                >
                                                    {selectedPdf[index] === "refinanceLoanFile" ? "GENERATE FILE" : "GENERATE PDF"}
                                                </Typography>
                                            )}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                </Box>

                {!isPresenterMode && (
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
                                    loanStructure: {
                                        loanProgram: methods.getValues(
                                            `scenarios.${0}.loanStructure.loanProgram`,
                                        ),
                                        lienPosition: methods.getValues(`scenario.${0}.loanStructure.lienPosition`),
                                    },
                                    refinanceInfo: {
                                        occupancyStatus: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.occupancyStatus`,
                                        ),
                                        estimatedPropertyValue: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.estimatedPropertyValue`,
                                        ),
                                        ltv: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.ltv`,
                                        ),
                                        loanAmount: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.loanAmount`,
                                        ),
                                        currentLoanBalance: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.currentLoanBalance`,
                                        ),
                                        refinanceType: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.refinanceType`,
                                        ),
                                        maxAllowed: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.maxAllowed`,
                                        ),
                                        desiredCashOut: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.desiredCashOut`,
                                        ),
                                        interestRate: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.interestRate`,
                                        ),
                                        monthlyTaxAmount: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.monthlyTaxAmount`,
                                        ),
                                        annualTaxAmount: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.annualTaxAmount`,
                                        ),
                                        mipRate: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.mipRate`,
                                        ),
                                        hazardInsurance: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.hazardInsurance`,
                                        ),
                                        associationFee: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.associationFee`,
                                        ),
                                        mi: methods.getValues(
                                            `scenarios.${0}.refinanceInfo.mi`,
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
                                        clearingCart: methods.getValues(
                                            `scenarios.${0}.loanProgram.clearingCart`,
                                        ),
                                        cashOutAmount: methods.getValues(
                                            `scenarios.${0}.loanProgram.cashOutAmount`,
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
                <DeleteScenarioDialog
                    open={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    isBlockedDelete={isBlockedDelete}
                    onDelete={handleDelete}
                />
            </form>
        </FormProvider>
    )
}