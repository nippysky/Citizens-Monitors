import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { Theme } from "@/theme";
import { NewsItem } from "@/types/home";

type Props = {
  items: NewsItem[];
};

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(Paths.newsDetails(item.id))}
    >
      {/* Placeholder image */}
      <View style={styles.imagePlaceholder}>
        <Ionicons name="newspaper-outline" size={22} color={Theme.colors.textMuted} />
      </View>

      <View style={styles.textBlock}>
        <AppText style={styles.title} numberOfLines={2}>
          {item.title}
        </AppText>
        <View style={styles.dateRow}>
          <View style={styles.dateDot} />
          <AppText style={styles.dateText}>{item.date}</AppText>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Theme.colors.textMuted} />
    </Pressable>
  );
}

export default function LatestNewsSection({ items }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Latest News & Insights</AppText>
        <Pressable onPress={() => router.push(Paths.voterNewsAndInsights)}>
          <AppText style={styles.seeAll}>SEE ALL</AppText>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
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
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },
  dateText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
});