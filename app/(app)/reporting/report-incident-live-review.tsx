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

import AppGradientScreen from "@/components/app/AppGradientScreen";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import ReportingOutcomeState from "@/components/reporting/ReportingOutcomeState";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { useNetwork } from "@/context/NetworkContext";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { useAppToast } from "@/hooks/useAppToast";
import {
  clearIncidentDraft,
  getIncidentDraft,
  IncidentDraft,
  saveIncidentDraft,
} from "@/lib/reporting";
import { Theme } from "@/theme";

type ViewState = "form" | "success";

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
  const { isConnected, isInternetReachable } = useNetwork();
  const { enqueue } = useOfflineSync();
  const { showToast } = useAppToast();

  const [draft, setDraft] = useState<IncidentDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("form");
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const isOffline = !isConnected || !isInternetReachable;

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
    }
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

    setSubmitting(true);

    try {
      enqueue({
        type: "submit-incident-report",
        payload: {
          ...(draft as unknown as Record<string, unknown>),
          source: "live-recording",
        },
      });

      await clearIncidentDraft();

      showToast({
        type: "success",
        message: isOffline
          ? "Live incident saved offline. It will sync automatically when you're back online."
          : "Live incident report submitted successfully.",
      });

      setViewState("success");
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
        onPrimaryAction={() => router.replace(Paths.appCollation)}
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
                Let the world know whats happening at your polling unit right now.
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
                  <Ionicons
                    name="videocam-outline"
                    size={26}
                    color="#94A3B8"
                  />
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
              paddingBottom: Math.max(insets.bottom, 14),
            },
          ]}
        >
          <View style={styles.footerDivider} />

          <View style={styles.footerInner}>
            <AppButton
              title={submitting ? "Submitting..." : "Submit Incident"}
              onPress={handleSubmit}
              disabled={submitting}
              loading={submitting}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    fontFamily: Theme.fonts.body.medium,
  },

  scrollContent: {
    backgroundColor: "#FFFFFF",
  },

  topCreamSection: {
    backgroundColor: "#F8F4E6",
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 14,
  },

  pageTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
    maxWidth: "92%",
  },

  offlineBanner: {
    minHeight: 52,
    backgroundColor: "#F84C00",
    paddingHorizontal: 16,
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
    borderColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },

  offlineBannerText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 11.8,
    lineHeight: 15.5,
    fontFamily: Theme.fonts.body.semibold,
  },

  bodySection: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 18,
  },

  sectionBlock: {
    gap: 4,
  },

  sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#111827",
    fontFamily: Theme.fonts.body.semibold,
  },

  sectionSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#5F6773",
    fontFamily: Theme.fonts.body.regular,
    maxWidth: "92%",
  },

  videoCard: {
    height: 184,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#DCE7E7",
    borderWidth: 1,
    borderColor: "#D8E3E2",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.08)",
  },

  playButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },

  videoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#EAF1F1",
  },

  videoFallbackText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
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
    minHeight: 134,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#C8D2DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: Theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.regular,
  },

  falseReportCard: {
    borderRadius: 18,
    backgroundColor: "#CFEFDE",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  falseReportIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,163,156,0.16)",
    marginTop: 1,
    flexShrink: 0,
  },

  falseReportText: {
    flex: 1,
    fontSize: 12.8,
    lineHeight: 18.5,
    color: "#426A5B",
    fontFamily: Theme.fonts.body.medium,
    paddingTop: 2,
  },

  footerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
  },

  footerDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  footerInner: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },

  submitBtn: {
    minHeight: 56,
    borderRadius: 18,
    marginTop: 50,
  },
});