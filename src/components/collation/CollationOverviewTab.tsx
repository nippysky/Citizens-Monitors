import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";

import {
  CollationItem,
  formatCompactNumber,
} from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";
import GeoBreakdownSection from "./GeoBreakdownSection";
import PartyResultRow from "./PartyResultRow";
import SentimentAnalysisSection from "./SentimentAnalysisSection";

type Props = {
  collation: CollationItem;
};

type LowerTab = "geo" | "sentiment";

export default function CollationOverviewTab({ collation }: Props) {
  const [lowerTab, setLowerTab] = useState<LowerTab>("geo");

  const hasNoData = useMemo(
    () => !collation.isAssignedToPollingUnit,
    [collation.isAssignedToPollingUnit]
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.metaRow}>
        <AppText style={styles.lastSyncText}>
          Last sync: {collation.lastSyncLabel}
        </AppText>

        <View style={styles.refreshPill}>
          <Ionicons
            name="refresh-outline"
            size={12}
            color={Theme.colors.primary}
          />
          <AppText style={styles.refreshText}>Refresh Data</AppText>
        </View>
      </View>

      <AppText style={styles.title}>{collation.fullTitle}</AppText>

      <View style={styles.locationRow}>
        <Ionicons
          name="location-outline"
          size={14}
          color={Theme.colors.textMuted}
        />
        <AppText style={styles.locationText}>{collation.location}</AppText>
      </View>

      <View style={styles.locationRow}>
        <Ionicons
          name="calendar-outline"
          size={14}
          color={Theme.colors.textMuted}
        />
        <AppText style={styles.locationText}>{collation.dateRange}</AppText>
      </View>

      <AppText style={styles.description}>{collation.description}</AppText>

      <View style={styles.statsGrid}>
        <StatBox
          value={collation.resultsUploaded}
          label="Results Uploaded"
          valueColor={Theme.colors.primary}
        />
        <StatBox
          value={collation.incidentsReported}
          label="Incident Reported"
          valueColor="#F04A1D"
        />
        <StatBox
          value={collation.observersCount}
          label="Volunteer & Observers"
          valueColor={Theme.colors.text}
        />
      </View>

      <View style={styles.progressHeaderRow}>
        <View style={styles.progressLabelWrap}>
          <Ionicons
            name="bar-chart-outline"
            size={13}
            color={Theme.colors.primary}
          />
          <AppText style={styles.progressLabel}>COLLATION PROGRESS</AppText>
        </View>

        <AppText style={styles.progressPercent}>
          {collation.progressPercent}%
        </AppText>
      </View>

      <CollationAnimatedProgressBar
        progress={collation.progressPercent}
        height={5}
        color={Theme.colors.primary}
        trackColor="#DADFE7"
      />

      <View style={styles.progressBottomRow}>
        <AppText style={styles.progressUnits}>
          {collation.coveredUnits} of {collation.totalUnits} polling units
        </AppText>

        <AppText style={styles.progressVotes}>
          {collation.totalVotesLabel}
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Parties</AppText>

        {!hasNoData ? (
          <View style={styles.partyList}>
            {collation.parties.map((party) => (
              <PartyResultRow key={party.id} party={party} />
            ))}
          </View>
        ) : (
          <EmptyInlineBlock
            title="No Election Report yet"
            subtitle="No election was held on this day(s)"
          />
        )}
      </View>

      <View style={styles.promoCard}>
        <View style={styles.promoHeader}>
          <AppText style={styles.promoBrand}>Citizen Monitor</AppText>
          <Ionicons name="trophy-outline" size={22} color="#FFB547" />
        </View>

        <AppText style={styles.promoTitle}>
          Our observer voice will makes this election transparent to the world!
        </AppText>

        <AppText style={styles.promoBody}>
          Empowering citizens to hold elections accountable through crowdsourced
          data. We&apos;re promoting transparency and trust in African elections
          again.
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>
          Administrative Figures from EC8A Sheet
        </AppText>
        <AppText style={styles.sectionSubtitle}>
          See the aggregate voters reports from 14 Polling Units in Alimosho
          reported by our observer.
        </AppText>

        {!hasNoData ? (
          <>
            <View style={styles.figureGrid}>
              <FigureItem
                label="Accredited voter"
                value={formatCompactNumber(
                  collation.officialSummary.accreditedVoters
                )}
              />
              <FigureItem
                label="Rejected Votes"
                value={formatCompactNumber(collation.officialSummary.rejectedVotes)}
              />
              <FigureItem
                label="Spoiled Ballot Papers"
                value={formatCompactNumber(collation.officialSummary.spoiledBallots)}
              />
              <FigureItem
                label="Used Ballot Papers"
                value={formatCompactNumber(collation.officialSummary.usedBallots)}
              />
              <FigureItem
                label="Unused Ballot Papers"
                value={formatCompactNumber(collation.officialSummary.unusedBallots)}
              />
            </View>

            <AppText style={styles.lastSyncBottom}>
              Last sync: {collation.lastSyncLabel}
            </AppText>

            <View style={styles.aggregateCard}>
              <View style={styles.aggregateLeft}>
                <AppText style={styles.aggregateMeta}>
                  Reported by INEC officially
                </AppText>
                <AppText style={styles.aggregateValue}>
                  {collation.officialSummary.aggregateVoters}
                </AppText>
              </View>

              <AppText style={styles.aggregateRight}>Aggregate Voters</AppText>
            </View>
          </>
        ) : (
          <>
            <EmptyInlineBlock
              title="No Election Report yet"
              subtitle="Citizen Monitor have not commence operate then."
            />

            <View style={styles.aggregateCard}>
              <View style={styles.aggregateLeft}>
                <AppText style={styles.aggregateMeta}>
                  Reported by INEC officially
                </AppText>
                <AppText style={styles.aggregateValue}>Not recorded yet</AppText>
              </View>

              <AppText style={styles.aggregateRight}>Aggregate Voters</AppText>
            </View>
          </>
        )}
      </View>

      <View style={styles.lowerTabsRow}>
        <LowerTabButton
          title="GEO BREAKDOWN"
          active={lowerTab === "geo"}
          onPress={() => setLowerTab("geo")}
        />
        <LowerTabButton
          title="SENTIMENT ANALYSIS"
          active={lowerTab === "sentiment"}
          onPress={() => setLowerTab("sentiment")}
        />
      </View>

      {lowerTab === "geo" ? (
        <GeoBreakdownSection collation={collation} />
      ) : (
        <SentimentAnalysisSection collation={collation} />
      )}
    </ScrollView>
  );
}

function StatBox({
  value,
  label,
  valueColor,
}: {
  value: number;
  label: string;
  valueColor: string;
}) {
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

function LowerTabButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <View style={[styles.lowerTabButton, active && styles.lowerTabButtonActive]}>
      <AppText
        style={[styles.lowerTabText, active && styles.lowerTabTextActive]}
        onPress={onPress}
      >
        {title}
      </AppText>
    </View>
  );
}

function EmptyInlineBlock({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.emptyWrap}>
      <NoElection width={88} height={88} />
      <AppText style={styles.emptyTitle}>{title}</AppText>
      <AppText style={styles.emptySubtitle}>{subtitle}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 16,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  lastSyncText: {
    fontSize: 11,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  refreshPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.24)",
    backgroundColor: "#F4FFFE",
  },

  refreshText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  title: {
    fontSize: 28,
    lineHeight: 29,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -8,
  },

  locationText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Theme.colors.text,
  },

  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },

  statBox: {
    flex: 1,
    minHeight: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "space-between",
  },

  statValue: {
    fontSize: 30,
    lineHeight: 30,
    fontFamily: Theme.fonts.heading.bold,
  },

  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  progressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -2,
  },

  progressLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  progressLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  progressPercent: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  progressBottomRow: {
    marginTop: -10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  progressUnits: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  progressVotes: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  section: {
    gap: 10,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  partyList: {
    gap: 10,
  },

  promoCard: {
    borderRadius: 18,
    backgroundColor: "#DDF7E8",
    padding: 16,
    gap: 10,
  },

  promoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  promoBrand: {
    fontSize: 18,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.heading.bold,
  },

  promoTitle: {
    fontSize: 24,
    lineHeight: 27,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  promoBody: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
  },

  figureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  figureItem: {
    width: "47%",
    gap: 4,
  },

  figureLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  figureValue: {
    fontSize: 31,
    lineHeight: 30,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  lastSyncBottom: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  aggregateCard: {
    minHeight: 58,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    backgroundColor: Theme.colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  aggregateLeft: {
    flex: 1,
    gap: 2,
  },

  aggregateMeta: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },

  aggregateValue: {
    fontSize: 24,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  aggregateRight: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  lowerTabsRow: {
    flexDirection: "row",
    gap: 10,
  },

  lowerTabButton: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F5F7",
  },

  lowerTabButtonActive: {
    backgroundColor: Theme.colors.primary,
  },

  lowerTabText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  lowerTabTextActive: {
    color: Theme.colors.white,
    fontFamily: Theme.fonts.body.semibold,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
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