import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { NotificationItem } from "@/types/home";

type Props = {
  items: NotificationItem[];
};

export default function NotificationList({ items }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText style={styles.sectionTitle}>Notifications</AppText>

      <View style={styles.list}>
        {items.map((item) => (
          <Pressable key={item.id} style={styles.row}>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={12} color={Theme.colors.textMuted} />
              <AppText style={styles.timeText}>{item.timeAgo}</AppText>
            </View>

            <View style={styles.contentRow}>
              <View style={styles.textBlock}>
                <AppText style={styles.title}>{item.title}</AppText>

                <View style={styles.metaRow}>
                  <AppText style={styles.source}>{item.source}</AppText>
                  <Ionicons name="ellipse" size={6} color={Theme.colors.textMuted} />
                  <AppText style={styles.unit}>{item.pollingUnit}</AppText>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={16} color={Theme.colors.textMuted} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
  },
  list: {
    gap: 14,
  },
  row: {
    gap: 6,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  source: {
    color: Theme.colors.primary,
    fontSize: 12,
    lineHeight: 16,
  },
  unit: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});