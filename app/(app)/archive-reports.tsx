// src/app/(app)/archive-reports.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import { archiveData, ArchiveElection, ArchiveReportItem } from "@/data/me";
import { Theme } from "@/theme";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import Incident from "@/svgs/app/collation/Incident";
import ElectionNotification from "@/svgs/app/profile/ElectionNotification";
import { Paths } from "@/constants/paths";

type FilterKey = "all" | "results" | "incidents";

function getElectionIcon(type: string) {
  const t = type.toLowerCase();

  if (t.includes("senate")) return SenatorElection;
  if (t.includes("house of rep")) return HouseOfRepsElection;

  return PresidentialElection;
}

export default function ArchiveReportsScreen() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredElections = useMemo(() => {
    return archiveData.elections
      .map((election) => ({
        ...election,
        reports: election.reports.filter((report) => {
          if (filter === "all") return true;
          if (filter === "results") return report.type === "result";
          return report.type === "incident";
        }),
      }))
      .filter((election) => election.reports.length > 0);
  }, [filter]);

  const filters: { key: FilterKey; label: string }[] = [
    {
      key: "all",
      label: `ALL (${archiveData.totalResults + archiveData.totalIncidents})`,
    },
    {
      key: "results",
      label: `RESULTS (${archiveData.totalResults})`,
    },
    {
      key: "incidents",
      label: `INCIDENTS (${archiveData.totalIncidents})`,
    },
  ];

  const handleReportPress = (report: ArchiveReportItem, election: ArchiveElection) => {
    if (report.type === "result") {
      router.push({
        ...Paths.electionDetails(election.id),
        params: {
          id: election.id,
          viewer: "observer",
          scope: "assigned",
          tab: "overview",
        },
      });
      return;
    }

    router.push({
      ...Paths.electionDetails(election.id),
      params: {
        id: election.id,
        viewer: "observer",
        scope: "assigned",
        tab: "review-collation",
      },
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <BackButton label="" />
          <AppText style={styles.headerTitle}>My Digital Vault</AppText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.statsRow}>
            <StatBox
              value={archiveData.totalResults}
              label="RESULTS"
              color={Theme.colors.primary}
            />
            <StatBox
              value={archiveData.totalIncidents}
              label="INCIDENTS"
              color="#F04A1D"
            />
            <StatBox
              value={archiveData.totalElections}
              label="ELECTIONS"
              color={Theme.colors.text}
            />
          </View>

          <View style={styles.filterRow}>
            {filters.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterPill,
                  filter === item.key && styles.filterPillActive,
                ]}
              >
                <AppText
                  style={[
                    styles.filterText,
                    filter === item.key && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionsWrap}>
            {filteredElections.map((election) => {
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
                      <Icon width={30} height={30} />
                    </View>
                  </View>

                  <View style={styles.reportList}>
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
                          <AppText style={styles.reportTitle}>
                            {report.title}
                          </AppText>

                          <View style={styles.reportMetaRow}>
                            <Ionicons
                              name="time-outline"
                              size={13}
                              color={Theme.colors.textMuted}
                            />
                            <AppText style={styles.reportMeta}>
                              {report.date} · {report.time}
                            </AppText>
                          </View>

                          {report.partySummary ? (
                            <AppText style={styles.reportParties}>
                              {report.partySummary}
                            </AppText>
                          ) : null}

                          {report.evidenceLabel ? (
                            <AppText
                              style={[
                                styles.reportEvidence,
                                report.evidenceType === "video"
                                  ? styles.reportEvidenceVideo
                                  : styles.reportEvidencePhoto,
                              ]}
                            >
                              {report.evidenceLabel}
                            </AppText>
                          ) : null}
                        </View>

                        <View style={styles.chevronWrap}>
                          <Ionicons
                            name="chevron-forward"
                            size={17}
                            color={Theme.colors.textMuted}
                          />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          <TabBarSpacer />
        </ScrollView>
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
    paddingTop: 10,
    paddingBottom: 20,
    gap: 18,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
  },

  statBox: {
    flex: 1,
    minHeight: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "space-between",
  },

  statValue: {
    fontSize: 24,
    lineHeight: 26,
    fontFamily: Theme.fonts.heading.bold,
  },

  statLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
  },

  filterPill: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  filterPillActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },

  filterText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  filterTextActive: {
    color: Theme.colors.white,
  },

  sectionsWrap: {
    gap: 18,
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
    gap: 4,
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
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  reportList: {
    gap: 12,
  },

  reportCard: {
    minHeight: 88,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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

  reportEvidence: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.medium,
  },

  reportEvidenceVideo: {
    color: "#F04A1D",
  },

  reportEvidencePhoto: {
    color: "#F04A1D",
  },

  chevronWrap: {
    width: 18,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});