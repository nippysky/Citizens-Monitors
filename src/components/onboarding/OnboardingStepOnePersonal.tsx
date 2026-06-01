import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import BirthdaySheet from "@/components/ui/sheets/BirthdaySheet";
import GenderSheet from "@/components/ui/sheets/GenderSheet";
import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";
import { Theme } from "@/theme";
import { BirthdayValue, Gender, StepOneForm } from "@/types/onboarding";

type Props = {
  value: StepOneForm;
  onChange: (value: StepOneForm) => void;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getMonthIndex(month: string): number {
  const index = MONTHS.findIndex((item) => item === month);
  return index >= 0 ? index : 0;
}

function getDaysInMonth(month: string, year: number): number {
  return new Date(year, getMonthIndex(month) + 1, 0).getDate();
}

function formatBirthday(day: number, month: string, year: number): string {
  return `${day} ${month}, ${year}`;
}

function getDefaultBirthdayValue(): BirthdayValue {
  return {
    day: 1,
    month: "January",
    year: 2000,
    formatted: "1 January, 2000",
  };
}

function parseBirthdayValue(
  rawValue: string | undefined,
  fallback?: BirthdayValue
): BirthdayValue {
  const fallbackValue = fallback ?? getDefaultBirthdayValue();
  const birthday = rawValue?.trim();

  if (!birthday) {
    return { ...fallbackValue };
  }

  const match = birthday.match(/^(\d{1,2})\s+([A-Za-z]+),\s*(\d{4})$/);

  if (!match) {
    return { ...fallbackValue };
  }

  const day = Number(match[1]);
  const month = match[2];
  const year = Number(match[3]);

  if (!Number.isFinite(day) || !Number.isFinite(year)) {
    return { ...fallbackValue };
  }

  if (!MONTHS.includes(month)) {
    return { ...fallbackValue };
  }

  const maxDay = getDaysInMonth(month, year);
  const safeDay = Math.min(Math.max(day, 1), maxDay);

  return {
    day: safeDay,
    month,
    year,
    formatted: formatBirthday(safeDay, month, year),
  };
}

export default function OnboardingStepOnePersonal({ value, onChange }: Props) {
  const birthdaySheetRef = useRef<BottomSheetModal>(null);
  const genderSheetRef = useRef<BottomSheetModal>(null);
  const nationalitySheetRef = useRef<BottomSheetModal>(null);

  const [selectedGenderTemp, setSelectedGenderTemp] = useState<Gender>(
    value.gender || ""
  );

  const [countryQuery, setCountryQuery] = useState("");

  const [birthdayTemp, setBirthdayTemp] = useState<BirthdayValue>(() =>
    parseBirthdayValue(value.birthday)
  );

  const handleOpenBirthdaySheet = (): void => {
    setBirthdayTemp(parseBirthdayValue(value.birthday, birthdayTemp));
    birthdaySheetRef.current?.present();
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
            onChangeText={(firstName) => onChange({ ...value, firstName })}
          />

          <AppInput
            label="Your Last Name"
            placeholder="Surname"
            value={value.lastName}
            onChangeText={(lastName) => onChange({ ...value, lastName })}
          />

          <AppSelectField
            label="Your Birthday"
            value={value.birthday}
            placeholder="Set your birthday"
            onPress={handleOpenBirthdaySheet}
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