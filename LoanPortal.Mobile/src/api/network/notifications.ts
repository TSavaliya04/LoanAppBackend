import guardedInstance from "../instances/guardedInstance";
import { NotificationListResponse, UnreadCountResponse } from "../models/Notification";

export const NOTIFICATION_PAGE_SIZE = 20;

export const getNotifications = async (
  pageNumber: number,
  isRead?: boolean
): Promise<NotificationListResponse> => {
  const readFilter = isRead === undefined ? "" : `&isRead=${isRead}`;
  const { data } = await guardedInstance.get(
    `/notifications?pageSize=${NOTIFICATION_PAGE_SIZE}&pageNumber=${pageNumber}${readFilter}`
  );
  return data;
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const { data } = await guardedInstance.get(`/notifications/unread-count`);
  return data;
};

export const markNotificationRead = async (id: string) => {
  const { data } = await guardedInstance.put(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await guardedInstance.put(`/notifications/mark-all-read`);
  return data;
};
