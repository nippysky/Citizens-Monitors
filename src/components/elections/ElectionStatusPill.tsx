import { Pressable, StyleSheet } from "react-native";

import AppText from "@/components/ui/AppText";
import type { ElectionStatus } from "@/data/elections";
import { Theme } from "@/theme";

type PillValue = ElectionStatus | "all";

type Props = {
  value: PillValue;
  selected: boolean;
  onPress: () => void;
};

function labelForValue(value: PillValue): string {
  if (value === "all") return "ALL";
  if (value === "live") return "LIVE";
  if (value === "upcoming") return "UPCOMING";
  return "CONCLUDED";
}

export default function ElectionStatusPill({
  value,
  selected,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillActive]}
    >
      <AppText style={[styles.text, selected && styles.textActive]}>
        {labelForValue(value)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8DDE6",
    backgroundColor: "rgba(255,255,255,0.56)",
  },

  pillActive: {
    borderColor: "rgba(25,183,176,0.18)",
    backgroundColor: "rgba(25,183,176,0.12)",
  },

  text: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  textActive: {
    color: Theme.colors.primary,
  },
});