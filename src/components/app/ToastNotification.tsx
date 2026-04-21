import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { handlePermissionAction } from "@/lib/permissions";
import { useNetwork } from "@/context/NetworkContext";
import NotifyPopupBell from "@/svgs/app/NotifyPopupBell";
import { Theme } from "@/theme";

export default function ToastNotification() {
  const { activeToast, dismissToast } = useNetwork();
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);

  useEffect(() => {
    if (activeToast) {
      scale.value = withDelay(
        400,
        withRepeat(
          withTiming(1.04, {
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true
        )
      );
    } else {
      scale.value = withTiming(1, { duration: 160 });
    }
  }, [activeToast, scale]);

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!activeToast) return null;

  const isOffline = activeToast.type === "network-offline";
  const isOnline = activeToast.type === "network-online";

  const bgColor = isOffline
    ? "#FEF2F2"
    : isOnline
      ? "#ECFDF5"
      : "#FFFBEB";

  const borderColor = isOffline
    ? "rgba(220,38,38,0.18)"
    : isOnline
      ? "rgba(16,185,129,0.18)"
      : "rgba(25,183,176,0.18)";

  const iconColor = isOffline
    ? Theme.colors.danger
    : isOnline
      ? Theme.colors.success
      : Theme.colors.primary;

  const baseTabBarHeight = Platform.OS === "ios" ? 64 : 64;
  const bottomInset = Platform.OS === "ios" ? insets.bottom : Math.max(insets.bottom, 8);
  const bottomOffset = baseTabBarHeight + bottomInset + 14;

  const handleDismiss = () => {
    dismissToast();
  };

  const handleAction = () => {
    if (activeToast.actionRoute === "__open_settings__") {
      handlePermissionAction(activeToast.actionRoute);
    } else if (activeToast.actionRoute) {
      router.push(activeToast.actionRoute as any);
    }

    dismissToast();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(320).easing(Easing.out(Easing.cubic))}
      exiting={FadeOut.duration(220)}
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          backgroundColor: bgColor,
          borderColor,
        },
      ]}
    >
      <Pressable
        style={styles.inner}
        onPress={activeToast.actionRoute ? handleAction : handleDismiss}
      >
        <Animated.View style={[styles.iconWrap, animatedIcon]}>
          {isOffline ? (
            <Ionicons name="cloud-offline-outline" size={22} color={iconColor} />
          ) : isOnline ? (
            <Ionicons name="cloud-done-outline" size={22} color={iconColor} />
          ) : (
            <NotifyPopupBell width={26} height={26} />
          )}
        </Animated.View>

        <View style={styles.textWrap}>
          <AppText style={styles.title}>{activeToast.title}</AppText>

          {activeToast.subtitle ? (
            <AppText style={styles.subtitle}>{activeToast.subtitle}</AppText>
          ) : null}

          {activeToast.actionLabel ? (
            <AppText style={styles.actionLabel}>
              {activeToast.actionLabel} →
            </AppText>
          ) : null}
        </View>

        {!isOffline ? (
          <Pressable onPress={handleDismiss} hitSlop={12} style={styles.closeButton}>
            <Ionicons name="close" size={16} color={Theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 10,
    zIndex: 9999,
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },

  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  textWrap: {
    flex: 1,
  },

  title: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  actionLabel: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  closeButton: {
    alignSelf: "flex-start",
    paddingTop: 2,
  },
});