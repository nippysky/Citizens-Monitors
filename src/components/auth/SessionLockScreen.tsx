// Shown when a returning user's session has expired but their credentials are
// vaulted behind device security. One tap (or the auto-prompt) restores the
// session — no email, no password.
// Design notes
// - Auto-prompts once on mount, like Revolut / Monzo / banking apps.
// - Names the exact unlock method the device offers (Face ID / Touch ID /
// Fingerprint / PIN) so the ask is never ambiguous.
// - Separates "you cancelled" from "we couldn't reach the server" — a network
// failure must not look like a rejected fingerprint.
// - Always offers a password escape hatch.

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import FullLogo from "@/svgs/app/FullLogo";
import { AuthUser } from "@/types/auth";
import { Theme } from "@/theme";

type Props = {
  user: AuthUser | null;
  /** Runs biometric read + silent re-auth. Resolves true on success. */
  onUnlock: () => Promise<boolean>;
  /** Escape hatch — clears the session and shows sign-in. */
  onUsePassword: () => void;
};

function getGreetingName(user: AuthUser | null): string {
  const first = user?.firstName?.trim();
  if (first) return first;

  const email = user?.email?.trim();
  if (email) return email.split("@")[0];

  return "";
}

function getInitials(user: AuthUser | null): string {
  const first = user?.firstName?.trim()?.[0] ?? "";
  const last = user?.lastName?.trim()?.[0] ?? "";
  const combined = `${first}${last}`.trim();

  if (combined) return combined.toUpperCase();

  return (user?.email?.trim()?.[0] ?? "?").toUpperCase();
}

export default function SessionLockScreen({
  user,
  onUnlock,
  onUsePassword,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState("");

  const didAutoPrompt = useRef(false);
  const isMountedRef = useRef(true);

  const name = getGreetingName(user);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const triggerUnlock = async () => {
    if (busy) return;

    setBusy(true);
    setErrorText("");

    try {
      const success = await onUnlock();

      // On success this screen unmounts — no further state updates.
      if (!success && isMountedRef.current) {
        setErrorText(
          "We couldn't restore your session. Check your connection and try again."
        );
      }
    } catch {
      if (isMountedRef.current) {
        setErrorText("Something went wrong. Please try again.");
      }
    } finally {
      if (isMountedRef.current) setBusy(false);
    }
  };

  // Auto-prompt once, mirroring native app-unlock behaviour. Android needs a
  // beat for the view to settle before the OS sheet appears.
  useEffect(() => {
    if (didAutoPrompt.current) return;
    didAutoPrompt.current = true;

    const delay = Platform.OS === "android" ? 220 : 60;
    const timer = setTimeout(() => void triggerUnlock(), delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <FullLogo />
        </View>

        <View style={styles.body}>
          <View style={styles.avatarCircle}>
            <AppText style={styles.avatarText}>{getInitials(user)}</AppText>
          </View>

          <AppText style={styles.title}>
            {name ? `Welcome back, ${name}` : "Welcome back"}
          </AppText>

          <AppText style={styles.subtitle}>
            We couldn’t reach the server to restore your session. Check your
            connection and try again — you won’t need your password.
          </AppText>

          {user?.email ? (
            <View style={styles.accountChip}>
              <Ionicons
                name="person-circle-outline"
                size={15}
                color={Theme.colors.textMuted}
              />
              <AppText style={styles.accountChipText} numberOfLines={1}>
                {user.email}
              </AppText>
            </View>
          ) : null}

          {errorText ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <AppText style={styles.errorText}>{errorText}</AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => void triggerUnlock()}
            disabled={busy}
            style={({ pressed }) => [
              styles.unlockBtn,
              (pressed || busy) && styles.unlockBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Retry restoring your session"
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            )}
            <AppText style={styles.unlockBtnText}>
              {busy ? "Restoring session…" : "Try again"}
            </AppText>
          </Pressable>

          <Pressable
            onPress={onUsePassword}
            disabled={busy}
            style={({ pressed }) => [
              styles.passwordBtn,
              pressed && styles.passwordBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign in with password instead"
          >
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.passwordText}>
              Sign in with password instead
            </AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F4EA",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
    paddingTop: 12,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 8,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(5,163,156,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(5,163,156,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 30,
    lineHeight: 36,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.heading.bold,
  },
  title: {
    fontSize: 25,
    lineHeight: 31,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
  },
  accountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15,23,42,0.05)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    maxWidth: 280,
    marginTop: 2,
  },
  accountChipText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: "rgba(220,38,38,0.07)",
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.18)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    maxWidth: 320,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#B91C1C",
    fontFamily: Theme.fonts.body.medium,
  },
  actions: {
    width: "100%",
    gap: 14,
    alignItems: "center",
  },
  unlockBtn: {
    width: "100%",
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  unlockBtnPressed: {
    opacity: 0.75,
  },
  unlockBtnText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
  passwordBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  passwordBtnPressed: {
    opacity: 0.6,
  },
  passwordText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
});
