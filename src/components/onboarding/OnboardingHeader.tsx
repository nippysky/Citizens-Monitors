import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import CitizenIcon from "@/svgs/app/CitizenIcon";
import { Theme } from "@/theme";

type Props = {
  step: number;
  total: number;
  onBack?: () => void;
  onHelp?: () => void;
  leading?: "logo" | "back";
};

export default function OnboardingHeader({
  step,
  total,
  onBack,
  onHelp,
  leading = "logo",
}: Props) {
  const progress = useSharedValue(step / total);

  useEffect(() => {
    progress.value = withTiming(step / total, {
      duration: 340,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, step, total]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        {leading === "logo" ? (
          <View style={styles.brandWrap}>
            <CitizenIcon width={28} height={28} />
          </View>
        ) : (
          <Pressable onPress={onBack} hitSlop={8} style={styles.backWrap}>
            <Ionicons
              name="chevron-back"
              size={22}
              color={Theme.colors.text}
            />
            <AppText style={styles.backText}>Go back</AppText>
          </Pressable>
        )}

        <Pressable onPress={onHelp} hitSlop={8} style={styles.helpWrap}>
          <AppText style={styles.helpText}>Get help</AppText>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={Theme.colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.progressBlock}>
        <AppText style={styles.progressLabel}>Complete your profile</AppText>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, fillStyle]} />
          </View>
          <AppText style={styles.progressCount}>
            {step} of {total}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 18,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandWrap: {
    paddingVertical: 4,
  },
  backWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.text,
  },
  helpWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.medium,
  },
  progressBlock: {
    gap: 10,
  },
  progressLabel: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#DDE3EA",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },
  progressCount: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.textMuted,
  },
});