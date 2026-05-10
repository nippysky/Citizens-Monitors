import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { forwardRef, RefObject, useCallback, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BirthdaySheet from "@/components/ui/sheets/BirthdaySheet";
import GenderSheet from "@/components/ui/sheets/GenderSheet";
import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import { useAppToast } from "@/hooks/useAppToast";
import { ensureMediaLibraryPermission } from "@/lib/permissions";
import ProfilePhoto from "@/svgs/app/profile/ProfilePhoto";
import { Theme } from "@/theme";
import { BirthdayValue, Gender } from "@/types/onboarding";

export type ProfileFormState = {
  firstName: string;
  lastName: string;
  birthday: BirthdayValue;
  gender: Gender;
  nationality: string;
  nationalityQuery: string;
  residence: string;
};

type Props = {
  value: ProfileFormState;
  onChange: (value: ProfileFormState) => void;
  onSave: () => void;
  birthdaySheetRef: RefObject<BottomSheetModal | null>;
  nationalitySheetRef: RefObject<BottomSheetModal | null>;
  genderSheetRef: RefObject<BottomSheetModal | null>;
  publicName?: string;
  generatingPublicName?: boolean;
  keepingPublicName?: boolean;
  saving?: boolean;
  onGeneratePublicName: () => void;
  onKeepPublicName: () => void;
};

const ProfileBottomSheet = forwardRef<BottomSheetModal, Props>(
  function ProfileBottomSheet(
    {
      value,
      onChange,
      onSave,
      birthdaySheetRef,
      nationalitySheetRef,
      genderSheetRef,
      publicName,
      generatingPublicName = false,
      keepingPublicName = false,
      saving = false,
      onGeneratePublicName,
      onKeepPublicName,
    },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();
    const snapPoints = useMemo(() => ["92%"], []);

    const [avatarUri, setAvatarUri] = useState<string | null>(null);

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleChangeAvatar = useCallback(async () => {
      const allowed = await ensureMediaLibraryPermission();
      if (!allowed) return;

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

        if (!result.canceled && result.assets?.length) {
          setAvatarUri(result.assets[0].uri);

          showToast({
            type: "success",
            message:
              "Profile photo selected. Upload will be connected with the profile update endpoint.",
          });
        }
      } catch {
        showToast({
          type: "error",
          message: "Could not open gallery. Try again.",
        });
      }
    }, [showToast]);

    const hasPublicName = Boolean(publicName?.trim());

    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={snapPoints}
          enablePanDownToClose
          topInset={insets.top + 12}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
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
            <View style={styles.header}>
              <AppText style={styles.headerTitle}>
                Update Personal Profile
              </AppText>

              <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
                <Ionicons
                  name="close"
                  size={22}
                  color={Theme.colors.textMuted}
                />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.avatarSection}>
              <View style={styles.avatarWrap}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <ProfilePhoto width={72} height={72} />
                )}
              </View>

              <Pressable
                onPress={handleChangeAvatar}
                style={styles.changeAvatarBtn}
              >
                <AppText style={styles.changeAvatarText}>Change Avatar</AppText>
              </Pressable>
            </View>

            <View style={styles.nameRow}>
              <View style={styles.nameCol}>
                <AppInput
                  label="Your First Name"
                  value={value.firstName}
                  onChangeText={(firstName) =>
                    onChange({ ...value, firstName })
                  }
                  placeholder="First name"
                />
              </View>

              <View style={styles.nameCol}>
                <AppInput
                  label="Your Last Name"
                  value={value.lastName}
                  onChangeText={(lastName) => onChange({ ...value, lastName })}
                  placeholder="Last name"
                />
              </View>
            </View>

            <AppSelectField
              label="Your Birthday"
              value={value.birthday.formatted}
              placeholder="Select birthday"
              onPress={() => birthdaySheetRef.current?.present()}
              leftIcon={
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={Theme.colors.textSoft}
                />
              }
            />

            <AppSelectField
              label="Gender"
              value={value.gender}
              placeholder="Select gender"
              onPress={() => genderSheetRef.current?.present()}
            />

            <AppSelectField
              label="Nationality"
              value={value.nationality}
              placeholder="Select nationality"
              onPress={() => nationalitySheetRef.current?.present()}
            />

            <AppInput
              label="Current Residence City / Country"
              value={value.residence}
              onChangeText={(residence) => onChange({ ...value, residence })}
              placeholder="City, Country"
            />

            <View style={styles.publicNameSection}>
              <View style={styles.publicNameHeader}>
                <AppText style={styles.publicNameTitle}>
                  Public Anonymous Name
                </AppText>
              </View>

              <AppText style={styles.publicNameDesc}>
                Your anonymous name is used for sensitive public participation
                inside Citizen Monitor.
              </AppText>

              <View style={styles.publicNameCard}>
                <AppText style={styles.publicNameLabel}>
                  Your anonymous identity
                </AppText>

                <AppText
                  style={[
                    styles.publicNameValue,
                    !hasPublicName && styles.publicNamePlaceholder,
                  ]}
                >
                  {hasPublicName ? publicName : "No anonymous name generated"}
                </AppText>
              </View>

              <View style={styles.publicNameActions}>
                <Pressable
                  onPress={onGeneratePublicName}
                  disabled={generatingPublicName || keepingPublicName}
                  style={[
                    styles.tryAnotherBtn,
                    (generatingPublicName || keepingPublicName) &&
                      styles.actionDisabled,
                  ]}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={14}
                    color={Theme.colors.primary}
                  />
                  <AppText style={styles.tryAnotherText}>
                    {hasPublicName ? "Regenerate" : "Generate"}
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={onKeepPublicName}
                  disabled={!hasPublicName || generatingPublicName || keepingPublicName}
                  style={[
                    styles.keepNameBtn,
                    (!hasPublicName ||
                      generatingPublicName ||
                      keepingPublicName) &&
                      styles.keepNameBtnDisabled,
                  ]}
                >
                  <AppText style={styles.keepNameText}>
                    {keepingPublicName ? "Saving..." : "Keep This Name"}
                  </AppText>
                </Pressable>
              </View>
            </View>

            <AppButton
              title="Save Changes"
              onPress={onSave}
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
            />
          </BottomSheetScrollView>
        </BottomSheetModal>

        <BirthdaySheet
          ref={birthdaySheetRef}
          value={value.birthday}
          onChange={(birthday) => onChange({ ...value, birthday })}
          onConfirm={() => birthdaySheetRef.current?.dismiss()}
        />

        <GenderSheet
          ref={genderSheetRef}
          selected={value.gender}
          onSelect={(gender) => onChange({ ...value, gender })}
          onConfirm={() => genderSheetRef.current?.dismiss()}
        />

        <SelectPickerSheet
          ref={nationalitySheetRef}
          query={value.nationalityQuery}
          onChangeQuery={(nationalityQuery) =>
            onChange({ ...value, nationalityQuery })
          }
          selectedValue={value.nationality}
          onSelectValue={(nationality) =>
            onChange({ ...value, nationality, nationalityQuery: "" })
          }
        />
      </>
    );
  }
);

export default ProfileBottomSheet;

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
    gap: 16,
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
  avatarSection: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: "#EEF2F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  changeAvatarBtn: {
    minHeight: 30,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(5,163,156,0.06)",
    borderWidth: 1.2,
    borderColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  changeAvatarText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameCol: {
    flex: 1,
  },
  publicNameSection: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.62)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  publicNameHeader: {
    gap: 3,
  },
  publicNameTitle: {
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  publicNameDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  publicNameCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.18)",
    backgroundColor: "rgba(5,163,156,0.07)",
    paddingHorizontal: 14,
    paddingVertical: 13,
    alignItems: "center",
    gap: 4,
  },
  publicNameLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  publicNameValue: {
    fontSize: 20,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  publicNamePlaceholder: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  publicNameActions: {
    flexDirection: "row",
    gap: 10,
  },
  tryAnotherBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  tryAnotherText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  keepNameBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  keepNameBtnDisabled: {
    opacity: 0.48,
  },
  keepNameText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
  actionDisabled: {
    opacity: 0.58,
  },
  saveButton: {
    marginVertical: 0,
  },
});