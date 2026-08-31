// Shared floating action button for tab screens (Pulse "Post", Elections
// "Submit Result", …). Expanded = icon + label pill; collapses to a round
// icon-only button while the user scrolls, with a smooth width/radius
// animation. Always floats clear of the absolute bottom tab bar.
import { ReactNode, useEffect } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { useTabBarLayout } from "@/hooks/useTabBarLayout";
import { Theme } from "@/theme";

const COLLAPSED_SIZE = 52;

type Props = {
  onPress: () => void;
  label: string;
  icon: ReactNode;
  collapsed?: boolean;
  /** Full pill width when expanded — depends on label length. */
  expandedWidth?: number;
  accessibilityLabel?: string;
};

export default function FloatingActionButton({
  onPress,
  label,
  icon,
  collapsed = false,
  expandedWidth = 114,
  accessibilityLabel,
}: Props) {
  const { tabBarHeight } = useTabBarLayout();
  const bottomOffset = tabBarHeight + 16;

  const expand = useSharedValue(1);

  useEffect(() => {
    expand.value = withTiming(collapsed ? 0 : 1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [collapsed, expand]);

  const containerStyle = useAnimatedStyle(() => ({
    width: interpolate(expand.value, [0, 1], [COLLAPSED_SIZE, expandedWidth]),
    borderRadius: interpolate(expand.value, [0, 1], [COLLAPSED_SIZE / 2, 16]),
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: expand.value,
    maxWidth: interpolate(
      expand.value,
      [0, 1],
      [0, expandedWidth - COLLAPSED_SIZE],
    ),
  }));

  return (
    <Animated.View
      style={[styles.outer, { bottom: bottomOffset }, containerStyle]}
    >
      <Pressable
        onPress={onPress}
        style={styles.inner}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {icon}
        <Animated.View style={[styles.textWrap, textStyle]}>
          <AppText style={styles.label} numberOfLines={1}>
            {label}
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
    height: COLLAPSED_SIZE,
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
