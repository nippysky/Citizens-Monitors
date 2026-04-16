import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { NotificationItem } from "@/data/notifications";
import { Theme } from "@/theme";

type Props = {
  item: NotificationItem;
  isLast?: boolean;
};

function getIconName(kind: NotificationItem["kind"]): keyof typeof Ionicons.glyphMap {
  switch (kind) {
    case "incident":
      return "warning-outline";
    case "announcement":
      return "megaphone-outline";
    case "update":
      return "notifications-outline";
    case "result":
    default:
      return "checkmark-done-outline";
  }
}

export default function NotificationListItem({ item, isLast = false }: Props) {
  const handlePress = () => {
    router.push(Paths.appNotificationDetails(item.id));
  };

  return (
    <Pressable onPress={handlePress} style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.leftRail}>
        <View style={styles.iconWrap}>
          <Ionicons name={getIconName(item.kind)} size={18} color="#FFFFFF" />
        </View>

        {!isLast ? <View style={styles.connector} /> : <View style={styles.connectorSpacer} />}
      </View>

      <View style={styles.contentWrap}>
        <AppText style={styles.timeText}>{item.timeAgo}</AppText>

        <View style={styles.titleRow}>
          <AppText numberOfLines={2} style={styles.title}>
            {item.title}
          </AppText>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={Theme.colors.textMuted}
          />
        </View>

        {item.actorLabel || item.location ? (
          <View style={styles.metaRow}>
            {item.actorLabel ? (
              <AppText style={styles.actorLabel}>{item.actorLabel}</AppText>
            ) : null}

            {item.location ? (
              <AppText style={styles.locationText}>{item.location}</AppText>
            ) : null}
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
  },

  rowLast: {
    paddingBottom: 8,
  },

  leftRail: {
    width: 30,
    alignItems: "center",
  },

  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  connector: {
    width: 2,
    flex: 1,
    minHeight: 36,
    backgroundColor: Theme.colors.primary,
    marginTop: 4,
  },

  connectorSpacer: {
    height: 6,
  },

  contentWrap: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },

  timeText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
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

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },

  actorLabel: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },

  locationText: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
});