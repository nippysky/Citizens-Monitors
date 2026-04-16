import * as React from "react";
import Svg, { Rect, Defs, Pattern, Use, Image } from "react-native-svg";
const ResultAlter = (props:any) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <Rect width={24} height={24} fill="url(#pattern0_285_33125)" />
    <Defs>
      <Pattern
        id="pattern0_285_33125"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <Use xlinkHref="#image0_285_33125" transform="scale(0.0078125)" />
      </Pattern>
      <Image
        id="image0_285_33125"
        width={128}
        height={128}
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </Defs>
  </Svg>
);
export default ResultAlter;
