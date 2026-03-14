import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { NewsFeedItem } from "@/data/news";
import { Theme } from "@/theme";

type Props = {
  item: NewsFeedItem;
  isLast?: boolean;
};

export default function NewsFeedCard({ item, isLast = false }: Props) {
  const handlePress = () => {
    router.push(Paths.newsDetails(item.id));
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        !isLast && styles.cardBorder,
        pressed && styles.cardPressed,
      ]}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.textWrap}>
          <AppText style={styles.title} numberOfLines={2}>
            {item.title}
          </AppText>

          <View style={styles.metaRow}>
            <View style={[styles.sourceBadge, { backgroundColor: item.badgeBg }]}>
              <AppText style={styles.sourceBadgeText}>{item.badgeText}</AppText>
            </View>

            <AppText style={styles.sourceText} numberOfLines={1}>
              {item.source}
            </AppText>

            <View style={styles.dot} />

            <AppText style={styles.dateText}>{item.date}</AppText>
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

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },

  cardPressed: {
    opacity: 0.88,
  },

  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 26, 50, 0.08)",
  },

  image: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: "#EEF2F6",
  },

  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  textWrap: {
    flex: 1,
    gap: 8,
  },

  title: {
    fontSize: 18,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },

  sourceBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  sourceBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.bold,
  },

  sourceText: {
    fontSize: 12.5,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
    maxWidth: 110,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },

  dateText: {
    fontSize: 12.5,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  chevronWrap: {
    width: 20,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});