import { apiRequest } from "@/lib/api/http";

export type NotificationType =
  | "result-upload"
  | "incident-upload"
  | "comment"
  | "system"
  | "election"
  | string;

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  info?: string | null;
  createdAt: string;
  isRead: boolean;
};

export type ListNotificationsParams = {
  page?: number;
  limit?: number;
};

export type ListNotificationsResponse = {
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
  notifications: AppNotification[];
};

export type NotificationDetailResponse = {
  notification: AppNotification;
};

export type NotificationMutationResponse = {
  message: string;
};

function toQueryString(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
}

export async function listNotifications(
  params: ListNotificationsParams = {}
): Promise<ListNotificationsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return apiRequest<ListNotificationsResponse>(
    `/notifications?${toQueryString({ page, limit })}`,
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function getNotificationDetail(
  notificationId: string
): Promise<NotificationDetailResponse> {
  return apiRequest<NotificationDetailResponse>(
    `/notifications/${encodeURIComponent(notificationId)}`,
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationMutationResponse> {
  return apiRequest<NotificationMutationResponse>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "POST",
      auth: true,
    }
  );
}

export async function markAllNotificationsRead(): Promise<NotificationMutationResponse> {
  return apiRequest<NotificationMutationResponse>("/notifications/read-all", {
    method: "POST",
    auth: true,
  });
}