import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { AppNotification } from "@/lib/api/notifications.api";
import { Theme } from "@/theme";

type Props = {
  item: AppNotification;
  isLast?: boolean;
  onPress?: (item: AppNotification) => void;
};

function getIconName(type: AppNotification["type"]): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "incident-upload":
      return "warning-outline";
    case "result-upload":
      return "checkmark-done-outline";
    case "announcement":
      return "megaphone-outline";
    case "comment":
      return "chatbubble-ellipses-outline";
    case "election":
      return "flag-outline";
    case "update":
    case "system":
    default:
      return "notifications-outline";
  }
}

function getIconColor(type: AppNotification["type"]): string {
  switch (type) {
    case "incident-upload":
      return "#F15A24";
    case "result-upload":
      return Theme.colors.primary;
    case "announcement":
      return "#7C3AED";
    case "comment":
      return "#2563EB";
    case "election":
      return "#0F766E";
    case "update":
    case "system":
    default:
      return Theme.colors.primary;
  }
}

function formatNotificationTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export default function NotificationListItem({
  item,
  isLast = false,
  onPress,
}: Props) {
  const unread = !item.isRead;
  const iconColor = getIconColor(item.type);
  const metaText = item.info || item.message;

  const handlePress = (): void => {
    if (onPress) {
      onPress(item);
      return;
    }

    router.push(Paths.appNotificationDetails(item.id));
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        unread && styles.rowUnread,
        isLast && styles.rowLast,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.leftRail}>
        <View
          style={[
            styles.iconOuterWrap,
            unread && { backgroundColor: `${iconColor}16` },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: iconColor }]}>
            <Ionicons name={getIconName(item.type)} size={18} color="#FFFFFF" />
          </View>
        </View>

        {!isLast ? (
          <View
            style={[
              styles.connector,
              unread && { backgroundColor: iconColor },
            ]}
          />
        ) : (
          <View style={styles.connectorSpacer} />
        )}
      </View>

      <View style={styles.contentWrap}>
        <View style={styles.timeRow}>
          <AppText style={styles.timeText}>
            {formatNotificationTime(item.createdAt)}
          </AppText>

          {unread ? (
            <View style={styles.unreadPill}>
              <View style={styles.unreadDot} />
              <AppText style={styles.unreadText}>Unread</AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.titleRow}>
          <AppText
            numberOfLines={2}
            style={[styles.title, unread && styles.titleUnread]}
          >
            {item.title}
          </AppText>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={Theme.colors.textMuted}
          />
        </View>

        {metaText ? (
          <View style={styles.metaRow}>
            <AppText
              numberOfLines={2}
              style={[styles.locationText, unread && styles.locationUnread]}
            >
              {metaText}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingBottom: 18,
    borderRadius: 18,
  },

  rowUnread: {
    backgroundColor: "rgba(25, 183, 176, 0.045)",
  },

  rowPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.997 }],
  },

  rowLast: {
    paddingBottom: 8,
  },

  leftRail: {
    width: 34,
    alignItems: "center",
    paddingTop: 2,
  },

  iconOuterWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  connector: {
    width: 2,
    flex: 1,
    minHeight: 38,
    backgroundColor: "rgba(25, 183, 176, 0.34)",
    marginTop: 4,
    borderRadius: 99,
  },

  connectorSpacer: {
    height: 6,
  },

  contentWrap: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
    paddingRight: 2,
  },

  timeRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  timeText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  unreadPill: {
    minHeight: 22,
    borderRadius: 999,
    paddingHorizontal: 8,
    backgroundColor: "rgba(25, 183, 176, 0.1)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },

  unreadText: {
    fontSize: 10.5,
    lineHeight: 14,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  title: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  titleUnread: {
    color: "#061A24",
    fontFamily: Theme.fonts.body.semibold,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  locationUnread: {
    color: "rgba(17, 26, 50, 0.78)",
  },
});