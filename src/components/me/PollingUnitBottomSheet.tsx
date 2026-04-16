import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import {
  forwardRef,
  RefObject,
  useMemo,
  useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";

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
      stateOptions,
      lgaOptions,
      wardOptions,
      pollingUnitOptions,
    },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["70%"], []);

    const stateRef = useState<RefObject<BottomSheetModal | null>>(
      () => ({ current: null })
    )[0];
    const lgaRef = useState<RefObject<BottomSheetModal | null>>(
      () => ({ current: null })
    )[0];
    const wardRef = useState<RefObject<BottomSheetModal | null>>(
      () => ({ current: null })
    )[0];
    const puRef = useState<RefObject<BottomSheetModal | null>>(
      () => ({ current: null })
    )[0];

    const [query, setQuery] = useState("");

    const close = () => {
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
              <AppText style={styles.headerTitle}>
                Update Polling Unit
              </AppText>

              <Pressable onPress={close} style={styles.closeBtn}>
                <Ionicons
                  name="close"
                  size={22}
                  color={Theme.colors.textMuted}
                />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <AppSelectField
              label="State"
              value={value.state}
              placeholder="Select state"
              onPress={() => stateRef.current?.present()}
            />

            <AppSelectField
              label="LGA"
              value={value.lga}
              placeholder="Select state first"
              onPress={() => {
                if (!value.state) return;
                lgaRef.current?.present();
              }}
            />

            <AppSelectField
              label="Ward"
              value={value.ward}
              placeholder="Select LGA first"
              onPress={() => {
                if (!value.lga) return;
                wardRef.current?.present();
              }}
            />

            <AppSelectField
              label="Polling Unit"
              value={value.pollingUnit}
              placeholder="Select ward first"
              onPress={() => {
                if (!value.ward) return;
                puRef.current?.present();
              }}
            />

            <AppButton title="Save Changes" onPress={onSave} />
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* STACKED SELECT SHEETS */}

        <SelectPickerSheet
          ref={stateRef}
          title="Select State"
          options={stateOptions}
          query={query}
          onChangeQuery={setQuery}
          selectedValue={value.state || ""}
          onSelectValue={(state) =>
            onChange({ state, lga: "", ward: "", pollingUnit: "" })
          }
        />

        <SelectPickerSheet
          ref={lgaRef}
          title="Select LGA"
          options={lgaOptions}
          query={query}
          onChangeQuery={setQuery}
          selectedValue={value.lga || ""}
          onSelectValue={(lga) =>
            onChange({ ...value, lga, ward: "", pollingUnit: "" })
          }
        />

        <SelectPickerSheet
          ref={wardRef}
          title="Select Ward"
          options={wardOptions}
          query={query}
          onChangeQuery={setQuery}
          selectedValue={value.ward || ""}
          onSelectValue={(ward) =>
            onChange({ ...value, ward, pollingUnit: "" })
          }
        />

        <SelectPickerSheet
          ref={puRef}
          title="Select Polling Unit"
          options={pollingUnitOptions}
          query={query}
          onChangeQuery={setQuery}
          selectedValue={value.pollingUnit || ""}
          onSelectValue={(pollingUnit) =>
            onChange({ ...value, pollingUnit })
          }
        />
      </>
    );
  }
);

export default PollingUnitBottomSheet;

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

  saveButton: {
    marginVertical: 0,
  },
});