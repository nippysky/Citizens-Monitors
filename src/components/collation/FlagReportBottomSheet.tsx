// ─── src/components/collation/FlagReportBottomSheet.tsx ───────────────────────
// Offline-first: flag reports queue locally, sync when network returns.
// Auto-resolves location after photo capture/selection.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { PickedMedia, ResolvedLocation, useCollationMedia } from "@/hooks/useCollationMedia";
import { useAppToast } from "@/hooks/useAppToast";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { Theme } from "@/theme";

type Props = { onSubmitted?: () => void };

const FlagReportBottomSheet = forwardRef<BottomSheetModal, Props>(
  function FlagReportBottomSheet({ onSubmitted }, ref) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();
    const { enqueue } = useOfflineSync();
    const media = useCollationMedia();

    const [reason, setReason] = useState("");
    const [img, setImg] = useState<PickedMedia | null>(null);
    const [vid, setVid] = useState<PickedMedia | null>(null);
    const [loc, setLoc] = useState<ResolvedLocation | null>(null);
    const [locBusy, setLocBusy] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const snaps = useMemo(() => ["92%"], []);
    const canSubmit = reason.trim().length > 8 && !!loc && !!img;

    const close = () => { if (ref && typeof ref !== "function" && ref.current) ref.current.dismiss(); };
    const reset = () => { setReason(""); setImg(null); setVid(null); setLoc(null); setLocBusy(false); setSubmitting(false); };

    const doLocation = async () => {
      setLocBusy(true);
      const r = await media.resolveCurrentLocation();
      setLocBusy(false);
      if (!r.ok) { showToast({ type: "error", message: r.error }); return; }
      if (r.data) { setLoc(r.data); showToast({ type: "success", message: "Location confirmed." }); }
    };

    const doTakePhoto = async () => {
      const r = await media.capturePhoto();
      if (!r.ok) { showToast({ type: "error", message: r.error }); return; }
      if (r.data) { setImg(r.data); showToast({ type: "success", message: "Image added." }); if (!loc) doLocation(); }
    };

    const doPickPhoto = async () => {
      const r = await media.pickImageFromGallery();
      if (!r.ok) { showToast({ type: "error", message: r.error }); return; }
      if (r.data) { setImg(r.data); showToast({ type: "success", message: "Image selected." }); if (!loc) doLocation(); }
    };

    const doRecordVideo = async () => {
      const r = await media.captureVideo();
      if (!r.ok) { showToast({ type: "error", message: r.error }); return; }
      if (r.data) { setVid(r.data); showToast({ type: "success", message: "Video added." }); }
    };

    const doPickVideo = async () => {
      const r = await media.pickVideoFromGallery();
      if (!r.ok) { showToast({ type: "error", message: r.error }); return; }
      if (r.data) { setVid(r.data); showToast({ type: "success", message: "Video selected." }); }
    };

    const submit = async () => {
      if (!canSubmit) { showToast({ type: "error", message: "Complete all required fields." }); return; }
      setSubmitting(true);
      // Offline-first: queue immediately
      await enqueue({
        type: "flag-report",
        payload: {
          reason: reason.trim(),
          imageUri: img?.uri,
          videoUri: vid?.uri,
          latitude: loc?.latitude,
          longitude: loc?.longitude,
          addressLabel: loc?.addressLabel,
        },
      });
      setSubmitting(false);
      showToast({ type: "success", message: "Flag report submitted." });
      reset();
      onSubmitted?.();
      close();
    };

    return (
      <BottomSheetModal
        ref={ref} snapPoints={snaps} enablePanDownToClose topInset={insets.top + 12}
        keyboardBehavior="interactive" keyboardBlurBehavior="restore" android_keyboardInputMode="adjustResize"
        backdropComponent={(p) => <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.32} pressBehavior="close" />}
        handleIndicatorStyle={s.handle} backgroundStyle={s.bg}
      >
        <BottomSheetScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
          contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 22 }]}>

          <View style={s.header}>
            <AppText style={s.headerTitle}>Flagging Report</AppText>
            <Pressable onPress={close} hitSlop={8} style={s.closeBtn}><Ionicons name="close" size={22} color={Theme.colors.textMuted} /></Pressable>
          </View>
          <View style={s.divider} />

          <View style={s.introCard}>
            <AppText style={s.introTitle}>Your report helps ensure a transparent election process.</AppText>
            <AppText style={s.introBody}>Provide a clear reason, verify your location, and attach strong supporting evidence.</AppText>
          </View>

          {/* Progress pills */}
          <View style={s.pillRow}>
            <Pill label="Reason" ok={reason.trim().length > 8} />
            <Pill label="Location" ok={!!loc} />
            <Pill label="Image" ok={!!img} />
            <Pill label="Video" ok={!!vid} opt />
          </View>

          {/* Reason */}
          <View style={s.sec}>
            <AppText style={s.secLabel}>Your Reason</AppText>
            <AppInput placeholder="Describe the issue or irregularity..." value={reason} onChangeText={setReason} multiline inputWrapperStyle={s.taWrap} style={s.ta} />
            <AppText style={s.secHint}>Be factual, concise, and specific.</AppText>
          </View>

          {/* Location */}
          <View style={s.sec}>
            <AppText style={s.secLabel}>GPS Map Camera</AppText>
            <View style={s.locCard}>
              <View style={s.locTop}>
                <View style={s.pinWrap}><Ionicons name={loc ? "location" : "location-outline"} size={20} color={loc ? Theme.colors.primary : "#E45858"} /></View>
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText style={s.locTitle}>{loc ? "Polling Area Verified" : "Enable your Location"}</AppText>
                  <AppText style={s.locSub}>{loc ? "Your location has been captured." : "Confirm you're at the polling unit."}</AppText>
                </View>
              </View>
              {locBusy ? (
                <View style={s.locLoading}><ActivityIndicator color={Theme.colors.primary} /><AppText style={s.locLoadingText}>Verifying...</AppText></View>
              ) : loc ? (
                <View style={{ gap: 12 }}>
                  <View style={s.mapBox}><View style={s.mapPin}><Ionicons name="location" size={20} color="#E45858" /></View></View>
                  <View style={s.locMeta}>
                    <View style={s.locMetaHead}>
                      <AppText style={s.locMetaTitle}>GPS Map Camera</AppText>
                      <View style={s.vBadge}><Ionicons name="checkmark-circle" size={14} color={Theme.colors.primary} /><AppText style={s.vBadgeText}>Verified</AppText></View>
                    </View>
                    <AppText style={{ fontSize: 13, color: Theme.colors.text }}>{loc.addressLabel}</AppText>
                    <View style={s.coordRow}>
                      <View style={s.coordChip}><AppText style={s.coordLabel}>Lat</AppText><AppText style={s.coordVal}>{loc.latitude.toFixed(5)}</AppText></View>
                      <View style={s.coordChip}><AppText style={s.coordLabel}>Lng</AppText><AppText style={s.coordVal}>{loc.longitude.toFixed(5)}</AppText></View>
                    </View>
                  </View>
                </View>
              ) : (
                <AppButton title="Enable location" onPress={doLocation} style={{ marginVertical: 0 }} />
              )}
            </View>
          </View>

          {/* Image evidence */}
          <EvCard title="Attach Image Evidence" sub="The picture uploaded must be solid evidence." hint="Best for result sheets, incident scenes."
            p1="Take Photo" p2="Upload from Gallery" onP1={doTakePhoto} onP2={doPickPhoto}
            asset={img} type="image" busy={media.busy} onRemove={() => setImg(null)} />

          {/* Video evidence */}
          <EvCard title="Attach Video Evidence" sub="Video must contain vocal proof." hint="Best for live incident proof."
            p1="Record Live" p2="Upload from Gallery" onP1={doRecordVideo} onP2={doPickVideo}
            asset={vid} type="video" busy={media.busy} onRemove={() => setVid(null)} />

          <View style={{ gap: 8, paddingTop: 2 }}>
            <AppButton title={submitting ? "Submitting..." : "Proceed To Report"} onPress={submit} loading={submitting} disabled={!canSubmit || media.busy} style={{ marginVertical: 0 }} />
            <AppText style={s.submitHint}>Location metadata is attached when verified. Image evidence is required.</AppText>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default FlagReportBottomSheet;

function Pill({ label, ok, opt = false }: { label: string; ok: boolean; opt?: boolean }) {
  return (
    <View style={[s.pill, ok && s.pillOk, opt && !ok && s.pillOpt]}>
      <Ionicons name={ok ? "checkmark-circle" : opt ? "ellipse-outline" : "time-outline"} size={14} color={ok ? Theme.colors.primary : opt ? Theme.colors.textMuted : "#D97706"} />
      <AppText style={[s.pillText, ok && { color: Theme.colors.primary }]}>{label}</AppText>
    </View>
  );
}

function EvCard({ title, sub, hint, p1, p2, onP1, onP2, asset, type, busy, onRemove }: {
  title: string; sub: string; hint: string; p1: string; p2: string; onP1: () => void; onP2: () => void;
  asset: PickedMedia | null; type: "image" | "video"; busy: boolean; onRemove: () => void;
}) {
  return (
    <View style={s.sec}>
      <AppText style={s.secLabel}>{title}</AppText>
      <View style={s.upCard}>
        <View style={s.upHeader}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 }}>
            <View style={s.upIcon}><Ionicons name={type === "image" ? "image-outline" : "videocam-outline"} size={20} color={Theme.colors.primary} /></View>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText style={s.upTitle}>{type === "image" ? "Capture clear image evidence" : "Capture live video evidence"}</AppText>
              <AppText style={s.upHint}>{hint}</AppText>
            </View>
          </View>
          {asset ? <View style={s.addPill}><Ionicons name="checkmark-circle" size={14} color={Theme.colors.primary} /><AppText style={s.addPillText}>Added</AppText></View> : null}
        </View>

        {asset ? (
          <View style={{ gap: 10 }}>
            {type === "image" ? <Image source={{ uri: asset.uri }} style={s.prevImg} /> : (
              <View style={s.vidPrev}><Ionicons name="play-circle" size={28} color={Theme.colors.primary} /><AppText style={{ fontSize: 14, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold }}>Video selected</AppText></View>
            )}
            <Pressable onPress={onRemove} style={s.remBtn}><Ionicons name="trash-outline" size={16} color="#F04A1D" /><AppText style={s.remBtnText}>Remove</AppText></Pressable>
          </View>
        ) : (
          <View style={s.emptyM}><Ionicons name={type === "image" ? "scan-outline" : "radio-outline"} size={22} color={Theme.colors.textMuted} /><AppText style={s.emptyMText}>{type === "image" ? "No image added yet." : "No video added yet."}</AppText></View>
        )}

        <View style={s.actRow}>
          <Pressable onPress={onP1} disabled={busy} style={[s.actBtn, busy && { opacity: 0.6 }]}><Ionicons name={type === "image" ? "camera-outline" : "videocam-outline"} size={16} color="#FFF" /><AppText style={s.actBtnText}>{p1}</AppText></Pressable>
          <Pressable onPress={onP2} disabled={busy} style={[s.actBtn, s.actBtnSec, busy && { opacity: 0.6 }]}><Ionicons name="images-outline" size={16} color={Theme.colors.primary} /><AppText style={[s.actBtnText, { color: Theme.colors.primary }]}>{p2}</AppText></Pressable>
        </View>
      </View>
      <AppText style={s.upSub}>{sub}</AppText>
    </View>
  );
}

const s = StyleSheet.create({
  bg: { backgroundColor: Theme.colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  handle: { backgroundColor: "rgba(17,26,50,0.12)", width: 44 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 18 },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 18, lineHeight: 24, fontFamily: Theme.fonts.heading.semibold, color: Theme.colors.text },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.74)", alignItems: "center", justifyContent: "center" },
  divider: { height: 1, backgroundColor: "#DFE4EB", marginHorizontal: -16 },
  introCard: { borderRadius: 18, backgroundColor: "#F4FBFA", borderWidth: 1, borderColor: "rgba(5,163,156,0.12)", padding: 14, gap: 6 },
  introTitle: { fontSize: 15, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  introBody: { fontSize: 13, lineHeight: 19, color: Theme.colors.textMuted },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { minHeight: 32, borderRadius: 999, paddingHorizontal: 10, backgroundColor: "#FFF7E7", borderWidth: 1, borderColor: "#F6DEB0", flexDirection: "row", alignItems: "center", gap: 6 },
  pillOk: { backgroundColor: "#EAFBF9", borderColor: "rgba(5,163,156,0.22)" },
  pillOpt: { backgroundColor: "#F5F6F8", borderColor: "#E2E8F0" },
  pillText: { fontSize: 12, lineHeight: 16, color: "#B45309", fontFamily: Theme.fonts.body.semibold },
  sec: { gap: 10 },
  secLabel: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  secHint: { fontSize: 11, lineHeight: 16, color: Theme.colors.textMuted },
  taWrap: { minHeight: 118, alignItems: "flex-start", paddingTop: 14 },
  ta: { minHeight: 86, textAlignVertical: "top" },
  locCard: { borderRadius: 22, backgroundColor: "#F9F6EA", borderWidth: 1, borderColor: "#EFE3B7", padding: 16, gap: 14 },
  locTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pinWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFF1C7", alignItems: "center", justifyContent: "center" },
  locTitle: { fontSize: 16, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },
  locSub: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },
  locLoading: { minHeight: 80, borderRadius: 18, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, alignItems: "center", justifyContent: "center", gap: 10 },
  locLoadingText: { fontSize: 13, color: Theme.colors.textMuted },
  mapBox: { height: 120, borderRadius: 18, backgroundColor: "#DDEFF1", borderWidth: 1, borderColor: "#CDE2E7", alignItems: "center", justifyContent: "center" },
  mapPin: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  locMeta: { borderRadius: 16, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, padding: 12, gap: 10 },
  locMetaHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locMetaTitle: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  vBadge: { minHeight: 28, borderRadius: 999, paddingHorizontal: 10, backgroundColor: "#EAFBF9", flexDirection: "row", alignItems: "center", gap: 6 },
  vBadgeText: { fontSize: 12, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  coordRow: { flexDirection: "row", gap: 10 },
  coordChip: { flex: 1, minHeight: 44, borderRadius: 14, backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: Theme.colors.border, paddingHorizontal: 12, paddingVertical: 8, justifyContent: "center", gap: 2 },
  coordLabel: { fontSize: 11, color: Theme.colors.textMuted },
  coordVal: { fontSize: 13, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  upCard: { borderWidth: 1, borderColor: "#DDE7EF", backgroundColor: "#FCFDFC", borderRadius: 20, padding: 14, gap: 14 },
  upHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  upIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EAFBF9", alignItems: "center", justifyContent: "center" },
  upTitle: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  upHint: { fontSize: 12, lineHeight: 17, color: Theme.colors.textMuted },
  addPill: { minHeight: 28, borderRadius: 999, paddingHorizontal: 10, backgroundColor: "#EAFBF9", flexDirection: "row", alignItems: "center", gap: 6 },
  addPillText: { fontSize: 12, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  prevImg: { width: "100%", height: 160, borderRadius: 16, resizeMode: "cover", backgroundColor: "#EEF2F6" },
  vidPrev: { minHeight: 120, borderRadius: 16, backgroundColor: "#F6FAFB", borderWidth: 1, borderColor: Theme.colors.border, alignItems: "center", justifyContent: "center", gap: 8 },
  remBtn: { alignSelf: "flex-start", minHeight: 34, borderRadius: 999, paddingHorizontal: 12, backgroundColor: "#FFF1EC", flexDirection: "row", alignItems: "center", gap: 6 },
  remBtnText: { fontSize: 12, color: "#F04A1D", fontFamily: Theme.fonts.body.semibold },
  emptyM: { minHeight: 88, borderRadius: 16, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: Theme.colors.border, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyMText: { fontSize: 13, color: Theme.colors.textMuted },
  actRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  actBtn: { flex: 1, minHeight: 42, borderRadius: 14, backgroundColor: Theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 12 },
  actBtnSec: { backgroundColor: "#EAFBF9", borderWidth: 1, borderColor: "rgba(5,163,156,0.18)" },
  actBtnText: { fontSize: 13, lineHeight: 18, color: "#FFF", fontFamily: Theme.fonts.body.semibold },
  upSub: { fontSize: 11, lineHeight: 16, color: "#F04A1D" },
  submitHint: { fontSize: 11, lineHeight: 16, color: Theme.colors.textMuted, textAlign: "center" },
});