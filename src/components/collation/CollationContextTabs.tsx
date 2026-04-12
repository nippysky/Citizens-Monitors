// ─── src/components/collation/CollationContextTabs.tsx ────────────────────────
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type CollationTabKey = "overview" | "review-reports" | "discussions";

type Props = {
  value: CollationTabKey;
  onChange: (tab: CollationTabKey) => void;
};

const tabs: { key: CollationTabKey; label: string }[] = [
  { key: "overview", label: "OVERVIEW" },
  { key: "review-reports", label: "REVIEW REPORTS" },
  { key: "discussions", label: "DISCUSSIONS" },
];

export default function CollationContextTabs({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={styles.item}
            hitSlop={4}
          >
            <AppText style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </AppText>
            <AnimatedLine active={active} />
          </Pressable>
        );
      })}
    </View>
  );
}

function AnimatedLine({ active }: { active: boolean }) {
  const scale = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    scale.value = withTiming(active ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleX: scale.value }],
    opacity: scale.value,
  }));

  return <Animated.View style={[styles.line, style]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  item: { flex: 1, paddingBottom: 2 },
  label: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  labelActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  line: {
    marginTop: 9,
    height: 2.5,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },
});