import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, RefObject } from "react";
import { StyleSheet, View } from "react-native";

import MeOptionsSheet from "@/components/me/MeOptionsSheet";
import AppBottomSheet from "@/components/ui/AppBottomSheet";
import AppButton from "@/components/ui/AppButton";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type PollingUnitFormState = {
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
};

type Props = {
  value: PollingUnitFormState;
  onChange: (value: PollingUnitFormState) => void;
  onSave: () => void;
  stateSheetRef: RefObject<BottomSheetModal | null>;
  lgaSheetRef: RefObject<BottomSheetModal | null>;
  wardSheetRef: RefObject<BottomSheetModal | null>;
  pollingUnitSheetRef: RefObject<BottomSheetModal | null>;
  stateOptions: string[];
  lgaOptions: string[];
  wardOptions: string[];
  pollingUnitOptions: string[];
};

const PollingUnitBottomSheet = forwardRef<BottomSheetModal, Props>(
  function PollingUnitBottomSheet(
    {
      value,
      onChange,
      onSave,
      stateSheetRef,
      lgaSheetRef,
      wardSheetRef,
      pollingUnitSheetRef,
      stateOptions,
      lgaOptions,
      wardOptions,
      pollingUnitOptions,
    },
    ref
  ) {
    return (
      <>
        <AppBottomSheet ref={ref} title="Update Polling Unit" snapPoints={["70%"]}>
          <View style={styles.noteBox}>
            <Ionicons
              name="information-circle"
              size={18}
              color={Theme.colors.primary}
            />
            <AppText style={styles.noteText}>
              Note You can only change your polling unit 3 times max.
            </AppText>
          </View>

          <AppSelectField
            label="Polling Unit State"
            value={value.state}
            placeholder="Select state"
            onPress={() => stateSheetRef.current?.present()}
          />

          <AppSelectField
            label="Local Government Area"
            value={value.lga}
            placeholder="Select state first"
            onPress={() => {
              if (!value.state) return;
              lgaSheetRef.current?.present();
            }}
          />

          <AppSelectField
            label="Ward"
            value={value.ward}
            placeholder="Select LGA first"
            onPress={() => {
              if (!value.lga) return;
              wardSheetRef.current?.present();
            }}
          />

          <AppSelectField
            label="Polling Unit"
            value={value.pollingUnit}
            placeholder="Select ward first"
            onPress={() => {
              if (!value.ward) return;
              pollingUnitSheetRef.current?.present();
            }}
          />

          <AppButton title="Save Changes" onPress={onSave} />
        </AppBottomSheet>

        <MeOptionsSheet
          ref={stateSheetRef}
          title="Select State"
          options={stateOptions}
          selectedValue={value.state}
          onSelect={(selected) =>
            onChange({
              state: selected,
              lga: "",
              ward: "",
              pollingUnit: "",
            })
          }
        />

        <MeOptionsSheet
          ref={lgaSheetRef}
          title="Select LGA"
          options={lgaOptions}
          selectedValue={value.lga}
          onSelect={(selected) =>
            onChange({
              ...value,
              lga: selected,
              ward: "",
              pollingUnit: "",
            })
          }
        />

        <MeOptionsSheet
          ref={wardSheetRef}
          title="Select Ward"
          options={wardOptions}
          selectedValue={value.ward}
          onSelect={(selected) =>
            onChange({
              ...value,
              ward: selected,
              pollingUnit: "",
            })
          }
        />

        <MeOptionsSheet
          ref={pollingUnitSheetRef}
          title="Select Polling Unit"
          options={pollingUnitOptions}
          selectedValue={value.pollingUnit}
          onSelect={(selected) =>
            onChange({
              ...value,
              pollingUnit: selected,
            })
          }
        />
      </>
    );
  }
);

export default PollingUnitBottomSheet;

const styles = StyleSheet.create({
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    backgroundColor: "rgba(5,163,156,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
});