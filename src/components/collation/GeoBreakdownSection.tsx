import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { CollationItem, formatCompactNumber } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";

type Props = { collation: CollationItem };

export default function GeoBreakdownSection({ collation }: Props) {
  // Only show empty when there is genuinely no geo data — not based on
  // whether the viewer is assigned to a polling unit.
  const empty = !collation.geoBreakdown.length;

  return (
    <View style={styles.wrap}>
      {/* Grouping level comes from the API (state for national elections,
          LGA for state-level ones) so the heading always matches the data. */}
      <AppText style={styles.title}>
        Geo Election Result Breakdown by {collation.geoGroupLabel}
      </AppText>
      <AppText style={styles.subtitle}>
        Captured from real reports of this election from{" "}
        {collation.resultsUploaded.toLocaleString()} results and{" "}
        {collation.incidentsReported.toLocaleString()} incidents reported from{" "}
        {collation.coveredUnits.toLocaleString()}/
        {collation.totalUnits.toLocaleString()} polling units in{" "}
        {collation.geoScopeLabel}.
      </AppText>

      {empty ? (
        <View style={styles.emptyWrap}>
          <NoElection width={86} height={86} />
          <AppText style={styles.emptyTitle}>No Election Report yet</AppText>
          <AppText style={styles.emptySubtitle}>
            Citizen Monitor have not commenced operation yet.
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {collation.geoBreakdown.map((item) => {
            const total = item.parties.reduce((s, p) => s + p.percent, 0) || 1;

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.rowTop}>
                  <AppText style={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </AppText>
                  <AppText style={styles.cardMeta} numberOfLines={1}>
                    {item.reports.toLocaleString()} results ·{" "}
                    {item.incidents.toLocaleString()} incidents
                  </AppText>
                </View>

                <AppText style={styles.coverageText} numberOfLines={1}>
                  {item.coveredUnits.toLocaleString()}/
                  {item.totalUnits.toLocaleString()} Polling Units
                </AppText>

                <View style={styles.stackedBar}>
                  {item.parties.map((p) => (
                    <View
                      key={`${item.id}-${p.shortName}`}
                      style={{
                        flex: p.percent / total,
                        height: 8,
                        backgroundColor: p.color,
                      }}
                    />
                  ))}
                </View>

                <View style={styles.partyChipsRow}>
                  {item.parties.map((p) => (
                    <View key={`${item.id}-chip-${p.shortName}`} style={styles.partyChip}>
                      <View style={[styles.partyDot, { backgroundColor: p.color }]} />
                      <AppText style={styles.partyChipText} numberOfLines={1}>
                        {p.shortName} ({p.percent}%)
                      </AppText>
                    </View>
                  ))}
                </View>

                <View style={styles.bottomRow}>
                  <AppText style={styles.votesText} numberOfLines={1}>
                    {formatCompactNumber(item.totalVotes)} Votes
                  </AppText>
                  <AppText style={styles.percentTotal} numberOfLines={1}>
                    {item.percentOfTotalVotes}% of total votes
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  title: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  subtitle: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },
  list: { gap: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    padding: 14,
    gap: 10,
  },
  rowTop: { gap: 3 },
  cardTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  cardMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
  coverageText: { fontSize: 12, lineHeight: 16, color: Theme.colors.text },
  stackedBar: {
    flexDirection: "row",
    borderRadius: 999,
    overflow: "hidden",
    height: 8,
  },
  partyChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  partyChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  partyDot: { width: 8, height: 8, borderRadius: 999 },
  partyChipText: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  votesText: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
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
    fontSize: 20,
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
