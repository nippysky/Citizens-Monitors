// ─── src/lib/notifications.ts ────────────────────────────────────────────────
// Pure notification utilities. No React, no app state, no backend calls.
// Backend sync and React lifecycle live in NotificationsGate.

import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export type AppNotificationData = {
  url?: string;
  screen?: string;
  electionId?: string;
  collationId?: string;
  notificationId?: string;
  type?:
    | "result-submitted"
    | "incident-reported"
    | "polling-unit-alert"
    | "discussion-reply"
    | "system"
    | string;
  [key: string]: unknown;
};

const TAG = "[notifications]";

function devLog(...args: unknown[]): void {
  if (__DEV__) {
    console.log(TAG, ...args);
  }
}

function devWarn(...args: unknown[]): void {
  if (__DEV__) {
    console.warn(TAG, ...args);
  }
}

// Foreground behavior: show banner + list, play sound, do not auto-increment
// badge. Override per-channel on Android by setting `showBadge` on the channel.
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

export async function configureNotificationChannelsAsync(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 150, 250],
    lightColor: "#05A39C",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync("election-critical", {
    name: "Election Critical",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 300, 150, 300],
    lightColor: "#05A39C",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync("results", {
    name: "Results",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 220, 120, 220],
    lightColor: "#05A39C",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: true,
  });

  await Notifications.setNotificationChannelAsync("incidents", {
    name: "Incidents",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 280, 120, 280],
    lightColor: "#05A39C",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: true,
  });
}

export async function requestNotificationPermissionsAsync(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  devLog("existing permission status:", settings.status);

  let finalStatus = settings.status;

  if (finalStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = requested.status;
    devLog("requested permission status:", finalStatus);
  }

  return finalStatus === "granted";
}

export function getExpoProjectId(): string {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      "Missing EAS projectId. Configure EAS and build with an EAS dev/preview/production build."
    );
  }

  return projectId;
}

/**
 * Acquires the Expo push token. Returns null if permission denied or token
 * acquisition fails — never throws, so callers can treat null as "no push"
 * without try/catch boilerplate.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  devLog("register start; platform:", Platform.OS, "isDevice:", Device.isDevice);

  try {
    if (Platform.OS === "android") {
      await configureNotificationChannelsAsync();
    }

    const granted = await requestNotificationPermissionsAsync();
    if (!granted) {
      devWarn("permission not granted");
      return null;
    }

    const projectId = getExpoProjectId();
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;

    if (!token || !token.startsWith("ExponentPushToken[")) {
      devWarn("invalid token format:", token);
      return null;
    }

    devLog("registered token:", token);
    return token;
  } catch (error) {
    devWarn("register failed:", error);
    return null;
  }
}

/**
 * Subscribe to native push token rotation. Fired when FCM (Android) or APNs
 * (iOS) reissues the underlying device token — e.g. after Play Services
 * upgrade, app data clear, device migration. When this fires, the Expo push
 * token will also change; callers should re-acquire via
 * registerForPushNotificationsAsync and re-sync to backend.
 */
export function addExpoPushTokenListener(
  callback: (token: Notifications.DevicePushToken) => void
): Notifications.EventSubscription {
  return Notifications.addPushTokenListener(callback);
}

export function addForegroundNotificationListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export function getNotificationDataFromResponse(
  response: Notifications.NotificationResponse | null | undefined
): AppNotificationData | null {
  if (!response) return null;
  const data = response.notification.request.content.data;
  if (!data || typeof data !== "object") return null;
  return data as AppNotificationData;
}

export function getNotificationDataFromNotification(
  notification: Notifications.Notification | null | undefined
): AppNotificationData | null {
  if (!notification) return null;
  const data = notification.request.content.data;
  if (!data || typeof data !== "object") return null;
  return data as AppNotificationData;
}

export async function getLastNotificationResponseAsync(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}

export async function clearLastNotificationResponseAsync(): Promise<void> {
  await Notifications.clearLastNotificationResponseAsync();
}

export async function getNotificationPermissionStatusAsync(): Promise<string> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}

export async function setAppBadgeCountAsync(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(Math.max(0, count));
}

export async function clearAppBadgeAsync(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}