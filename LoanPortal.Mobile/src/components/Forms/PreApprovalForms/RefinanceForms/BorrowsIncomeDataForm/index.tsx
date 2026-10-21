"use client";

import { Box, Button, Collapse, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import SVGs from "@/components/SVGs";
import { useEffect, useMemo } from "react";
import { usePreApprovalIndexStore, usePreApprovalStore } from "@/store/usePreApprovalStore";
import { CombinedRefinancePreApprovalFormData } from "@/api/models/refinance/combinedPreApprovalSchema";
import BorrowerIncomeItem from "./BorrowerIncomeItem";
import RefinanceBorrowerIncomeItem from "./BorrowerIncomeItem";

type BorrowersIncomeDataFormProps = {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  isDisabled?: boolean;
  handleFieldChange: (index: number) => void;
};

export default function RefinanceBorrowersIncomeDataForm({
  index,
  expanded,
  onToggle,
  isCompleted,
  isDisabled,
  handleFieldChange,
}: BorrowersIncomeDataFormProps) {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CombinedRefinancePreApprovalFormData>();

  const handleIncomeFieldChange = () => {
    const scenarios = getValues("scenarios") || [];
    scenarios.forEach((_, i) => {
      handleFieldChange(i);
    });
  };

  // const setMonthlyIncome = usePreApprovalIndexStore(
  //   (state) => state.setMonthlyIncome
  // );
  // const setBackEndRatio = usePreApprovalIndexStore((state) => state.setBackEndRatio);

  const { fields, append } = useFieldArray({
    control,
    name: `scenarios.0.borrowersIncomeData.borrowerIncome`,
  });

  return (
    <Box sx={{ borderRadius: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        {expanded ? (
          <Typography display="none" fontWeight={600} color="primary">
            Borrower&apos;s Income Data
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
                  <SVGs name="Borrowers_income_data_icon" />
                ) : (
                  <SVGs name="Borrowers_income_data_icon" />
                )}
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Borrower&apos;s Income Data
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

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box>
          {fields.map((field, borrowerIncomeIndex) => (
            <RefinanceBorrowerIncomeItem
              key={field.id}
              index={0}
              borrowerIncomeIndex={borrowerIncomeIndex}
              control={control}
              errors={errors}
              handleFieldChange={handleIncomeFieldChange}
            />
          ))}

          <Box textAlign="center">
            <Button
              onClick={() =>
                append({
                  borrowerName: "",
                  ficoScore: "",
                  monthlyIncome: 0,
                  debts: [
                    {
                      debtType: "3",
                      debtToBePaidOff: false,
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
      </Collapse>
    </Box>
  );
}
