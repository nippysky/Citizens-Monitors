import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { Theme } from "@/theme";
import { DiscussionItem } from "@/types/home";

type Props = {
  items: DiscussionItem[];
};

function DiscussionCard({ item }: { item: DiscussionItem }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(Paths.appPulse)}
    >
      <View style={styles.timeRow}>
        <Ionicons
          name="time-outline"
          size={12}
          color={Theme.colors.textMuted}
        />
        <AppText style={styles.timeText}>{item.timeAgo}</AppText>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.textBlock}>
          <AppText style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </AppText>
          <View style={styles.metaRow}>
            <AppText style={styles.author} numberOfLines={1}>
              {item.author}
            </AppText>
            <AppText style={styles.authorAt}>@</AppText>
            <AppText
              style={styles.pollingUnit}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.pollingUnit}
            </AppText>
          </View>
        </View>

        {/* Thumbnail: real image when available, icon fallback when not. */}
        <View style={styles.thumbWrap}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.thumb}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="image-outline"
              size={20}
              color={Theme.colors.textMuted}
            />
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={Theme.colors.textMuted}
        />
      </View>
    </Pressable>
  );
}

export default function PulseAndDiscourseSection({ items }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Pulse & Discourse</AppText>
        <Pressable onPress={() => router.push(Paths.appPulse)} hitSlop={8}>
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
    letterSpacing: 0.4,
  },
  list: {
    gap: 16,
  },
  card: {
    gap: 6,
  },
  cardPressed: {
    opacity: 0.7,
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
    // minWidth:0 lets long titles truncate cleanly inside a flex row —
    // without it, long unbroken words can push the thumbnail off the card.
    minWidth: 0,
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
    flexShrink: 1,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    // overflow: "hidden" is what makes the Image respect the borderRadius.
    // Without it, the image clips to a square even though the wrapper is rounded.
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
});