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
  const handlePress = () => {
    router.push(Paths.appPulse);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
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

          <View style={styles.engagementRow}>
            <Ionicons
              name="thumbs-up-outline"
              size={12}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.engagementText}>
              {item.likesCount ?? 0}
            </AppText>

            <Ionicons
              name="chatbox-ellipses-outline"
              size={12}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.engagementText}>
              {item.commentsCount ?? 0}
            </AppText>
          </View>
        </View>

        {item.imageUrl ? (
          <View style={styles.thumbWrap}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.thumb}
              resizeMode="cover"
            />
          </View>
        ) : null}

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
  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Pulse & Discourse</AppText>

        <Pressable onPress={() => router.push(Paths.appPulse)} hitSlop={8}>
          <AppText style={styles.seeAll}>SEE ALL</AppText>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.slice(0, 3).map((item) => (
          <DiscussionCard
            key={`${item.source ?? "pulse"}-${item.id}`}
            item={item}
          />
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

  engagementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  engagementText: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.textMuted,
    marginRight: 8,
  },

  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "rgba(17, 24, 39, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  thumb: {
    width: "100%",
    height: "100%",
  },
});