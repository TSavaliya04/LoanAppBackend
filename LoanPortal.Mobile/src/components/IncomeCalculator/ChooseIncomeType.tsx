import React, { useMemo, useState } from "react";
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { IncomeType } from "@/api/models/IncomeCalculation";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface Props {
  onSelect: (type: IncomeType) => void;
  onEditEmployerInfo?: () => void;
  existingIncomeSources?: any[];
  onDelete?: (type: IncomeType) => void;
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

export default function ChooseIncomeType({ onSelect, onEditEmployerInfo, existingIncomeSources = [], onDelete }: Props) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<{ type: IncomeType, title: string } | null>(null);

  const incomeTypes = [
    {
      type: IncomeType.Salary,
      title: "Salary",
      desc: "Regular base salary",
      icon: <WorkOutlineIcon sx={{ color: "#7A5AF8" }} />,
      bgColor: "#F4F3FF",
    },
    {
      type: IncomeType.Hourly,
      title: "Hourly",
      desc: "Hourly wage / rate",
      icon: <AccessTimeIcon sx={{ color: "#7A5AF8" }} />,
      bgColor: "#F4F3FF",
    },
    {
      type: IncomeType.OvertimeBonus,
      title: "Overtime / Bonus",
      desc: "Overtime, bonuses, incentives",
      icon: <EmojiEventsIcon sx={{ color: "#FF7A00" }} />,
      bgColor: "#FFF4ED",
    },
    {
      type: IncomeType.Commission,
      title: "Commission",
      desc: "Commission income",
      icon: <MonetizationOnIcon sx={{ color: "#12B76A" }} />,
      bgColor: "#ECFDF3",
    },
    {
      type: IncomeType.ScheduleC,
      title: "Schedule C",
      desc: "Self-employment income",
      icon: <DescriptionIcon sx={{ color: "#2E90FA" }} />,
      bgColor: "#EFF8FF",
    },
    {
      type: IncomeType.BankStatement,
      title: "Bank Statement",
      desc: "12-month deposit calculation",
      icon: <AccountBalanceIcon sx={{ color: "#06AED4" }} />,
      bgColor: "#ECFDFF",
    },
    // {
    //   type: IncomeType.Other,
    //   title: "Other / Deductions",
    //   desc: "Other income or deductions",
    //   icon: <MoreHorizIcon sx={{ color: "#667085" }} />,
    //   bgColor: "#F2F4F7",
    // },
  ];

  const totalMonthlyIncome = useMemo(() => {
    let total = 0;
    existingIncomeSources.forEach(source => {
      const key = getIncomeSourceKey(source.incomeType);
      if (source[key] && source[key].monthlyIncomeFromSource) {
        total += source[key].monthlyIncomeFromSource;
      }
    });
    return total;
  }, [existingIncomeSources]);

  const getSourceValue = (type: IncomeType) => {
    const source = existingIncomeSources.find(s => s.incomeType === type);
    if (!source) return null;
    const key = getIncomeSourceKey(type);
    if (source[key] && source[key].monthlyIncomeFromSource !== undefined) {
      return source[key].monthlyIncomeFromSource;
    }
    return null;
  };

  const handleDeleteClick = (e: React.MouseEvent, type: IncomeType, title: string) => {
    e.stopPropagation();
    setIncomeToDelete({ type, title });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (incomeToDelete && onDelete) {
      onDelete(incomeToDelete.type);
    }
    setDeleteConfirmOpen(false);
    setIncomeToDelete(null);
  };

  const handleCloseDelete = () => {
    setDeleteConfirmOpen(false);
    setIncomeToDelete(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          Select income type
        </Typography>
        {onEditEmployerInfo && (
          <Button variant="text" size="small" onClick={onEditEmployerInfo}>
            Edit Employer Info
          </Button>
        )}
      </Box>
      <Box display="flex" justifyContent="flex-end" px={2} mb={1}>
        <Box display="flex" width="230px" justifyContent="space-between">
          <Typography fontSize={12} color="#667085" fontWeight={500}>Selected (Qualifying)</Typography>
          <Typography fontSize={12} color="#667085" fontWeight={500}>Monthly Income</Typography>
        </Box>
      </Box>
      <List sx={{ p: 0 }}>
        {incomeTypes.map((item) => {
          const value = getSourceValue(item.type);
          const hasValue = value !== null;

          return (
            <Paper
              key={item.type}
              variant="outlined"
              sx={{
                mb: 1.5,
                borderRadius: 2,
                borderColor: "#E4E7EC",
                "&:hover": {
                  borderColor: "#7A5AF8",
                  boxShadow: "0px 0px 0px 4px #F4F3FF",
                },
              }}
            >
              <ListItem disablePadding>
                <ListItemButton onClick={() => onSelect(item.type)} sx={{ borderRadius: 2, p: 2 }}>
                  <ListItemIcon sx={{ minWidth: 56 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: item.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography fontWeight={600} fontSize={14} color="#101828">
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography fontSize={12} color="#667085">
                        {item.desc}
                      </Typography>
                    }
                  />
                  <Box display="flex" alignItems="center" width="230px" justifyContent="space-between" ml={2}>
                    <Box display="flex" justifyContent="center" width="100px">
                      {hasValue ? (
                        <CheckCircleIcon sx={{ color: "#12B76A", fontSize: 20 }} />
                      ) : (
                        <Typography color="#98A2B3" fontWeight={600}>—</Typography>
                      )}
                    </Box>
                    <Box display="flex" justifyContent="flex-end" alignItems="center" width="120px">
                      {hasValue ? (
                        <>
                          <Typography fontWeight={600} fontSize={14} color="#101828" mr={1}>
                            ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => handleDeleteClick(e, item.type, item.title)}
                            sx={{ p: 0.5 }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <Typography fontWeight={600} fontSize={14} color="#101828" mr={4}>
                          $0.00
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </ListItemButton>
              </ListItem>
            </Paper>
          );
        })}
      </List>

      <Box
        mt={3}
        p={2}
        sx={{
          backgroundColor: "#F4F3FF",
          borderRadius: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Typography fontWeight={600} color="#101828">
          Total Monthly Qualifying Income
        </Typography>
        <Typography fontWeight={700} fontSize={18} color="#7A5AF8">
          ${totalMonthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
      </Box>

      <Typography fontSize={12} color="#667085" mt={2} textAlign="center">
        Pick the type of income you want to calculate.
      </Typography>

      <Dialog open={deleteConfirmOpen} onClose={handleCloseDelete}>
        <DialogTitle>Delete Income Source</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove the {incomeToDelete?.title} income source?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

