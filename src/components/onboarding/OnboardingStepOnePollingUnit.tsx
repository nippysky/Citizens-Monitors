import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";
import {
  useLocalGovernmentsQuery,
  usePollingUnitsQuery,
  useStatesQuery,
  useWardsQuery,
} from "@/hooks/api/useLocationQueries";
import { Theme } from "@/theme";
import { StepFourForm } from "@/types/onboarding";

type Props = {
  value: StepFourForm;
  onChange: (value: StepFourForm) => void;
};

const EMPTY_OPTIONS: string[] = [];

function filterOptions(options: string[], query: string): string[] {
  const q = query.trim().toLowerCase();

  if (!q) return options;

  return options.filter((item) => item.toLowerCase().includes(q));
}

export default function OnboardingStepOnePollingUnit({
  value,
  onChange,
}: Props) {
  const stateSheetRef = useRef<BottomSheetModal>(null);
  const lgaSheetRef = useRef<BottomSheetModal>(null);
  const wardSheetRef = useRef<BottomSheetModal>(null);
  const unitSheetRef = useRef<BottomSheetModal>(null);

  const [stateQuery, setStateQuery] = useState("");
  const [lgaQuery, setLgaQuery] = useState("");
  const [wardQuery, setWardQuery] = useState("");
  const [unitQuery, setUnitQuery] = useState("");

  const statesQuery = useStatesQuery();
  const lgasQuery = useLocalGovernmentsQuery(value.pollingState);
  const wardsQuery = useWardsQuery(
    value.pollingState,
    value.localGovernmentArea
  );
  const pollingUnitsQuery = usePollingUnitsQuery(
    value.pollingState,
    value.localGovernmentArea,
    value.ward
  );

  const filteredStates = useMemo(
    () => filterOptions(statesQuery.data ?? EMPTY_OPTIONS, stateQuery),
    [statesQuery.data, stateQuery]
  );

  const filteredLgas = useMemo(
    () => filterOptions(lgasQuery.data ?? EMPTY_OPTIONS, lgaQuery),
    [lgasQuery.data, lgaQuery]
  );

  const filteredWards = useMemo(
    () => filterOptions(wardsQuery.data ?? EMPTY_OPTIONS, wardQuery),
    [wardsQuery.data, wardQuery]
  );

  const filteredUnits = useMemo(
    () => filterOptions(pollingUnitsQuery.data ?? EMPTY_OPTIONS, unitQuery),
    [pollingUnitsQuery.data, unitQuery]
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <AppText variant="title" style={styles.heading}>
            Polling Unit
          </AppText>
          <AppText style={styles.subheading}>
            Select the specific area where you will like to be monitoring
            elections happening there.
          </AppText>
        </View>

        <TutorialBanner />

        <View style={styles.form}>
          <AppSelectField
            label="Polling Unit State"
            value={value.pollingState}
            placeholder={
              statesQuery.isPending ? "Loading states..." : "Select state"
            }
            onPress={() => {
              if (statesQuery.isPending) return;
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
            placeholder={
              !value.pollingState
                ? "Select state first"
                : lgasQuery.isPending
                  ? "Loading LGAs..."
                  : "Select LGA"
            }
            onPress={() => {
              if (!value.pollingState || lgasQuery.isPending) return;
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
            placeholder={
              !value.localGovernmentArea
                ? "Select LGA first"
                : wardsQuery.isPending
                  ? "Loading wards..."
                  : "Select ward"
            }
            onPress={() => {
              if (!value.localGovernmentArea || wardsQuery.isPending) return;
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
            placeholder={
              !value.ward
                ? "Select ward first"
                : pollingUnitsQuery.isPending
                  ? "Loading polling units..."
                  : "Select polling unit"
            }
            onPress={() => {
              if (!value.ward || pollingUnitsQuery.isPending) return;
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

      <SelectPickerSheet
        ref={stateSheetRef}
        title="Select State"
        query={stateQuery}
        onChangeQuery={setStateQuery}
        selectedValue={value.pollingState}
        onSelectValue={(pollingState) =>
          onChange({
            pollingState,
            localGovernmentArea: "",
            ward: "",
            pollingUnit: "",
          })
        }
        options={filteredStates}
      />

      <SelectPickerSheet
        ref={lgaSheetRef}
        title="Select LGA"
        query={lgaQuery}
        onChangeQuery={setLgaQuery}
        selectedValue={value.localGovernmentArea}
        onSelectValue={(localGovernmentArea) =>
          onChange({
            ...value,
            localGovernmentArea,
            ward: "",
            pollingUnit: "",
          })
        }
        options={filteredLgas}
      />

      <SelectPickerSheet
        ref={wardSheetRef}
        title="Select Ward"
        query={wardQuery}
        onChangeQuery={setWardQuery}
        selectedValue={value.ward}
        onSelectValue={(ward) =>
          onChange({
            ...value,
            ward,
            pollingUnit: "",
          })
        }
        options={filteredWards}
      />

      <SelectPickerSheet
        ref={unitSheetRef}
        title="Select Polling Unit"
        query={unitQuery}
        onChangeQuery={setUnitQuery}
        selectedValue={value.pollingUnit}
        onSelectValue={(pollingUnit) =>
          onChange({
            ...value,
            pollingUnit,
          })
        }
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
    gap: 8,
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
    maxWidth: 360,
  },
  form: {
    gap: 14,
    paddingBottom: 12,
  },
});