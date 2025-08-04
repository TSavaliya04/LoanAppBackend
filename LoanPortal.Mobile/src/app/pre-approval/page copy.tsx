'use client'
import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  // Chip,
  Typography,
  Container,
  AppBar,
  Toolbar,
  Grid,
  Paper,
  // Menu,
  MenuItem,
  // Stepper,
  // Step,
  // StepLabel,
  Divider,
  Button,
  Stack
} from '@mui/material';
import {
  // Search as SearchIcon,
  // FilterList as FilterIcon,
} from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useSessionStore } from '@/stores/SessionStore';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";

const loanPrograms = ['Non QM', 'Conventional', 'FHA'];
const propertyTypes = ['SFR', '2 Units', '3 Units', '4 Units', 'Condo/Townhome'];
const occupancyStatuses = ['Owner Occupied', '2nd Home', 'Investment'];

const steps = ['Borrower Info', 'Purchase Info', 'Lender Fees'];

export default function PreApproval() {
  // const router = useRouter();
  const [step, setStep] = useState(0);
    // const [formData, setFormData] = useState({});
  
    // interface FormData {
    //   [key: string]: string | number | undefined;
    // }

    // const handleChange = (field: string, value: string | number) => {
    //   setFormData({ ...formData, [field]: value });
    // };
  
    const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
    // const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <ProtectedRoute>
      <Box sx={{ bgcolor: 'secondary.main', minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{
          position: 'fixed',
          top: 0,
          bgcolor: 'white',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ px: 2, minHeight: 56 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link href="/dashboard" passHref>
              <IconButton size="small" sx={{ color: 'black' }}>
                <ArrowBackIcon fontSize="medium" />
              </IconButton>
            </Link>
            <Typography sx={{ fontWeight: 500, fontSize: '20px', color: 'black' }}>
              Create Pre-approval
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
        <Box maxWidth={420} mx="auto" bgcolor="#fbeac8" minHeight="100vh">

          {step > 0 && (
            <Stack direction="column" spacing={2} mb={2}>
              {[...Array(step).keys()].map((s) => (
                <Box 
                  key={s}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    border: '1px solid',
                    borderColor: '#888888',
                    borderRadius: 2,
                    padding: '8px 15px 8px 9px'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2, // equivalent to 16px
                        backgroundColor: '#1F9A00',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckIcon sx={{ color: '#fff' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '20px', color: 'black' }}>
                      {steps[s]}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: 'black' }} onClick={() => setStep(s)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                // <Chip
                //   key={s}
                //   label={steps[s]}
                //   color="success"
                //   icon={<EditIcon fontSize="small" />}
                //   onClick={() => setStep(s)}
                // />
              ))}
            </Stack>
          )}

          <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', borderRadius: '12px' }}>
            {step === 0 && (
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="primary">Borrower Info</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth size="small" label="Borrower's Name" /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth size="small" label="Co-Borrower's Name" /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="FICO Score" /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Co-Borrower's FICO Score" /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Borrower Cell Number" /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Co-Borrower Cell Number" /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth size="small" label="Borrower's Email" /></Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField select fullWidth size="small" label="Loan Program">
                    {loanPrograms.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField select fullWidth size="small" label="Property Type">
                    {propertyTypes.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField select fullWidth size="small" label="Occupancy Status">
                    {occupancyStatuses.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            )}

            {step === 1 && (
              <>
                <Typography variant="subtitle2" color="primary" mb={1}>Purchase Info</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Purchase Price" /></Grid>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Down Payment" /></Grid>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Loan Amount" /></Grid>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="1st Rate Loan" /></Grid>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="MI/Funding Fee" /></Grid>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Hazard Insurance" /></Grid>
                  <Grid size={{ xs: 6 }}><TextField fullWidth size="small" label="Association Fee" /></Grid>
                </Grid>
              </>
            )}

            {step === 2 && (
              <>
                <Typography variant="subtitle2" color="primary" mb={1}>Lender Fees</Typography>
                <TextField fullWidth size="small" label="Agent Name" sx={{ mb: 1.5 }} />
                {[
                  ['Loan Origination Fee', 0],
                  ['Discount Fee', 0],
                  ['Upfront MIP (1.75% of PP)', 0],
                  ['Appraisal Fee', 800],
                  ['Escrow Fees', 2600],
                  ['Title Fees', 2600],
                  ['3rd Party Lender Fee', 2900],
                ].map(([label, defaultValue]) => (
                  <TextField
                    key={label}
                    fullWidth
                    size="small"
                    label={label}
                    type="number"
                    defaultValue={defaultValue}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    sx={{ mb: 1.25 }}
                  />
                ))}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="error" align="right">
                  Non-Recurring Cost <strong>$1,354,045</strong>
                </Typography>
              </>
            )}

          </Paper>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, bgcolor: '#ff453b', borderRadius: 99, py: 1.25 }}
              onClick={() => {
                if (step === 2) alert('Submitted');
                else nextStep();
              }}
            >
              CONTINUE
            </Button>
        </Box>
      </Container>
    </Box>
    </ProtectedRoute>
  )
}
