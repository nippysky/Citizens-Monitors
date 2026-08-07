import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import { useQueryClient } from "@tanstack/react-query";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ReportingOutcomeState from "@/components/reporting/ReportingOutcomeState";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import { Paths } from "@/constants/paths";
import { useNetwork } from "@/context/NetworkContext";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { useAppToast } from "@/hooks/useAppToast";
import { reportingQueryKeys } from "@/hooks/api/useReportingMutations";
import { useElectionCollationQuery } from "@/hooks/api/useCollationQueries";
import { buildCollationItem } from "@/data/collation";
import {
  mapDraftToElectionResultPayload,
  submitElectionResult,
} from "@/lib/api/reporting.api";
import {
  abandonResultDraft,
  buildCommencementContext,
  buildInitialIncidentDraft,
  buildInitialResultDraft,
  clearResultDraft,
  collectResultDraftMediaUris,
  CommencementContext,
  ElectionResultDraft,
  getResultDraft,
  saveIncidentDraft,
  saveResultDraft,
  validateElectionResult,
} from "@/lib/reporting";
import {
  ensureCameraPermission,
  ensureMediaLibraryPermission,
} from "@/lib/permissions";
import { deleteStagedMediaFiles, stageMediaFile } from "@/lib/offlineMedia";
import {
  formatPartyPickerLabel,
  getPartyInfo,
  isGenericOthersEntry,
  isPopularParty,
  PARTY_CATALOG,
  parsePartyPickerLabel,
} from "@/data/parties";
import { Theme } from "@/theme";
import APC from "@/svgs/app/collation/APC";
import LP from "@/svgs/app/collation/LP";
import NNPP from "@/svgs/app/collation/NNPP";
import OtherParties from "@/svgs/app/collation/OtherParties";
import PDP from "@/svgs/app/collation/PDP";

type ViewState = "form" | "review-sentiment" | "success" | "invalid";

type FeedbackState = {
  rating: "good" | "manageable" | "poor" | "";
  intimidationToday: "yes" | "no" | "";
  voteBuyingToday: "yes" | "no" | "";
};

type PartyVoteEntry = ElectionResultDraft["votesPerParty"][number];
type PartyCatalogEntry = (typeof PARTY_CATALOG)[number];
type IoniconsName = keyof typeof Ionicons.glyphMap;

const initialFeedbackState: FeedbackState = {
  rating: "",
  intimidationToday: "",
  voteBuyingToday: "",
};

function getCatalogEntryCode(entry: PartyCatalogEntry): string {
  if (typeof entry === "string") return (entry as string).trim();

  if (entry && typeof entry === "object" && "code" in entry) {
    const code = entry.code;
    return typeof code === "string" ? code.trim() : "";
  }

  return "";
}

function formatCatalogEntryForPicker(entry: PartyCatalogEntry): string {
  const fallbackCode = getCatalogEntryCode(entry);

  try {
    const formatter = formatPartyPickerLabel as unknown as (
      value: PartyCatalogEntry
    ) => string;

    const label = formatter(entry);
    if (label?.trim()) return label;
  } catch {
    // Fallback below keeps the picker resilient if the catalog shape changes.
  }

  const fallbackName = getPartyInfo(fallbackCode)?.fullName;
  return fallbackName ? `${fallbackCode} — ${fallbackName}` : fallbackCode;
}

function parseSelectedPartyCode(label: string): string {
  const parsed = parsePartyPickerLabel(label) as unknown;

  if (typeof parsed === "string") {
    return parsed.trim().toUpperCase();
  }

  if (parsed && typeof parsed === "object" && "code" in parsed) {
    const code = parsed.code;
    if (typeof code === "string") return code.trim().toUpperCase();
  }

  return label.split(/[—-]/)[0]?.trim().toUpperCase() ?? "";
}

function OfflineBanner() {
  return (
    <View style={styles.offlineBanner}>
      <View style={styles.offlineIconWrap}>
        <Ionicons name="cloud-offline-outline" size={17} color="#FFFFFF" />
      </View>

      <AppText style={styles.offlineBannerText}>
        You are offline. Reports will auto-submit when connected.
      </AppText>
    </View>
  );
}

function Header() {
  return (
    <View style={styles.headerRow}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={25} color="#111827" />
      </Pressable>
    </View>
  );
}

function PartyLogo({ party }: { party: string }) {
  const normalized = party.trim().toUpperCase();

  if (normalized === "APC") return <APC width={30} height={23} />;
  if (normalized === "PDP") return <PDP width={30} height={23} />;
  if (normalized === "LP") return <LP width={30} height={23} />;
  if (normalized === "NNPP") return <NNPP width={30} height={23} />;

  return <OtherParties width={30} height={23} />;
}

function SmallActionButton({
  title,
  iconName,
  variant = "primary",
  onPress,
}: {
  title: string;
  iconName?: IoniconsName;
  variant?: "primary" | "secondary";
  onPress: () => void;
}) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.smallActionBtn,
        isPrimary ? styles.smallActionBtnPrimary : styles.smallActionBtnSecondary,
      ]}
    >
      {iconName ? (
        <Ionicons
          name={iconName}
          size={14}
          color={isPrimary ? "#FFFFFF" : Theme.colors.primary}
        />
      ) : null}

      <AppText
        style={[
          styles.smallActionBtnText,
          isPrimary
            ? styles.smallActionBtnTextPrimary
            : styles.smallActionBtnTextSecondary,
        ]}
        numberOfLines={1}
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
  primaryIconName,
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
  primaryIconName: IoniconsName;
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
              <View style={styles.uploadIconHalo}>
                <Ionicons name="document-text-outline" size={19} color="#101828" />
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
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Remove selected evidence"
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <View style={styles.uploadCard}>
          <View style={styles.uploadIconHalo}>
            <Ionicons name="document-text-outline" size={19} color="#101828" />
          </View>

          <AppText style={styles.uploadLead}>{description}</AppText>

          <View style={styles.uploadActionRow}>
            <SmallActionButton
              title={primaryActionLabel}
              iconName={primaryIconName}
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
        keyboardType="number-pad"
        placeholderTextColor="#9CA3AF"
        selectionColor={Theme.colors.primary}
        style={styles.compactFieldInput}
      />
    </View>
  );
}

type PartyRowProps = {
  item: PartyVoteEntry;
  removable: boolean;
  onChangeVotes: (value: string) => void;
  onRemove: () => void;
};

function PartyRow({ item, removable, onChangeVotes, onRemove }: PartyRowProps) {
  const candidateName =
    typeof item.candidate === "string" && item.candidate.trim()
      ? item.candidate.trim()
      : getPartyInfo(item.party)?.fullName ?? "";

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      exiting={FadeOutUp.duration(200)}
      layout={LinearTransition.duration(220)}
      style={[styles.partyRow, styles.partyRowBorder]}
    >
      <View style={styles.partyInfoWrap}>
        <PartyLogo party={item.party} />

        <View style={styles.partyTextWrap}>
          <AppText style={styles.partyName} numberOfLines={1}>
            {item.party}
          </AppText>

          {candidateName ? (
            <AppText
              style={styles.partySubName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {candidateName}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={styles.partyActionWrap}>
        <TextInput
          value={String(item.votes ?? "")}
          onChangeText={onChangeVotes}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="#5B6770"
          selectionColor={Theme.colors.primary}
          style={styles.voteInput}
        />
      </View>

      {removable ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={styles.removePartyBtn}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.party}`}
        >
          <Ionicons name="close" size={11} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

function AddMorePartyRow({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.partyRow,
        styles.partyRowBorder,
        styles.addMorePartyRow,
        pressed && styles.addMorePartyRowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Add more party"
    >
      <View style={styles.partyInfoWrap}>
        <OtherParties width={30} height={23} />

        <View style={styles.addMoreLabelWrap}>
          <AppText style={styles.addMoreText}>Add More Party</AppText>
          <Ionicons name="chevron-down" size={15} color="#111827" />
        </View>
      </View>

      <View style={styles.partyActionWrap}>
        <TextInput
          value="0"
          editable={false}
          pointerEvents="none"
          style={styles.voteInput}
        />
      </View>
    </Pressable>
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
  return buildCommencementContext({
    electionId: input.electionId,
    electionTitle: input.electionTitle,
    pollingUnitName: input.pollingUnitName,
    pollingUnitCode: input.pollingUnitCode,
    ward: input.ward,
    lga: input.lga,
    state: input.state,
  });
}

function normalizePartyList(draft: ElectionResultDraft): ElectionResultDraft {
  const filtered = draft.votesPerParty.filter(
    (party) => !isGenericOthersEntry(party.party)
  );

  if (filtered.length === draft.votesPerParty.length) return draft;

  return {
    ...draft,
    votesPerParty: filtered,
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

  const queryClient = useQueryClient();
  const { isConnected, isInternetReachable } = useNetwork();
  const { enqueue } = useOfflineSync();
  const { showToast } = useAppToast();

  const [draft, setDraft] = useState<ElectionResultDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("form");
  const [invalidReason, setInvalidReason] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(initialFeedbackState);

  const partyPickerRef = useRef<BottomSheetModal>(null);
  const [partyPickerQuery, setPartyPickerQuery] = useState("");

  const isOffline = !isConnected || isInternetReachable === false;

  // Fetch election collation for the sentiment step
  const collationQuery = useElectionCollationQuery(draft?.electionId ?? null);
  const collationItem = buildCollationItem(collationQuery.data ?? undefined);

  // Deliberate exit wipes the draft + its staged media so nothing stale
  // greets the user on re-entry and evidence files don't pile up in storage.
  // Interruptions (app killed, phone call) never unmount this screen, so
  // field resume still works. After a successful submit / offline enqueue the
  // stored draft is already cleared, making this a safe no-op.
  useEffect(() => {
    return () => {
      void abandonResultDraft();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrateDraft = async () => {
      // Every entry point persists a draft carrying the chosen election's
      // context BEFORE navigating here, so that draft — not hardcoded dev
      // data — is the fallback when a route param is missing. Reading it
      // first is what guarantees the report lands against the election the
      // user actually tapped.
      const stored = await getResultDraft();

      const ctx = resolveCommencementContext({
        electionId: params.electionId ?? stored?.electionId,
        electionTitle: params.electionTitle ?? stored?.electionTitle,
        pollingUnitName: params.pollingUnitName ?? stored?.pollingUnitName,
        pollingUnitCode: params.pollingUnitCode ?? stored?.pollingUnitCode,
        ward: params.ward ?? stored?.ward,
        lga: params.lga ?? stored?.lga,
        state: params.state ?? stored?.state,
      });

      const votingStartTime =
        params.votingStartTime?.trim() || stored?.votingStartTime?.trim() || "";

      const freshDraft = () => buildInitialResultDraft(ctx, votingStartTime);

      try {
        // ALWAYS start fresh on entry. Backing out of this screen must leave
        // nothing behind — abandon wipes any stored draft AND deletes its
        // staged media files (also covers drafts orphaned by process death,
        // where the unmount cleanup never had a chance to run).
        await abandonResultDraft();
        if (!mounted) return;

        const normalized = normalizePartyList(freshDraft());
        setDraft(normalized);
        await saveResultDraft(normalized);
      } catch {
        if (!mounted) return;

        const fallback = normalizePartyList(freshDraft());
        setDraft(fallback);
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

  const renderableParties = useMemo(
    () => draft?.votesPerParty.filter((p) => !isGenericOthersEntry(p.party)) ?? [],
    [draft]
  );

  const totalValidVotes = useMemo(
    () =>
      renderableParties.reduce(
        (sum, party) => sum + (Number.parseInt(String(party.votes || "0"), 10) || 0),
        0
      ),
    [renderableParties]
  );

  const availablePartyOptions = useMemo(() => {
    if (!draft) return [];

    const used = new Set(
      draft.votesPerParty.map((entry) => entry.party.trim().toUpperCase())
    );

    const labels = PARTY_CATALOG.filter((entry) => {
      const code = getCatalogEntryCode(entry);
      return code && !used.has(code.toUpperCase());
    }).map(formatCatalogEntryForPicker);

    const query = partyPickerQuery.trim().toLowerCase();

    if (!query) return labels;

    return labels.filter((label) => label.toLowerCase().includes(query));
  }, [draft, partyPickerQuery]);

  const updateDraft = async (next: ElectionResultDraft) => {
    const normalized = normalizePartyList(next);
    setDraft(normalized);
    await saveResultDraft(normalized);
  };

  const updatePartyVotes = async (partyId: string, votes: string) => {
    if (!draft) return;

    await updateDraft({
      ...draft,
      votesPerParty: draft.votesPerParty.map((item) =>
        item.id === partyId
          ? { ...item, votes: votes.replace(/[^\d]/g, "") }
          : item
      ),
    });
  };

  const removeParty = async (partyId: string) => {
    if (!draft) return;

    await updateDraft({
      ...draft,
      votesPerParty: draft.votesPerParty.filter((item) => item.id !== partyId),
    });
  };

  const openPartyPicker = () => {
    setPartyPickerQuery("");
    partyPickerRef.current?.present();
  };

  const handleSelectParty = async (label: string) => {
    if (!draft) return;

    const code = parseSelectedPartyCode(label);

    if (!code) return;

    const exists = draft.votesPerParty.some(
      (item) => item.party.trim().toUpperCase() === code
    );

    if (exists) {
      partyPickerRef.current?.dismiss();
      setPartyPickerQuery("");
      return;
    }

    const partyInfo = getPartyInfo(code);

    const nextEntry: PartyVoteEntry = {
      id: `${code.toLowerCase()}-${Date.now()}`,
      party: code,
      candidate: partyInfo?.fullName ?? code,
      votes: "",
    };

    await updateDraft({
      ...draft,
      votesPerParty: [...draft.votesPerParty, nextEntry],
    });

    partyPickerRef.current?.dismiss();
    setPartyPickerQuery("");
  };

  const openImageCamera = async () => {
    if (!draft) return;

    const allowed = await ensureCameraPermission();
    if (!allowed) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      const staged = await stageMediaFile({
        sourceUri: asset.uri,
        kind: "image",
        mimeType: asset.mimeType,
      });

      await updateDraft({
        ...draft,
        signedResultImageUri: staged.localUri,
      });
    } catch {
      showToast({ type: "error", message: "Could not open camera." });
    }
  };

  const openImageGallery = async () => {
    if (!draft) return;

    const allowed = await ensureMediaLibraryPermission();
    if (!allowed) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      const staged = await stageMediaFile({
        sourceUri: asset.uri,
        kind: "image",
        mimeType: asset.mimeType,
      });

      await updateDraft({
        ...draft,
        signedResultImageUri: staged.localUri,
      });
    } catch {
      showToast({ type: "error", message: "Could not open gallery." });
    }
  };

  const openVideoCamera = async () => {
    if (!draft) return;

    const allowed = await ensureCameraPermission();
    if (!allowed) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["videos"],
        allowsEditing: false,
        videoMaxDuration: 180,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      const staged = await stageMediaFile({
        sourceUri: asset.uri,
        kind: "video",
        mimeType: asset.mimeType,
      });

      await updateDraft({
        ...draft,
        resultAnnouncementVideoUri: staged.localUri,
      });
    } catch {
      showToast({ type: "error", message: "Could not open camera." });
    }
  };

  const openVideoGallery = async () => {
    if (!draft) return;

    const allowed = await ensureMediaLibraryPermission();
    if (!allowed) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: false,
        videoMaxDuration: 180,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      const staged = await stageMediaFile({
        sourceUri: asset.uri,
        kind: "video",
        mimeType: asset.mimeType,
      });

      await updateDraft({
        ...draft,
        resultAnnouncementVideoUri: staged.localUri,
      });
    } catch {
      showToast({ type: "error", message: "Could not open gallery." });
    }
  };

  const invalidateReportingData = (electionId: string) => {
    void queryClient.invalidateQueries({ queryKey: reportingQueryKeys.dashboard });
    void queryClient.invalidateQueries({ queryKey: reportingQueryKeys.electionVault });
    void queryClient.invalidateQueries({ queryKey: reportingQueryKeys.collation });
    void queryClient.invalidateQueries({
      queryKey: reportingQueryKeys.electionCollation(electionId),
    });
  };

  // Submit gating — the button stays disabled until every required piece is
  // present, so an empty/partial form can never be submitted.
  const missingRequirement = ((): string | null => {
    if (!draft) return "Preparing form...";

    // Hard stop: without a real election id the report can't be attributed to
    // anything. Previously a dev fixture id silently filled this gap.
    if (!draft.electionId?.trim()) {
      return "This report isn't linked to an election. Go back and start from the election card.";
    }

    if (!draft.accreditedVoters.trim()) return "Enter the accredited voters figure.";
    if (!draft.usedBallotPapers.trim()) return "Enter the used ballot papers figure.";
    if (!draft.spoiledBallotPapers.trim()) return "Enter the spoiled ballot papers figure.";
    if (!draft.rejectedBallots.trim()) return "Enter the rejected ballot papers figure.";

    if (!draft.signedResultImageUri && !draft.resultAnnouncementVideoUri) {
      return "Attach the signed result sheet photo or announcement video.";
    }

    if (!validateElectionResult(draft).valid) {
      return "Valid + rejected + spoiled votes must equal accredited voters (EC8A).";
    }

    if (!draft.confirmTruthfulness) {
      return "Tick the confirmation box to continue.";
    }

    return null;
  })();

  const canSubmitReport = missingRequirement === null;
  const submitGateReason = missingRequirement ?? "";

  // Step 1: validate, then ALWAYS show the sentiment step (online AND
  // offline) — the 3 verdict questions are part of every report. Offline
  // handling happens at final confirm in doSubmit.
  const handleSubmit = async () => {
    if (!draft) return;

    const validation = validateElectionResult(draft);

    if (!validation.valid) {
      setInvalidReason(validation.reason ?? "");
      setViewState("invalid");
      return;
    }

    setViewState("review-sentiment");
  };

  // Step 2: final confirm from the sentiment screen — submits online or
  // queues offline, always carrying the verdict answers.
  const doSubmit = async () => {
    if (!draft) return;

    const validation = validateElectionResult(draft);

    // Re-run validation defensively (draft hasn't changed)
    if (!validation.valid) {
      setInvalidReason(validation.reason ?? "");
      setViewState("invalid");
      return;
    }

    const queuePayload = {
      ...(draft as unknown as Record<string, unknown>),
      totalValidVotes: validation.totalValidVotes,
      rating: feedback.rating,
      intimidationToday: feedback.intimidationToday,
      voteBuyingToday: feedback.voteBuyingToday,
    };

    // Offline: queue with the verdict answers included.
    if (isOffline) {
      enqueue({ type: "submit-election-report", payload: queuePayload });
      await clearResultDraft();
      setViewState("success");

      showToast({
        type: "success",
        message:
          "Report saved offline. It will sync automatically when you're back online.",
      });

      return;
    }

    setLoading(true);

    try {
      await submitElectionResult(
        mapDraftToElectionResultPayload({ draft, feedback })
      );

      await clearResultDraft();
      // Upload done — staged evidence files are no longer needed.
      deleteStagedMediaFiles(collectResultDraftMediaUris(draft));
      invalidateReportingData(draft.electionId);
      setViewState("success");

      showToast({ type: "success", message: "Report submitted successfully." });
    } catch (error) {
      enqueue({ type: "submit-election-report", payload: queuePayload });
      // Clear the stored draft (like the offline path) but KEEP the staged
      // files — the queued upload still needs them.
      await clearResultDraft();
      setViewState("success");

      showToast({
        type: "success",
        message:
          "Report saved offline. It will sync automatically when connection is stable.",
      });

      console.log("Election result queued:", error);
    } finally {
      setLoading(false);
    }
  };

  if (viewState === "review-sentiment") {
    const healthScore = collationItem.sentiment?.score ?? 0;
    const healthLegend = collationItem.sentiment?.legend ?? [];
    const resultsIn = collationItem.resultsUploaded ?? 0;
    const incidentsIn = collationItem.incidentsReported ?? 0;
    const progress = collationItem.progressPercent ?? 0;
    const parties = collationItem.parties ?? [];

    const feedbackComplete =
      feedback.rating !== "" &&
      feedback.intimidationToday !== "" &&
      feedback.voteBuyingToday !== "";

    const renderPills = <T extends string>(
      options: { value: T; label: string }[],
      selected: T | "",
      onSelect: (value: T) => void
    ) => (
      <View style={styles.feedbackPillRow}>
        {options.map((option) => {
          const active = selected === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={[styles.feedbackPill, active && styles.feedbackPillActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <AppText
                style={[
                  styles.feedbackPillText,
                  active && styles.feedbackPillTextActive,
                ]}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    );

    return (
      <AppGradientScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sentimentContent}
          keyboardShouldPersistTaps="handled"
        >
          <Header />

          <View style={styles.sentimentHeaderWrap}>
            <View style={styles.sentimentIconCircle}>
              <Ionicons name="analytics-outline" size={28} color={Theme.colors.primary} />
            </View>
            <AppText style={styles.sentimentHeading}>
              Election Overview
            </AppText>
            <AppText style={styles.sentimentSubheading}>
              Here&apos;s how this election is looking before you submit your report.
            </AppText>
          </View>

          {/* Health score */}
          <View style={styles.sentimentCard}>
            <AppText style={styles.sentimentCardTitle}>Overall Process Health</AppText>

            <View style={styles.sentimentHealthRow}>
              <View style={styles.sentimentScoreCircle}>
                <AppText style={styles.sentimentScoreValue}>{healthScore}%</AppText>
                <AppText style={styles.sentimentScoreLabel}>Good</AppText>
              </View>

              <View style={styles.sentimentLegend}>
                {healthLegend.map((item) => (
                  <View key={item.label} style={styles.sentimentLegendRow}>
                    <View style={[styles.sentimentLegendDot, { backgroundColor: item.color }]} />
                    <AppText style={styles.sentimentLegendLabel}>{item.label}</AppText>
                    <AppText style={styles.sentimentLegendValue}>{item.value}%</AppText>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.sentimentStatsRow}>
            <View style={styles.sentimentStat}>
              <AppText style={[styles.sentimentStatValue, { color: Theme.colors.primary }]}>
                {resultsIn}
              </AppText>
              <AppText style={styles.sentimentStatLabel}>Results In</AppText>
            </View>
            <View style={styles.sentimentStatDivider} />
            <View style={styles.sentimentStat}>
              <AppText style={[styles.sentimentStatValue, { color: "#F04A1D" }]}>
                {incidentsIn}
              </AppText>
              <AppText style={styles.sentimentStatLabel}>Incidents</AppText>
            </View>
            <View style={styles.sentimentStatDivider} />
            <View style={styles.sentimentStat}>
              <AppText style={[styles.sentimentStatValue, { color: Theme.colors.text }]}>
                {progress}%
              </AppText>
              <AppText style={styles.sentimentStatLabel}>Progress</AppText>
            </View>
          </View>

          {/* Collation progress bar */}
          <View style={styles.sentimentProgressWrap}>
            <CollationAnimatedProgressBar
              progress={progress}
              height={8}
              color={Theme.colors.primary}
              trackColor="#DADFE7"
            />
            <AppText style={styles.sentimentProgressLabel}>
              Collation progress — {collationItem.coveredUnits ?? 0}/{collationItem.totalUnits ?? 0} polling units
            </AppText>
          </View>

          {/* Party breakdown if available */}
          {parties.length > 0 ? (
            <View style={styles.sentimentCard}>
              <AppText style={styles.sentimentCardTitle}>Leading Parties</AppText>
              {parties.slice(0, 4).map((p) => (
                <View key={p.id} style={styles.sentimentPartyRow}>
                  <View style={styles.sentimentPartyLeft}>
                    <View style={[styles.sentimentPartyDot, { backgroundColor: p.color }]} />
                    <AppText style={styles.sentimentPartyName}>{p.shortName}</AppText>
                  </View>
                  <AppText style={styles.sentimentPartyPercent}>{p.percent}%</AppText>
                </View>
              ))}
            </View>
          ) : null}

          {/* Your polling unit sentiment — required before submitting */}
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeaderRow}>
              <View style={styles.feedbackIconCircle}>
                <Ionicons
                  name="megaphone-outline"
                  size={18}
                  color={Theme.colors.primary}
                />
              </View>
              <View style={styles.feedbackHeaderTextWrap}>
                <AppText style={styles.feedbackTitle}>
                  Your Polling Unit Verdict
                </AppText>
                <AppText style={styles.feedbackSubtitle}>
                  Answer these 3 quick questions to complete your report.
                </AppText>
              </View>
            </View>

            <View style={styles.feedbackQuestionBlock}>
              <AppText style={styles.feedbackQuestion}>
                How was today&apos;s voting process?
              </AppText>
              {renderPills(
                [
                  { value: "good" as const, label: "Good" },
                  { value: "manageable" as const, label: "Manageable" },
                  { value: "poor" as const, label: "Poor" },
                ],
                feedback.rating,
                (rating) => setFeedback((prev) => ({ ...prev, rating }))
              )}
            </View>

            <View style={styles.feedbackQuestionBlock}>
              <AppText style={styles.feedbackQuestion}>
                Did you witness voter intimidation today?
              </AppText>
              {renderPills(
                [
                  { value: "yes" as const, label: "Yes" },
                  { value: "no" as const, label: "No" },
                ],
                feedback.intimidationToday,
                (intimidationToday) =>
                  setFeedback((prev) => ({ ...prev, intimidationToday }))
              )}
            </View>

            <View style={styles.feedbackQuestionBlock}>
              <AppText style={styles.feedbackQuestion}>
                Did you witness vote buying today?
              </AppText>
              {renderPills(
                [
                  { value: "yes" as const, label: "Yes" },
                  { value: "no" as const, label: "No" },
                ],
                feedback.voteBuyingToday,
                (voteBuyingToday) =>
                  setFeedback((prev) => ({ ...prev, voteBuyingToday }))
              )}
            </View>

            {feedback.intimidationToday === "yes" ||
            feedback.voteBuyingToday === "yes" ? (
              <View style={styles.feedbackNudge}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#C2410C"
                />
                <AppText style={styles.feedbackNudgeText}>
                  After submitting, you can back this up with an incident
                  report — photos and video count as evidence.
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText style={styles.sentimentNote}>
            Your report will be added to these figures and help make this election more transparent.
          </AppText>

          <AppButton
            title={loading ? "Submitting..." : "Confirm & Submit Report"}
            onPress={() => void doSubmit()}
            loading={loading}
            disabled={loading || !feedbackComplete}
            style={styles.submitBtn}
          />

          {!feedbackComplete ? (
            <AppText style={styles.feedbackGateHint}>
              Answer the 3 verdict questions above to submit.
            </AppText>
          ) : null}

          <Pressable
            onPress={() => setViewState("form")}
            style={styles.sentimentBackBtn}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back-outline" size={16} color={Theme.colors.textMuted} />
            <AppText style={styles.sentimentBackText}>Go back and review</AppText>
          </Pressable>
        </ScrollView>
      </AppGradientScreen>
    );
  }

  if (viewState === "success") {
    const flaggedIssue =
      feedback.intimidationToday === "yes" || feedback.voteBuyingToday === "yes";

    // The verdict flagged intimidation / vote buying — nudge the user to back
    // it up with a proper incident report (type pre-selected when possible).
    const handleReportIncidentFromSuccess = async () => {
      if (!draft) return;

      const ctx = buildCommencementContext({
        electionId: draft.electionId,
        electionTitle: draft.electionTitle,
        pollingUnitName: draft.pollingUnitName,
        pollingUnitCode: draft.pollingUnitCode,
        ward: draft.ward,
        lga: draft.lga,
        state: draft.state,
      });

      await saveIncidentDraft({
        ...buildInitialIncidentDraft(ctx),
        incidentType:
          feedback.intimidationToday === "yes" ? "Voter Intimidation" : "",
      });

      router.replace({
        pathname: Paths.reportIncident as never,
        params: {
          electionId: ctx.electionId,
          electionTitle: ctx.electionTitle,
          pollingUnitName: ctx.pollingUnitName,
          pollingUnitCode: ctx.pollingUnitCode,
          ward: ctx.ward,
          lga: ctx.lga,
          state: ctx.state,
        },
      });
    };

    return (
      <ReportingOutcomeState
        variant="success"
        showConfetti
        title="Report Submitted"
        subtitle="Your participation today makes a difference. Thank You. Nigerians are seeing it now."
        primaryActionLabel="Go To Collation"
        onPrimaryAction={() => router.replace(Paths.appCollation)}
        secondaryActionLabel={
          flaggedIssue ? "Report What You Witnessed" : undefined
        }
        secondaryActionIcon="warning-outline"
        onSecondaryAction={
          flaggedIssue ? () => void handleReportIncidentFromSuccess() : undefined
        }
        infoCardText={
          flaggedIssue
            ? "You flagged intimidation or vote buying — filing an incident report with photos or video makes your account count as evidence."
            : undefined
        }
      />
    );
  }

  if (viewState === "invalid") {
    return (
      <ReportingOutcomeState
        variant="error"
        title="Result Mismatch"
        subtitle={invalidReason}
        primaryActionLabel="Review Report"
        onPrimaryAction={() => setViewState("form")}
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
        <Header />

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
          primaryIconName="camera-outline"
          secondaryActionLabel={
            draft.signedResultImageUri ? "Remove" : "Upload from Gallery"
          }
          onPrimaryAction={openImageCamera}
          onSecondaryAction={
            draft.signedResultImageUri
              ? () => void updateDraft({ ...draft, signedResultImageUri: null })
              : openImageGallery
          }
          selectedUri={draft.signedResultImageUri}
          selectedType="image"
          warningText="The picture uploaded must be a signed result sheet for the election of your polling unit."
        />

        <EvidenceCard
          title="Video of Cumulative Result Announcement"
          description="Capture video of when the INEC official announced the result in good lighting."
          primaryActionLabel="Record Live"
          primaryIconName="videocam-outline"
          secondaryActionLabel={
            draft.resultAnnouncementVideoUri ? "Remove" : "Upload from Gallery"
          }
          onPrimaryAction={openVideoCamera}
          onSecondaryAction={
            draft.resultAnnouncementVideoUri
              ? () =>
                  void updateDraft({
                    ...draft,
                    resultAnnouncementVideoUri: null,
                  })
              : openVideoGallery
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

        <AppText style={styles.tableIntroLabel}>Enter Votes Per Party</AppText>

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <AppText style={styles.tableHeaderText}>Party</AppText>
            <AppText style={styles.tableHeaderText}>Votes</AppText>
          </View>

          <Animated.View>
            {renderableParties.map((item) => (
              <PartyRow
                key={item.id}
                item={item}
                removable={!isPopularParty(item.party)}
                onChangeVotes={(value) => void updatePartyVotes(item.id, value)}
                onRemove={() => void removeParty(item.id)}
              />
            ))}
          </Animated.View>

          <AddMorePartyRow onPress={openPartyPicker} />

          <View style={styles.totalRow}>
            <AppText style={styles.totalLabel}>Total Valid Votes</AppText>
            <AppText style={styles.totalValue}>
              {totalValidVotes.toLocaleString()}
            </AppText>
          </View>
        </View>

        <View style={styles.adminCard}>
          <View style={styles.adminHeaderRow}>
            <View style={styles.adminIconCircle}>
              <Ionicons
                name="calculator-outline"
                size={18}
                color={Theme.colors.primary}
              />
            </View>
            <View style={styles.adminHeaderTextWrap}>
              <AppText style={styles.adminTitle}>
                Administrative Figures (EC8A)
              </AppText>
              <AppText style={styles.adminSubtitle}>
                Enter all four figures exactly as on the result sheet.
              </AppText>
            </View>
          </View>

          <View style={styles.adminGrid}>
          {/* Clean 2×2 grid — no dangling half-rows */}
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
              label="Rejected Ballot Papers"
              value={draft.rejectedBallots}
              onChangeText={(value) =>
                void updateDraft({
                  ...draft,
                  rejectedBallots: value.replace(/[^\d]/g, ""),
                })
              }
            />
          </View>
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
          accessibilityRole="checkbox"
          accessibilityState={{ checked: draft.confirmTruthfulness }}
        >
          <View
            style={[
              styles.checkWrap,
              draft.confirmTruthfulness && styles.checkWrapActive,
            ]}
          >
            {draft.confirmTruthfulness ? (
              <Ionicons name="checkmark" size={15} color="#FFFFFF" />
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
          disabled={loading || !canSubmitReport}
          style={styles.submitBtn}
        />

        {!canSubmitReport ? (
          <AppText style={styles.submitGateHint}>
            {submitGateReason}
          </AppText>
        ) : null}
      </ScrollView>

      <SelectPickerSheet
        ref={partyPickerRef}
        title="Select Party"
        query={partyPickerQuery}
        onChangeQuery={setPartyPickerQuery}
        selectedValue=""
        onSelectValue={(label) => void handleSelectParty(label)}
        options={availablePartyOptions}
      />
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 13,
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
    minHeight: 24,
    justifyContent: "center",
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 20,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
    marginTop: -2,
    marginBottom: 1,
  },

  offlineBanner: {
    minHeight: 50,
    backgroundColor: "#F24E1E",
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginHorizontal: -18,
    marginTop: 1,
    marginBottom: 1,
  },
  offlineIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)",
    alignItems: "center",
    justifyContent: "center",
  },
  offlineBannerText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 15,
    fontFamily: Theme.fonts.body.semibold,
  },

  section: {
    gap: 3,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  evidenceBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  uploadCard: {
    minHeight: 154,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: "#1EC6C3",
    borderStyle: "dashed",
    backgroundColor: "#E9F7F6",
    paddingHorizontal: 13,
    paddingTop: 14,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  uploadIconHalo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D7F0ED",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadLead: {
    fontSize: 13,
    lineHeight: 17,
    color: "#4A5961",
    textAlign: "center",
    maxWidth: 288,
  },
  uploadActionRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  smallActionBtn: {
    minHeight: 36,
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  smallActionBtnPrimary: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
  },
  smallActionBtnSecondary: {
    flex: 1.06,
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
    height: 154,
    borderRadius: 13,
    overflow: "hidden",
    borderWidth: 1.2,
    borderColor: "#1EC6C3",
    backgroundColor: "#E9F7F6",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  videoPreviewWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F24E1E",
    alignItems: "center",
    justifyContent: "center",
  },
  warningText: {
    fontSize: 11,
    lineHeight: 15,
    color: "#F24E1E",
  },

  tableIntroLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    marginTop: 1,
  },
  tableCard: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDE8E8",
    backgroundColor: "#FFFFFF",
  },
  tableHeader: {
    minHeight: 30,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 11,
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
    minHeight: 53,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  partyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F3",
  },
  partyInfoWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  partyTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  partyName: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  partySubName: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
  partyActionWrap: {
    width: 122,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  voteInput: {
    width: "100%",
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C8D2D6",
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 10,
    paddingVertical: 0,
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "right",
  },
  removePartyBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F24E1E",
    alignItems: "center",
    justifyContent: "center",
  },

  addMorePartyRow: {
    minHeight: 51,
  },
  addMorePartyRowPressed: {
    backgroundColor: "#F8FAFA",
  },
  addMoreLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  addMoreText: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  totalRow: {
    minHeight: 42,
    backgroundColor: "#D5EFED",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  totalValue: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  adminCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    padding: 16,
    gap: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  adminHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adminIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(5,163,156,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  adminTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  adminSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
  adminGrid: {
    gap: 14,
  },
  adminGridRow: {
    flexDirection: "row",
    gap: 17,
  },
  compactFieldWrap: {
    flex: 1,
    gap: 7,
  },
  compactFieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  compactFieldInput: {
    minHeight: 35,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C8D2D6",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 0,
    color: Theme.colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.medium,
  },

  truthRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 2,
  },
  checkWrap: {
    width: 23,
    height: 23,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  submitBtn: {
    marginTop: 5,
    marginBottom: 0,
    minHeight: 45,
    borderRadius: 12,
  },
  submitGateHint: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#C2410C",
    textAlign: "center",
    marginTop: 8,
  },

  // ── Sentiment step styles ──────────────────────────────────────────────────
  sentimentContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  sentimentHeaderWrap: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  sentimentIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(5,163,156,0.10)",
    borderWidth: 1.5,
    borderColor: "rgba(5,163,156,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sentimentHeading: {
    fontSize: 22,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  sentimentSubheading: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 280,
  },
  sentimentCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    padding: 16,
    gap: 14,
  },
  sentimentCardTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  sentimentHealthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  sentimentScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  sentimentScoreValue: {
    fontSize: 18,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  sentimentScoreLabel: {
    fontSize: 11,
    lineHeight: 13,
    color: Theme.colors.textMuted,
  },
  sentimentLegend: {
    flex: 1,
    gap: 8,
  },
  sentimentLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sentimentLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  sentimentLegendLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
  },
  sentimentLegendValue: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  sentimentStatsRow: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    overflow: "hidden",
  },
  sentimentStat: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
  },
  sentimentStatDivider: {
    width: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 12,
  },
  sentimentStatValue: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Theme.fonts.heading.bold,
  },
  sentimentStatLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
    textAlign: "center",
  },
  sentimentProgressWrap: {
    gap: 8,
  },
  sentimentProgressLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
  sentimentPartyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sentimentPartyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  sentimentPartyDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  sentimentPartyName: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  sentimentPartyPercent: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  sentimentNote: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  feedbackCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "rgba(5,163,156,0.28)",
    padding: 16,
    gap: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  feedbackHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  feedbackIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(5,163,156,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackHeaderTextWrap: {
    flex: 1,
    gap: 2,
  },
  feedbackTitle: {
    fontSize: 16,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  feedbackSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
  feedbackQuestionBlock: {
    gap: 9,
  },
  feedbackQuestion: {
    fontSize: 14,
    lineHeight: 19,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  feedbackPillRow: {
    flexDirection: "row",
    gap: 10,
  },
  feedbackPill: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#D8DDE5",
    backgroundColor: "#F8FAFB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  feedbackPillActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(5,163,156,0.10)",
  },
  feedbackPillText: {
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  feedbackPillTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  feedbackGateHint: {
    fontSize: 12.5,
    lineHeight: 17,
    color: "#C2410C",
    textAlign: "center",
    marginTop: -6,
  },
  feedbackNudge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(194,65,12,0.07)",
    borderWidth: 1,
    borderColor: "rgba(194,65,12,0.18)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  feedbackNudgeText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: "#9A3412",
    fontFamily: Theme.fonts.body.medium,
  },
  sentimentBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  sentimentBackText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
});