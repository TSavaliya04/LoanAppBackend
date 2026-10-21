"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Typography,
  Container,
  AppBar,
  Toolbar,
  Grid,
  Paper,
  Menu,
  MenuItem,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Checklist as ChecklistIcon,
} from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BalanceIcon from "@mui/icons-material/Balance";
import ClearIcon from "@mui/icons-material/Clear";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { useSessionStore } from '@/stores/SessionStore';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useGetAllInEscrow, useGetAllTopOpportunities } from "@/api/reactQueriesHooks/useGetTopOpportunities";
import { set } from "zod";
import { useDeletePreApproval } from "@/api/reactQueriesHooks/usePreApproval";

type TopOpportunity = {
  preApprovalId: string;
  borrowerName: string;
  loanProgram: string;
  agentName: string;
  createdAt?: string;
  scenarios: any[];
};

export default function TopOpportunities() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetAllTopOpportunities(2);
  const { mutateAsync: submitDeletePreApproval } = useDeletePreApproval();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setISSelectEnable(params.get("compare") ? true : false);
  }, []);

  const [iSSelectEnable, setISSelectEnable] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSelectIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setISSelectEnable((prev) => !prev);
  };

  const handleFilterIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (option: string) => {
    setSelectedFilter(option);
    setAnchorEl(null);
  };

  const agents: TopOpportunity[] = data?.data ?? [];

  const filterOptions = ["Agent", "Loan Program"];

  const filteredAgents = agents.filter((agent) => {
    const borrowerName = agent.borrowerName?.toLowerCase() || "";
    const loanProgram = String(agent.loanProgram).toLowerCase();
    const agentName = agent.agentName?.toLowerCase() || "";

    return (
      borrowerName.includes(searchTerm.toLowerCase()) ||
      loanProgram.includes(searchTerm.toLowerCase()) ||
      agentName.includes(searchTerm.toLowerCase())
    );
  });

  const loanProgramNames = {
    "1": "Non QM",
    "2": "Conventional",
    "3": "FHA",
  };

  const [selectedComparisons, setSelectedComparisons] = useState<
    TopOpportunity[]
  >([]);

  const handleSelectForComparison = (item: TopOpportunity) => {
    setSelectedComparisons((prev) => {
      const alreadySelected = prev.some(
        (selected) => selected.preApprovalId === item.preApprovalId
      );

      if (alreadySelected) {
        // Unselect if already selected
        return prev.filter(
          (selected) => selected.preApprovalId !== item.preApprovalId
        );
      }

      // Limit to max 4 selections
      if (prev.length >= 4) return prev;

      return [...prev, item];
    });
  };

  // const handleCompare = () => {
  //   const ids = selectedComparisons.map((item) => item.preApprovalId).join(",");
  //   router.push(`/compare-pre-approvals?ids=${ids}`);
  // };

  const [menuanchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const menuopen = Boolean(menuanchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteMenuClick = () => {
    setMenuAnchorEl(null);
    setISSelectEnable((prev) => !prev);
  };

  const handleDeleteOpen = () => {
    setOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const ids = selectedComparisons.map((item) => item.preApprovalId);
    await submitDeletePreApproval(ids);
    refetch();
    setIsDeleting(false);
    setOpen(false);
    setSelectedComparisons([]);
  };

  function formatAmount(amount: number) {
    if (isNaN(amount)) return "0.00";
    return Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  return (
    <ProtectedRoute allow={["user"]}>
      <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
        {/* Header */}
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "white",
            boxShadow: "none",
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          <Toolbar sx={{ px: 2, minHeight: 56 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Link href="/dashboard" passHref>
                  <IconButton size="small" sx={{ color: "black" }}>
                    <ArrowBackIcon fontSize="medium" />
                  </IconButton>
                </Link>
                <Typography
                  sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
                >
                  {/* {iSSelectEnable ? "Compare" : "Pre-Approval Listing"} */}
                  Files in Escrow
                </Typography>
              </Box>
              <Box>
                <div>
                  <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-controls={menuopen ? "long-menu" : undefined}
                    aria-expanded={menuopen ? "true" : undefined}
                    aria-haspopup="true"
                    onClick={handleClick}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="long-menu"
                    anchorEl={menuanchorEl} // ✅ FIXED
                    open={menuopen}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          width: "12ch",
                          mt: 0.5, // small gap below the icon
                        },
                      },
                    }}
                  >
                    <MenuItem
                      selected={iSSelectEnable}
                      onClick={handleDeleteMenuClick}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </div>
              </Box>
              {/* <Box>
                <Button
                  variant="contained"
                  sx={{
                    width: "40px",
                    height: "40px",
                    padding: 0,
                    minWidth: "40px",
                  }}
                  color="primary"
                  onClick={() => setISSelectEnable((prev) => !prev)}
                >
                  {iSSelectEnable ? <ClearIcon /> : <BalanceIcon />}
                </Button>
              </Box> */}
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Box>
                <Box sx={{ display: "flex", gap: "15px", mb: 1.5 }}>
                  {/* Select Icon */}

                  {/* <IconButton
                    onClick={handleSelectIconClick}
                    sx={{
                      borderRadius: "8px",
                      border: "1px solid",
                      padding: "0px 12px",

                      borderColor: iSSelectEnable ? "#7444F5" : "text.primary",
                      backgroundColor: iSSelectEnable
                        ? "#7444F5"
                        : "transparent",

                      "& .select-icon": {
                        color: iSSelectEnable ? "#fff" : "primary.main",
                        transition: "color 0.3s",
                      },

                      "&:hover": {
                        backgroundColor: "#7444F5",
                        borderColor: "#7444F5",

                        "& .select-icon": {
                          color: "#fff",
                        },
                      },
                    }}
                  >
                    <ChecklistIcon className="select-icon" />
                  </IconButton> */}

                  {/* Search Input */}
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon sx={{ color: "#7444F5" }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: "12px",
                        bgcolor: "#fde9c9", // Matching the background color from the screenshot
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "black",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#7444F5",
                        },
                        "& .MuiInputBase-input": {
                          padding: "12px 15px",
                          color: "#666",
                        },
                      },
                    }}
                  />

                  {/* Filter Icon */}
                  <IconButton
                    onClick={handleFilterIconClick}
                    sx={{
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: "text.primary",
                      padding: "0px 12px",
                      "&:hover": {
                        backgroundColor: "#F44336",
                        borderColor: "#F44336",
                        "& .filter-icon": {
                          color: "#fff", // Change icon color on hover
                        },
                      },
                    }}
                  >
                    <FilterIcon
                      className="filter-icon"
                      sx={{ color: "primary.main", transition: "color 0.3s" }}
                    />
                  </IconButton>
                </Box>

                {/* Selected Filter Tag */}
                {selectedFilter && (
                  <Chip
                    label={selectedFilter}
                    onDelete={() => setSelectedFilter("")}
                    variant="outlined"
                    color="primary"
                    sx={{
                      mb: 2,
                      borderRadius: "8px",
                      fontWeight: 500,
                      bgcolor: "#fff",
                    }}
                  />
                )}

                {/* Styled Filter Dropdown */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleFilterClose}
                  PaperProps={{
                    sx: {
                      border: "1px solid #ccc",
                      borderRadius: 2,
                      mt: 1,
                      minWidth: 180,
                      boxShadow: "0px 4px 10px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography
                    px={2}
                    pt={1}
                    pb={1}
                    variant="subtitle2"
                    color="text.secondary"
                  >
                    Filter by
                  </Typography>
                  {filterOptions.map((option) => (
                    <MenuItem
                      key={option}
                      selected={selectedFilter === option}
                      onClick={() => handleFilterSelect(option)}
                      sx={{
                        fontWeight: selectedFilter === option ? 600 : 400,
                        // override default selected color with !important
                        backgroundColor:
                          selectedFilter === option
                            ? "#FFE4E2 !important"
                            : "transparent",
                        "&:hover": {
                          backgroundColor:
                            selectedFilter === option
                              ? "#ffcdd2 !important"
                              : "#f5f5f5",
                        },
                      }}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Menu>

                {/* Card List */}
                {isLoading ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    mt={6}
                  >
                    <Box
                      component="img"
                      src="/icons/icon-96x96.png"
                      alt="Loading Logo"
                      sx={{ width: "96px", height: "auto", mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Loading top opportunities...
                    </Typography>
                  </Box>
                ) : filteredAgents.length === 0 ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    mt={6}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      No records found
                    </Typography>
                  </Box>
                ) : (
                  filteredAgents.map((item, index) => {
                    const isSelected = selectedComparisons.some(
                      (selected) =>
                        selected.preApprovalId === item.preApprovalId
                    );

                    return (
                      <Paper
                        key={index}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          cursor: "pointer",
                          position: "relative",
                          border:
                            iSSelectEnable && isSelected
                              ? "2px solid #7444F5"
                              : "2px solid transparent",
                          backgroundColor:
                            iSSelectEnable && isSelected ? "#f3ecff" : "#fff",
                          transition: "all 0.3s ease",
                        }}
                        onClick={() => {
                          if (iSSelectEnable) {
                            handleSelectForComparison(item);
                          } else {
                            router.push(
                              `/pre-approval?preApprovalId=${item.preApprovalId}`
                            );
                          }
                        }}
                      >
                        {iSSelectEnable && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              readOnly
                              className="scale-125 cursor-pointer"
                            />
                          </Box>
                        )}

                        <Typography fontWeight={600}>
                          {item.borrowerName}
                        </Typography>

                        {item.createdAt && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              fontStyle: "italic",
                            }}
                          >
                            Created on:{" "}
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </Typography>
                        )}

                        {/* <Typography variant="body2" color="text.secondary">
                          Loan Program:{" "}
                          {
                            loanProgramNames[
                              item.loanProgram as "1" | "2" | "3"
                            ]
                          }
                        </Typography> */}

                        {/* <Box
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "#CCCCCC",
                            mb: 1,
                            mt: 1,
                          }}
                        />

                        <Typography fontWeight={600}>Agent</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.agentName}
                        </Typography> */}
                        {item.scenarios.map((scenarioitem, scenarioindex) => (
                          <Box
                            key={scenarioindex}
                            sx={{
                              border: "1px dashed",
                              borderColor: "#CCCCCC",
                              mt: 1,
                              borderRadius: 1,
                            }}
                          >
                            <Typography fontWeight={600} sx={{ p: 1, backgroundColor: "#fdf1ddff" }}>
                              Scenario {scenarioindex + 1}
                            </Typography>
                            <Grid container spacing={2} sx={{backgroundColor: "#faf8f6ff"}}>
                              <Grid size={5} p={1} sx={{borderRight: "1px solid", borderColor: "#CCCCCC"}}>
                                <Typography>
                                  {scenarioitem.annualInterestRate}%
                                  {/* {loanProgramNames[scenarioitem.loanProgram]} */}
                                </Typography>
                              </Grid>
                              <Grid size={7} p={1}>
                                <Typography>
                                  ${formatAmount(scenarioitem.monthlyTotal)}/mo
                                  {/* {loanProgramNames[scenarioitem.loanProgram]} */}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Typography p={1}>
                              {scenarioitem.loanProgram}{"   "}
                              ${formatAmount(scenarioitem.loanAmount)}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    );
                  })
                )}
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              position: "fixed",
              bottom: iSSelectEnable ? 0 : "-120px",
              left: 0,
              width: "100%",
              color: "white",
              textAlign: "center",
              transition: "bottom 0.4s ease",
              zIndex: 1300,
            }}
          >
            {/* <Button
              variant="contained"
              disabled={selectedComparisons.length < 2}
              onClick={() => handleCompare()}
              sx={{
                fontSize: "18px",
                width: "90%",
                mb: 1,
                maxWidth: "420px",
                mx: "auto",
                bgcolor: "#7444F5",
                color: "#f0f0f0",
                "&:hover": {
                  bgcolor: "#572cccff",
                },
                "&.Mui-disabled": {
                  bgcolor: "#bdbdbd", // solid gray background
                  color: "#ffffff", // white text
                  opacity: 1, // remove default transparency
                },
              }}
            >
              Compare
            </Button> */}
            <Button
              variant="contained"
              disabled={selectedComparisons.length < 1}
              onClick={() => handleDeleteOpen()}
              sx={{
                fontSize: "18px",
                width: "90%",
                mb: 3,
                maxWidth: "420px",
                mx: "auto",
                bgcolor: "#F44336",
                color: "#f0f0f0",
                "&:hover": {
                  bgcolor: "#d62417ff",
                },
                "&.Mui-disabled": {
                  bgcolor: "#bdbdbd", // solid gray background
                  color: "#ffffff", // white text
                  opacity: 1, // remove default transparency
                },
              }}
            >
              Delete
            </Button>
          </Box>
        </Container>
      </Box>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogContent sx={{ padding: 2, overflow: "hidden" }}>
          <Typography
            sx={{ fontWeight: 500, fontSize: "18px", color: "black" }}
          >
            Are you sure you want to delete this record(s)?
          </Typography>
        </DialogContent>
        <DialogActions>
          <DialogActions>
            <Button
              onClick={() => setOpen(false)}
              variant="contained"
              sx={{
                backgroundColor: "#E0E0E0",
                color: "#000",
                "&:hover": {
                  backgroundColor: "#D5D5D5",
                },
              }}
            >
              No
            </Button>

            <Button onClick={handleDelete} variant="contained" color="error">
              Yes, Delete
            </Button>
          </DialogActions>
        </DialogActions>
      </Dialog>
    </ProtectedRoute>
  );
}
