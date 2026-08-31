import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Height of the tab bar content (icons + labels), excluding the safe area. */
export const TAB_BAR_BASE_HEIGHT = 64;

/**
 * Single source of truth for the bottom tab bar's metrics.
 *
 * The tab bar is absolutely positioned over the bottom of tab screens (see
 * app/(app)/(tabs)/_layout.tsx), so anything floating near the bottom of a tab
 * screen (FABs, sticky inputs, spacers) must offset itself by `tabBarHeight`.
 *
 * The safe-area inset is clamped to 40 so a bogus value from the provider can
 * never inflate the bar (34 is the real maximum on current iPhones).
 */
export function useTabBarLayout() {
  const insets = useSafeAreaInsets();

  const rawBottomInset =
    Platform.OS === "ios" ? insets.bottom : Math.max(insets.bottom, 8);
  const bottomInset = Math.min(rawBottomInset, 40);
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + bottomInset;

  return { bottomInset, tabBarHeight };
}
