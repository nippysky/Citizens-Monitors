import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import BirthdaySheet from "@/components/ui/sheets/BirthdaySheet";
import GenderSheet from "@/components/ui/sheets/GenderSheet";
import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";
import TutorialBanner from "@/components/onboarding/TutorialBanner";

import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { BirthdayValue, Gender, StepOneForm } from "@/types/onboarding";

type Props = {
  value: StepOneForm;
  onChange: (value: StepOneForm) => void;
};

export default function OnboardingStepOne({ value, onChange }: Props) {
  const birthdaySheetRef = useRef<BottomSheetModal>(null);
  const genderSheetRef = useRef<BottomSheetModal>(null);
  const nationalitySheetRef = useRef<BottomSheetModal>(null);

  const [selectedGenderTemp, setSelectedGenderTemp] = useState<Gender>(
    value.gender || ""
  );
  const [countryQuery, setCountryQuery] = useState("");

  const [birthdayTemp, setBirthdayTemp] = useState<BirthdayValue>({
    day: 1,
    month: "January",
    year: 2000,
    formatted: value.birthday || "1 January, 2000",
  });

  const handleFirstNameChange = (text: string): void => {
    onChange({ ...value, firstName: text });
  };

  const handleLastNameChange = (text: string): void => {
    onChange({ ...value, lastName: text });
  };

  const handleCityCountryChange = (text: string): void => {
    onChange({ ...value, cityCountry: text });
  };

  const handleConfirmBirthday = (): void => {
    onChange({ ...value, birthday: birthdayTemp.formatted });
    birthdaySheetRef.current?.dismiss();
  };

  const handleConfirmGender = (): void => {
    onChange({ ...value, gender: selectedGenderTemp });
    genderSheetRef.current?.dismiss();
  };

  const handleSelectNationality = (countryName: string): void => {
    onChange({ ...value, nationality: countryName });
    setCountryQuery("");
  };

  return (
    <>
      <View style={styles.body}>
        <AppText variant="title" style={styles.heading}>
          Tell Us A Bit About Yourself.
        </AppText>

        <TutorialBanner />

        <View style={styles.form}>
          <AppInput
            label="Your First Name"
            placeholder="First Name"
            value={value.firstName}
            onChangeText={handleFirstNameChange}
          />

          <AppInput
            label="Your Last Name"
            placeholder="Surname"
            value={value.lastName}
            onChangeText={handleLastNameChange}
          />

          <AppSelectField
            label="Your Birthday"
            value={value.birthday}
            placeholder="Set your birthday"
            onPress={() => birthdaySheetRef.current?.present()}
            leftIcon={
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={20}
                color={Theme.colors.textSoft}
              />
            }
          />

          <AppSelectField
            label="Gender"
            value={value.gender}
            placeholder="Select your gender"
            onPress={() => {
              setSelectedGenderTemp(value.gender);
              genderSheetRef.current?.present();
            }}
          />

          <AppSelectField
            label="Nationality"
            value={value.nationality}
            placeholder="Select your country"
            onPress={() => {
              setCountryQuery("");
              nationalitySheetRef.current?.present();
            }}
          />

          <AppInput
            label="Current Residence City / Country"
            placeholder="e.g. Lagos, Nigeria"
            value={value.cityCountry}
            onChangeText={handleCityCountryChange}
          />
        </View>
      </View>

      <BirthdaySheet
        ref={birthdaySheetRef}
        value={birthdayTemp}
        onChange={setBirthdayTemp}
        onConfirm={handleConfirmBirthday}
      />

      <GenderSheet
        ref={genderSheetRef}
        selected={selectedGenderTemp}
        onSelect={setSelectedGenderTemp}
        onConfirm={handleConfirmGender}
      />

      <SelectPickerSheet
        ref={nationalitySheetRef}
        query={countryQuery}
        onChangeQuery={setCountryQuery}
        selectedValue={value.nationality}
        onSelectValue={handleSelectNationality}
      />
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: 22,
    gap: 18,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
  },
  form: {
    gap: 14,
    paddingBottom: 18,
  },
});