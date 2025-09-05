"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  Container,
  LinearProgress,
  BottomNavigation,
  BottomNavigationAction,
  Card,
  CardContent,
} from "@mui/material";
import {
  Search,
  Info,
  Menu,
  Add,
  MonetizationOn,
  TrendingUp,
  Edit,
  CheckCircle,
  Timeline,
  Home,
  Description,
  CalendarToday,
  QuestionAnswer,
  Person,
  KeyboardArrowDown,
} from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { useSessionStore } from '@/stores/SessionStore';
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useSessionStore } from "@/stores/SessionStore";
import { useGetAllTopOpportunities } from "@/api/reactQueriesHooks/useGetTopOpportunities";
// import Link from "next/link";

type Opportunity = {
  borrowerName: string;
  preApprovalId: string | number;
  loanProgram?: string;
  agentName?: string;
  borrowers?: { id: string | number; borrowerName: string }[];
  // Add other fields as needed based on your API response
};

const Dashboard = () => {
  const router = useRouter();
  // const { data, isLoading } = useGetAllTopOpportunities();
  const { data } = useGetAllTopOpportunities();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  useEffect(() => {
    if (data) {
      setOpportunities(data.data);
    }
  }, [data]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [compensationMonth, setCompensationMonth] = useState("April");
  const { user } = useSessionStore();

  const actionButtons = [
    {
      icon: <Add />,
      label: "Pre-approval",
      color: "primary" as const,
      path: "/pre-approval",
    },
    {
      icon: <MonetizationOn />,
      label: "Run Pricing",
      color: "primary" as const,
      path: "#",
    },
    {
      icon: <TrendingUp />,
      label: "Start Loan",
      color: "primary" as const,
      path: "#",
    },
    {
      icon: <Edit />,
      label: "Edit Loan",
      color: "primary" as const,
      path: "#",
    },
    {
      icon: <CheckCircle />,
      label: "Check Status",
      color: "primary" as const,
      path: "#",
    },
    {
      icon: <Timeline />,
      label: "View Pipeline",
      color: "primary" as const,
      path: "#",
    },
  ];

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
          <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  width={32}
                  height={32}
                  src={"/icons/icon-192x192.png"}
                  alt="Logo"
                />
              </Box>
              <Typography
                sx={{
                  color: "text.primary",
                  fontSize: "1.6rem",
                  fontWeight: 400,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    display: "inline-block",
                    color: "primary.main",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                  }}
                >
                  Loans
                </Typography>{" "}
                N Stuff
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton sx={{ color: "text.secondary" }}>
                <Search />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Info />
              </IconButton>
              <IconButton sx={{ color: "text.secondary" }}>
                <Menu />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4, md: 4 }}>
              {/* Compensation Card */}
              <Paper sx={{ p: 3, borderRadius: "12px" }} elevation={0}>
                {/* Greeting */}
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, mb: 3, color: "text.primary" }}
                >
                  Hi, {user?.displayName?.split(" ")[0] || "User"}!
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Description sx={{ color: "primary.main" }} />
                    <Typography sx={{ color: "primary.main", fontWeight: 600 }}>
                      Compensation
                    </Typography>
                  </Box>
                  <Button
                    endIcon={<KeyboardArrowDown />}
                    sx={{ color: "primary.main" }}
                    onClick={() => {
                      setCompensationMonth("");
                    }}
                  >
                    {compensationMonth}
                  </Button>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 2,
                    bgcolor: "#e5e7eb",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "error.main",
                    },
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "20px",
                        color: "text.primary",
                      }}
                    >
                      $ 1,354,045
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      7 Loans funded
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "20px",
                        color: "text.primary",
                      }}
                    >
                      $ 1,723,485
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      10 loans est. funded
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {actionButtons.map((button, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                <Button
                  fullWidth
                  variant="contained"
                  color={button.color}
                  startIcon={button.icon}
                  sx={{
                    py: 2,
                    px: 2,
                    fontSize: "14px",
                    fontWeight: 400,
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "left",
                    boxShadow: "none",
                  }}
                  onClick={() => {
                    router.push(button.path);
                  }}
                >
                  {button.label}
                </Button>
              </Grid>
            ))}
          </Grid>

          {/* Top Opportunities */}
          <Box sx={{ mb: 3 }}>
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
                scrollBehavior: "smooth", // Smooth scrolling
                scrollbarWidth: "none", // Firefox
                "&::-webkit-scrollbar": {
                  display: "none", // Chrome, Safari
                },
              }}
            >
              <Box sx={{ display: "flex", gap: 4 }}>
                {/* <Typography sx={{ color: "text.secondary" }}>
                  None Available
                </Typography> */}
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
                            mb: 0.5,
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
                        {/* {opp?.borrowers?.map((borrower) => (
                          <Typography key={borrower.id} variant="body2" sx={{ color: "text.secondary"}}>
                            {borrower.borrowerName}
                          </Typography>
                        ))} */}
                        {/* <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mb: 1.5 }}
                        >
                          {opp.loanProgram}
                        </Typography> */}

                        <Box
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "#CCCCCC",
                            mb: 1,
                          }}
                        />

                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "1rem",
                            color: "text.primary",
                            fontWeight: 600,
                            mb: 0.5,
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
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Bottom Navigation */}
        <BottomNavigation
          value={selectedTab}
          onChange={(event, newValue) => setSelectedTab(newValue)}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: 2,
            height: "76px",
            bgcolor: "background.paper",
            borderTop: "1px solid #e5e7eb",
            "& .MuiBottomNavigationAction-root": {
              color: "text.secondary",
              "&.Mui-selected": {
                color: "error.main",
              },
            },
          }}
        >
          <BottomNavigationAction
            icon={<Home />}
            onClick={() => router.push("/dashboard")}
          />
          <BottomNavigationAction icon={<Description />} />
          <BottomNavigationAction icon={<CalendarToday />} />
          <BottomNavigationAction icon={<QuestionAnswer />} />
          <BottomNavigationAction
            icon={<Person />}
            onClick={() => router.push("/profile")}
          />
        </BottomNavigation>
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
