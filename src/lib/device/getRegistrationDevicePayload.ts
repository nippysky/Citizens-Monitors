import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type RegistrationDevicePayload = {
  platform: "ios" | "android";
  deviceId?: string;
  appVersion?: string;
  pushToken?: string;
};

async function getDeviceId(): Promise<string | undefined> {
  try {
    if (Platform.OS === "android") {
      return Application.getAndroidId();
    }

    if (Platform.OS === "ios") {
      return (await Application.getIosIdForVendorAsync()) ?? undefined;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

async function getPushTokenIfAlreadyAllowed(): Promise<string | undefined> {
  try {
    /**
     * iOS simulators cannot reliably obtain Expo push tokens.
     * Also do not force a notification permission prompt from signup.
     */
    if (!Device.isDevice) {
      return undefined;
    }

    const permission = await Notifications.getPermissionsAsync();

    if (permission.status !== "granted") {
      return undefined;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      return undefined;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return token.data;
  } catch {
    return undefined;
  }
}

export async function getRegistrationDevicePayload(): Promise<RegistrationDevicePayload> {
  const [deviceId, pushToken] = await Promise.all([
    getDeviceId(),
    getPushTokenIfAlreadyAllowed(),
  ]);

  return {
    platform: Platform.OS === "ios" ? "ios" : "android",
    deviceId,
    appVersion:
      Application.nativeApplicationVersion ??
      Constants.expoConfig?.version ??
      "1.0.0",
    pushToken,
  };
}