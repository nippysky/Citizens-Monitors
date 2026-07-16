import { usePathname } from "expo-router";
import { View } from "react-native";

import { isTabPathname } from "@/constants/tabRoutes";
import { useTabBarLayout } from "@/hooks/useTabBarLayout";

/**
 * Bottom spacer for scroll content.
 *
 * On bottom-tab screens: the tab bar is absolutely positioned (see
 * (tabs)/_layout.tsx tabBarHost) and overlays the bottom of the screen, so
 * content must clear the full tab bar height.
 *
 * On plain stack screens (learning-feed, archive-reports, …) there is no tab
 * bar — only small breathing room is needed.
 */
export default function TabBarSpacer() {
  const { bottomInset, tabBarHeight } = useTabBarLayout();
  const pathname = usePathname();

  const height = isTabPathname(pathname)
    ? tabBarHeight + 12
    : Math.max(bottomInset + 8, 20);

  return <View style={{ height }} />;
}
