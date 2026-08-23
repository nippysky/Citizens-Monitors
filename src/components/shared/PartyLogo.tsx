// ─── src/components/shared/PartyLogo.tsx ──────────────────────────────────
//
// Renders a party's logo, preferring the real image URL the API provides
// (ElectionVaultElection.politicalParties[].logo) over the local static SVG
// set. Falls back to the local SVG (keyed by party code) when there's no
// API logo — either because the endpoint didn't return one for this party,
// or because the caller doesn't have vault/my-submission data to draw from.

import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { getPartyLogo } from "@/svgs/app/collation/parties";

type Props = {
  code: string;
  logoUrl?: string | null;
  size?: number;
};

export default function PartyLogo({ code, logoUrl, size = 28 }: Props) {
  const dimensions = { width: size, height: size, borderRadius: size / 2 };

  if (logoUrl?.trim()) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={[styles.image, dimensions]}
        contentFit="cover"
        transition={120}
      />
    );
  }

  return (
    <View style={[styles.fallbackWrap, dimensions]}>
      {renderFallbackIcon(code, size)}
    </View>
  );
}

/**
 * Returns an ELEMENT rather than a component type. Binding the resolved
 * component to a capitalised local during render would give it a fresh
 * identity on every render, forcing React to remount the icon each pass.
 */
function renderFallbackIcon(code: string, size: number) {
  const Icon = getPartyLogo(code.trim().toUpperCase());
  return <Icon width={size} height={size} />;
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#F1F3F5",
  },
  fallbackWrap: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
