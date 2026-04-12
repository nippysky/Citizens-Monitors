// ─── src/hooks/useCollationMedia.ts ──────────────────────────────────────────
// Camera, gallery, location — with persisted permissions and actual GPS.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

export type PickedMedia = {
  uri: string;
  width: number;
  height: number;
  type: "image" | "video";
};

export type ResolvedLocation = {
  latitude: number;
  longitude: number;
  addressLabel: string;
};

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; data?: undefined };

export function useCollationMedia() {
  const [busy, setBusy] = useState(false);

  /* ── Camera photo ── */
  const capturePhoto = useCallback(async (): Promise<Result<PickedMedia | null>> => {
    setBusy(true);
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted)
        return { ok: false, error: "Camera permission is required to capture evidence. Please enable it in Settings." };

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false,
        exif: true,
      });
      if (result.canceled || !result.assets?.length) return { ok: true, data: null };

      const a = result.assets[0];
      return { ok: true, data: { uri: a.uri, width: a.width, height: a.height, type: "image" } };
    } catch {
      return { ok: false, error: "Failed to capture photo. Please try again." };
    } finally {
      setBusy(false);
    }
  }, []);

  /* ── Camera video ── */
  const captureVideo = useCallback(async (): Promise<Result<PickedMedia | null>> => {
    setBusy(true);
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted)
        return { ok: false, error: "Camera permission is required to record video evidence. Please enable it in Settings." };

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["videos"],
        videoMaxDuration: 120,
        videoQuality: 1,
      });
      if (result.canceled || !result.assets?.length) return { ok: true, data: null };

      const a = result.assets[0];
      return { ok: true, data: { uri: a.uri, width: a.width, height: a.height, type: "video" } };
    } catch {
      return { ok: false, error: "Failed to record video. Please try again." };
    } finally {
      setBusy(false);
    }
  }, []);

  /* ── Gallery image ── */
  const pickImageFromGallery = useCallback(async (): Promise<Result<PickedMedia | null>> => {
    setBusy(true);
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted)
        return { ok: false, error: "Gallery access is required to select evidence. Please enable it in Settings." };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.length) return { ok: true, data: null };

      const a = result.assets[0];
      return { ok: true, data: { uri: a.uri, width: a.width, height: a.height, type: "image" } };
    } catch {
      return { ok: false, error: "Failed to select image. Please try again." };
    } finally {
      setBusy(false);
    }
  }, []);

  /* ── Gallery video ── */
  const pickVideoFromGallery = useCallback(async (): Promise<Result<PickedMedia | null>> => {
    setBusy(true);
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted)
        return { ok: false, error: "Gallery access is required to select video. Please enable it in Settings." };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
      });
      if (result.canceled || !result.assets?.length) return { ok: true, data: null };

      const a = result.assets[0];
      return { ok: true, data: { uri: a.uri, width: a.width, height: a.height, type: "video" } };
    } catch {
      return { ok: false, error: "Failed to select video. Please try again." };
    } finally {
      setBusy(false);
    }
  }, []);

  /* ── GPS location (actual device location) ── */
  const resolveCurrentLocation = useCallback(async (): Promise<Result<ResolvedLocation | null>> => {
    setBusy(true);
    try {
      // Check existing permission first (persisted by OS)
      let { granted } = await Location.getForegroundPermissionsAsync();

      // Only request if not already granted
      if (!granted) {
        const perm = await Location.requestForegroundPermissionsAsync();
        granted = perm.granted;
      }

      if (!granted) {
        return {
          ok: false,
          error: "Location permission is required to verify your polling unit. Please enable it in Settings.",
        };
      }

      // Check if location services are enabled on device
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        return {
          ok: false,
          error: "Location services are disabled on your device. Please turn on GPS in your device settings.",
        };
      }

      // Get actual high-accuracy location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      let addressLabel = `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`;

      // Reverse geocode for human-readable address
      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo) {
          const parts = [
            geo.name,
            geo.street,
            geo.district,
            geo.city,
            geo.region,
            geo.country,
          ].filter(Boolean);
          if (parts.length > 0) {
            addressLabel = parts.join(", ");
          }
        }
      } catch {
        // Fallback to coordinates — still valid
      }

      return {
        ok: true,
        data: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          addressLabel,
        },
      };
    } catch {
      return {
        ok: false,
        error: "Could not determine your location. Ensure GPS is enabled and try again.",
      };
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    busy,
    capturePhoto,
    captureVideo,
    pickImageFromGallery,
    pickVideoFromGallery,
    resolveCurrentLocation,
  };
}