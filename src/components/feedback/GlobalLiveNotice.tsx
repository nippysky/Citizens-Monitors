import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import NotifyPopupBell from "@/svgs/app/NotifyPopupBell";
import { Theme } from "@/theme";

type Props = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onPressAction?: () => void;
  onHide?: () => void;
  onClose?: () => void;
};

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 96 : 80;

/**
 * Increase/decrease this to match your preferred floating distance
 * above the bottom tab bar.
 */
const NOTICE_FLOAT_GAP = 28;

export default function GlobalLiveNotice({
  visible,
  message,
  actionLabel,
  onPressAction,
  onHide,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const gestureTranslate = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(100, {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: 140 }, (done) => {
        if (done && onHide) {
          runOnJS(onHide)();
        }
      });
    }
  }, [visible, onHide, opacity, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        gestureTranslate.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (gestureTranslate.value > 60) {
        gestureTranslate.value = withTiming(120, { duration: 120 });
        if (onClose) runOnJS(onClose)();
      } else {
        gestureTranslate.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + gestureTranslate.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    onPressAction?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.wrap,
          {
            bottom: TAB_BAR_HEIGHT + insets.bottom + NOTICE_FLOAT_GAP,
          },
          animatedStyle,
        ]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <View style={styles.card}>
          <View style={styles.iconShell}>
            <NotifyPopupBell width={20} height={20} />
          </View>

          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
              styles.textWrap,
              pressed && onPressAction ? styles.cardPressed : null,
            ]}
          >
            <AppText style={styles.message} numberOfLines={2}>
              {message}
            </AppText>

            {actionLabel ? (
              <View style={styles.actionRow}>
                <AppText style={styles.action}>
                  {actionLabel}
                </AppText>
                <AppText style={styles.arrow}>›</AppText>
              </View>
            ) : null}
          </Pressable>

          <Pressable
            onPress={handleClose}
            hitSlop={10}
            style={styles.closeBtn}
          >
            <Ionicons
              name="close"
              size={18}
              color={Theme.colors.textMuted}
            />
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 999,
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

  cardPressed: {
    opacity: 0.95,
  },

  iconShell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1D9",
  },

  textWrap: {
    flex: 1,
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
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  arrow: {
    fontSize: 14,
    color: Theme.colors.primary,
  },

  closeBtn: {
    padding: 4,
    marginLeft: 4,
  },
});