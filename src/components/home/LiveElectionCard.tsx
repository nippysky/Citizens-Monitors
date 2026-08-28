import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import CommencementBottomSheet from "@/components/reporting/CommencementBottomSheet";
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { useMyProfileQuery } from "@/hooks/api/useMyProfileQuery";
import { useHasSubmission } from "@/hooks/useHasSubmission";
import { useSubmissionGate } from "@/hooks/useSubmissionGate";
import {
  asProfileLike,
  buildProfileCommencementContext,
} from "@/lib/profileCommencement";
import {
  buildInitialIncidentDraft,
  buildInitialResultDraft,
  saveIncidentDraft,
  saveResultDraft,
} from "@/lib/reporting";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import { Theme } from "@/theme";
import { ElectionCardItem, UserRole } from "@/types/home";

type Props = {
  item: ElectionCardItem;
  width: number;
  viewerRole: UserRole;
};

function canSubmitResult(role: UserRole): boolean {
  return role === "observer" || role === "volunteer";
}

function getElectionIcon(type: ElectionCardItem["electionType"]) {
  switch (type) {
    case "senatorial":
    case "senate":
      return SenatorElection;
    case "house-of-representatives":
    case "house-of-reps":
    case "house-of-assembly":
    case "gubernatorial":
      return HouseOfRepsElection;
    case "presidential":
    case "national":
    case "local-government":
    case "other":
    default:
      return PresidentialElection;
  }
}

/**
 * Returns an ELEMENT, not a component type. Assigning a component to a local
 * during render changes its identity every pass, remounting the subtree.
 */
function renderElectionIcon(
  type: ElectionCardItem["electionType"],
  size: number
) {
  const Icon = getElectionIcon(type);
  return <Icon width={size} height={size} />;
}

function getRecordedText(item: ElectionCardItem): string {
  if (item.totalPollingUnits > 0) {
    return `${item.pollingUnitsRecorded}/${item.totalPollingUnits} Polling Units recorded`;
  }

  if (typeof item.partiesCount === "number" && item.partiesCount > 0) {
    return `${item.partiesCount} parties configured`;
  }

  return "Live collation in progress";
}

function getProgress(item: ElectionCardItem): number {
  if (!item.totalPollingUnits) return 0;

  return Math.min(
    1,
    Math.max(0, item.pollingUnitsRecorded / item.totalPollingUnits)
  );
}

export default function LiveElectionCard({ item, width, viewerRole }: Props) {
  const activeElectionId = item.activeElectionId ?? item.id;
  const submitEnabled = canSubmitResult(viewerRole);
  const progress = getProgress(item);
  const commencementRef = useRef<BottomSheetModal>(null);

  // Polling unit ALWAYS comes from the user's profile (every user has exactly
  // one polling unit regardless of election) — same shared builder used by
  // the LiveNotice banner, the Elections FAB and the Collation tab, so the
  // commencement sheet shows identical details from every entry point.
  const { profile } = useMyProfileQuery();
  const commencementContext = buildProfileCommencementContext({
    electionId: activeElectionId,
    electionTitle: item.title,
    profile: asProfileLike(profile),
  });

  const handleOpenCollation = () => {
    router.push({
      pathname: Paths.appCollation as never,
      params: {
        tab: "overview",
        collationId: activeElectionId,
        activeElectionId,
        electionId: activeElectionId,
      },
    });
  };

  const { checkAndProceed } = useSubmissionGate();
  const { hasSubmission } = useHasSubmission(activeElectionId, {
    enabled: submitEnabled,
  });

  const handleSubmitResult = () => {
    if (!submitEnabled) {
      handleOpenCollation();
      return;
    }

    // Already know the answer — skip straight to the Vault rather than
    // re-running the async gate check.
    if (hasSubmission) {
      router.push(Paths.appDigitalVault as never);
      return;
    }

    void checkAndProceed(activeElectionId, () => {
      commencementRef.current?.present();
    });
  };

  const handleProceedResult = async (time: string) => {
    const votingStartTime = time || item.votingStartTime?.trim() || item.startDate || "";
    const electionLocation = item.electionLocation?.trim() || item.location;

    // Persist the initial draft BEFORE navigating (same as every other entry
    // point) so the report screens always hydrate correctly.
    const draft = buildInitialResultDraft(commencementContext, votingStartTime);
    await saveResultDraft(draft);

    router.push({
      pathname: Paths.submitElectionReport as never,
      params: {
        electionId: activeElectionId,
        activeElectionId,
        electionTitle: item.title,
        electionType: item.electionType,
        electionLocation,
        electionStartDate: item.startDate ?? "",
        electionEndDate: item.endDate ?? "",
        votingStartTime,
        pollingUnitName: commencementContext.pollingUnitName,
        pollingUnitCode: commencementContext.pollingUnitCode,
        ward: commencementContext.ward,
        lga: commencementContext.lga,
        state: commencementContext.state,
      },
    });
  };

  const handleProceedIncident = async (time: string) => {
    // Persist the initial incident draft BEFORE navigating — jumping straight
    // to the camera with no stored draft is what left the review screen stuck
    // on "Preparing report...". Route to the incident FORM first (same as the
    // LiveNotice and Elections-FAB flows) so the user picks an incident type.
    const draft = buildInitialIncidentDraft(commencementContext);
    // Carry the observed time straight into the draft so the incident form
    // opens pre-filled for THIS election.
    await saveIncidentDraft({ ...draft, incidentTime: time });

    router.push({
      pathname: Paths.reportIncident as never,
      params: {
        electionId: commencementContext.electionId,
        electionTitle: commencementContext.electionTitle,
        incidentTime: time,
        pollingUnitName: commencementContext.pollingUnitName,
        pollingUnitCode: commencementContext.pollingUnitCode,
        ward: commencementContext.ward,
        lga: commencementContext.lga,
        state: commencementContext.state,
      },
    });
  };

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.topRow}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <AppText style={styles.liveText}>LIVE NOW</AppText>
        </View>

        <View style={styles.illustrationWrap}>
          {renderElectionIcon(item.electionType, 44)}
        </View>
      </View>

      <AppText style={styles.title} numberOfLines={2}>
        {item.title}
      </AppText>

      <View style={styles.metaBlock}>
        <View style={styles.metaRow}>
          <Ionicons
            name="location-outline"
            size={17}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.metaText} numberOfLines={1}>
            {item.location}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name="podium-outline"
            size={16}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.metaText} numberOfLines={1}>
            {getRecordedText(item)}
          </AppText>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeaderRow}>
          <AppText style={styles.progressLabel}>Collation progress</AppText>
          <AppText style={styles.progressPercent}>
            {`${Math.round(progress * 100)}%`}
          </AppText>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width:
                  progress > 0
                    ? `${Math.max(8, Math.round(progress * 100))}%`
                    : "28%",
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleOpenCollation}
          style={({ pressed }) => [
            styles.collationButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="list-outline" size={20} color="#FFFFFF" />
          <AppText style={styles.collationButtonText}>Collation</AppText>
          <Ionicons name="chevron-forward" size={17} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={handleSubmitResult}
          style={({ pressed }) => [
            styles.submitButton,
            !submitEnabled && styles.submitButtonDisabled,
            submitEnabled && hasSubmission && styles.submitButtonDone,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            submitEnabled && hasSubmission
              ? "Submitted — view in Digital Vault"
              : submitEnabled
                ? "Submit report"
                : "View collation"
          }
        >
          <Ionicons
            name={
              !submitEnabled
                ? "eye-outline"
                : hasSubmission
                  ? "checkmark-circle"
                  : "document-text-outline"
            }
            size={18}
            color={
              submitEnabled && hasSubmission
                ? Theme.colors.success
                : Theme.colors.primary
            }
          />
          <AppText
            style={[
              styles.submitButtonText,
              submitEnabled && hasSubmission && styles.submitButtonDoneText,
            ]}
          >
            {!submitEnabled ? "View" : hasSubmission ? "Submitted" : "Submit"}
          </AppText>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={
              submitEnabled && hasSubmission
                ? Theme.colors.success
                : Theme.colors.primary
            }
          />
        </Pressable>
      </View>

      <CommencementBottomSheet
        ref={commencementRef}
        contextData={commencementContext}
        onProceedResult={handleProceedResult}
        onProceedIncident={handleProceedIncident}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.16)",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 13,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(239,68,68,0.09)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.22)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#EF4444",
  },

  liveText: {
    fontSize: 12.5,
    lineHeight: 16,
    color: "#DC2626",
    fontFamily: Theme.fonts.body.bold,
    letterSpacing: 0.8,
  },

  illustrationWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(5,163,156,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    lineHeight: 27,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  metaBlock: {
    gap: 8,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  metaText: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  progressBlock: {
    gap: 7,
  },

  progressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  progressPercent: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    fontVariant: ["tabular-nums"],
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(15,23,42,0.08)",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 3,
  },

  collationButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },

  collationButtonText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },

  submitButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "rgba(5,163,156,0.06)",
    borderWidth: 1.4,
    borderColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  submitButtonDisabled: {
    borderColor: "rgba(5,163,156,0.35)",
    opacity: 0.85,
  },

  submitButtonDone: {
    backgroundColor: "rgba(16,185,129,0.08)",
    borderColor: Theme.colors.success,
  },

  submitButtonText: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  submitButtonDoneText: {
    color: Theme.colors.success,
  },

  pressed: {
    opacity: 0.78,
  },
});
