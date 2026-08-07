// ─── src/hooks/useBiometricGate.ts ───────────────────────────────────────────
//
// Biometric App Lock.
//
// This is PURELY a privacy gate, and it is OFF unless the user turns it on in
// Settings → App Lock. It has nothing to do with staying signed in: the
// refresh token handles that silently (see lib/auth/sessionRefresh.ts).
//
//   App Lock OFF (default) → open the app, you're straight in.
//   App Lock ON            → Face ID / fingerprint / PIN before content shows,
//                            on cold start and after a real absence.
//
// A short grace period means hopping to another app to copy a code doesn't
// force a re-unlock.

import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import {
  isAppLockEnabled,
  isDeviceSecurityAvailable,
  promptDeviceAuthentication,
} from "@/lib/auth/appLockPreference";

const SKIP_ONCE_KEY = "biometric_skip_once";
const BACKGROUND_GRACE_MS = 30_000;

/**
 * Suppress the very next gate check — used right after an explicit login, so
 * a user who just proved who they are isn't immediately challenged again.
 */
export async function markFreshBiometricLogin(): Promise<void> {
  try {
    await SecureStore.setItemAsync(SKIP_ONCE_KEY, "1");
  } catch {
    // Worst case: one extra prompt.
  }
}

async function consumeSkipOnce(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(SKIP_ONCE_KEY);
    if (value !== "1") return false;

    await SecureStore.deleteItemAsync(SKIP_ONCE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function useBiometricGate(isAuthenticated: boolean) {
  const [isLocked, setIsLocked] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isAuthenticatingRef = useRef(false);
  const backgroundedAtRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ── Initial gate ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      // Deferred to a microtask so this isn't a synchronous setState inside
      // the effect body (which would trigger a cascading render).
      void Promise.resolve().then(() => {
        if (cancelled) return;
        setIsLocked(false);
        setIsReady(true);
      });

      return () => {
        cancelled = true;
      };
    }

    async function runGate() {
      try {
        const [enabled, available, skipOnce] = await Promise.all([
          isAppLockEnabled(),
          isDeviceSecurityAvailable(),
          consumeSkipOnce(),
        ]);

        // Locked only when the user asked for it AND the device can enforce
        // it AND this isn't the moment right after a login.
        const shouldLock = enabled && available && !skipOnce;

        if (!cancelled) {
          setIsLocked(shouldLock);
          setIsReady(true);
        }
      } catch {
        // Fail OPEN — never trap someone out of their own app.
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

  // ── Re-lock after a genuine absence ───────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const previous = appStateRef.current;
        appStateRef.current = nextState;

        if (nextState === "background" || nextState === "inactive") {
          if (backgroundedAtRef.current === null) {
            backgroundedAtRef.current = Date.now();
          }
          return;
        }

        if (
          nextState === "active" &&
          (previous === "background" || previous === "inactive")
        ) {
          const elapsed = backgroundedAtRef.current
            ? Date.now() - backgroundedAtRef.current
            : Infinity;

          backgroundedAtRef.current = null;

          if (elapsed < BACKGROUND_GRACE_MS) return;

          void (async () => {
            try {
              const [enabled, available] = await Promise.all([
                isAppLockEnabled(),
                isDeviceSecurityAvailable(),
              ]);

              if (enabled && available) setIsLocked(true);
            } catch {
              // Ignore — fail open.
            }
          })();
        }
      }
    );

    return () => subscription.remove();
  }, [isAuthenticated]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (isAuthenticatingRef.current) return false;
    isAuthenticatingRef.current = true;

    try {
      const success = await promptDeviceAuthentication(
        "Unlock Citizen Monitors"
      );

      if (success) setIsLocked(false);

      return success;
    } finally {
      isAuthenticatingRef.current = false;
    }
  }, []);

  return { isLocked, isReady, authenticate };
}
