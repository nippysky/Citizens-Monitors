// ─── src/components/pulse/PulsePostButton.tsx ────────────────────────────────
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  onPress: () => void;
  collapsed?: boolean;
};

// Position just above the tab bar
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 72;
const BOTTOM_OFFSET = TAB_BAR_HEIGHT + 6;

export default function PulsePostButton({ onPress, collapsed = false }: Props) {
  const expand = useSharedValue(1);

  useEffect(() => {
    expand.value = withTiming(collapsed ? 0 : 1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [collapsed, expand]);

  const containerStyle = useAnimatedStyle(() => ({
    width: interpolate(expand.value, [0, 1], [52, 114]),
    borderRadius: interpolate(expand.value, [0, 1], [26, 16]),
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: expand.value,
    maxWidth: interpolate(expand.value, [0, 1], [0, 60]),
  }));

  return (
    <Animated.View
      style={[styles.outer, { bottom: BOTTOM_OFFSET }, containerStyle]}
    >
      <Pressable onPress={onPress} style={styles.inner}>
        <Entypo name="chat" size={20} color={Theme.colors.white} />
        <Animated.View style={[styles.textWrap, textStyle]}>
          <AppText style={styles.label} numberOfLines={1}>
            Post
          </AppText>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    right: 16,
    height: 52,
    backgroundColor: Theme.colors.primary,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  textWrap: {
    overflow: "hidden",
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.body.semibold,
  },
});