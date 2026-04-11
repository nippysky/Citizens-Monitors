import { Theme } from "@/theme";
import Svg, { Path } from "react-native-svg";

export default function AuthTopLines() {
  return (
    <Svg width="100%" height="54" viewBox="0 0 430 54" fill="none">
      <Path
        d="M-8 18C45 40 102 42 160 33C220 24 276 4 334 10C372 14 402 24 438 20"
        stroke={Theme.colors.wave}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path
        d="M-8 35C45 57 102 59 160 50C220 41 276 21 334 27C372 31 402 41 438 37"
        stroke={Theme.colors.wave}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}