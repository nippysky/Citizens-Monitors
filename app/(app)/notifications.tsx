import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import EmptyNotificationState from "@/components/notifications/EmptyNotificationState";
import NotificationList from "@/components/notifications/NotificationList";
import NotificationsSkeleton from "@/components/notifications/NotificationsSkeleton";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsInfiniteQuery,
} from "@/hooks/api/useNotificationsQueries";
import { AppNotification } from "@/lib/api/notifications.api";
import { Theme } from "@/theme";

export default function NotificationsScreen() {
  const notificationsQuery = useNotificationsInfiniteQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const notifications = useMemo(
    () =>
      notificationsQuery.data?.pages.flatMap((page) => page.notifications) ??
      [],
    [notificationsQuery.data]
  );

  const unreadCount = useMemo(
    () => notificationsQuery.data?.pages[0]?.unreadCount ?? 0,
    [notificationsQuery.data]
  );

  const hasNotifications = notifications.length > 0;
  const isInitialLoading =
    notificationsQuery.isLoading && !notifications.length;

  const handleRefresh = (): void => {
    void notificationsQuery.refetch();
  };

  const handleEndReached = (): void => {
    if (
      notificationsQuery.hasNextPage &&
      !notificationsQuery.isFetchingNextPage
    ) {
      void notificationsQuery.fetchNextPage();
    }
  };

  const handleOpenNotification = (item: AppNotification): void => {
    if (!item.isRead) {
      void markReadMutation.mutateAsync(item.id).catch(() => {
        // Detail endpoint also marks read, so navigation should not be blocked.
      });
    }

    router.push({
      pathname: "/notifications/[id]" as never,
      params: { id: item.id },
    });
  };

  const handleMarkAllRead = (): void => {
    if (!unreadCount || markAllReadMutation.isPending) return;

    void markAllReadMutation.mutateAsync();
  };

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.backWrap}>
              <BackButton label="" />
            </View>

            <View style={styles.titleWrap}>
              <AppText style={styles.headerTitle}>Notifications</AppText>
            </View>

            <View style={styles.sideSpacer} />
          </View>

          <View style={styles.subHeaderRow}>
            <View style={styles.subtitleWrap}>
              <AppText style={styles.subtitle}>Don’t miss any message.</AppText>

              {unreadCount > 0 ? (
                <AppText style={styles.unreadSummary}>
                  {unreadCount} unread notification
                  {unreadCount === 1 ? "" : "s"}
                </AppText>
              ) : (
                <AppText style={styles.unreadSummary}>
                  You’re all caught up.
                </AppText>
              )}
            </View>

            {unreadCount > 0 ? (
              <Pressable
                onPress={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                style={({ pressed }) => [
                  styles.markAllButton,
                  pressed && styles.markAllButtonPressed,
                  markAllReadMutation.isPending && styles.markAllButtonDisabled,
                ]}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={15}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.markAllText}>
                  {markAllReadMutation.isPending ? "Marking..." : "Read all"}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.bodySection}>
          {isInitialLoading ? (
            <NotificationsSkeleton />
          ) : hasNotifications ? (
            <NotificationList
              items={notifications}
              refreshing={notificationsQuery.isRefetching}
              onRefresh={handleRefresh}
              onEndReached={handleEndReached}
              onPressItem={handleOpenNotification}
              ListFooterComponent={
                notificationsQuery.isFetchingNextPage ? (
                  <View style={styles.loadingMore}>
                    <AppText style={styles.loadingMoreText}>
                      Loading more...
                    </AppText>
                  </View>
                ) : null
              }
            />
          ) : (
            <EmptyNotificationState />
          )}
        </View>
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 34,
  },
  backWrap: {
    width: 52,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
  },
  sideSpacer: {
    width: 52,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },
  subHeaderRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  subtitleWrap: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "rgba(17, 26, 50, 0.82)",
    fontFamily: Theme.fonts.body.medium,
  },
  unreadSummary: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  markAllButton: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "rgba(25,183,176,0.09)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  markAllButtonPressed: {
    opacity: 0.76,
  },
  markAllButtonDisabled: {
    opacity: 0.55,
  },
  markAllText: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  bodySection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 6,
  },
  loadingMore: {
    paddingVertical: 18,
    alignItems: "center",
  },
  loadingMoreText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
});