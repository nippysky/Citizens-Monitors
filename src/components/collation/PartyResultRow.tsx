// ─── src/components/collation/PartyResultRow.tsx ─────────────────────────────
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import { PartyResult, formatCompactNumber } from "@/data/collation";
import { Theme } from "@/theme";
import { getPartyLogo } from "@/svgs/app/collation/parties";

type Props = { party: PartyResult };

export default function PartyResultRow({ party }: Props) {
  const Logo = getPartyLogo(party.logoKey);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <Logo width={28} height={20} />
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