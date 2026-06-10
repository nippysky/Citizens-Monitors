import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Adds a small breathing room below the last list item so it doesn't sit
 * flush against the bottom of the scroll area. The tab bar is rendered in
 * normal layout flow by React Navigation, so no large offset is needed.
 */
export default function TabBarSpacer() {
  const insets = useSafeAreaInsets();
  // Minimal: just enough so the last card isn't flush against the edge.
  const height = Math.max(insets.bottom + 8, 20);
  return <View style={{ height }} />;
}