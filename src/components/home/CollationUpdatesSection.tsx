import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { Theme } from "@/theme";
import { ElectionUpdateItem } from "@/types/home";

type Props = {
  items: ElectionUpdateItem[];
};

function getIconName(tag: ElectionUpdateItem["tag"]): keyof typeof Ionicons.glyphMap {
  return tag === "INCIDENT" ? "warning-outline" : "checkmark-done-outline";
}

function getTagColor(tag: ElectionUpdateItem["tag"]): string {
  return tag === "INCIDENT" ? "#EF4444" : Theme.colors.primary;
}

function UpdateCard({ item }: { item: ElectionUpdateItem }) {
  const color = getTagColor(item.tag);

  const handlePress = () => {
    router.push({
      pathname: Paths.appCollation as never,
      params: {
        tab: item.tag === "INCIDENT" ? "review-reports" : "overview",
        collationId: item.collationId,
        activeElectionId: item.collationId,
        electionId: item.collationId,
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={getIconName(item.tag)} size={18} color={color} />
      </View>

      <View style={styles.textBlock}>
        <View style={styles.metaRow}>
          <AppText style={[styles.tagText, { color }]}>{item.tag}</AppText>
          <View style={styles.metaDot} />
          <AppText style={styles.timeText}>{item.timeAgo}</AppText>
        </View>

        <AppText style={styles.title} numberOfLines={2}>
          {item.title}
        </AppText>

        {item.info ? (
          <AppText style={styles.info} numberOfLines={1}>
            {item.info}
          </AppText>
        ) : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color={Theme.colors.textMuted}
      />
    </Pressable>
  );
}

export default function CollationUpdatesSection({ items }: Props) {
  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Election Updates</AppText>

        <Pressable onPress={() => router.push(Paths.appCollation)} hitSlop={8}>
          <AppText style={styles.seeAll}>SEE ALL</AppText>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.slice(0, 4).map((item) => (
          <UpdateCard key={item.id} item={item} />
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
    gap: 12,
  },
  card: {
    minHeight: 74,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(17,26,50,0.07)",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardPressed: {
    opacity: 0.76,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tagText: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: Theme.fonts.body.semibold,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: Theme.colors.textMuted,
    opacity: 0.45,
  },
  timeText: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.textMuted,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  info: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
});