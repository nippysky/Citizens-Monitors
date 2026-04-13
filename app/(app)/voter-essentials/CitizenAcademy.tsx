// ─── src/app/(app)/citizen-academy.tsx ────────────────────────────────────────
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import { Paths } from "@/constants/paths";
import { citizenAcademyItems, AcademyItem } from "@/data/me";
import { Theme } from "@/theme";
import ShakeHands from "@/svgs/app/ShakeHands";

export default function CitizenAcademyScreen() {
  const handleItemPress = (item: AcademyItem) => {
    router.push({
      pathname: Paths.appLearningFeed as any,
      params: { id: item.id },
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={Theme.colors.text} />
          </Pressable>
          <AppText style={styles.headerTitle}>Citizen Academy</AppText>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.introBlock}>
            <AppText style={styles.introTitle}>Citizen Academy</AppText>
            <AppText style={styles.introSub}>
              Discover all your need to known about election knowledge and awareness in Nigeria.
            </AppText>
          </View>

          {/* Items */}
          {citizenAcademyItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleItemPress(item)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
            >
              <View style={styles.cardIconWrap}>
                <ShakeHands width={40} height={40} />
              </View>

              <View style={styles.cardContent}>
                <AppText style={styles.cardTitle}>{item.title}</AppText>
                <View style={styles.cardMetaRow}>
                  <AppText style={styles.cardCategory}>{item.category}</AppText>
                  <View style={styles.cardDot} />
                  <AppText style={styles.cardReadTime}>{item.readTime}</AppText>
                </View>
                <AppText style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </AppText>
              </View>

              <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
            </Pressable>
          ))}

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
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  introBlock: { gap: 6, marginBottom: 6 },
  introTitle: { fontSize: 16, lineHeight: 22, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  introSub: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  cardIconWrap: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 15, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardCategory: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted, fontFamily: Theme.fonts.body.medium },
  cardDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Theme.colors.primary },
  cardReadTime: { fontSize: 12, lineHeight: 16, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  cardDesc: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },
});