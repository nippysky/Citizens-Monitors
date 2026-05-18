import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { PressCoverageItem } from "@/data/pressCoverage";
import { Theme } from "@/theme";

type Props = {
  item: PressCoverageItem;
  isLast?: boolean;
};

export default function PressCoverageFeedCard({
  item,
  isLast = false,
}: Props) {
  const handlePress = () => {
    router.push(Paths.pressCoverageDetails(item.slug));
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
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imageFallback}>
          <Ionicons
            name="megaphone-outline"
            size={24}
            color={Theme.colors.textMuted}
          />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.textWrap}>
          <AppText style={styles.title} numberOfLines={3}>
            {item.title}
          </AppText>

          <View style={styles.metaRow}>
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
    paddingVertical: 18,
  },

  cardPressed: {
    opacity: 0.88,
  },

  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 26, 50, 0.08)",
  },

  image: {
    width: 86,
    height: 74,
    borderRadius: 12,
    backgroundColor: "#EEF2F6",
  },

  imageFallback: {
    width: 86,
    height: 74,
    borderRadius: 12,
    backgroundColor: "#EEF2F6",
    alignItems: "center",
    justifyContent: "center",
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
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  metaRow: {
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