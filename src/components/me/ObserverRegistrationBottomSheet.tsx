import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
import * as ImagePicker from "expo-image-picker";
import { forwardRef, useCallback, useMemo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { useAppToast } from "@/hooks/useAppToast";
import { ensureMediaLibraryPermission } from "@/lib/permissions";
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
  submitting?: boolean;
};

type UploadCardProps = {
  label: string;
  helper: string;
  uri: string | null;
  disabled?: boolean;
  onPick: () => void;
  onRemove: () => void;
};

function UploadCard({
  label,
  helper,
  uri,
  disabled = false,
  onPick,
  onRemove,
}: UploadCardProps) {
  return (
    <View style={styles.uploadBlock}>
      <View style={styles.uploadLabelRow}>
        <AppText style={styles.uploadLabel}>{label}</AppText>

        {uri ? (
          <Pressable
            onPress={onRemove}
            disabled={disabled}
            hitSlop={8}
            style={styles.removePill}
          >
            <Ionicons name="close" size={14} color="#DC2626" />
            <AppText style={styles.removeText}>Remove</AppText>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={onPick}
        disabled={disabled}
        style={({ pressed }) => [
          styles.uploadCard,
          uri && styles.uploadCardFilled,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.emptyUploadContent}>
            <View style={styles.emptyUploadIcon}>
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color={Theme.colors.primary}
              />
            </View>

            <View style={styles.emptyTextWrap}>
              <AppText style={styles.emptyUploadTitle}>Upload image</AppText>
              <AppText style={styles.emptyUploadHelper}>{helper}</AppText>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const ObserverRegistrationBottomSheet = forwardRef<BottomSheetModal, Props>(
  function ObserverRegistrationBottomSheet(
    { value, onChange, onSubmit, submitting = false },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();

    const snapPoints = useMemo(() => ["88%"], []);
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );

    const canSubmit = Boolean(
      value.phoneNumber.trim().length >= 7 &&
        value.pvcFrontUri &&
        value.pvcBackUri &&
        !submitting
    );

    const closeSheet = useCallback(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const pickImage = useCallback(async (): Promise<string | null> => {
      const allowed = await ensureMediaLibraryPermission();
      if (!allowed) return null;

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 0.88,
          selectionLimit: 1,
        });

        if (result.canceled || !result.assets?.length) {
          return null;
        }

        return result.assets[0].uri;
      } catch {
        showToast({
          type: "error",
          message: "Could not open gallery. Try again.",
        });

        return null;
      }
    }, [showToast]);

    const handlePickFront = useCallback(async () => {
      const uri = await pickImage();
      if (!uri) return;

      onChange({
        ...value,
        pvcFrontUri: uri,
      });
    }, [onChange, pickImage, value]);

    const handlePickBack = useCallback(async () => {
      const uri = await pickImage();
      if (!uri) return;

      onChange({
        ...value,
        pvcBackUri: uri,
      });
    }, [onChange, pickImage, value]);

    const handleSubmit = useCallback(() => {
      if (!value.phoneNumber.trim()) {
        showToast({
          type: "error",
          message: "Please enter your phone number.",
        });
        return;
      }

      if (value.phoneNumber.trim().length < 7) {
        showToast({
          type: "error",
          message: "Please enter a valid phone number.",
        });
        return;
      }

      if (!value.pvcFrontUri || !value.pvcBackUri) {
        showToast({
          type: "error",
          message: "Please upload the front and back of your PVC.",
        });
        return;
      }

      onSubmit();
    }, [onSubmit, showToast, value.phoneNumber, value.pvcBackUri, value.pvcFrontUri]);

    return (
      <BottomSheetModal
        ref={ref}
        onChange={handleSheetChange}
        snapPoints={snapPoints}
        enablePanDownToClose={!submitting}
        topInset={insets.top + 12}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior={submitting ? "none" : "close"}
          />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <AppText style={styles.headerTitle}>
                Observer Registration
              </AppText>
              <AppText style={styles.headerSubtitle}>
                Submit your PVC and contact number to apply as a polling unit
                observer.
              </AppText>
            </View>

            <Pressable
              onPress={closeSheet}
              disabled={submitting}
              hitSlop={8}
              style={[styles.closeBtn, submitting && styles.disabled]}
            >
              <Ionicons
                name="close"
                size={22}
                color={Theme.colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.noticeCard}>
            <View style={styles.noticeIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={Theme.colors.primary}
              />
            </View>

            <AppText style={styles.noticeText}>
              Your application will be reviewed by the admin team. You can keep
              using Citizen Monitor while verification is pending.
            </AppText>
          </View>

          <AppInput
            label="Phone Number"
            value={value.phoneNumber}
            onChangeText={(phoneNumber) =>
              onChange({
                ...value,
                phoneNumber,
              })
            }
            placeholder="08030000000"
            keyboardType="phone-pad"
            editable={!submitting}
          />

          <View style={styles.uploadsWrap}>
            <UploadCard
              label="Front of PVC"
              helper="Clear image of the front side"
              uri={value.pvcFrontUri}
              disabled={submitting}
              onPick={handlePickFront}
              onRemove={() =>
                onChange({
                  ...value,
                  pvcFrontUri: null,
                })
              }
            />

            <UploadCard
              label="Back of PVC"
              helper="Clear image of the back side"
              uri={value.pvcBackUri}
              disabled={submitting}
              onPick={handlePickBack}
              onRemove={() =>
                onChange({
                  ...value,
                  pvcBackUri: null,
                })
              }
            />
          </View>
        </BottomSheetScrollView>

        {/* Sticky submit — always visible, never buried inside scroll */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom + 8, 20) },
          ]}
        >
          <AppButton
            title="Submit Observer Application"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!canSubmit}
            style={styles.submitButton}
          />
        </View>
      </BottomSheetModal>
    );
  }
);

export default ObserverRegistrationBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
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
    paddingBottom: 16,
    gap: 16,
  },
  header: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    gap: 5,
  },
  headerTitle: {
    fontSize: 19,
    lineHeight: 25,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
    maxWidth: 310,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeCard: {
    borderRadius: 18,
    backgroundColor: "rgba(5,163,156,0.09)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },
  noticeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.76)",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Theme.colors.text,
  },
  uploadsWrap: {
    gap: 16,
  },
  uploadBlock: {
    gap: 9,
  },
  uploadLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uploadLabel: {
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  removePill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(220,38,38,0.07)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  removeText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#DC2626",
    fontFamily: Theme.fonts.body.semibold,
  },
  uploadCard: {
    minHeight: 142,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D5DCE6",
    backgroundColor: "rgba(255,255,255,0.58)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadCardFilled: {
    borderStyle: "solid",
    borderColor: Theme.colors.primary,
    backgroundColor: "#FFFFFF",
  },
  emptyUploadContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 18,
  },
  emptyUploadIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(5,163,156,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTextWrap: {
    alignItems: "center",
    gap: 2,
  },
  emptyUploadTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  emptyUploadHelper: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: 210,
    resizeMode: "cover",
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(17,26,50,0.07)",
    backgroundColor: Theme.colors.background,
  },
  submitButton: {
    marginVertical: 0,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.55,
  },
});