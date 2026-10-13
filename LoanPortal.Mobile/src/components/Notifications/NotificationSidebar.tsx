"use client";
import React, { useEffect, useRef } from "react";
import { Box, Button, CircularProgress, Drawer, IconButton, Skeleton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "@/api/reactQueriesHooks/useNotifications";
import { AppNotification } from "@/api/models/Notification";
import { timeAgo } from "./timeAgo";

const NotificationSidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useNotifications(open);
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items: AppNotification[] = data?.pages.flatMap((p) => p.data ?? []) ?? [];

  // Infinite scroll: load the next page when the sentinel nears the bottom of the scroll area.
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!open || !node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { root: scrollRef.current, rootMargin: "120px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 400 }, maxWidth: "100%" } }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>Notifications</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Button
              size="small"
              disabled={unreadCount === 0 || markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Mark all as read
            </Button>
            <IconButton onClick={onClose} aria-label="Close notifications" size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto" }}>
          {isLoading ? (
            [0, 1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ px: 2, py: 1.5 }}>
                <Skeleton width="50%" />
                <Skeleton width="90%" />
              </Box>
            ))
          ) : isError ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography sx={{ color: "text.secondary", mb: 1 }}>Couldn&apos;t load notifications.</Typography>
              <Button onClick={() => refetch()} sx={{ textTransform: "none" }}>
                Try again
              </Button>
            </Box>
          ) : items.length === 0 ? (
            <Typography sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
              You have no notifications.
            </Typography>
          ) : (
            <>
              {items.map((n) => (
                <Box
                  key={n.id}
                  onClick={() => !n.isRead && markRead.mutate(n.id)}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: n.isRead ? "default" : "pointer",
                    bgcolor: n.isRead ? "transparent" : "#EEF2FF",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      mt: "7px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      bgcolor: n.isRead ? "transparent" : "primary.main",
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: n.isRead ? 500 : 700, fontSize: "0.9rem" }}>{n.title}</Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", wordBreak: "break-word" }}>
                      {n.message}
                    </Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "text.disabled", mt: 0.5 }}>
                      {timeAgo(n.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Box ref={sentinelRef} sx={{ height: 1 }} />
              {isFetchingNextPage && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={22} />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationSidebar;
