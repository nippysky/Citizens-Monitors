// ─── src/app/(app)/archive-reports.tsx ────────────────────────────────────────
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import ReportSummarySheet from "@/components/me/ReportSummarySheet";
import { archiveData, ArchiveElection, ArchiveReportItem } from "@/data/me";
import { Theme } from "@/theme";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import Incident from "@/svgs/app/collation/Incident";
import { Paths } from "@/constants/paths";
import ElectionNotification from "@/svgs/app/profile/ElectionNotification";

type FilterKey = "all" | "results" | "incidents";

function getElectionIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("senate")) return SenatorElection;
  if (t.includes("house of rep")) return HouseOfRepsElection;
  return PresidentialElection;
}

export default function ArchiveReportsScreen() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const summaryRef = useRef<BottomSheetModal>(null);
  const [selectedReport, setSelectedReport] = useState<ArchiveReportItem | null>(null);
  const [selectedElection, setSelectedElection] = useState<ArchiveElection | null>(null);

  const filteredElections = useMemo(() => {
    return archiveData.elections.map((election) => ({
      ...election,
      reports: election.reports.filter((r) => {
        if (filter === "all") return true;
        if (filter === "results") return r.type === "result";
        return r.type === "incident";
      }),
    })).filter((e) => e.reports.length > 0);
  }, [filter]);


  const handleReportPress = useCallback(
    (report: ArchiveReportItem, election: ArchiveElection) => {
      setSelectedReport(report);
      setSelectedElection(election);
      requestAnimationFrame(() => summaryRef.current?.present());
    },
    []
  );

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: `ALL (${archiveData.totalResults + archiveData.totalIncidents})` },
    { key: "results", label: `RESULTS (${archiveData.totalResults})` },
    { key: "incidents", label: `INCIDENTS (${archiveData.totalIncidents})` },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={Theme.colors.text} />
          </Pressable>
          <AppText style={styles.headerTitle}>My Reports</AppText>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatBox value={archiveData.totalResults} label="RESULTS" color={Theme.colors.primary} />
            <StatBox value={archiveData.totalIncidents} label="INCIDENTS" color="#F04A1D" />
            <StatBox value={archiveData.totalElections} label="ELECTIONS" color={Theme.colors.text} />
          </View>

          {/* Filter pills */}
          <View style={styles.filterRow}>
            {filters.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
              >
                <AppText style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                  {f.label}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* Election sections */}
          {filteredElections.map((election) => {
            const Icon = getElectionIcon(election.electionType);
            return (
              <View key={election.id} style={styles.electionSection}>
                {/* Election header */}
                <View style={styles.electionHeader}>
                  <View style={styles.electionHeaderLeft}>
                    <View style={styles.electionDot} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText style={styles.electionTitle}>{election.title}</AppText>
                      <AppText style={styles.electionLocation}>{election.location}</AppText>
                    </View>
                  </View>
                  <Icon width={32} height={32} />
                </View>

                {/* Reports */}
                {election.reports.map((report) => (
                  <Pressable
                    key={report.id}
                    onPress={() => handleReportPress(report, election)}
                    style={styles.reportCard}
                  >
                    <View style={styles.reportIconWrap}>
                      {report.type === "result" ? (
                       <ElectionNotification width={28} height={28} />
                      ) : (
                        <Incident width={28} height={28} />
                      )}
                    </View>

                    <View style={styles.reportContent}>
                      <AppText style={styles.reportTitle}>{report.title}</AppText>
                      <View style={styles.reportMetaRow}>
                        <Ionicons name="time-outline" size={12} color={Theme.colors.textMuted} />
                        <AppText style={styles.reportMeta}>
                          {report.date} · {report.time}
                        </AppText>
                      </View>
                      {report.partySummary ? (
                        <AppText style={styles.reportParties}>{report.partySummary}</AppText>
                      ) : null}
                      {report.evidenceLabel ? (
                        <AppText
                          style={[
                            styles.reportEvidence,
                            { color: report.evidenceType === "video" ? "#F04A1D" : Theme.colors.primary },
                          ]}
                        >
                          {report.evidenceLabel}
                        </AppText>
                      ) : null}
                    </View>

                    <Ionicons name="chevron-forward" size={16} color={Theme.colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            );
          })}

          <TabBarSpacer />
        </ScrollView>

        {/* FAB - submit new report */}
        <Pressable style={styles.fab} onPress={() => router.push(Paths.appSubmitReport as any)}>
          <Ionicons name="add" size={24} color={Theme.colors.white} />
        </Pressable>

        <ReportSummarySheet
          ref={summaryRef}
          report={selectedReport}
          electionTitle={selectedElection?.title ?? ""}
        />
      </View>
    </SafeAreaView>
  );
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <AppText style={[styles.statValue, { color }]}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  screen: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
  },
  headerTitle: { fontSize: 18, lineHeight: 24, color: Theme.colors.text, fontFamily: Theme.fonts.heading.semibold },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },

  statsRow: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1, minHeight: 72, borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface, paddingHorizontal: 12, paddingVertical: 10, justifyContent: "space-between",
  },
  statValue: { fontSize: 24, lineHeight: 26, fontFamily: Theme.fonts.heading.bold },
  statLabel: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted, fontFamily: Theme.fonts.body.semibold },

  filterRow: { flexDirection: "row", gap: 10 },
  filterPill: { minHeight: 32, borderRadius: 999, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", borderWidth: 1.2, borderColor: Theme.colors.border },
  filterPillActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  filterText: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted, fontFamily: Theme.fonts.body.semibold },
  filterTextActive: { color: Theme.colors.white },

  electionSection: { gap: 8 },
  electionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingVertical: 6 },
  electionHeaderLeft: { flexDirection: "row", alignItems: "flex-start", gap: 8, flex: 1 },
  electionDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "#EF4444", marginTop: 6 },
  electionTitle: { fontSize: 16, lineHeight: 22, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },
  electionLocation: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },

  reportCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, paddingHorizontal: 12,
    marginLeft: 16,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface, borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  reportIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F4F6F8", alignItems: "center", justifyContent: "center" },
  reportContent: { flex: 1, gap: 3 },
  reportTitle: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  reportMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  reportMeta: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  reportParties: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  reportEvidence: { fontSize: 12, lineHeight: 16, fontFamily: Theme.fonts.body.semibold },

  fab: {
    position: "absolute", bottom: Platform.OS === "ios" ? 100 : 84, right: 16,
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: Theme.colors.primary, alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14 },
      android: { elevation: 8 },
    }),
  },
});