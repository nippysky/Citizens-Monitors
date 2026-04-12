// ─── src/components/collation/GeoBreakdownSection.tsx ─────────────────────────
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { CollationItem, formatCompactNumber } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";

type Props = { collation: CollationItem };

export default function GeoBreakdownSection({ collation }: Props) {
  const empty =
    !collation.geoBreakdown.length || !collation.isAssignedToPollingUnit;

  return (
    <View style={styles.wrap}>
      <AppText style={styles.title}>
        Geo Election Result Breakdown by LGA
      </AppText>
      <AppText style={styles.subtitle}>
        Captured from real reports of this election from{" "}
        {collation.resultsUploaded} results and {collation.incidentsReported}{" "}
        incidents reported from {collation.coveredUnits}/{collation.totalUnits}{" "}
        polling units in Alimosho.
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
                  <AppText style={styles.cardTitle}>{item.name}</AppText>
                  <AppText style={styles.cardMeta}>
                    {item.reports} reports, {item.incidents} incidents
                  </AppText>
                </View>

                {/* coverage */}
                <AppText style={styles.coverageText}>
                  {item.coveredUnits}/{item.totalUnits} Polling Units
                </AppText>

                {/* stacked horizontal bar */}
                <View style={styles.stackedBar}>
                  {item.parties.map((p) => (
                    <View
                      key={`${item.id}-${p.shortName}`}
                      style={{
                        flex: p.percent / total,
                        height: 7,
                        backgroundColor: p.color,
                      }}
                    />
                  ))}
                </View>

                {/* party chips */}
                <View style={styles.partyChipsRow}>
                  {item.parties.map((p) => (
                    <View
                      key={`${item.id}-chip-${p.shortName}`}
                      style={styles.partyChip}
                    >
                      <View
                        style={[styles.partyDot, { backgroundColor: p.color }]}
                      />
                      <AppText style={styles.partyChipText}>
                        {p.shortName} ({p.percent}%)
                      </AppText>
                    </View>
                  ))}
                </View>

                {/* bottom */}
                <View style={styles.bottomRow}>
                  <AppText style={styles.votesText}>
                    {formatCompactNumber(item.totalVotes)} Votes
                  </AppText>
                  <AppText style={styles.percentTotal}>
                    42.5% of total votes
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
    padding: 12,
    gap: 10,
  },
  rowTop: { gap: 4 },
  cardTitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  cardMeta: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  coverageText: { fontSize: 12, lineHeight: 16, color: Theme.colors.text },
  stackedBar: {
    flexDirection: "row",
    borderRadius: 999,
    overflow: "hidden",
    height: 7,
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