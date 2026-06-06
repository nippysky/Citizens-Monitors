import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";
import { AppNotification } from "@/lib/api/notifications.api";
import { Theme } from "@/theme";

type Props = {
  items: AppNotification[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onPressItem?: (item: AppNotification) => void;
  ListFooterComponent?: React.ReactElement | null;
};

type NotificationRecord = AppNotification & Record<string, unknown>;

function getStringField(
  item: NotificationRecord,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function getNotificationTitle(item: AppNotification): string {
  const record = item as NotificationRecord;

  return (
    getStringField(record, ["title", "heading", "subject", "name"]) ??
    "Notification"
  );
}

function getNotificationDateValue(item: AppNotification): string | undefined {
  const record = item as NotificationRecord;

  return getStringField(record, [
    "createdAt",
    "created_at",
    "sentAt",
    "sent_at",
    "updatedAt",
    "updated_at",
    "date",
  ]);
}

function formatRelativeTime(value?: string): string {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isUnread(item: AppNotification): boolean {
  const record = item as NotificationRecord;

  if (typeof record.isRead === "boolean") return !record.isRead;
  if (typeof record.read === "boolean") return !record.read;

  return false;
}

export default function NotificationList({
  items,
  refreshing = false,
  onRefresh,
  onEndReached,
  onPressItem,
  ListFooterComponent,
}: Props) {
  const renderItem = ({ item, index }: ListRenderItemInfo<AppNotification>) => {
    const title = getNotificationTitle(item);
    const timeLabel = formatRelativeTime(getNotificationDateValue(item));
    const unread = isUnread(item);
    const isLast = index === items.length - 1;

    return (
      <Pressable
        onPress={() => onPressItem?.(item)}
        style={({ pressed }) => [
          styles.item,
          pressed && styles.itemPressed,
        ]}
      >
        <View style={styles.timelineCol}>
          <View style={[styles.iconWrap, unread && styles.iconWrapUnread]}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#FFFFFF"
            />
          </View>

          {!isLast ? <View style={styles.timelineLine} /> : null}
        </View>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <AppText style={styles.timeText}>{timeLabel}</AppText>

            {unread ? <View style={styles.unreadDot} /> : null}
          </View>

          <AppText numberOfLines={2} style={styles.title}>
            {title}
          </AppText>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color={Theme.colors.textMuted}
          style={styles.chevron}
        />
      </Pressable>
    );
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) => {
        const record = item as NotificationRecord;
        const id =
          typeof record.id === "string" && record.id.trim().length > 0
            ? record.id
            : `notification-${index}`;

        return id;
      }}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.45}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        ) : undefined
      }
      contentContainerStyle={styles.listContent}
      ListFooterComponent={ListFooterComponent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 18,
    paddingBottom: 28,
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  itemPressed: {
    opacity: 0.72,
  },

  timelineCol: {
    width: 50,
    alignItems: "center",
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  iconWrapUnread: {
    backgroundColor: Theme.colors.primary,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 54,
    marginTop: 10,
    backgroundColor: "rgba(25,183,176,0.28)",
  },

  content: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
    paddingRight: 10,
  },

  metaRow: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  timeText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },

  title: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  chevron: {
    marginTop: 36,
  },
});