import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ReportingOutcomeState from "@/components/reporting/ReportingOutcomeState";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { useNetwork } from "@/context/NetworkContext";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { Paths } from "@/constants/paths";
import {
  clearResultDraft,
  ElectionResultDraft,
  getResultDraft,
  saveResultDraft,
  calculateTotalValidVotes,
  validateElectionResult,
} from "@/lib/reporting";
import {
  ensureCameraPermission,
  ensureMediaLibraryPermission,
} from "@/lib/permissions";
import { Theme } from "@/theme";

type ViewState = "form" | "success" | "invalid";

function OfflineBanner() {
  return (
    <View style={styles.offlineBanner}>
      <AppText style={styles.offlineBannerText}>
        🚫 You are offline. Reports will auto-submit when connected.
      </AppText>
    </View>
  );
}

export default function SubmitElectionReportScreen() {
  const { isConnected, isInternetReachable } = useNetwork();
  const { enqueue } = useOfflineSync();

  const [draft, setDraft] = useState<ElectionResultDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("form");
  const [invalidReason, setInvalidReason] = useState("");

  const isOffline = !isConnected || !isInternetReachable;

  useEffect(() => {
    getResultDraft().then((data) => {
      if (data) setDraft(data);
    });
  }, []);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    await updateDraft({
      ...draft,
      signedResultImageUri: result.assets[0].uri,
    });
  };

  const takePhoto = async () => {
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
      signedResultImageUri: result.assets[0].uri,
    });
  };

  const pickVideo = async () => {
    if (!draft) return;

    const allowed = await ensureMediaLibraryPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      videoMaxDuration: 180,
      allowsEditing: false,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    await updateDraft({
      ...draft,
      resultAnnouncementVideoUri: result.assets[0].uri,
    });
  };

  const recordVideo = async () => {
    if (!draft) return;

    const allowed = await ensureCameraPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      videoMaxDuration: 180,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return;

    await updateDraft({
      ...draft,
      resultAnnouncementVideoUri: result.assets[0].uri,
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
      },
    });

    await clearResultDraft();
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
        primaryActionLabel="Submit Feedback"
        onPrimaryAction={() => router.replace(Paths.appCollation)}
      />
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

          <AppText style={styles.fieldLabel}>
            Image of the Signed Result Sheet
          </AppText>

          <View style={styles.uploadCard}>
            {draft.signedResultImageUri ? (
              <View style={styles.filledUploadState}>
                <AppText style={styles.filledFileText}>
                  Attached image ready
                </AppText>
                <AppButton
                  title="Replace photo"
                  variant="secondary"
                  onPress={pickImage}
                />
              </View>
            ) : (
              <>
                <AppText style={styles.uploadLead}>
                  Capture all the four corners of the signed EC8A result sheet
                  in good lighting.
                </AppText>

                <View style={styles.uploadActionRow}>
                  <AppButton
                    title="Take Photo"
                    onPress={takePhoto}
                    style={styles.flexBtn}
                  />
                  <AppButton
                    title="Upload from Gallery"
                    variant="secondary"
                    onPress={pickImage}
                    style={styles.flexBtn}
                  />
                </View>
              </>
            )}
          </View>

          <AppText style={styles.warningText}>
            The picture uploaded must be a signed result sheet for the election
            of your polling unit.
          </AppText>

          <AppText style={styles.fieldLabel}>
            Video of Cumulative Result Announcement
          </AppText>

          <View style={styles.uploadCard}>
            {draft.resultAnnouncementVideoUri ? (
              <View style={styles.filledUploadState}>
                <AppText style={styles.filledFileText}>
                  Attached video ready
                </AppText>
                <AppButton
                  title="Replace video"
                  variant="secondary"
                  onPress={pickVideo}
                />
              </View>
            ) : (
              <>
                <AppText style={styles.uploadLead}>
                  Capture video of when the INEC official announced the result
                  in good lighting.
                </AppText>

                <View style={styles.uploadActionRow}>
                  <AppButton
                    title="Record Live"
                    onPress={recordVideo}
                    style={styles.flexBtn}
                  />
                  <AppButton
                    title="Upload from Gallery"
                    variant="secondary"
                    onPress={pickVideo}
                    style={styles.flexBtn}
                  />
                </View>
              </>
            )}
          </View>

          <AppText style={styles.warningText}>
            Video must contain vocal proof of date, time and place to validate
            the video as authentic and verifiable.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Manual Record Result</AppText>
          <AppText style={styles.sectionSubtitle}>
            Enter exactly what is on the result sheet. Your accuracy is your
            integrity.
          </AppText>

          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <AppText style={styles.tableHeaderText}>Party</AppText>
              <AppText style={styles.tableHeaderText}>Votes</AppText>
            </View>

            {draft.votesPerParty.map((party, index) => (
              <View
                key={party.id}
                style={[
                  styles.partyRow,
                  index === draft.votesPerParty.length - 1 &&
                    styles.partyRowLast,
                ]}
              >
                <View style={styles.partyLeft}>
                  <View style={styles.partyFlag} />
                  <View>
                    <AppText style={styles.partyName}>{party.party}</AppText>
                    {party.candidate ? (
                      <AppText style={styles.partyCandidate}>
                        {party.candidate}
                      </AppText>
                    ) : null}
                  </View>
                </View>

                <View style={styles.voteInputWrap}>
                  <AppInput
                    label=""
                    placeholder="0"
                    value={String(party.votes)}
                    onChangeText={(text) => {
                      const next = [...draft.votesPerParty];
                      next[index] = {
                        ...next[index],
                        votes: text.replace(/[^\d]/g, ""),
                      };

                      void updateDraft({
                        ...draft,
                        votesPerParty: next,
                      });
                    }}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            ))}

            <View style={styles.totalRow}>
              <AppText style={styles.totalLabel}>Total Valid Votes</AppText>
              <AppText style={styles.totalValue}>{totalValidVotes}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>
            Administrative Figures on the Result sheet (EC8A)
          </AppText>

          <View style={styles.adminGrid}>
            <AppInput
              label="Accredited Voters"
              placeholder=""
              value={draft.accreditedVoters}
              onChangeText={(text) =>
                void updateDraft({
                  ...draft,
                  accreditedVoters: text.replace(/[^\d]/g, ""),
                })
              }
              keyboardType="number-pad"
            />

            <AppInput
              label="Rejected Voters"
              placeholder=""
              value={draft.rejectedVoters}
              onChangeText={(text) =>
                void updateDraft({
                  ...draft,
                  rejectedVoters: text.replace(/[^\d]/g, ""),
                })
              }
              keyboardType="number-pad"
            />

            <AppInput
              label="Spoiled Ballot Papers"
              placeholder=""
              value={draft.spoiledBallotPapers}
              onChangeText={(text) =>
                void updateDraft({
                  ...draft,
                  spoiledBallotPapers: text.replace(/[^\d]/g, ""),
                })
              }
              keyboardType="number-pad"
            />

            <AppInput
              label="Rejected Ballots"
              placeholder=""
              value={draft.rejectedBallots}
              onChangeText={(text) =>
                void updateDraft({
                  ...draft,
                  rejectedBallots: text.replace(/[^\d]/g, ""),
                })
              }
              keyboardType="number-pad"
            />

            <AppInput
              label="Used Ballot Papers"
              placeholder=""
              value={draft.usedBallotPapers}
              onChangeText={(text) =>
                void updateDraft({
                  ...draft,
                  usedBallotPapers: text.replace(/[^\d]/g, ""),
                })
              }
              keyboardType="number-pad"
            />
          </View>

          <Pressable
            onPress={() =>
              void updateDraft({
                ...draft,
                confirmTruthfulness: !draft.confirmTruthfulness,
              })
            }
            style={styles.confirmRow}
          >
            <View
              style={[
                styles.checkbox,
                draft.confirmTruthfulness && styles.checkboxActive,
              ]}
            />
            <AppText style={styles.confirmText}>
              I confirm this data matches the signed EC8A result sheet I have
              photographed. I understand that false reporting is an offence
              under Section 117 of the Electoral Act 2022.
            </AppText>
          </Pressable>
        </View>

        <AppButton
          title="Submit Report"
          onPress={handleSubmit}
          loading={loading}
          disabled={!draft.confirmTruthfulness || loading}
        />
      </ScrollView>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 18,
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
  offlineBannerText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
  section: {
    gap: 10,
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
  fieldLabel: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  uploadCard: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Theme.colors.primary,
    backgroundColor: "#EFFFFB",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 18,
    gap: 14,
  },
  uploadLead: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
  uploadActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  flexBtn: {
    flex: 1,
  },
  filledUploadState: {
    gap: 12,
    alignItems: "center",
  },
  filledFileText: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#F84C00",
  },
  tableCard: {
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: "hidden",
  },
  tableHeader: {
    minHeight: 48,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableHeaderText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
  partyRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  partyRowLast: {
    borderBottomWidth: 0,
  },
  partyLeft: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    flex: 1,
  },
  partyFlag: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#D9E2E7",
  },
  partyName: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  partyCandidate: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
  voteInputWrap: {
    width: 110,
  },
  totalRow: {
    backgroundColor: "#D8F3EF",
    minHeight: 44,
    paddingHorizontal: 12,
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
    gap: 14,
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
  },
  checkbox: {
    marginTop: 3,
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: "#FFFFFF",
  },
  checkboxActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  confirmText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  centerLoadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
});