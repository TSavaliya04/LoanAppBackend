"use client";

import {
  Box,
  // Button,
  Grid,
  // InputAdornment,
  MenuItem,
  TextField,
  // Typography,
} from "@mui/material";
import {
  Controller,
  // useFieldArray,
  Control,
  FieldErrors,
  // useWatch,
} from "react-hook-form";
import { ComparePreApprovalFormData } from "@/api/models/ComparePreApprovalSchema";
// import { NumericFormat } from "react-number-format";

type Props = {
  index: number;
  control: Control<ComparePreApprovalFormData>;
  errors: FieldErrors<ComparePreApprovalFormData>;
};

export default function BorrowerInfoItem({ index, control, errors }: Props) {
  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return "";

    const [, area, prefix, line] = match;
    if (area && !prefix) return `(${area}`;
    if (area && prefix && !line) return `(${area}) ${prefix}`;
    if (area && prefix && line) return `(${area}) ${prefix}-${line}`;
    return cleaned;
  };
  return (
    <Box sx={{display: "none"}}>
      <Grid container spacing={2}>
        <Grid
          size={{ xs: 12 }}
          sx={{
            borderRadius: 3,
            backgroundColor: "#fff",
            p: 2,
          }}
        >
          <Grid container spacing={2}>
            <Grid sx={{display: "none"}}>
              <Controller
                name={`borrowerInfo.Inputs.${index}.preApprovalId`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="preApprovalId *"
                    error={!!errors.borrowerInfo?.Inputs?.[index]?.preApprovalId}
                    helperText={
                      errors.borrowerInfo?.Inputs?.[index]?.preApprovalId
                        ?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                // name="borrowerInfo.borrowerName"
                name={`borrowerInfo.Inputs.${index}.borrowerName`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Borrower's Name *"
                    error={!!errors.borrowerInfo?.Inputs?.[index]?.borrowerName}
                    helperText={
                      errors.borrowerInfo?.Inputs?.[index]?.borrowerName
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name={`borrowerInfo.Inputs.${index}.coBorrowerName`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Co-Borrower's Name"
                    error={
                      !!errors.borrowerInfo?.Inputs?.[index]?.coBorrowerName
                    }
                    helperText={
                      errors.borrowerInfo?.Inputs?.[index]?.coBorrowerName
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name={`borrowerInfo.Inputs.${index}.ficoScore`}
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
                    label="FICO Score"
                    type="number"
                    inputMode="numeric"
                    error={!!errors.borrowerInfo?.Inputs?.[index]?.ficoScore}
                    helperText={
                      errors.borrowerInfo?.Inputs?.[index]?.ficoScore?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name={`borrowerInfo.Inputs.${index}.coBorrowerFicoScore`}
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
                    label="CoBorrower's FICO Score"
                    error={
                      !!errors.borrowerInfo?.Inputs?.[index]
                        ?.coBorrowerFicoScore
                    }
                    helperText={
                      errors.borrowerInfo?.Inputs?.[index]?.coBorrowerFicoScore
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name={`borrowerInfo.Inputs.${index}.borrowerCellNumber`}
                control={control}
                render={({ field }) => {
                  const rawValue = field.value || ""; // value in state: only digits
                  const formattedValue = formatPhoneNumber(rawValue); // display only

                  return (
                    <TextField
                      {...field}
                      fullWidth
                      label="Borrower Cell Number"
                      value={formattedValue}
                      onChange={(e) => {
                        const digitsOnly = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        field.onChange(digitsOnly); // store only digits
                      }}
                      type="tel"
                      inputMode="numeric"
                      error={
                        !!errors.borrowerInfo?.Inputs?.[index]
                          ?.borrowerCellNumber
                      }
                      helperText={
                        errors.borrowerInfo?.Inputs?.[index]?.borrowerCellNumber
                          ?.message
                      }
                      inputProps={{ maxLength: 14 }} // formatted version length
                    />
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name={`borrowerInfo.Inputs.${index}.coBorrowerCellNumber`}
                control={control}
                render={({ field }) => {
                  const rawValue = field.value || ""; // value in state: only digits
                  const formattedValue = formatPhoneNumber(rawValue); // display only

                  return (
                    <TextField
                      {...field}
                      fullWidth
                      label="CoBorrower Cell Number"
                      value={formattedValue}
                      onChange={(e) => {
                        const digitsOnly = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        field.onChange(digitsOnly); // store only digits
                      }}
                      type="tel"
                      inputMode="numeric"
                      error={
                        !!errors.borrowerInfo?.Inputs?.[index]
                          ?.coBorrowerCellNumber
                      }
                      helperText={
                        errors.borrowerInfo?.Inputs?.[index]
                          ?.coBorrowerCellNumber?.message
                      }
                      inputProps={{ maxLength: 14 }} // formatted version length
                    />
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name={`borrowerInfo.Inputs.${index}.borrowerEmail`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Borrower's Email"
                    error={
                      !!errors.borrowerInfo?.Inputs?.[index]?.borrowerEmail
                    }
                    helperText={
                      errors.borrowerInfo?.Inputs?.[index]?.borrowerEmail
                        ?.message
                    }
                  />
                )}
              />
            </Grid>

          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
