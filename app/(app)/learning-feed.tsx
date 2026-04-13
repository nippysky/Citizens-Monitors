// ─── src/app/(app)/learning-feed.tsx ──────────────────────────────────────────
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import { citizenAcademyItems } from "@/data/me";
import { Theme } from "@/theme";
import ShakeHands from "@/svgs/app/ShakeHands";

export default function LearningFeedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const item = useMemo(
    () => citizenAcademyItems.find((a) => a.id === id) ?? citizenAcademyItems[0],
    [id]
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={Theme.colors.text} />
          </Pressable>
          <AppText style={styles.headerTitle}>Learning Feed</AppText>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <ShakeHands width={56} height={56} />
          </View>

          {/* Title */}
          <AppText style={styles.title}>{item.title}</AppText>

          {/* Meta */}
          <View style={styles.metaRow}>
            <AppText style={styles.category}>{item.category}</AppText>
            <View style={styles.dot} />
            <AppText style={styles.readTime}>{item.readTime}</AppText>
          </View>

          {/* Content */}
          <AppText style={styles.body}>{item.content}</AppText>

          <TabBarSpacer />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, lineHeight: 24, color: Theme.colors.text, fontFamily: Theme.fonts.heading.semibold },
  content: { paddingHorizontal: 16, paddingTop: 24, gap: 14 },
  iconWrap: { alignSelf: "flex-start" },
  title: { fontSize: 28, lineHeight: 34, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  category: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted, fontFamily: Theme.fonts.body.medium },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Theme.colors.primary },
  readTime: { fontSize: 13, lineHeight: 18, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  body: { fontSize: 16, lineHeight: 26, color: Theme.colors.text },
});