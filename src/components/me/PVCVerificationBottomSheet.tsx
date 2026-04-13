// ─── src/components/me/PVCVerificationBottomSheet.tsx ─────────────────────────
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { useAppToast } from "@/hooks/useAppToast";
import { Theme } from "@/theme";

type Props = {
  pvcVerifiedDate?: string;
  onSubmit: (frontUri: string, backUri: string) => void;
};

const PVCVerificationBottomSheet = forwardRef<BottomSheetModal, Props>(
  function PVCVerificationBottomSheet({ pvcVerifiedDate, onSubmit }, ref) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();
    const snaps = useMemo(() => ["82%"], []);

    const [frontUri, setFrontUri] = useState<string | null>(null);
    const [backUri, setBackUri] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const isVerified = !!pvcVerifiedDate;

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) ref.current.dismiss();
    };

    const pickImage = async (side: "front" | "back") => {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        showToast({ type: "error", message: "Gallery permission required." });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.length) return;
      if (side === "front") setFrontUri(result.assets[0].uri);
      else setBackUri(result.assets[0].uri);
    };

    const handleSubmit = async () => {
      if (!frontUri || !backUri) {
        showToast({ type: "error", message: "Upload both front and back PVC images." });
        return;
      }
      setBusy(true);
      await new Promise((r) => setTimeout(r, 800));
      setBusy(false);
      onSubmit(frontUri, backUri);
      close();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snaps}
        enablePanDownToClose
        topInset={insets.top + 12}
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
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Update Your PVC</AppText>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>
          <View style={styles.divider} />

          {/* Verified banner */}
          {isVerified ? (
            <View style={styles.verifiedBanner}>
              <View style={styles.verifiedIconWrap}>
                <Ionicons name="checkmark-circle" size={22} color={Theme.colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText style={styles.verifiedTitle}>Identity Verified</AppText>
                <AppText style={styles.verifiedSub}>PVC verified on {pvcVerifiedDate}</AppText>
              </View>
            </View>
          ) : null}

          {/* Re-upload info */}
          <View style={styles.infoBlock}>
            <AppText style={styles.infoTitle}>Re-upload PVC</AppText>
            <AppText style={styles.infoSub}>
              Upload a new PVC if your card was replaced or verification was rejected. Your data is encrypted under NDPR 2019.
            </AppText>
          </View>

          {/* Front */}
          <UploadCard
            label="Front of PVC"
            uri={frontUri}
            onBrowse={() => pickImage("front")}
          />

          {/* Back */}
          <UploadCard
            label="Back of PVC"
            uri={backUri}
            onBrowse={() => pickImage("back")}
          />

          <AppButton
            title={busy ? "Submitting..." : "Submit"}
            onPress={handleSubmit}
            loading={busy}
            disabled={!frontUri || !backUri}
            style={{ marginVertical: 0 }}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default PVCVerificationBottomSheet;

function UploadCard({ label, uri, onBrowse }: { label: string; uri: string | null; onBrowse: () => void }) {
  const fileName = uri ? uri.split("/").pop()?.slice(0, 24) ?? "Selected" : null;
  return (
    <View style={styles.uploadBlock}>
      <AppText style={styles.uploadLabel}>{label}</AppText>
      <View style={styles.uploadCard}>
        <View style={styles.uploadIconWrap}>
          <Ionicons name={fileName ? "document-text-outline" : "cloud-upload-outline"} size={22} color={Theme.colors.textMuted} />
        </View>
        <AppText style={styles.uploadTitle}>{fileName ?? "Upload Image"}</AppText>
        <Pressable onPress={onBrowse} style={styles.browseBtn}>
          <AppText style={styles.browseText}>Browse</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: Theme.colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  handle: { backgroundColor: "rgba(17,26,50,0.12)", width: 44 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 18 },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 18, lineHeight: 24, fontFamily: Theme.fonts.heading.semibold, color: Theme.colors.text },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.74)", alignItems: "center", justifyContent: "center" },
  divider: { height: 1, backgroundColor: "#DFE4EB", marginHorizontal: -16 },

  verifiedBanner: {
    borderRadius: 16, backgroundColor: "#EAFBF9", borderWidth: 1, borderColor: "rgba(5,163,156,0.2)",
    paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12,
  },
  verifiedIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(5,163,156,0.12)", alignItems: "center", justifyContent: "center" },
  verifiedTitle: { fontSize: 15, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  verifiedSub: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },

  infoBlock: { gap: 6 },
  infoTitle: { fontSize: 16, lineHeight: 22, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  infoSub: { fontSize: 13, lineHeight: 19, color: Theme.colors.textMuted },

  uploadBlock: { gap: 8 },
  uploadLabel: { fontSize: 14, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.body.medium },
  uploadCard: {
    minHeight: 120, borderWidth: 1, borderStyle: "dashed", borderColor: "#D9DEE8", borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", paddingVertical: 18, gap: 10,
  },
  uploadIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F1F3F7", alignItems: "center", justifyContent: "center" },
  uploadTitle: { fontSize: 14, lineHeight: 20, color: Theme.colors.textMuted, textAlign: "center" },
  browseBtn: { minWidth: 90, height: 40, borderRadius: 12, backgroundColor: Theme.colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  browseText: { color: "#FFF", fontSize: 14, lineHeight: 20, fontFamily: Theme.fonts.body.semibold },
});