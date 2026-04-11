import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabBarSpacer() {
  const insets = useSafeAreaInsets();

  // Account for floating tab bar: 68 (bar height) + 20/12 (bottom offset) + insets
  const height = Platform.OS === "ios"
    ? 68 + 20 + insets.bottom + 16
    : 68 + 12 + 16;

  return <View style={{ height }} />;
}