import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { Theme } from "@/theme";
import { NewsItem } from "@/types/home";

type Props = {
  items: NewsItem[];
};

function NewsCard({ item }: { item: NewsItem }) {
  const [imageFailed, setImageFailed] = useState(false);

  const articleRouteKey = useMemo(() => {
    const slug = item.slug?.trim();
    if (slug) return slug;

    const id = item.id?.trim();
    return id || "";
  }, [item.id, item.slug]);

  const imageUri = useMemo(() => {
    const clean = item.imageUrl?.trim();
    if (!clean || imageFailed) return null;

    return clean;
  }, [imageFailed, item.imageUrl]);

  const handlePress = () => {
    if (!articleRouteKey) {
      router.push(Paths.voterNewsAndInsights);
      return;
    }

    router.push(Paths.newsDetails(articleRouteKey));
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
    >
      <View style={styles.thumbWrap}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.thumb}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
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

        {item.date ? (
          <View style={styles.dateRow}>
            <View style={styles.dateDot} />
            <AppText style={styles.dateText} numberOfLines={1}>
              {item.date}
            </AppText>
          </View>
        ) : null}
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
  const visibleItems = items
    .filter((item) => item.title?.trim())
    .slice(0, 3);

  if (!visibleItems.length) return null;

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
        {visibleItems.map((item) => (
          <NewsCard key={`${item.id}-${item.slug ?? "news"}`} item={item} />
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
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(17, 24, 39, 0.04)",
  },
  textBlock: {
    flex: 1,
    gap: 4,
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