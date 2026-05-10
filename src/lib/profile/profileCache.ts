import * as SecureStore from "expo-secure-store";

import { MyProfileResponse } from "@/lib/api/profile.api";

const MY_PROFILE_CACHE_KEY = "citizen_monitors.profile.me";

export async function saveCachedMyProfile(
  profile: MyProfileResponse
): Promise<void> {
  await SecureStore.setItemAsync(
    MY_PROFILE_CACHE_KEY,
    JSON.stringify(profile)
  );
}

export async function getCachedMyProfile(): Promise<MyProfileResponse | null> {
  const rawProfile = await SecureStore.getItemAsync(MY_PROFILE_CACHE_KEY);

  if (!rawProfile) return null;

  try {
    return JSON.parse(rawProfile) as MyProfileResponse;
  } catch {
    return null;
  }
}

export async function clearCachedMyProfile(): Promise<void> {
  await SecureStore.deleteItemAsync(MY_PROFILE_CACHE_KEY);
}