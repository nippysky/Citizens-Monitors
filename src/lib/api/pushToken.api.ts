import { Platform } from "react-native";

import { apiRequest } from "@/lib/api/http";

export type PushPlatform = "ios" | "android";

export type RegisterPushTokenPayload = {
  token: string;
  platform: PushPlatform;
};

export type RegisterPushTokenResponse = {
  message: string;
};

function resolvePlatform(): PushPlatform {
  return Platform.OS === "ios" ? "ios" : "android";
}

// Register this device's Expo push token with the backend so it can be
// targeted by server-initiated notifications.
// TODO: confirm with backend engineer
// Default assumption below:
// POST /profile/push-token
// Body: { token: "ExponentPushToken[...]", platform: "ios" | "android" }
// Response: { message: string }
// If the backend uses a different path or payload shape, update this file
// accordingly. The function signature stays the same so callers don't change.
// Notes:
// - The "token" we send is an Expo push token, not a raw FCM/APNs token.
// The backend should send pushes via Expo's Push API
// (https://exp.host/--/api/v2/push/send) which forwards to FCM/APNs
// using credentials EAS has on file. The backend does NOT need to talk
// to FCM directly.
// - If the backend prefers raw FCM/APNs tokens, swap getExpoPushTokenAsync
// for getDevicePushTokenAsync in registerForPushNotificationsAsync.
export async function registerPushToken(token: string): Promise<RegisterPushTokenResponse> {
  return apiRequest<RegisterPushTokenResponse>("/profile/push-token", {
    method: "POST",
    body: {
      token,
      platform: resolvePlatform(),
    },
  });
}

// Remove this device's push token from the backend.
// Call on user logout so the backend stops trying to push to a device
// whose user is no longer signed in. Backend should idempotently delete
// (no error if token wasn't registered).
// TODO: confirm with backend engineer
// Default assumption: DELETE /profile/push-token with body { token }
export async function unregisterPushToken(token: string): Promise<RegisterPushTokenResponse> {
  return apiRequest<RegisterPushTokenResponse>("/profile/push-token", {
    method: "DELETE",
    body: { token },
  });
}