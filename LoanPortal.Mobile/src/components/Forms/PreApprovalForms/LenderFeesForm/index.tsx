"use client";

import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Collapse,
  InputAdornment,
} from "@mui/material";
import SVGs from "@/components/SVGs";
import { Controller, useFormContext } from "react-hook-form";
import { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";
import { useSessionStore } from "@/stores/SessionStore";
import { NumericFormat } from "react-number-format";

type LenderFeesFormProps = {
  expanded: boolean;
  onToggle: () => void;
};

export default function LenderFeesForm({
  expanded,
  onToggle,
}: LenderFeesFormProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CombinedPreApprovalFormData>();

  const { user } = useSessionStore();

  return (
    <Box
      sx={{
        borderRadius: 4,
        backgroundColor: expanded ? "#fff" : "transparent",
        padding: expanded ? "15px" : "0px",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        onClick={onToggle}
        sx={{ cursor: "pointer" }}
      >
        {expanded ? (
          <Typography fontWeight={600} color="primary">
            Lender Fees
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
                {/* <CheckIcon sx={{ color: "#fff" }} /> */}
                <SVGs name="Lender_fees_icon" />
              </Box>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Lender Fees
              </Typography>
            </Box>
            <IconButton size="small" sx={{ color: "black" }}>
              {/* <EditIcon fontSize="small" /> */}
              <SVGs name="Edit_icon" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Collapsible Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Grid container>
            {/* Agent Name Full Width */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="lenderFees.agentName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={user?.displayName}
                    fullWidth
                    label="Agent Name *"
                    error={!!errors.lenderFees?.agentName}
                    helperText={errors.lenderFees?.agentName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box>
                  <Typography fontWeight={600}>Loan Origination Fee</Typography>
                </Box>
                <Controller
                  name="lenderFees.loanOriginationFee"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.loanOriginationFee}
                      helperText={
                        errors.lenderFees?.loanOriginationFee?.message
                      }
                      sx={{
                        maxWidth: 160,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box>
                  <Typography fontWeight={600}>Discount Fee</Typography>
                </Box>
                <Controller
                  name="lenderFees.discountFee"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.discountFee}
                      helperText={errors.lenderFees?.discountFee?.message}
                      sx={{
                        maxWidth: 160,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box>
                  <Typography fontWeight={600}>Upfront MIP</Typography>
                  <Typography variant="caption" color="text.secondary">
                    (1.75% of PP)
                  </Typography>
                </Box>
                <Controller
                  name="lenderFees.upfrontMip"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.upfrontMip}
                      helperText={errors.lenderFees?.upfrontMip?.message}
                      sx={{
                        maxWidth: 160,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box>
                  <Typography fontWeight={600}>Appraisal Fee</Typography>
                </Box>
                <Controller
                  name="lenderFees.appraisalFee"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.appraisalFee}
                      helperText={errors.lenderFees?.appraisalFee?.message}
                      sx={{
                        maxWidth: 160,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box>
                  <Typography fontWeight={600}>Escrow Fees</Typography>
                </Box>
                <Controller
                  name="lenderFees.escrowFees"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.escrowFees}
                      helperText={errors.lenderFees?.escrowFees?.message}
                      sx={{
                        maxWidth: 160,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box>
                  <Typography fontWeight={600}>Title Fees</Typography>
                </Box>
                <Controller
                  name="lenderFees.titleFees"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.titleFees}
                      helperText={errors.lenderFees?.titleFees?.message}
                      sx={{
                        maxWidth: 160,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
            <Grid size={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  borderBottom: "1px solid #f0f0f0",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Box>
                  <Typography fontWeight={600}>3rd Party Lender Fee</Typography>
                </Box>
                <Controller
                  name="lenderFees.thirdPartyLenderFee"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={TextField}
                      fullWidth
                      value={field.value ?? ""}
                      placeholder="0"
                      onValueChange={(values) => {
                        field.onChange(
                          values.floatValue === undefined
                            ? undefined
                            : values.floatValue
                        );
                      }}
                      thousandSeparator=","
                      allowNegative={false}
                      error={!!errors.lenderFees?.thirdPartyLenderFee}
                      helperText={errors.lenderFees?.thirdPartyLenderFee?.message}
                      sx={{
                        maxWidth: 160,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f7f7f7",
                          "& fieldset": {
                            border: "none",
                          },
                          "& input::placeholder": {
                            color: "#9e9e9e",
                            opacity: 1,
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <span
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              $
                            </span>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
}
