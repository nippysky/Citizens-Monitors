// ─── src/components/feedback/GlobalLiveNotice.tsx ─────────────────────────────
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onPressAction?: () => void;
  onHide?: () => void;
};

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 96 : 80;

export default function GlobalLiveNotice({
  visible,
  message,
  actionLabel,
  onPressAction,
  onHide,
}: Props) {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 360 });
    } else {
      translateY.value = withTiming(100, { duration: 240, easing: Easing.in(Easing.cubic) });
      opacity.value = withTiming(0, { duration: 240 }, (done) => {
        if (done && onHide) runOnJS(onHide)();
      });
    }
  }, [visible, translateY, opacity, onHide]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.wrap, { bottom: TAB_BAR_HEIGHT + 10 }, animStyle]} pointerEvents={visible ? "auto" : "none"}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <View style={styles.liveDot} />
        </View>
        <View style={styles.textWrap}>
          <AppText style={styles.message} numberOfLines={2}>{message}</AppText>
          {actionLabel ? (
            <Pressable onPress={onPressAction} hitSlop={6}>
              <AppText style={styles.action}>{actionLabel} &gt;</AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, zIndex: 999 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 18, backgroundColor: "#FFF8E6", borderWidth: 1, borderColor: "#F0DFA5",
    paddingHorizontal: 14, paddingVertical: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  iconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(239,68,68,0.12)", alignItems: "center", justifyContent: "center" },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#EF4444" },
  textWrap: { flex: 1, gap: 4 },
  message: { fontSize: 12, lineHeight: 17, color: Theme.colors.text, fontFamily: Theme.fonts.body.medium },
  action: { fontSize: 12, lineHeight: 16, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
});