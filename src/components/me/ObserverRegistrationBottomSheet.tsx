// ─── src/components/me/ObserverRegistrationBottomSheet.tsx ────────────────────
// Updated: uses centralized permission helpers + real app toast hook.
// Removed all Alert.alert usage.
// iOS uses ActionSheetIOS; Android uses lightweight inline chooser
// inside the same sheet to avoid nested-sheet lag/hang.
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
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
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { useAppToast } from "@/hooks/useAppToast";
import {
  ensureCameraPermission,
  ensureMediaLibraryPermission,
} from "@/lib/permissions";
import { Theme } from "@/theme";

export type ObserverRegistrationFormState = {
  phoneNumber: string;
  pvcFrontUri: string | null;
  pvcBackUri: string | null;
};

type Props = {
  value: ObserverRegistrationFormState;
  onChange: (value: ObserverRegistrationFormState) => void;
  onSubmit: () => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ObserverRegistrationBottomSheet = forwardRef<BottomSheetModal, Props>(
  function ObserverRegistrationBottomSheet({ value, onChange, onSubmit }, ref) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();

    const [activeChooserSide, setActiveChooserSide] = useState<
      "front" | "back" | null
    >(null);

    const snapPoints = useMemo(() => ["90%"], []);

    const dismiss = useCallback(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const closeChooser = useCallback(() => {
      setActiveChooserSide(null);
    }, []);

    /* ── Image apply helper ── */

    const applyAsset = useCallback(
      (side: "front" | "back", asset: ImagePicker.ImagePickerAsset) => {
        if (!asset?.uri) return;

        if (typeof asset.fileSize === "number" && asset.fileSize > MAX_FILE_SIZE) {
          showToast({
            type: "error",
            message: "Image too large. Select an image smaller than 5MB.",
          });
          return;
        }

        onChange({
          ...value,
          pvcFrontUri: side === "front" ? asset.uri : value.pvcFrontUri,
          pvcBackUri: side === "back" ? asset.uri : value.pvcBackUri,
        });

        showToast({
          type: "success",
          message:
            side === "front"
              ? "Front PVC image added."
              : "Back PVC image added.",
        });
      },
      [onChange, showToast, value]
    );

    /* ── Image pick/capture ── */

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
            applyAsset(side, result.assets[0]);
          }
        } catch {
          showToast({
            type: "error",
            message: "Could not open gallery. Try again.",
          });
        }
      },
      [applyAsset, closeChooser, showToast]
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
            applyAsset(side, result.assets[0]);
          }
        } catch {
          showToast({
            type: "error",
            message: "Could not open camera. Try again.",
          });
        }
      },
      [applyAsset, closeChooser, showToast]
    );

    /* ── Upload options ── */

    const showUploadOptions = useCallback(
      (side: "front" | "back") => {
        if (Platform.OS === "ios") {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: ["Cancel", "Take Photo", "Choose from Gallery"],
              cancelButtonIndex: 0,
            },
            (buttonIndex) => {
              if (buttonIndex === 1) {
                void takePhoto(side);
              }
              if (buttonIndex === 2) {
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
        onChange({
          ...value,
          pvcFrontUri: side === "front" ? null : value.pvcFrontUri,
          pvcBackUri: side === "back" ? null : value.pvcBackUri,
        });

        showToast({
          type: "success",
          message:
            side === "front"
              ? "Front PVC image removed."
              : "Back PVC image removed.",
        });
      },
      [onChange, showToast, value]
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        topInset={insets.top + 8}
        backgroundStyle={styles.bg}
        handleIndicatorStyle={styles.handle}
        backdropComponent={(p) => (
          <BottomSheetBackdrop
            {...p}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 24, 28) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <AppText style={styles.title}>Observer Registration</AppText>
            <Pressable onPress={dismiss} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#4B5563" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* PVC upload section */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>
              Upload your Permanent Voters Card (PVC)
            </AppText>
            <AppText style={styles.sectionHint}>
              Ensure your image is either in JPG and PNG formats only, Max. 5MB.
            </AppText>

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
              uri={value.pvcFrontUri}
              onUpload={() => showUploadOptions("front")}
              onRemove={() => removeImage("front")}
            />

            {/* Back */}
            <UploadBox
              label="Back of PVC"
              uri={value.pvcBackUri}
              onUpload={() => showUploadOptions("back")}
              onRemove={() => removeImage("back")}
            />

            {/* Notice */}
            <View style={styles.notice}>
              <View style={styles.noticeIcon}>
                <Ionicons name="information" size={16} color="#FFF" />
              </View>
              <AppText style={styles.noticeText}>
                Your PVC is encrypted and protected under NDPR 2019. Your PVC is
                just to show us you belong to the said polling unit you claimed.
              </AppText>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.phoneSection}>
            <AppText style={styles.phoneTitle}>Add your phone number</AppText>
            <AppText style={styles.phoneHint}>
              Incase we want to reach out to you to clarify any information.
            </AppText>
            <AppInput
              label="Phone Number"
              value={value.phoneNumber}
              onChangeText={(phoneNumber) => onChange({ ...value, phoneNumber })}
              placeholder="Your contact number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.submitWrap}>
            <AppButton title="Submit" onPress={onSubmit} />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default ObserverRegistrationBottomSheet;

/* ───── Upload box sub-component ───── */

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
          <View style={styles.previewTopBar}>
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
              <AppText style={styles.selectedBadgeText}>Selected</AppText>
            </View>
          </View>
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
          <Ionicons name="cloud-upload-outline" size={22} color="#111827" />
        </View>
        <AppText style={styles.emptyCardText}>Upload Image</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: "#FBF6E3",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: "rgba(17,26,50,0.14)",
    width: 42,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 22,
  },

  header: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    color: "#111827",
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.76)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#E1E4E8",
    marginHorizontal: -22,
  },

  section: {
    paddingTop: 18,
    gap: 6,
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Theme.fonts.body.semibold,
  },
  sectionHint: {
    color: "#5D6673",
    fontSize: 14,
    lineHeight: 24,
  },

  inlineChooser: {
    marginTop: 16,
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

  uploadBlock: {
    marginTop: 18,
  },
  uploadLabel: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.semibold,
    marginBottom: 10,
  },

  emptyCard: {
    height: 164,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C7D2DA",
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
    backgroundColor: "rgba(12,17,29,0.24)",
  },
  previewTopBar: {
    paddingHorizontal: 12,
    paddingTop: 12,
    flexDirection: "row",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.72)",
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
    backgroundColor: "rgba(17,24,39,0.64)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnDanger: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(220,38,38,0.86)",
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

  notice: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "#CFEFDE",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  noticeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  noticeText: {
    flex: 1,
    color: "#35584A",
    fontSize: 13,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
  },

  phoneSection: {
    paddingTop: 24,
    gap: 8,
  },
  phoneTitle: {
    color: "#16213B",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Theme.fonts.body.semibold,
  },
  phoneHint: {
    color: "#697386",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },

  submitWrap: {
    paddingTop: 10,
  },
});