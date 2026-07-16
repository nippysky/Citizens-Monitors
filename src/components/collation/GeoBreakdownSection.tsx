// ─── src/components/collation/GeoBreakdownSection.tsx ─────────────────────────
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";
import { CollationItem, formatCompactNumber } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";

type Props = { collation: CollationItem };

export default function GeoBreakdownSection({ collation }: Props) {
  // Only show empty when there is genuinely no geo data — not based on
  // whether the viewer is assigned to a polling unit.
  const empty = !collation.geoBreakdown.length;

  // Local state: agreed / flagged sets per item id
  const [agreedIds, setAgreedIds] = useState<Set<string>>(new Set());
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  const toggleAgree = (id: string) => {
    setAgreedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Unflag if agreeing
        setFlaggedIds((f) => {
          const fn = new Set(f);
          fn.delete(id);
          return fn;
        });
      }
      return next;
    });
  };

  const toggleFlag = (id: string) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Un-agree if flagging
        setAgreedIds((a) => {
          const an = new Set(a);
          an.delete(id);
          return an;
        });
      }
      return next;
    });
  };

  return (
    <View style={styles.wrap}>
      <AppText style={styles.title}>Geo Election Result Breakdown by LGA</AppText>
      <AppText style={styles.subtitle}>
        Captured from real reports of this election from{" "}
        {collation.resultsUploaded} results and {collation.incidentsReported}{" "}
        incidents reported from {collation.coveredUnits}/{collation.totalUnits}{" "}
        polling units in {collation.location}.
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
            const agreed = agreedIds.has(item.id);
            const flagged = flaggedIds.has(item.id);

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.rowTop}>
                  <AppText style={styles.cardTitle}>{item.name}</AppText>
                  <AppText style={styles.cardMeta}>
                    {item.reports} reports · {item.incidents} incidents
                  </AppText>
                </View>

                <AppText style={styles.coverageText}>
                  {item.coveredUnits}/{item.totalUnits} Polling Units
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
                      <AppText style={styles.partyChipText}>
                        {p.shortName} ({p.percent}%)
                      </AppText>
                    </View>
                  ))}
                </View>

                <View style={styles.bottomRow}>
                  <AppText style={styles.votesText}>
                    {formatCompactNumber(item.totalVotes)} Votes
                  </AppText>
                  <AppText style={styles.percentTotal}>
                    {item.percentOfTotalVotes}% of total
                  </AppText>
                </View>

                {/* Agree / Flag actions */}
                <View style={styles.actionsRow}>
                  <Pressable
                    onPress={() => toggleAgree(item.id)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      agreed && styles.actionBtnAgreed,
                      pressed && styles.actionBtnPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={agreed ? "Remove agreement" : "Agree with this data"}
                  >
                    <Ionicons
                      name={agreed ? "checkmark-circle" : "checkmark-circle-outline"}
                      size={16}
                      color={agreed ? "#FFFFFF" : Theme.colors.primary}
                    />
                    <AppText style={[styles.actionText, agreed && styles.actionTextAgreed]}>
                      {agreed ? "Agreed" : "Agree"}
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => toggleFlag(item.id)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      flagged && styles.actionBtnFlagged,
                      pressed && styles.actionBtnPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={flagged ? "Remove flag" : "Flag this data as inaccurate"}
                  >
                    <Ionicons
                      name={flagged ? "flag" : "flag-outline"}
                      size={16}
                      color={flagged ? "#FFFFFF" : "#E45125"}
                    />
                    <AppText style={[styles.actionText, styles.actionTextFlag, flagged && styles.actionTextFlagged]}>
                      {flagged ? "Flagged" : "Flag"}
                    </AppText>
                  </Pressable>
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
  cardMeta: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
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
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 2,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(5,163,156,0.30)",
    backgroundColor: "rgba(5,163,156,0.06)",
  },
  actionBtnAgreed: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  actionBtnFlagged: {
    backgroundColor: "#E45125",
    borderColor: "#E45125",
  },
  actionBtnPressed: {
    opacity: 0.78,
  },
  actionText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  actionTextFlag: {
    color: "#E45125",
  },
  actionTextAgreed: {
    color: "#FFFFFF",
  },
  actionTextFlagged: {
    color: "#FFFFFF",
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
