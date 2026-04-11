import { Theme } from "@/theme";
import Svg, { Path } from "react-native-svg";

export default function AuthBottomLines() {
  return (
    <Svg width="100%" height="54" viewBox="0 0 430 54" fill="none">
      <Path
        d="M-8 34C45 14 102 12 160 21C220 30 276 50 334 44C372 40 402 30 438 34"
        stroke={Theme.colors.wave}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M-8 51C45 31 102 29 160 38C220 47 276 67 334 61C372 57 402 47 438 51"
        stroke={Theme.colors.wave}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}