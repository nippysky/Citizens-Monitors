// ─── src/components/me/PVCVerificationBottomSheet.tsx ─────────────────────────
// Shows full image preview with Replace/Remove overlay when PVC is selected,
// consistent with ObserverRegistrationBottomSheet upload cards.
// Updated: now uses centralized permission helpers + app toast.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { forwardRef, useCallback, useMemo, useState } from "react";
import {
  ActionSheetIOS,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { useAppToast } from "@/hooks/useAppToast";
import {
  ensureCameraPermission,
  ensureMediaLibraryPermission,
} from "@/lib/permissions";
import { Theme } from "@/theme";

type Props = {
  pvcVerifiedDate?: string;
  onSubmit: (frontUri: string, backUri: string) => void;
};

const PVCVerificationBottomSheet = forwardRef<BottomSheetModal, Props>(
  function PVCVerificationBottomSheet({ pvcVerifiedDate, onSubmit }, ref) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();
    const snaps = useMemo(() => ["85%"], []);

    const [frontUri, setFrontUri] = useState<string | null>(null);
    const [backUri, setBackUri] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [activeChooserSide, setActiveChooserSide] = useState<
      "front" | "back" | null
    >(null);

    const isVerified = !!pvcVerifiedDate;

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const closeChooser = useCallback(() => {
      setActiveChooserSide(null);
    }, []);

    /* ── Pick / Capture ── */

    const setImage = useCallback(
      (side: "front" | "back", uri: string) => {
        if (side === "front") {
          setFrontUri(uri);
          showToast({
            type: "success",
            message: "Front PVC image added.",
          });
        } else {
          setBackUri(uri);
          showToast({
            type: "success",
            message: "Back PVC image added.",
          });
        }
      },
      [showToast]
    );

    const pickFromGallery = useCallback(
      async (side: "front" | "back") => {
        closeChooser();

        const ok = await ensureMediaLibraryPermission();
        if (!ok) return;

        try {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: Platform.OS === "ios" ? 0.9 : 0.85,
          });

          if (!result.canceled && result.assets?.length) {
            setImage(side, result.assets[0].uri);
          }
        } catch {
          showToast({
            type: "error",
            message: "Could not open gallery.",
          });
        }
      },
      [closeChooser, setImage, showToast]
    );

    const takePhoto = useCallback(
      async (side: "front" | "back") => {
        closeChooser();

        const ok = await ensureCameraPermission();
        if (!ok) return;

        try {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: Platform.OS === "ios" ? 0.9 : 0.85,
          });

          if (!result.canceled && result.assets?.length) {
            setImage(side, result.assets[0].uri);
          }
        } catch {
          showToast({
            type: "error",
            message: "Could not open camera.",
          });
        }
      },
      [closeChooser, setImage, showToast]
    );

    const showUploadOptions = useCallback(
      (side: "front" | "back") => {
        if (Platform.OS === "ios") {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: ["Cancel", "Take Photo", "Choose from Gallery"],
              cancelButtonIndex: 0,
            },
            (i) => {
              if (i === 1) {
                void takePhoto(side);
              }
              if (i === 2) {
                void pickFromGallery(side);
              }
            }
          );
          return;
        }

        setActiveChooserSide(side);
      },
      [pickFromGallery, takePhoto]
    );

    const removeImage = useCallback(
      (side: "front" | "back") => {
        if (side === "front") {
          setFrontUri(null);
          showToast({
            type: "success",
            message: "Front PVC image removed.",
          });
        } else {
          setBackUri(null);
          showToast({
            type: "success",
            message: "Back PVC image removed.",
          });
        }
      },
      [showToast]
    );

    /* ── Submit ── */

    const handleSubmit = async () => {
      if (!frontUri || !backUri) {
        showToast({
          type: "error",
          message: "Upload both front and back PVC images.",
        });
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
          <BottomSheetBackdrop
            {...p}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.bg}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 22 },
          ]}
        >
          {/* Header */}
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
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={Theme.colors.primary}
                />
              </View>
              <View style={styles.verifiedTextWrap}>
                <AppText style={styles.verifiedTitle}>
                  Identity Verified
                </AppText>
                <AppText style={styles.verifiedSub}>
                  PVC verified on {pvcVerifiedDate}
                </AppText>
              </View>
            </View>
          ) : null}

          {/* Re-upload info */}
          <View style={styles.infoBlock}>
            <AppText style={styles.infoTitle}>Re-upload PVC</AppText>
            <AppText style={styles.infoSub}>
              Upload a new PVC if your card was replaced or verification was
              rejected. Your data is encrypted under NDPR 2019.
            </AppText>
          </View>

          {activeChooserSide ? (
            <View style={styles.inlineChooser}>
              <View style={styles.inlineChooserHeader}>
                <AppText style={styles.inlineChooserTitle}>
                  {activeChooserSide === "front"
                    ? "Upload front of PVC"
                    : "Upload back of PVC"}
                </AppText>

                <Pressable onPress={closeChooser} style={styles.inlineChooserClose}>
                  <Ionicons name="close" size={18} color="#4B5563" />
                </Pressable>
              </View>

              <View style={styles.inlineChooserActions}>
                <Pressable
                  onPress={() => {
                    void takePhoto(activeChooserSide);
                  }}
                  style={styles.inlineChooserBtn}
                >
                  <View style={styles.inlineChooserBtnIcon}>
                    <Ionicons name="camera-outline" size={18} color="#0F172A" />
                  </View>
                  <AppText style={styles.inlineChooserBtnText}>Take Photo</AppText>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void pickFromGallery(activeChooserSide);
                  }}
                  style={styles.inlineChooserBtn}
                >
                  <View style={styles.inlineChooserBtnIcon}>
                    <Ionicons name="images-outline" size={18} color="#0F172A" />
                  </View>
                  <AppText style={styles.inlineChooserBtnText}>
                    Choose from Gallery
                  </AppText>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Front */}
          <UploadBox
            label="Front of PVC"
            uri={frontUri}
            onUpload={() => showUploadOptions("front")}
            onRemove={() => removeImage("front")}
          />

          {/* Back */}
          <UploadBox
            label="Back of PVC"
            uri={backUri}
            onUpload={() => showUploadOptions("back")}
            onRemove={() => removeImage("back")}
          />

          <AppButton
            title={busy ? "Submitting..." : "Submit"}
            onPress={handleSubmit}
            loading={busy}
            disabled={!frontUri || !backUri}
            style={styles.submitBtn}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default PVCVerificationBottomSheet;

/* ───── Upload box — empty state + full preview state ───── */

function UploadBox({
  label,
  uri,
  onUpload,
  onRemove,
}: {
  label: string;
  uri: string | null;
  onUpload: () => void;
  onRemove: () => void;
}) {
  if (uri) {
    return (
      <View style={styles.uploadBlock}>
        <AppText style={styles.uploadLabel}>{label}</AppText>
        <Pressable onPress={onUpload} style={styles.previewCard}>
          <Image source={{ uri }} style={styles.previewImg} />
          <View style={styles.previewOverlay} />

          {/* Selected badge */}
          <View style={styles.previewTopBar}>
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
              <AppText style={styles.selectedBadgeText}>Selected</AppText>
            </View>
          </View>

          {/* Replace / Remove */}
          <View style={styles.previewActions}>
            <Pressable onPress={onUpload} style={styles.actionBtn}>
              <Ionicons name="refresh-outline" size={16} color="#FFF" />
              <AppText style={styles.actionBtnText}>Replace</AppText>
            </Pressable>
            <Pressable onPress={onRemove} style={styles.actionBtnDanger}>
              <Ionicons name="trash-outline" size={16} color="#FFF" />
              <AppText style={styles.actionBtnText}>Remove</AppText>
            </Pressable>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.uploadBlock}>
      <AppText style={styles.uploadLabel}>{label}</AppText>
      <Pressable onPress={onUpload} style={styles.emptyCard}>
        <View style={styles.emptyIconWrap}>
          <Ionicons
            name="cloud-upload-outline"
            size={22}
            color={Theme.colors.textMuted}
          />
        </View>
        <AppText style={styles.emptyCardText}>Upload Image</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: "rgba(17,26,50,0.12)",
    width: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#DFE4EB",
    marginHorizontal: -16,
  },

  /* Verified banner */
  verifiedBanner: {
    borderRadius: 16,
    backgroundColor: "#EAFBF9",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  verifiedIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(5,163,156,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedTextWrap: {
    flex: 1,
    gap: 2,
  },
  verifiedTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  verifiedSub: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  /* Info block */
  infoBlock: {
    gap: 6,
  },
  infoTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  infoSub: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },

  /* Inline chooser */
  inlineChooser: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    gap: 14,
  },
  inlineChooserHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  inlineChooserTitle: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
  },
  inlineChooserClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineChooserActions: {
    flexDirection: "row",
    gap: 10,
  },
  inlineChooserBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  inlineChooserBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8F5EF",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineChooserBtnText: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },

  /* Upload shared */
  uploadBlock: {
    gap: 8,
  },
  uploadLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  /* Empty card */
  emptyCard: {
    height: 164,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C7D2DA",
    borderRadius: 22,
    backgroundColor: "#FCFCF9",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconWrap: {
    width: 58,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#DBEFE3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyCardText: {
    color: "#5B6468",
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
  },

  /* Preview card (image selected) */
  previewCard: {
    height: 176,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    justifyContent: "space-between",
  },
  previewImg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 17, 29, 0.24)",
  },
  previewTopBar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(17, 24, 39, 0.72)",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  selectedBadgeText: {
    color: "#FFF",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(17, 24, 39, 0.64)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnDanger: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(220, 38, 38, 0.86)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },

  submitBtn: {
    marginVertical: 0,
  },
});