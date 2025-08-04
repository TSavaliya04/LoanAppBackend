"use client";

import {
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import SVGs from "@/components/SVGs";
import BorrowerIncomeItem from "./BorrowerIncomeItem";
import { useEffect, useMemo } from "react";
import { usePreApprovalStore } from "@/store/usePreApprovalStore";

type BorrowersIncomeDataFormProps = {
  expanded: boolean;
  onToggle: () => void;
};

export default function BorrowersIncomeDataForm({
  expanded,
  onToggle,
}: BorrowersIncomeDataFormProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();
  // const setFrontEndRatio = usePreApprovalStore(
  //   (state) => state.setFrontEndRatio
  // );
  const setMonthlyIncome = usePreApprovalStore(
    (state) => state.setMonthlyIncome
  );
  const setBackEndRatio = usePreApprovalStore((state) => state.setBackEndRatio);

  const { fields, append } = useFieldArray({
    control,
    name: "borrowersIncomeData.borrowerIncome",
  });

  const borrowerIncome = useWatch({
    control,
    name: "borrowersIncomeData.borrowerIncome",
  });

  // const ratioFront = useMemo(() => {
  //   let totalIncome = 0;
  //   let totalPayment = 0;

  //   borrowerIncome?.forEach((borrower) => {
  //     totalIncome += Number(borrower.monthlyIncome) || 0;
  //     borrower?.debts?.forEach((debt) => {
  //       totalPayment += Number(debt.monthlyPayment) || 0;
  //     });
  //   });

  //   if (totalPayment === 0) return 0;

  //   return parseFloat((totalIncome / totalPayment).toFixed(2));
  // }, [borrowerIncome]);

  // useEffect(() => {
  //   setFrontEndRatio(ratioFront);
  // }, [ratioFront, setFrontEndRatio]);

  const calMonthlyIncome = useMemo(() => {
    let totalIncome = 0;

    borrowerIncome?.forEach((borrower) => {
      totalIncome += Number(borrower.monthlyIncome) || 0;
    });

    return totalIncome;
  }, [borrowerIncome]);

  useEffect(() => {
    setMonthlyIncome(calMonthlyIncome);
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

    if (totalIncome === 0) return 0;

    return parseFloat(((totalPayment / totalIncome) * 100).toFixed(2));
  }, [borrowerIncome]);

  useEffect(() => {
    setBackEndRatio(ratioBack);
  }, [ratioBack, setBackEndRatio]);

  return (
    <Box sx={{ borderRadius: 4 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        onClick={onToggle}
        sx={{ cursor: "pointer" }}
      >
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
                  backgroundColor: "#7444F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SVGs name="Borrowers_income_data_icon" />
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Borrower&apos;s Income Data
              </Typography>
            </Box>
            <IconButton size="small" sx={{ color: "black" }}>
              <SVGs name="Edit_icon" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box>
          {fields.map((field, index) => (
            <BorrowerIncomeItem
              key={field.id}
              index={index}
              control={control}
              errors={errors}
            />
          ))}

          <Box textAlign="center">
            <Button
              onClick={() =>
                append({
                  borrowerName: "",
                  employer: "",
                  monthlyIncome: 0,
                  debts: [],
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
