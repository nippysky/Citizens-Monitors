import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { CollationItem, formatCompactNumber } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";

type Props = {
  collation: CollationItem;
};

export default function GeoBreakdownSection({ collation }: Props) {
  const empty = !collation.geoBreakdown.length || !collation.isAssignedToPollingUnit;

  return (
    <View style={styles.wrap}>
      <AppText style={styles.title}>Geo Election Result Breakdown by LGA</AppText>
      <AppText style={styles.subtitle}>
        Captured from real reports of this election from 245 results and 24
        incidents reported from 245/245 polling units in Alimosho.
      </AppText>

      {empty ? (
        <View style={styles.emptyWrap}>
          <NoElection width={86} height={86} />
          <AppText style={styles.emptyTitle}>No Election Report yet</AppText>
          <AppText style={styles.emptySubtitle}>
            Citizen Monitor have not commence operate then.
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {collation.geoBreakdown.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.rowTop}>
                <AppText style={styles.cardTitle}>{item.name}</AppText>
                <AppText style={styles.cardMeta}>
                  {item.reports} reports, {item.incidents} incidents
                </AppText>
              </View>

              <View style={styles.rowMid}>
                <AppText style={styles.coverageText}>
                  {item.coveredUnits}/{item.totalUnits} Polling Units
                </AppText>
              </View>

              <View style={styles.partyChipsRow}>
                {item.parties.map((party) => (
                  <View key={`${item.id}-${party.shortName}`} style={styles.partyChip}>
                    <View
                      style={[
                        styles.partyDot,
                        { backgroundColor: party.color },
                      ]}
                    />
                    <AppText style={styles.partyChipText}>
                      {party.shortName} ({party.percent}%)
                    </AppText>
                  </View>
                ))}
              </View>

              <View style={styles.bottomRow}>
                <AppText style={styles.votesText}>
                  {formatCompactNumber(item.totalVotes)} Votes
                </AppText>
                <AppText style={styles.percentTotal}>42.5% of total votes</AppText>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },

  title: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  list: {
    gap: 12,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    backgroundColor: Theme.colors.surface,
    padding: 12,
    gap: 10,
  },

  rowTop: {
    gap: 4,
  },

  cardTitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  cardMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  rowMid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  coverageText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
  },

  partyChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  partyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  partyDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },

  partyChipText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  votesText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  percentTotal: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 6,
  },

  emptyTitle: {
    fontSize: 22,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 220,
  },
});