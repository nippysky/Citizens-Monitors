import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { useQueryClient } from "@tanstack/react-query";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import ReportingOutcomeState from "@/components/reporting/ReportingOutcomeState";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
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
  clearIncidentDraft,
  getIncidentDraft,
  IncidentDraft,
  saveIncidentDraft,
} from "@/lib/reporting";
import { Theme } from "@/theme";

type ViewState = "form" | "success";

function buildCollationRoute(electionId: string) {
  return {
    pathname: Paths.appCollation as never,
    params: {
      tab: "overview",
      collationId: electionId,
      activeElectionId: electionId,
      electionId,
    },
  };
}

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

export default function ReportIncidentLiveReviewScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { isConnected, isInternetReachable } = useNetwork();
  const { enqueue } = useOfflineSync();
  const { showToast } = useAppToast();

  const [draft, setDraft] = useState<IncidentDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("form");
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const isOffline = !isConnected || isInternetReachable === false;

  useEffect(() => {
    void getIncidentDraft().then((data) => {
      setDraft(data);
    });
  }, []);

  const liveVideoUri = draft?.liveVideoUri ?? null;

  const player = useVideoPlayer(
    liveVideoUri ? { uri: liveVideoUri } : null,
    (instance) => {
      instance.loop = true;
      instance.muted = true;
      instance.pause();
    },
  );

  const pageTitle = useMemo(() => {
    if (!draft?.electionTitle?.trim()) {
      return "Report Incident";
    }
    return draft.electionTitle;
  }, [draft?.electionTitle]);

  const updateDraft = async (next: IncidentDraft) => {
    setDraft(next);
    await saveIncidentDraft(next);
  };

  const handleBack = () => {
    if (player) {
      player.pause();
    }
    router.back();
  };

  const togglePreview = () => {
    if (!player || !liveVideoUri) return;

    if (previewPlaying) {
      player.pause();
      setPreviewPlaying(false);
      return;
    }

    player.play();
    setPreviewPlaying(true);
  };

  const invalidateReportingData = (electionId: string) => {
    void queryClient.invalidateQueries({
      queryKey: reportingQueryKeys.dashboard,
    });
    void queryClient.invalidateQueries({
      queryKey: reportingQueryKeys.electionVault,
    });
    void queryClient.invalidateQueries({
      queryKey: reportingQueryKeys.collation,
    });
    void queryClient.invalidateQueries({
      queryKey: reportingQueryKeys.electionCollation(electionId),
    });
  };

  const handleSubmit = async () => {
    if (!draft) return;

    if (!draft.liveVideoUri) {
      showToast({
        type: "error",
        message: "Recorded video is missing. Please record again.",
      });
      return;
    }

    if (!draft.incidentType?.trim()) {
      showToast({
        type: "error",
        message: "Please select an incident type first.",
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

    const queuePayload = {
      ...(draft as unknown as Record<string, unknown>),
      source: "live-recording",
    };

    setSubmitting(true);

    if (isOffline) {
      enqueue({
        type: "submit-incident-report",
        payload: queuePayload,
      });

      await clearIncidentDraft();

      showToast({
        type: "success",
        message:
          "Live incident saved offline. It will sync automatically when you're back online.",
      });

      setSubmitting(false);
      setViewState("success");

      return;
    }

    try {
      await submitIncidentReport(mapDraftToIncidentReportPayload(draft));

      await clearIncidentDraft();
      invalidateReportingData(draft.electionId);

      showToast({
        type: "success",
        message: "Live incident report submitted successfully.",
      });

      setViewState("success");
    } catch (error) {
      enqueue({
        type: "submit-incident-report",
        payload: queuePayload,
      });

      showToast({
        type: "success",
        message:
          "Live incident saved offline. It will sync automatically when connection is stable.",
      });

      setViewState("success");
      console.log("Live incident queued:", error);
    } finally {
      setSubmitting(false);
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
        onPrimaryAction={() => {
          if (draft) {
            router.replace(buildCollationRoute(draft.electionId));
          }
        }}
      />
    );
  }

  if (!draft) {
    return (
      <AppGradientScreen>
        <View style={styles.loadingWrap}>
          <AppText style={styles.loadingText}>Preparing report...</AppText>
        </View>
      </AppGradientScreen>
    );
  }

  return (
    <AppGradientScreen>
      <AppScreenLoader visible={submitting} />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: 180 + Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View
            style={[
              styles.topCreamSection,
              {
                paddingTop: Math.max(insets.top, 10),
              },
            ]}
          >
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={30}
                color={Theme.colors.text}
              />
            </Pressable>

            <AppText style={styles.pageTitle}>{pageTitle}</AppText>
          </View>

          {isOffline ? <OfflineBanner /> : null}

          <View style={styles.bodySection}>
            <View style={styles.sectionBlock}>
              <AppText style={styles.sectionTitle}>
                Report Incident happening
              </AppText>
              <AppText style={styles.sectionSubtitle}>
                Let the world know whats happening at your polling unit right
                now.
              </AppText>
            </View>

            <View style={styles.videoCard}>
              {liveVideoUri ? (
                <>
                  <VideoView
                    player={player}
                    style={styles.video}
                    nativeControls={false}
                    contentFit="cover"
                    fullscreenOptions={{ enable: false }}
                  />

                  <Pressable
                    onPress={togglePreview}
                    style={styles.videoOverlay}
                  >
                    <View style={styles.playButton}>
                      <Ionicons
                        name={previewPlaying ? "pause" : "play"}
                        size={28}
                        color="#F84C00"
                      />
                    </View>
                  </Pressable>
                </>
              ) : (
                <View style={styles.videoFallback}>
                  <Ionicons name="videocam-outline" size={26} color="#94A3B8" />
                  <AppText style={styles.videoFallbackText}>
                    Recorded video preview unavailable
                  </AppText>
                </View>
              )}
            </View>

            <View style={styles.fieldBlock}>
              <AppText style={styles.fieldLabel}>
                Describe What You Witnessed
              </AppText>

              <TextInput
                value={draft.description}
                onChangeText={(description) =>
                  void updateDraft({
                    ...draft,
                    description,
                  })
                }
                placeholder="Describe what you witnessed...."
                placeholderTextColor="#8A919C"
                multiline
                textAlignVertical="top"
                style={styles.textArea}
              />
            </View>

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
          </View>
        </ScrollView>

        <View
          style={[
            styles.footerWrap,
            {
              paddingBottom: Math.max(insets.bottom + 12, 20),
            },
          ]}
        >
          <AppButton
            title={submitting ? "Submitting..." : "Submit Live Report"}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
          />
        </View>
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topCreamSection: {
    backgroundColor: "#F7F4EA",
    paddingHorizontal: 16,
    paddingBottom: 22,
    gap: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 32,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  offlineBanner: {
    minHeight: 52,
    backgroundColor: "#F24E1E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  bodySection: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 18,
  },
  sectionBlock: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  videoCard: {
    height: 238,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#111827",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  videoFallbackText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#CBD5E1",
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  textArea: {
    minHeight: 142,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
  },
  falseReportCard: {
    borderRadius: 16,
    backgroundColor: "rgba(5,163,156,0.08)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.14)",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  falseReportIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  falseReportText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  footerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  submitButton: {
    marginVertical: 0,
  },
  loadingWrap: {
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
});
