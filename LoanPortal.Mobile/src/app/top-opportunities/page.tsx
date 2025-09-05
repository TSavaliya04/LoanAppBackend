"use client";
import React, { useState } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { useSessionStore } from '@/stores/SessionStore';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useGetAllTopOpportunities } from "@/api/reactQueriesHooks/useGetTopOpportunities";

type TopOpportunity = {
  preApprovalId: string;
  borrowerName: string;
  loanProgram: string;
  agentName: string;
};

export default function TopOpportunities() {
  const router = useRouter();
  const { data, isLoading } = useGetAllTopOpportunities();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Agent");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const filteredAgents = agents.filter(
    (agent) =>
      agent.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.loanProgram.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loanProgramNames = {
    "1": "Non QM",
    "2": "Conventional",
    "3": "FHA",
  };

  return (
    <ProtectedRoute>
      <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
        {/* Header */}
        <AppBar
          position="static"
          sx={{
            position: "fixed",
            top: 0,
            bgcolor: "white",
            boxShadow: "none",
          }}
        >
          <Toolbar sx={{ px: 2, minHeight: 56 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Link href="/dashboard" passHref>
                <IconButton size="small" sx={{ color: "black" }}>
                  <ArrowBackIcon fontSize="medium" />
                </IconButton>
              </Link>
              <Typography
                sx={{ fontWeight: 500, fontSize: "20px", color: "black" }}
              >
                Top Opportunities
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Box>
                <Box sx={{ display: "flex", gap: "15px", mb: 1.5 }}>
                  {/* Search Input */}
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, address"
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
                ) : (
                  filteredAgents.map((item, index) => (
                    <Paper
                      key={index}
                      sx={{ p: 2, mb: 2, borderRadius: 2, cursor: "pointer" }}
                      onClick={() =>
                        router.push(
                          `/pre-approval?preApprovalId=${item.preApprovalId}`
                        )
                      }
                    >
                      <Typography fontWeight={600}>
                        {item.borrowerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Loan Program: {loanProgramNames[item.loanProgram as "1" | "2" | "3"]}
                      </Typography>
                      <Typography fontWeight={600} mt={1}>
                        Agent
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.agentName}
                      </Typography>
                    </Paper>
                  ))
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
