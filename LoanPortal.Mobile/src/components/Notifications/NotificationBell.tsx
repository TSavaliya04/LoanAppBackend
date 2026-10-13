"use client";
import React, { useState } from "react";
import { Badge, IconButton } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useUnreadCount } from "@/api/reactQueriesHooks/useNotifications";
import NotificationSidebar from "./NotificationSidebar";

/** AppBar bell with unread badge; opens the notification sidebar. */
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <>
      <IconButton onClick={() => setOpen(true)} aria-label="Open notifications" sx={{ color: "text.secondary" }}>
        <Badge color="error" badgeContent={unreadCount} max={99}>
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>
      <NotificationSidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default NotificationBell;
