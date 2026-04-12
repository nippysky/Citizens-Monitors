// ─── src/components/collation/SeeEvidenceBottomSheet.tsx ──────────────────────
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import CollationVideoPlayer from "@/components/collation/CollationVideoPlayer";
import { Theme } from "@/theme";

export type EvidencePayload = {
  title: string;
  imageUri?: string;
  videoUri?: string;
  note?: string;
  accreditedVoter?: string;
  rejectedVotes?: string;
  spoiledBallots?: string;
  usedBallots?: string;
  unusedBallots?: string;
  locationMeta?: string;
  pollingUnitName?: string;
  pollingUnitCode?: string;
  observerName?: string;
  observerHandle?: string;
  submittedAt?: string;
  verificationStatus?: "verified" | "pending";
  sourceType?: "observer-upload" | "community-report";
  electionName?: string;
};

type Props = { evidence: EvidencePayload | null };

const DEMO_IMG = "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80";
const DEMO_VID = "https://www.w3schools.com/html/mov_bbb.mp4";

const SeeEvidenceBottomSheet = forwardRef<BottomSheetModal, Props>(
  function SeeEvidenceBottomSheet({ evidence }, ref) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["90%"], []);
    const [imgLoading, setImgLoading] = useState(true);
    const [imgFailed, setImgFailed] = useState(false);

    if (!evidence) return null;

    const imageUri = evidence.imageUri ?? DEMO_IMG;
    const videoUri = evidence.videoUri ?? DEMO_VID;
    const status = evidence.verificationStatus ?? "verified";
    const source = evidence.sourceType ?? "observer-upload";

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) ref.current.dismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        topInset={insets.top + 12}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={(p) => (
          <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.32} pressBehavior="close" />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.bg}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 22 }]}
        >
          {/* header */}
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>See Evidence</AppText>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>
          <View style={styles.divider} />

          {/* hero card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroLeft}>
                <View style={styles.heroIcon}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={Theme.colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <AppText style={styles.heroTitle}>Verified Election Evidence</AppText>
                  <AppText style={styles.heroSub}>Submitted from polling unit evidence flow and stored with report metadata.</AppText>
                </View>
              </View>
              <View style={[styles.vPill, status === "verified" ? styles.vPillOk : styles.vPillPend]}>
                <Ionicons name={status === "verified" ? "checkmark-circle" : "time-outline"} size={14} color={status === "verified" ? Theme.colors.primary : "#B45309"} />
                <AppText style={[styles.vPillText, { color: status === "verified" ? Theme.colors.primary : "#B45309" }]}>
                  {status === "verified" ? "Verified" : "Pending"}
                </AppText>
              </View>
            </View>

            <AppText style={styles.evidenceTitle}>{evidence.title}</AppText>

            <View style={styles.metaGrid}>
              <MetaCell icon="calendar-outline" label="Submitted" value={evidence.submittedAt ?? "15 Mar 2027 · 08:42 AM WAT"} />
              <MetaCell icon="location-outline" label="Polling Unit" value={evidence.pollingUnitName ?? "Ikotun Primary School"} />
              <MetaCell icon="qr-code-outline" label="Unit Code" value={evidence.pollingUnitCode ?? "PU LA/12/35"} />
              <MetaCell icon="person-outline" label="Observer" value={evidence.observerHandle ?? "@IronEagle23"} />
            </View>

            <View style={styles.srcPill}>
              <Ionicons name="document-text-outline" size={14} color={Theme.colors.primary} />
              <AppText style={styles.srcPillText}>
                {source === "observer-upload" ? "Observer submitted evidence" : "Community submitted report"}
              </AppText>
            </View>
          </View>

          {/* image section */}
          <View style={styles.section}>
            <View style={styles.secHeaderRow}>
              <AppText style={styles.secTitle}>Image of the Signed Result Sheet</AppText>
              <Badge icon="image-outline" text="Image" />
            </View>
            <View style={styles.mediaCard}>
              {!imgFailed ? (
                <ImageBackground
                  source={{ uri: imageUri }}
                  style={styles.img}
                  imageStyle={{ resizeMode: "cover" }}
                  onLoadStart={() => { setImgLoading(true); setImgFailed(false); }}
                  onLoadEnd={() => setImgLoading(false)}
                  onError={() => { setImgLoading(false); setImgFailed(true); }}
                >
                  {imgLoading ? (
                    <View style={styles.imgOverlay}>
                      <ActivityIndicator color={Theme.colors.primary} />
                      <AppText style={styles.imgOverlayText}>Loading evidence image...</AppText>
                    </View>
                  ) : null}
                </ImageBackground>
              ) : (
                <View style={styles.imgFallback}>
                  <Ionicons name="image-outline" size={24} color={Theme.colors.textMuted} />
                  <AppText style={styles.imgFallbackTitle}>Evidence image unavailable</AppText>
                </View>
              )}
            </View>
            <InfoStrip icon="information-circle-outline" text="The uploaded picture must show a signed polling unit result sheet clearly enough for public review and verification." />
          </View>

          {/* video section */}
          <View style={styles.section}>
            <View style={styles.secHeaderRow}>
              <AppText style={styles.secTitle}>Video of Cumulative Result Announcement</AppText>
              <Badge icon="videocam-outline" text="Video" />
            </View>
            <View style={styles.mediaCard}>
              <CollationVideoPlayer uri={videoUri} title="Cumulative result announcement" subtitle="Tap to load the verified video evidence" posterMode />
            </View>
            <InfoStrip icon="mic-outline" text="Video evidence should include voice proof of place and context so the announcement remains authentic and verifiable." />
          </View>

          {/* note */}
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Theme.colors.primary} />
              <AppText style={styles.noteTitle}>Observer Note</AppText>
            </View>
            <AppText style={styles.noteBody}>
              {evidence.note ?? "Result sheet was captured immediately after collation at the polling unit. The announcement video was recorded after party agents and officials confirmed the figures on site."}
            </AppText>
          </View>

          {/* stats */}
          <View style={styles.section}>
            <AppText style={styles.secTitle}>Administrative Figures from EC8A Sheet</AppText>
            <AppText style={styles.secSub}>These figures were extracted from the polling unit result evidence submitted for this election report.</AppText>
            <View style={styles.statsGrid}>
              <StatCell label="Accredited Voter" value={evidence.accreditedVoter ?? "675,435"} />
              <StatCell label="Rejected Votes" value={evidence.rejectedVotes ?? "657"} />
              <StatCell label="Spoiled Ballot Papers" value={evidence.spoiledBallots ?? "320"} />
              <StatCell label="Used Ballot Papers" value={evidence.usedBallots ?? "601"} />
              <StatCell label="Unused Ballot Papers" value={evidence.unusedBallots ?? "87"} />
            </View>
          </View>

          {/* verified metadata */}
          <View style={styles.vmCard}>
            <View style={styles.vmHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                <Ionicons name="navigate-outline" size={16} color={Theme.colors.primary} />
                <AppText style={styles.vmTitle}>Verified Submission Metadata</AppText>
              </View>
              <View style={styles.gpsTag}>
                <AppText style={styles.gpsTagText}>GPS Tagged</AppText>
              </View>
            </View>
            <View style={styles.vmBody}>
              <VmRow label="Election" value={evidence.electionName ?? "Alimosho Local Government Election 2026"} />
              <VmRow label="Submitted By" value={evidence.observerHandle ?? "@IronEagle23"} />
              <VmRow label="Submitted At" value={evidence.submittedAt ?? "15 Mar 2027 · 08:42 AM WAT"} />
              <VmRow label="Geo Address" value={evidence.locationMeta ?? "No 20 Ao, Alimosho, Lagos State, Nigeria"} />
            </View>
            <View style={styles.legalRow}>
              <Ionicons name="document-lock-outline" size={14} color={Theme.colors.primary} />
              <AppText style={styles.legalText}>Evidence metadata is stored with timestamp and verified location context for transparency and audit review.</AppText>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default SeeEvidenceBottomSheet;

/* ─── helpers ─── */

function MetaCell({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Ionicons name={icon} size={13} color={Theme.colors.textMuted} />
        <AppText style={{ fontSize: 11, color: Theme.colors.textMuted }}>{label}</AppText>
      </View>
      <AppText style={{ fontSize: 13, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold }}>{value}</AppText>
    </View>
  );
}

function Badge({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={14} color={Theme.colors.primary} />
      <AppText style={styles.badgeText}>{text}</AppText>
    </View>
  );
}

function InfoStrip({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoStrip}>
      <Ionicons name={icon} size={14} color="#B45309" />
      <AppText style={styles.infoText}>{text}</AppText>
    </View>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <AppText style={{ fontSize: 11, color: Theme.colors.textMuted }}>{label}</AppText>
      <AppText style={{ fontSize: 26, lineHeight: 26, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold }}>{value}</AppText>
    </View>
  );
}

function VmRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 4 }}>
      <AppText style={{ fontSize: 11, color: Theme.colors.textMuted }}>{label}</AppText>
      <AppText style={{ fontSize: 13, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold }}>{value}</AppText>
    </View>
  );
}

/* ─── styles ─── */

const styles = StyleSheet.create({
  bg: { backgroundColor: Theme.colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  handle: { backgroundColor: "rgba(17,26,50,0.12)", width: 44 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 18 },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 18, lineHeight: 24, fontFamily: Theme.fonts.heading.semibold, color: Theme.colors.text },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.74)", alignItems: "center", justifyContent: "center" },
  divider: { height: 1, backgroundColor: "#DFE4EB", marginHorizontal: -16 },

  heroCard: { borderRadius: 20, backgroundColor: "#F4FBFA", borderWidth: 1, borderColor: "rgba(5,163,156,0.14)", padding: 14, gap: 14 },
  heroTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  heroLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  heroIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EAFBF9", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  heroTitle: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  heroSub: { fontSize: 12, lineHeight: 17, color: Theme.colors.textMuted },
  vPill: { minHeight: 28, borderRadius: 999, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  vPillOk: { backgroundColor: "#EAFBF9" },
  vPillPend: { backgroundColor: "#FFF7E7" },
  vPillText: { fontSize: 12, lineHeight: 16, fontFamily: Theme.fonts.body.semibold },
  evidenceTitle: { fontSize: 22, lineHeight: 25, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },

  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaCell: { width: "47%", borderRadius: 14, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, padding: 10, gap: 6 },

  srcPill: { alignSelf: "flex-start", minHeight: 30, borderRadius: 999, paddingHorizontal: 12, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, flexDirection: "row", alignItems: "center", gap: 6 },
  srcPillText: { fontSize: 12, lineHeight: 16, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },

  section: { gap: 10 },
  secHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  secTitle: { flex: 1, fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  secSub: { fontSize: 12, lineHeight: 17, color: Theme.colors.textMuted },

  badge: { minHeight: 26, borderRadius: 999, paddingHorizontal: 10, backgroundColor: "#EAFBF9", flexDirection: "row", alignItems: "center", gap: 6 },
  badgeText: { fontSize: 12, lineHeight: 16, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },

  mediaCard: { borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: "#F8FAFC" },
  img: { width: "100%", height: 240, backgroundColor: "#EEF2F6", justifyContent: "center", alignItems: "center" },
  imgOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(248,250,252,0.82)", alignItems: "center", justifyContent: "center", gap: 10 },
  imgOverlayText: { fontSize: 13, color: Theme.colors.textMuted, fontFamily: Theme.fonts.body.medium },
  imgFallback: { height: 200, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#F8FAFC" },
  imgFallbackTitle: { fontSize: 14, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold, textAlign: "center" },

  infoStrip: { borderRadius: 14, backgroundColor: "#FFF8EC", borderWidth: 1, borderColor: "#F6E1B7", paddingHorizontal: 10, paddingVertical: 10, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  infoText: { flex: 1, fontSize: 11, lineHeight: 16, color: "#9A6700" },

  noteCard: { borderRadius: 18, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, padding: 14, gap: 10 },
  noteHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  noteTitle: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  noteBody: { fontSize: 13, lineHeight: 20, color: Theme.colors.text },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCell: { width: "47%", minHeight: 88, borderRadius: 16, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, paddingHorizontal: 12, paddingVertical: 12, justifyContent: "space-between" },

  vmCard: { borderRadius: 20, backgroundColor: "#DFF7EB", padding: 14, gap: 12 },
  vmHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  vmTitle: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  gpsTag: { minHeight: 26, borderRadius: 999, paddingHorizontal: 10, backgroundColor: "rgba(255,255,255,0.72)", alignItems: "center", justifyContent: "center" },
  gpsTagText: { fontSize: 12, lineHeight: 16, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  vmBody: { borderRadius: 16, backgroundColor: "rgba(255,255,255,0.72)", padding: 12, gap: 10 },
  legalRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  legalText: { flex: 1, fontSize: 11, lineHeight: 16, color: Theme.colors.text },
});