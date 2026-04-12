import * as React from "react";
import Svg, { Rect, Defs, Pattern, Use, Image } from "react-native-svg";
const Incident = (props:any) => (
  <Svg
    width={32}
    height={31}
    viewBox="0 0 32 31"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <Rect width={32} height={31} rx={15.5} fill="#FEF3C7" />
    <Rect
      x={4.5}
      y={3.5}
      width={23}
      height={24}
      fill="url(#pattern0_694_6160)"
    />
    <Defs>
      <Pattern
        id="pattern0_694_6160"
        patternContentUnits="objectBoundingBox"
        width={1}
        height={1}
      >
        <Use
          xlinkHref="#image0_694_6160"
          transform="matrix(0.00815217 0 0 0.0078125 -0.0217391 0)"
        />
      </Pattern>
      <Image
        id="image0_694_6160"
        width={128}
        height={128}
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </Defs>
  </Svg>
);
export default Incident;
