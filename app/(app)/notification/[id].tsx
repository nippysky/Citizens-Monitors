import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import {
  notificationQueryKeys,
  useNotificationDetailQuery,
} from "@/hooks/api/useNotificationsQueries";
import { humanizeInfoText } from "@/lib/humanizeInfoText";
import { Theme } from "@/theme";

function formatDetailDate(value?: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getIconName(type?: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "result-upload":
      return "stats-chart-outline";
    case "incident-upload":
      return "warning-outline";
    case "comment":
      return "chatbubble-ellipses-outline";
    case "election":
      return "flag-outline";
    default:
      return "notifications-outline";
  }
}

function getIconTint(type?: string): string {
  switch (type) {
    case "result-upload":
      return Theme.colors.primary;
    case "incident-upload":
      return "#F15A24";
    case "comment":
      return "#7C3AED";
    case "election":
      return "#2563EB";
    default:
      return Theme.colors.textMuted;
  }
}

function NotificationDetailSkeleton() {
  return (
    <View style={styles.contentWrap}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonMeta} />
      <View style={styles.skeletonLineLarge} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineShort} />
    </View>
  );
}

export default function NotificationDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const queryClient = useQueryClient();

  const notificationId = typeof params.id === "string" ? params.id : "";
  const detailQuery = useNotificationDetailQuery(notificationId);

  const notification = detailQuery.data?.notification;

  const iconColor = useMemo(
    () => getIconTint(notification?.type),
    [notification?.type]
  );

  useEffect(() => {
    if (notification) {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.lists,
      });
    }
  }, [notification, queryClient]);

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
        </View>

        <View style={styles.body}>
          {detailQuery.isLoading ? (
            <NotificationDetailSkeleton />
          ) : notification ? (
            <View style={styles.contentWrap}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: `${iconColor}14` },
                ]}
              >
                <Ionicons
                  name={getIconName(notification.type)}
                  size={26}
                  color={iconColor}
                />
              </View>

              <View style={styles.titleBlock}>
                <AppText style={styles.title}>{notification.title}</AppText>

                <View style={styles.metaRow}>
                  <Ionicons
                    name="time-outline"
                    size={15}
                    color={Theme.colors.textMuted}
                  />
                  <AppText style={styles.metaText}>
                    {formatDetailDate(notification.createdAt)}
                  </AppText>
                </View>
              </View>

              {notification.info ? (
                <View style={styles.infoCard}>
                  <AppText style={styles.infoLabel}>Context</AppText>
                  <AppText style={styles.infoText}>
                    {humanizeInfoText(notification.info)}
                  </AppText>
                </View>
              ) : null}

              <View style={styles.messageCard}>
                <AppText style={styles.messageLabel}>Message</AppText>
                <AppText style={styles.bodyText}>
                  {notification.message}
                </AppText>
              </View>

              <View style={styles.statusPill}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.statusText}>Marked as read</AppText>
              </View>
            </View>
          ) : (
            <View style={styles.fallbackWrap}>
              <View style={styles.fallbackIcon}>
                <Ionicons
                  name="notifications-off-outline"
                  size={30}
                  color={Theme.colors.textMuted}
                />
              </View>
              <AppText style={styles.fallbackTitle}>
                Notification not found
              </AppText>
              <AppText style={styles.fallbackText}>
                This notification may have been removed or is no longer
                available.
              </AppText>
            </View>
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
    paddingBottom: 10,
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
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 6,
  },
  contentWrap: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 32,
    gap: 18,
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    gap: 10,
  },
  title: {
    fontSize: 24,
    lineHeight: 31,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    maxWidth: 360,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  infoCard: {
    borderRadius: 20,
    backgroundColor: "rgba(25,183,176,0.075)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.15)",
    paddingHorizontal: 15,
    paddingVertical: 14,
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 23,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  messageCard: {
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "rgba(17,26,50,0.07)",
    paddingHorizontal: 15,
    paddingVertical: 16,
    gap: 8,
  },
  messageLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 27,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  statusPill: {
    alignSelf: "flex-start",
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "rgba(25,183,176,0.09)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.16)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusText: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  fallbackWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  fallbackIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(17,26,50,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  fallbackTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  fallbackText: {
    fontSize: 15,
    lineHeight: 24,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
  },
  skeletonIcon: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: "rgba(17,26,50,0.07)",
  },
  skeletonTitle: {
    width: "82%",
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(17,26,50,0.07)",
  },
  skeletonMeta: {
    width: 160,
    height: 13,
    borderRadius: 999,
    backgroundColor: "rgba(17,26,50,0.055)",
  },
  skeletonLineLarge: {
    width: "100%",
    height: 90,
    borderRadius: 20,
    backgroundColor: "rgba(17,26,50,0.055)",
  },
  skeletonLine: {
    width: "90%",
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(17,26,50,0.05)",
  },
  skeletonLineShort: {
    width: "58%",
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(17,26,50,0.045)",
  },
});