import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onPressAction?: () => void;
  onHide: () => void;
};

export default function GlobalLiveNotice({
  visible,
  message,
  actionLabel,
  onPressAction,
  onHide,
}: Props) {
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 40,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(onHide);
  }, [visible, translateY, opacity, onHide]);

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.wrap,
        {
          bottom: Math.max(insets.bottom + 78, 92),
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.notice}>
        <View style={styles.iconWrap}>
          <Ionicons name="megaphone-outline" size={18} color="#F59E0B" />
        </View>

        <View style={styles.content}>
          <AppText style={styles.message}>{message}</AppText>

          {actionLabel ? (
            <Pressable onPress={onPressAction} hitSlop={8}>
              <AppText style={styles.action}>{actionLabel} &gt;</AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 9998,
  },

  notice: {
    borderRadius: 22,
    backgroundColor: "#FFF9EA",
    borderWidth: 1,
    borderColor: "#E9D8A6",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF1C7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  content: {
    flex: 1,
    gap: 6,
  },

  message: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  action: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});