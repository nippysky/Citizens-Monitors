// ─── src/hooks/useBiometricGate.ts ────────────────────────────────────────────
//
// Architecture
// ───────────
// Three SecureStore keys drive all behaviour:
//
//   biometric_lock_enabled   "1" if the device should require biometrics on
//                            every cold open / foreground resume.
//                            Written the first time a fresh session sees
//                            capable hardware.
//
//   biometric_skip_once      "1" for exactly one gate check after a fresh
//                            email/password or Google login.  Written by
//                            markFreshBiometricLogin() (called from sign-in
//                            and onboarding screens before signIn()).
//                            Deleted immediately on first gate read.
//
// Background grace period
// ──────────────────────
// Coming back from background re-locks the app — but only if the device was
// backgrounded for > BACKGROUND_GRACE_MS.  Switching apps briefly (< 30 s)
// does NOT trigger a new lock.  This prevents constant prompts while, for
// example, copying a password from another app.
//
// ─────────────────────────────────────────────────────────────────────────────
import * as Device from "expo-device";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

// ── Constants ────────────────────────────────────────────────────────────────

const BIOMETRIC_ENABLED_KEY = "biometric_lock_enabled";
const SKIP_ONCE_KEY = "biometric_skip_once";
const BACKGROUND_GRACE_MS = 30_000; // 30 seconds

// ── Module-level security cache ──────────────────────────────────────────────
// Only POSITIVE results are cached: if the user enrolls a PIN/biometric while
// the app is running, the next check picks it up instead of staying stale.
let _securityCache: boolean | null = null;

/**
 * True when the device has ANY security the OS can verify:
 * biometrics (Face ID / Touch ID / fingerprint / face unlock) OR a device
 * credential (PIN, pattern, password / passcode).
 *
 * This intentionally does NOT require biometric enrollment — the product
 * requirement is "lock behind the user's phone security", and
 * authenticateAsync({ disableDeviceFallback: false }) already falls back to
 * the device PIN/pattern/passcode on both platforms.
 */
async function isDeviceSecurityAvailable(): Promise<boolean> {
  if (_securityCache === true) return true;
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    let available = level !== LocalAuthentication.SecurityLevel.NONE;

    // iOS Simulator quirk: LocalAuthentication falsely reports a passcode
    // (SECRET) even when none is set, and shows a fake passcode sheet that
    // accepts any input. On simulators, only trust actual biometric
    // enrollment (Features → Face ID → Enrolled). Real devices are
    // unaffected — a real iPhone without a passcode reports NONE.
    if (
      available &&
      Platform.OS === "ios" &&
      !Device.isDevice &&
      level === LocalAuthentication.SecurityLevel.SECRET
    ) {
      available = false;
    }

    if (available) {
      _securityCache = true;
    }

    return available;
  } catch {
    // Fall back to the biometric-only check if the API is unavailable.
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return false;

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (isEnrolled) {
        _securityCache = true;
      }
      return isEnrolled;
    } catch {
      return false;
    }
  }
}

// ── Public helper (call from sign-in / onboarding BEFORE signIn()) ───────────

/**
 * Mark that the user just authenticated with their password so the biometric
 * gate skips once when it next activates (immediately after login or after
 * onboarding completes).
 */
export async function markFreshBiometricLogin(): Promise<void> {
  try {
    await SecureStore.setItemAsync(SKIP_ONCE_KEY, "1");
  } catch {
    // Non-fatal — the worst case is a spurious lock screen after login.
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBiometricGate(isAuthenticated: boolean) {
  const [isLocked, setIsLocked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Guards against concurrent authenticate() calls (double-tap).
  const isAuthenticatingRef = useRef(false);

  // Tracks when the app was sent to background so we can apply the grace period.
  const backgroundedAtRef = useRef<number | null>(null);

  // Tracks the raw AppState value so we can detect direction of change.
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ── Initial gate ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLocked(false);
      setIsReady(true);
      return;
    }

    let cancelled = false;

    async function runGate() {
      try {
        // ── 1. Fresh-login bypass ──────────────────────────────────────────
        const skipOnce = await SecureStore.getItemAsync(SKIP_ONCE_KEY);
        if (skipOnce === "1") {
          // Clear immediately — it's a one-shot token.
          try {
            await SecureStore.deleteItemAsync(SKIP_ONCE_KEY);
          } catch {
            // Best-effort delete; ignore if it fails.
          }
          if (!cancelled) {
            setIsLocked(false);
            setIsReady(true);
          }
          return;
        }

        // ── 2. Check whether the device-security lock is armed ─────────────
        const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);

        if (enabled !== "1") {
          // First gate check for an existing session — arm the lock if the
          // device has any security (biometrics OR PIN/pattern/password) and
          // lock right away. Fresh logins never reach this point: they are
          // let through by the skip-once token in step 1.
          const available = await isDeviceSecurityAvailable();
          if (available) {
            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "1");
          }
          if (!cancelled) {
            setIsLocked(available);
            setIsReady(true);
          }
          return;
        }

        // ── 3. Verify hardware is still enrolled (user may have removed it) ─
        const available = await isDeviceSecurityAvailable();
        if (!available) {
          if (!cancelled) {
            setIsLocked(false);
            setIsReady(true);
          }
          return;
        }

        // ── 4. Show the lock screen ────────────────────────────────────────
        if (!cancelled) {
          setIsLocked(true);
          setIsReady(true);
        }
      } catch {
        // If SecureStore or LocalAuthentication throws, fail open so the user
        // is never locked out of the app.
        if (!cancelled) {
          setIsLocked(false);
          setIsReady(true);
        }
      }
    }

    void runGate();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // ── Background → foreground re-lock ────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const prev = appStateRef.current;
        appStateRef.current = nextState;

        // Record when we go to background so we can measure elapsed time.
        if (nextState === "background" || nextState === "inactive") {
          if (backgroundedAtRef.current === null) {
            backgroundedAtRef.current = Date.now();
          }
          return;
        }

        // Returning to foreground.
        if (nextState === "active" && (prev === "background" || prev === "inactive")) {
          const elapsed = backgroundedAtRef.current
            ? Date.now() - backgroundedAtRef.current
            : Infinity;
          backgroundedAtRef.current = null;

          // Grace period — don't relock for brief app switches.
          if (elapsed < BACKGROUND_GRACE_MS) return;

          // Re-lock only if biometrics are still enabled + available.
          async function maybeRelock() {
            try {
              const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
              if (enabled !== "1") return;

              const available = await isDeviceSecurityAvailable();
              if (!available) return;

              setIsLocked(true);
            } catch {
              // Ignore — fail open.
            }
          }

          void maybeRelock();
        }
      }
    );

    return () => subscription.remove();
  }, [isAuthenticated]);

  // ── authenticate ────────────────────────────────────────────────────────────
  /**
   * Triggers the OS biometric prompt.  Returns true on success.
   * Guards against concurrent calls (double-tap protection).
   */
  const authenticate = useCallback(async (): Promise<boolean> => {
    if (isAuthenticatingRef.current) return false;
    isAuthenticatingRef.current = true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Verify your identity to continue",
        // iOS: label of the fallback button in the Face ID dialog.
        // Android: ignored (uses its own system UI).
        fallbackLabel: "Use Passcode",
        // Keep device fallback enabled so users with locked biometrics
        // can still enter their PIN / passcode.
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
      }

      return result.success;
    } catch {
      return false;
    } finally {
      isAuthenticatingRef.current = false;
    }
  }, []);

  return { isLocked, isReady, authenticate };
}
