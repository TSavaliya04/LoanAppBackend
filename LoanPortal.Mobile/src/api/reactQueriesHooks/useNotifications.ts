import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATION_PAGE_SIZE,
} from "../network/notifications";

const NOTIFICATIONS_KEY = ["notifications"] as const;
const UNREAD_COUNT_KEY = ["notifications", "unread-count"] as const;

export const useUnreadCount = () =>
  useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: getUnreadCount,
    select: (res) => res.data?.count ?? 0,
    refetchInterval: 60_000,
  });

/** Paged list; a page shorter than the page size means there are no more. */
export const useNotifications = (enabled: boolean, isRead?: boolean) =>
  useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_KEY, "list", isRead ?? "all"],
    queryFn: ({ pageParam }) => getNotifications(pageParam, isRead),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      (lastPage.data?.length ?? 0) < NOTIFICATION_PAGE_SIZE ? undefined : allPages.length + 1,
    enabled,
  });

const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
};

export const useMarkNotificationRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
};

export const useMarkAllNotificationsRead = () => {
  const invalidate = useInvalidateNotifications();
  return useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });
};
