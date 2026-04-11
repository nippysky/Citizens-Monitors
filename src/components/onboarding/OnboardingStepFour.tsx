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

type PollingData = {
  [state: string]: {
    [lga: string]: {
      [ward: string]: string[];
    };
  };
};

const POLLING_DATA: PollingData = {
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

  const [stateQuery, setStateQuery] = useState("");
  const [lgaQuery, setLgaQuery] = useState("");
  const [wardQuery, setWardQuery] = useState("");
  const [unitQuery, setUnitQuery] = useState("");

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
    if (!value.pollingState || !value.localGovernmentArea || !value.ward)
      return [];
    return (
      POLLING_DATA[value.pollingState]?.[value.localGovernmentArea]?.[
        value.ward
      ] ?? []
    );
  }, [value.pollingState, value.localGovernmentArea, value.ward]);

  const filteredStates = useMemo(
    () =>
      states.filter((s: string) =>
        s.toLowerCase().includes(stateQuery.trim().toLowerCase())
      ),
    [states, stateQuery]
  );

  const filteredLgas = useMemo(
    () =>
      lgas.filter((s: string) =>
        s.toLowerCase().includes(lgaQuery.trim().toLowerCase())
      ),
    [lgas, lgaQuery]
  );

  const filteredWards = useMemo(
    () =>
      wards.filter((s: string) =>
        s.toLowerCase().includes(wardQuery.trim().toLowerCase())
      ),
    [wards, wardQuery]
  );

  const filteredUnits = useMemo(
    () =>
      pollingUnits.filter((s: string) =>
        s.toLowerCase().includes(unitQuery.trim().toLowerCase())
      ),
    [pollingUnits, unitQuery]
  );

  const handlePickState = (picked: string): void => {
    onChange({
      pollingState: picked,
      localGovernmentArea: "",
      ward: "",
      pollingUnit: "",
    });
    stateSheetRef.current?.dismiss();
  };

  const handlePickLga = (picked: string): void => {
    onChange({ ...value, localGovernmentArea: picked, ward: "", pollingUnit: "" });
    lgaSheetRef.current?.dismiss();
  };

  const handlePickWard = (picked: string): void => {
    onChange({ ...value, ward: picked, pollingUnit: "" });
    wardSheetRef.current?.dismiss();
  };

  const handlePickUnit = (picked: string): void => {
    onChange({ ...value, pollingUnit: picked });
    unitSheetRef.current?.dismiss();
  };

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
              setStateQuery("");
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
              setLgaQuery("");
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
              setWardQuery("");
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
              setUnitQuery("");
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

      <NationalitySheet
        ref={stateSheetRef}
        title="Select State"
        query={stateQuery}
        onChangeQuery={setStateQuery}
        selectedCountry={value.pollingState}
        onSelectCountry={handlePickState}
        options={filteredStates}
      />

      <NationalitySheet
        ref={lgaSheetRef}
        title="Select LGA"
        query={lgaQuery}
        onChangeQuery={setLgaQuery}
        selectedCountry={value.localGovernmentArea}
        onSelectCountry={handlePickLga}
        options={filteredLgas}
      />

      <NationalitySheet
        ref={wardSheetRef}
        title="Select Ward"
        query={wardQuery}
        onChangeQuery={setWardQuery}
        selectedCountry={value.ward}
        onSelectCountry={handlePickWard}
        options={filteredWards}
      />

      <NationalitySheet
        ref={unitSheetRef}
        title="Select Polling Unit"
        query={unitQuery}
        onChangeQuery={setUnitQuery}
        selectedCountry={value.pollingUnit}
        onSelectCountry={handlePickUnit}
        options={filteredUnits}
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