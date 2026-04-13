import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type UploadTarget = "front" | "back" | null;

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

type UploadOptionSheetProps = {
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function getImagePickerMediaTypes() {
  const pickerAny = ImagePicker as any;

  if (pickerAny.MediaType?.Images) {
    return [pickerAny.MediaType.Images];
  }

  if (pickerAny.MediaTypeOptions?.Images) {
    return pickerAny.MediaTypeOptions.Images;
  }

  return undefined;
}

const UploadOptionSheet = forwardRef<BottomSheetModal, UploadOptionSheetProps>(
  function UploadOptionSheet({ onTakePhoto, onChooseFromGallery }, ref) {
    const snapPoints = useMemo(() => ["28%"], []);

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleTakePhoto = () => {
      close();
      setTimeout(onTakePhoto, 140);
    };

    const handleChooseFromGallery = () => {
      close();
      setTimeout(onChooseFromGallery, 140);
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        stackBehavior="push"
        enablePanDownToClose
        backgroundStyle={optionStyles.background}
        handleIndicatorStyle={optionStyles.handle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior="close"
          />
        )}
      >
        <View style={optionStyles.container}>
          <AppText style={optionStyles.title}>Upload PVC</AppText>

          <View style={optionStyles.list}>
            <Pressable
              accessibilityRole="button"
              onPress={handleTakePhoto}
              style={optionStyles.optionRow}
            >
              <View style={optionStyles.optionIconWrap}>
                <Ionicons name="camera-outline" size={20} color="#111827" />
              </View>
              <AppText style={optionStyles.optionLabel}>Take Photo</AppText>
            </Pressable>

            <View style={optionStyles.rowDivider} />

            <Pressable
              accessibilityRole="button"
              onPress={handleChooseFromGallery}
              style={optionStyles.optionRow}
            >
              <View style={optionStyles.optionIconWrap}>
                <Ionicons name="images-outline" size={20} color="#111827" />
              </View>
              <AppText style={optionStyles.optionLabel}>
                Choose from Gallery
              </AppText>
            </Pressable>
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

function EmptyUploadCard({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.uploadBlock}>
      <AppText style={styles.uploadLabel}>{label}</AppText>

      <Pressable onPress={onPress} style={styles.uploadCard}>
        <View style={styles.uploadIconWrap}>
          <Ionicons name="cloud-upload-outline" size={22} color="#111827" />
        </View>

        <AppText style={styles.uploadTitle}>Upload Image</AppText>
      </Pressable>
    </View>
  );
}

function FilledUploadCard({
  label,
  uri,
  onPress,
  onRemove,
}: {
  label: string;
  uri: string;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.uploadBlock}>
      <AppText style={styles.uploadLabel}>{label}</AppText>

      <Pressable onPress={onPress} style={styles.previewCard}>
        <Image source={{ uri }} style={styles.previewImage} />

        <View style={styles.previewOverlay} />

        <View style={styles.previewTopBar}>
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            <AppText style={styles.selectedBadgeText}>Selected</AppText>
          </View>
        </View>

        <View style={styles.previewBottomActions}>
          <Pressable onPress={onPress} style={styles.previewActionBtn}>
            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            <AppText style={styles.previewActionText}>Replace</AppText>
          </Pressable>

          <Pressable onPress={onRemove} style={styles.previewActionBtnDanger}>
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
            <AppText style={styles.previewActionText}>Remove</AppText>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
}

const ObserverRegistrationBottomSheet = forwardRef<BottomSheetModal, Props>(
  function ObserverRegistrationBottomSheet({ value, onChange, onSubmit }, ref) {
    const insets = useSafeAreaInsets();
    const uploadOptionsRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["90%"], []);
    const [uploadTarget, setUploadTarget] = useState<UploadTarget>(null);

    const dismiss = useCallback(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const openSettingsAlert = useCallback((title: string, message: string) => {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            Linking.openSettings().catch(() => {
              Alert.alert(
                "Settings unavailable",
                "Please open your device settings and grant access manually."
              );
            });
          },
        },
      ]);
    }, []);

    const ensureLibraryPermission = useCallback(async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.granted) return true;

      if (!permission.canAskAgain) {
        openSettingsAlert(
          "Gallery permission needed",
          "Please allow photo library access in Settings so you can upload your PVC image."
        );
      } else {
        Alert.alert(
          "Gallery permission needed",
          "Photo library access is required to upload your PVC image."
        );
      }

      return false;
    }, [openSettingsAlert]);

    const ensureCameraPermission = useCallback(async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (permission.granted) return true;

      if (!permission.canAskAgain) {
        openSettingsAlert(
          "Camera permission needed",
          "Please allow camera access in Settings so you can take a PVC photo."
        );
      } else {
        Alert.alert(
          "Camera permission needed",
          "Camera access is required to take a PVC photo."
        );
      }

      return false;
    }, [openSettingsAlert]);

    const applyPickedAsset = useCallback(
      (asset: ImagePicker.ImagePickerAsset) => {
        if (!asset?.uri || !uploadTarget) return;

        if (
          typeof asset.fileSize === "number" &&
          asset.fileSize > MAX_FILE_SIZE_BYTES
        ) {
          Alert.alert(
            "Image too large",
            "Please select an image smaller than 5MB."
          );
          return;
        }

        if (uploadTarget === "front") {
          onChange({
            ...value,
            pvcFrontUri: asset.uri,
          });
          return;
        }

        onChange({
          ...value,
          pvcBackUri: asset.uri,
        });
      },
      [onChange, uploadTarget, value]
    );

    const pickFromGallery = useCallback(async () => {
      const hasPermission = await ensureLibraryPermission();
      if (!hasPermission) return;

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: getImagePickerMediaTypes() as any,
          allowsEditing: false,
          quality: Platform.OS === "ios" ? 0.9 : 0.85,
          selectionLimit: 1,
        });

        if (result.canceled || !result.assets?.length) return;
        applyPickedAsset(result.assets[0]);
      } catch {
        Alert.alert(
          "Upload failed",
          "We could not open your gallery right now. Please try again."
        );
      }
    }, [applyPickedAsset, ensureLibraryPermission]);

    const takePhoto = useCallback(async () => {
      const hasPermission = await ensureCameraPermission();
      if (!hasPermission) return;

      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: getImagePickerMediaTypes() as any,
          allowsEditing: false,
          quality: Platform.OS === "ios" ? 0.9 : 0.85,
        });

        if (result.canceled || !result.assets?.length) return;
        applyPickedAsset(result.assets[0]);
      } catch {
        Alert.alert(
          "Camera unavailable",
          "We could not open the camera right now. Please try again."
        );
      }
    }, [applyPickedAsset, ensureCameraPermission]);

    const openUploadOptions = useCallback((target: UploadTarget) => {
      setUploadTarget(target);

      requestAnimationFrame(() => {
        uploadOptionsRef.current?.present();
      });
    }, []);

    const removeImage = useCallback(
      (target: "front" | "back") => {
        if (target === "front") {
          onChange({
            ...value,
            pvcFrontUri: null,
          });
          return;
        }

        onChange({
          ...value,
          pvcBackUri: null,
        });
      },
      [onChange, value]
    );

    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={snapPoints}
          enablePanDownToClose
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          topInset={insets.top + 8}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              opacity={0.32}
              pressBehavior="close"
            />
          )}
        >
          <BottomSheetScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: Math.max(insets.bottom + 24, 28) },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <AppText style={styles.title}>Observer Registration</AppText>

              <Pressable onPress={dismiss} style={styles.closeButton}>
                <Ionicons name="close" size={22} color="#4B5563" />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>
                Upload your Permanent Voters Card (PVC)
              </AppText>

              <AppText style={styles.sectionHint}>
                Ensure your image is either in JPG and PNG formats only, Max.
                5MB.
              </AppText>

              {value.pvcFrontUri ? (
                <FilledUploadCard
                  label="Front of PVC"
                  uri={value.pvcFrontUri}
                  onPress={() => openUploadOptions("front")}
                  onRemove={() => removeImage("front")}
                />
              ) : (
                <EmptyUploadCard
                  label="Front of PVC"
                  onPress={() => openUploadOptions("front")}
                />
              )}

              {value.pvcBackUri ? (
                <FilledUploadCard
                  label="Back of PVC"
                  uri={value.pvcBackUri}
                  onPress={() => openUploadOptions("back")}
                  onRemove={() => removeImage("back")}
                />
              ) : (
                <EmptyUploadCard
                  label="Back of PVC"
                  onPress={() => openUploadOptions("back")}
                />
              )}

              <View style={styles.noticeCard}>
                <View style={styles.noticeIconWrap}>
                  <Ionicons name="information" size={16} color="#FFFFFF" />
                </View>

                <AppText style={styles.noticeText}>
                  Your PVC is encrypted and protected under NDPR 2019. Your PVC
                  is just to show us you belong to the said polling unit you
                  claimed.
                </AppText>
              </View>
            </View>

            <View style={styles.sectionPhone}>
              <AppText style={styles.phoneHeading}>Add your phone number</AppText>

              <AppText style={styles.phoneHint}>
                Incase we want to reach out to you to clarify any information.
              </AppText>

              <AppInput
                label="Phone Number"
                value={value.phoneNumber}
                onChangeText={(phoneNumber) =>
                  onChange({
                    ...value,
                    phoneNumber,
                  })
                }
                placeholder="Your contact number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.submitWrap}>
              <AppButton title="Submit" onPress={onSubmit} />
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>

        <UploadOptionSheet
          ref={uploadOptionsRef}
          onTakePhoto={takePhoto}
          onChooseFromGallery={pickFromGallery}
        />
      </>
    );
  }
);

export default ObserverRegistrationBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#FBF6E3",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  handleIndicator: {
    backgroundColor: "rgba(17, 26, 50, 0.14)",
    width: 42,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
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

  closeButton: {
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
  },

  sectionTitle: {
    color: "#1F2937",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Theme.fonts.body.semibold,
  },

  sectionHint: {
    marginTop: 6,
    color: "#5D6673",
    fontSize: 14,
    lineHeight: 24,
    fontFamily: Theme.fonts.body.regular,
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

  uploadCard: {
    height: 164,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C7D2DA",
    backgroundColor: "#FCFCF9",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadIconWrap: {
    width: 58,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#DBEFE3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  uploadTitle: {
    color: "#5B6468",
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
    textAlign: "center",
  },

  previewCard: {
    height: 176,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    justifyContent: "space-between",
  },

  previewImage: {
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
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
  },

  previewBottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  previewActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(17, 24, 39, 0.64)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  previewActionBtnDanger: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(220, 38, 38, 0.86)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  previewActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },

  noticeCard: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "#CFEFDE",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },

  noticeIconWrap: {
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

  sectionPhone: {
    paddingTop: 24,
  },

  phoneHeading: {
    color: "#16213B",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Theme.fonts.body.semibold,
  },

  phoneHint: {
    marginTop: 8,
    color: "#697386",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.regular,
    marginBottom: 18,
  },

  submitWrap: {
    paddingTop: 26,
  },
});

const optionStyles = StyleSheet.create({
  background: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  handle: {
    backgroundColor: "#D1D5DB",
    width: 42,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 28,
  },

  title: {
    color: "#16213B",
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    marginBottom: 16,
  },

  list: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  optionRow: {
    minHeight: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },

  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  optionLabel: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.medium,
  },

  rowDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginLeft: 64,
  },
});