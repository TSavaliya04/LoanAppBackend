"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, AppBar, Toolbar, Container, Chip, Skeleton, Button, CircularProgress } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import BottomNavbar from "@/components/Common/BottomNavbar";
import { useNotifications } from "@/api/reactQueriesHooks/useNotifications";
import {
  ActivityFilter,
  ActivityKind,
  FILTERS,
  formatActivityTime,
  groupByDay,
  kindOf,
  matchesFilter,
} from "@/components/Activity/activityConfig";

const KIND_STYLE: Record<ActivityKind, { icon: React.ElementType; color: string; bg: string }> = {
  quotes: { icon: DescriptionOutlinedIcon, color: "#7444F5", bg: "#EDE9FD" },
  status: { icon: CheckCircleOutlineIcon, color: "#2E9E4F", bg: "#E4F5E9" },
  borrowers: { icon: PersonAddAltIcon, color: "#6B7280", bg: "#EEF0F3" },
  team: { icon: PeopleOutlineIcon, color: "#2F7BE5", bg: "#E3EEFC" },
  other: { icon: NotificationsNoneIcon, color: "#E5484D", bg: "#FDE7E8" },
};

const ActivityPage = () => {
  const [selectedTab] = useState(2);
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const router = useRouter();

  // Per the activity API spec: /notifications?pageSize=20&pageNumber=N&isRead=true
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useNotifications(true, true);

  const groups = useMemo(
    () => groupByDay((data?.pages.flatMap((p) => p.data ?? []) ?? []).filter((n) => matchesFilter(n, filter))),
    [data, filter]
  );

  // Infinite scroll: load the next page when the sentinel nears the viewport bottom.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, groups]);

  return (
    <ProtectedRoute allow={["user"]}>
      <Box sx={{ bgcolor: "secondary.main", minHeight: "100vh", pb: 14 }}>
        {/* Header */}
        <AppBar
          position="fixed"
          sx={{
            bgcolor: "white",
            boxShadow: "none",
            zIndex: (theme) => theme.zIndex.appBar,
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
                <Image width={32} height={32} src={"/icons/icon-192x192.png"} alt="Logo" />
              </Box>
              <Typography sx={{ color: "text.primary", fontSize: "1.6rem", fontWeight: 400 }}>
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
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ pt: 12, px: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
            Activity
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 2 }}>
            Stay up to date with your borrowers, quotes and team activity.
          </Typography>

          {/* Filter chips */}
          <Box
            sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1, mb: 1, "&::-webkit-scrollbar": { display: "none" } }}
          >
            {FILTERS.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                onClick={() => setFilter(f.key)}
                sx={{
                  flexShrink: 0,
                  fontWeight: 500,
                  bgcolor: filter === f.key ? "primary.main" : "white",
                  color: filter === f.key ? "#fff" : "text.primary",
                  border: "1px solid",
                  borderColor: filter === f.key ? "primary.main" : "#F2E0DA",
                  "&:hover": { bgcolor: filter === f.key ? "primary.dark" : "#FFF8F6" },
                }}
              />
            ))}
          </Box>

          {isLoading ? (
            <Box sx={{ bgcolor: "white", borderRadius: 3, mt: 1 }}>
              {[0, 1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: "flex", gap: 1.5, p: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : isError ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography sx={{ color: "text.secondary", mb: 1 }}>Couldn&apos;t load activity.</Typography>
              <Button onClick={() => refetch()} sx={{ textTransform: "none" }}>
                Try again
              </Button>
            </Box>
          ) : groups.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "text.secondary", py: 6 }}>No activity yet.</Typography>
          ) : (
            groups.map((group) => (
              <Box key={group.label} sx={{ mt: 2 }}>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 600, color: "text.primary", mb: 1 }}>
                  {group.label}
                </Typography>
                <Box sx={{ bgcolor: "white", borderRadius: 3, overflow: "hidden" }}>
                  {group.items.map((n, i) => {
                    const { icon: Icon, color, bg } = KIND_STYLE[kindOf(n)];
                    const quoteId = n.metadata?.quoteId ?? n.relatedEntityId;
                    return (
                      <Box
                        key={n.id}
                        onClick={() => quoteId && router.push(`/pre-approval?preApprovalId=${quoteId}`)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 2,
                          py: 1.5,
                          cursor: quoteId ? "pointer" : "default",
                          borderTop: i === 0 ? "none" : "1px solid #F2E0DA",
                          "&:hover": quoteId ? { bgcolor: "#FFF8F6" } : undefined,
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            bgcolor: bg,
                            color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.3 }}>
                            {n.title}
                          </Typography>
                          <Typography sx={{ fontSize: "0.88rem", color: "text.primary", wordBreak: "break-word" }}>
                            {n.metadata?.borrowerName ?? n.message}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{ fontSize: "0.78rem", color: "text.secondary", flexShrink: 0, alignSelf: "flex-start", mt: 0.5 }}
                        >
                          {formatActivityTime(n.createdAt, group.label)}
                        </Typography>
                        {quoteId && <ChevronRight sx={{ color: "text.disabled", flexShrink: 0 }} />}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))
          )}

          <Box ref={sentinelRef} sx={{ height: 1 }} />
          {isFetchingNextPage && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={22} />
            </Box>
          )}
        </Container>

        <BottomNavbar selectedTab={selectedTab} />
      </Box>
    </ProtectedRoute>
  );
};

export default ActivityPage;
