// ─── src/components/collation/ReviewReportsSkeleton.tsx ───────────────────
// Loading placeholder for the Review Reports tab — mirrors the real card
// shapes (result card with party rows, incident row with thread line) so
// the transition into real content doesn't jump.

import { StyleSheet, View } from "react-native";

import { Theme } from "@/theme";

function ResultCardSkeleton() {
  return (
    <View style={styles.resultWrap}>
      <View style={styles.resultHeaderRow}>
        <View style={styles.dotLine} />
        <View style={styles.timePill} />
      </View>
      <View style={styles.resultCard}>
        <View style={styles.titleLine} />
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.partyBlock}>
            <View style={styles.partyTopRow}>
              <View style={styles.partyLogo} />
              <View style={styles.partyNameLine} />
              <View style={styles.partyPercentLine} />
            </View>
            <View style={styles.progressTrack} />
          </View>
        ))}
      </View>
      <View style={styles.footerRow}>
        <View style={styles.linkLine} />
        <View style={styles.reviewLine} />
        <View style={styles.actionsRow}>
          <View style={styles.actionPill} />
          <View style={styles.actionPill} />
        </View>
      </View>
    </View>
  );
}

function IncidentRowSkeleton({ isLast }: { isLast: boolean }) {
  return (
    <View style={styles.incidentRow}>
      <View style={styles.incidentLeftCol}>
        <View style={styles.incidentIcon} />
        {!isLast ? <View style={styles.threadLine} /> : null}
      </View>
      <View style={styles.incidentContent}>
        <View style={styles.incidentLabelLine} />
        <View style={styles.incidentTimeLine} />
        <View style={[styles.incidentBodyLine, { width: "94%" }]} />
        <View style={[styles.incidentBodyLine, { width: "70%" }]} />
        <View style={styles.linkLine} />
        <View style={styles.reviewLine} />
        <View style={styles.actionsRow}>
          <View style={styles.actionPill} />
          <View style={styles.actionPill} />
        </View>
      </View>
    </View>
  );
}

export default function ReviewReportsSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.sectionTitleLine} />
      <View style={styles.sectionSubtitleLine} />

      <ResultCardSkeleton />

      <View style={{ height: 24 }} />

      {Array.from({ length: 3 }).map((_, index) => (
        <IncidentRowSkeleton key={index} isLast={index === 2} />
      ))}
    </View>
  );
}

const BONE = "rgba(17,26,50,0.07)";
const BONE_SOFT = "rgba(17,26,50,0.055)";

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitleLine: {
    width: "62%",
    height: 16,
    borderRadius: 999,
    backgroundColor: BONE,
    marginBottom: 10,
  },
  sectionSubtitleLine: {
    width: "88%",
    height: 12,
    borderRadius: 999,
    backgroundColor: BONE_SOFT,
    marginBottom: 20,
  },

  resultHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dotLine: { width: 130, height: 14, borderRadius: 999, backgroundColor: BONE },
  timePill: { width: 60, height: 12, borderRadius: 999, backgroundColor: BONE_SOFT },

  resultWrap: {},
  resultCard: {
    borderRadius: 16,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 14,
    gap: 14,
  },
  titleLine: { width: "70%", height: 14, borderRadius: 999, backgroundColor: BONE },
  partyBlock: { gap: 8 },
  partyTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  partyLogo: { width: 26, height: 20, borderRadius: 4, backgroundColor: BONE },
  partyNameLine: { flex: 1, height: 12, borderRadius: 999, backgroundColor: BONE_SOFT },
  partyPercentLine: { width: 32, height: 12, borderRadius: 999, backgroundColor: BONE },
  progressTrack: { height: 6, borderRadius: 999, backgroundColor: BONE_SOFT },

  footerRow: { paddingTop: 14, gap: 10 },
  linkLine: { width: 120, height: 12, borderRadius: 999, backgroundColor: BONE },
  reviewLine: { width: 150, height: 11, borderRadius: 999, backgroundColor: BONE_SOFT },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionPill: { width: 90, height: 36, borderRadius: 12, backgroundColor: BONE },

  incidentRow: { flexDirection: "row", gap: 12, marginBottom: 6 },
  incidentLeftCol: { width: 44, alignItems: "center" },
  incidentIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: BONE },
  threadLine: { flex: 1, width: 2, backgroundColor: BONE_SOFT, marginTop: 4, borderRadius: 1 },
  incidentContent: { flex: 1, paddingBottom: 20, gap: 8 },
  incidentLabelLine: { width: 90, height: 14, borderRadius: 999, backgroundColor: BONE },
  incidentTimeLine: { width: 110, height: 11, borderRadius: 999, backgroundColor: BONE_SOFT },
  incidentBodyLine: { height: 12, borderRadius: 999, backgroundColor: BONE_SOFT, marginTop: 4 },
});
