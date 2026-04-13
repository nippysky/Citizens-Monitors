// ─── src/app/(app)/submit-report.tsx ──────────────────────────────────────────
// Full election report submission: photo/video evidence, party votes, EC8A figures.
// Offline-first: queues report for auto-sync when network returns.
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { useCollationMedia, PickedMedia } from "@/hooks/useCollationMedia";
import { useAppToast } from "@/hooks/useAppToast";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { Theme } from "@/theme";
import { getPartyLogo } from "@/svgs/app/collation/parties";

type PartyVote = {
  id: string;
  shortName: string;
  candidateName: string;
  logoKey: string;
  votes: string;
};

const initialParties: PartyVote[] = [
  { id: "apc", shortName: "APC", candidateName: "Babajide Sanwo-Olu", logoKey: "APC", votes: "0" },
  { id: "pdp", shortName: "PDP", candidateName: "Gbadebo Rhodes", logoKey: "PDP", votes: "0" },
  { id: "lp", shortName: "LP", candidateName: "Olajide Adediran", logoKey: "LP", votes: "0" },
  { id: "nnpp", shortName: "NNPP", candidateName: "", logoKey: "NNPP", votes: "0" },
];

export default function SubmitReportScreen() {
  const { showToast } = useAppToast();
  const { enqueue, isOnline } = useOfflineSync();
  const media = useCollationMedia();

  const [resultImage, setResultImage] = useState<PickedMedia | null>(null);
  const [resultVideo, setResultVideo] = useState<PickedMedia | null>(null);
  const [parties, setParties] = useState<PartyVote[]>(initialParties);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // EC8A admin figures
  const [accreditedVoters, setAccreditedVoters] = useState("");
  const [rejectedVoters, setRejectedVoters] = useState("");
  const [spoiledBallots, setSpoiledBallots] = useState("");
  const [rejectedBallots, setRejectedBallots] = useState("");
  const [usedBallots, setUsedBallots] = useState("");

  const totalVotes = useMemo(
    () => parties.reduce((sum, p) => sum + (parseInt(p.votes, 10) || 0), 0),
    [parties]
  );

  const updatePartyVotes = useCallback((id: string, votes: string) => {
    setParties((prev) => prev.map((p) => (p.id === id ? { ...p, votes } : p)));
  }, []);

  const handleTakePhoto = async () => {
    const r = await media.capturePhoto();
    if (!r.ok) { showToast({ type: "error", message: r.error }); return; }
    if (r.data) setResultImage(r.data);
  };

  const handlePickPhoto = async () => {
    const r = await media.pickImageFromGallery();
    if (!r.ok) { showToast({ type: "error", message: r.error }); return; }
    if (r.data) setResultImage(r.data);
  };

  const handleRecordVideo = async () => {
    const r = await media.captureVideo();
    if (!r.ok) { showToast({ type: "error", message: r.error }); return; }
    if (r.data) setResultVideo(r.data);
  };

  const handlePickVideo = async () => {
    const r = await media.pickVideoFromGallery();
    if (!r.ok) { showToast({ type: "error", message: r.error }); return; }
    if (r.data) setResultVideo(r.data);
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      showToast({ type: "error", message: "Please confirm that the data matches the signed result sheet." });
      return;
    }
    if (!resultImage) {
      showToast({ type: "error", message: "Please upload an image of the signed result sheet." });
      return;
    }

    setSubmitting(true);

    await enqueue({
      type: "flag-report",
      payload: {
        type: "result-submission",
        imageUri: resultImage?.uri,
        videoUri: resultVideo?.uri,
        parties: parties.map((p) => ({ id: p.id, votes: parseInt(p.votes, 10) || 0 })),
        accreditedVoters,
        rejectedVoters,
        spoiledBallots,
        rejectedBallots,
        usedBallots,
        totalVotes,
      },
    });

    setSubmitting(false);
    showToast({ type: "success", message: "Report submitted successfully." });
    router.back();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={Theme.colors.text} />
          </Pressable>
          <AppText style={styles.headerTitle}>House of Rep Election 2026</AppText>
          <View style={{ width: 22 }} />
        </View>

        {/* Offline banner */}
        {!isOnline ? (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#DC2626" />
            <AppText style={styles.offlineBannerText}>
              You are offline. Reports will auto-submit when connected.
            </AppText>
          </View>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Upload Visual Results ── */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Upload Visual Results</AppText>
            <AppText style={styles.sectionSub}>
              Kindly upload signed result sheets and/or video of cumulative result announcement.
            </AppText>
          </View>

          {/* Image */}
          <View style={styles.section}>
            <AppText style={styles.fieldLabel}>Image of the Signed Result Sheet</AppText>
            <View style={styles.uploadCard}>
              {resultImage ? (
                <View style={{ gap: 8 }}>
                  <Image source={{ uri: resultImage.uri }} style={styles.previewImg} />
                  <Pressable onPress={() => setResultImage(null)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={14} color="#F04A1D" />
                    <AppText style={styles.removeBtnText}>Remove</AppText>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="scan-outline" size={24} color={Theme.colors.textMuted} />
                  <AppText style={styles.uploadPlaceholderText}>
                    Capture all the four corners of the signed EC8A result sheet in good lighting.
                  </AppText>
                </View>
              )}
              <View style={styles.actionRow}>
                <Pressable onPress={handleTakePhoto} style={styles.primaryActionBtn}>
                  <Ionicons name="camera-outline" size={16} color="#FFF" />
                  <AppText style={styles.primaryActionText}>Take Photo</AppText>
                </Pressable>
                <Pressable onPress={handlePickPhoto} style={styles.secondaryActionBtn}>
                  <Ionicons name="images-outline" size={16} color={Theme.colors.primary} />
                  <AppText style={styles.secondaryActionText}>Upload from Gallery</AppText>
                </Pressable>
              </View>
            </View>
            <AppText style={styles.redHint}>
              The picture uploaded must be a signed result sheet for the election of your polling unit.
            </AppText>
          </View>

          {/* Video */}
          <View style={styles.section}>
            <AppText style={styles.fieldLabel}>Video of Cumulative Result Announcement</AppText>
            <View style={styles.uploadCard}>
              {resultVideo ? (
                <View style={styles.videoTag}>
                  <Ionicons name="videocam" size={16} color={Theme.colors.primary} />
                  <AppText style={{ flex: 1, fontSize: 13, color: Theme.colors.primary, fontFamily: Theme.fonts.body.medium }}>Video recorded</AppText>
                  <Pressable onPress={() => setResultVideo(null)} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={Theme.colors.textMuted} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="videocam-outline" size={24} color={Theme.colors.textMuted} />
                  <AppText style={styles.uploadPlaceholderText}>
                    Capture video of when the INEC official announced the result in good lighting.
                  </AppText>
                </View>
              )}
              <View style={styles.actionRow}>
                <Pressable onPress={handleRecordVideo} style={styles.primaryActionBtn}>
                  <Ionicons name="videocam-outline" size={16} color="#FFF" />
                  <AppText style={styles.primaryActionText}>Record Live</AppText>
                </Pressable>
                <Pressable onPress={handlePickVideo} style={styles.secondaryActionBtn}>
                  <Ionicons name="images-outline" size={16} color={Theme.colors.primary} />
                  <AppText style={styles.secondaryActionText}>Upload from Gallery</AppText>
                </Pressable>
              </View>
            </View>
            <AppText style={styles.redHint}>
              Video must contain vocal proof of date, time and place to validate the video as authentic and verifiable.
            </AppText>
          </View>

          {/* ── Manual Record Result ── */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Manual Record Result</AppText>
            <AppText style={styles.sectionSub}>
              Enter exactly what is on the result sheet. Your accuracy is your integrity.
            </AppText>
          </View>

          {/* Party table header */}
          <View style={styles.tableHeader}>
            <AppText style={styles.tableHeaderLeft}>Party</AppText>
            <AppText style={styles.tableHeaderRight}>Votes</AppText>
          </View>

          {/* Party rows */}
          {parties.map((party) => {
            const Logo = getPartyLogo(party.logoKey);
            return (
              <View key={party.id} style={styles.partyRow}>
                <View style={styles.partyLeft}>
                  <Logo width={28} height={20} />
                  <View>
                    <AppText style={styles.partyName}>{party.shortName}</AppText>
                    {party.candidateName ? (
                      <AppText style={styles.candidateName}>{party.candidateName}</AppText>
                    ) : null}
                  </View>
                </View>
                <TextInput
                  style={styles.voteInput}
                  value={party.votes}
                  onChangeText={(v) => updatePartyVotes(party.id, v.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={7}
                  selectTextOnFocus
                />
              </View>
            );
          })}

          {/* Total */}
          <View style={styles.totalRow}>
            <AppText style={styles.totalLabel}>Total Valid Votes</AppText>
            <AppText style={styles.totalValue}>{totalVotes}</AppText>
          </View>

          {/* ── Admin Figures ── */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Administrative Figures on the Result sheet (EC8A)</AppText>
          </View>

          <View style={styles.figureGrid}>
            <View style={styles.figureCol}>
              <AppInput label="Accredited Voters" value={accreditedVoters} onChangeText={setAccreditedVoters} keyboardType="number-pad" placeholder="" />
            </View>
            <View style={styles.figureCol}>
              <AppInput label="Rejected Voters" value={rejectedVoters} onChangeText={setRejectedVoters} keyboardType="number-pad" placeholder="" />
            </View>
          </View>

          <View style={styles.figureGrid}>
            <View style={styles.figureCol}>
              <AppInput label="Spoiled Ballot Papers" value={spoiledBallots} onChangeText={setSpoiledBallots} keyboardType="number-pad" placeholder="" />
            </View>
            <View style={styles.figureCol}>
              <AppInput label="Rejected Ballots" value={rejectedBallots} onChangeText={setRejectedBallots} keyboardType="number-pad" placeholder="" />
            </View>
          </View>

          <AppInput label="Used Ballot Papers" value={usedBallots} onChangeText={setUsedBallots} keyboardType="number-pad" placeholder="" />

          {/* Confirmation checkbox */}
          <Pressable
            onPress={() => setConfirmed((p) => !p)}
            style={styles.confirmRow}
          >
            <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
              {confirmed ? <Ionicons name="checkmark" size={14} color="#FFF" /> : null}
            </View>
            <AppText style={styles.confirmText}>
              I confirm this data matches the signed EC8A result sheet I have photographed. I understand that false reporting is an offence under Section 117 of the Electoral Act 2022.
            </AppText>
          </Pressable>

          {/* Submit */}
          <AppButton
            title={submitting ? "Submitting Report..." : "Submit Report"}
            onPress={handleSubmit}
            loading={submitting}
            disabled={!confirmed || !resultImage}
            style={{ marginVertical: 0 }}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
  },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, lineHeight: 22, color: Theme.colors.text, fontFamily: Theme.fonts.heading.semibold },

  offlineBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginTop: 8, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA",
  },
  offlineBannerText: { flex: 1, fontSize: 12, lineHeight: 17, color: "#DC2626" },

  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },

  section: { gap: 6 },
  sectionTitle: { fontSize: 16, lineHeight: 22, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  sectionSub: { fontSize: 13, lineHeight: 19, color: Theme.colors.textMuted },
  fieldLabel: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.medium },

  uploadCard: {
    borderWidth: 1, borderColor: "#DDE7EF", backgroundColor: "#FCFDFC", borderRadius: 18, padding: 14, gap: 14,
  },
  uploadPlaceholder: { alignItems: "center", justifyContent: "center", paddingVertical: 18, gap: 8 },
  uploadPlaceholderText: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted, textAlign: "center", maxWidth: 260 },
  previewImg: { width: "100%", height: 160, borderRadius: 14, resizeMode: "cover", backgroundColor: "#EEF2F6" },
  videoTag: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#EAFBF9", borderRadius: 12 },
  removeBtn: { alignSelf: "flex-start", minHeight: 32, borderRadius: 999, paddingHorizontal: 12, backgroundColor: "#FFF1EC", flexDirection: "row", alignItems: "center", gap: 6 },
  removeBtnText: { fontSize: 12, color: "#F04A1D", fontFamily: Theme.fonts.body.semibold },

  actionRow: { flexDirection: "row", gap: 10 },
  primaryActionBtn: {
    flex: 1, minHeight: 42, borderRadius: 14, backgroundColor: Theme.colors.primary,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  primaryActionText: { fontSize: 13, color: "#FFF", fontFamily: Theme.fonts.body.semibold },
  secondaryActionBtn: {
    flex: 1, minHeight: 42, borderRadius: 14, backgroundColor: "#EAFBF9",
    borderWidth: 1, borderColor: "rgba(5,163,156,0.18)",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  secondaryActionText: { fontSize: 13, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  redHint: { fontSize: 11, lineHeight: 16, color: "#F04A1D" },

  /* Party table */
  tableHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Theme.colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  tableHeaderLeft: { fontSize: 13, color: "#FFF", fontFamily: Theme.fonts.body.semibold },
  tableHeaderRight: { fontSize: 13, color: "#FFF", fontFamily: Theme.fonts.body.semibold },

  partyRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
  },
  partyLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  partyName: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  candidateName: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },

  voteInput: {
    width: 72, minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface, textAlign: "center", fontSize: 15,
    color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold,
  },

  totalRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#F4FFFE", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: "rgba(5,163,156,0.15)",
  },
  totalLabel: { fontSize: 14, color: Theme.colors.text, fontFamily: Theme.fonts.body.medium },
  totalValue: { fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },

  figureGrid: { flexDirection: "row", gap: 12 },
  figureCol: { flex: 1 },

  confirmRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface, alignItems: "center", justifyContent: "center", marginTop: 2,
  },
  checkboxChecked: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  confirmText: { flex: 1, fontSize: 12, lineHeight: 18, color: Theme.colors.textMuted },
});