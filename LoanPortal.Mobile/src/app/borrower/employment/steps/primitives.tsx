"use client";
import React from "react";
import {
  Box,
  Typography,
  TextField,
  TextFieldProps,
  Button,
  Checkbox,
  CheckboxProps,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import { Controller, Path, useFormContext } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { SelectOption } from "@/api/models/BorrowerPortalDraftTypes";
import { EmploymentFormValues, formatMoneyInput, formatPhone, formatSsn, phoneDigits, ssnDigits } from "../formModel";

export type FieldName = Path<EmploymentFormValues>;

/* ─────────────────────────────────────────────────────────
   Shared primitives
   ───────────────────────────────────────────────────────── */
export const PRIMARY = "#2A4EE8";
export const STEP_COUNT = 10;

/** Thin progress bar at top */
export const ProgressBar = ({ step, total = STEP_COUNT }: { step: number; total?: number }) => (
  <Box sx={{ width: "100%", height: 4, bgcolor: "#E8EDF8", borderRadius: 2, mb: 0 }}>
    <Box
      sx={{
        height: "100%",
        borderRadius: 2,
        bgcolor: PRIMARY,
        width: `${(step / total) * 100}%`,
        transition: "width .4s ease",
      }}
    />
  </Box>
);

/** Back button row */
export const BackRow = ({ onBack }: { onBack: () => void }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
    <IconButton onClick={onBack} size="small" sx={{ color: "text.primary", p: 0 }}>
      <ArrowBackIcon sx={{ fontSize: 20 }} />
    </IconButton>
  </Box>
);

/** Step header (right-aligned counter) */
export const StepHeader = ({ title, counter }: { title: string; counter?: string }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
      {title}
    </Typography>
    {counter && (
      <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{counter}</Typography>
    )}
  </Box>
);

/** Required mark */
export const Req = () => <span style={{ color: "#FC3A27" }}> *</span>;

/** Raw MUI TextField bound to a form field (same props as TextField). */
export const BoundTextField = ({
  name,
  onValueChange,
  phone,
  ssn,
  money,
  ...props
}: {
  name: FieldName;
  onValueChange?: (value: string) => void;
  /** Show as (555) 555-5555 while typing; the form value stays digits only. */
  phone?: boolean;
  /** Show as 123-45-6789 while typing; the form value stays digits only. */
  ssn?: boolean;
  /** Amount input: digits, thousands separators and up to 2 decimals ("signed" also allows a leading "-"). */
  money?: "unsigned" | "signed";
} & Omit<TextFieldProps, "name">) => {
  const { control, clearErrors } = useFormContext<EmploymentFormValues>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          name={field.name}
          value={
            phone
              ? formatPhone(field.value as string | undefined)
              : ssn
              ? formatSsn(field.value as string | undefined)
              : (field.value as string | undefined) ?? ""
          }
          onChange={(e) => {
            clearErrors(name);
            const value = phone
              ? phoneDigits(e.target.value)
              : ssn
              ? ssnDigits(e.target.value)
              : money
              ? formatMoneyInput(e.target.value, money === "signed")
              : e.target.value;
            field.onChange(value);
            onValueChange?.(value);
          }}
          onBlur={field.onBlur}
          inputRef={field.ref}
        />
      )}
    />
  );
};

/** Raw MUI Checkbox bound to a boolean form field (same props as Checkbox). */
export const BoundCheckbox = ({ name, ...props }: { name: FieldName } & Omit<CheckboxProps, "name" | "checked">) => {
  const { control } = useFormContext<EmploymentFormValues>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          {...props}
          name={field.name}
          checked={!!field.value}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
          inputRef={field.ref}
        />
      )}
    />
  );
};

const DATE_FORMAT = "MM/DD/YYYY";

// The form stores dates as MM/DD/YYYY text; convert to/from Dayjs for the picker
const displayToDayjs = (value: string | undefined): Dayjs | null => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value ?? "");
  if (!m) return null;
  const d = dayjs(new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])));
  return d.isValid() ? d : null;
};

/** Date picker bound to a MM/DD/YYYY form field. Opens when clicking anywhere on the field. */
export const FDatePicker = ({
  label,
  name,
  disableFuture,
  openTo,
}: {
  label?: React.ReactNode;
  name: FieldName;
  disableFuture?: boolean;
  openTo?: "year" | "month" | "day";
}) => {
  const { control, clearErrors } = useFormContext<EmploymentFormValues>();
  const [open, setOpen] = React.useState(false);
  return (
    <Box sx={{ width: "100%" }}>
      {label && (
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }} component="div">
          {label}
        </Typography>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format={DATE_FORMAT}
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              value={displayToDayjs(field.value as string)}
              onChange={(v) => {
                clearErrors(name);
                field.onChange(v && v.isValid() ? v.format(DATE_FORMAT) : "");
              }}
              disableFuture={disableFuture}
              openTo={openTo}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                  onClick: () => setOpen(true),
                  onBlur: field.onBlur,
                  inputRef: field.ref,
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      backgroundColor: "#fff",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        )}
      />
    </Box>
  );
};

/** Outlined text input */
export const FInput = ({
  label,
  placeholder,
  name,
  endAdornment,
  multiline,
  rows,
  phone,
  ssn,
}: {
  label?: React.ReactNode;
  placeholder?: string;
  name?: FieldName;
  endAdornment?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  phone?: boolean;
  ssn?: boolean;
}) => {
  const fieldProps = {
    fullWidth: true,
    size: "small" as const,
    placeholder,
    multiline,
    rows,
    InputProps: { endAdornment },
    sx: {
      "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        fontSize: "0.9rem",
        backgroundColor: "#fff",
      },
    },
  };
  return (
    <Box sx={{ width: "100%" }}>
      {label && (
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }} component="div">
          {label}
        </Typography>
      )}
      {name ? <BoundTextField name={name} phone={phone} ssn={ssn} {...fieldProps} /> : <TextField {...fieldProps} />}
    </Box>
  );
};

/** Raw MUI Select bound to a form field, rendering the given options. */
export const BoundSelect = <T extends string | number>({
  name,
  options,
  sx,
  fullWidth,
}: {
  name: FieldName;
  options: readonly SelectOption<T>[];
  sx?: object;
  fullWidth?: boolean;
}) => {
  const { control, clearErrors } = useFormContext<EmploymentFormValues>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <Select
            fullWidth={fullWidth}
            size="small"
            error={!!fieldState.error}
            name={field.name}
            value={field.value ?? ""}
            onChange={(e) => {
              clearErrors(name);
              field.onChange(e);
            }}
            onBlur={field.onBlur}
            inputRef={field.ref}
            sx={sx}
          >
            {options.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
          {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
        </>
      )}
    />
  );
};

/** Select dropdown */
export const FSelect = <T extends string | number>({
  label,
  options,
  name,
}: {
  label?: React.ReactNode;
  options: readonly SelectOption<T>[];
  name: FieldName;
}) => (
  <Box sx={{ width: "100%" }}>
    {label && (
      <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }} component="div">
        {label}
      </Typography>
    )}
    <BoundSelect
      fullWidth
      name={name}
      options={options}
      sx={{ borderRadius: "8px", fontSize: "0.9rem", backgroundColor: "#fff" }}
    />
  </Box>
);

/** `$`-adorned amount input bound to a Money form field. */
export const MoneyField = ({
  name,
  sx,
  disabled,
  placeholder,
  fullWidth,
  onValueChange,
  allowNegative,
}: {
  name: FieldName;
  allowNegative?: boolean;
  sx?: TextFieldProps["sx"];
  disabled?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  onValueChange?: (value: string) => void;
}) => (
  <BoundTextField
    name={name}
    money={allowNegative ? "signed" : "unsigned"}
    inputProps={{ inputMode: allowNegative ? "text" : "decimal" }}
    onValueChange={onValueChange}
    size="small"
    fullWidth={fullWidth}
    placeholder={placeholder}
    disabled={disabled}
    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
    sx={sx}
  />
);

/** Primary CTA button */
export const PrimaryBtn = ({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <Button
    fullWidth
    variant="contained"
    onClick={onClick}
    disabled={disabled}
    sx={{
      borderRadius: "10px",
      py: 1.5,
      fontSize: "0.95rem",
      fontWeight: 700,
      textTransform: "none",
      bgcolor: PRIMARY,
      "&:hover": { bgcolor: "#1a3bc4" },
      boxShadow: "0 4px 14px rgba(42,78,232,.35)",
    }}
  >
    {children}
  </Button>
);

/** Ghost link-style button */
export const GhostBtn = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <Typography
    component="span"
    onClick={onClick}
    sx={{
      cursor: "pointer",
      fontSize: "0.88rem",
      fontWeight: 600,
      color: PRIMARY,
      textAlign: "center",
      display: "block",
      mt: 0.5,
      "&:hover": { textDecoration: "underline" },
    }}
  >
    {children}
  </Typography>
);

/** Inline info banner */
export const InfoBanner = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: "100%",
      bgcolor: "#EEF2FF",
      border: "1px solid #C7D2FE",
      borderRadius: "10px",
      p: "12px 14px",
      display: "flex",
      gap: 1,
    }}
  >
    <InfoOutlinedIcon sx={{ fontSize: 18, color: PRIMARY, mt: "1px", flexShrink: 0 }} />
    <Typography sx={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.6 }}>
      {children}
    </Typography>
  </Box>
);
