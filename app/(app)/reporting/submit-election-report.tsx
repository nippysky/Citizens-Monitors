import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ReportingOutcomeState from "@/components/reporting/ReportingOutcomeState";
import PostReportFeedbackCard from "@/components/reporting/PostReportFeedbackCard";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { Paths } from "@/constants/paths";
import { useNetwork } from "@/context/NetworkContext";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { useAppToast } from "@/hooks/useAppToast";
import {
  buildInitialResultDraft,
  calculateTotalValidVotes,
  clearResultDraft,
  CommencementContext,
  DEV_COMMENCEMENT_CONTEXT,
  ElectionResultDraft,
  getResultDraft,
  saveResultDraft,
  validateElectionResult,
} from "@/lib/reporting";
import {
  ensureCameraPermission,
  ensureMediaLibraryPermission,
} from "@/lib/permissions";
import { stageMediaFile } from "@/lib/offlineMedia";
import { Theme } from "@/theme";
import APC from "@/svgs/app/collation/APC";
import LP from "@/svgs/app/collation/LP";
import NNPP from "@/svgs/app/collation/NNPP";
import OtherParties from "@/svgs/app/collation/OtherParties";
import PDP from "@/svgs/app/collation/PDP";

type ViewState = "form" | "success" | "invalid";

type FeedbackState = {
  rating: "good" | "manageable" | "poor" | "";
  intimidationToday: "yes" | "no" | "";
  voteBuyingToday: "yes" | "no" | "";
};

const initialFeedbackState: FeedbackState = {
  rating: "",
  intimidationToday: "",
  voteBuyingToday: "",
};

function OfflineBanner() {
  return (
    <View style={styles.offlineBanner}>
      <View style={styles.offlineIconWrap}>
        <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
      </View>
      <AppText style={styles.offlineBannerText}>
        You are offline. Reports will auto-submit when connected.
      </AppText>
    </View>
  );
}

function PartyLogo({ party }: { party: string }) {
  const normalized = party.trim().toUpperCase();

  if (normalized === "APC") {
    return <APC width={30} height={22} />;
  }

  if (normalized === "PDP") {
    return <PDP width={30} height={22} />;
  }

  if (normalized === "LP") {
    return <LP width={30} height={22} />;
  }

  if (normalized === "NNPP") {
    return <NNPP width={30} height={22} />;
  }

  if (
    normalized === "OTHERS" ||
    normalized === "OTHER PARTIES" ||
    normalized === "OTHERPARTIES"
  ) {
    return <OtherParties width={30} height={22} />;
  }

  return (
    <View style={styles.partyLogoStub}>
      <AppText style={styles.partyLogoStubText}>
        {party.slice(0, 3).toUpperCase()}
      </AppText>
    </View>
  );
}

function SmallActionButton({
  title,
  variant = "primary",
  onPress,
}: {
  title: string;
  variant?: "primary" | "secondary";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.smallActionBtn,
        variant === "primary"
          ? styles.smallActionBtnPrimary
          : styles.smallActionBtnSecondary,
      ]}
    >
      <AppText
        style={[
          styles.smallActionBtnText,
          variant === "primary"
            ? styles.smallActionBtnTextPrimary
            : styles.smallActionBtnTextSecondary,
        ]}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

function EvidenceCard({
  title,
  description,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  selectedUri,
  selectedType,
  warningText,
}: {
  title: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  selectedUri: string | null;
  selectedType: "image" | "video";
  warningText: string;
}) {
  const isFilled = Boolean(selectedUri);

  return (
    <View style={styles.evidenceBlock}>
      <AppText style={styles.fieldLabel}>{title}</AppText>

      {isFilled ? (
        <View style={styles.previewCard}>
          {selectedType === "image" && selectedUri ? (
            <Image source={{ uri: selectedUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.videoPreviewWrap}>
              <View style={styles.previewIconBadge}>
                <Ionicons name="videocam-outline" size={18} color="#111827" />
              </View>
              <AppText style={styles.previewLead}>Video attached</AppText>
              <AppText style={styles.previewSub}>
                Your selected evidence is ready.
              </AppText>
            </View>
          )}

          <Pressable
            style={styles.previewRemoveBtn}
            onPress={onSecondaryAction}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <View style={styles.uploadCard}>
          <View style={styles.previewIconBadge}>
            <Ionicons
              name={
                selectedType === "image"
                  ? "document-text-outline"
                  : "videocam-outline"
              }
              size={18}
              color="#111827"
            />
          </View>

          <AppText style={styles.uploadLead}>{description}</AppText>

          <View style={styles.uploadActionRow}>
            <SmallActionButton
              title={primaryActionLabel}
              onPress={onPrimaryAction}
            />
            <SmallActionButton
              title={secondaryActionLabel}
              variant="secondary"
              onPress={onSecondaryAction}
            />
          </View>
        </View>
      )}

      <AppText style={styles.warningText}>{warningText}</AppText>
    </View>
  );
}

function CompactField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.compactFieldWrap}>
      <AppText style={styles.compactFieldLabel}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder=""
        placeholderTextColor="#9CA3AF"
        style={styles.compactFieldInput}
      />
    </View>
  );
}

function resolveCommencementContext(input: {
  electionId?: string;
  electionTitle?: string;
  pollingUnitName?: string;
  pollingUnitCode?: string;
  ward?: string;
  lga?: string;
  state?: string;
}): CommencementContext {
  return {
    electionId: input.electionId?.trim() || DEV_COMMENCEMENT_CONTEXT.electionId,
    electionTitle:
      input.electionTitle?.trim() || DEV_COMMENCEMENT_CONTEXT.electionTitle,
    pollingUnitName:
      input.pollingUnitName?.trim() ||
      DEV_COMMENCEMENT_CONTEXT.pollingUnitName,
    pollingUnitCode:
      input.pollingUnitCode?.trim() ||
      DEV_COMMENCEMENT_CONTEXT.pollingUnitCode,
    ward: input.ward?.trim() || DEV_COMMENCEMENT_CONTEXT.ward,
    lga: input.lga?.trim() || DEV_COMMENCEMENT_CONTEXT.lga,
    state: input.state?.trim() || DEV_COMMENCEMENT_CONTEXT.state,
  };
}

export default function SubmitElectionReportScreen() {
  const params = useLocalSearchParams<{
    electionId?: string;
    electionTitle?: string;
    pollingUnitName?: string;
    pollingUnitCode?: string;
    ward?: string;
    lga?: string;
    state?: string;
    votingStartTime?: string;
  }>();

  const { isConnected, isInternetReachable } = useNetwork();
  const { enqueue } = useOfflineSync();
  const { showToast } = useAppToast();

  const [draft, setDraft] = useState<ElectionResultDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("form");
  const [invalidReason, setInvalidReason] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(initialFeedbackState);

  const isOffline = !isConnected || !isInternetReachable;

  useEffect(() => {
    let mounted = true;

    const hydrateDraft = async () => {
      try {
        const storedDraft = await getResultDraft();
        if (!mounted) return;

        if (storedDraft) {
          setDraft(storedDraft);
          return;
        }

        const ctx = resolveCommencementContext({
          electionId: params.electionId,
          electionTitle: params.electionTitle,
          pollingUnitName: params.pollingUnitName,
          pollingUnitCode: params.pollingUnitCode,
          ward: params.ward,
          lga: params.lga,
          state: params.state,
        });

        const freshDraft = buildInitialResultDraft(
          ctx,
          params.votingStartTime?.trim() || ""
        );

        setDraft(freshDraft);
        await saveResultDraft(freshDraft);
      } catch {
        if (!mounted) return;

        const fallbackCtx = resolveCommencementContext({
          electionId: params.electionId,
          electionTitle: params.electionTitle,
          pollingUnitName: params.pollingUnitName,
          pollingUnitCode: params.pollingUnitCode,
          ward: params.ward,
          lga: params.lga,
          state: params.state,
        });

        const fallbackDraft = buildInitialResultDraft(
          fallbackCtx,
          params.votingStartTime?.trim() || ""
        );

        setDraft(fallbackDraft);
      }
    };

    void hydrateDraft();

    return () => {
      mounted = false;
    };
  }, [
    params.electionId,
    params.electionTitle,
    params.pollingUnitName,
    params.pollingUnitCode,
    params.ward,
    params.lga,
    params.state,
    params.votingStartTime,
  ]);

  const totalValidVotes = useMemo(() => {
    if (!draft) return 0;
    return calculateTotalValidVotes(draft.votesPerParty);
  }, [draft]);

  const updateDraft = async (next: ElectionResultDraft) => {
    setDraft(next);
    await saveResultDraft(next);
  };

  const pickImage = async () => {
    if (!draft) return;

    const allowed = await ensureMediaLibraryPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: false,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const staged = await stageMediaFile({
      sourceUri: result.assets[0].uri,
      kind: "image",
      mimeType: result.assets[0].mimeType ?? "image/jpeg",
    });

    await updateDraft({
      ...draft,
      signedResultImageUri: staged.localUri,
    });
  };

  const takePhoto = async () => {
    if (!draft) return;

    const allowed = await ensureCameraPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const staged = await stageMediaFile({
      sourceUri: result.assets[0].uri,
      kind: "image",
      mimeType: result.assets[0].mimeType ?? "image/jpeg",
    });

    await updateDraft({
      ...draft,
      signedResultImageUri: staged.localUri,
    });
  };

  const pickVideo = async () => {
    if (!draft) return;

    const allowed = await ensureMediaLibraryPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.8,
      videoMaxDuration: 180,
      allowsEditing: false,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const staged = await stageMediaFile({
      sourceUri: result.assets[0].uri,
      kind: "video",
      mimeType: result.assets[0].mimeType ?? "video/mp4",
    });

    await updateDraft({
      ...draft,
      resultAnnouncementVideoUri: staged.localUri,
    });
  };

  const recordVideo = async () => {
    if (!draft) return;

    const allowed = await ensureCameraPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["videos"],
      quality: 0.8,
      videoMaxDuration: 180,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const staged = await stageMediaFile({
      sourceUri: result.assets[0].uri,
      kind: "video",
      mimeType: result.assets[0].mimeType ?? "video/mp4",
    });

    await updateDraft({
      ...draft,
      resultAnnouncementVideoUri: staged.localUri,
    });
  };

  const handleSubmit = async () => {
    if (!draft) return;

    setLoading(true);

    const validation = validateElectionResult(draft);

    if (!validation.valid) {
      setInvalidReason(validation.reason ?? "");
      setLoading(false);
      setViewState("invalid");
      return;
    }

    enqueue({
      type: "submit-election-report",
      payload: {
        ...draft,
        totalValidVotes: validation.totalValidVotes,
      } as unknown as Record<string, unknown>,
    });

    await clearResultDraft();
    setLoading(false);
    setViewState("success");

    showToast({
      type: "success",
      message: isOffline
        ? "Report saved offline. It will sync automatically when you're back online."
        : "Report submitted successfully.",
    });
  };

  if (viewState === "success") {
    return (
      <ReportingOutcomeState
        variant="success"
        showConfetti
        title="Report Submitted"
        subtitle="Your participation today makes a difference. Thank You. Nigerians are seeing it now."
        primaryActionLabel="Submit Feedback"
        onPrimaryAction={() => router.replace(Paths.appCollation)}
      >
        <PostReportFeedbackCard
          rating={feedback.rating}
          intimidationToday={feedback.intimidationToday}
          voteBuyingToday={feedback.voteBuyingToday}
          onChangeRating={(rating) =>
            setFeedback((prev) => ({ ...prev, rating }))
          }
          onChangeIntimidationToday={(value) =>
            setFeedback((prev) => ({ ...prev, intimidationToday: value }))
          }
          onChangeVoteBuyingToday={(value) =>
            setFeedback((prev) => ({ ...prev, voteBuyingToday: value }))
          }
        />
      </ReportingOutcomeState>
    );
  }

  if (viewState === "invalid") {
    return (
      <ReportingOutcomeState
        variant="error"
        title="Report Submitted Not Valid"
        subtitle={invalidReason}
        infoCardText="Ensure that the number of ballots issued equals the number of votes cast, rejected ballots, and unused ballots. A discrepancy in these totals constitutes an irregularity and must be documented."
        primaryActionLabel="Submit As Incident"
        onPrimaryAction={() => router.replace(Paths.reportIncident)}
        secondaryActionLabel="Re-enter Result"
        onSecondaryAction={() => setViewState("form")}
      />
    );
  }

  if (!draft) {
    return (
      <AppGradientScreen>
        <View style={styles.centerLoadingWrap}>
          <AppText style={styles.loadingText}>Preparing report form...</AppText>
        </View>
      </AppGradientScreen>
    );
  }

  return (
    <AppGradientScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <BackButton label="" />
        </View>

        <AppText style={styles.pageTitle}>{draft.electionTitle}</AppText>

        {isOffline ? <OfflineBanner /> : null}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Upload Visual Results</AppText>
          <AppText style={styles.sectionSubtitle}>
            Kindly upload signed result sheets and/or video of cumulative result
            announcement.
          </AppText>
        </View>

        <EvidenceCard
          title="Image of the Signed Result Sheet"
          description="Capture all the four corners of the signed EC8A result sheet in good lighting."
          primaryActionLabel="Take Photo"
          secondaryActionLabel={
            draft.signedResultImageUri ? "Remove" : "Upload from Gallery"
          }
          onPrimaryAction={takePhoto}
          onSecondaryAction={
            draft.signedResultImageUri
              ? () =>
                  void updateDraft({
                    ...draft,
                    signedResultImageUri: null,
                  })
              : pickImage
          }
          selectedUri={draft.signedResultImageUri}
          selectedType="image"
          warningText="The picture uploaded must be a signed result sheet for the election of your polling unit."
        />

        <EvidenceCard
          title="Video of Cumulative Result Announcement"
          description="Capture video of when the INEC official announced the result in good lighting."
          primaryActionLabel="Record Live"
          secondaryActionLabel={
            draft.resultAnnouncementVideoUri ? "Remove" : "Upload from Gallery"
          }
          onPrimaryAction={recordVideo}
          onSecondaryAction={
            draft.resultAnnouncementVideoUri
              ? () =>
                  void updateDraft({
                    ...draft,
                    resultAnnouncementVideoUri: null,
                  })
              : pickVideo
          }
          selectedUri={draft.resultAnnouncementVideoUri}
          selectedType="video"
          warningText="Video must contain vocal proof of date, time and place to validate the video as authentic and verifiable."
        />

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Manual Record Result</AppText>
          <AppText style={styles.sectionSubtitle}>
            Enter exactly what is on the result sheet. Your accuracy is your
            integrity.
          </AppText>
        </View>

        <AppText style={styles.fieldLabel}>Enter Votes Per Party</AppText>

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <AppText style={styles.tableHeaderText}>Party</AppText>
            <AppText style={styles.tableHeaderText}>Votes</AppText>
          </View>

          {draft.votesPerParty.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.partyRow,
                index !== draft.votesPerParty.length - 1 &&
                  styles.partyRowBorder,
              ]}
            >
              <View style={styles.partyInfoWrap}>
                <PartyLogo party={item.party} />

                <View style={styles.partyTextWrap}>
                  <AppText style={styles.partyName}>{item.party}</AppText>
                  {item.candidate ? (
                    <AppText style={styles.candidateName}>
                      {item.candidate}
                    </AppText>
                  ) : null}
                </View>
              </View>

              <TextInput
                value={String(item.votes)}
                onChangeText={(votes) => {
                  void updateDraft({
                    ...draft,
                    votesPerParty: draft.votesPerParty.map((partyVote) =>
                      partyVote.id === item.id
                        ? { ...partyVote, votes: votes.replace(/[^\d]/g, "") }
                        : partyVote
                    ),
                  });
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                style={styles.voteInput}
              />
            </View>
          ))}

          <View style={styles.totalRow}>
            <AppText style={styles.totalLabel}>Total Valid Votes</AppText>
            <AppText style={styles.totalValue}>{totalValidVotes}</AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            Administrative Figures on the Result sheet (EC8A)
          </AppText>
        </View>

        <View style={styles.adminGrid}>
          <View style={styles.adminGridRow}>
            <CompactField
              label="Accredited Voters"
              value={draft.accreditedVoters}
              onChangeText={(value) =>
                void updateDraft({
                  ...draft,
                  accreditedVoters: value.replace(/[^\d]/g, ""),
                })
              }
            />

            <CompactField
              label="Rejected Voters"
              value={draft.rejectedVoters}
              onChangeText={(value) =>
                void updateDraft({
                  ...draft,
                  rejectedVoters: value.replace(/[^\d]/g, ""),
                })
              }
            />
          </View>

          <View style={styles.adminGridRow}>
            <CompactField
              label="Spoiled Ballot Papers"
              value={draft.spoiledBallotPapers}
              onChangeText={(value) =>
                void updateDraft({
                  ...draft,
                  spoiledBallotPapers: value.replace(/[^\d]/g, ""),
                })
              }
            />

            <CompactField
              label="Rejected Ballots"
              value={draft.rejectedBallots}
              onChangeText={(value) =>
                void updateDraft({
                  ...draft,
                  rejectedBallots: value.replace(/[^\d]/g, ""),
                })
              }
            />
          </View>

          <View style={styles.adminGridRow}>
            <View style={styles.halfField}>
              <CompactField
                label="Used Ballot Papers"
                value={draft.usedBallotPapers}
                onChangeText={(value) =>
                  void updateDraft({
                    ...draft,
                    usedBallotPapers: value.replace(/[^\d]/g, ""),
                  })
                }
              />
            </View>

            <View style={styles.halfFieldPlaceholder} />
          </View>
        </View>

        <Pressable
          style={styles.truthRow}
          onPress={() =>
            void updateDraft({
              ...draft,
              confirmTruthfulness: !draft.confirmTruthfulness,
            })
          }
        >
          <View
            style={[
              styles.checkWrap,
              draft.confirmTruthfulness && styles.checkWrapActive,
            ]}
          >
            {draft.confirmTruthfulness ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : null}
          </View>

          <AppText style={styles.truthText}>
            I confirm this data matches the signed EC8A result sheet I have
            photographed. I understand that false reporting is an offence under
            Section 117 of the Electoral Act 2022.
          </AppText>
        </Pressable>

        <AppButton
          title={loading ? "Submitting..." : "Submit Report"}
          onPress={handleSubmit}
          loading={loading}
          disabled={!draft.confirmTruthfulness || loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 32,
    gap: 14,
  },

  centerLoadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },

  headerRow: {
    minHeight: 30,
    justifyContent: "center",
  },

  pageTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
    marginBottom: 2,
  },

  offlineBanner: {
    minHeight: 52,
    backgroundColor: "#F24E1E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: -16,
    marginBottom: 6,
  },

  offlineIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  offlineBannerText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
  },

  section: {
    gap: 4,
  },

  sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  evidenceBlock: {
    gap: 6,
  },

  fieldLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  uploadCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "#22B8B0",
    borderStyle: "dashed",
    backgroundColor: "#EAF7F6",
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 10,
  },

  previewIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#DFF1EE",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadLead: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 280,
  },

  uploadActionRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  smallActionBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  smallActionBtnPrimary: {
    backgroundColor: Theme.colors.primary,
  },

  smallActionBtnSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },

  smallActionBtnText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
  },

  smallActionBtnTextPrimary: {
    color: "#FFFFFF",
  },

  smallActionBtnTextSecondary: {
    color: Theme.colors.primary,
  },

  previewCard: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#22B8B0",
    backgroundColor: "#EAF7F6",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  videoPreviewWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },

  previewLead: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  previewSub: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  previewRemoveBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F15A24",
    alignItems: "center",
    justifyContent: "center",
  },

  warningText: {
    fontSize: 11,
    lineHeight: 15,
    color: "#F15A24",
  },

  tableCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDE6E9",
    backgroundColor: "#FFFFFF",
  },

  tableHeader: {
    minHeight: 40,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tableHeaderText: {
    fontSize: 13,
    lineHeight: 17,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.medium,
  },

  partyRow: {
    minHeight: 74,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },

  partyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F5",
  },

  partyInfoWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },

  partyLogoStub: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  partyLogoStubText: {
    fontSize: 9,
    lineHeight: 11,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  partyTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  partyName: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  candidateName: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  voteInput: {
    width: 120,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 0,
    color: Theme.colors.text,
    fontSize: 15,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "right",
  },

  totalRow: {
    minHeight: 42,
    backgroundColor: "#D6EBEA",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  totalValue: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  adminGrid: {
    gap: 12,
  },

  adminGridRow: {
    flexDirection: "row",
    gap: 12,
  },

  halfField: {
    flex: 1,
  },

  halfFieldPlaceholder: {
    flex: 1,
  },

  compactFieldWrap: {
    flex: 1,
    gap: 6,
  },

  compactFieldLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  compactFieldInput: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C9D3DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: Theme.colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.medium,
  },

  truthRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 2,
  },

  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },

  checkWrapActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },

  truthText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  submitBtn: {
    marginTop: 4,
    marginVertical: 0,
  },
});