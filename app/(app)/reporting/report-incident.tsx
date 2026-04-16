import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ReportingOutcomeState from "@/components/reporting/ReportingOutcomeState";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import TimePickerSheet from "@/components/reporting/TimePickerSheet";
import { useLiveNotice } from "@/components/feedback/LiveNoticeProvider";
import { useNetwork } from "@/context/NetworkContext";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { Paths } from "@/constants/paths";
import {
  INCIDENT_OPTIONS,
  IncidentDraft,
  clearIncidentDraft,
  getIncidentDraft,
  saveIncidentDraft,
} from "@/lib/reporting";
import {
  ensureCameraPermission,
  ensureLocationPermission,
  ensureMediaLibraryPermission,
} from "@/lib/permissions";
import { Theme } from "@/theme";

type ViewState = "form" | "success";

export default function ReportIncidentScreen() {
  const { isConnected, isInternetReachable } = useNetwork();
  const { enqueue } = useOfflineSync();
  const { requestLocationForAction } = useLiveNotice();

  const timeSheetRef = useRef<BottomSheetModal>(null);

  const [draft, setDraft] = useState<IncidentDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("form");

  const isOffline = !isConnected || !isInternetReachable;

  useEffect(() => {
    getIncidentDraft().then((data) => {
      if (data) setDraft(data);
    });
  }, []);

  const updateDraft = async (next: IncidentDraft) => {
    setDraft(next);
    await saveIncidentDraft(next);
  };

  const addImageEvidence = async () => {
    if (!draft) return;

    const allowed = await ensureMediaLibraryPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      selectionLimit: 5,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return;

    await updateDraft({
      ...draft,
      imageEvidenceUris: [
        ...draft.imageEvidenceUris,
        ...result.assets.map((asset) => asset.uri),
      ].slice(0, 5),
    });
  };

  const openCameraEvidence = async () => {
    if (!draft) return;

    const allowed = await ensureCameraPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return;

    await updateDraft({
      ...draft,
      imageEvidenceUris: [
        ...draft.imageEvidenceUris,
        result.assets[0].uri,
      ].slice(0, 5),
    });
  };

  const addVideoEvidence = async () => {
    if (!draft) return;

    const allowed = await ensureMediaLibraryPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      videoMaxDuration: 180,
      selectionLimit: 1,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return;

    await updateDraft({
      ...draft,
      videoEvidenceUris: [result.assets[0].uri],
    });
  };

  const handleRecordLive = async () => {
    if (!draft) return;

    const allowed = await ensureLocationPermission();
    if (!allowed) return;

    requestLocationForAction(async (geoLabel) => {
      await updateDraft({
        ...draft,
        geoLabel,
      });

      router.push(Paths.reportIncidentLive);
    });
  };

  const handleSubmit = async () => {
    if (!draft) return;

    setLoading(true);

    enqueue({
      type: "submit-incident-report",
      payload: draft,
    });

    await clearIncidentDraft();
    setLoading(false);
    setViewState("success");
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
        <View style={styles.centerWrap}>
          <AppText style={styles.centerText}>Preparing incident form...</AppText>
        </View>
      </AppGradientScreen>
    );
  }

  return (
    <>
      <AppGradientScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.headerRow}>
            <BackButton label="" />
          </View>

          <AppText style={styles.pageTitle}>{draft.electionTitle}</AppText>

          {isOffline ? (
            <View style={styles.offlineBanner}>
              <AppText style={styles.offlineText}>
                🚫 You are offline. Reports will auto-submit when connected.
              </AppText>
            </View>
          ) : null}

          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Report Incident happening</AppText>
            <AppText style={styles.sectionSubtitle}>
              Let the world know whats happening at your polling unit right now.
            </AppText>
          </View>

          <Pressable onPress={handleRecordLive} style={styles.recordBanner}>
            <View style={styles.recordBannerLeft}>
              <AppText style={styles.recordEmoji}>🎥</AppText>

              <View style={styles.recordTextWrap}>
                <AppText style={styles.recordTitle}>Record Live Incident</AppText>
                <AppText style={styles.recordSubtitle}>
                  Tap to start recording now at your polling unit
                </AppText>
              </View>
            </View>

            <AppText style={styles.recordArrow}>›</AppText>
          </Pressable>

          <View style={styles.manualDividerWrap}>
            <View style={styles.dividerLine} />
            <AppText style={styles.dividerText}>OR REPORT MANUALLY</AppText>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.section}>
            <AppText style={styles.fieldLabel}>Select Incident Type</AppText>

            <View style={styles.incidentGrid}>
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
                      active && styles.incidentTypeCardActive,
                    ]}
                  >
                    <AppText style={styles.incidentTypeEmoji}>⚠️</AppText>
                    <AppText
                      style={[
                        styles.incidentTypeText,
                        active && styles.incidentTypeTextActive,
                      ]}
                    >
                      {option}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <AppText style={styles.fieldLabel}>Describe What You Witnessed</AppText>
            <AppInput
              label=""
              placeholder="Describe what you witnessed....."
              value={draft.description}
              onChangeText={(description) =>
                void updateDraft({
                  ...draft,
                  description,
                })
              }
            />
          </View>

          <View style={styles.section}>
            <AppText style={styles.fieldLabel}>Time of Incidents</AppText>
            <AppSelectField
              label=""
              value={draft.incidentTime}
              placeholder="Select time"
              onPress={() => timeSheetRef.current?.present()}
              leftIcon={<AppText style={styles.clockEmoji}>⏰</AppText>}
            />
          </View>

          <View style={styles.section}>
            <AppText style={styles.fieldLabel}>Upload Evidence</AppText>

            <View style={styles.uploadCard}>
              <AppText style={styles.uploadLead}>
                Add Photos / Video{"\n"}Max 5 photos · Max 3 min video · Max 200MB
              </AppText>

              <View style={styles.uploadActionsRow}>
                <AppButton
                  title="Open Camera"
                  onPress={openCameraEvidence}
                  style={styles.flexBtn}
                />
                <AppButton
                  title="Upload from Gallery"
                  variant="secondary"
                  onPress={addImageEvidence}
                  style={styles.flexBtn}
                />
              </View>

              <AppButton
                title="Upload video"
                variant="secondary"
                onPress={addVideoEvidence}
              />
            </View>

            <AppText style={styles.warningText}>
              The picture/video must be incident happening at your polling unit.
            </AppText>
          </View>

          <View style={styles.falseCard}>
            <AppText style={styles.falseText}>
              ℹ️ False reporting is an election offence under Section 117 of
              the Electoral Act 2022 and may result in prosecution.
            </AppText>
          </View>

          <AppButton
            title="Submit Incident"
            onPress={handleSubmit}
            loading={loading}
            disabled={!draft.incidentType || !draft.description || loading}
          />
        </ScrollView>
      </AppGradientScreen>

      <TimePickerSheet
        ref={timeSheetRef}
        selectedValue={draft.incidentTime}
        onSelect={(incidentTime) =>
          void updateDraft({
            ...draft,
            incidentTime,
          })
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  headerRow: {
    paddingTop: 8,
  },
  pageTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },
  offlineBanner: {
    backgroundColor: "#F84C00",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  offlineText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
  recordBanner: {
    borderRadius: 16,
    backgroundColor: "#FBE7E2",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  recordBannerLeft: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
  },
  recordEmoji: {
    fontSize: 22,
    lineHeight: 24,
  },
  recordTextWrap: {
    flex: 1,
    gap: 3,
  },
  recordTitle: {
    fontSize: 16,
    lineHeight: 21,
    color: "#F84C00",
    fontFamily: Theme.fonts.body.semibold,
  },
  recordSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  recordArrow: {
    fontSize: 22,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },
  manualDividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  dividerText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  fieldLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  incidentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  incidentTypeCard: {
    width: "30.8%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 92,
  },
  incidentTypeCardActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(5,163,156,0.06)",
  },
  incidentTypeEmoji: {
    fontSize: 24,
    lineHeight: 24,
  },
  incidentTypeText: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  incidentTypeTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  clockEmoji: {
    fontSize: 18,
    lineHeight: 18,
  },
  uploadCard: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Theme.colors.primary,
    borderRadius: 16,
    backgroundColor: "#EFFFFB",
    padding: 14,
    gap: 12,
  },
  uploadLead: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
  uploadActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  flexBtn: {
    flex: 1,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#F84C00",
  },
  falseCard: {
    borderRadius: 14,
    backgroundColor: "#DDF6E8",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  falseText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
});