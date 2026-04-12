// ─── src/components/collation/CollationOverviewTab.tsx ────────────────────────
import { useCallback, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, RefreshControl, ScrollView, Platform, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import GeoBreakdownSection from "@/components/collation/GeoBreakdownSection";
import PartyResultRow from "@/components/collation/PartyResultRow";
import SentimentAnalysisSection from "@/components/collation/SentimentAnalysisSection";
import { CollationItem, formatCompactNumber } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";
import INEC from "@/svgs/app/collation/INEC";


type Props = { collation: CollationItem };
type LowerTab = "geo" | "sentiment";

export default function CollationOverviewTab({ collation }: Props) {
  const [lowerTab, setLowerTab] = useState<LowerTab>("geo");
  const [refreshing, setRefreshing] = useState(false);

  const hasNoData = useMemo(
    () => !collation.isAssignedToPollingUnit,
    [collation.isAssignedToPollingUnit]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1400);
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor={Theme.colors.primary} colors={[Theme.colors.primary]} />
      }
    >
      {/* Meta row */}
      <View style={styles.metaRow}>
        <AppText style={styles.lastSyncText}>Last sync: {collation.lastSyncLabel}</AppText>
        <Pressable onPress={onRefresh} style={styles.refreshPill}>
          <Ionicons name="refresh-outline" size={12} color={Theme.colors.primary} />
          <AppText style={styles.refreshText}>Refresh Data</AppText>
        </Pressable>
      </View>

      {/* Title */}
      <AppText style={styles.title}>{collation.fullTitle}</AppText>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color={Theme.colors.textMuted} />
        <AppText style={styles.infoText}>{collation.location}</AppText>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={14} color={Theme.colors.textMuted} />
        <AppText style={styles.infoText}>{collation.dateRange}</AppText>
      </View>

      <AppText style={styles.description}>{collation.description}</AppText>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatBox value={collation.resultsUploaded} label="Results Uploaded" valueColor={Theme.colors.primary} />
        <StatBox value={collation.incidentsReported} label="Incident Reported" valueColor="#F04A1D" />
        <StatBox value={collation.observersCount} label="Volunteer & Observers" valueColor={Theme.colors.text} />
      </View>

      {/* Progress */}
      <View style={styles.progressHeaderRow}>
        <View style={styles.progressLabelWrap}>
          <Ionicons name="bar-chart-outline" size={13} color={Theme.colors.primary} />
          <AppText style={styles.progressLabel}>COLLATION PROGRESS</AppText>
        </View>
        <AppText style={styles.progressPercent}>{collation.progressPercent}%</AppText>
      </View>
      <CollationAnimatedProgressBar progress={collation.progressPercent} height={6} color={Theme.colors.primary} trackColor="#DADFE7" />
      <View style={styles.progressBottomRow}>
        <AppText style={styles.progressUnits}>{collation.coveredUnits} of {collation.totalUnits} polling units</AppText>
        <AppText style={styles.progressVotes}>{collation.totalVotesLabel}</AppText>
      </View>

      {/* Parties */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Parties</AppText>
        {!hasNoData ? (
          <View style={styles.partyList}>
            {collation.parties.map((p) => <PartyResultRow key={p.id} party={p} />)}
          </View>
        ) : (
          <EmptyInlineBlock title="No Election Report yet" subtitle="No election was held on this day(s)" />
        )}
      </View>

      {/* Promo */}
      <View style={styles.promoCard}>
        <View style={styles.promoHeader}>
          <AppText style={styles.promoBrand}>Citizen Monitor</AppText>
          <Ionicons name="trophy-outline" size={20} color="#FFB547" />
        </View>
        <AppText style={styles.promoTitle}>Our observer voice will make this election transparent to the world!</AppText>
        <AppText style={styles.promoBody}>Empowering citizens to hold elections accountable through crowdsourced data. We&apos;re promoting transparency and trust in African elections again.</AppText>
      </View>

      {/* Admin figures */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Administrative Figures from EC8A Sheet</AppText>
        <AppText style={styles.sectionSubtitle}>See the aggregate voters reports from {collation.coveredUnits} Polling Units in Alimosho reported by our observer.</AppText>

        {!hasNoData ? (
          <>
            <View style={styles.figureGrid}>
              <FigureItem label="Accredited voter" value={formatCompactNumber(collation.officialSummary.accreditedVoters)} />
              <FigureItem label="Rejected Votes" value={formatCompactNumber(collation.officialSummary.rejectedVotes)} />
              <FigureItem label="Spoiled Ballot Papers" value={formatCompactNumber(collation.officialSummary.spoiledBallots)} />
              <FigureItem label="Used Ballot Papers" value={formatCompactNumber(collation.officialSummary.usedBallots)} />
              <FigureItem label="Unused Ballot Papers" value={formatCompactNumber(collation.officialSummary.unusedBallots)} />
            </View>
            <AppText style={styles.lastSyncBottom}>Last sync: {collation.lastSyncLabel}</AppText>
          </>
        ) : (
          <EmptyInlineBlock title="No Election Report yet" subtitle="Citizen Monitor have not commenced operation yet." />
        )}

        {/* INEC aggregate card with SVG */}
        <Pressable style={styles.inecCard}>
          <View style={styles.inecLeft}>
            <INEC width={44} height={44} />
            <View style={styles.inecTextWrap}>
              <AppText style={styles.inecMeta}>Reported by INEC officially</AppText>
              <View style={styles.inecValueRow}>
                <AppText style={styles.inecValue}>{collation.officialSummary.aggregateVoters}</AppText>
                <AppText style={styles.inecLabel}>Aggregate Voters</AppText>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
        </Pressable>
      </View>

      {/* Lower tabs */}
      <View style={styles.lowerTabsRow}>
        <LowerTabButton title="GEO BREAKDOWN" active={lowerTab === "geo"} onPress={() => setLowerTab("geo")} />
        <LowerTabButton title="SENTIMENT ANALYSIS" active={lowerTab === "sentiment"} onPress={() => setLowerTab("sentiment")} />
      </View>

      {lowerTab === "geo" ? <GeoBreakdownSection collation={collation} /> : <SentimentAnalysisSection collation={collation} />}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function StatBox({ value, label, valueColor }: { value: number; label: string; valueColor: string }) {
  return (
    <View style={styles.statBox}>
      <AppText style={[styles.statValue, { color: valueColor }]}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

function FigureItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.figureItem}>
      <AppText style={styles.figureLabel}>{label}</AppText>
      <AppText style={styles.figureValue}>{value}</AppText>
    </View>
  );
}

function LowerTabButton({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.lowerTabButton, active && styles.lowerTabButtonActive]}>
      <AppText style={[styles.lowerTabText, active && styles.lowerTabTextActive]}>{title}</AppText>
    </Pressable>
  );
}

function EmptyInlineBlock({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.emptyWrap}>
      <NoElection width={88} height={88} />
      <AppText style={styles.emptyTitle}>{title}</AppText>
      <AppText style={styles.emptySubtitle}>{subtitle}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, gap: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  lastSyncText: { fontSize: 11, lineHeight: 16, color: Theme.colors.textMuted },
  refreshPill: { minHeight: 28, borderRadius: 999, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "rgba(5,163,156,0.24)", backgroundColor: "#F4FFFE" },
  refreshText: { fontSize: 11, lineHeight: 14, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  title: { fontSize: 24, lineHeight: 27, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: -8 },
  infoText: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },
  description: { fontSize: 14, lineHeight: 22, color: Theme.colors.text },
  statsGrid: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1, minHeight: 88, borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface, paddingHorizontal: 12, paddingVertical: 12, justifyContent: "space-between",
    ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 }, android: { elevation: 1 } }),
  },
  statValue: { fontSize: 26, lineHeight: 28, fontFamily: Theme.fonts.heading.bold },
  statLabel: { fontSize: 11, lineHeight: 15, color: Theme.colors.text, fontFamily: Theme.fonts.body.medium },
  progressHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: -2 },
  progressLabelWrap: { flexDirection: "row", alignItems: "center", gap: 5 },
  progressLabel: { fontSize: 11, lineHeight: 14, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  progressPercent: { fontSize: 12, lineHeight: 16, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  progressBottomRow: { marginTop: -10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  progressUnits: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  progressVotes: { fontSize: 13, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.medium },
  section: { gap: 12 },
  sectionTitle: { fontSize: 15, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  sectionSubtitle: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },
  partyList: { gap: 10 },
  promoCard: { borderRadius: 18, backgroundColor: "#DDF7E8", padding: 16, gap: 8 },
  promoHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  promoBrand: { fontSize: 16, lineHeight: 20, color: Theme.colors.primary, fontFamily: Theme.fonts.heading.bold },
  promoTitle: { fontSize: 20, lineHeight: 24, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },
  promoBody: { fontSize: 13, lineHeight: 18, color: Theme.colors.text },
  figureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  figureItem: { width: "47%", gap: 4 },
  figureLabel: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  figureValue: { fontSize: 28, lineHeight: 28, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },
  lastSyncBottom: { marginTop: 4, textAlign: "center", fontSize: 11, lineHeight: 16, color: Theme.colors.textMuted },

  /* INEC card — matches Figma */
  inecCard: {
    minHeight: 68, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, android: { elevation: 1 } }),
  },
  inecLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  inecTextWrap: { flex: 1, gap: 2 },
  inecMeta: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  inecValueRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  inecValue: { fontSize: 22, lineHeight: 24, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },
  inecLabel: { fontSize: 13, lineHeight: 18, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },

  lowerTabsRow: { flexDirection: "row", gap: 10 },
  lowerTabButton: { minHeight: 32, borderRadius: 999, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#F4F5F7" },
  lowerTabButtonActive: { backgroundColor: Theme.colors.primary },
  lowerTabText: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted, fontFamily: Theme.fonts.body.medium },
  lowerTabTextActive: { color: Theme.colors.white, fontFamily: Theme.fonts.body.semibold },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 14, gap: 6 },
  emptyTitle: { fontSize: 20, lineHeight: 24, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold, textAlign: "center" },
  emptySubtitle: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted, textAlign: "center", maxWidth: 220 },
});