import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationDetail,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications.api";

const NOTIFICATIONS_LIMIT = 20;

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: ["notifications", "list"] as const,
  detail: (notificationId: string) =>
    ["notifications", "detail", notificationId] as const,
};

export function useNotificationsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: notificationQueryKeys.lists,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listNotifications({
        page: Number(pageParam),
        limit: NOTIFICATIONS_LIMIT,
      }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 30 * 1000,
  });
}

export function useNotificationDetailQuery(notificationId?: string) {
  return useQuery({
    queryKey: notificationQueryKeys.detail(notificationId ?? ""),
    queryFn: () => getNotificationDetail(notificationId ?? ""),
    enabled: Boolean(notificationId),
    staleTime: 15 * 1000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(notificationId),
    onSuccess: async (_, notificationId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.lists,
        }),
        queryClient.invalidateQueries({
          queryKey: notificationQueryKeys.detail(notificationId),
        }),
      ]);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
}