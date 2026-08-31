// Red solid border for "Complete your profile" (observer pending)
// Green dashed border for "Observer Registration" (volunteer)

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import Observer from "@/svgs/app/Observer";
import ShakeHands from "@/svgs/app/ShakeHands";
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
        {isComplete ? (
          <ShakeHands width={44} height={44} />
        ) : (
          <Observer width={44} height={44} />
        )}
      </View>

      <View style={styles.center}>
        <AppText style={[styles.title, isComplete ? styles.titleRed : styles.titleGreen]}>
          {banner.title}
        </AppText>
        <AppText style={styles.subtitle}>{banner.subtitle}</AppText>
      </View>

      <Ionicons name="chevron-forward" size={18} color="rgba(17,26,50,0.52)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    marginTop: 4,
  },

  // Observer pending: solid red border, soft red bg
  cardRed: {
    backgroundColor: "rgba(220, 38, 38, 0.03)",
    borderWidth: 1.5,
    borderColor: "rgba(220, 38, 38, 0.35)",
    borderStyle: "solid",
  },

  // Volunteer: dashed green border, soft green bg
  cardGreen: {
    backgroundColor: "rgba(5, 163, 156, 0.03)",
    borderWidth: 1.5,
    borderColor: "rgba(5, 163, 156, 0.4)",
    borderStyle: "dashed",
  },

  pressed: { opacity: 0.88 },

  left: { alignItems: "center", justifyContent: "center" },

  center: { flex: 1, gap: 2 },

  title: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
  titleRed: { color: "#DC2626" },
  titleGreen: { color: Theme.colors.primary },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(17,26,50,0.68)",
    fontFamily: Theme.fonts.body.medium,
  },
});