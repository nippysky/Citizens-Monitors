// ─── src/components/me/MeProfileCard.tsx ──────────────────────────────────────
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import Observer from "@/svgs/app/Observer";
import { Theme } from "@/theme";
import type { MeBannerConfig } from "@/data/me";

type Props = {
  banner: MeBannerConfig;
  onPress?: () => void;
};

export default function MeProfileCard({ banner, onPress }: Props) {
  if (!banner.show) return null;

  const isComplete = banner.type === "complete-profile";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isComplete ? styles.cardRed : styles.cardGreen,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.left}>
          <Observer width={44} height={44} />
      </View>

      <View style={styles.center}>
        <AppText style={[styles.title, isComplete ? styles.titleRed : styles.titleGreen]}>
          {banner.title}
        </AppText>
        <AppText style={styles.subtitle}>{banner.subtitle}</AppText>
      </View>

      <Ionicons name="chevron-forward" size={18} color="rgba(17,26,50,0.62)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1.5,
  },
  cardRed: {
    backgroundColor: "rgba(220, 38, 38, 0.04)",
    borderColor: "rgba(220, 38, 38, 0.3)",
  },
  cardGreen: {
    backgroundColor: "rgba(5, 163, 156, 0.04)",
    borderColor: "rgba(5, 163, 156, 0.3)",
  },
  pressed: { opacity: 0.9 },
  left: { alignItems: "center", justifyContent: "center" },
  center: { flex: 1, gap: 2 },
  title: { fontSize: 14, lineHeight: 18, fontFamily: Theme.fonts.body.semibold },
  titleRed: { color: "#DC2626" },
  titleGreen: { color: Theme.colors.primary },
  subtitle: { fontSize: 12, lineHeight: 18, color: "rgba(17,26,50,0.72)", fontFamily: Theme.fonts.body.medium },
});