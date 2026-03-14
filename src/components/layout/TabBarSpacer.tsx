import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabBarSpacer() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        height: 90 + insets.bottom,
      }}
    />
  );
}