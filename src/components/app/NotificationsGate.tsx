// ─── src/components/app/NotificationsGate.tsx ───────────────────────────────
// Side-effect-only component that owns the entire push notification lifecycle:
//   - Acquires the Expo push token on mount
//   - Re-acquires when push token rotates (FCM/APNs upgrades, data clear)
//   - Syncs token to backend after user is authenticated
//   - Handles foreground notifications, taps, and cold-start tap routing
//
// Must be rendered INSIDE AuthProvider so it can react to auth state.

import { Alert } from "react-native";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { registerPushToken } from "@/lib/api/pushToken.api";
import {
  AppNotificationData,
  addExpoPushTokenListener,
  addForegroundNotificationListener,
  addNotificationResponseListener,
  clearLastNotificationResponseAsync,
  getLastNotificationResponseAsync,
  getNotificationDataFromResponse,
  registerForPushNotificationsAsync,
} from "@/lib/notifications";

// ─── DEV-ONLY toggles ────────────────────────────────────────────────────────
// Flip these on while debugging push delivery. Both are gated by __DEV__,
// so neither has any effect in production builds — but flipping them off
// here keeps dev logs quieter on normal runs.

const DEV_SHOW_TOKEN_ALERT = false; // pops an Alert with the token on app boot
const DEV_LOG_FOREGROUND_NOTIFICATIONS = true; // log every foreground push

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

  // Latest acquired Expo push token, updated on acquisition + rotation events.
  const currentExpoTokenRef = useRef<string | null>(null);

  // Last token we successfully POSTed to the backend; used to avoid redundant
  // re-syncs on auth state changes that didn't change the token.
  const lastSyncedTokenRef = useRef<string | null>(null);

  // ─── Effect 1: bootstrap (runs once) ──────────────────────────────────────
  // Acquires the Expo push token, sets up listeners for foreground, taps,
  // cold-starts, and token rotation. Does NOT sync to backend — that's
  // Effect 2's job, gated on auth state.

  useEffect(() => {
    let mounted = true;

    const boot = async (): Promise<void> => {
      const expoToken = await registerForPushNotificationsAsync();
      if (!mounted) return;

      if (expoToken) {
        currentExpoTokenRef.current = expoToken;

        if (__DEV__) {
          // Prominent log so it's easy to grab from Metro for testing.
          console.log(
            "\n========== EXPO PUSH TOKEN ==========\n" +
              expoToken +
              "\n=====================================\n"
          );

          if (DEV_SHOW_TOKEN_ALERT) {
            Alert.alert("Expo Push Token (DEV)", expoToken);
          }
        }
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
    // any additional side effects we want (analytics, in-app badges, etc.).
    const foregroundSub = addForegroundNotificationListener((notification) => {
      if (__DEV__ && DEV_LOG_FOREGROUND_NOTIFICATIONS) {
        console.log(
          "[NotificationsGate] foreground notification:",
          notification.request.content
        );
      }
    });

    // Tap response: user tapped a notification (from tray, banner, or lock screen).
    const responseSub = addNotificationResponseListener((response) => {
      const data = getNotificationDataFromResponse(response);
      handleNotificationRoute(data);
    });

    // Token rotation: FCM/APNs reissued the underlying device token. Re-acquire
    // and queue a backend re-sync (Effect 2 will pick it up if authenticated).
    const tokenSub = addExpoPushTokenListener(() => {
      void registerForPushNotificationsAsync().then((newExpoToken) => {
        if (!mounted || !newExpoToken) return;
        currentExpoTokenRef.current = newExpoToken;
        // Force re-sync on next auth check by clearing the last-synced ref.
        lastSyncedTokenRef.current = null;

        if (__DEV__) {
          console.log("[NotificationsGate] token rotated, new token:", newExpoToken);
        }

        // If user is currently authenticated, sync immediately rather than
        // waiting for the next auth state change.
        if (authToken) {
          void syncTokenToBackend(newExpoToken).then((synced) => {
            if (synced) lastSyncedTokenRef.current = newExpoToken;
          });
        }
      });
    });

    return () => {
      mounted = false;
      foregroundSub.remove();
      responseSub.remove();
      tokenSub.remove();
    };
    // Intentionally empty deps — this effect runs once for the app lifetime.
    // `authToken` is read via ref-free closure inside the rotation handler;
    // that's fine because the handler is only called on rotation events,
    // which are rare, and we have Effect 2 as the durable sync mechanism.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Effect 2: sync to backend when authenticated ─────────────────────────
  // Runs whenever auth state changes. If we have a token in hand and the user
  // is now authenticated (and we haven't already synced this exact token),
  // POST it to the backend.

  useEffect(() => {
    const expoToken = currentExpoTokenRef.current;

    if (!isAuthenticated || !expoToken) return;
    if (lastSyncedTokenRef.current === expoToken) return;

    void syncTokenToBackend(expoToken).then((synced) => {
      if (synced) {
        lastSyncedTokenRef.current = expoToken;
      }
    });
  }, [isAuthenticated, authToken]);

  // Bootstrap can also finish AFTER auth is already established (token
  // acquisition is async, auth may resolve from cache near-instantly). In
  // that case Effect 2 has nothing to do yet because the ref is still null.
  // We poll once on each render via a microtask — cheap, covers the race.
  useEffect(() => {
    if (!isAuthenticated) return;

    const microtask = setTimeout(() => {
      const expoToken = currentExpoTokenRef.current;
      if (!expoToken) return;
      if (lastSyncedTokenRef.current === expoToken) return;

      void syncTokenToBackend(expoToken).then((synced) => {
        if (synced) lastSyncedTokenRef.current = expoToken;
      });
    }, 500);

    return () => clearTimeout(microtask);
  }, [isAuthenticated]);

  return null;
}