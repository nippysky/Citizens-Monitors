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
import { Paths } from "@/constants/paths";
import { useNetwork } from "@/context/NetworkContext";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { useAppToast } from "@/hooks/useAppToast";
import { reportingQueryKeys } from "@/hooks/api/useReportingMutations";
import {
  mapDraftToElectionResultPayload,
  submitElectionResult,
} from "@/lib/api/reporting.api";
import {
  buildInitialResultDraft,
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

type ViewState = "form" | "success" | "invalid";

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
    uploadLocation: DEV_COMMENCEMENT_CONTEXT.uploadLocation ?? null,
  };
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

/**
 * Returns true when an existing stored draft belongs to the same election the
 * user just navigated in for. We use this to decide whether to resume the
 * stored draft (same election → user is continuing) or discard it (different
 * election → stored draft is stale and would render wrong data on screen).
 *
 * The bug this guards against: the result draft is single-slot in storage,
 * so without this check, tapping Submit on Senatorial after previously
 * starting Presidential would render the Presidential title/data because the
 * stored Presidential draft would short-circuit fresh hydration.
 */
function draftMatchesContext(
  stored: ElectionResultDraft | null,
  ctx: CommencementContext
): boolean {
  if (!stored) return false;

  const storedElectionId = stored.electionId?.trim() ?? "";
  const ctxElectionId = ctx.electionId?.trim() ?? "";

  if (!storedElectionId || !ctxElectionId) return false;

  return storedElectionId === ctxElectionId;
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
  const [feedback] = useState<FeedbackState>(initialFeedbackState);

  const partyPickerRef = useRef<BottomSheetModal>(null);
  const [partyPickerQuery, setPartyPickerQuery] = useState("");

  const isOffline = !isConnected || isInternetReachable === false;

  useEffect(() => {
    let mounted = true;

    const hydrateDraft = async () => {
      const ctx = resolveCommencementContext({
        electionId: params.electionId,
        electionTitle: params.electionTitle,
        pollingUnitName: params.pollingUnitName,
        pollingUnitCode: params.pollingUnitCode,
        ward: params.ward,
        lga: params.lga,
        state: params.state,
      });

      const freshDraft = () =>
        buildInitialResultDraft(ctx, params.votingStartTime?.trim() || "");

      try {
        const stored = await getResultDraft();
        if (!mounted) return;

        // Resume the stored draft ONLY if it belongs to the election the
        // user just tapped. Otherwise discard it and build a fresh draft
        // from the new election's params — this is the fix that prevents
        // stale election data from leaking across submit attempts.
        const canResumeStored = draftMatchesContext(stored, ctx);

        const base = canResumeStored && stored ? stored : freshDraft();

        const normalized = normalizePartyList(base);
        setDraft(normalized);

        // Persist whenever:
        //  - we just built a fresh draft (replacing stale storage), or
        //  - normalization changed the resumed draft's shape.
        if (!canResumeStored || normalized !== base) {
          await saveResultDraft(normalized);
        }
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

  const handleSubmit = async () => {
    if (!draft) return;

    const validation = validateElectionResult(draft);

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

    setLoading(true);

    if (isOffline) {
      enqueue({
        type: "submit-election-report",
        payload: queuePayload,
      });

      await clearResultDraft();
      setLoading(false);
      setViewState("success");

      showToast({
        type: "success",
        message:
          "Report saved offline. It will sync automatically when you're back online.",
      });

      return;
    }

    try {
      await submitElectionResult(
        mapDraftToElectionResultPayload({
          draft,
          feedback,
        })
      );

      await clearResultDraft();
      invalidateReportingData(draft.electionId);
      setViewState("success");

      showToast({
        type: "success",
        message: "Report submitted successfully.",
      });
    } catch (error) {
      enqueue({
        type: "submit-election-report",
        payload: queuePayload,
      });

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

  if (viewState === "success") {
    return (
      <ReportingOutcomeState
        variant="success"
        showConfetti
        title="Report Submitted"
        subtitle="Your participation today makes a difference. Thank You. Nigerians are seeing it now."
        primaryActionLabel="Go To Collation"
        onPrimaryAction={() => router.replace(Paths.appCollation)}
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

        <View style={styles.section}>
          <AppText style={styles.adminTitle}>
            Administrative Figures on the Result sheet{"\n"}(EC8A)
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
          disabled={loading}
          style={styles.submitBtn}
        />
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

  adminTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  adminGrid: {
    gap: 12,
  },
  adminGridRow: {
    flexDirection: "row",
    gap: 17,
  },
  halfField: {
    flex: 1,
  },
  halfFieldPlaceholder: {
    flex: 1,
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
});