import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, RefObject, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { BirthdayValue, Gender } from "@/types/onboarding";
import BirthdaySheet from "../onboarding/sheets/BirthdaySheet";
import GenderSheet from "../onboarding/sheets/GenderSheet";
import NationalitySheet from "../onboarding/sheets/NationalitySheet";

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
    const snapPoints = useMemo(() => ["88%"], []);

    const closeSheet = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

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
          backgroundStyle={styles.sheetBackground}
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
              <AppText style={styles.headerTitle}>Update Personal Profile</AppText>

              <Pressable onPress={closeSheet} hitSlop={8} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.col}>
                <AppInput
                  label="Your First Name"
                  value={value.firstName}
                  onChangeText={(text) => onChange({ ...value, firstName: text })}
                  placeholder="First name"
                />
              </View>

              <View style={styles.col}>
                <AppInput
                  label="Your Last Name"
                  value={value.lastName}
                  onChangeText={(text) => onChange({ ...value, lastName: text })}
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
              onChangeText={(text) => onChange({ ...value, residence: text })}
              placeholder="Lagos, Nigeria"
            />

            <AppButton title="Save Changes" onPress={onSave} style={styles.saveButton} />
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

        <NationalitySheet
          ref={nationalitySheetRef}
          query={value.nationalityQuery}
          onChangeQuery={(nationalityQuery) =>
            onChange({ ...value, nationalityQuery })
          }
          selectedCountry={value.nationality}
          onSelectCountry={(nationality) =>
            onChange({ ...value, nationality, nationalityQuery: "" })
          }
        />
      </>
    );
  }
);

export default ProfileBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  handle: {
    backgroundColor: "rgba(17, 26, 50, 0.12)",
    width: 44,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },

  header: {
    minHeight: 62,
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

  row: {
    flexDirection: "row",
    gap: 12,
  },

  col: {
    flex: 1,
  },

  saveButton: {
    marginVertical: 0,
  },
});