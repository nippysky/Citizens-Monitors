// ─── src/components/app/NotificationsGate.tsx ───────────────────────────────
// Side-effect-only component that owns the entire push notification lifecycle:
//   - Acquires the Expo push token on mount
//   - Re-acquires when push token truly rotates
//   - Syncs token to backend after user is authenticated
//   - Handles foreground notifications, taps, and cold-start tap routing
//
// Must be rendered INSIDE AuthProvider so it can react to auth state.

import { Alert } from "react-native";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { registerPushToken } from "@/lib/api/pushToken.api";
import {
  AppNotificationData,
  addExpoPushTokenListener,
  addForegroundNotificationListener,
  addNotificationResponseListener,
  canRegisterForRemotePushNotifications,
  clearLastNotificationResponseAsync,
  getLastNotificationResponseAsync,
  getNotificationDataFromResponse,
  registerForPushNotificationsAsync,
} from "@/lib/notifications";

// ─── DEV-ONLY toggles ────────────────────────────────────────────────────────
// Both are gated by __DEV__, so neither affects production builds.

const DEV_SHOW_TOKEN_ALERT = false;
const DEV_LOG_FOREGROUND_NOTIFICATIONS = false;

// Keeps the boot token log once per JS runtime, even with React StrictMode or
// quick remounts during development.
let devLoggedExpoToken: string | null = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function serializeNativePushToken(token: unknown): string | null {
  if (!token || typeof token !== "object") return null;

  const maybeToken = token as {
    type?: unknown;
    data?: unknown;
  };

  try {
    const type =
      typeof maybeToken.type === "string" ? maybeToken.type : "unknown";

    const data =
      typeof maybeToken.data === "string"
        ? maybeToken.data
        : JSON.stringify(maybeToken.data);

    if (!data) return null;

    return `${type}:${data}`;
  } catch {
    return null;
  }
}

// ─── Notification tap routing ────────────────────────────────────────────────

function handleNotificationRoute(data: AppNotificationData | null): void {
  if (!data) return;

  if (typeof data.url === "string" && data.url.length > 0) {
    router.push(data.url as never);
    return;
  }

  if (data.type === "result-submitted" && typeof data.collationId === "string") {
    router.push({
      pathname: "/(app)/election/[id]",
      params: { id: data.collationId },
    } as never);
    return;
  }

  if (data.type === "incident-reported" && typeof data.electionId === "string") {
    router.push({
      pathname: "/(app)/election/[id]",
      params: { id: data.electionId },
    } as never);
    return;
  }

  if (data.type === "polling-unit-alert") {
    router.push("/(app)/notifications" as never);
    return;
  }

  if (data.type === "discussion-reply") {
    router.push("/(app)/notifications" as never);
    return;
  }

  router.push("/(app)/notifications" as never);
}

// ─── Backend sync helper ─────────────────────────────────────────────────────

async function syncTokenToBackend(token: string): Promise<boolean> {
  try {
    await registerPushToken(token);

    if (__DEV__) {
      console.log("[NotificationsGate] token synced to backend");
    }

    return true;
  } catch (err) {
    if (__DEV__) {
      console.warn("[NotificationsGate] backend sync failed:", err);
    }

    return false;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NotificationsGate(): null {
  const { isAuthenticated, token: authToken } = useAuth();

  const isAuthenticatedRef = useRef(isAuthenticated);
  const authTokenRef = useRef<string | null>(authToken ?? null);

  // Latest acquired Expo push token, updated on acquisition + true rotation.
  const currentExpoTokenRef = useRef<string | null>(null);

  // Last token we successfully POSTed to the backend.
  const lastSyncedTokenRef = useRef<string | null>(null);

  // Prevents duplicate backend POSTs for the same token while a request is still
  // in-flight.
  const syncInFlightTokenRef = useRef<string | null>(null);

  // Prevents token-rotation callbacks from repeatedly re-entering registration.
  const rotationRefreshInFlightRef = useRef(false);

  // Stores the last native APNs/FCM token event we handled. If Expo emits the
  // same native token repeatedly, we ignore the duplicates.
  const lastNativePushTokenRef = useRef<string | null>(null);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    authTokenRef.current = authToken ?? null;
  }, [isAuthenticated, authToken]);

  const syncCurrentTokenIfNeeded = useCallback((): void => {
    const expoToken = currentExpoTokenRef.current;

    if (!isAuthenticatedRef.current) return;
    if (!authTokenRef.current) return;
    if (!expoToken) return;

    if (lastSyncedTokenRef.current === expoToken) return;
    if (syncInFlightTokenRef.current === expoToken) return;

    syncInFlightTokenRef.current = expoToken;

    void syncTokenToBackend(expoToken)
      .then((synced) => {
        if (!synced) return;

        // Only mark as synced if this is still the active token.
        if (currentExpoTokenRef.current === expoToken) {
          lastSyncedTokenRef.current = expoToken;
        }
      })
      .finally(() => {
        if (syncInFlightTokenRef.current === expoToken) {
          syncInFlightTokenRef.current = null;
        }
      });
  }, []);

  // ─── Effect 1: bootstrap + listeners ──────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const boot = async (): Promise<void> => {
      const expoToken = await registerForPushNotificationsAsync();

      if (!mounted) return;

      if (expoToken) {
        currentExpoTokenRef.current = expoToken;

        if (__DEV__ && devLoggedExpoToken !== expoToken) {
          devLoggedExpoToken = expoToken;

          console.log(
            "\n========== EXPO PUSH TOKEN ==========\n" +
              expoToken +
              "\n=====================================\n"
          );

          if (DEV_SHOW_TOKEN_ALERT) {
            Alert.alert("Expo Push Token (DEV)", expoToken);
          }
        }

        // Handles the race where auth was already restored before token
        // acquisition completed.
        syncCurrentTokenIfNeeded();
      }

      // Handle cold-start: app was opened from killed state via notification tap.
      try {
        const lastResponse = await getLastNotificationResponseAsync();

        if (mounted && lastResponse) {
          const data = getNotificationDataFromResponse(lastResponse);
          handleNotificationRoute(data);
          await clearLastNotificationResponseAsync();
        }
      } catch (err) {
        if (__DEV__) {
          console.warn("[NotificationsGate] cold-start handling failed:", err);
        }
      }
    };

    void boot();

    // Foreground notifications: the system banner shows automatically via
    // setNotificationHandler in lib/notifications.ts. This listener is for
    // optional side effects only.
    const foregroundSub = addForegroundNotificationListener((notification) => {
      if (__DEV__ && DEV_LOG_FOREGROUND_NOTIFICATIONS) {
        console.log(
          "[NotificationsGate] foreground notification:",
          notification.request.content
        );
      }
    });

    // Tap response: user tapped a notification from tray, banner, or lock screen.
    const responseSub = addNotificationResponseListener((response) => {
      const data = getNotificationDataFromResponse(response);
      handleNotificationRoute(data);
    });

    // Do not subscribe to token rotation on unsupported simulator push flow.
    const tokenSub = canRegisterForRemotePushNotifications()
      ? addExpoPushTokenListener((nativeToken) => {
          const nativeTokenKey = serializeNativePushToken(nativeToken);

          if (
            nativeTokenKey &&
            lastNativePushTokenRef.current === nativeTokenKey
          ) {
            return;
          }

          if (nativeTokenKey) {
            lastNativePushTokenRef.current = nativeTokenKey;
          }

          if (rotationRefreshInFlightRef.current) {
            return;
          }

          rotationRefreshInFlightRef.current = true;

          void registerForPushNotificationsAsync({ forceRefresh: true })
            .then((newExpoToken) => {
              if (!mounted || !newExpoToken) return;

              const previousExpoToken = currentExpoTokenRef.current;

              // Critical loop-breaker: do not treat the same Expo token as a
              // real rotation.
              if (previousExpoToken === newExpoToken) {
                return;
              }

              currentExpoTokenRef.current = newExpoToken;
              lastSyncedTokenRef.current = null;

              if (__DEV__) {
                console.log(
                  "[NotificationsGate] Expo push token changed:",
                  newExpoToken
                );
              }

              syncCurrentTokenIfNeeded();
            })
            .finally(() => {
              rotationRefreshInFlightRef.current = false;
            });
        })
      : null;

    return () => {
      mounted = false;
      foregroundSub.remove();
      responseSub.remove();
      tokenSub?.remove();
    };
  }, [syncCurrentTokenIfNeeded]);

  // ─── Effect 2: sync when auth becomes ready ────────────────────────────────

  useEffect(() => {
    syncCurrentTokenIfNeeded();
  }, [isAuthenticated, authToken, syncCurrentTokenIfNeeded]);

  return null;
}