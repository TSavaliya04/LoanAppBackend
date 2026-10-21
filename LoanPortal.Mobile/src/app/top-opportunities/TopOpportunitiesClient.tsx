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
  BottomNavigationAction,
  BottomNavigation,
  Badge,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Checklist as ChecklistIcon,
  Home,
  Person,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BalanceIcon from "@mui/icons-material/Balance";
import ClearIcon from "@mui/icons-material/Clear";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
// import { useSessionStore } from '@/stores/SessionStore';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useGetAllContinueWorkingQuotes, useGetAllTopOpportunities } from "@/api/reactQueriesHooks/useGetTopOpportunities";
import { set } from "zod";
import { useDeletePreApproval } from "@/api/reactQueriesHooks/usePreApproval";
import { stat } from "fs";
import BottomNavbar from "@/components/Common/BottomNavbar";
import QuoteListItemCard from "@/components/Common/QuoteListItemCard";

type TopOpportunity = {
  preApprovalId: string;
  borrowerName: string;
  loanType: string;
  loanProgram: string;
  ownerName: string;
  updatedAt?: string;
  updatedBy?: string | null;
  totalScenarios: number;
};

export default function TopOpportunities() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(1);

  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  // fallback if status is missing
  const status = statusParam ? Number(statusParam) : null;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortByDirection, setSortByDirection] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetAllContinueWorkingQuotes({
    pageNumber: 1,
    pageSize: 100,
    searchText: searchTerm,
    sortBy: sortBy,
    sortByDirection: sortByDirection,
    // companyId: "",
    filterBy: "",
    status: status,
  });
  const { mutateAsync: submitDeletePreApproval } = useDeletePreApproval();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setISSelectEnable(params.get("compare") ? true : false);
  }, []);

  const [iSSelectEnable, setISSelectEnable] = useState(false);
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

  const agents: TopOpportunity[] = Array.isArray(data?.data?.items)
    ? data.data.items
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];

  const filterOptions = ["Loan Type", "Loan Program"];

  const filteredAgents = agents.filter((agent) => {
    const borrowerName = agent.borrowerName?.toLowerCase() || "";
    const loanProgram = String(agent.loanProgram).toLowerCase();
    const ownerName = agent.ownerName?.toLowerCase() || "";
    const loanType = agent.loanType?.toLowerCase() || "";

    return (
      borrowerName.includes(searchTerm.toLowerCase()) ||
      loanProgram.includes(searchTerm.toLowerCase()) ||
      ownerName.includes(searchTerm.toLowerCase()) ||
      loanType.includes(searchTerm.toLowerCase())
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
        (selected) => selected.preApprovalId === item.preApprovalId,
      );

      if (alreadySelected) {
        // Unselect if already selected
        return prev.filter(
          (selected) => selected.preApprovalId !== item.preApprovalId,
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
    null,
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
                  {status === 1
                    ? "Pre-Approved Listing"
                    : status === 2
                      ? "Files In Escrow"
                      : status === 3
                        ? "TBD Scenarios"
                        : status === 4
                          ? "Closed Escrow"
                          : "All Files"}
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
                {isLoading || isFetching ? (
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
                        selected.preApprovalId === item.preApprovalId,
                    );

                    return (
                      <QuoteListItemCard
                        key={item.preApprovalId ?? index}
                        preApprovalId={item.preApprovalId}
                        borrowerName={item.borrowerName}
                        loanType={item.loanType}
                        loanProgram={item.loanProgram}
                        totalScenarios={item.totalScenarios}
                        ownerName={item.ownerName}
                        updatedAt={item.updatedAt}
                        updatedBy={item.updatedBy ?? undefined}
                        isSelectMode={iSSelectEnable}
                        isSelected={isSelected}
                        onClick={() => {
                          if (iSSelectEnable) {
                            handleSelectForComparison(item);
                          } else {
                            router.push(
                              `/pre-approval?preApprovalId=${item.preApprovalId}`,
                            );
                          }
                        }}
                      />
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
        <BottomNavbar selectedTab={selectedTab} />
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
