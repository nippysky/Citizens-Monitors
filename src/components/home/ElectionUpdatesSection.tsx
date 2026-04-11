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

function UpdateCard({ item }: { item: ElectionUpdateItem }) {
  const isIncident = item.tag === "INCIDENT";

  return (
    <Pressable style={styles.card}>
      <View style={styles.tagRow}>
        <View style={[styles.tagDot, isIncident && styles.tagDotIncident]} />
        <AppText style={[styles.tagText, isIncident && styles.tagTextIncident]}>
          {isIncident ? "INCIDENT" : "RESULT"}
        </AppText>
      </View>

      <AppText style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </AppText>

      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={12} color={Theme.colors.textMuted} />
        <AppText style={styles.timeText}>{item.timeAgo}</AppText>
      </View>

      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={16} color={Theme.colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function ElectionUpdatesSection({ items }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Election updates</AppText>
        <Pressable onPress={() => router.push(Paths.appElections)}>
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
        renderItem={({ item }) => <UpdateCard item={item} />}
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
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: 240,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    padding: 14,
    gap: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
  },
  tagTextIncident: {
    color: "#FF4D4D",
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
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
    position: "absolute",
    right: 12,
    top: "50%",
  },
});