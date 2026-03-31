import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, RefObject, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MeOptionsSheet from "@/components/me/MeOptionsSheet";
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
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["70%"], []);

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
              <AppText style={styles.headerTitle}>Update Polling Unit</AppText>

              <Pressable onPress={closeSheet} hitSlop={8} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.divider} />

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

            <AppButton title="Save Changes" onPress={onSave} style={styles.saveButton} />
          </BottomSheetScrollView>
        </BottomSheetModal>

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