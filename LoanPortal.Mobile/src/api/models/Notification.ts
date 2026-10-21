export interface AppNotification {
  id: string;
  userId: string;
  type: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string | null;
  metadata?: Record<string, string> | null;
}

export interface NotificationListResponse {
  data: AppNotification[];
  success: boolean;
  message: string;
}

export interface UnreadCountResponse {
  data: { count: number };
  success: boolean;
  message: string;
}
