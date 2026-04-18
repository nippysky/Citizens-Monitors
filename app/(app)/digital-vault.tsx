// ─── src/app/(app)/digital-vault.tsx ──────────────────────────────────────────
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import ReportSummarySheet from "@/components/me/ReportSummarySheet";
import { archiveData, ArchiveElection, ArchiveReportItem } from "@/data/me";
import { Theme } from "@/theme";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import ElectionNotification from "@/svgs/app/profile/ElectionNotification";
import { Paths } from "@/constants/paths";

function getElectionIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("senate")) return SenatorElection;
  if (t.includes("house of rep")) return HouseOfRepsElection;
  return PresidentialElection;
}

type VaultElectionRow = {
  election: ArchiveElection;
  resultReport: ArchiveReportItem | null;
};

const DEV_DIGITAL_VAULT_PENDING_ELECTION_IDS = [
  "ae-2",
] as const;

/**
 * For QA:
 * add/remove election ids in DEV_DIGITAL_VAULT_PENDING_ELECTION_IDS
 * to force that election into "no result submitted yet" state.
 *
 * Example:
 * []                  -> all submitted
 * ["ae-2"]            -> House of Rep shows green plus tile
 * ["ae-2", "ae-3"]    -> House of Rep + Presidential show green plus tile
 */

export default function DigitalVaultScreen() {
  const summaryRef = useRef<BottomSheetModal>(null);
  const [selectedReport, setSelectedReport] = useState<ArchiveReportItem | null>(
    null
  );
  const [selectedElection, setSelectedElection] =
    useState<ArchiveElection | null>(null);

  const vaultRows = useMemo<VaultElectionRow[]>(() => {
    return archiveData.elections.map((election) => {
      const isForcedPending = DEV_DIGITAL_VAULT_PENDING_ELECTION_IDS.includes(
        election.id as (typeof DEV_DIGITAL_VAULT_PENDING_ELECTION_IDS)[number]
      );

      const resultReport = isForcedPending
        ? null
        : election.reports.find((report) => report.type === "result") ?? null;

      return {
        election,
        resultReport,
      };
    });
  }, []);

  const totalSubmittedResults = useMemo(() => {
    return vaultRows.filter((row) => row.resultReport).length;
  }, [vaultRows]);

  const totalElections = vaultRows.length;

  const handleOpenSummary = (
    report: ArchiveReportItem,
    election: ArchiveElection
  ) => {
    setSelectedReport(report);
    setSelectedElection(election);
    requestAnimationFrame(() => summaryRef.current?.present());
  };

const handleAddResult = (election: ArchiveElection) => {
  router.push({
    pathname: Paths.submitElectionReport,
    params: {
      electionId: election.id,
      electionTitle: election.title,
      pollingUnitName: "Ikotun Community Primary School",
      pollingUnitCode: "LA/01/08/004",
      ward: "Ward 01",
      lga: "Alimosho LGA",
      state: "Lagos",
      votingStartTime: "",
    },
  });
};

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <BackButton label="" />
          <AppText style={styles.headerTitle}>Digital Vault</AppText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.statsRow}>
            <StatBox
              value={totalSubmittedResults}
              label="RESULTS"
              color={Theme.colors.primary}
            />
            <StatBox
              value={totalElections}
              label="ELECTIONS"
              color={Theme.colors.text}
            />
          </View>

          <View style={styles.sectionsWrap}>
            {vaultRows.map(({ election, resultReport }) => {
              const Icon = getElectionIcon(election.electionType);

              return (
                <View key={election.id} style={styles.electionSection}>
                  <View style={styles.electionHeader}>
                    <View style={styles.electionHeaderLeft}>
                      <View style={styles.electionDot} />

                      <View style={styles.electionTextWrap}>
                        <AppText style={styles.electionTitle}>
                          {election.title}
                        </AppText>
                        <AppText style={styles.electionLocation}>
                          {election.location}
                        </AppText>
                      </View>
                    </View>

                    <View style={styles.electionIconWrap}>
                      <Icon width={32} height={32} />
                    </View>
                  </View>

                  {resultReport ? (
                    <Pressable
                      onPress={() => handleOpenSummary(resultReport, election)}
                      style={styles.reportCard}
                    >
                      <View style={styles.reportMain}>
                        <View style={styles.reportIconWrap}>
                          <ElectionNotification width={28} height={28} />
                        </View>

                        <View style={styles.reportContent}>
                          <AppText style={styles.reportTitle}>
                            {resultReport.title}
                          </AppText>

                          <View style={styles.reportMetaRow}>
                            <Ionicons
                              name="time-outline"
                              size={13}
                              color={Theme.colors.textMuted}
                            />
                            <AppText style={styles.reportMeta}>
                              {resultReport.date} · {resultReport.time}
                            </AppText>
                          </View>

                          {resultReport.partySummary ? (
                            <AppText style={styles.reportParties}>
                              {resultReport.partySummary}
                            </AppText>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.chevronWrap}>
                        <Ionicons
                          name="chevron-forward"
                          size={17}
                          color={Theme.colors.textMuted}
                        />
                      </View>
                    </Pressable>
                  ) : (
                    <View style={styles.pendingCard}>
                      <View style={styles.reportMain}>
                        <View style={styles.reportIconWrap}>
                          <ElectionNotification width={28} height={28} />
                        </View>

                        <View style={styles.reportContent}>
                          <AppText style={styles.reportTitle}>
                            Result Report — EC8A
                          </AppText>

                          <AppText style={styles.pendingSubtitle}>
                            Submit election result for this polling unit.
                          </AppText>
                        </View>
                      </View>

                      <Pressable
                        onPress={() => handleAddResult(election)}
                        style={styles.addTile}
                        hitSlop={8}
                      >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <TabBarSpacer />
        </ScrollView>

        <ReportSummarySheet
          ref={summaryRef}
          report={selectedReport}
          electionTitle={selectedElection?.title ?? ""}
        />
      </View>
    </SafeAreaView>
  );
}

function StatBox({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statBox}>
      <AppText style={[styles.statValue, { color }]}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  screen: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 20,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },

  statBox: {
    flex: 1,
    minHeight: 78,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
  },

  statValue: {
    fontSize: 28,
    lineHeight: 30,
    fontFamily: Theme.fonts.heading.bold,
  },

  statLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  sectionsWrap: {
    gap: 22,
  },

  electionSection: {
    gap: 12,
  },

  electionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  electionHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    minWidth: 0,
  },

  electionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E85A54",
    marginTop: 7,
  },

  electionTextWrap: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },

  electionTitle: {
    fontSize: 16,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  electionLocation: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  electionIconWrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  reportCard: {
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  pendingCard: {
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  reportMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  reportIconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  reportContent: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },

  reportTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  reportMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  reportMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  reportParties: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  pendingSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  chevronWrap: {
    width: 18,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  addTile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});