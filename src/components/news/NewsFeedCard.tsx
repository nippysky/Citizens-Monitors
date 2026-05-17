import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import type { NewsInsightItem } from "@/lib/api/news.api";
import { Theme } from "@/theme";

type Props = {
  item: NewsInsightItem;
  isLast?: boolean;
  onPressIn?: () => void;
};

export default function NewsFeedCard({
  item,
  isLast = false,
  onPressIn,
}: Props) {
  const handlePress = () => {
    router.push(Paths.newsDetails(item.slug));
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={onPressIn}
      style={({ pressed }) => [
        styles.card,
        !isLast && styles.cardBorder,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageWrap}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.image} />
        ) : (
          <Ionicons
            name="newspaper-outline"
            size={24}
            color={Theme.colors.textMuted}
          />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.textWrap}>
          <AppText style={styles.title} numberOfLines={3}>
            {item.title}
          </AppText>

          <View style={styles.dateRow}>
            <View style={styles.dot} />
            <AppText style={styles.dateText}>
              {formatNewsDate(item.publishedAt)}
            </AppText>
          </View>
        </View>

        <View style={styles.chevronWrap}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Theme.colors.textMuted}
          />
        </View>
      </View>
    </Pressable>
  );
}

function formatNewsDate(value?: string): string {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    backgroundColor: "transparent",
  },

  cardPressed: {
    opacity: 0.86,
  },

  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 26, 50, 0.10)",
  },

  imageWrap: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: "#E9ECEF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  textWrap: {
    flex: 1,
    gap: 10,
  },

  title: {
    fontSize: 18,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },

  dateText: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  chevronWrap: {
    width: 20,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});