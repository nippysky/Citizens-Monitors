// ─── src/components/auth/BiometricLockScreen.tsx ─────────────────────────────
//
// Full-screen lock overlay shown when the biometric gate is active.
//
// Platform notes
// ──────────────
// iOS:   Face ID / Touch ID — system dialog appears above the app.
// Android: Fingerprint / Face — rendered as a bottom-sheet dialog by the OS.
//          We delay the auto-prompt by one frame on Android so the overlay
//          is fully laid out before the native dialog appears, preventing a
//          race condition where the dialog is dismissed immediately on some
//          devices.
//
// ─────────────────────────────────────────────────────────────────────────────
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import FullLogo from "@/svgs/app/FullLogo";
import { Theme } from "@/theme";

// ── Types ────────────────────────────────────────────────────────────────────

type BiometricKind = "face" | "fingerprint" | "none";

type Props = {
  /** Called when the user taps "Unlock".  Should call LocalAuthentication. */
  onAuthenticate: () => Promise<boolean>;
  /** Called when the user taps "Use password instead". */
  onUsePassword: () => void;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function useBiometricKind(): BiometricKind {
  const [kind, setKind] = useState<BiometricKind>("none");

  useEffect(() => {
    // supportedAuthenticationTypesAsync reports HARDWARE capability — also
    // confirm something is actually enrolled, otherwise treat as PIN-only.
    Promise.all([
      LocalAuthentication.supportedAuthenticationTypesAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ])
      .then(([types, enrolled]) => {
        if (!enrolled) return; // No biometrics enrolled → device PIN/pattern.

        if (
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setKind("face");
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ) {
          setKind("fingerprint");
        }
      })
      .catch(() => undefined);
  }, []);

  return kind;
}

function getKindLabel(kind: BiometricKind): string {
  if (kind === "face") return "Face ID";
  if (kind === "fingerprint") {
    return Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
  }
  // No biometrics enrolled — the OS prompt verifies the device PIN, pattern
  // or password instead.
  return Platform.OS === "ios" ? "Passcode" : "PIN";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BiometricLockScreen({ onAuthenticate, onUsePassword }: Props) {
  const kind = useBiometricKind();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Ensure auto-prompt fires exactly once per mount.
  const didAutoPrompt = useRef(false);

  const iconName: keyof typeof Ionicons.glyphMap =
    kind === "face"
      ? "scan-outline"
      : kind === "fingerprint"
        ? "finger-print-outline"
        : "keypad-outline";
  const label = getKindLabel(kind);

  // ── Trigger biometric auth ──────────────────────────────────────────────────
  const triggerAuth = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);

    const success = await onAuthenticate();

    // If authentication succeeded the overlay unmounts — no further updates.
    if (!success) {
      setFailed(true);
      setBusy(false);
    }
  };

  // ── Auto-prompt on mount ────────────────────────────────────────────────────
  // Android: delay by one rAF to ensure the native view is fully settled
  // before the fingerprint dialog opens (avoids an immediate dismiss bug on
  // some Android devices).
  useEffect(() => {
    if (didAutoPrompt.current) return;
    didAutoPrompt.current = true;

    if (Platform.OS === "android") {
      // One event-loop tick is enough — rAF is not available in RN.
      const id = setTimeout(() => {
        void triggerAuth();
      }, 100);
      return () => clearTimeout(id);
    }

    void triggerAuth();
    // triggerAuth is stable for the lifetime of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <FullLogo />
        </View>

        {/* Icon + copy */}
        <View style={styles.body}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconName} size={52} color={Theme.colors.primary} />
          </View>

          <AppText style={styles.title}>Welcome back</AppText>

          <AppText style={styles.subtitle}>
            {kind !== "none"
              ? `Use ${label} to unlock Citizen Monitors`
              : "Unlock Citizen Monitors with your device PIN, pattern or password"}
          </AppText>

          {failed ? (
            <AppText style={styles.failText}>
              Authentication failed — please try again.
            </AppText>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => void triggerAuth()}
            disabled={busy}
            style={({ pressed }) => [
              styles.unlockBtn,
              (pressed || busy) && styles.unlockBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Unlock with ${label}`}
          >
            <Ionicons name={iconName} size={20} color="#FFFFFF" />
            <AppText style={styles.unlockBtnText}>
              {busy ? "Verifying…" : `Unlock with ${label}`}
            </AppText>
          </Pressable>

          <Pressable
            onPress={onUsePassword}
            style={({ pressed }) => [styles.passwordBtn, pressed && styles.passwordBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Use password instead"
          >
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.passwordText}>Use password instead</AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
    gap: 14,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(5,163,156,0.10)",
    borderWidth: 1.5,
    borderColor: "rgba(5,163,156,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 280,
  },
  failText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#EF4444",
    textAlign: "center",
    fontFamily: Theme.fonts.body.medium,
  },
  actions: {
    width: "100%",
    gap: 16,
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
