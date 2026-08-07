// ─── src/lib/auth/appLockPreference.ts ───────────────────────────────────────
// User preference for the biometric App Lock.
//
// Separation of concerns (important):
//   • STAYING SIGNED IN  → refresh token (sessionRefresh.ts). Automatic, and
//                          nothing to do with biometrics.
//   • APP LOCK           → this preference. Purely a privacy choice: should
//                          the app demand Face ID / fingerprint / PIN before
//                          revealing content?
//
// Default is OFF, so a user who never touches settings simply opens the app
// and is straight in — exactly the requested behaviour.

import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const APP_LOCK_ENABLED_KEY = "citizen_monitors.app_lock.enabled";

/** Does the device have biometrics OR a PIN/pattern/passcode enrolled? */
export async function isDeviceSecurityAvailable(): Promise<boolean> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

/** Human label for whatever the device offers ("Face ID", "Fingerprint", …). */
export async function getDeviceSecurityLabel(): Promise<string> {
  try {
    const [types, enrolled] = await Promise.all([
      LocalAuthentication.supportedAuthenticationTypesAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);

    if (enrolled) {
      if (
        types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      ) {
        return "Face ID";
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return "Fingerprint";
      }
    }

    return "device passcode";
  } catch {
    return "device passcode";
  }
}

export async function isAppLockEnabled(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(APP_LOCK_ENABLED_KEY);
    return value === "1";
  } catch {
    return false;
  }
}

export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  try {
    if (enabled) {
      await SecureStore.setItemAsync(APP_LOCK_ENABLED_KEY, "1");
    } else {
      await SecureStore.deleteItemAsync(APP_LOCK_ENABLED_KEY);
    }
  } catch {
    // Preference storage failing must never crash settings.
  }
}

/**
 * Prompt for biometrics / device credential.
 * Used both to CONFIRM enabling the toggle and to unlock on app open.
 */
export async function promptDeviceAuthentication(
  promptMessage = "Unlock Citizen Monitors"
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: "Use Passcode",
      // Keep the device-credential fallback so a user whose biometrics fail
      // (wet finger, mask) can still get in with their PIN.
      disableDeviceFallback: false,
    });

    return result.success;
  } catch {
    return false;
  }
}
