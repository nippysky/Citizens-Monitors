import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { NotificationItem } from "@/data/notifications";
import { Theme } from "@/theme";

type Props = {
  item: NotificationItem;
  isLast?: boolean;
  onPress?: (item: NotificationItem) => void;
};

export default function NotificationListItem({
  item,
  isLast = false,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.leftRail}>
        <View style={styles.iconWrap}>
          <Ionicons name="notifications-outline" size={16} color="#FFFFFF" />
        </View>

        {!isLast ? <View style={styles.line} /> : <View style={styles.lineSpacer} />}
      </View>

      <View style={styles.content}>
        <AppText style={styles.time}>{item.timeAgo}</AppText>

        <View style={styles.titleRow}>
          <AppText style={styles.title} numberOfLines={2}>
            {item.title}
          </AppText>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={Theme.colors.textMuted}
          />
        </View>

        <View style={styles.metaRow}>
          <AppText style={styles.actor}>{item.actorLabel}</AppText>
          <AppText style={styles.location}>{item.location}</AppText>
        </View>
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

  pressed: {
    opacity: 0.88,
  },

  leftRail: {
    width: 50,
    alignItems: "center",
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  line: {
    width: 2,
    flex: 1,
    minHeight: 46,
    marginTop: 6,
    backgroundColor: Theme.colors.primary,
    opacity: 0.9,
    borderRadius: 999,
  },

  lineSpacer: {
    width: 2,
    flex: 1,
    minHeight: 46,
    marginTop: 6,
    opacity: 0,
  },

  content: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },

  time: {
    fontSize: 12.5,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  title: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },

  actor: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  location: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
});