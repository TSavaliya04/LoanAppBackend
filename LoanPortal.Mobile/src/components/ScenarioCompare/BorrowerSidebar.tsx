import React, { useState } from "react";
import { Drawer, Box, Typography, IconButton, Button, TextField, Grid, MenuItem, FormGroup, FormControlLabel, InputAdornment, Checkbox } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { Delete, EditOutlined } from "@mui/icons-material";
import { NumericFormat } from "react-number-format";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CombinedPreApprovalFormData } from "@/api/models/combinedPreApprovalSchema";

const getDebtLabel = (type: string | undefined) => {
  switch (type) {
    case "1": return "Mortgage Payment";
    case "2": return "Car Payment";
    case "3": return "Credit Card";
    case "4": return "Installment";
    default: return "Other";
  }
};

type BorrowerSidebarProps = {
  open: boolean;
  onClose: () => void;
  activeScenarioIndex: number;
  onFieldChange: (index: number) => void;
  onSave?: () => void;
};

export function BorrowerSidebar({ open, onClose, activeScenarioIndex, onFieldChange, onSave }: BorrowerSidebarProps) {
  const { control, setValue } = useFormContext<CombinedPreApprovalFormData>();
  const formValues = useWatch({ control });
  const [editingDebt, setEditingDebt] = useState<{ b: number, d: number } | null>(null);

  const handleIncomeFieldChange = () => {
    const scenarios = formValues?.scenarios || [];
    scenarios.forEach((_, i) => {
      onFieldChange(i);
    });
  };

  const handleDeleteDebt = (b: number, d: number) => {
    const currentDebts = [...(borrowersList[b].debts || [])];
    currentDebts.splice(d, 1);
    setValue(`scenarios.0.borrowersIncomeData.borrowerIncome.${b}.debts` as any, currentDebts as any);
    handleIncomeFieldChange();
    if (editingDebt?.b === b && editingDebt?.d === d) {
      setEditingDebt(null);
    }
  };

  const scenarioData = formValues?.scenarios?.[0];

  if (!scenarioData) return null;

  const borrowersList = scenarioData.borrowersIncomeData?.borrowerIncome || [];
  const occupancyStatus = scenarioData.purchaseInfo?.occupancyStatus;
  const propertyIncomeOffset = (scenarioData.propertyIncomeOffset || {}) as {
    monthlyGrossRentalIncome?: number;
    rentalPercentage?: number;
    subjectPropertyPITIA?: number;
    qualifyingRentalIncome?: number;
    netMonthlyImpactToDTI?: number;
  };

  // Calculate totals
  let totalMonthlyDebt = 0;
  let totalBalances = 0;

  borrowersList.forEach(b => {
    (b.debts || []).forEach(d => {
      totalMonthlyDebt += Number(d.monthlyPayment) || 0;
      totalBalances += Number(d.balance) || 0;
    });
  });

  if (occupancyStatus === "3") {
    totalMonthlyDebt += Number(Math.abs(Number(propertyIncomeOffset.netMonthlyImpactToDTI))) || 0;
  }

  const currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 480 },
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          borderTopLeftRadius: "24px",
          borderBottomLeftRadius: "24px",
          backgroundColor: "#F9F9FB"
        }
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 1 }}>
            Editing: Borrower Income Data
          </Typography>
          <Typography sx={{ color: "#74689c", fontSize: "0.9rem" }}>
            Update borrower income and liabilities to refresh scenario calculations in real time.
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ border: "1px solid #EAEAEA", borderRadius: "12px" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{
        display: "flex",
        border: "1px solid #EAEAEA",
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: "#FFFFFF"
      }}>
        <Box sx={{ flex: 1, p: 2, borderRight: "1px solid #EAEAEA" }}>
          <Typography sx={{ color: "#74689c", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
            Total Monthly Debt
          </Typography>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 800 }}>
            {currencyFormat.format(totalMonthlyDebt)}/mo
          </Typography>
        </Box>
        <Box sx={{ flex: 1, p: 2 }}>
          <Typography sx={{ color: "#74689c", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
            Total Balances
          </Typography>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 800 }}>
            {currencyFormat.format(totalBalances)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {borrowersList.map((borrowerItem, bIndex) => (
          <Box key={bIndex} sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Box sx={{ borderRadius: "16px", backgroundColor: "#fff", p: 3, border: "1px solid #EAEAEA", display: "flex", flexDirection: "column", gap: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#5620d2" }}>
                  Borrower {bIndex + 1}
                </Typography>
                <IconButton
                  sx={{ color: "#FF4D4F" }}
                  size="small"
                  onClick={() => {
                    const current = [...borrowersList];
                    current.splice(bIndex, 1);
                    setValue(`scenarios.0.borrowersIncomeData.borrowerIncome` as any, current as any);
                    handleIncomeFieldChange();
                  }}
                >
                  <Delete />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Borrower Name *"
                    value={borrowerItem.borrowerName || ""}
                    onChange={(e) => {
                      setValue(`scenarios.0.borrowersIncomeData.borrowerIncome.${bIndex}.borrowerName`, e.target.value);
                      handleIncomeFieldChange();
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="FICO Score"
                    inputMode="numeric"
                    value={borrowerItem.ficoScore || ""}
                    onChange={(e) => {
                      setValue(`scenarios.0.borrowersIncomeData.borrowerIncome.${bIndex}.ficoScore`, e.target.value);
                      handleIncomeFieldChange();
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <NumericFormat
                    customInput={TextField}
                    fullWidth
                    label="Monthly Income"
                    value={borrowerItem.monthlyIncome || 0}
                    onValueChange={(values) => {
                      setValue(`scenarios.0.borrowersIncomeData.borrowerIncome.${bIndex}.monthlyIncome`, values.floatValue || 0);
                      handleIncomeFieldChange();
                    }}
                    thousandSeparator=","
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ borderRadius: "16px", backgroundColor: "#fff", p: 3, border: "1px solid #EAEAEA", display: occupancyStatus === "3" ? "flex" : "none", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
                Investment Property Snapshot
              </Typography>
              <Box sx={{ borderRadius: "16px", backgroundColor: "#fff", p: 2, border: "1px solid #EAEAEA", display: "flex", flexDirection: "column", gap: 2 }}>

                {/* Subject Property PITIA */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 1.5, borderBottom: "1px solid #F0F0F0" }}>
                  <Typography sx={{ fontSize: "0.875rem", color: "#4A4A4A" }}>Subject Property PITIA</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A1A1A" }}>
                    {currencyFormat.format(propertyIncomeOffset.subjectPropertyPITIA || 0)}/mo
                  </Typography>
                </Box>

                {/* Gross Rental Income */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 1.5, borderBottom: "1px solid #F0F0F0" }}>
                  <Typography sx={{ fontSize: "0.875rem", color: "#4A4A4A" }}>Gross Rental Income</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A1A1A" }}>
                    {currencyFormat.format(propertyIncomeOffset.monthlyGrossRentalIncome || 0)}/mo
                  </Typography>
                </Box>

                {/* Qualifying Rent (75%) */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 1.5, borderBottom: "1px solid #F0F0F0" }}>
                  <Typography sx={{ fontSize: "0.875rem", color: "#4A4A4A" }}>Qualifying Rent ({propertyIncomeOffset.rentalPercentage}%)</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#E53935" }}>
                    -{currencyFormat.format((propertyIncomeOffset.qualifyingRentalIncome || 0))}/mo
                  </Typography>
                </Box>

                {/* Net Impact to DTI */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: "10px",
                  backgroundColor: "#F3EEFF"
                }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#5620d2" }}>Net Impact to DTI</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#5620d2" }}>
                    + {currencyFormat.format((propertyIncomeOffset.subjectPropertyPITIA || 0) - (propertyIncomeOffset.qualifyingRentalIncome || 0))}/mo
                  </Typography>
                </Box>

                {/* Formula explanation */}
                <Typography sx={{ fontSize: "0.75rem", color: "#74689c", mt: 0.5 }}>
                  {currencyFormat.format(propertyIncomeOffset.subjectPropertyPITIA || 0)} PITIA – {currencyFormat.format((propertyIncomeOffset.qualifyingRentalIncome || 0))} qualifying rent = +{currencyFormat.format((propertyIncomeOffset.subjectPropertyPITIA || 0) - (propertyIncomeOffset.qualifyingRentalIncome || 0))} added to DTI
                </Typography>
              </Box>
            </Box>

            <Box sx={{ borderRadius: "16px", backgroundColor: "#fff", p: 3, border: "1px solid #EAEAEA" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
                  Debt Breakdown
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const currentDebts = [...(borrowerItem.debts || [])] as any[];
                    currentDebts.push({ debtType: "3", balance: 0, monthlyPayment: 0 });
                    setValue(`scenarios.0.borrowersIncomeData.borrowerIncome.${bIndex}.debts` as any, currentDebts);
                    handleIncomeFieldChange();
                    setEditingDebt({ b: bIndex, d: currentDebts.length - 1 });
                  }}
                  sx={{ textTransform: "none", fontWeight: 600, color: "#5620d2" }}
                >
                  Add Debt
                </Button>
              </Box>

              <Grid container spacing={2} alignItems="center" sx={{ borderBottom: '1px solid #F0F0F0', pb: 1, mb: 1 }}>
                <Grid size={{ xs: 4 }}><Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#74689c', textTransform: 'uppercase' }}>Creditor</Typography></Grid>
                <Grid size={{ xs: 3 }}><Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#74689c', textTransform: 'uppercase' }}>Payment</Typography></Grid>
                <Grid size={{ xs: 3 }}><Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#74689c', textTransform: 'uppercase' }}>Balance</Typography></Grid>
                <Grid size={{ xs: 2 }}></Grid>
              </Grid>

              {(borrowerItem.debts || []).map((debt, dIndex) => {
                const isEditing = editingDebt?.b === bIndex && editingDebt?.d === dIndex;

                if (isEditing) {
                  return (
                    <Box key={dIndex} sx={{ mb: 2, p: 2, borderRadius: "12px", border: "1px solid #EAEAEA", backgroundColor: "#FAFAFA" }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#5620d2" }}>
                          Edit Debt
                        </Typography>
                        <Button size="small" onClick={() => setEditingDebt(null)}>Done</Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            select
                            fullWidth
                            label="Debt Type *"
                            value={debt.debtType || "5"}
                            onChange={(e) => {
                              setValue(`scenarios.0.borrowersIncomeData.borrowerIncome.${bIndex}.debts.${dIndex}.debtType`, e.target.value);
                              handleIncomeFieldChange();
                            }}
                          >
                            <MenuItem value="1">Mortgage Payment</MenuItem>
                            <MenuItem value="2">Car Payment</MenuItem>
                            <MenuItem value="3">Credit Card</MenuItem>
                            <MenuItem value="4">Installment</MenuItem>
                            <MenuItem value="5">Other</MenuItem>
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <NumericFormat
                            customInput={TextField}
                            fullWidth
                            label="Balance"
                            value={debt.balance || 0}
                            onValueChange={(values) => {
                              setValue(`scenarios.0.borrowersIncomeData.borrowerIncome.${bIndex}.debts.${dIndex}.balance`, values.floatValue || 0);
                              handleIncomeFieldChange();
                            }}
                            thousandSeparator=","
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <NumericFormat
                            customInput={TextField}
                            fullWidth
                            label="Monthly Payment"
                            value={debt.monthlyPayment || 0}
                            onValueChange={(values) => {
                              setValue(`scenarios.0.borrowersIncomeData.borrowerIncome.${bIndex}.debts.${dIndex}.monthlyPayment`, values.floatValue || 0);
                              handleIncomeFieldChange();
                            }}
                            thousandSeparator=","
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  );
                }

                return (
                  <Grid container spacing={2} alignItems="center" key={dIndex} sx={{ py: 1.5, borderBottom: '1px solid #F0F0F0' }}>
                    <Grid size={{ xs: 4 }}>
                      <Typography sx={{ fontWeight: 500, color: '#1A1A1A', fontSize: '0.875rem' }}>{getDebtLabel(debt.debtType)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Typography sx={{ fontWeight: 500, color: '#4A4A4A', fontSize: '0.875rem' }}>${debt.monthlyPayment}/mo</Typography>
                    </Grid>
                    <Grid size={{ xs: 3 }}>
                      <Typography sx={{ fontWeight: 500, color: '#4A4A4A', fontSize: '0.875rem' }}>${debt.balance}</Typography>
                    </Grid>
                    <Grid size={{ xs: 2 }} display="flex" alignItems="center" justifyContent="flex-end">
                      <Box display="flex" gap={0.5}>
                        <IconButton size="small" onClick={() => setEditingDebt({ b: bIndex, d: dIndex })}>
                          <EditOutlined sx={{ fontSize: 18, color: '#5620d2' }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteDebt(bIndex, dIndex)}>
                          <CloseIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                );
              })}


            </Box>
          </Box>
        ))}

        <Box textAlign="center">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              const currentList = [...borrowersList] as any[];
              currentList.push({ borrowerName: "", ficoScore: "", monthlyIncome: 0, debts: [{ debtType: "3", balance: 0, monthlyPayment: 0 }] });
              setValue(`scenarios.0.borrowersIncomeData.borrowerIncome` as any, currentList);
              handleIncomeFieldChange();
            }}
            sx={{ width: "100%", textTransform: "none", fontWeight: 600, borderRadius: 999 }}
          >
            ADD BORROWER
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: "12px", pt: 2, borderTop: "1px solid #EAEAEA" }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, padding: "10px", borderColor: "#EAEAEA", color: "#5620d2" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            if (onSave) onSave();
            onClose();
          }}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, padding: "10px", background: "linear-gradient(135deg, #7a3ff2, #945dff)", color: "white" }}
        >
          Done
        </Button>
      </Box>

    </Drawer>
  );
}
