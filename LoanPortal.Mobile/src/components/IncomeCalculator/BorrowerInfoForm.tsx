import React, { useState } from "react";
import { Box, Typography, TextField, Button, Grid, MenuItem } from "@mui/material";
import { EmploymentType } from "@/api/models/IncomeCalculation";

interface Props {
  initialData?: any;
  onNext: (data: any) => void;
}

export default function BorrowerInfoForm({ initialData, onNext }: Props) {
  const [formData, setFormData] = useState<any>({
    employer: "",
    employmentType: EmploymentType.FullTime,
    startDate: "",
    ytdPeriodEnding: "",
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        employer: initialData.employer || "",
        employmentType: initialData.employmentType || EmploymentType.FullTime,
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : "",
        ytdPeriodEnding: initialData.ytdPeriodEnding ? initialData.ytdPeriodEnding.split('T')[0] : "",
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        Employer Information
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Employer Name"
            value={formData.employer}
            onChange={(e) => handleChange("employer", e.target.value)}
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            fullWidth
            label="Employment Type"
            value={formData.employmentType}
            onChange={(e) => handleChange("employmentType", e.target.value)}
          >
            <MenuItem value={EmploymentType.FullTime}>Full-Time</MenuItem>
            <MenuItem value={EmploymentType.PartTime}>Part-Time</MenuItem>
            <MenuItem value={EmploymentType.Seasonal}>Seasonal</MenuItem>
            <MenuItem value={EmploymentType.Temporary}>Temporary</MenuItem>
            <MenuItem value={EmploymentType.Contract1099}>Contract (1099)</MenuItem>
            <MenuItem value={EmploymentType.SelfEmployed}>Self-Employed</MenuItem>
            <MenuItem value={EmploymentType.Retired}>Retired</MenuItem>
            <MenuItem value={EmploymentType.Other}>Other</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="YTD Period Ending"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.ytdPeriodEnding}
            onChange={(e) => handleChange("ytdPeriodEnding", e.target.value)}
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 4, backgroundColor: "#7A5AF8", "&:hover": { backgroundColor: "#6941C6" }, py: 1.5, borderRadius: 2 }}
        onClick={() => onNext(formData)}
      >
        Continue
      </Button>
    </Box>
  );
}

