"use client";
import * as React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Chip,
  Button,
  Stack,
  Tabs,
  Tab,
  MenuItem,
  AppBar,
  Toolbar,
  Container,
  Menu,
  ListItemIcon,
  Divider,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Timeline } from "@mui/icons-material";
import OGDataGrid from "@/components/DataGrid";
import { DateRange, Range } from "react-date-range";
import Image from "next/image";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/api/instances/firebase";
import { useSessionStore } from "@/stores/SessionStore";
import { useGetAdminDashboard } from "@/api/reactQueriesHooks/useGetAdminDashboard";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import UserListLogic from "@/hooks/UserPage/UserListLogic";
import { gridClasses } from "@mui/x-data-grid";
import useServerSideFilter from "@/hooks/useServerSideFIlter";
import CustomToolbar from "@/components/DataGrid/SearchInput";
import Navbar from "@/components/Admin/Navbar";

const StatCard = ({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) => (
  <Card sx={{ borderRadius: 3, height: "100%" }} elevation={0}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: `#${color}26`, color: `#${color}` }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [startDate, setstartDate] = React.useState<string | null>(null);
  const [endDate, setEndDate] = React.useState<string | null>(null);
  const [range, setRange] = React.useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const { data: fetchedData, refetch: refetchDashboardData } =
    useGetAdminDashboard(startDate, endDate);
  const [totalUser, setTotalUser] = React.useState(0);
  const [activeUser, setActiveUser] = React.useState(0);
  const [quotesCreated, setQuotesCreated] = React.useState(0);
  const [preApprovals, setPreApprovals] = React.useState(0);
  const [filesInEscrow, setFilesInEscrow] = React.useState(0);

  React.useEffect(() => {
    setTotalUser(fetchedData?.data?.totalUser ?? 0);
    setActiveUser(fetchedData?.data?.activeUser ?? 0);
    setQuotesCreated(fetchedData?.data?.quotesCreated ?? 0);
    setPreApprovals(fetchedData?.data?.preApprovals ?? 0);
    setFilesInEscrow(fetchedData?.data?.filesInEscrow ?? 0);
  }, [fetchedData]);
  const { setUser } = useSessionStore();
  const [tab, setTab] = React.useState(0);
  const { rowCountState, columns, data, isLoading, handleEvent } =
    UserListLogic();
  const {
    params,
    handlePaginationChange,
    onFilterChange,
    handleSortModelChange,
  } = useServerSideFilter();
  const customTabRef = React.useRef<HTMLDivElement | null>(null);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  React.useEffect(() => {
    refetchDashboardData();
  }, [startDate, endDate]);

  React.useEffect(() => {
    let startDate: string | null = null;
    let endDate: string | null = null;

    switch (tab) {
      case 1: // Last 7 days (including today)
        startDate = dayjs().subtract(6, "day").startOf("day").toISOString();
        endDate = dayjs().endOf("day").toISOString();
        break;

      case 2: // This month
        startDate = dayjs().startOf("month").startOf("day").toISOString();
        endDate = dayjs().endOf("month").endOf("day").toISOString();
        break;

      case 3: // Custom
        const selection = range[0];
        startDate = dayjs(selection.startDate).startOf("day").toISOString();
        endDate = dayjs(selection.endDate).endOf("day").toISOString();
        // keep previous values or wait for user input
        break;

      default:
        break;
    }

    setstartDate(startDate);
    setEndDate(endDate);
  }, [tab]);

  const getStatLabelSuffix = React.useMemo(() => {
    switch (tab) {
      case 0:
        return "Today";

      case 1:
        return "Past 7 Days";

      case 2:
        return "This Month";

      case 3:
        if (startDate && endDate) {
          return `(${dayjs(startDate).format("DD MMM")} – ${dayjs(endDate).format("DD MMM")})`;
        }
        return "Custom Range";

      default:
        return "";
    }
  }, [tab, startDate, endDate]);

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setTab(value);
  };

  return (
    <ProtectedRoute allow={["admin"]}>
      <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
        <Navbar />
        <Container maxWidth={false} sx={{ pt: 10, px: 2 }}>
          {/* Filters */}
          <Card sx={{ mb: 2, borderRadius: 3 }} elevation={0}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              sx={{ px: 2 }}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Today" />
              <Tab label="Past 7 Days" />
              <Tab label="This Month" />
              <Tab
                label="Custom"
                component="div"
                ref={customTabRef}
                onClick={() => {
                  setCalendarOpen((prev) => !prev);
                }}
              />
            </Tabs>
            <Menu
              anchorEl={customTabRef.current}
              open={calendarOpen}
              onClose={() => setCalendarOpen(false)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              MenuListProps={{
                onMouseDown: (e) => e.stopPropagation(), // 👈 prevents auto-close
                disablePadding: true,
              }}
              keepMounted
            >
              <DateRange
                ranges={range}
                onChange={(item) => {
                  const selection = item.selection;

                  if (!selection.startDate || !selection.endDate) return;

                  setRange([selection]);

                  setstartDate(
                    dayjs(selection.startDate).startOf("day").toISOString(),
                  );

                  setEndDate(
                    dayjs(selection.endDate).endOf("day").toISOString(),
                  );
                }}
                moveRangeOnFirstSelection={false}
                editableDateInputs
                rangeColors={["#7444F5"]}
              />
              <Box sx={{ display: "flex", justifyContent: "end" }}>
                <Button
                  onClick={() => {
                    const selection = range[0];

                    setstartDate(
                      dayjs(selection.startDate).startOf("day").toISOString(),
                    );

                    setEndDate(
                      dayjs(selection.endDate).endOf("day").toISOString(),
                    );

                    setCalendarOpen(false);
                  }}
                  sx={{ p: 0, mb: 2 }}
                >
                  Ok
                </Button>
              </Box>
            </Menu>
          </Card>

          {/* Stats */}
          <Grid container spacing={2} mb={2} columns={{ xs: 12, sm: 12, md: 5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <StatCard
                icon={<PeopleOutlineIcon />}
                value={totalUser}
                label={`Total Users`}
                color="7444F5"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <StatCard
                icon={<PersonOutlineOutlinedIcon />}
                value={activeUser}
                label={`Active Users ${getStatLabelSuffix}`}
                color="7444F5"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <StatCard
                icon={<NoteAltOutlinedIcon />}
                value={quotesCreated}
                label={`Quotes Created ${getStatLabelSuffix}`}
                color="7444F5"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <StatCard
                icon={<AssignmentTurnedInOutlinedIcon />}
                value={preApprovals}
                label={`Pre-Approvals ${getStatLabelSuffix}`}
                color="1F9A00"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <StatCard
                icon={<Timeline />}
                value={filesInEscrow}
                label={`Files in Escrow ${getStatLabelSuffix}`}
                color="7444F5"
              />
            </Grid>
          </Grid>

          {/* User Activity */}
          <Card sx={{ borderRadius: 3 }} elevation={0}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Users List
              </Typography>

              {/* Table */}
              <Box sx={{ overflowX: "auto" }}>
                <OGDataGrid
                  columns={columns}
                  rows={data?.users ?? []}
                  loading={isLoading}
                  disableColumnMenu
                  getRowId={(row: any) => row.agentId}
                  onRowClick={handleEvent}
                  rowCount={rowCountState}
                  pageSizeOptions={[50, 75, 100]}
                  getRowHeight={() => "auto"}
                  paginationModel={{
                    page: params.pageNumber,
                    pageSize: params.pageSize,
                  }}
                  paginationMode="server"
                  filterMode="server"
                  sortingMode="server"
                  onPaginationModelChange={handlePaginationChange}
                  onFilterModelChange={onFilterChange}
                  onSortModelChange={handleSortModelChange}
                  slots={{
                    toolbar: CustomToolbar,
                  }}
                  showToolbar
                  sx={{
                    // minHeight: window.innerHeight - 90,
                    overflow: "auto",
                    [`& .${gridClasses.cell}`]: {
                      py: 1 + 1 / 2,
                    },
                    border: "0",
                    width: "100%",
                    cursor: "pointer",
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                      outline: "none !important",
                    },
                  }}
                  disableRowSelectionOnClick
                  initialState={{
                    sorting: {
                      sortModel: [{ field: "agentName", sort: "asc" }],
                    },
                  }}
                  sortingOrder={["asc", "desc"]}
                />
              </Box>

              <Box textAlign="right" mt={2}>
                <Button>View All Users</Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
