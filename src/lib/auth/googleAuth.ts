// Google Sign-In wrapper.
//
// Responsibilities:
//  - Lazily configure the native Google Sign-In library on first use.
//  - Expose a single signInWithGoogle() that returns a discriminated union
//    (success | cancelled | error), so callers can branch cleanly without
//    try/catch noise.
//  - Provide a best-effort signOutFromGoogle() for the logout flow.
//
// We use the v16+ response helpers (isSuccessResponse / isCancelledResponse)
// where possible, and fall back to statusCodes / isErrorWithCode for the
// thrown-error paths that some library code paths still use.

import { Platform } from "react-native";
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Result types

export type GoogleSignInSuccess = {
  kind: "success";
  idToken: string;
  email: string;
  name: string | null;
  photo: string | null;
  googleId: string;
};

export type GoogleSignInCancelled = {
  kind: "cancelled";
};

export type GoogleSignInError = {
  kind: "error";
  code:
    | "play-services-unavailable"
    | "in-progress"
    | "no-id-token"
    | "no-email"
    | "configuration-missing"
    | "unknown";
  message: string;
};

export type GoogleSignInResult =
  | GoogleSignInSuccess
  | GoogleSignInCancelled
  | GoogleSignInError;

// Lazy configuration

let isConfigured = false;

/**
 * Configure the native Google Sign-In SDK.
 *
 * Client IDs:
 *  - webClientId  →  REQUIRED on all platforms. This is the audience the
 *    backend will validate the idToken's `aud` claim against. It's also
 *    what Android uses internally to identify itself to Google.
 *
 *  - iosClientId  →  REQUIRED on iOS. The native GIDConfiguration on iOS
 *    needs this to know which app is requesting auth. Normally read from
 *    GoogleService-Info.plist's CLIENT_ID field, but we pass it explicitly
 *    here so behaviour doesn't depend on whether Firebase included that key
 *    in the plist. Ignored on Android.
 *
 * Other options:
 *  - scopes: minimal email + profile to identify the user. Adding more would
 *    trigger a different (scarier-looking) consent screen.
 *  - offlineAccess: false because we are not asking Google for a server
 *    auth code; the backend uses the idToken directly.
 *
 * Returns false if a required env var is missing (caller surfaces a clean
 * error rather than letting the library throw an opaque native exception).
 */
function ensureConfigured(): boolean {
  if (isConfigured) return true;

  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";
  const iosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? "";

  if (!webClientId) {
    if (__DEV__) {
      console.warn(
        "[googleAuth] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set. " +
          "Google Sign-In cannot be initialised."
      );
    }
    return false;
  }

  // iOS requires an iOS Client ID. If we don't have one in env, we still
  // attempt configure() — the library will try to read CLIENT_ID from
  // GoogleService-Info.plist as a fallback. We warn so the dev knows.
  if (Platform.OS === "ios" && !iosClientId && __DEV__) {
    console.warn(
      "[googleAuth] EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is not set. " +
        "Sign-in will only work if GoogleService-Info.plist contains a CLIENT_ID."
    );
  }

  GoogleSignin.configure({
    webClientId,
    // Library accepts iosClientId on all platforms; ignored on Android.
    // Pass undefined (not empty string) so the library treats it as absent.
    iosClientId: iosClientId || undefined,
    scopes: ["email", "profile"],
    offlineAccess: false,
  });

  isConfigured = true;

  if (__DEV__) {
    console.log("[googleAuth] Configured", {
      platform: Platform.OS,
      webClientId,
      iosClientId: iosClientId || "(falling back to plist)",
    });
  }

  return true;
}

// Sign-in

/**
 * Trigger the native Google Sign-In flow.
 *
 * Returns a discriminated union — callers should branch on `result.kind`:
 *
 *   const result = await signInWithGoogle();
 *   if (result.kind === "cancelled") return;
 *   if (result.kind === "error") { showToast(result.message); return; }
 *   // result.kind === "success" → send result.idToken to backend
 *
 * Never throws under normal conditions.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (!ensureConfigured()) {
    return {
      kind: "error",
      code: "configuration-missing",
      message:
        "Google Sign-In is not configured for this build. Please contact support.",
    };
  }

  try {
    // Android only: verify Google Play Services is available + up to date.
    // Throws PLAY_SERVICES_NOT_AVAILABLE if missing.
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    const response = await GoogleSignin.signIn();

    // The v16 helpers handle cancellation as a returned value (not a throw).
    if (isCancelledResponse(response)) {
      return { kind: "cancelled" };
    }

    if (!isSuccessResponse(response)) {
      // Unknown shape — treat as a generic failure.
      return {
        kind: "error",
        code: "unknown",
        message: "Google sign-in did not complete. Please try again.",
      };
    }

    const { idToken, user } = response.data;

    if (!idToken) {
      return {
        kind: "error",
        code: "no-id-token",
        message:
          "Google did not return an authentication token. Please try again.",
      };
    }

    if (!user.email) {
      return {
        kind: "error",
        code: "no-email",
        message:
          "Google did not share an email address. Please use a different account.",
      };
    }

    return {
      kind: "success",
      idToken,
      email: user.email.trim().toLowerCase(),
      name: user.name ?? null,
      photo: user.photo ?? null,
      googleId: user.id,
    };
  } catch (error) {
    // The library still throws for some error paths even with v16 helpers.
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          return { kind: "cancelled" };

        case statusCodes.IN_PROGRESS:
          return {
            kind: "error",
            code: "in-progress",
            message: "Sign-in is already in progress. Please wait a moment.",
          };

        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          return {
            kind: "error",
            code: "play-services-unavailable",
            message:
              "Google Play Services is unavailable on this device. Please update it from the Play Store and try again.",
          };

        default:
          if (__DEV__) {
            console.warn("[googleAuth] Unknown error code:", error.code, error);
          }
          return {
            kind: "error",
            code: "unknown",
            message:
              error.message || "Google sign-in failed. Please try again.",
          };
      }
    }

    if (__DEV__) {
      console.warn("[googleAuth] Non-coded error:", error);
    }

    return {
      kind: "error",
      code: "unknown",
      message:
        error instanceof Error
          ? error.message
          : "Google sign-in failed. Please try again.",
    };
  }
}

// Cleanup

/**
 * Best-effort sign-out from Google. Safe to call even if user was never
 * signed in. Errors are swallowed because failing here would block the
 * user's main sign-out flow, which we don't want.
 */
export async function signOutFromGoogle(): Promise<void> {
  if (!isConfigured) return;
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    if (__DEV__) {
      console.warn("[googleAuth] signOut() failed (non-fatal):", error);
    }
  }
}

/**
 * Synchronous check if a user is currently signed in via Google on-device.
 * Useful for diagnostics or session-restore logic.
 */
export function isSignedInWithGoogle(): boolean {
  if (!isConfigured) return false;
  try {
    return GoogleSignin.getCurrentUser() !== null;
  } catch {
    return false;
  }
}