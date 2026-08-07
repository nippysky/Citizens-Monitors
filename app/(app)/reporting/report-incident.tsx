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
  useWindowDimensions,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import { useLiveNotice } from "@/components/feedback/LiveNoticeProvider";
import RecordLiveIncidentSheet from "@/components/reporting/RecordLiveIncidentSheet";
import ReportingOutcomeState from "@/components/reporting/ReportingOutcomeState";
import TimePickerSheet from "@/components/reporting/TimePickerSheet";
import AppButton from "@/components/ui/AppButton";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { Paths } from "@/constants/paths";
import { useNetwork } from "@/context/NetworkContext";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { useAppToast } from "@/hooks/useAppToast";
import { reportingQueryKeys } from "@/hooks/api/useReportingMutations";
import {
  mapDraftToIncidentReportPayload,
  submitIncidentReport,
} from "@/lib/api/reporting.api";
import {
  abandonIncidentDraft,
  buildCommencementContext,
  buildInitialIncidentDraft,
  clearIncidentDraft,
  getIncidentDraft,
  INCIDENT_OPTIONS,
  IncidentDraft,
  saveIncidentDraft,
} from "@/lib/reporting";
import {
  ensureCameraPermission,
  ensureMediaLibraryPermission,
} from "@/lib/permissions";
import { stageMediaFile } from "@/lib/offlineMedia";
import { Theme } from "@/theme";
import ElectionNotification from "@/svgs/app/profile/ElectionNotification";
import Thuggery from "@/svgs/app/collation/Thuggery";
import UnderAge from "@/svgs/app/collation/UnderAge";
import MisConduct from "@/svgs/app/collation/MisConduct";
import ResultAlter from "@/svgs/app/collation/ResultAlter";
import VoterIntimidation from "@/svgs/app/collation/VoterIntimidation";
import LateOpening from "@/svgs/app/collation/LateOpening";
import MissingMaterial from "@/svgs/app/collation/MissingMaterial";
import Incident from "@/svgs/app/collation/Incident";

type ViewState = "form" | "success";

type EvidenceItem = {
  key: string;
  uri: string;
  type: "image" | "video";
  source: "gallery" | "live" | "camera";
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isVideoAsset(asset: ImagePicker.ImagePickerAsset) {
  const uri = asset.uri.toLowerCase();
  return (
    asset.type === "video" ||
    (asset.mimeType ?? "").startsWith("video/") ||
    uri.endsWith(".mp4") ||
    uri.endsWith(".mov") ||
    uri.endsWith(".3gp") ||
    uri.endsWith(".m4v") ||
    uri.endsWith(".webm")
  );
}

function IncidentTypeIcon({
  label,
  size,
}: {
  label: string;
  size: number;
}) {
  const glyph =
    label === "Ballot Stuffing"
      ? <ElectionNotification />
      : label === "Thuggery & Violence"
        ? <Thuggery />
        : label === "Underage Voting"
          ? <UnderAge />
          : label === "INEC Misconduct"
            ? <MisConduct />
            : label === "Result Alteration"
              ? <ResultAlter />
              : label === "Voter Intimidation"
                ? <VoterIntimidation />
                : label === "Late Opening"
                  ? <LateOpening />
                  : label === "Missing Materials"
                    ? <MissingMaterial />
                    : <Incident />;

  return (
    <AppText
      style={[
        styles.incidentTypeEmoji,
        { fontSize: size, lineHeight: size + 2 },
      ]}
    >
      {glyph}
    </AppText>
  );
}

function SmallActionButton({
  title,
  icon,
  variant = "primary",
  onPress,
  disabled = false,
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "secondary";
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.smallActionBtn,
        variant === "primary"
          ? styles.smallActionBtnPrimary
          : styles.smallActionBtnSecondary,
        disabled && styles.smallActionBtnDisabled,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={
            disabled
              ? "#94A3B8"
              : variant === "primary"
                ? "#FFFFFF"
                : Theme.colors.primary
          }
        />
      ) : null}

      <AppText
        style={[
          styles.smallActionBtnText,
          variant === "primary"
            ? styles.smallActionBtnTextPrimary
            : styles.smallActionBtnTextSecondary,
          disabled && styles.smallActionBtnTextDisabled,
        ]}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

function VideoThumb({ large = false }: { large?: boolean }) {
  return (
    <View style={[large ? styles.featuredVideoCard : styles.thumbnailVideoCard]}>
      <View style={styles.videoOverlay} />
      <View style={large ? styles.videoPlayCircle : styles.thumbnailVideoBadgeLarge}>
        <Ionicons name="play" size={large ? 22 : 12} color="#F84C00" />
      </View>

      <View style={large ? styles.videoLabelPill : styles.thumbnailVideoLabelPill}>
        <Ionicons
          name="videocam-outline"
          size={large ? 14 : 11}
          color="#FFFFFF"
        />
        <AppText style={large ? styles.videoLabelText : styles.thumbnailVideoLabelText}>
          Video
        </AppText>
      </View>
    </View>
  );
}

function EvidenceSection({
  items,
  onOpenCamera,
  onOpenGallery,
  onRemoveItem,
  busy,
}: {
  items: EvidenceItem[];
  onOpenCamera: () => void;
  onOpenGallery: () => void;
  onRemoveItem: (item: EvidenceItem) => void;
  busy: boolean;
}) {
  const featured = items[0] ?? null;
  const remaining = items.slice(1);

  return (
    <View style={styles.evidenceSectionWrap}>
      {featured ? (
        <View style={styles.featuredEvidenceCard}>
          {featured.type === "image" ? (
            <Image source={{ uri: featured.uri }} style={styles.featuredImage} />
          ) : (
            <VideoThumb large />
          )}

          <Pressable
            onPress={() => onRemoveItem(featured)}
            style={styles.featuredRemoveBtn}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : (
        <View style={styles.uploadCard}>
          <View style={styles.uploadIconWrap}>
            <Ionicons name="images-outline" size={18} color="#111827" />
          </View>

          <AppText style={styles.uploadLead}>Add Photos / Videos</AppText>
          <AppText style={styles.uploadSub}>
            Max 5 photos · Max 1 video · Max 1 live recording · Max 3 min
          </AppText>

          <View style={styles.uploadActionRow}>
            <SmallActionButton
              title={busy ? "Opening..." : "Open Camera"}
              icon="camera-outline"
              onPress={onOpenCamera}
              disabled={busy}
            />
            <SmallActionButton
              title={busy ? "Opening..." : "Upload from Gallery"}
              icon="images-outline"
              variant="secondary"
              onPress={onOpenGallery}
              disabled={busy}
            />
          </View>
        </View>
      )}

      {featured ? (
        <View style={styles.evidenceActionBar}>
          <Pressable
            onPress={onOpenCamera}
            disabled={busy}
            style={[
              styles.addMoreChipPrimary,
              busy && styles.addMoreChipDisabled,
            ]}
          >
            <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
            <AppText style={styles.addMoreChipPrimaryText}>
              {busy ? "Opening..." : "Add media"}
            </AppText>
          </Pressable>

          <Pressable
            onPress={onOpenGallery}
            disabled={busy}
            style={[
              styles.addMoreChipSecondary,
              busy && styles.addMoreChipDisabledSecondary,
            ]}
          >
            <Ionicons
              name="images-outline"
              size={14}
              color={busy ? "#94A3B8" : Theme.colors.primary}
            />
            <AppText
              style={[
                styles.addMoreChipSecondaryText,
                busy && styles.addMoreChipSecondaryTextDisabled,
              ]}
            >
              {busy ? "Opening..." : "Add from gallery"}
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {remaining.length > 0 ? (
        <View style={styles.thumbnailGrid}>
          {remaining.map((item) => (
            <View key={item.key} style={styles.thumbnailCard}>
              {item.type === "image" ? (
                <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
              ) : (
                <VideoThumb />
              )}

              <Pressable
                onPress={() => onRemoveItem(item)}
                style={styles.thumbnailRemoveBtn}
              >
                <Ionicons name="close" size={12} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function ReportIncidentScreen() {
  // Election context handed over by whichever card/banner started this flow.
  const params = useLocalSearchParams<{
    electionId?: string;
    electionTitle?: string;
    pollingUnitName?: string;
    pollingUnitCode?: string;
    ward?: string;
    lga?: string;
    state?: string;
    incidentTime?: string;
  }>();

  const queryClient = useQueryClient();
  const { isConnected, isInternetReachable } = useNetwork();
  const { enqueue } = useOfflineSync();
  const { requestLocationForAction } = useLiveNotice();
  const { showToast } = useAppToast();
  const { width } = useWindowDimensions();

  const recordLiveSheetRef = useRef<BottomSheetModal>(null);
  const pickerBusyRef = useRef(false);

  const [draft, setDraft] = useState<IncidentDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("form");
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);

  const isOffline = !isConnected || isInternetReachable === false;

  const gridMetrics = useMemo(() => {
    const sidePadding = 16;
    const gap = width <= 360 ? 8 : 10;
    const availableWidth = width - sidePadding * 2;
    const cardSize = Math.floor((availableWidth - gap * 2) / 3);

    return {
      gap,
      cardSize,
      cardHeight: clamp(cardSize, 96, 128),
      iconSize: clamp(cardSize * 0.24, 22, 28),
      textSize: cardSize <= 98 ? 10.8 : 12,
      lineHeight: cardSize <= 98 ? 14 : 16,
      horizontalPadding: cardSize <= 98 ? 6 : 8,
      bannerTitleSize: width <= 360 ? 14 : 15,
      bannerSubSize: width <= 360 ? 12 : 13,
    };
  }, [width]);

  // Route params are the authoritative election context; the stored draft is
  // the resume path. Reading BOTH means the screen still knows which election
  // it belongs to even if storage was cleared between screens, instead of
  // rendering an empty shell forever.
  useEffect(() => {
    let mounted = true;

    void getIncidentDraft().then((stored) => {
      if (!mounted) return;

      const ctx = buildCommencementContext({
        electionId: params.electionId ?? stored?.electionId,
        electionTitle: params.electionTitle ?? stored?.electionTitle,
        pollingUnitName: params.pollingUnitName ?? stored?.pollingUnitName,
        pollingUnitCode: params.pollingUnitCode ?? stored?.pollingUnitCode,
        ward: params.ward ?? stored?.ward,
        lga: params.lga ?? stored?.lga,
        state: params.state ?? stored?.state,
      });

      // Prefer the stored draft (keeps any in-progress edits), but repair its
      // election context from params when they disagree — params always
      // reflect the card the user just tapped.
      const base = stored ?? buildInitialIncidentDraft(ctx);

      const next: IncidentDraft = {
        ...base,
        electionId: ctx.electionId || base.electionId,
        electionTitle: ctx.electionTitle || base.electionTitle,
        pollingUnitName: ctx.pollingUnitName || base.pollingUnitName,
        pollingUnitCode: ctx.pollingUnitCode || base.pollingUnitCode,
        ward: ctx.ward || base.ward,
        lga: ctx.lga || base.lga,
        state: ctx.state || base.state,
        incidentTime:
          params.incidentTime?.trim() || base.incidentTime || "",
      };

      setDraft(next);
      void saveIncidentDraft(next);
    });

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
    params.incidentTime,
  ]);

  // Deliberate exit wipes the draft + its staged media (fresh screen next
  // time, no storage bloat). Pushing forward to the live recorder / review
  // keeps this screen mounted, so mid-flow data is untouched; after a
  // successful submit or offline enqueue the stored draft is already cleared,
  // making this a safe no-op.
  useEffect(() => {
    return () => {
      void abandonIncidentDraft();
    };
  }, []);

  const updateDraft = async (next: IncidentDraft) => {
    setDraft(next);
    await saveIncidentDraft(next);
  };

  const withPickerGuard = async (action: () => Promise<void>) => {
    if (pickerBusyRef.current) return;

    pickerBusyRef.current = true;
    setPickerBusy(true);

    try {
      await action();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to open media picker.";

      showToast({
        type: "error",
        message:
          "Could not open camera/gallery right now. Please try again. " + message,
      });
    } finally {
      await delay(300);
      pickerBusyRef.current = false;
      setPickerBusy(false);
    }
  };

  const buildEvidenceItems = (): EvidenceItem[] => {
    if (!draft) return [];

    const items: EvidenceItem[] = [
      ...draft.imageEvidenceUris.map((uri, index) => ({
        key: `image-${index}-${uri}`,
        uri,
        type: "image" as const,
        source: "gallery" as const,
      })),
      ...draft.videoEvidenceUris.map((uri, index) => ({
        key: `video-${index}-${uri}`,
        uri,
        type: "video" as const,
        source: "gallery" as const,
      })),
    ];

    return items;
  };

  const evidenceItems = buildEvidenceItems();

  const openCameraEvidence = async () => {
    if (!draft) return;

    await withPickerGuard(async () => {
      const allowed = await ensureCameraPermission();
      if (!allowed) return;

      await delay(180);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images", "videos"],
        quality: 0.9,
        allowsEditing: false,
        videoMaxDuration: 180,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const isVideo = isVideoAsset(asset);

      const staged = await stageMediaFile({
        sourceUri: asset.uri,
        kind: isVideo ? "video" : "image",
        mimeType: asset.mimeType ?? (isVideo ? "video/mp4" : "image/jpeg"),
      });

      if (isVideo) {
        if (draft.videoEvidenceUris.length >= 1) {
          showToast({
            type: "success",
            message: "You can attach only one camera/gallery video here.",
          });
          return;
        }

        await updateDraft({
          ...draft,
          videoEvidenceUris: [...draft.videoEvidenceUris, staged.localUri].slice(0, 1),
        });
        return;
      }

      await updateDraft({
        ...draft,
        imageEvidenceUris: [...draft.imageEvidenceUris, staged.localUri].slice(0, 5),
      });
    });
  };

  const addEvidenceFromGallery = async () => {
    if (!draft) return;

    await withPickerGuard(async () => {
      const allowed = await ensureMediaLibraryPermission();
      if (!allowed) return;

      await delay(180);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        quality: 0.85,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: 6,
      });

      if (result.canceled || !result.assets?.length) return;

      const nextImages = [...draft.imageEvidenceUris];
      const nextVideos = [...draft.videoEvidenceUris];

      for (const asset of result.assets) {
        const isVideo = isVideoAsset(asset);

        const staged = await stageMediaFile({
          sourceUri: asset.uri,
          kind: isVideo ? "video" : "image",
          mimeType: asset.mimeType ?? (isVideo ? "video/mp4" : "image/jpeg"),
        });

        if (isVideo) {
          if (nextVideos.length < 1) {
            nextVideos.push(staged.localUri);
          }
        } else if (nextImages.length < 5) {
          nextImages.push(staged.localUri);
        }
      }

      await updateDraft({
        ...draft,
        imageEvidenceUris: nextImages.slice(0, 5),
        videoEvidenceUris: nextVideos.slice(0, 1),
      });
    });
  };

  const handleOpenRecordLiveSheet = async () => {
    if (!draft) return;

    if (draft.geoLabel?.trim()) {
      recordLiveSheetRef.current?.present();
      return;
    }

    requestLocationForAction(async (geoLabel: string) => {
      await updateDraft({
        ...draft,
        geoLabel,
      });

      requestAnimationFrame(() => {
        recordLiveSheetRef.current?.present();
      });
    });
  };

  const handleStartLiveRecording = async () => {
    if (!draft) return;

    if (!draft.incidentType) {
      showToast({
        type: "error",
        message: "Please select what you are recording first.",
      });
      return;
    }

    recordLiveSheetRef.current?.dismiss();
    router.push(Paths.reportIncidentLive);
  };

  const handleRemoveEvidenceItem = async (item: EvidenceItem) => {
    if (!draft) return;

    if (item.source === "live") {
      await updateDraft({
        ...draft,
        liveVideoUri: null,
      });
      return;
    }

    if (item.type === "video") {
      await updateDraft({
        ...draft,
        videoEvidenceUris: draft.videoEvidenceUris.filter((uri) => uri !== item.uri),
      });
      return;
    }

    await updateDraft({
      ...draft,
      imageEvidenceUris: draft.imageEvidenceUris.filter((uri) => uri !== item.uri),
    });
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
    if (!draft?.electionId?.trim()) {
      showToast({
        type: "error",
        message:
          "This report isn't linked to an election. Go back and start from the election card.",
      });
      return;
    }

    if (!draft) return;

    if (!draft.incidentType) {
      showToast({
        type: "error",
        message: "Please select an incident type.",
      });
      return;
    }

    if (!draft.description.trim()) {
      showToast({
        type: "error",
        message: "Please describe what you witnessed.",
      });
      return;
    }

    const queuePayload = draft as unknown as Record<string, unknown>;

    setLoading(true);

    if (isOffline) {
      enqueue({
        type: "submit-incident-report",
        payload: queuePayload,
      });

      await clearIncidentDraft();
      setLoading(false);
      setViewState("success");

      showToast({
        type: "success",
        message:
          "Incident saved offline. It will sync automatically when you're back online.",
      });

      return;
    }

    try {
      await submitIncidentReport(mapDraftToIncidentReportPayload(draft));

      await clearIncidentDraft();
      invalidateReportingData(draft.electionId);
      setViewState("success");

      showToast({
        type: "success",
        message: "Incident report submitted successfully.",
      });
    } catch (error) {
      enqueue({
        type: "submit-incident-report",
        payload: queuePayload,
      });

      await clearIncidentDraft();
      setViewState("success");

      showToast({
        type: "success",
        message:
          "Incident saved offline. It will sync automatically when connection is stable.",
      });

      console.log("Incident report queued:", error);
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

  if (!draft) {
    return (
      <AppGradientScreen>
        <View style={styles.centerLoadingWrap}>
          <AppText style={styles.loadingText}>Preparing incident form...</AppText>
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
          <AppText style={styles.sectionTitle}>Report Incident happening</AppText>
          <AppText style={styles.sectionSubtitle}>
            Let the world know what&apos;s happening at your polling unit right now.
          </AppText>
        </View>

        <Pressable onPress={handleOpenRecordLiveSheet} style={styles.recordBanner}>
          <View style={styles.recordBannerContent}>
            <View style={styles.recordIconWrap}>
              <Ionicons name="videocam-outline" size={22} color="#1F1F1F" />
            </View>

            <View style={styles.recordBannerTextStack}>
              <AppText
                style={[
                  styles.recordTitle,
                  {
                    fontSize: gridMetrics.bannerTitleSize,
                    lineHeight: gridMetrics.bannerTitleSize + 5,
                  },
                ]}
              >
                Record Live Incident
              </AppText>
              <AppText
                style={[
                  styles.recordSubtitle,
                  {
                    fontSize: gridMetrics.bannerSubSize,
                    lineHeight: gridMetrics.bannerSubSize + 6,
                  },
                ]}
              >
                Tap to open live camera recording for this polling unit
              </AppText>
            </View>
          </View>

          <View style={styles.recordBannerChevronWrap}>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Theme.colors.textMuted}
            />
          </View>
        </Pressable>

        <View style={styles.manualDividerWrap}>
          <View style={styles.dividerLine} />
          <AppText style={styles.dividerText}>OR REPORT MANUALLY</AppText>
          <View style={styles.dividerLine} />
        </View>

        <AppText style={styles.fieldLabel}>Select Incident Type</AppText>

        <View
          style={[
            styles.incidentGrid,
            {
              rowGap: gridMetrics.gap,
              columnGap: gridMetrics.gap,
            },
          ]}
        >
          {INCIDENT_OPTIONS.map((option) => {
            const active = draft.incidentType === option;

            return (
              <Pressable
                key={option}
                onPress={() =>
                  void updateDraft({
                    ...draft,
                    incidentType: option,
                  })
                }
                style={[
                  styles.incidentTypeCard,
                  {
                    width: gridMetrics.cardSize,
                    height: gridMetrics.cardHeight,
                    paddingHorizontal: gridMetrics.horizontalPadding,
                  },
                  active && styles.incidentTypeCardActive,
                ]}
              >
                <IncidentTypeIcon label={option} size={gridMetrics.iconSize} />

                <AppText
                  style={[
                    styles.incidentTypeText,
                    {
                      fontSize: gridMetrics.textSize,
                      lineHeight: gridMetrics.lineHeight,
                    },
                    active && styles.incidentTypeTextActive,
                  ]}
                >
                  {option}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.fieldBlock}>
          <AppText style={styles.fieldLabel}>Describe What You Witnessed</AppText>

          <TextInput
            value={draft.description}
            onChangeText={(description) =>
              void updateDraft({
                ...draft,
                description,
              })
            }
            placeholder="Describe what you witnessed...."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />
        </View>

        <View style={styles.fieldBlock}>
          <AppText style={styles.fieldLabel}>Time of Incidents</AppText>

          <AppSelectField
            label=""
            value={draft.incidentTime}
            placeholder="Select time"
            onPress={() => setTimePickerVisible(true)}
            leftIcon={
              <Ionicons
                name="time-outline"
                size={17}
                color={Theme.colors.textMuted}
              />
            }
          />
        </View>

        <TimePickerSheet
          visible={timePickerVisible}
          value={draft.incidentTime}
          onClose={() => setTimePickerVisible(false)}
          onConfirm={(incidentTime: string) => {
            void updateDraft({
              ...draft,
              incidentTime,
            });
            setTimePickerVisible(false);
          }}
        />

        <View style={styles.fieldBlock}>
          <AppText style={styles.fieldLabel}>Upload Evidence</AppText>

          <EvidenceSection
            items={evidenceItems}
            onOpenCamera={openCameraEvidence}
            onOpenGallery={addEvidenceFromGallery}
            onRemoveItem={(item) => {
              void handleRemoveEvidenceItem(item);
            }}
            busy={pickerBusy}
          />
        </View>

        <AppText style={styles.warningText}>
          The photo/video must be the incident happening at your polling unit.
        </AppText>

        <View style={styles.falseReportCard}>
          <View style={styles.falseReportIconWrap}>
            <Ionicons
              name="information-circle"
              size={16}
              color={Theme.colors.primary}
            />
          </View>
          <AppText style={styles.falseReportText}>
            False reporting is an election offence under Section 117 of the
            Electoral Act 2022 and may result in prosecution.
          </AppText>
        </View>

        <AppButton
          title={loading ? "Submiting..." : "Submit Incident"}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitBtn}
        />
      </ScrollView>

      <RecordLiveIncidentSheet
        ref={recordLiveSheetRef}
        selectedIncidentType={draft.incidentType}
        onSelectIncidentType={(value) => {
          void updateDraft({
            ...draft,
            incidentType: value,
          });
        }}
        geoLabel={draft.geoLabel}
        onStartRecording={() => {
          void handleStartLiveRecording();
        }}
        onClose={() => undefined}
      />
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

  recordBanner: {
    minHeight: 132,
    borderRadius: 18,
    backgroundColor: "#F7DDD5",
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  recordBannerContent: {
    flex: 1,
    alignItems: "flex-start",
    gap: 14,
  },

  recordIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF2EE",
    alignItems: "center",
    justifyContent: "center",
  },

  recordBannerTextStack: {
    gap: 4,
    paddingRight: 4,
  },

  recordTitle: {
    color: "#F24E1E",
    fontFamily: Theme.fonts.body.semibold,
  },

  recordSubtitle: {
    color: "#313843",
  },

  recordBannerChevronWrap: {
    width: 28,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  manualDividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 2,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  dividerText: {
    fontSize: 10,
    lineHeight: 13,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  fieldLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  incidentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },

  incidentTypeCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9DEE5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },

  incidentTypeCardActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(5,163,156,0.06)",
  },

  incidentTypeEmoji: {
    textAlign: "center",
  },

  incidentTypeText: {
    color: Theme.colors.text,
    textAlign: "center",
  },

  incidentTypeTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  fieldBlock: {
    gap: 8,
  },

  textArea: {
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D7DEE8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: Theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.regular,
  },

  evidenceSectionWrap: {
    gap: 10,
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
    gap: 6,
  },

  uploadIconWrap: {
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
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  uploadSub: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  uploadActionRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 2,
  },

  smallActionBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    flexDirection: "row",
    gap: 6,
  },

  smallActionBtnPrimary: {
    backgroundColor: Theme.colors.primary,
  },

  smallActionBtnSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },

  smallActionBtnDisabled: {
    opacity: 0.7,
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

  smallActionBtnTextDisabled: {
    color: "#94A3B8",
  },

  featuredEvidenceCard: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.2,
    borderColor: "#22B8B0",
    backgroundColor: "#EAF7F6",
  },

  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  featuredVideoCard: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },

  thumbnailVideoCard: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },

  videoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.24)",
  },

  videoPlayCircle: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },

  thumbnailVideoBadgeLarge: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },

  videoLabelPill: {
    position: "absolute",
    left: 12,
    bottom: 12,
    minHeight: 28,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.72)",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  thumbnailVideoLabelPill: {
    position: "absolute",
    left: 6,
    bottom: 6,
    minHeight: 20,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.72)",
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  videoLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
  },

  thumbnailVideoLabelText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 12,
    fontFamily: Theme.fonts.body.semibold,
  },

  featuredRemoveBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F15A24",
    alignItems: "center",
    justifyContent: "center",
  },

  evidenceActionBar: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  addMoreChipPrimary: {
    minHeight: 34,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    gap: 6,
  },

  addMoreChipPrimaryText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },

  addMoreChipSecondary: {
    minHeight: 34,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    gap: 6,
  },

  addMoreChipSecondaryText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  addMoreChipDisabled: {
    opacity: 0.7,
  },

  addMoreChipDisabledSecondary: {
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },

  addMoreChipSecondaryTextDisabled: {
    color: "#94A3B8",
  },

  thumbnailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  thumbnailCard: {
    width: 86,
    height: 86,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EAF7F6",
    borderWidth: 1,
    borderColor: "#D7E6E5",
  },

  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  thumbnailRemoveBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(17,24,39,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },

  warningText: {
    fontSize: 11,
    lineHeight: 15,
    color: "#F15A24",
    marginTop: -4,
  },

  falseReportCard: {
    borderRadius: 14,
    backgroundColor: "#DDF6E8",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  falseReportIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,163,156,0.12)",
    marginTop: 1,
  },

  falseReportText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: "#426A5B",
  },

  submitBtn: {
    marginTop: 20,
    marginBottom: 100,
  },
});