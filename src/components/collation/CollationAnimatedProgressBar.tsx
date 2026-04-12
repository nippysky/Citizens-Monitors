// ─── src/components/collation/CollationAnimatedProgressBar.tsx ────────────────
// Fixed: no longer reads shared value during render.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

type Props = {
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
  /** Use flat edges (no border-radius) for vote buying / intimidation bars */
  flat?: boolean;
};

export default function CollationAnimatedProgressBar({
  progress,
  height = 7,
  color = "#05A39C",
  trackColor = "#E8ECF2",
  flat = false,
}: Props) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(
      Math.min(Math.max(progress, 0), 100),
      { duration: 1200, easing: Easing.out(Easing.cubic) }
    );
  }, [progress, animatedProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  const radius = flat ? 0 : height;

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: radius, backgroundColor: trackColor },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, borderRadius: radius },
          fillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", overflow: "hidden" },
  fill: { height: "100%" },
});