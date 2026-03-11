import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import NationalitySheet from "@/components/onboarding/sheets/NationalitySheet";
import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { StepFourForm } from "@/types/onboarding";

type Props = {
  value: StepFourForm;
  onChange: (value: StepFourForm) => void;
};

const POLLING_DATA: Record<
  string,
  Record<string, Record<string, string[]>>
> = {
  Lagos: {
    Ikeja: {
      "Ward A": ["PU 001", "PU 002", "PU 003"],
      "Ward B": ["PU 004", "PU 005"],
    },
    Surulere: {
      "Ward C": ["PU 006", "PU 007"],
      "Ward D": ["PU 008"],
    },
  },
  Abuja: {
    Gwagwalada: {
      "Ward Central": ["PU 009", "PU 010"],
    },
    Bwari: {
      "Ward North": ["PU 011", "PU 012"],
    },
  },
  Rivers: {
    PortHarcourt: {
      "Ward East": ["PU 013", "PU 014"],
    },
  },
};

export default function OnboardingStepFour({ value, onChange }: Props) {
  const stateSheetRef = useRef<BottomSheetModal>(null);
  const lgaSheetRef = useRef<BottomSheetModal>(null);
  const wardSheetRef = useRef<BottomSheetModal>(null);
  const unitSheetRef = useRef<BottomSheetModal>(null);

  const [query, setQuery] = useState("");

  const states = useMemo(() => Object.keys(POLLING_DATA), []);
  const lgas = useMemo(() => {
    if (!value.pollingState) return [];
    return Object.keys(POLLING_DATA[value.pollingState] ?? {});
  }, [value.pollingState]);

  const wards = useMemo(() => {
    if (!value.pollingState || !value.localGovernmentArea) return [];
    return Object.keys(
      POLLING_DATA[value.pollingState]?.[value.localGovernmentArea] ?? {}
    );
  }, [value.pollingState, value.localGovernmentArea]);

  const pollingUnits = useMemo(() => {
    if (!value.pollingState || !value.localGovernmentArea || !value.ward) return [];
    return (
      POLLING_DATA[value.pollingState]?.[value.localGovernmentArea]?.[value.ward] ?? []
    );
  }, [value.pollingState, value.localGovernmentArea, value.ward]);

  const selectOption = (
    field: keyof StepFourForm,
    fieldValue: string
  ): void => {
    if (field === "pollingState") {
      onChange({
        pollingState: fieldValue,
        localGovernmentArea: "",
        ward: "",
        pollingUnit: "",
      });
      stateSheetRef.current?.dismiss();
      return;
    }

    if (field === "localGovernmentArea") {
      onChange({
        ...value,
        localGovernmentArea: fieldValue,
        ward: "",
        pollingUnit: "",
      });
      lgaSheetRef.current?.dismiss();
      return;
    }

    if (field === "ward") {
      onChange({
        ...value,
        ward: fieldValue,
        pollingUnit: "",
      });
      wardSheetRef.current?.dismiss();
      return;
    }

    onChange({
      ...value,
      pollingUnit: fieldValue,
    });
    unitSheetRef.current?.dismiss();
  };

  const SimpleOptionsSheet = ({
    title,
    options,
    selectedValue,
    onPick,
    sheetRef,
  }: {
    title: string;
    options: string[];
    selectedValue: string;
    onPick: (picked: string) => void;
    sheetRef: React.RefObject<BottomSheetModal | null>;
  }) => (
    <NationalitySheet
      ref={sheetRef}
      query={query}
      onChangeQuery={setQuery}
      selectedCountry={selectedValue}
      onSelectCountry={onPick}
    />
  );

  const filteredStates = states.filter((item) =>
    item.toLowerCase().includes(query.trim().toLowerCase())
  );
  const filteredLgas = lgas.filter((item) =>
    item.toLowerCase().includes(query.trim().toLowerCase())
  );
  const filteredWards = wards.filter((item) =>
    item.toLowerCase().includes(query.trim().toLowerCase())
  );
  const filteredUnits = pollingUnits.filter((item) =>
    item.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <AppText variant="title" style={styles.heading}>
            Your Polling Unit
          </AppText>
          <AppText style={styles.subheading}>
            Select the specific area where you will be monitoring the elections.
          </AppText>
        </View>

        <TutorialBanner />

        <View style={styles.form}>
          <AppSelectField
            label="Polling Unit State"
            value={value.pollingState}
            placeholder="Select state"
            onPress={() => {
              setQuery("");
              stateSheetRef.current?.present();
            }}
            leftIcon={
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={20}
                color={Theme.colors.textSoft}
              />
            }
          />

          <AppSelectField
            label="Local Government Area"
            value={value.localGovernmentArea}
            placeholder="Select state first"
            onPress={() => {
              if (!value.pollingState) return;
              setQuery("");
              lgaSheetRef.current?.present();
            }}
            leftIcon={
              <MaterialCommunityIcons
                name="office-building-outline"
                size={20}
                color={Theme.colors.textSoft}
              />
            }
          />

          <AppSelectField
            label="Ward"
            value={value.ward}
            placeholder="Select LGA first"
            onPress={() => {
              if (!value.localGovernmentArea) return;
              setQuery("");
              wardSheetRef.current?.present();
            }}
            leftIcon={
              <MaterialCommunityIcons
                name="shape-outline"
                size={20}
                color={Theme.colors.textSoft}
              />
            }
          />

          <AppSelectField
            label="Polling Unit"
            value={value.pollingUnit}
            placeholder="Select ward first"
            onPress={() => {
              if (!value.ward) return;
              setQuery("");
              unitSheetRef.current?.present();
            }}
            leftIcon={
              <MaterialCommunityIcons
                name="map-outline"
                size={20}
                color={Theme.colors.textSoft}
              />
            }
          />
        </View>
      </View>

      <SimpleOptionsSheet
        title="Select State"
        options={filteredStates}
        selectedValue={value.pollingState}
        onPick={(picked) => selectOption("pollingState", picked)}
        sheetRef={stateSheetRef}
      />

      <SimpleOptionsSheet
        title="Select LGA"
        options={filteredLgas}
        selectedValue={value.localGovernmentArea}
        onPick={(picked) => selectOption("localGovernmentArea", picked)}
        sheetRef={lgaSheetRef}
      />

      <SimpleOptionsSheet
        title="Select Ward"
        options={filteredWards}
        selectedValue={value.ward}
        onPick={(picked) => selectOption("ward", picked)}
        sheetRef={wardSheetRef}
      />

      <SimpleOptionsSheet
        title="Select Polling Unit"
        options={filteredUnits}
        selectedValue={value.pollingUnit}
        onPick={(picked) => selectOption("pollingUnit", picked)}
        sheetRef={unitSheetRef}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },

  headerBlock: {
    gap: 6,
    marginTop: 22,
  },

  heading: {
    fontSize: 18,
    lineHeight: 24,
  },

  subheading: {
    color: Theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },

  form: {
    gap: 14,
    paddingBottom: 12,
  },
});