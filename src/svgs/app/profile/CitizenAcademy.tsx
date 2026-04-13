import * as React from "react";
import Svg, { Rect, Path, Defs, LinearGradient, Stop } from "react-native-svg";
const CitizenAcademy = (props:any) => (
  <Svg
    width={34}
    height={37}
    viewBox="0 0 34 37"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect
      width={33.3333}
      height={36.6667}
      rx={12}
      fill="url(#paint0_linear_229_14285)"
    />
    <Path
      d="M21.6667 10C22.1087 10 22.5326 10.1756 22.8452 10.4882C23.1577 10.8007 23.3333 11.2246 23.3333 11.6667V25C23.3333 25.442 23.1577 25.8659 22.8452 26.1785C22.5326 26.4911 22.1087 26.6667 21.6667 26.6667H11.6667C11.2246 26.6667 10.8007 26.4911 10.4882 26.1785C10.1756 25.8659 10 25.442 10 25V11.6667C10 11.2246 10.1756 10.8007 10.4882 10.4882C10.8007 10.1756 11.2246 10 11.6667 10H21.6667ZM21.6667 11.6667H17.5V18.3333L15.4167 16.4583L13.3333 18.3333V11.6667H11.6667V25H21.6667V11.6667Z"
      fill="#0A0F0F"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_229_14285"
        x1={16.6667}
        y1={0}
        x2={16.6667}
        y2={36.6667}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#05A394" stopOpacity={0.2} />
        <Stop offset={1} stopColor="#FFF7DD" stopOpacity={0.2} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default CitizenAcademy;
