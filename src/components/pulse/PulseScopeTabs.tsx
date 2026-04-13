// ─── src/components/pulse/PulseScopeTabs.tsx ──────────────────────────────────
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type PulseTabKey = "for-you" | "review-collation";

type Props = {
  value: PulseTabKey;
  onChange: (tab: PulseTabKey) => void;
  reviewCount?: number;
};

export default function PulseScopeTabs({
  value,
  onChange,
  reviewCount = 0,
}: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange("for-you")}
        style={[styles.pill, value === "for-you" && styles.pillActive]}
      >
        <AppText
          style={[
            styles.pillText,
            value === "for-you" && styles.pillTextActive,
          ]}
        >
          FOR YOU
        </AppText>
      </Pressable>

      <Pressable
        onPress={() => onChange("review-collation")}
        style={[
          styles.pill,
          value === "review-collation" && styles.pillActive,
        ]}
      >
        <AppText
          style={[
            styles.pillText,
            value === "review-collation" && styles.pillTextActive,
          ]}
        >
          REVIEW COLLATION{reviewCount > 0 ? ` (${reviewCount})` : ""}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  // Inactive: transparent bg, subtle border
  pill: {
    minHeight: 36,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
  },

  // Active: solid teal fill, no border visible
  pillActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },

  pillText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  pillTextActive: {
    color: Theme.colors.white,
  },
});