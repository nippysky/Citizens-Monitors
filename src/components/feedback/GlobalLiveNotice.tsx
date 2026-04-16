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
import NotifyPopupBell from "@/svgs/app/NotifyPopupBell";
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
      translateY.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(100, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: 160 }, (done) => {
        if (done && onHide) {
          runOnJS(onHide)();
        }
      });
    }
  }, [visible, translateY, opacity, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    if (onPressAction) {
      onPressAction();
    }
  };

  return (
    <Animated.View
      style={[styles.wrap, { bottom: TAB_BAR_HEIGHT + 10 }, animatedStyle]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Pressable
        onPress={handlePress}
        disabled={!onPressAction}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && onPressAction ? styles.cardPressed : null,
        ]}
      >
        <View style={styles.card}>
          <View style={styles.iconShell}>
            <NotifyPopupBell width={20} height={20} />
          </View>

          <View style={styles.textWrap}>
            <AppText style={styles.message} numberOfLines={2}>
              {message}
            </AppText>

            {actionLabel ? (
              <View style={styles.actionRow}>
                <AppText style={styles.action} numberOfLines={1}>
                  {actionLabel}
                </AppText>
                <AppText style={styles.arrow}>›</AppText>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 999,
  },
  cardPressable: {
    borderRadius: 24,
  },
  cardPressed: {
    opacity: 0.97,
  },
  card: {
    minHeight: 72,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7E3D6",
    backgroundColor: "#FFF8E6",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconShell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1D9",
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  action: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  arrow: {
    fontSize: 14,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});