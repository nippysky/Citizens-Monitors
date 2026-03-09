import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type ToastType = "success" | "error";

type Props = {
  visible: boolean;
  message: string;
  type: ToastType;
  onHide: () => void;
};

export default function GlobalToast({
  visible,
  message,
  type,
  onHide,
}: Props) {
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -20,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(onHide);
    }, 2400);

    return () => clearTimeout(timer);
  }, [onHide, opacity, translateY, visible]);

  if (!visible) return null;

  const isSuccess = type === "success";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top: insets.top + 10,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          isSuccess ? styles.successBg : styles.errorBg,
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            isSuccess ? styles.successCircle : styles.errorCircle,
          ]}
        >
          <Ionicons
            name={isSuccess ? "checkmark" : "close"}
            size={16}
            color="#fff"
          />
        </View>

        <AppText style={styles.message}>{message}</AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "flex-end",
  },

  toast: {
    minHeight: 52,
    maxWidth: 280,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  successBg: {
    backgroundColor: "#DFF3EA",
  },

  errorBg: {
    backgroundColor: "#FDE2E2",
  },

  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  successCircle: {
    backgroundColor: Theme.colors.primary,
  },

  errorCircle: {
    backgroundColor: "#E45858",
  },

  message: {
    color: Theme.colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.medium,
  },
});