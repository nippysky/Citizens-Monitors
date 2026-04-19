import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

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
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(Paths.newsDetails(item.id))}
    >
      {/* Thumbnail: real image when available, newspaper icon fallback when not. */}
      <View style={styles.thumbWrap}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.thumb}
            resizeMode="cover"
          />
        ) : (
          <Ionicons
            name="newspaper-outline"
            size={22}
            color={Theme.colors.textMuted}
          />
        )}
      </View>

      <View style={styles.textBlock}>
        <AppText style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {item.title}
        </AppText>
        <View style={styles.dateRow}>
          <View style={styles.dateDot} />
          <AppText style={styles.dateText} numberOfLines={1}>
            {item.date}
          </AppText>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={Theme.colors.textMuted}
      />
    </Pressable>
  );
}

export default function LatestNewsSection({ items }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Latest News & Insights</AppText>
        <Pressable
          onPress={() => router.push(Paths.voterNewsAndInsights)}
          hitSlop={8}
        >
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
    letterSpacing: 0.4,
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
  cardPressed: {
    opacity: 0.7,
  },
  thumbWrap: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    // overflow: "hidden" is what makes the Image respect the borderRadius.
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  textBlock: {
    flex: 1,
    gap: 4,
    // minWidth:0 lets long titles truncate cleanly in the flex row.
    minWidth: 0,
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