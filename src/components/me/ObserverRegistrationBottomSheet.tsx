import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, RefObject } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MeOptionsSheet from "@/components/me/MeOptionsSheet";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type ObserverRegistrationFormState = {
  phoneNumber: string;
  pvcFrontUri: string | null;
  pvcBackUri: string | null;
  bankName: string;
  accountNumber: string;
  accountFullName: string;
};

type Props = {
  value: ObserverRegistrationFormState;
  onChange: (value: ObserverRegistrationFormState) => void;
  onSubmit: () => void;
  onPickFront: () => void;
  onPickBack: () => void;
  bankSheetRef: RefObject<BottomSheetModal | null>;
  bankOptions: string[];
};

function UploadCard({
  label,
  uri,
  onBrowse,
}: {
  label: string;
  uri: string | null;
  onBrowse: () => void;
}) {
  const fileName = uri ? uri.split("/").pop() ?? "Selected image" : null;

  return (
    <View style={styles.uploadBlock}>
      <AppText style={styles.uploadLabel}>{label}</AppText>

      <View style={styles.uploadCard}>
        <View style={styles.uploadIconWrap}>
          <Ionicons
            name={fileName ? "document-text-outline" : "cloud-upload-outline"}
            size={22}
            color={Theme.colors.textMuted}
          />
        </View>

        <View style={styles.uploadTextWrap}>
          <AppText style={styles.uploadTitle}>Upload your PVC</AppText>
          <AppText numberOfLines={2} style={styles.uploadSubtitle}>
            {fileName ?? "JPG and PNG formats only, Max. 5MB"}
          </AppText>
        </View>

        <Pressable onPress={onBrowse} style={styles.browseBtn}>
          <AppText style={styles.browseText}>Browse</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const ObserverRegistrationBottomSheet = forwardRef<BottomSheetModal, Props>(
  function ObserverRegistrationBottomSheet(
    {
      value,
      onChange,
      onSubmit,
      onPickFront,
      onPickBack,
      bankSheetRef,
      bankOptions,
    },
    ref
  ) {
    const insets = useSafeAreaInsets();

    const dismiss = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={["88%"]}
          topInset={insets.top + 12}
          enablePanDownToClose
          backgroundStyle={styles.sheetBgTransparent}
          handleIndicatorStyle={styles.sheetHandle}
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              opacity={0.32}
            />
          )}
        >
          <View style={styles.sheetWrap}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <AppText variant="title" style={styles.title}>
                  Observer Registration
                </AppText>
              </View>

              <Pressable onPress={dismiss} style={styles.closeBtn}>
                <Ionicons
                  name="close"
                  size={22}
                  color={Theme.colors.textMuted}
                />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.scrollArea}>
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: Math.max(insets.bottom + 56, 96) },
                ]}
              >
                <AppInput
                  label="Phone Number"
                  value={value.phoneNumber}
                  onChangeText={(phoneNumber) =>
                    onChange({ ...value, phoneNumber })
                  }
                  placeholder="Your contact number"
                  keyboardType="phone-pad"
                />

                <View style={styles.section}>
                  <AppText style={styles.sectionTitle}>
                    Upload your Permanent Voters Card (PVC)
                    <AppText style={styles.required}> *</AppText>
                  </AppText>

                  <AppText style={styles.sectionHint}>
                    Ensure to attach the front and back image(s) of your
                    Permanent Voters Card (PVC).
                  </AppText>

                  <UploadCard
                    label="Upload Front"
                    uri={value.pvcFrontUri}
                    onBrowse={onPickFront}
                  />

                  <UploadCard
                    label="Upload Back"
                    uri={value.pvcBackUri}
                    onBrowse={onPickBack}
                  />
                </View>

                <View style={styles.section}>
                  <AppText style={styles.sectionTitle}>Bank Details</AppText>

                  <AppText style={styles.sectionHint}>
                    Please submit your bank account details for volunteering
                    allowance.
                  </AppText>

                  <AppSelectField
                    label="Bank Name"
                    value={value.bankName}
                    placeholder="Select your bank"
                    onPress={() => bankSheetRef.current?.present()}
                  />

                  <AppInput
                    label="Account Number"
                    value={value.accountNumber}
                    onChangeText={(accountNumber) =>
                      onChange({ ...value, accountNumber })
                    }
                    placeholder="Your account number"
                    keyboardType="number-pad"
                    maxLength={10}
                  />

                  <AppInput
                    label="Your Full Name"
                    value={value.accountFullName}
                    onChangeText={(accountFullName) =>
                      onChange({ ...value, accountFullName })
                    }
                    placeholder="Your names"
                  />
                </View>

                <View style={styles.submitWrap}>
                  <AppButton title="Submit" onPress={onSubmit} />
                </View>
              </BottomSheetScrollView>
            </View>
          </View>
        </BottomSheetModal>

        <MeOptionsSheet
          ref={bankSheetRef}
          title="Select Bank"
          options={bankOptions}
          selectedValue={value.bankName}
          onSelect={(bankName) => onChange({ ...value, bankName })}
        />
      </>
    );
  }
);

export default ObserverRegistrationBottomSheet;

const styles = StyleSheet.create({
  sheetBgTransparent: {
    backgroundColor: "transparent",
  },

  sheetHandle: {
    backgroundColor: "rgba(17, 26, 50, 0.12)",
    width: 44,
  },

  sheetWrap: {
    flex: 1,
    backgroundColor: "#FBF8EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  header: {
    minHeight: 76,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 18,
    lineHeight: 24,
  },

  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#D9DEE8",
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 18,
  },

  section: {
    gap: 12,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  required: {
    color: Theme.colors.danger,
    fontFamily: Theme.fonts.body.semibold,
  },

  sectionHint: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },

  uploadBlock: {
    gap: 8,
  },

  uploadLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  uploadCard: {
    minHeight: 132,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D9DEE8",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
  },

  uploadIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F1F3F7",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadTextWrap: {
    alignItems: "center",
    gap: 4,
  },

  uploadTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },

  uploadSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  browseBtn: {
    minWidth: 96,
    height: 44,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  browseText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
  },

  submitWrap: {
    paddingTop: 2,
  },
});