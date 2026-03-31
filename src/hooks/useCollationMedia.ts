import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { useCallback, useState } from "react";

export type PickedMedia = {
  uri: string;
  type: "image" | "video";
  fileName?: string | null;
  mimeType?: string | null;
};

export type ResolvedLocation = {
  latitude: number;
  longitude: number;
  addressLabel: string;
};

type CaptureResult =
  | { ok: true; data: PickedMedia | null }
  | { ok: false; error: string };

type LocationResult =
  | { ok: true; data: ResolvedLocation | null }
  | { ok: false; error: string };

function normalizePickerAssetType(
  assetType: ImagePicker.ImagePickerAsset["type"]
): "image" | "video" {
  return assetType === "video" ? "video" : "image";
}

function getFriendlyPickerError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Something went wrong.";

  if (message.toLowerCase().includes("camera not available")) {
    return Platform.OS === "ios"
      ? "Camera is not available on the iOS simulator. Use a real device or upload from gallery."
      : "Camera is not available on this simulator/emulator. Use a real device or upload from gallery.";
  }

  return message;
}

export function useCollationMedia() {
  const [busy, setBusy] = useState(false);

  const ensureCameraPermission = useCallback(async () => {
    const current = await ImagePicker.getCameraPermissionsAsync();

    if (current.granted) return true;

    const requested = await ImagePicker.requestCameraPermissionsAsync();
    return requested.granted;
  }, []);

  const ensureGalleryPermission = useCallback(async () => {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (current.granted) return true;

    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return requested.granted;
  }, []);

  const ensureLocationPermission = useCallback(async () => {
    const current = await Location.getForegroundPermissionsAsync();

    if (current.granted) return true;

    const requested = await Location.requestForegroundPermissionsAsync();
    return requested.granted;
  }, []);

  const pickImageFromGallery = useCallback(async (): Promise<CaptureResult> => {
    setBusy(true);
    try {
      const granted = await ensureGalleryPermission();
      if (!granted) {
        return {
          ok: false,
          error: "Photo library permission is required to upload image evidence.",
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
        aspect: [4, 4],
      });

      if (result.canceled || !result.assets?.length) {
        return { ok: true, data: null };
      }

      const asset = result.assets[0];

      return {
        ok: true,
        data: {
          uri: asset.uri,
          type: normalizePickerAssetType(asset.type),
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: getFriendlyPickerError(error),
      };
    } finally {
      setBusy(false);
    }
  }, [ensureGalleryPermission]);

  const pickVideoFromGallery = useCallback(async (): Promise<CaptureResult> => {
    setBusy(true);
    try {
      const granted = await ensureGalleryPermission();
      if (!granted) {
        return {
          ok: false,
          error: "Photo library permission is required to upload video evidence.",
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.length) {
        return { ok: true, data: null };
      }

      const asset = result.assets[0];

      return {
        ok: true,
        data: {
          uri: asset.uri,
          type: normalizePickerAssetType(asset.type),
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: getFriendlyPickerError(error),
      };
    } finally {
      setBusy(false);
    }
  }, [ensureGalleryPermission]);

  const capturePhoto = useCallback(async (): Promise<CaptureResult> => {
    setBusy(true);
    try {
      const granted = await ensureCameraPermission();
      if (!granted) {
        return {
          ok: false,
          error: "Camera permission is required to capture image evidence.",
        };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
        aspect: [4, 4],
      });

      if (result.canceled || !result.assets?.length) {
        return { ok: true, data: null };
      }

      const asset = result.assets[0];

      return {
        ok: true,
        data: {
          uri: asset.uri,
          type: normalizePickerAssetType(asset.type),
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: getFriendlyPickerError(error),
      };
    } finally {
      setBusy(false);
    }
  }, [ensureCameraPermission]);

  const captureVideo = useCallback(async (): Promise<CaptureResult> => {
    setBusy(true);
    try {
      const granted = await ensureCameraPermission();
      if (!granted) {
        return {
          ok: false,
          error: "Camera permission is required to record live video evidence.",
        };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["videos"],
        allowsEditing: false,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (result.canceled || !result.assets?.length) {
        return { ok: true, data: null };
      }

      const asset = result.assets[0];

      return {
        ok: true,
        data: {
          uri: asset.uri,
          type: normalizePickerAssetType(asset.type),
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: getFriendlyPickerError(error),
      };
    } finally {
      setBusy(false);
    }
  }, [ensureCameraPermission]);

  const resolveCurrentLocation = useCallback(async (): Promise<LocationResult> => {
    setBusy(true);
    try {
      const granted = await ensureLocationPermission();
      if (!granted) {
        return {
          ok: false,
          error: "Location permission is required to verify your polling area.",
        };
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      let addressLabel = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const first = reverse[0];

        if (first) {
          const parts = [
            first.name,
            first.street,
            first.district,
            first.city,
            first.region,
            first.country,
          ].filter(Boolean);

          if (parts.length) {
            addressLabel = parts.join(", ");
          }
        }
      } catch {
        // Keep coordinate fallback silently.
      }

      return {
        ok: true,
        data: {
          latitude,
          longitude,
          addressLabel,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to get your location.";

      return {
        ok: false,
        error: message,
      };
    } finally {
      setBusy(false);
    }
  }, [ensureLocationPermission]);

  return {
    busy,
    ensureLocationPermission,
    pickImageFromGallery,
    pickVideoFromGallery,
    capturePhoto,
    captureVideo,
    resolveCurrentLocation,
  };
}