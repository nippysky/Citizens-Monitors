import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo } from "react";
import { Image, Linking, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import {
  ElectionVaultIncident,
  ElectionVaultResult,
  ElectionVaultSubmission,
  getVaultElectionName,
  isVaultResult,
} from "@/lib/api/electionVault.api";
import { Theme } from "@/theme";

type Props = {
  submission: ElectionVaultSubmission | null;
  onEditResult?: (result: ElectionVaultResult) => void;
};

function formatNumber(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  return value.toLocaleString();
}

function formatDateTime(value?: string): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAreaText(item: ElectionVaultResult | ElectionVaultIncident): string {
  return [item.pollingUnit, item.ward, item.lga, item.state]
    .filter(Boolean)
    .join(" • ");
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  const resolved =
    typeof value === "boolean"
      ? value
        ? "Yes"
        : "No"
      : value === undefined || value === null || value === ""
        ? "Not available"
        : String(value);

  return (
    <View style={styles.detailRow}>
      <AppText style={styles.detailLabel}>{label}</AppText>
      <AppText style={styles.detailValue}>{resolved}</AppText>
    </View>
  );
}

function EvidenceThumb({
  url,
  label,
  type,
}: {
  url?: string;
  label: string;
  type: "image" | "video";
}) {
  if (!url) return null;

  const open = () => {
    void Linking.openURL(url);
  };

  return (
    <Pressable onPress={open} style={styles.evidenceCard}>
      {type === "image" ? (
        <Image source={{ uri: url }} style={styles.evidenceImage} />
      ) : (
        <View style={styles.videoEvidence}>
          <Ionicons name="play-circle" size={34} color={Theme.colors.primary} />
        </View>
      )}

      <View style={styles.evidenceFooter}>
        <Ionicons
          name={type === "image" ? "image-outline" : "videocam-outline"}
          size={14}
          color={Theme.colors.primary}
        />
        <AppText style={styles.evidenceLabel} numberOfLines={1}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

function PartyVoteRows({ result }: { result: ElectionVaultResult }) {
  const parties = result.partiesVotes ?? [];
  const total = parties.reduce((sum, item) => sum + (item.count ?? 0), 0);

  if (!parties.length) {
    return (
      <View style={styles.emptyMini}>
        <AppText style={styles.emptyMiniText}>
          No party vote breakdown available.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.partyWrap}>
      {parties.map((party) => {
        const count = party.count ?? 0;
        const percent = total > 0 ? Math.max(4, (count / total) * 100) : 0;

        return (
          <View key={party._id || party.party} style={styles.partyRow}>
            <View style={styles.partyTop}>
              <AppText style={styles.partyName}>{party.party || "Party"}</AppText>
              <AppText style={styles.partyCount}>{formatNumber(count)}</AppText>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ResultSummary({
  result,
  onEditResult,
}: {
  result: ElectionVaultResult;
  onEditResult?: (result: ElectionVaultResult) => void;
}) {
  return (
    <>
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Ionicons
            name="checkmark-done-outline"
            size={23}
            color={Theme.colors.primary}
          />
        </View>

        <View style={styles.heroCopy}>
          <AppText style={styles.heroTitle}>
            {getVaultElectionName(result.election)}
          </AppText>
          <AppText style={styles.heroSubtitle}>
            {getAreaText(result) || "Election result submission"}
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>Party Results</AppText>

          {onEditResult ? (
            <Pressable
              onPress={() => onEditResult(result)}
              style={styles.editMiniButton}
            >
              <Ionicons name="create-outline" size={14} color="#FFFFFF" />
              <AppText style={styles.editMiniText}>Edit</AppText>
            </Pressable>
          ) : null}
        </View>

        <PartyVoteRows result={result} />
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Report Summary</AppText>

        <DetailRow label="Time Began" value={result.timeBegan} />
        <DetailRow
          label="Accredited Voters"
          value={formatNumber(result.accreditedVoters)}
        />
        <DetailRow
          label="Used Ballot Papers"
          value={formatNumber(result.usedBallotPapers)}
        />
        <DetailRow
          label="Rejected Papers"
          value={formatNumber(result.rejectedPapers)}
        />
        <DetailRow
          label="Spoiled Ballot Papers"
          value={formatNumber(result.spoiledBallotPapers)}
        />
        <DetailRow label="Vote Rating" value={result.voteRating} />
        <DetailRow label="Voter Intimidation" value={result.voterIntimidation} />
        <DetailRow label="Vote Buying" value={result.voteBuying} />
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Evidence</AppText>

        <View style={styles.evidenceGrid}>
          <EvidenceThumb
            url={result.resultPicture?.url}
            label={result.resultPicture?.name || "Result picture"}
            type="image"
          />

          <EvidenceThumb
            url={result.resultVideo?.url}
            label={result.resultVideo?.name || "Result video"}
            type="video"
          />
        </View>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Upload Metadata</AppText>

        <DetailRow label="Submitted" value={formatDateTime(result.createdAt)} />
        <DetailRow label="Updated" value={formatDateTime(result.updatedAt)} />
        <DetailRow label="State" value={result.state} />
        <DetailRow label="LGA" value={result.lga} />
        <DetailRow label="Ward" value={result.ward} />
        <DetailRow label="Polling Unit" value={result.pollingUnit} />
        <DetailRow label="Captured Address" value={result.uploadLocation?.address} />
        <DetailRow label="Latitude" value={result.uploadLocation?.latitude} />
        <DetailRow label="Longitude" value={result.uploadLocation?.longitude} />
      </View>
    </>
  );
}

function IncidentSummary({ incident }: { incident: ElectionVaultIncident }) {
  return (
    <>
      <View style={styles.heroCard}>
        <View style={[styles.heroIcon, styles.warningHeroIcon]}>
          <Ionicons name="warning-outline" size={23} color="#D97706" />
        </View>

        <View style={styles.heroCopy}>
          <AppText style={styles.heroTitle}>
            {incident.selectIncident || "Incident Report"}
          </AppText>
          <AppText style={styles.heroSubtitle}>
            {getVaultElectionName(incident.election)}
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Incident Summary</AppText>

        <DetailRow label="Incident Type" value={incident.selectIncident} />
        <DetailRow label="Incident Note" value={incident.incidentNote} />
        <DetailRow label="Election Rating" value={incident.electionRating} />
        <DetailRow label="Submitted" value={formatDateTime(incident.createdAt)} />
        <DetailRow label="Updated" value={formatDateTime(incident.updatedAt)} />
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Evidence</AppText>

        <View style={styles.evidenceGrid}>
          {(incident.incidentPictures ?? []).map((file) => (
            <EvidenceThumb
              key={file._id || file.url}
              url={file.url}
              label={file.name || "Incident image"}
              type="image"
            />
          ))}

          {(incident.incidentVideos ?? []).map((file) => (
            <EvidenceThumb
              key={file._id || file.url}
              url={file.url}
              label={file.name || "Incident video"}
              type="video"
            />
          ))}
        </View>

        {!incident.incidentPictures?.length && !incident.incidentVideos?.length ? (
          <View style={styles.emptyMini}>
            <AppText style={styles.emptyMiniText}>
              No evidence files available.
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Location Metadata</AppText>

        <DetailRow label="State" value={incident.state} />
        <DetailRow label="LGA" value={incident.lga} />
        <DetailRow label="Ward" value={incident.ward} />
        <DetailRow label="Polling Unit" value={incident.pollingUnit} />
        <DetailRow label="Captured Address" value={incident.uploadLocation?.address} />
        <DetailRow label="Latitude" value={incident.uploadLocation?.latitude} />
        <DetailRow label="Longitude" value={incident.uploadLocation?.longitude} />
      </View>
    </>
  );
}

const ReportSummarySheet = forwardRef<BottomSheetModal, Props>(
  function ReportSummarySheet({ submission, onEditResult }, ref) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["86%", "96%"], []);
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        onChange={handleSheetChange}
        snapPoints={snapPoints}
        enablePanDownToClose
        topInset={insets.top + 12}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.bg}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={styles.header}>
            <View>
              <AppText style={styles.headerTitle}>Report Summary</AppText>
              <AppText style={styles.headerSubtitle}>
                Vault submission details
              </AppText>
            </View>

            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          {submission ? (
            isVaultResult(submission) ? (
              <ResultSummary
                result={submission.data}
                onEditResult={onEditResult}
              />
            ) : (
              <IncidentSummary incident={submission.data} />
            )
          ) : (
            <View style={styles.fallbackWrap}>
              <Ionicons
                name="document-text-outline"
                size={38}
                color={Theme.colors.textMuted}
              />
              <AppText style={styles.fallbackTitle}>No report selected</AppText>
              <AppText style={styles.fallbackText}>
                Select a vault item to view its full summary.
              </AppText>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default ReportSummarySheet;

const styles = StyleSheet.create({
  bg: {
    backgroundColor: "#FBF8EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: "rgba(17,26,50,0.12)",
    width: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE4EB",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "rgba(5,163,156,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  warningHeroIcon: {
    backgroundColor: "rgba(245,158,11,0.10)",
  },
  heroCopy: {
    flex: 1,
    gap: 3,
  },
  heroTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  section: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE4EB",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  editMiniButton: {
    minHeight: 32,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  editMiniText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
  detailRow: {
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F4",
    paddingBottom: 9,
  },
  detailLabel: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  partyWrap: {
    gap: 12,
  },
  partyRow: {
    gap: 7,
  },
  partyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  partyName: {
    fontSize: 14,
    lineHeight: 19,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  partyCount: {
    fontSize: 14,
    lineHeight: 19,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(5,163,156,0.10)",
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },
  evidenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  evidenceCard: {
    width: "48%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DFE4EB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  evidenceImage: {
    width: "100%",
    height: 110,
    backgroundColor: "#EEF2F6",
  },
  videoEvidence: {
    width: "100%",
    height: 110,
    backgroundColor: "rgba(5,163,156,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  evidenceFooter: {
    minHeight: 38,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  evidenceLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  emptyMini: {
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  emptyMiniText: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  fallbackWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 8,
  },
  fallbackTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  fallbackText: {
    fontSize: 13,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 260,
  },
});