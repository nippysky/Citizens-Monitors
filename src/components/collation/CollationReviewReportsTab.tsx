// ─── src/components/collation/CollationReviewReportsTab.tsx ───────────────────
// Fixed: enqueue calls moved outside setConfirmedIds/setFlaggedIds updaters
// to avoid "Cannot update component while rendering another" error.
// ─────────────────────────────────────────────────────────────────────────────

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useCallback, useRef, useState } from "react";

import AppText from "@/components/ui/AppText";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import FlagReportBottomSheet from "@/components/collation/FlagReportBottomSheet";
import SeeEvidenceBottomSheet, {
  EvidencePayload,
} from "@/components/collation/SeeEvidenceBottomSheet";
import { useAppToast } from "@/hooks/useAppToast";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { CollationItem, formatCompactNumber } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";
import Incident from "@/svgs/app/collation/Incident";
import { getPartyLogo } from "@/svgs/app/collation/parties";

type Props = { collation: CollationItem };

export default function CollationReviewReportsTab({ collation }: Props) {
  const { showToast } = useAppToast();
  const { enqueue } = useOfflineSync();
  const evidenceRef = useRef<BottomSheetModal>(null);
  const flagRef = useRef<BottomSheetModal>(null);
  const [selectedEvidence, setSelectedEvidence] =
    useState<EvidencePayload | null>(null);
  const [flagTargetId, setFlagTargetId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Seed confirmed/flagged from data
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(() => {
    const s = new Set<string>();
    collation.reviewReports.forEach((r) => {
      if (r.isConfirmed) s.add(r.id);
    });
    return s;
  });

  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(() => {
    const s = new Set<string>();
    collation.reviewReports.forEach((r) => {
      if (r.flagged) s.add(r.id);
    });
    return s;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1400);
  }, []);

  const buildEvidence = useCallback(
    (report: (typeof collation.reviewReports)[number]): EvidencePayload => {
      const isResult = report.type === "result";
      return {
        title: report.title,
        note: isResult
          ? "Signed result sheet was captured immediately after polling unit collation."
          : "Incident evidence was captured live at the polling unit.",
        locationMeta: "No 20 Ao, Alimosho, Lagos State, Nigeria",
        pollingUnitName: "Ikotun Primary School",
        pollingUnitCode: "PU LA/12/35",
        observerHandle: report.author,
        submittedAt: isResult
          ? "15 Mar 2027 · 08:42 AM WAT"
          : report.createdAgo,
        verificationStatus: isResult ? "verified" : "pending",
        sourceType: isResult ? "observer-upload" : "community-report",
        electionName: collation.fullTitle,
        accreditedVoter: isResult ? "675,435" : "—",
        rejectedVotes: isResult ? "657" : "—",
        spoiledBallots: isResult ? "320" : "—",
        usedBallots: isResult ? "601" : "—",
        unusedBallots: isResult ? "87" : "—",
        imageUri:
          report.type === "incident"
            ? "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
            : "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80",
        videoUri: "https://www.w3schools.com/html/mov_bbb.mp4",
      };
    },
    [collation]
  );

  const handleOpenEvidence = useCallback(
    (report: (typeof collation.reviewReports)[number]) => {
      setSelectedEvidence(buildEvidence(report));
      requestAnimationFrame(() => evidenceRef.current?.present());
    },
    [buildEvidence, collation]
  );

  // ── Toggle confirm (undo-able) ──
  // enqueue is called AFTER the state updater, never inside it.
  const handleToggleConfirm = useCallback(
    (id: string) => {
      const wasConfirmed = confirmedIds.has(id);

      // 1. Update local state
      setConfirmedIds((prev) => {
        const next = new Set(prev);
        if (wasConfirmed) next.delete(id);
        else next.add(id);
        return next;
      });

      // 2. Queue for sync (outside the updater)
      enqueue({
        type: "confirm-report",
        payload: {
          reportId: id,
          action: wasConfirmed ? "undo-confirm" : "confirm",
        },
      });

      // 3. Toast
      showToast({
        type: "success",
        message: wasConfirmed
          ? "Confirmation undone."
          : "Report confirmed — thank you.",
      });
    },
    [confirmedIds, enqueue, showToast]
  );

  // ── Flag (permanent) ──
  const handleOpenFlag = useCallback((id: string) => {
    setFlagTargetId(id);
    requestAnimationFrame(() => flagRef.current?.present());
  }, []);

  const handleFlagSubmitted = useCallback(() => {
    if (flagTargetId) {
      setFlaggedIds((prev) => new Set(prev).add(flagTargetId));

      // enqueue outside updater
      enqueue({ type: "flag-report", payload: { reportId: flagTargetId } });
    }
    showToast({
      type: "success",
      message: "Report flagged — evidence under review.",
    });
  }, [flagTargetId, enqueue, showToast]);

  // ── Share ──
  const handleShare = useCallback(
    async (report: (typeof collation.reviewReports)[number]) => {
      const isResult = report.type === "result";
      const partyLines = isResult
        ? collation.parties
            .map(
              (p) =>
                `${p.shortName}: ${formatCompactNumber(p.votes)} votes (${p.percent}%)`
            )
            .join("\n")
        : "";
      const message = [
        `📊 ${collation.fullTitle}`,
        "",
        isResult
          ? "Result Report — EC8A"
          : `⚠️ ${report.tag ?? "Incident Report"}`,
        "",
        report.body,
        partyLines ? `\n${partyLines}` : "",
        "",
        "Shared via Citizen Monitors",
      ]
        .filter(Boolean)
        .join("\n");

      try {
        await Share.share({ message });
      } catch {
        showToast({ type: "error", message: "Unable to share right now." });
      }
    },
    [collation, showToast]
  );

  const resultReports = collation.reviewReports.filter(
    (r) => r.type === "result"
  );
  const incidentReports = collation.reviewReports.filter(
    (r) => r.type === "incident"
  );

  /* ── Empty state ── */
  if (!collation.canReviewReports) {
    return (
      <>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.pageContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
            />
          }
        >
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>
              Community Verification
            </AppText>
            <AppText style={styles.sectionSubtitle}>
              Review report submitted by our observer at your Polling Units in
              Ikotun Primary School, PU LA/12/35. Confirm what&apos;s accurate,
              and flag what&apos;s false.
            </AppText>
          </View>
          <View style={styles.emptyWrap}>
            <NoElection width={110} height={110} />
            <AppText style={styles.emptyTitle}>
              No Election Report yet
            </AppText>
            <AppText style={styles.emptySubtitle}>
              Citizen Monitor have not commenced operation yet.
            </AppText>
          </View>
        </ScrollView>
        <SeeEvidenceBottomSheet ref={evidenceRef} evidence={selectedEvidence} />
        <FlagReportBottomSheet ref={flagRef} />
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        }
      >
        {/* ── Community Verification ── */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Community Verification</AppText>
          <AppText style={styles.sectionSubtitle}>
            Review report submitted by our observer at your Polling Units in
            Ikotun Primary School, PU LA/12/35. Confirm what&apos;s accurate,
            and flag what&apos;s false.
          </AppText>
        </View>

        {/* ── Result reports ── */}
        {resultReports.map((report) => {
          const isConf = confirmedIds.has(report.id);
          const isFlag = flaggedIds.has(report.id);

          return (
            <View key={report.id}>
              <View style={styles.resultHeaderRow}>
                <View style={styles.resultDotRow}>
                  <View style={styles.redDot} />
                  <AppText style={styles.resultLabel}>
                    Result Report — EC8A
                  </AppText>
                </View>
                <View style={styles.timeRow}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={Theme.colors.textMuted}
                  />
                  <AppText style={styles.timeText}>
                    {report.createdAgo}
                  </AppText>
                </View>
              </View>

              <View style={styles.resultCard}>
                <AppText style={styles.resultElectionTitle}>
                  Lagos State Governorship Election 2026 Result
                </AppText>
                {collation.parties.map((p) => {
                  const Logo = getPartyLogo(p.logoKey);
                  return (
                    <View key={p.id} style={styles.partyBlock}>
                      <View style={styles.partyTopRow}>
                        <View style={styles.partyLeftGroup}>
                          <Logo width={32} height={24} />
                          <AppText style={styles.partyName}>
                            {p.shortName} ({formatCompactNumber(p.votes)} votes)
                          </AppText>
                        </View>
                        <AppText
                          style={[styles.partyPercent, { color: p.color }]}
                        >
                          {p.percent}%
                        </AppText>
                      </View>
                      <CollationAnimatedProgressBar
                        progress={p.percent}
                        height={6}
                        color={p.color}
                        trackColor="#E5E7EB"
                      />
                    </View>
                  );
                })}
              </View>

              <View style={styles.resultFooter}>
                <Pressable
                  onPress={() => handleOpenEvidence(report)}
                  hitSlop={8}
                >
                  <AppText style={styles.linkText}>
                    See Evidence Here &gt;
                  </AppText>
                </Pressable>
                <AppText style={styles.reviewCount}>
                  {report.reviewCount} People have reviewed
                </AppText>
                <ActionRow
                  isConfirmed={isConf}
                  isFlagged={isFlag}
                  onConfirm={() => handleToggleConfirm(report.id)}
                  onFlag={() => handleOpenFlag(report.id)}
                  onShare={() => handleShare(report)}
                />
              </View>
              <View style={styles.sectionDivider} />
            </View>
          );
        })}

        {/* ── Incident header ── */}
        {incidentReports.length > 0 ? (
          <View style={styles.incidentSectionHeader}>
            <AppText style={styles.incidentSectionTitle}>
              Incident doing the Lagos State{"\n"}Governorship Election 2026
            </AppText>
          </View>
        ) : null}

        {/* ── Incidents with thread line ── */}
        {incidentReports.map((report, index) => {
          const isLast = index === incidentReports.length - 1;
          const isConf = confirmedIds.has(report.id);
          const isFlag = flaggedIds.has(report.id);

          return (
            <View key={report.id} style={styles.incidentRow}>
              <View style={styles.incidentLeftCol}>
                <View style={styles.incidentIconWrap}>
                  <Incident width={40} height={40} />
                </View>
                {!isLast ? <View style={styles.threadLine} /> : null}
              </View>

              <View style={styles.incidentContent}>
                <View style={styles.incidentHeadRow}>
                  <View>
                    <AppText style={styles.incidentLabel}>Incident:</AppText>
                    <AppText style={styles.incidentTime}>
                      {report.createdAgo}
                    </AppText>
                  </View>
                  {report.tag ? (
                    <View style={styles.tagPill}>
                      <AppText style={styles.tagText}>{report.tag}</AppText>
                    </View>
                  ) : null}
                </View>

                <AppText style={styles.incidentBody}>{report.body}</AppText>

                <Pressable
                  onPress={() => handleOpenEvidence(report)}
                  hitSlop={8}
                >
                  <AppText style={styles.linkText}>
                    See evidence &gt;
                  </AppText>
                </Pressable>

                <View style={styles.thinDivider} />

                <AppText style={styles.reviewCount}>
                  {report.reviewCount} People have reviewed
                </AppText>

                <ActionRow
                  isConfirmed={isConf}
                  isFlagged={isFlag}
                  onConfirm={() => handleToggleConfirm(report.id)}
                  onFlag={() => handleOpenFlag(report.id)}
                  onShare={() => handleShare(report)}
                />
              </View>
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      <SeeEvidenceBottomSheet ref={evidenceRef} evidence={selectedEvidence} />
      <FlagReportBottomSheet ref={flagRef} onSubmitted={handleFlagSubmitted} />
    </>
  );
}

/* ───── Action Row ───── */

function ActionRow({
  isConfirmed,
  isFlagged,
  onConfirm,
  onFlag,
  onShare,
}: {
  isConfirmed: boolean;
  isFlagged: boolean;
  onConfirm: () => void;
  onFlag: () => void;
  onShare: () => void;
}) {
  if (isConfirmed) {
    return (
      <View style={styles.actionsRow}>
        <Pressable onPress={onConfirm} style={styles.confirmedPill}>
          <Ionicons
            name="thumbs-up-outline"
            size={14}
            color={Theme.colors.primary}
          />
          <AppText style={styles.confirmedText}>
            You confirmed this — thank you
          </AppText>
        </Pressable>
        <Pressable onPress={onShare} style={styles.shareBtn} hitSlop={6}>
          <Ionicons
            name="share-social-outline"
            size={14}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.shareText}>Share</AppText>
        </Pressable>
      </View>
    );
  }

  if (isFlagged) {
    return (
      <View style={styles.actionsRow}>
        <View style={styles.flaggedPill}>
          <Ionicons name="flag-outline" size={14} color="#F04A1D" />
          <AppText style={styles.flaggedText}>
            Flagged - evidence under review
          </AppText>
        </View>
        <Pressable onPress={onShare} style={styles.shareBtn} hitSlop={6}>
          <Ionicons
            name="share-social-outline"
            size={14}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.shareText}>Share</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.actionsRow}>
      <View style={styles.buttonRow}>
        <Pressable onPress={onConfirm} style={styles.confirmBtn}>
          <Ionicons
            name="thumbs-up-outline"
            size={14}
            color={Theme.colors.primary}
          />
          <AppText style={styles.confirmBtnText}>Confirm</AppText>
        </Pressable>
        <Pressable onPress={onFlag} style={styles.flagBtn}>
          <Ionicons name="flag-outline" size={14} color="#F04A1D" />
          <AppText style={styles.flagBtnText}>Flag</AppText>
        </Pressable>
      </View>
      <Pressable onPress={onShare} style={styles.shareBtn} hitSlop={6}>
        <Ionicons
          name="share-social-outline"
          size={14}
          color={Theme.colors.textMuted}
        />
        <AppText style={styles.shareText}>Share</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  pageContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },

  section: { gap: 8, marginBottom: 18 },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  resultHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  resultDotRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EF4444",
  },
  resultLabel: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted },

  resultCard: {
    borderRadius: 16,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 14,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  resultElectionTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  partyBlock: { gap: 5 },
  partyTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  partyLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  partyName: { fontSize: 13, lineHeight: 18, color: Theme.colors.text },
  partyPercent: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },

  resultFooter: { paddingTop: 14, gap: 8 },
  sectionDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 18,
  },

  incidentSectionHeader: { marginBottom: 18 },
  incidentSectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  incidentRow: { flexDirection: "row", gap: 12, marginBottom: 6 },
  incidentLeftCol: { width: 44, alignItems: "center" },
  incidentIconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  threadLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#E2E8F0",
    marginTop: 4,
    borderRadius: 1,
  },
  incidentContent: { flex: 1, paddingBottom: 20, gap: 8 },
  incidentHeadRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  incidentLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  incidentTime: { fontSize: 11, lineHeight: 16, color: Theme.colors.textMuted },
  tagPill: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEAE3",
  },
  tagText: {
    fontSize: 10,
    lineHeight: 13,
    color: "#F04A1D",
    fontFamily: Theme.fonts.body.semibold,
  },
  incidentBody: { fontSize: 14, lineHeight: 22, color: Theme.colors.text },
  thinDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 4,
  },
  linkText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  reviewCount: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 4,
  },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  confirmBtn: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(5,163,156,0.08)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.2)",
  },
  confirmBtnText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  flagBtn: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(240,74,29,0.06)",
    borderWidth: 1,
    borderColor: "rgba(240,74,29,0.2)",
  },
  flagBtnText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#F04A1D",
    fontFamily: Theme.fonts.body.semibold,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  shareText: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  confirmedPill: {
    minHeight: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E9FBF8",
  },
  confirmedText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  flaggedPill: {
    minHeight: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF1EC",
  },
  flaggedText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#F04A1D",
    fontFamily: Theme.fonts.body.semibold,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    gap: 10,
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
    maxWidth: 240,
  },
});