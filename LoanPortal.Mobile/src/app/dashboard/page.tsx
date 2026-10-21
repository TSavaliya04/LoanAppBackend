"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import {
  Search,
  Info,
  Menu,
  MonetizationOn,
  TrendingUp,
  Edit,
  // CheckCircle,
  Timeline,
  Home,
  Description,
  CalendarToday,
  QuestionAnswer,
  Person,
  Calculate as CalculateIcon,
  KeyboardArrowDown,
  ChevronRight,
} from "@mui/icons-material";
import SourceIcon from '@mui/icons-material/Source';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BalanceIcon from "@mui/icons-material/Balance";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
// import { useSessionStore } from '@/stores/SessionStore';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useSessionStore } from "@/stores/SessionStore";
import { useGetAllTopOpportunities, useGetAllContinueWorkingQuotes } from "@/api/reactQueriesHooks/useGetTopOpportunities";
import { useGetDashboardData } from "@/api/reactQueriesHooks/usePreApproval";
import BottomNavbar from "@/components/Common/BottomNavbar";
import NotificationBell from "@/components/Notifications/NotificationBell";
// import Link from "next/link";


const Dashboard = () => {
  const router = useRouter();
  // const { data, isLoading } = useGetAllTopOpportunities();
  const isPositive = (value: number) => value > 0;
  const { data, isLoading } = useGetDashboardData();
  const dashboard = data?.data;

  const { data: continueWorkingData, isLoading: isCWLoading } = useGetAllContinueWorkingQuotes({
    pageNumber: 1,
    pageSize: 4,
  });
  const continueWorkingItems: {
    preApprovalId: string;
    borrowerName: string;
    loanType: string;
    loanProgram: string;
    ownerName: string;
    updatedAt?: string;
    updatedBy?: string | null;
    totalScenarios: number;
    isCreatedByBorrower?: boolean;
    isViewedByLO?: boolean;
  }[] = Array.isArray(continueWorkingData?.data?.items)
      ? continueWorkingData.data.items.slice(0, 4)
      : [];
  const [selectedTab, setSelectedTab] = useState(0);
  const { user } = useSessionStore();

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
          <Toolbar sx={{ justifyContent: "space-between", px: 2, pb: "0", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  alignSelf: "center",
                }}
              >
                <Image
                  width={32}
                  height={32}
                  src={"/icons/icon-192x192.png"}
                  alt="Logo"
                />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <Typography
                  component="div"
                  sx={{
                    mb: "6px",
                    color: "text.primary",
                    fontSize: "1.6rem",
                    fontWeight: 400,
                    lineHeight: 0.8,
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      color: "primary.main",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      lineHeight: 0.8
                    }}
                  >
                    Loans
                  </Typography>{" "}
                  N Stuff
                </Typography>
                <Typography
                  component="div"
                  sx={{
                    m: 0,
                    fontSize: "0.6rem",
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    color: "text.disabled",
                    lineHeight: 1,
                  }}
                >
                  QUOTE&nbsp;•&nbsp;COMPARE&nbsp;•&nbsp;CLOSE
                </Typography>
              </Box>
            </Box>
            <NotificationBell />
            {/* <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton sx={{ color: "text.secondary" }}>
                <Search />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Info />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Menu />
              </IconButton>
            </Box> */}
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
          {/* Desktop two-column layout */}
          <Grid container spacing={2} alignItems="flex-start">
            {/* Left column: Compensation Card + Stat Cards Row */}
            <Grid size={{ xs: 12, md: 5 }}>
              {/* Compensation Card */}
              <Paper sx={{ p: 2, borderRadius: "12px", mb: 2 }} elevation={0}>
                {/* Greeting */}
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, mb: 3, color: "text.primary" }}
                >
                  Hi, {user?.displayName?.split(" ")[0] || "User"}!
                </Typography>

                <Grid container sx={{ mb: 2 }}>
                  {/* Quotes Created */}
                  <Grid
                    size={{ xs: 6 }}
                    sx={{ borderRight: "1px solid", borderColor: "divider" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: "2px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 40,
                          width: 40,
                          borderRadius: 99,
                          bgcolor: "#7444f534",
                        }}
                      >
                        <NoteAltOutlinedIcon sx={{ color: "#7444F5" }} />
                      </Box>
                      <Typography>Quotes Created</Typography>
                    </Box>

                    <Typography
                      sx={{
                        pl: "10px",
                        display: "flex",
                        alignItems: "baseline",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{ fontSize: 28, fontWeight: 600 }}
                      >
                        {dashboard?.quotesCreatedThisWeek ?? 0}
                      </Typography>
                      This Week
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {isPositive(dashboard?.quotesCreatedChange ?? 0) ? (
                        <ArrowUpwardIcon sx={{ color: "#1F9A00" }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ color: "#F44336" }} />
                      )}

                      <Typography>
                        <Typography
                          component="span"
                          sx={{
                            color: isPositive(
                              dashboard?.quotesCreatedChange ?? 0,
                            )
                              ? "#1F9A00"
                              : "#F44336",
                            fontWeight: 500,
                          }}
                        >
                          {dashboard?.quotesCreatedChange ?? 0}
                        </Typography>{" "}
                        vs last week
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Pre-Approved */}
                  <Grid size={{ xs: 6 }} sx={{ pl: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: "2px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 40,
                          width: 40,
                          borderRadius: 99,
                          bgcolor: "#1f9a0034",
                        }}
                      >
                        <AssignmentTurnedInOutlinedIcon
                          sx={{ color: "#1F9A00" }}
                        />
                      </Box>
                      <Typography>Pre-Approved</Typography>
                    </Box>

                    <Typography
                      sx={{
                        pl: "10px",
                        display: "flex",
                        alignItems: "baseline",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{ fontSize: 28, fontWeight: 600 }}
                      >
                        {dashboard?.preApprovedThisWeek ?? 0}
                      </Typography>
                      This Week
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {isPositive(dashboard?.preApprovedChange ?? 0) ? (
                        <ArrowUpwardIcon sx={{ color: "#1F9A00" }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ color: "#F44336" }} />
                      )}

                      <Typography>
                        <Typography
                          component="span"
                          sx={{
                            color: isPositive(dashboard?.preApprovedChange ?? 0)
                              ? "#1F9A00"
                              : "#F44336",
                            fontWeight: 500,
                          }}
                        >
                          {dashboard?.preApprovedChange ?? 0}
                        </Typography>{" "}
                        vs last week
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Stat Cards Row */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  bgcolor: "#fff",
                  border: "1px solid #F2E0DA",
                  boxShadow: "none",
                  display: "flex",
                  flexDirection: "row",
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    icon: <NoteAltOutlinedIcon sx={{ color: "#6C3FE8", fontSize: 22 }} />,
                    iconBg: "#EDE9FD",
                    label: "TBD",
                    chevronColor: "#6C3FE8",
                    route: "/top-opportunities?status=3",
                  },
                  {
                    icon: <FormatListBulletedIcon sx={{ color: "#22A45D", fontSize: 22 }} />,
                    iconBg: "#E6F9EE",
                    label: "Pre-Approved",
                    chevronColor: "#22A45D",
                    route: "/top-opportunities?status=1",
                  },
                  {
                    icon: <Timeline sx={{ color: "#1A73E8", fontSize: 22 }} />,
                    iconBg: "#E8F0FE",
                    label: "In Escrow",
                    chevronColor: "#1A73E8",
                    route: "/top-opportunities?status=2",
                  },
                  {
                    icon: <TaskOutlinedIcon sx={{ color: "#F57C00", fontSize: 22 }} />,
                    iconBg: "#FEF0E6",
                    label: "Closed Escrow",
                    chevronColor: "#F57C00",
                    route: "/top-opportunities?status=4",
                  },
                ].map((item, idx, arr) => (
                  <Box
                    key={item.label}
                    onClick={() => router.push(item.route)}
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      px: { xs: 0.5, sm: 1.5 },
                      py: { xs: 2, sm: 2.5 },
                      gap: 1,
                      cursor: "pointer",
                      borderRight: idx < arr.length - 1 ? "1px solid #EDDED9" : "none",
                      transition: "background 0.18s ease",
                      "&:hover": {
                        bgcolor: "#FFF1EC",
                      },
                    }}
                  >
                    {/* Colored icon box */}
                    <Box
                      sx={{
                        width: { xs: 44, sm: 48 },
                        height: { xs: 44, sm: 48 },
                        borderRadius: 2.5,
                        bgcolor: item.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 0.5,
                      }}
                    >
                      {item.icon}
                    </Box>

                    {/* Label */}
                    <Typography
                      sx={{
                        color: "black",
                        fontWeight: 600,
                        fontSize: { xs: "11px", sm: "13px" },
                        lineHeight: 1.3,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>

            {/* Right column: Continue Working */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ mb: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    bgcolor: "#fff",
                    border: "1px solid #F2E0DA",
                    overflow: "hidden",
                  }}
                >
                  {/* Card Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2.5,
                      pt: 2.5,
                      pb: 1.5,
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary" }}
                    >
                      Continue Working
                    </Typography>
                    <Typography
                      onClick={() => router.push("/top-opportunities")}
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      View all
                    </Typography>
                  </Box>

                  {/* Loan Items */}
                  {isCWLoading ? (
                    <Box sx={{ px: 2.5, py: 3, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">Loading...</Typography>
                    </Box>
                  ) : continueWorkingItems.length === 0 ? (
                    <Box sx={{ px: 2.5, py: 3, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">No records found</Typography>
                    </Box>
                  ) : (
                    continueWorkingItems.map((loan, idx) => {
                      const initials = loan.borrowerName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                      const PALETTE = ["#7444F5", "#2196F3", "#4CAF50", "#FF9800", "#E91E63", "#00BCD4", "#9C27B0", "#F44336"];
                      let hash = 0;
                      for (let i = 0; i < loan.borrowerName.length; i++) hash = loan.borrowerName.charCodeAt(i) + ((hash << 5) - hash);
                      const avatarBg = PALETTE[Math.abs(hash) % PALETTE.length];

                      const formatTime = (iso?: string) => {
                        if (!iso) return "";
                        const diff = Date.now() - new Date(iso).getTime();
                        const m = Math.floor(diff / 60000);
                        if (m < 60) return `${m}m ago`;
                        const h = Math.floor(m / 60);
                        if (h < 24) return `${h}h ago`;
                        const d = Math.floor(h / 24);
                        if (d > 365) {
                          const y = Math.floor(d / 365);
                          return `Updated ${y} ${y === 1 ? "year" : "years"} ago`;
                        }
                        if (d > 30) {
                          const mn = Math.floor(d / 30);
                          return `Updated ${mn} ${mn === 1 ? "month" : "months"} ago`;
                        }
                        return `${Math.floor(h / 24)}d ago`;
                      };

                      const isNew = loan.isCreatedByBorrower === true && loan.isViewedByLO === false;

                      return (
                        <Box
                          key={loan.preApprovalId}
                          onClick={() => router.push(`/pre-approval?preApprovalId=${loan.preApprovalId}`)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2.5,
                            py: 1.75,
                            borderTop: "1px solid #F5EDE9",
                            gap: 1.8,
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                            bgcolor: isNew ? "#F3EEFF" : undefined,
                            "&:hover": { bgcolor: isNew ? "#EBE3FF" : "#FFF8F6" },
                          }}
                        >
                          {/* Avatar */}
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              bgcolor: avatarBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}>
                              {initials}
                            </Typography>
                          </Box>

                          {/* Loan Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "text.primary", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {loan.borrowerName}
                              </Typography>
                              {isNew && (
                                <Box
                                  component="span"
                                  sx={{
                                    bgcolor: "#7444F5",
                                    color: "#fff",
                                    fontSize: "0.58rem",
                                    fontWeight: 700,
                                    px: 1,
                                    py: 0.2,
                                    borderRadius: 10,
                                    flexShrink: 0,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  NEW
                                </Box>
                              )}
                            </Box>
                            <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", lineHeight: 1.4 }}>
                              {[loan.loanType, loan.loanProgram].filter(Boolean).join(" • ")}
                            </Typography>
                            {loan.ownerName && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                                <Person sx={{ fontSize: 13, color: "text.secondary" }} />
                                <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                                  {loan.ownerName}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Updated Info */}
                          <Box sx={{ textAlign: "right", flexShrink: 0, mr: 1 }}>
                            {loan.updatedAt && (
                              <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                                Updated {formatTime(loan.updatedAt)}
                              </Typography>
                            )}
                            {loan.updatedBy && (
                              <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                                by{" "}
                                <Typography component="span" sx={{ color: "#7444F5", fontWeight: 600, fontSize: "0.68rem" }}>
                                  {loan.updatedBy}
                                </Typography>
                              </Typography>
                            )}
                          </Box>

                          {isNew && (
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#7444F5", flexShrink: 0 }} />
                          )}

                          {/* Arrow */}
                          <ChevronRight sx={{ color: "text.disabled", flexShrink: 0, fontSize: 20 }} />
                        </Box>
                      );
                    })
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>

          {/* Top Opportunities */}
          {/* <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Top Opportunities
              </Typography>
              <Button
                sx={{ color: "primary.main" }}
                onClick={() => {
                  router.push("/top-opportunities");
                }}
              >
                See all
              </Button>
            </Box>

            <Box
              sx={{
                overflowX: "auto",
                whiteSpace: "nowrap",
                scrollBehavior: "smooth",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              <Box sx={{ display: "flex", gap: 4 }}>
                {opportunities.map((opp, index) => (
                  <Box
                    key={index}
                    sx={{
                      minWidth: { xs: 245, sm: 250, md: 300 },
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      router.push(
                        `/pre-approval?preApprovalId=${opp.preApprovalId}`
                      )
                    }
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        borderColor: "#CCCCCC",
                        backgroundColor: "transparent",
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          Borrower
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {opp.borrowerName}
                        </Typography>

                        <Box
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "#CCCCCC",
                            mb: 1,
                            mt: 1,
                          }}
                        />

                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "1rem",
                            color: "text.primary",
                            fontWeight: 600,
                          }}
                        >
                          Agent
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.primary" }}
                        >
                          {opp.agentName}
                        </Typography>

                        {opp.createdAt && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              mt: 1,
                              fontStyle: "italic",
                            }}
                          >
                            Created on:{" "}
                            {new Date(opp.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box> */}
        </Container>

        <BottomNavbar selectedTab={selectedTab} />
      </Box>
    </ProtectedRoute>
  );
};

export default Dashboard;

// dashboard.protected = true;

// dashboard.getLayout = function getLayout(page: ReactElement) {
//   return (
//     <PageHeader title="Dashboard" BreadcrumbsComponent="" ActionComponent="">
//       {page}
//     </PageHeader>
//   );
// };
