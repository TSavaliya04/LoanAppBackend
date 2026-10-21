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
    Chip,
    Button,
    Stack,
    AppBar,
    Toolbar,
    Container,
    Menu,
    ListItemIcon,
    Divider,
    Breadcrumbs,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    MenuItem,
    Tabs,
    Tab,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { firebaseAuth } from "@/api/instances/firebase";
import { useSessionStore } from "@/stores/SessionStore";
import dayjs from "dayjs";
import Navbar from "@/components/Admin/Navbar";
import { LineChart } from '@mui/x-charts/LineChart';
import { useGetUserDetails, useGetQuotesOverview } from "@/api/reactQueriesHooks/useGetUserDetails";
import { DateRange, Range } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import OGDataGrid from "@/components/DataGrid";
import RecentQuotesLogic from "@/hooks/UserPage/RecentQuotesLogic";
import { gridClasses } from "@mui/x-data-grid";

// Mock data - replace with actual API calls
const mockUserData = {
    agentId: "d46a5505-2042-4902-85f8-ca34f50b2c3d",
    agentName: "Susan Mitchell",
    email: "susanm@gmail.com",
    phone: "(555) 123-4567",
    company: "Mitchell Loans",
    status: "Active",
    lastLogin: "2 days ago",
    joinDate: "January 12, 2023",
    totalQuotes: 42,
    escrowFiles: 9,
    profileImage: null,
};

const mockQuotesData = [
    {
        id: 1,
        date: "Apr 22",
        client: "John Langston",
        loanAmount: "$350,000",
        loanType: "Refinance",
        status: "Pre-Approval",
    },
    {
        id: 2,
        date: "Apr 20",
        client: "Emily Parker",
        loanAmount: "$275,000",
        loanType: "FHA",
        status: "Escrow",
    },
    {
        id: 3,
        date: "Apr 18",
        client: "Michael Chen",
        loanAmount: "$480,000",
        loanType: "VA",
        status: "Escrow",
    },
    {
        id: 4,
        date: "Apr 14",
        client: "Stephanie Jones",
        loanAmount: "$325,000",
        loanType: "Conventional",
        status: "Pre-Approval",
    },
    {
        id: 5,
        date: "Apr 10",
        client: "Daniel Wright",
        loanAmount: "$410,000",
        loanType: "Refinance",
        status: "Escrow",
    },
];

// Chart data for quotes overview
const mockChartData = [
    { day: 1, quotes: 0 },
    { day: 2, quotes: 1 },
    { day: 3, quotes: 1 },
    { day: 4, quotes: 2 },
    { day: 5, quotes: 2 },
    { day: 6, quotes: 3 },
    { day: 7, quotes: 3 },
    { day: 8, quotes: 3 },
    { day: 9, quotes: 3 },
    { day: 10, quotes: 4 },
    { day: 11, quotes: 4 },
    { day: 12, quotes: 4 },
    { day: 13, quotes: 5 },
    { day: 14, quotes: 5 },
    { day: 15, quotes: 5 },
    { day: 16, quotes: 6 },
    { day: 17, quotes: 6 },
    { day: 18, quotes: 6 },
    { day: 19, quotes: 6 },
    { day: 20, quotes: 6 },
    { day: 21, quotes: 6 },
    { day: 22, quotes: 6 },
    { day: 23, quotes: 6 },
    { day: 24, quotes: 6 },
];

// Helper function to format phone number to US format
const formatPhoneNumber = (value: string | null | undefined): string => {
    if (!value) return 'N/A';

    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return "";

    const [, area, prefix, line] = match;
    if (area && !prefix) return `(${area}`;
    if (area && prefix && !line) return `(${area}) ${prefix}`;
    if (area && prefix && line) return `(${area}) ${prefix}-${line}`;
    return cleaned;
};


const QuotesDataGrid = ({ userId }: { userId: string }) => {
    const {
        rowCountState,
        columns,
        data,
        isLoading,
        params,
        handlePaginationChange,
        handleSortModelChange,
    } = RecentQuotesLogic({ userId });

    return (
        <Box sx={{ overflowX: "auto" }}>
            <OGDataGrid
                columns={columns}
                rows={data?.quotes ?? []}
                loading={isLoading}
                disableColumnMenu
                getRowId={(row: any) => row.id || Math.random()} // Fallback ID if missing
                rowCount={rowCountState}
                pageSizeOptions={[5, 10, 25]}
                getRowHeight={() => "auto"}
                paginationModel={{
                    page: params.pageNumber,
                    pageSize: params.pageSize,
                }}
                paginationMode="server"
                filterMode="server"
                sortingMode="server"
                onPaginationModelChange={handlePaginationChange}
                onSortModelChange={handleSortModelChange}
                sx={{
                    // minHeight: 300,
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
            // initialState={{
            //    sorting: {
            //       sortModel: [{ field: "date", sort: "desc" }],
            //    },
            // }}
            />
        </Box>
    );
};

export default function UserProfile() {
    const params = useParams();
    const userId = params?.id as string;

    // Date filter state
    const [tab, setTab] = React.useState(0);
    const [startDate, setStartDate] = React.useState<string | null>(null);
    const [endDate, setEndDate] = React.useState<string | null>(null);
    const [range, setRange] = React.useState<Range[]>([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);
    const [calendarOpen, setCalendarOpen] = React.useState(false);
    const customTabRef = React.useRef<HTMLDivElement | null>(null);

    // Fetch user details from API
    const { data: userData, isLoading: isLoadingUser } = useGetUserDetails(userId);

    // Fetch quotes overview from API
    const { data: quotesData, isLoading: isLoadingQuotes } = useGetQuotesOverview(
        startDate,
        endDate,
        userId
    );

    // Calculate date ranges based on selected tab
    React.useEffect(() => {
        let newStartDate: string | null = null;
        let newEndDate: string | null = null;

        switch (tab) {
            case 1: // This Week (Last 7 days including today)
                newStartDate = dayjs().subtract(6, "day").startOf("day").toISOString();
                newEndDate = dayjs().endOf("day").toISOString();
                break;

            case 2: // This Month
                newStartDate = dayjs().startOf("month").startOf("day").toISOString();
                newEndDate = dayjs().endOf("month").endOf("day").toISOString();
                break;

            case 3: // Custom
                const selection = range[0];
                newStartDate = dayjs(selection.startDate).startOf("day").toISOString();
                newEndDate = dayjs(selection.endDate).endOf("day").toISOString();
                break;

            default: // Today (case 0)
                break;
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
    }, [tab, range]);

    const handleTabChange = (_: React.SyntheticEvent, value: number) => {
        setTab(value);
    };

    return (
        <ProtectedRoute allow={["admin"]}>
            <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 10 }}>
                <Navbar />
                <Container maxWidth={false} sx={{ pt: 10, px: 3 }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        User Profile
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Left Column - User Info */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{ borderRadius: 3, mb: 3 }} elevation={0}>
                                <CardContent>
                                    <Stack spacing={3} alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                bgcolor: "#7444F5",
                                                fontSize: "2.5rem",
                                            }}
                                        >
                                            {userData?.firstName?.charAt(0) || 'U'}
                                        </Avatar>
                                        <Box textAlign="center">
                                            <Typography variant="h5" fontWeight={600}>
                                                {userData?.firstName && userData?.lastName
                                                    ? `${userData.firstName} ${userData.lastName}`
                                                    : 'Loading...'}
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                justifyContent="center"
                                                sx={{ mt: 1 }}
                                            >
                                                <EmailOutlinedIcon
                                                    fontSize="small"
                                                    sx={{ color: "text.secondary" }}
                                                />
                                                <Typography variant="body2" color="text.secondary">
                                                    {userData?.email || 'N/A'}
                                                </Typography>
                                            </Stack>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                justifyContent="center"
                                                sx={{ mt: 0.5 }}
                                            >
                                                <PhoneOutlinedIcon
                                                    fontSize="small"
                                                    sx={{ color: "text.secondary" }}
                                                />
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatPhoneNumber(userData?.phone)}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                        <Stack direction="row" spacing={2}>
                                            <Chip
                                                icon={<BusinessOutlinedIcon />}
                                                label={userData?.companyName || 'N/A'}
                                                size="small"
                                            />
                                            <Chip
                                                label={userData?.isActive ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={userData?.isActive ? 'success' : 'default'}
                                            />
                                        </Stack>
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditOutlinedIcon />}
                                            fullWidth
                                        >
                                            Edit Profile
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* User Details Card */}
                            <Card sx={{ borderRadius: 3 }} elevation={0}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                        User Details
                                    </Typography>
                                    {isLoadingUser ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Loading user details...
                                        </Typography>
                                    ) : (
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Full Name
                                                </Typography>
                                                <Typography variant="body2">
                                                    {userData?.firstName && userData?.lastName
                                                        ? `${userData.firstName} ${userData.lastName}`
                                                        : 'N/A'}
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Email
                                                </Typography>
                                                <Typography variant="body2">
                                                    {userData?.email || 'N/A'}
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Phone
                                                </Typography>
                                                <Typography variant="body2">
                                                    {formatPhoneNumber(userData?.phone)}
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Company
                                                </Typography>
                                                <Typography variant="body2">
                                                    {userData?.companyName || 'N/A'}
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Last Login
                                                </Typography>
                                                <Typography variant="body2">
                                                    {userData?.lastLoginDate
                                                        ? new Date(userData.lastLoginDate).toLocaleString()
                                                        : 'N/A'}
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Job Title
                                                </Typography>
                                                <Typography variant="body2">
                                                    {userData?.jobTitle || 'N/A'}
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    NMLS
                                                </Typography>
                                                <Typography variant="body2">
                                                    {userData?.nmls || 'N/A'}
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Status
                                                </Typography>
                                                <Typography variant="body2">
                                                    {userData?.isActive ? 'Active' : 'Inactive'}
                                                </Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    Joined
                                                </Typography>
                                                <Typography variant="body2">
                                                    {userData?.createdAt
                                                        ? new Date(userData.createdAt).toLocaleDateString()
                                                        : 'N/A'}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Right Column - Quotes Overview & Recent Quotes */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            {/* Quotes Overview Chart */}
                            <Card sx={{ borderRadius: 3, mb: 3 }} elevation={0}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                        Quotes Overview
                                    </Typography>

                                    {/* Date Filter Tabs */}
                                    <Tabs
                                        value={tab}
                                        onChange={handleTabChange}
                                        sx={{ mb: 2, minHeight: 40 }}
                                        textColor="primary"
                                        indicatorColor="primary"
                                    >
                                        <Tab label="Today" sx={{ minHeight: 40 }} />
                                        <Tab label="This Week" sx={{ minHeight: 40 }} />
                                        <Tab label="This Month" sx={{ minHeight: 40 }} />
                                        <Tab
                                            label="Custom"
                                            component="div"
                                            ref={customTabRef}
                                            onClick={() => {
                                                setCalendarOpen((prev) => !prev);
                                            }}
                                            sx={{ minHeight: 40 }}
                                        />
                                    </Tabs>

                                    {/* Custom Date Picker Menu */}
                                    <Menu
                                        anchorEl={customTabRef.current}
                                        open={calendarOpen}
                                        onClose={() => setCalendarOpen(false)}
                                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                        transformOrigin={{ vertical: "top", horizontal: "left" }}
                                        MenuListProps={{
                                            onMouseDown: (e) => e.stopPropagation(),
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
                                                setStartDate(
                                                    dayjs(selection.startDate).startOf("day").toISOString()
                                                );
                                                setEndDate(
                                                    dayjs(selection.endDate).endOf("day").toISOString()
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
                                                    setStartDate(
                                                        dayjs(selection.startDate).startOf("day").toISOString()
                                                    );
                                                    setEndDate(
                                                        dayjs(selection.endDate).endOf("day").toISOString()
                                                    );
                                                    setCalendarOpen(false);
                                                }}
                                                sx={{ p: 0, mb: 2 }}
                                            >
                                                Ok
                                            </Button>
                                        </Box>
                                    </Menu>

                                    <Box sx={{ position: 'relative' }}>
                                        <svg width="0" height="0">
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#7444F5" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#7444F5" stopOpacity="0.05" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        {isLoadingQuotes ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                                Loading chart data...
                                            </Typography>
                                        ) : quotesData?.data?.dailyQuoteCounts && quotesData.data.dailyQuoteCounts.length > 0 ? (
                                            <LineChart
                                                xAxis={[{
                                                    data: quotesData.data.dailyQuoteCounts.map((d: any) =>
                                                        dayjs(d.date).format('MMM DD')
                                                    ),
                                                    scaleType: 'point',
                                                }]}
                                                series={[
                                                    {
                                                        data: quotesData.data.dailyQuoteCounts.map((d: any) => d.quoteCount || 0),
                                                        area: true,
                                                        color: '#7444F5',
                                                        showMark: true,
                                                    },
                                                ]}
                                                height={300}
                                                margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
                                                skipAnimation={false}
                                                sx={{
                                                    '& .MuiAreaElement-root': {
                                                        fill: 'url(#chartGradient)',
                                                    },
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                                No data available for the selected period
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Recent Quotes Table */}
                            <Card sx={{ borderRadius: 3 }} elevation={0}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                        Recent Quotes
                                    </Typography>
                                    <QuotesDataGrid userId={userId} />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </ProtectedRoute >
    );
}
