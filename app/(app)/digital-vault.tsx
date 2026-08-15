import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import EditElectionResultSheet from "@/components/me/EditElectionResultSheet";
import ReportSummarySheet from "@/components/me/ReportSummarySheet";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { useAppToast } from "@/hooks/useAppToast";
import {
  useDeleteElectionResultMutation,
  useElectionVaultQuery,
  useUpdateElectionResultMutation,
} from "@/hooks/api/useElectionVaultQuery";
import {
  ElectionVaultIncident,
  ElectionVaultResult,
  ElectionVaultSubmission,
  UpdateElectionResultPayload,
  buildElectionVaultSubmissions,
  getActiveElectionIdFromResult,
  getVaultElectionLocation,
  getVaultElectionName,
  getVaultElectionType,
  isVaultResult,
} from "@/lib/api/electionVault.api";
import { Theme } from "@/theme";
import ElectionNotification from "@/svgs/app/profile/ElectionNotification";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import NoElection from "@/svgs/app/NoElection";

/**
 * Returns an ELEMENT rather than a component type. Binding a component to a
 * capitalised local during render gives it a fresh identity each pass, so
 * React remounts the subtree (react-hooks/static-components).
 */
function renderVaultIcon(electionType: string, size: number) {
  const Icon = getElectionIcon(electionType);
  return <Icon width={size} height={size} />;
}

function getElectionIcon(type: string) {
  const normalized = type.toLowerCase();

  if (normalized.includes("senatorial") || normalized.includes("senate")) {
    return SenatorElection;
  }

  if (
    normalized.includes("house-of-representatives") ||
    normalized.includes("house of representatives") ||
    normalized.includes("house of rep") ||
    normalized.includes("house-of-assembly") ||
    normalized.includes("state house")
  ) {
    return HouseOfRepsElection;
  }

  return PresidentialElection;
}

function formatDate(value?: string): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value?: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function getAreaText(item: ElectionVaultResult | ElectionVaultIncident): string {
  return [item.pollingUnit, item.ward, item.lga, item.state]
    .filter(Boolean)
    .join(" • ");
}

function getResultEvidenceCount(result: ElectionVaultResult): number {
  return [result.resultPicture?.url, result.resultVideo?.url].filter(Boolean)
    .length;
}

function getIncidentEvidenceCount(incident: ElectionVaultIncident): number {
  const picturesCount =
    incident.incidentPictures?.filter((file) => Boolean(file.url)).length ?? 0;

  const videosCount =
    incident.incidentVideos?.filter((file) => Boolean(file.url)).length ?? 0;

  return picturesCount + videosCount;
}

function getTopPartySummary(result: ElectionVaultResult): string {
  // Array.isArray guard, not just `?? []` — a truthy non-array here throws
  // "iterator method is not callable" on the spread, same crash class fixed
  // in src/data/collation.ts.
  const parties = [
    ...(Array.isArray(result.partiesVotes) ? result.partiesVotes : []),
  ]
    .filter((item) => item.party)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 3);

  if (!parties.length) {
    return "No party vote breakdown";
  }

  return parties
    .map((party) => `${party.party} ${formatNumber(party.count ?? 0)}`)
    .join(" · ");
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function SkeletonBlock({
  width,
  height,
  radius = 12,
}: {
  width: number | `${number}%`;
  height: number;
  radius?: number;
}) {
  return (
    <View
      style={[
        styles.skeletonBlock,
        {
          width,
          height,
          borderRadius: radius,
        },
      ]}
    />
  );
}

function VaultSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      <View style={styles.summaryRow}>
        {[0, 1, 2].map((item) => (
          <View key={item} style={styles.skeletonStat}>
            <SkeletonBlock width="42%" height={24} />
            <SkeletonBlock width="72%" height={12} />
          </View>
        ))}
      </View>

      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonCardHeader}>
            <SkeletonBlock width={42} height={42} radius={21} />
            <View style={styles.skeletonTextGroup}>
              <SkeletonBlock width="72%" height={18} />
              <SkeletonBlock width="48%" height={12} />
            </View>
          </View>

          <SkeletonBlock width="100%" height={12} />
          <SkeletonBlock width="84%" height={12} />

          <View style={styles.skeletonFooter}>
            <SkeletonBlock width="38%" height={36} radius={14} />
            <SkeletonBlock width="28%" height={36} radius={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: "primary" | "warning" | "dark";
}) {
  const iconColor =
    tone === "warning"
      ? "#D97706"
      : tone === "dark"
        ? Theme.colors.text
        : Theme.colors.primary;

  const bgColor =
    tone === "warning"
      ? "rgba(245,158,11,0.10)"
      : tone === "dark"
        ? "rgba(17,26,50,0.06)"
        : "rgba(5,163,156,0.08)";

  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>

      <AppText style={styles.summaryValue}>{formatNumber(value)}</AppText>
      <AppText style={styles.summaryLabel}>{label}</AppText>
    </View>
  );
}

function EmptyVaultState() {
  return (
    <View style={styles.emptyWrap}>
      <NoElection />

      <AppText style={styles.emptyTitle}>No vault submissions yet</AppText>

      <AppText style={styles.emptySubtitle}>
        Your submitted election results and incident reports will appear here
        after you upload them.
      </AppText>
    </View>
  );
}

function SubmissionCard({
  item,
  onOpen,
  onEditResult,
}: {
  item: ElectionVaultSubmission;
  onOpen: (item: ElectionVaultSubmission) => void;
  onEditResult: (result: ElectionVaultResult) => void;
}) {
  if (isVaultResult(item)) {
    const result = item.data;
    const electionName = getVaultElectionName(result.election);
    const electionLocation = getVaultElectionLocation(result.election);
    const electionType = getVaultElectionType(result.election);
    const evidenceCount = getResultEvidenceCount(result);

    return (
      <Pressable onPress={() => onOpen(item)} style={styles.submissionCard}>
        <View style={styles.submissionHeader}>
          <View style={styles.submissionIconShell}>
            {renderVaultIcon(electionType, 34)}
          </View>

          <View style={styles.submissionHeaderText}>
            <View style={styles.titleRow}>
              <AppText style={styles.submissionTitle} numberOfLines={2}>
                Result Report — EC8A
              </AppText>

              <View style={styles.typePill}>
                <Ionicons
                  name="checkmark-done-outline"
                  size={12}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.typePillText}>Result</AppText>
              </View>
            </View>

            <AppText style={styles.electionName} numberOfLines={1}>
              {electionName}
            </AppText>
          </View>
        </View>

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaText} numberOfLines={2}>
              {getAreaText(result) || electionLocation}
            </AppText>
          </View>

          <View style={styles.metaRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaText}>
              {formatDate(item.createdAt)} {formatTime(item.createdAt)}
            </AppText>
          </View>
        </View>

        <AppText style={styles.submissionSubtitle} numberOfLines={2}>
          {getTopPartySummary(result)}
        </AppText>

        <View style={styles.cardFooter}>
          <View style={styles.footerChip}>
            <Ionicons
              name="attach-outline"
              size={14}
              color={Theme.colors.primary}
            />
            <AppText style={styles.footerChipText}>
              {evidenceCount} evidence file{evidenceCount === 1 ? "" : "s"}
            </AppText>
          </View>

          <Pressable
            onPress={() => onEditResult(result)}
            style={styles.editButton}
            hitSlop={8}
          >
            <Ionicons name="create-outline" size={15} color="#FFFFFF" />
            <AppText style={styles.editButtonText}>Edit</AppText>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  const incident = item.data;
  const electionName = getVaultElectionName(incident.election);
  const electionLocation = getVaultElectionLocation(incident.election);
  const electionType = getVaultElectionType(incident.election);
  const evidenceCount = getIncidentEvidenceCount(incident);

  return (
    <Pressable onPress={() => onOpen(item)} style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <View style={styles.submissionIconShell}>
          {renderVaultIcon(electionType, 34)}
        </View>

        <View style={styles.submissionHeaderText}>
          <View style={styles.titleRow}>
            <AppText style={styles.submissionTitle} numberOfLines={2}>
              {incident.selectIncident || "Incident Report"}
            </AppText>

            <View style={[styles.typePill, styles.incidentPill]}>
              <Ionicons name="warning-outline" size={12} color="#D97706" />
              <AppText style={[styles.typePillText, styles.incidentPillText]}>
                Incident
              </AppText>
            </View>
          </View>

          <AppText style={styles.electionName} numberOfLines={1}>
            {electionName}
          </AppText>
        </View>
      </View>

      <View style={styles.metaBlock}>
        <View style={styles.metaRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.metaText} numberOfLines={2}>
            {getAreaText(incident) || electionLocation}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name="time-outline"
            size={14}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.metaText}>
            {formatDate(item.createdAt)} {formatTime(item.createdAt)}
          </AppText>
        </View>
      </View>

      <AppText style={styles.submissionSubtitle} numberOfLines={2}>
        {incident.incidentNote || "No incident note provided"}
      </AppText>

      <View style={styles.cardFooter}>
        <View style={styles.footerChip}>
          <Ionicons
            name="attach-outline"
            size={14}
            color={Theme.colors.primary}
          />
          <AppText style={styles.footerChipText}>
            {evidenceCount} evidence file{evidenceCount === 1 ? "" : "s"}
          </AppText>
        </View>

        <View style={styles.openButton}>
          <ElectionNotification width={18} height={18} />
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Theme.colors.textMuted}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function DigitalVaultScreen() {
  const summaryRef = useRef<BottomSheetModal>(null);
  const editRef = useRef<BottomSheetModal>(null);

  const { showToast } = useAppToast();

  const vaultQuery = useElectionVaultQuery();
  const updateResultMutation = useUpdateElectionResultMutation();
  const deleteResultMutation = useDeleteElectionResultMutation();

  const [selectedSubmission, setSelectedSubmission] =
    useState<ElectionVaultSubmission | null>(null);

  const [selectedResult, setSelectedResult] =
    useState<ElectionVaultResult | null>(null);

  const submissions = useMemo(() => {
    return buildElectionVaultSubmissions(vaultQuery.data);
  }, [vaultQuery.data]);

  const summary = vaultQuery.data?.summary ?? {
    totalSubmissions: 0,
    resultsUploaded: 0,
    incidentsUploaded: 0,
  };

  const hasSubmissions = submissions.length > 0;

  const openSummary = useCallback((item: ElectionVaultSubmission) => {
    setSelectedSubmission(item);
    requestAnimationFrame(() => summaryRef.current?.present());
  }, []);

  const openEditSheet = useCallback((result: ElectionVaultResult) => {
    setSelectedResult(result);
    requestAnimationFrame(() => editRef.current?.present());
  }, []);

  const handleSaveResult = useCallback(
    async (payload: UpdateElectionResultPayload) => {
      if (!selectedResult) return;

      const activeElectionId = getActiveElectionIdFromResult(selectedResult);

      if (!activeElectionId) {
        showToast({
          type: "error",
          message: "Election ID is missing for this result.",
        });
        return;
      }

      try {
        await updateResultMutation.mutateAsync({
          activeElectionId,
          payload,
        });

        showToast({
          type: "success",
          message: "Election result updated successfully.",
        });

        editRef.current?.dismiss();
        summaryRef.current?.dismiss();
        setSelectedResult(null);
        setSelectedSubmission(null);
      } catch (error) {
        showToast({
          type: "error",
          message: getErrorMessage(error, "Unable to update election result."),
        });

        console.log("Update election result error:", error);
      }
    },
    [selectedResult, showToast, updateResultMutation]
  );

  const handleDeleteResult = useCallback(async () => {
    if (!selectedResult) return;

    const activeElectionId = getActiveElectionIdFromResult(selectedResult);

    if (!activeElectionId) {
      showToast({
        type: "error",
        message: "Election ID is missing for this result.",
      });
      return;
    }

    try {
      const response = await deleteResultMutation.mutateAsync({
        activeElectionId,
      });

      showToast({
        type: "success",
        message: response.message || "Result deleted successfully.",
      });

      editRef.current?.dismiss();
      summaryRef.current?.dismiss();
      setSelectedResult(null);
      setSelectedSubmission(null);
    } catch (error) {
      showToast({
        type: "error",
        message: getErrorMessage(error, "Unable to delete election result."),
      });

      console.log("Delete election result error:", error);
    }
  }, [deleteResultMutation, selectedResult, showToast]);

  const renderItem = ({
    item,
  }: ListRenderItemInfo<ElectionVaultSubmission>) => (
    <SubmissionCard
      item={item}
      onOpen={openSummary}
      onEditResult={openEditSheet}
    />
  );

  const busy =
    updateResultMutation.isPending || deleteResultMutation.isPending;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <BackButton label="" />

          <View style={styles.headerTextWrap}>
            <AppText style={styles.headerTitle}>Digital Vault</AppText>
            <AppText style={styles.headerSubtitle}>
              Your verified election submissions
            </AppText>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {vaultQuery.isLoading ? (
          <VaultSkeleton />
        ) : (
          <FlatList
            data={submissions}
            keyExtractor={(item) => `${item.kind}-${item.id}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={vaultQuery.isRefetching}
                onRefresh={() => {
                  void vaultQuery.refetch();
                }}
                tintColor={Theme.colors.primary}
                colors={[Theme.colors.primary]}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              !hasSubmissions && styles.listContentEmpty,
            ]}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <View style={styles.summaryRow}>
                  <SummaryCard
                    label="Submissions"
                    value={summary.totalSubmissions}
                    icon="archive-outline"
                    tone="dark"
                  />
                  <SummaryCard
                    label="Results"
                    value={summary.resultsUploaded}
                    icon="checkmark-done-outline"
                  />
                  <SummaryCard
                    label="Incidents"
                    value={summary.incidentsUploaded}
                    icon="warning-outline"
                    tone="warning"
                  />
                </View>

                {hasSubmissions ? (
                  <View style={styles.sectionIntro}>
                    <AppText style={styles.sectionTitle}>
                      Submission History
                    </AppText>
                    <AppText style={styles.sectionSubtitle}>
                      Review your uploaded results and incident evidence.
                    </AppText>
                  </View>
                ) : null}
              </View>
            }
            ListEmptyComponent={
              vaultQuery.isError ? (
                <View style={styles.errorWrap}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={38}
                    color={Theme.colors.textMuted}
                  />
                  <AppText style={styles.errorTitle}>
                    Unable to load your vault
                  </AppText>
                  <AppText style={styles.errorText}>
                    Please check your connection and try again.
                  </AppText>

                  <Pressable
                    onPress={() => {
                      void vaultQuery.refetch();
                    }}
                    style={styles.retryButton}
                  >
                    <AppText style={styles.retryButtonText}>Retry</AppText>
                  </Pressable>
                </View>
              ) : (
                <EmptyVaultState />
              )
            }
          />
        )}

        <ReportSummarySheet
          ref={summaryRef}
          submission={selectedSubmission}
          onEditResult={openEditSheet}
        />

        <EditElectionResultSheet
          ref={editRef}
          result={selectedResult}
          saving={updateResultMutation.isPending}
          deleting={deleteResultMutation.isPending}
          onSave={(payload) => {
            void handleSaveResult(payload);
          }}
          onDelete={() => {
            void handleDeleteResult();
          }}
        />

        <AppScreenLoader visible={busy} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FBF8EA",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FBF8EA",
  },
  header: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 25,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  headerSpacer: {
    width: 44,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 34,
    gap: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listHeader: {
    gap: 18,
    paddingBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE4EB",
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryValue: {
    fontSize: 24,
    lineHeight: 29,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
    textTransform: "uppercase",
  },
  sectionIntro: {
    gap: 3,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 23,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  submissionCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE4EB",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  submissionHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  submissionIconShell: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "rgba(5,163,156,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  submissionHeaderText: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  submissionTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  typePill: {
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: 9,
    backgroundColor: "rgba(5,163,156,0.08)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  incidentPill: {
    backgroundColor: "rgba(245,158,11,0.10)",
    borderColor: "rgba(245,158,11,0.18)",
  },
  typePillText: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  incidentPillText: {
    color: "#D97706",
  },
  electionName: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  metaBlock: {
    gap: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  submissionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: Theme.colors.text,
  },
  cardFooter: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerChip: {
    flex: 1,
    minHeight: 36,
    borderRadius: 13,
    backgroundColor: "rgba(5,163,156,0.06)",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerChipText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  editButton: {
    minHeight: 38,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editButtonText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
  openButton: {
    minHeight: 38,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E5E9EF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 50,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 310,
  },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 60,
    gap: 10,
  },
  errorTitle: {
    fontSize: 20,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 22,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
  skeletonWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  skeletonBlock: {
    backgroundColor: "rgba(17,26,50,0.08)",
  },
  skeletonStat: {
    flex: 1,
    minHeight: 112,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE4EB",
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  skeletonCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE4EB",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  skeletonCardHeader: {
    flexDirection: "row",
    gap: 12,
  },
  skeletonTextGroup: {
    flex: 1,
    gap: 8,
    paddingTop: 4,
  },
  skeletonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});