"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { IncomeType, IncomeCalculationDocument } from "@/api/models/IncomeCalculation";
import BorrowerInfoForm from "./BorrowerInfoForm";
import ChooseIncomeType from "./ChooseIncomeType";
import IncomeDetailsForm from "./IncomeDetailsForm";
import IncomeCalculations from "./IncomeCalculations";
import {
  useCreateIncomeCalculation,
  useUpdateIncomeCalculation,
  useGetIncomeCalculationsByScenarioId
} from "@/api/reactQueriesHooks/useIncomeCalculation";

interface Props {
  open: boolean;
  onClose: () => void;
  scenarioId?: string;
  preApprovalId?: string;
  borrowerName?: string;
  onIncomeCalculated?: (amount: number) => void;
}

export default function IncomeCalculatorModal({
  open,
  onClose,
  scenarioId,
  preApprovalId,
  borrowerName,
  onIncomeCalculated,
}: Props) {
  const [step, setStep] = useState(1);
  const [employerInfo, setEmployerInfo] = useState<any>(null);
  const [selectedIncomeType, setSelectedIncomeType] = useState<IncomeType | null>(null);
  const [calculatedData, setCalculatedData] = useState<any>(null);
  const [existingDocId, setExistingDocId] = useState<string | null>(null);
  const [existingIncomeSources, setExistingIncomeSources] = useState<any[]>([]);

  const { data: existingDataResponse, isLoading: isLoadingExisting } = useGetIncomeCalculationsByScenarioId(scenarioId || "");
  const createMutation = useCreateIncomeCalculation();
  const updateMutation = useUpdateIncomeCalculation();

  useEffect(() => {
    if (open && existingDataResponse?.data && borrowerName) {
      // Find calculation for this borrower
      const existingDoc = existingDataResponse.data.find((doc: any) => doc.borrowerName === borrowerName);
      if (existingDoc) {
        setExistingDocId(existingDoc.id);
        setEmployerInfo({
          employer: existingDoc.employer,
          employmentType: existingDoc.employmentType,
          startDate: existingDoc.startDate,
          ytdPeriodEnding: existingDoc.ytdPeriodEnding,
        });

        if (existingDoc.incomeSources && existingDoc.incomeSources.length > 0) {
          setExistingIncomeSources(existingDoc.incomeSources);
        } else {
          setExistingIncomeSources([]);
        }
        setStep(2);
      } else {
        // Reset if no existing doc found for this borrower
        setExistingDocId(null);
        setEmployerInfo(null);
        setSelectedIncomeType(null);
        setCalculatedData(null);
        setExistingIncomeSources([]);
        setStep(1);
      }
    }
  }, [open, existingDataResponse, borrowerName]);

  const handleClose = () => {
    setStep(1);
    setEmployerInfo(null);
    setSelectedIncomeType(null);
    setCalculatedData(null);
    setExistingDocId(null);
    setExistingIncomeSources([]);
    onClose();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleEmployerInfoSubmit = async (data: any) => {
    setEmployerInfo(data);

    const getIncomeSourceKey = (type: IncomeType) => {
      switch (type) {
        case IncomeType.Salary: return "salary";
        case IncomeType.Hourly: return "hourly";
        case IncomeType.OvertimeBonus: return "overtimeBonus";
        case IncomeType.Commission: return "commission";
        case IncomeType.ScheduleC: return "scheduleC";
        case IncomeType.BankStatement: return "bankStatement";
        case IncomeType.Other: return "other";
        default: return "other";
      }
    };

    let totalIncome = 0;
    existingIncomeSources.forEach(source => {
      const sourceKey = getIncomeSourceKey(source.incomeType);
      if (source[sourceKey] && source[sourceKey].monthlyIncomeFromSource) {
        totalIncome += source[sourceKey].monthlyIncomeFromSource;
      }
    });

    const payload: IncomeCalculationDocument = {
      id: existingDocId || undefined,
      preApprovalId: preApprovalId || "00000000-0000-0000-0000-000000000000",
      scenarioId: scenarioId || "00000000-0000-0000-0000-000000000000",
      borrowerName: borrowerName || "Borrower",
      employer: data.employer || "Unknown",
      employmentType: data.employmentType || 1,
      startDate: data.startDate || new Date().toISOString(),
      ytdPeriodEnding: data.ytdPeriodEnding || new Date().toISOString(),
      incomeSources: existingIncomeSources,
      totalMonthlyIncomeFromSources: totalIncome
    };

    try {
      if (existingDocId) {
        await updateMutation.mutateAsync({ id: existingDocId, data: payload });
      } else {
        const response: any = await createMutation.mutateAsync(payload);
        if (response && response.data && response.data.id) {
          setExistingDocId(response.data.id);
        } else if (response && response.id) {
          setExistingDocId(response.id);
        }
      }
    } catch (error) {
      console.error("Error saving employer info:", error);
    }

    setStep(2);
  };

  const handleDeleteIncomeSource = async (type: IncomeType) => {
    if (!existingDocId) return;

    const getIncomeSourceKey = (t: IncomeType) => {
      switch (t) {
        case IncomeType.Salary: return "salary";
        case IncomeType.Hourly: return "hourly";
        case IncomeType.OvertimeBonus: return "overtimeBonus";
        case IncomeType.Commission: return "commission";
        case IncomeType.ScheduleC: return "scheduleC";
        case IncomeType.BankStatement: return "bankStatement";
        case IncomeType.Other: return "other";
        default: return "other";
      }
    };

    const updatedIncomeSources = existingIncomeSources.filter(s => s.incomeType !== type);

    let totalIncome = 0;
    updatedIncomeSources.forEach(source => {
      const sourceKey = getIncomeSourceKey(source.incomeType);
      if (source[sourceKey] && source[sourceKey].monthlyIncomeFromSource) {
        totalIncome += source[sourceKey].monthlyIncomeFromSource;
      }
    });

    const payload: IncomeCalculationDocument = {
      id: existingDocId,
      preApprovalId: preApprovalId || "00000000-0000-0000-0000-000000000000",
      scenarioId: scenarioId || "00000000-0000-0000-0000-000000000000",
      borrowerName: borrowerName || "Borrower",
      employer: employerInfo?.employer || "Unknown",
      employmentType: employerInfo?.employmentType || 1,
      startDate: employerInfo?.startDate || new Date().toISOString(),
      ytdPeriodEnding: employerInfo?.ytdPeriodEnding || new Date().toISOString(),
      incomeSources: updatedIncomeSources,
      totalMonthlyIncomeFromSources: totalIncome
    };

    try {
      await updateMutation.mutateAsync({ id: existingDocId, data: payload });
      setExistingIncomeSources(updatedIncomeSources);
      if (onIncomeCalculated) {
        onIncomeCalculated(totalIncome);
      }
    } catch (error) {
      console.error("Error deleting income source:", error);
    }
  };

  const handleSelectIncomeType = (type: IncomeType) => {
    setSelectedIncomeType(type);

    // Find if we already have data for this type
    const existingSource = existingIncomeSources.find(s => s.incomeType === type);
    if (existingSource) {
      const getIncomeSourceKey = (t: IncomeType) => {
        switch (t) {
          case IncomeType.Salary: return "salary";
          case IncomeType.Hourly: return "hourly";
          case IncomeType.OvertimeBonus: return "overtimeBonus";
          case IncomeType.Commission: return "commission";
          case IncomeType.ScheduleC: return "scheduleC";
          case IncomeType.BankStatement: return "bankStatement";
          case IncomeType.Other: return "other";
          default: return "other";
        }
      };

      const sourceDetails = existingSource[getIncomeSourceKey(type)];
      if (sourceDetails) {
        if (type === IncomeType.BankStatement) {
          setCalculatedData({
            deposits: sourceDetails.deposits || Array(12).fill(0),
            expenseFactor: sourceDetails.expenseFactor || 0,
          });
        } else if (type === IncomeType.Other) {
          setCalculatedData({
            items: sourceDetails.items || [{ type: "", amount: 0, averagingMonths: 12 }]
          });
        } else {
          setCalculatedData(sourceDetails);
        }
      } else {
        setCalculatedData({});
      }
    } else {
      setCalculatedData({}); // Reset data when switching forms to prevent state bleeding
    }

    setStep(3);
  };

  const handleCalculate = async (data: any) => {
    setCalculatedData(data);
    // Schedule C form computes income inline — skip the selection step
    if (selectedIncomeType === IncomeType.ScheduleC && data.monthlyIncomeFromSource !== undefined) {
      await handleSave(data.monthlyIncomeFromSource, data);
    } else {
      setStep(4);
    }
  };

  const handleUseSuggestedIncome = (amount: number) => {
    // Only update the UI, don't save to backend
    if (onIncomeCalculated) {
      onIncomeCalculated(amount);
    }
    handleClose();
  };

  const handleSave = async (amount: number, overrideData?: any) => {
    const dataToUse = overrideData ?? calculatedData;
    let sourceData: any = { ...dataToUse, monthlyIncomeFromSource: amount };
    console.log("sourceData =>", sourceData);

    // Format specific arrays if needed
    if (selectedIncomeType === IncomeType.BankStatement) {
      sourceData = {
        deposits: dataToUse.deposits || Array(12).fill(0),
        expenseFactor: dataToUse.expenseFactor || 0,
        monthlyIncomeFromSource: amount
      };
    } else if (selectedIncomeType === IncomeType.Other) {
      sourceData = {
        items: dataToUse.items || [],
        monthlyIncomeFromSource: amount
      };
    }

    const getIncomeSourceKey = (type: IncomeType) => {
      switch (type) {
        case IncomeType.Salary: return "salary";
        case IncomeType.Hourly: return "hourly";
        case IncomeType.OvertimeBonus: return "overtimeBonus";
        case IncomeType.Commission: return "commission";
        case IncomeType.ScheduleC: return "scheduleC";
        case IncomeType.BankStatement: return "bankStatement";
        case IncomeType.Other: return "other";
        default: return "other";
      }
    };

    // Build updated income sources array
    const updatedIncomeSources = [...existingIncomeSources];
    const newSource = {
      incomeType: selectedIncomeType as number,
      [getIncomeSourceKey(selectedIncomeType as IncomeType)]: sourceData
    };

    const existingIndex = updatedIncomeSources.findIndex(s => s.incomeType === selectedIncomeType);
    if (existingIndex >= 0) {
      updatedIncomeSources[existingIndex] = newSource;
    } else {
      updatedIncomeSources.push(newSource);
    }

    // Calculate total monthly income
    let totalIncome = 0;
    updatedIncomeSources.forEach(source => {
      const sourceKey = getIncomeSourceKey(source.incomeType);
      if (source[sourceKey] && source[sourceKey].monthlyIncomeFromSource) {
        totalIncome += source[sourceKey].monthlyIncomeFromSource;
      }
    });

    // Build the payload as per API guide
    const payload: IncomeCalculationDocument = {
      id: existingDocId || undefined,
      preApprovalId: preApprovalId || "00000000-0000-0000-0000-000000000000",
      scenarioId: scenarioId || "00000000-0000-0000-0000-000000000000",
      borrowerName: borrowerName || "Borrower",
      employer: employerInfo?.employer || "Unknown",
      employmentType: employerInfo?.employmentType || 1,
      startDate: employerInfo?.startDate || new Date().toISOString(),
      ytdPeriodEnding: employerInfo?.ytdPeriodEnding || new Date().toISOString(),
      incomeSources: updatedIncomeSources,
      totalMonthlyIncomeFromSources: totalIncome
    };

    try {
      if (existingDocId) {
        await updateMutation.mutateAsync({ id: existingDocId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      if (onIncomeCalculated) {
        onIncomeCalculated(totalIncome);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving income calculation:", error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Box sx={{ position: "relative" }}>
            {(createMutation.isPending || updateMutation.isPending) && (
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.7)", zIndex: 10 }}>
                <CircularProgress />
              </Box>
            )}
            <BorrowerInfoForm initialData={employerInfo} onNext={handleEmployerInfoSubmit} />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ position: "relative" }}>
            {(createMutation.isPending || updateMutation.isPending) && (
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.7)", zIndex: 10 }}>
                <CircularProgress />
              </Box>
            )}
            <ChooseIncomeType
              onSelect={handleSelectIncomeType}
              onEditEmployerInfo={() => setStep(1)}
              existingIncomeSources={existingIncomeSources}
              onDelete={handleDeleteIncomeSource}
            />
          </Box>
        );
      case 3:
        return selectedIncomeType ? (
          <IncomeDetailsForm
            incomeType={selectedIncomeType}
            initialData={calculatedData}
            employerInfo={employerInfo}
            onCalculate={handleCalculate}
          />
        ) : null;
      case 4:
        return (
          <Box sx={{ position: "relative" }}>
            {(createMutation.isPending || updateMutation.isPending) && (
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.7)", zIndex: 10 }}>
                <CircularProgress />
              </Box>
            )}
            <IncomeCalculations
              incomeType={selectedIncomeType!}
              calculatedData={calculatedData}
              employerInfo={employerInfo}
              onUseSuggestedIncome={handleUseSuggestedIncome}
              onSave={handleSave}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (step === 1) return "Borrower Information";
    if (step === 2) return "Add Income Source";
    if (step === 3 || step === 4) {
      switch (selectedIncomeType) {
        case IncomeType.Salary: return "Salary Income";
        case IncomeType.Hourly: return "Hourly Income";
        case IncomeType.OvertimeBonus: return "Overtime / Bonus Income";
        case IncomeType.Commission: return "Commission Income";
        case IncomeType.ScheduleC: return "Schedule C Income";
        case IncomeType.BankStatement: return "Non-Taxable Income";
        case IncomeType.Other: return "Other / Deductions";
        default: return "Income Details";
      }
    }
    return "Income Calculator";
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
        <Box display="flex" alignItems="center">
          {step > 1 && (
            <IconButton onClick={handleBack} sx={{ mr: 1 }} edge="start" disabled={createMutation.isPending}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box sx={{ fontWeight: 600, fontSize: 18 }}>{getTitle()}</Box>
        </Box>
        <IconButton onClick={handleClose} edge="end" disabled={createMutation.isPending}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3, position: "relative" }}>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

