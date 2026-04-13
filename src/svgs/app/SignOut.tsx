import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const SignOut = (props:any) => (
  <Svg
    width={36}
    height={35}
    viewBox="0 0 36 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect width={35.2292} height={34.3333} rx={12} fill="#FEF2F2" />
    <Path
      d="M24.3333 17.1667H15.8229M22.5417 19.8542L25.2292 17.1667L22.5417 14.4792M18.0625 12.6875V11.7917C18.0625 11.3165 17.8737 10.8608 17.5377 10.5248C17.2017 10.1888 16.746 10 16.2708 10H11.7917C11.3165 10 10.8608 10.1888 10.5248 10.5248C10.1888 10.8608 10 11.3165 10 11.7917V22.5417C10 23.0168 10.1888 23.4726 10.5248 23.8086C10.8608 24.1446 11.3165 24.3333 11.7917 24.3333H16.2708C16.746 24.3333 17.2017 24.1446 17.5377 23.8086C17.8737 23.4726 18.0625 23.0168 18.0625 22.5417V21.6458"
      stroke="#EE3F08"
      strokeWidth={1.79167}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SignOut;
