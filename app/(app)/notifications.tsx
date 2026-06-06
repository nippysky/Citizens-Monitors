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
import { Paths } from "@/constants/paths";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsInfiniteQuery,
} from "@/hooks/api/useNotificationsQueries";
import { AppNotification } from "@/lib/api/notifications.api";
import { Theme } from "@/theme";

type NotificationRecord = AppNotification & Record<string, unknown>;

type ParsedPayload = {
  slug?: string;
  articleSlug?: string;
  newsSlug?: string;
  articleId?: string;
  newsId?: string;
  notificationId?: string;
  type?: string;
  notificationType?: string;
  category?: string;
  screen?: string;
  url?: string;
  deepLink?: string;
  link?: string;
  payload?: unknown;
  metadata?: unknown;
  meta?: unknown;
  data?: unknown;
  body?: unknown;
  message?: unknown;
  description?: unknown;
  subtitle?: unknown;
  content?: unknown;
  [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function tryParseJsonValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return null;

  if (isRecord(value)) return value;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const looksLikeJson =
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    trimmed.includes('\\"slug\\"') ||
    trimmed.includes('\\"articleId\\"') ||
    trimmed.includes('\\"newsId\\"');

  if (!looksLikeJson) return null;

  try {
    const parsed = JSON.parse(trimmed);

    if (typeof parsed === "string") {
      return tryParseJsonValue(parsed, depth + 1);
    }

    return parsed;
  } catch {
    const unescaped = trimmed.replace(/\\"/g, '"');

    if (unescaped !== trimmed) {
      try {
        const parsed = JSON.parse(unescaped);

        if (typeof parsed === "string") {
          return tryParseJsonValue(parsed, depth + 1);
        }

        return parsed;
      } catch {
        return null;
      }
    }

    return null;
  }
}

function tryParseJsonObject(value: unknown): ParsedPayload | null {
  const parsed = tryParseJsonValue(value);

  if (isRecord(parsed)) {
    return parsed as ParsedPayload;
  }

  return null;
}

function extractJsonStringValue(source: string, key: string): string | undefined {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`"${escapedKey}"\\s*:\\s*"([^"]+)"`, "i");
  const match = source.match(regex);

  return match?.[1]?.trim() || undefined;
}

function getStringField(
  source: Record<string, unknown> | null | undefined,
  keys: string[]
): string | undefined {
  if (!source) return undefined;

  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function scanRecordForArticlePayload(
  record: Record<string, unknown>
): ParsedPayload | null {
  for (const value of Object.values(record)) {
    const parsed = tryParseJsonObject(value);

    if (parsed) {
      const slug = getStringField(parsed, [
        "slug",
        "articleSlug",
        "newsSlug",
      ]);

      const articleId = getStringField(parsed, ["articleId", "newsId"]);

      if (slug || articleId) {
        return parsed;
      }
    }

    if (typeof value === "string") {
      const slug = extractJsonStringValue(value, "slug");
      const articleSlug = extractJsonStringValue(value, "articleSlug");
      const newsSlug = extractJsonStringValue(value, "newsSlug");
      const articleId = extractJsonStringValue(value, "articleId");
      const newsId = extractJsonStringValue(value, "newsId");

      if (slug || articleSlug || newsSlug || articleId || newsId) {
        return {
          slug,
          articleSlug,
          newsSlug,
          articleId,
          newsId,
        };
      }
    }
  }

  return null;
}

function getDeepNotificationPayload(item: AppNotification): ParsedPayload {
  const record = item as NotificationRecord;

  const directPayload =
    tryParseJsonObject(record.data) ??
    tryParseJsonObject(record.payload) ??
    tryParseJsonObject(record.metadata) ??
    tryParseJsonObject(record.meta);

  const visiblePayload =
    tryParseJsonObject(record.body) ??
    tryParseJsonObject(record.message) ??
    tryParseJsonObject(record.description) ??
    tryParseJsonObject(record.subtitle) ??
    tryParseJsonObject(record.content);

  const nestedPayload =
    tryParseJsonObject(directPayload?.payload) ??
    tryParseJsonObject(directPayload?.metadata) ??
    tryParseJsonObject(directPayload?.meta) ??
    tryParseJsonObject(directPayload?.data) ??
    tryParseJsonObject(directPayload?.body) ??
    tryParseJsonObject(directPayload?.message);

  const scannedPayload = scanRecordForArticlePayload(record);

  return {
    ...(visiblePayload ?? {}),
    ...(nestedPayload ?? {}),
    ...(directPayload ?? {}),
    ...(scannedPayload ?? {}),
    ...record,
  };
}

function getArticleRouteKey(item: AppNotification): string | null {
  const payload = getDeepNotificationPayload(item);

  const slug = getStringField(payload, [
    "slug",
    "articleSlug",
    "newsSlug",
  ]);

  if (slug) return slug;

  const articleId = getStringField(payload, ["articleId", "newsId"]);

  return articleId ?? null;
}

function getNotificationType(item: AppNotification): string {
  const payload = getDeepNotificationPayload(item);

  const value =
    getStringField(payload, [
      "type",
      "notificationType",
      "category",
      "screen",
    ]) ?? "";

  return value.toLowerCase();
}

function hasArticleMetadata(item: AppNotification): boolean {
  const payload = getDeepNotificationPayload(item);

  return Boolean(
    getStringField(payload, [
      "slug",
      "articleSlug",
      "newsSlug",
      "articleId",
      "newsId",
    ])
  );
}

function isNewsNotification(item: AppNotification): boolean {
  const type = getNotificationType(item);

  if (
    type.includes("news") ||
    type.includes("article") ||
    type.includes("insight")
  ) {
    return true;
  }

  /**
   * Current backend payload for news notifications includes slug/articleId
   * inside the body JSON. Normal app notifications should not use these keys.
   */
  return hasArticleMetadata(item);
}

function normalizeInternalUrl(url?: string): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (
    !trimmed ||
    trimmed === "/" ||
    lower === "citizenmonitors:" ||
    lower === "citizenmonitors://" ||
    lower === "citizenmonitors:///"
  ) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (trimmed.startsWith("citizenmonitors://")) {
    const withoutScheme = trimmed.replace(/^citizenmonitors:\/+/, "/");

    if (!withoutScheme || withoutScheme === "/") return null;

    if (withoutScheme.startsWith("/news/")) {
      return `/(app)${withoutScheme}`;
    }

    if (withoutScheme.startsWith("/notification/")) {
      return `/(app)${withoutScheme}`;
    }

    if (withoutScheme.startsWith("/notifications")) {
      return Paths.appNotifications;
    }

    return withoutScheme;
  }

  return null;
}

function openNotificationRoute(item: AppNotification): void {
  const payload = getDeepNotificationPayload(item);

  /**
   * 1. News/article notifications go to news detail.
   */
  const articleKey = getArticleRouteKey(item);

  if (isNewsNotification(item) && articleKey) {
    router.push(Paths.newsDetails(articleKey) as never);
    return;
  }

  /**
   * 2. Other valid app deep links can still work.
   */
  const explicitUrl =
    getStringField(payload, ["url", "deepLink", "link"]) ?? undefined;

  const normalizedUrl = normalizeInternalUrl(explicitUrl);

  if (normalizedUrl) {
    router.push(normalizedUrl as never);
    return;
  }

  /**
   * 3. Normal non-news notifications go to the notification detail screen.
   * Your actual route is singular:
   * app/(app)/notification/[id].tsx
   */
  router.push(Paths.appNotificationDetails(item.id) as never);
}

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
        // Navigation should not be blocked by read-status update failure.
      });
    }

    openNotificationRoute(item);
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