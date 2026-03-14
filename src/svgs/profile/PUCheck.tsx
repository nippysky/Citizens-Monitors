import * as React from "react";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
const PUCheck = (props:any) => (
  <Svg
    width={36}
    height={36}
    viewBox="0 0 36 36"
    fill="none"
    {...props}
  >
    <Rect width={36} height={36} rx={12} fill="url(#paint0_linear_423_9727)" />
    <Path
      d="M15 17.002L18 20.002L26 12.002"
      stroke="#0A0F0F"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M26 18.0024C25.9995 19.702 25.4577 21.3573 24.4532 22.7283C23.4486 24.0993 22.0336 25.1147 20.4131 25.6274C18.7926 26.1401 17.051 26.1233 15.4407 25.5796C13.8304 25.0359 12.4351 23.9934 11.4571 22.6034C10.4791 21.2133 9.96927 19.5479 10.0014 17.8486C10.0336 16.1493 10.6061 14.5044 11.636 13.1523C12.6659 11.8003 14.0997 10.8114 15.7294 10.329C17.3591 9.8466 19.1001 9.89578 20.7 10.4694"
      stroke="#0A0F0F"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_423_9727"
        x1={18}
        y1={0}
        x2={18}
        y2={36}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#05A394" stopOpacity={0.2} />
        <Stop offset={1} stopColor="#FFF7DD" stopOpacity={0.2} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default PUCheck;
