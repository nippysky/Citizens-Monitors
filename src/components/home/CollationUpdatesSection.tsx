import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { Theme } from "@/theme";
import { ElectionUpdateItem } from "@/types/home";

type Props = {
  items: ElectionUpdateItem[];
};

function UpdateCard({
  item,
  onPress,
}: {
  item: ElectionUpdateItem;
  onPress: () => void;
}) {
  const isIncident = item.tag === "INCIDENT";

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* LEFT column: tag, title, time — flex:1 so it shrinks cleanly */}
      <View style={styles.cardContent}>
        <View style={styles.tagRow}>
          <View style={[styles.tagDot, isIncident && styles.tagDotIncident]} />
          <AppText
            style={[styles.tagText, isIncident && styles.tagTextIncident]}
            numberOfLines={1}
          >
            {isIncident ? "INCIDENT" : "RESULT"}
          </AppText>
        </View>

        <AppText
          style={styles.cardTitle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.title}
        </AppText>

        <View style={styles.timeRow}>
          <Ionicons
            name="time-outline"
            size={12}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.timeText} numberOfLines={1}>
            {item.timeAgo}
          </AppText>
        </View>
      </View>

      {/* RIGHT column: chevron in its own dedicated space — cannot overlap content */}
      <View style={styles.chevronWrap}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={Theme.colors.textMuted}
        />
      </View>
    </Pressable>
  );
}

export default function CollationUpdatesSection({ items }: Props) {
  const handleCardPress = (item: ElectionUpdateItem) => {
    // Deep-links into the collation screen on the "review-reports" tab for
    // the specific collation this update belongs to. CollationScreen reads
    // both params via useLocalSearchParams and reacts in its useEffect.
    router.push({
      pathname: Paths.appCollation,
      params: {
        tab: "review-reports",
        collationId: item.collationId,
      },
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Collation updates</AppText>
        <Pressable
          onPress={() => router.push(Paths.appCollation)}
          hitSlop={8}
        >
          <AppText style={styles.seeAll}>SEE ALL</AppText>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => (
          <UpdateCard item={item} onPress={() => handleCardPress(item)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
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
  listContent: {
    paddingHorizontal: 16,
  },

  // Card is a HORIZONTAL row: [content | chevron].
  // This replaces the old absolute-positioned chevron that was overlapping the title.
  card: {
    width: 260,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 10, // tighter on the right since chevronWrap supplies its own breathing room
    gap: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  cardContent: {
    flex: 1,
    gap: 8,
    // minWidth:0 is essential for flex children that contain truncating text.
    // Without it, long unbroken words can force the column wider than intended
    // and shove the chevron past the card edge.
    minWidth: 0,
  },

  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tagDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF4D4D",
  },
  tagDotIncident: {
    backgroundColor: "#FF4D4D",
  },
  tagText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Theme.fonts.body.bold,
    color: "#FF4D4D",
    letterSpacing: 0.4,
  },
  tagTextIncident: {
    color: "#FF4D4D",
  },

  cardTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
    // Lock the title to EXACTLY the height of 2 lines regardless of content.
    // Ensures every card in the row has the same height even when one has a
    // 1-line title and another has a 2-line title. lineHeight (19) × 2 = 38.
    minHeight: 38,
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

  chevronWrap: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
    // No longer absolutely positioned — this is a real flex column now,
    // which is why the title can never bleed into it.
  },
});