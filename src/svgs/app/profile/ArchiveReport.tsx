import * as React from "react";
import Svg, { Rect, Path, Defs, LinearGradient, Stop } from "react-native-svg";
const ArchiveReport = (props:any) => (
  <Svg
    width={33}
    height={32}
    viewBox="0 0 33 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect
      width={32.4523}
      height={31.2066}
      rx={12}
      fill="url(#paint0_linear_229_14032)"
    />
    <Path
      d="M10 19.9618V12.8323C10 11.9332 10 11.4837 10.1513 11.1307C10.3402 10.6908 10.6908 10.3402 11.1307 10.1513C11.4837 10 11.9289 10 12.8329 10H13.1405C13.3264 10 13.51 10.0417 13.6778 10.122C13.8455 10.2022 13.9932 10.3191 14.1099 10.4638L15.2412 11.8678M15.2412 11.8678H18.7166C19.5882 11.8678 20.0241 11.8678 20.3572 12.0372C20.65 12.1866 20.888 12.4248 21.0371 12.7177C21.207 13.0508 21.207 13.4866 21.207 14.3583V14.9809M15.2412 11.8678H13.1131"
      stroke="#0A0F0F"
      strokeWidth={0.93392}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.721 17.7909L10.9065 17.329C11.3635 16.1915 11.592 15.623 12.0683 15.3017C12.5446 14.9805 13.1604 14.9805 14.3907 14.9805H19.4089C21.0825 14.9805 21.9199 14.9805 22.2916 15.5277C22.6639 16.075 22.3526 16.8483 21.7313 18.3961L21.5457 18.8581C21.0887 19.9956 20.8602 20.5641 20.3839 20.8853C19.9076 21.2066 19.2919 21.2066 18.0616 21.2066H13.0433C11.3697 21.2066 10.5323 21.2066 10.1606 20.6593C9.7883 20.1127 10.0996 19.3388 10.721 17.7909Z"
      stroke="#0A0F0F"
      strokeWidth={0.93392}
      strokeLinejoin="round"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_229_14032"
        x1={16.2261}
        y1={0}
        x2={16.2261}
        y2={31.2066}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#05A394" stopOpacity={0.2} />
        <Stop offset={1} stopColor="#FFF7DD" stopOpacity={0.2} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default ArchiveReport;
