// ─── src/components/app/RouteErrorFallback.tsx ───────────────────────────────
//
// Shared fallback UI for Expo Router's per-route ErrorBoundary export.
//
// Without this, an uncaught render error anywhere in the app produces the
// exact bug the client reported on Collation: the screen goes completely
// blank/black, because nothing renders and there's nothing to fall back to.
//
// Expo Router wraps any route file that exports `ErrorBoundary` in a real
// React error boundary: https://docs.expo.dev/router/error-handling/
// This component is that fallback, reused everywhere so every screen fails
// the same safe way instead of failing silently.

import { Ionicons } from "@expo/vector-icons";
import { type ErrorBoundaryProps } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export default function RouteErrorFallback({ error, retry }: ErrorBoundaryProps) {
  // Errors caught here never reach a crash-reporting step otherwise, so at
  // minimum they land in device logs (adb logcat / Metro) for diagnosis.
  useEffect(() => {
    console.error("[RouteErrorFallback] Screen crashed:", error);
  }, [error]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="alert-circle-outline" size={32} color={Theme.colors.danger} />
        </View>

        <AppText style={styles.title}>Something went wrong</AppText>
        <AppText style={styles.body}>
          This screen ran into a problem loading. You can try again — if it
          keeps happening, let us know what you were doing right before it.
        </AppText>

        {__DEV__ ? (
          <View style={styles.debugBox}>
            <AppText style={styles.debugText} numberOfLines={6}>
              {error.message}
            </AppText>
          </View>
        ) : null}

        <Pressable
          onPress={retry}
          style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
          <AppText style={styles.retryText}>Try Again</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F4EA",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(220,38,38,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 19,
    lineHeight: 25,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
  },
  debugBox: {
    marginTop: 8,
    maxWidth: 320,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(220,38,38,0.06)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.18)",
  },
  debugText: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.danger,
  },
  retryBtn: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 24,
    backgroundColor: Theme.colors.primary,
  },
  retryText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
  pressed: {
    opacity: 0.85,
  },
});
