// ─── src/svgs/parties/index.tsx ───────────────────────────────────────────────
// Compact party badge SVGs matching Figma. Import as <APC />, <LP />, etc.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import APC from "../APC";
import LP from "../LP";
import NNPP from "../NNPP";
import PDP from "../PDP";
import OtherParties from "../OtherParties";

type BadgeProps = { width?: number; height?: number };



// Lookup helper — use in components that receive `logoKey` from data.
const partyLogos: Record<string, React.FC<BadgeProps>> = {
  APC,
  LP,
  PDP,
  NNPP,
  OtherParties,
};

export function getPartyLogo(logoKey: string): React.FC<BadgeProps> {
  return partyLogos[logoKey] ?? OtherParties;
}