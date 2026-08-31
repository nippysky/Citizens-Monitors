import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Linking } from "react-native";
import { showGlobalToast } from "./toast";

type PermissionStatus = "granted" | "denied" | "blocked";

type PermissionResponseLike = {
  granted: boolean;
  canAskAgain?: boolean;
};

// CORE

function resolveStatus(res: PermissionResponseLike): PermissionStatus {
  if (res.granted) return "granted";
  if (res.canAskAgain === false) return "blocked";
  return "denied";
}

function openSettings() {
  Linking.openSettings();
}

function showDeniedToast(title: string, message: string) {
  showGlobalToast({
    type: "info",
    title,
    subtitle: message,
  });
}

function showBlockedToast(title: string, message: string) {
  showGlobalToast({
    type: "info",
    title,
    subtitle: message,
    actionLabel: "Open Settings",
    actionRoute: "__open_settings__", // handled manually
  });
}

// MAIN FLOW

async function handlePermissionFlow(
  getCurrent: () => Promise<PermissionResponseLike>,
  request: () => Promise<PermissionResponseLike>,
  config: {
    title: string;
    message: string;
    blockedMessage?: string;
  }
): Promise<boolean> {
  const current = await getCurrent();
  const currentStatus = resolveStatus(current);

  // already granted
  if (currentStatus === "granted") return true;

  // already blocked
  if (currentStatus === "blocked") {
    showBlockedToast(
      config.title,
      config.blockedMessage ??
        `${config.message}. Enable it from settings.`
    );
    return false;
  }

  // not yet determined, ask for it
  const response = await request();
  const newStatus = resolveStatus(response);

  if (newStatus === "granted") return true;

  if (newStatus === "blocked") {
    showBlockedToast(
      config.title,
      config.blockedMessage ??
        `${config.message}. Enable it from settings.`
    );
    return false;
  }

  // denied
  showDeniedToast(config.title, config.message);
  return false;
}

// CAMERA

export async function ensureCameraPermission(): Promise<boolean> {
  return handlePermissionFlow(
    Camera.getCameraPermissionsAsync,
    Camera.requestCameraPermissionsAsync,
    {
      title: "Camera Permission Required",
      message:
        "Allow camera access to capture election evidence and record incidents.",
    }
  );
}

// GALLERY

export async function ensureMediaLibraryPermission(): Promise<boolean> {
  return handlePermissionFlow(
    ImagePicker.getMediaLibraryPermissionsAsync,
    ImagePicker.requestMediaLibraryPermissionsAsync,
    {
      title: "Gallery Permission Required",
      message:
        "Allow access to your photos to upload election evidence.",
    }
  );
}

// LOCATION

export async function ensureLocationPermission(): Promise<boolean> {
  return handlePermissionFlow(
    Location.getForegroundPermissionsAsync,
    Location.requestForegroundPermissionsAsync,
    {
      title: "Location Permission Required",
      message:
        "We need your location to verify reports from your polling unit.",
    }
  );
}

// COMBINED HELPERS

export async function ensureCameraAndGallery(): Promise<boolean> {
  const camera = await ensureCameraPermission();
  if (!camera) return false;

  const gallery = await ensureMediaLibraryPermission();
  return gallery;
}

export async function ensureAllCorePermissions(): Promise<boolean> {
  const camera = await ensureCameraPermission();
  if (!camera) return false;

  const gallery = await ensureMediaLibraryPermission();
  if (!gallery) return false;

  const location = await ensureLocationPermission();
  return location;
}

// HANDLE SETTINGS ACTION (hook for toast click)

export function handlePermissionAction(route?: string) {
  if (route === "__open_settings__") {
    openSettings();
  }
}