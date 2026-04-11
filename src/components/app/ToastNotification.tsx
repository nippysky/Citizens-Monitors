import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
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
import { useNetwork } from "@/context/NetworkContext";
import NotifyPopupBell from "@/svgs/app/NotifyPopupBell";
import { Theme } from "@/theme";

export default function ToastNotification() {
  const { activeToast, dismissToast } = useNetwork();

  const bellScale = useSharedValue(1);

  useEffect(() => {
    if (activeToast) {
      bellScale.value = withDelay(
        600,
        withRepeat(
          withTiming(1.04, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        )
      );
    } else {
      bellScale.value = 1;
    }
  }, [activeToast, bellScale]);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellScale.value }],
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
    ? "rgba(220, 38, 38, 0.2)"
    : isOnline
      ? "rgba(16, 185, 129, 0.2)"
      : "rgba(25, 183, 176, 0.18)";

  const iconColor = isOffline
    ? Theme.colors.danger
    : isOnline
      ? Theme.colors.success
      : Theme.colors.primary;

  // Tab bar height + some padding
  const tabBarH = Platform.OS === "ios" ? 88 : 72;
  const bottomOffset = tabBarH + 10;

  const handleAction = () => {
    if (activeToast.actionRoute) {
      router.push(activeToast.actionRoute as any);
    }
    dismissToast();
  };

  return (
    <Animated.View
      entering={FadeIn.duration(380).easing(Easing.out(Easing.cubic)).withInitialValues({ opacity: 0, transform: [{ translateY: 40 }] })}
      exiting={FadeOut.duration(260).easing(Easing.in(Easing.cubic)).withInitialValues({ opacity: 1, transform: [{ translateY: 0 }] })}
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          backgroundColor: bgColor,
          borderColor,
        },
      ]}
      collapsable={false}
    >
      <Pressable
        style={styles.inner}
        onPress={activeToast.actionRoute ? handleAction : dismissToast}
      >
        {/* Icon */}
        <Animated.View style={[styles.iconWrap, bellStyle]}>
          {isOffline ? (
            <Ionicons name="cloud-offline-outline" size={22} color={iconColor} />
          ) : isOnline ? (
            <Ionicons name="cloud-done-outline" size={22} color={iconColor} />
          ) : (
            <NotifyPopupBell width={28} height={28} />
          )}
        </Animated.View>

        {/* Text */}
        <View style={styles.textWrap}>
          <AppText style={styles.title} numberOfLines={2}>
            {activeToast.title}
          </AppText>
          {activeToast.subtitle ? (
            <AppText style={styles.subtitle} numberOfLines={1}>
              {activeToast.subtitle}
            </AppText>
          ) : null}
          {activeToast.actionLabel ? (
            <Pressable onPress={handleAction}>
              <AppText style={styles.actionLabel}>
                {activeToast.actionLabel}{" "}
                <Ionicons name="chevron-forward" size={12} color={Theme.colors.primary} />
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {/* Dismiss */}
        {!isOffline && (
          <Pressable
            onPress={dismissToast}
            hitSlop={12}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={16} color={Theme.colors.textMuted} />
          </Pressable>
        )}
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
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    zIndex: 9999,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    gap: 2,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
  actionLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    marginTop: 2,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});