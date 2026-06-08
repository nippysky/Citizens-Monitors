import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
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
  onSubmit: (frontUri: string, backUri: string) => Promise<void> | void;
  saving?: boolean;
};

const PVCVerificationBottomSheet = forwardRef<BottomSheetModal, Props>(
  function PVCVerificationBottomSheet(
    { pvcVerifiedDate, onSubmit, saving = false },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();
    const snapPoints = useMemo(() => ["85%"], []);
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );

    const [frontUri, setFrontUri] = useState<string | null>(null);
    const [backUri, setBackUri] = useState<string | null>(null);
    const [localSubmitting, setLocalSubmitting] = useState(false);
    const [activeChooserSide, setActiveChooserSide] = useState<
      "front" | "back" | null
    >(null);

    const isVerified = Boolean(pvcVerifiedDate);
    const isSubmitting = saving || localSubmitting;

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const closeChooser = useCallback(() => {
      setActiveChooserSide(null);
    }, []);

    const setImage = useCallback(
      (side: "front" | "back", uri: string) => {
        if (side === "front") {
          setFrontUri(uri);
          showToast({
            type: "success",
            message: "Front PVC image added.",
          });
          return;
        }

        setBackUri(uri);
        showToast({
          type: "success",
          message: "Back PVC image added.",
        });
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
            quality: Platform.OS === "ios" ? 0.88 : 0.82,
          });

          if (!result.canceled && result.assets?.length) {
            setImage(side, result.assets[0].uri);
          }
        } catch (error) {
          console.log("PVC gallery picker error:", error);

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
            quality: Platform.OS === "ios" ? 0.88 : 0.82,
          });

          if (!result.canceled && result.assets?.length) {
            setImage(side, result.assets[0].uri);
          }
        } catch (error) {
          console.log("PVC camera picker error:", error);

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
        if (isSubmitting) return;

        if (Platform.OS === "ios") {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: ["Cancel", "Take Photo", "Choose from Gallery"],
              cancelButtonIndex: 0,
            },
            (index) => {
              if (index === 1) {
                void takePhoto(side);
              }

              if (index === 2) {
                void pickFromGallery(side);
              }
            }
          );

          return;
        }

        setActiveChooserSide(side);
      },
      [isSubmitting, pickFromGallery, takePhoto]
    );

    const removeImage = useCallback(
      (side: "front" | "back") => {
        if (isSubmitting) return;

        if (side === "front") {
          setFrontUri(null);
          showToast({
            type: "success",
            message: "Front PVC image removed.",
          });
          return;
        }

        setBackUri(null);
        showToast({
          type: "success",
          message: "Back PVC image removed.",
        });
      },
      [isSubmitting, showToast]
    );

    const handleSubmit = async () => {
      if (isSubmitting) return;

      if (!frontUri || !backUri) {
        showToast({
          type: "error",
          message: "Upload both front and back PVC images.",
        });
        return;
      }

      try {
        setLocalSubmitting(true);

        await onSubmit(frontUri, backUri);

        setFrontUri(null);
        setBackUri(null);
        setActiveChooserSide(null);
        close();
      } catch (error) {
        console.log("PVC upload submit error:", error);
      } finally {
        setLocalSubmitting(false);
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        onChange={handleSheetChange}
        snapPoints={snapPoints}
        enablePanDownToClose={!isSubmitting}
        topInset={insets.top + 12}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior={isSubmitting ? "none" : "close"}
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
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Update Your PVC</AppText>

            <Pressable
              onPress={close}
              hitSlop={8}
              disabled={isSubmitting}
              style={[styles.closeBtn, isSubmitting && styles.disabledControl]}
            >
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.divider} />

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

          <View style={styles.infoBlock}>
            <AppText style={styles.infoTitle}>Re-upload PVC</AppText>
            <AppText style={styles.infoSub}>
              Upload both sides of your PVC. Your submission will be reviewed by
              an admin.
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

                <Pressable
                  onPress={closeChooser}
                  hitSlop={8}
                  disabled={isSubmitting}
                  style={styles.inlineChooserClose}
                >
                  <Ionicons name="close" size={18} color="#4B5563" />
                </Pressable>
              </View>

              <View style={styles.inlineChooserActions}>
                <Pressable
                  onPress={() => {
                    void takePhoto(activeChooserSide);
                  }}
                  disabled={isSubmitting}
                  style={[
                    styles.inlineChooserBtn,
                    isSubmitting && styles.disabledControl,
                  ]}
                >
                  <View style={styles.inlineChooserBtnIcon}>
                    <Ionicons name="camera-outline" size={18} color="#0F172A" />
                  </View>
                  <AppText style={styles.inlineChooserBtnText}>
                    Take Photo
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void pickFromGallery(activeChooserSide);
                  }}
                  disabled={isSubmitting}
                  style={[
                    styles.inlineChooserBtn,
                    isSubmitting && styles.disabledControl,
                  ]}
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

          <UploadBox
            label="Front of PVC"
            uri={frontUri}
            disabled={isSubmitting}
            onUpload={() => showUploadOptions("front")}
            onRemove={() => removeImage("front")}
          />

          <UploadBox
            label="Back of PVC"
            uri={backUri}
            disabled={isSubmitting}
            onUpload={() => showUploadOptions("back")}
            onRemove={() => removeImage("back")}
          />

          <AppButton
            title="Submit"
            onPress={() => {
              void handleSubmit();
            }}
            loading={isSubmitting}
            disabled={!frontUri || !backUri || isSubmitting}
            style={styles.submitBtn}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default PVCVerificationBottomSheet;

function UploadBox({
  label,
  uri,
  disabled,
  onUpload,
  onRemove,
}: {
  label: string;
  uri: string | null;
  disabled?: boolean;
  onUpload: () => void;
  onRemove: () => void;
}) {
  if (uri) {
    return (
      <View style={styles.uploadBlock}>
        <AppText style={styles.uploadLabel}>{label}</AppText>

        <Pressable
          onPress={onUpload}
          disabled={disabled}
          style={[styles.previewCard, disabled && styles.disabledControl]}
        >
          <Image source={{ uri }} style={styles.previewImg} />
          <View style={styles.previewOverlay} />

          <View style={styles.previewTopBar}>
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              <AppText style={styles.selectedBadgeText}>Selected</AppText>
            </View>
          </View>

          <View style={styles.previewActions}>
            <Pressable
              onPress={onUpload}
              disabled={disabled}
              style={styles.actionBtn}
            >
              <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
              <AppText style={styles.actionBtnText}>Replace</AppText>
            </Pressable>

            <Pressable
              onPress={onRemove}
              disabled={disabled}
              style={styles.actionBtnDanger}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
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

      <Pressable
        onPress={onUpload}
        disabled={disabled}
        style={[styles.emptyCard, disabled && styles.disabledControl]}
      >
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
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },
  verifiedSub: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
  infoBlock: {
    gap: 5,
  },
  infoTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },
  infoSub: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  inlineChooser: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "#FFFFFF",
    padding: 12,
    gap: 12,
  },
  inlineChooserHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inlineChooserTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },
  inlineChooserClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  inlineChooserActions: {
    gap: 10,
  },
  inlineChooserBtn: {
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inlineChooserBtnIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2F6",
  },
  inlineChooserBtnText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  uploadBlock: {
    gap: 10,
  },
  uploadLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },
  emptyCard: {
    minHeight: 128,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.58)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,163,156,0.08)",
  },
  emptyCardText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  previewCard: {
    height: 190,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111827",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  previewTopBar: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
  },
  selectedBadge: {
    minHeight: 28,
    borderRadius: 999,
    backgroundColor: "rgba(5,163,156,0.95)",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  selectedBadgeText: {
    fontSize: 11,
    lineHeight: 15,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
  previewActions: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: "rgba(17,24,39,0.72)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnDanger: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: "rgba(239,68,68,0.86)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
  submitBtn: {
    marginVertical: 0,
  },
  disabledControl: {
    opacity: 0.58,
  },
});