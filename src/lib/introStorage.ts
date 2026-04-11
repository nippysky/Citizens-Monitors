import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_SEEN_INTRO_KEY = "has_seen_intro_slides";

export async function getHasSeenIntroSlides(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(HAS_SEEN_INTRO_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setHasSeenIntroSlides(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(HAS_SEEN_INTRO_KEY, value ? "true" : "false");
  } catch {
    // no-op
  }
}