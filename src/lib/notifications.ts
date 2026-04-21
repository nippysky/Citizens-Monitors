// ─── src/lib/notifications.ts ────────────────────────────────────────────────
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

type NotificationBehaviorResult = Promise<{
  shouldShowBanner: boolean;
  shouldShowList: boolean;
  shouldPlaySound: boolean;
  shouldSetBadge: boolean;
}>;

Notifications.setNotificationHandler({
  handleNotification: (): NotificationBehaviorResult =>
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

  console.log("[notifications] existing permission status:", settings.status);

  let finalStatus = settings.status;

  if (finalStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
    console.log("[notifications] requested permission status:", finalStatus);
  }

  return finalStatus === "granted";
}

export function getExpoProjectId(): string {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  console.log("[notifications] resolved projectId:", projectId ?? "null");

  if (!projectId) {
    throw new Error(
      "Missing EAS projectId. Make sure the app is configured with EAS and built with an EAS preview/production build."
    );
  }

  return projectId;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  console.log("[notifications] register start");
  console.log("[notifications] platform:", Platform.OS);
  console.log("[notifications] Device.isDevice:", Device.isDevice);

  try {
    if (Platform.OS === "android") {
      await configureNotificationChannelsAsync();
    }

    const granted = await requestNotificationPermissionsAsync();

    if (!granted) {
      console.warn("[notifications] permission not granted");
      return null;
    }

    const projectId = getExpoProjectId();

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenResponse.data;

    console.log("[notifications] expo push token:", token);

    return token;
  } catch (error) {
    console.error("[notifications] register failed:", error);
    return null;
  }
}

export async function getNotificationPermissionStatusAsync(): Promise<string> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
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

export async function setAppBadgeCountAsync(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(Math.max(0, count));
}

export async function clearAppBadgeAsync(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}