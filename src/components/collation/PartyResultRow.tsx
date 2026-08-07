// ─── src/components/collation/PartyResultRow.tsx ─────────────────────────────
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import { PartyResult, formatCompactNumber } from "@/data/collation";
import { Theme } from "@/theme";
import { getPartyLogo } from "@/svgs/app/collation/parties";

type Props = { party: PartyResult };

/**
 * Renders the party logo as an ELEMENT rather than binding the component to a
 * capitalised local. Selecting a component type during render gives it a new
 * identity each pass, so React unmounts and remounts the subtree — losing any
 * internal state and restarting animations (react-hooks/static-components).
 */
function renderPartyLogo(logoKey: PartyResult["logoKey"]) {
  const Logo = getPartyLogo(logoKey);
  return <Logo width={28} height={20} />;
}

export default function PartyResultRow({ party }: Props) {

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          {renderPartyLogo(party.logoKey)}
          <AppText style={styles.name}>{party.shortName}</AppText>
        </View>

        <View style={styles.right}>
          <AppText style={styles.voteText}>
            ({formatCompactNumber(party.votes)} votes)
          </AppText>
          <AppText style={[styles.percentText, { color: party.color }]}>
            {party.percent}%
          </AppText>
        </View>
      </View>

      <CollationAnimatedProgressBar
        progress={party.percent}
        height={7}
        color={party.color}
        trackColor="#E5E7EB"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  voteText: { fontSize: 13, lineHeight: 18, color: Theme.colors.text },
  percentText: { fontSize: 13, lineHeight: 18, fontFamily: Theme.fonts.body.semibold },
});