import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { forwardRef, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";
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
  stateOptions: string[];
  lgaOptions: string[];
  wardOptions: string[];
  pollingUnitOptions: string[];
  saving?: boolean;
  isElectionLive?: boolean;
};

function filterOptions(options: string[], query: string): string[] {
  const cleanQuery = query.trim().toLowerCase();

  if (!cleanQuery) return options;

  return options.filter((item) => item.toLowerCase().includes(cleanQuery));
}

function hasValue(value?: string): boolean {
  return Boolean(value?.trim());
}

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
      saving = false,
      isElectionLive = false,
    },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["88%"], []);
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );

    const stateSheetRef = useRef<BottomSheetModal>(null);
    const lgaSheetRef = useRef<BottomSheetModal>(null);
    const wardSheetRef = useRef<BottomSheetModal>(null);
    const pollingUnitSheetRef = useRef<BottomSheetModal>(null);

    const [stateQuery, setStateQuery] = useState("");
    const [lgaQuery, setLgaQuery] = useState("");
    const [wardQuery, setWardQuery] = useState("");
    const [pollingUnitQuery, setPollingUnitQuery] = useState("");

    const filteredStates = useMemo(
      () => filterOptions(stateOptions, stateQuery),
      [stateOptions, stateQuery]
    );

    const filteredLgas = useMemo(
      () => filterOptions(lgaOptions, lgaQuery),
      [lgaOptions, lgaQuery]
    );

    const filteredWards = useMemo(
      () => filterOptions(wardOptions, wardQuery),
      [wardOptions, wardQuery]
    );

    const filteredPollingUnits = useMemo(
      () => filterOptions(pollingUnitOptions, pollingUnitQuery),
      [pollingUnitOptions, pollingUnitQuery]
    );

    const canSave =
      !isElectionLive &&
      !saving &&
      hasValue(value.state) &&
      hasValue(value.lga) &&
      hasValue(value.ward) &&
      hasValue(value.pollingUnit);

    const close = (): void => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const openStateSheet = (): void => {
      if (isElectionLive) return;

      setStateQuery("");
      stateSheetRef.current?.present();
    };

    const openLgaSheet = (): void => {
      if (isElectionLive || !value.state) return;

      setLgaQuery("");
      lgaSheetRef.current?.present();
    };

    const openWardSheet = (): void => {
      if (isElectionLive || !value.lga) return;

      setWardQuery("");
      wardSheetRef.current?.present();
    };

    const openPollingUnitSheet = (): void => {
      if (isElectionLive || !value.ward) return;

      setPollingUnitQuery("");
      pollingUnitSheetRef.current?.present();
    };

    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={snapPoints}
          index={0}
          enablePanDownToClose
          enableDynamicSizing={false}
          topInset={insets.top + 12}
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          onChange={handleSheetChange}
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
              <View style={styles.headerTextWrap}>
                <AppText style={styles.headerTitle}>My Polling Unit</AppText>
                <AppText style={styles.headerSubtitle}>
                  Update your assigned polling unit details.
                </AppText>
              </View>

              <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
                <Ionicons
                  name="close"
                  size={22}
                  color={Theme.colors.textMuted}
                />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View
              style={[styles.noteBox, isElectionLive && styles.noteBoxLocked]}
            >
              <Ionicons
                name={
                  isElectionLive
                    ? "lock-closed-outline"
                    : "information-circle-outline"
                }
                size={20}
                color={isElectionLive ? "#EE7A34" : Theme.colors.primary}
                style={styles.noteIcon}
              />

              <AppText style={styles.noteText}>
                {isElectionLive
                  ? "Polling unit changes are temporarily locked because an election is currently live."
                  : "You can update your polling unit when no election is live. Changes may affect your local feed, reports, and election activity."}
              </AppText>
            </View>

            <View style={styles.form}>
              <AppSelectField
                label="State"
                value={value.state}
                placeholder="Select state"
                onPress={openStateSheet}
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
                value={value.lga}
                placeholder={value.state ? "Select LGA" : "Select state first"}
                onPress={openLgaSheet}
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
                placeholder={value.lga ? "Select ward" : "Select LGA first"}
                onPress={openWardSheet}
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
                  value.ward ? "Select polling unit" : "Select ward first"
                }
                onPress={openPollingUnitSheet}
                leftIcon={
                  <MaterialCommunityIcons
                    name="map-outline"
                    size={20}
                    color={Theme.colors.textSoft}
                  />
                }
              />
            </View>

            <AppButton
              title={
                isElectionLive
                  ? "Changes Locked During Live Election"
                  : "Save Changes"
              }
              onPress={onSave}
              loading={saving}
              disabled={!canSave}
              style={styles.saveButton}
            />
          </BottomSheetScrollView>
        </BottomSheetModal>

        <SelectPickerSheet
          ref={stateSheetRef}
          title="Select State"
          options={filteredStates}
          query={stateQuery}
          onChangeQuery={setStateQuery}
          selectedValue={value.state}
          onSelectValue={(state) =>
            onChange({
              state,
              lga: "",
              ward: "",
              pollingUnit: "",
            })
          }
        />

        <SelectPickerSheet
          ref={lgaSheetRef}
          title="Select LGA"
          options={filteredLgas}
          query={lgaQuery}
          onChangeQuery={setLgaQuery}
          selectedValue={value.lga}
          onSelectValue={(lga) =>
            onChange({
              ...value,
              lga,
              ward: "",
              pollingUnit: "",
            })
          }
        />

        <SelectPickerSheet
          ref={wardSheetRef}
          title="Select Ward"
          options={filteredWards}
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
        />

        <SelectPickerSheet
          ref={pollingUnitSheetRef}
          title="Select Polling Unit"
          options={filteredPollingUnits}
          query={pollingUnitQuery}
          onChangeQuery={setPollingUnitQuery}
          selectedValue={value.pollingUnit}
          onSelectValue={(pollingUnit) =>
            onChange({
              ...value,
              pollingUnit,
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
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
    gap: 3,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
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
    borderRadius: 16,
    backgroundColor: "rgba(5,163,156,0.10)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  noteBoxLocked: {
    backgroundColor: "rgba(238,122,52,0.10)",
    borderColor: "rgba(238,122,52,0.18)",
  },
  noteIcon: {
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  form: {
    gap: 14,
  },
  saveButton: {
    marginVertical: 0,
  },
});