import * as React from "react";
import Svg, { Rect, Path, Defs, LinearGradient, Stop } from "react-native-svg";
const  BankDetails = (props:any) => (
  <Svg
    width={36}
    height={37}
    viewBox="0 0 36 37"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect
      width={35.8333}
      height={36.6667}
      rx={12}
      fill="url(#paint0_linear_228_13736)"
    />
    <Path
      d="M13.75 17.5H12.0833V23.3333H13.75V17.5ZM18.75 17.5H17.0833V23.3333H18.75V17.5ZM25.8333 25H10V26.6667H25.8333V25ZM23.75 17.5H22.0833V23.3333H23.75V17.5ZM17.9167 11.8833L22.2583 14.1667H13.575L17.9167 11.8833ZM17.9167 10L10 14.1667V15.8333H25.8333V14.1667L17.9167 10Z"
      fill="#0A0F0F"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_228_13736"
        x1={17.9167}
        y1={0}
        x2={17.9167}
        y2={36.6667}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#05A394" stopOpacity={0.2} />
        <Stop offset={1} stopColor="#FFF7DD" stopOpacity={0.2} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default BankDetails;
