import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { Theme } from "@/theme";
import { DiscussionItem } from "@/types/home";

type Props = {
  items: DiscussionItem[];
};

function DiscussionCard({ item }: { item: DiscussionItem }) {
  return (
    <Pressable style={styles.card}>
      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={12} color={Theme.colors.textMuted} />
        <AppText style={styles.timeText}>{item.timeAgo}</AppText>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.textBlock}>
          <AppText style={styles.title} numberOfLines={2}>
            {item.title}
          </AppText>
          <View style={styles.metaRow}>
            <AppText style={styles.author}>{item.author}</AppText>
            <AppText style={styles.authorAt}>@</AppText>
            <AppText style={styles.pollingUnit}>{item.pollingUnit}</AppText>
          </View>
        </View>

        {/* Placeholder for image thumbnail */}
        <View style={styles.thumbPlaceholder}>
          <Ionicons name="image-outline" size={20} color={Theme.colors.textMuted} />
        </View>

        <Ionicons name="chevron-forward" size={16} color={Theme.colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function DiscussionRoomSection({ items }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Discussion room</AppText>
        <Pressable onPress={() => router.push(Paths.appPulse)}>
          <AppText style={styles.seeAll}>SEE ALL</AppText>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.slice(0, 2).map((item) => (
          <DiscussionCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.bold,
    color: Theme.colors.text,
  },
  seeAll: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.primary,
  },
  list: {
    gap: 16,
  },
  card: {
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
    gap: 4,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexWrap: "wrap",
  },
  author: {
    color: Theme.colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
  },
  authorAt: {
    color: Theme.colors.primary,
    fontSize: 12,
    lineHeight: 16,
  },
  pollingUnit: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  thumbPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
});