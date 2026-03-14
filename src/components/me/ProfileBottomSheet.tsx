import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, RefObject } from "react";
import { StyleSheet, View } from "react-native";


import AppBottomSheet from "@/components/ui/AppBottomSheet";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
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
    return (
      <>
        <AppBottomSheet
          ref={ref}
          title="Update Personal Profile"
          snapPoints={["88%"]}
        >
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

          <AppButton title="Save Changes" onPress={onSave} />
        </AppBottomSheet>

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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
});