// ─── src/components/me/ProfileBottomSheet.tsx ────────────────────────────────
// Revamped: avatar change via gallery+crop, regenerate public name with 5 trials.
// Updated: avatar picker now uses centralized media-library permission helper.
// ─────────────────────────────────────────────────────────────────────────────

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
};

const PUBLIC_NAME_PREFIXES = [
  "Iron",
  "Silver",
  "Golden",
  "Shadow",
  "Storm",
  "Brave",
  "Swift",
  "Noble",
  "Crystal",
  "Thunder",
];

const PUBLIC_NAME_SUFFIXES = [
  "Eagle",
  "Wolf",
  "Lion",
  "Hawk",
  "Bear",
  "Fox",
  "Panther",
  "Falcon",
  "Titan",
  "Phoenix",
];

function generatePublicName(): string {
  const prefix =
    PUBLIC_NAME_PREFIXES[
      Math.floor(Math.random() * PUBLIC_NAME_PREFIXES.length)
    ];
  const suffix =
    PUBLIC_NAME_SUFFIXES[
      Math.floor(Math.random() * PUBLIC_NAME_SUFFIXES.length)
    ];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${prefix}${suffix}${num}`;
}

const ProfileBottomSheet = forwardRef<BottomSheetModal, Props>(
  function ProfileBottomSheet(
    {
      value,
      onChange,
      onSave,
      birthdaySheetRef,
      nationalitySheetRef,
      genderSheetRef,
    },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();
    const snapPoints = useMemo(() => ["92%"], []);

    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [publicName, setPublicName] = useState("IronEagle42");
    const [trialsLeft, setTrialsLeft] = useState(5);

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
            message: "Profile photo updated.",
          });
        }
      } catch {
        showToast({
          type: "error",
          message: "Could not open gallery. Try again.",
        });
      }
    }, [showToast]);

    const handleRegenerateName = useCallback(() => {
      if (trialsLeft <= 0) return;
      setPublicName(generatePublicName());
      setTrialsLeft((prev) => prev - 1);
    }, [trialsLeft]);

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

            {/* Avatar section */}
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

            {/* Name row */}
            <View style={styles.nameRow}>
              <View style={styles.nameCol}>
                <AppInput
                  label="Your First Name"
                  value={value.firstName}
                  onChangeText={(t) => onChange({ ...value, firstName: t })}
                  placeholder="First name"
                />
              </View>
              <View style={styles.nameCol}>
                <AppInput
                  label="Your Last Name"
                  value={value.lastName}
                  onChangeText={(t) => onChange({ ...value, lastName: t })}
                  placeholder="Last name"
                />
              </View>
            </View>

            {/* Birthday */}
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

            {/* Gender */}
            <AppSelectField
              label="Gender"
              value={value.gender}
              placeholder="Select gender"
              onPress={() => genderSheetRef.current?.present()}
            />

            {/* Nationality */}
            <AppSelectField
              label="Nationality"
              value={value.nationality}
              placeholder="Select nationality"
              onPress={() => nationalitySheetRef.current?.present()}
            />

            {/* Residence */}
            <AppInput
              label="Current Residence City / Country"
              value={value.residence}
              onChangeText={(t) => onChange({ ...value, residence: t })}
              placeholder="Lagos, Nigeria"
            />

            {/* Phone */}
            <AppInput
              label="Phone Number"
              value=""
              onChangeText={() => {}}
              placeholder="Your contact number"
              keyboardType="phone-pad"
            />

            {/* ── Regenerate Public Name ── */}
            <View style={styles.publicNameSection}>
              <View style={styles.publicNameHeader}>
                <AppText style={styles.publicNameTitle}>
                  Regenerate Your Public Name
                </AppText>
              </View>
              <AppText style={styles.publicNameDesc}>
                To protect you on this app, your real name is never shown
                publicly. All reports and discussions are tied to this identity.
              </AppText>

              <View style={styles.publicNameCard}>
                <AppText style={styles.publicNameLabel}>
                  Your anonymous identity
                </AppText>
                <AppText style={styles.publicNameValue}>{publicName}</AppText>
              </View>

              <View style={styles.publicNameActions}>
                <Pressable
                  onPress={handleRegenerateName}
                  disabled={trialsLeft <= 0}
                  style={[
                    styles.tryAnotherBtn,
                    trialsLeft <= 0 && styles.tryAnotherBtnDisabled,
                  ]}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={14}
                    color={
                      trialsLeft > 0
                        ? Theme.colors.primary
                        : Theme.colors.textMuted
                    }
                  />
                  <AppText
                    style={[
                      styles.tryAnotherText,
                      trialsLeft <= 0 && { color: Theme.colors.textMuted },
                    ]}
                  >
                    Try another ({trialsLeft} Left)
                  </AppText>
                </Pressable>

                <Pressable style={styles.keepNameBtn}>
                  <AppText style={styles.keepNameText}>Keep This Name</AppText>
                </Pressable>
              </View>
            </View>

            {/* Save */}
            <AppButton
              title="Save Changes"
              onPress={onSave}
              style={styles.saveButton}
            />
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Sub-sheets */}
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
          onChangeQuery={(q) => onChange({ ...value, nationalityQuery: q })}
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

  /* Avatar */
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

  /* Name row */
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameCol: {
    flex: 1,
  },

  /* Public name */
  publicNameSection: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    padding: 14,
    gap: 12,
  },
  publicNameHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  publicNameTitle: {
    fontSize: 15,
    lineHeight: 20,
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
    backgroundColor: "#F4FFFE",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },
  publicNameLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  publicNameValue: {
    fontSize: 22,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  publicNameActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tryAnotherBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "transparent",
    borderWidth: 1.2,
    borderColor: Theme.colors.primary,
  },
  tryAnotherBtnDisabled: {
    borderColor: Theme.colors.border,
    opacity: 0.5,
  },
  tryAnotherText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  keepNameBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
  },
  keepNameText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.body.semibold,
  },

  saveButton: {
    marginVertical: 0,
  },
});