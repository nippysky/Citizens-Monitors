import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import {
  electionTypeOptions,
  ElectionFilterState,
  electionStatusPills,
  stateOptions,
} from "@/data/elections";
import { Theme } from "@/theme";

type Props = {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  value: ElectionFilterState;
  onChange: (value: ElectionFilterState) => void;
  onApply: () => void;
  onReset: () => void;
};

type ExpandKey = "status" | "types" | "state" | "";

export default function ElectionFiltersBottomSheet({
  sheetRef,
  value,
  onChange,
  onApply,
  onReset,
}: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<ExpandKey>("");

  const snapPoints = useMemo(() => ["76%"], []);

  const selectedTypeSet = useMemo(
    () => new Set(value.electionTypes),
    [value.electionTypes]
  );

  const toggleType = (type: (typeof electionTypeOptions)[number]) => {
    const next = selectedTypeSet.has(type)
      ? value.electionTypes.filter((item) => item !== type)
      : [...value.electionTypes, type];

    onChange({
      ...value,
      electionTypes: next,
    });
  };

  const toggleExpanded = (key: ExpandKey) => {
    setExpanded((prev) => (prev === key ? "" : key));
  };

  const closeSheet = () => {
    if (sheetRef.current) {
      sheetRef.current.dismiss();
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
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
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <AppText style={styles.headerTitle}>Filter Elections</AppText>

          <Pressable onPress={closeSheet} style={styles.closeBtn}>
            <Ionicons
              name="close"
              size={20}
              color={Theme.colors.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* DATE RANGE */}
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Date Range</AppText>

          <View style={styles.row}>
            <View style={styles.half}>
              <AppInput
                label="From"
                placeholder="dd/mm/yyyy"
                value={value.fromDate}
                onChangeText={(fromDate) =>
                  onChange({ ...value, fromDate })
                }
                startIcon={
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={Theme.colors.textSoft}
                  />
                }
              />
            </View>

            <View style={styles.half}>
              <AppInput
                label="To"
                placeholder="dd/mm/yyyy"
                value={value.toDate}
                onChangeText={(toDate) =>
                  onChange({ ...value, toDate })
                }
                startIcon={
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={Theme.colors.textSoft}
                  />
                }
              />
            </View>
          </View>
        </View>

        {/* STATUS */}
        <View style={styles.section}>
          <AppSelectField
            label="Election Status"
            value={value.status === "all" ? "All" : value.status}
            placeholder="Select status"
            onPress={() => toggleExpanded("status")}
          />

          {expanded === "status" && (
            <View style={styles.chipsWrap}>
              {electionStatusPills.map((status) => {
                const selected = value.status === status;

                return (
                  <Pressable
                    key={status}
                    onPress={() => onChange({ ...value, status })}
                    style={[styles.chip, selected && styles.chipActive]}
                  >
                    <AppText
                      style={[
                        styles.chipText,
                        selected && styles.chipTextActive,
                      ]}
                    >
                      {status === "all"
                        ? "All"
                        : status.charAt(0).toUpperCase() +
                          status.slice(1)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* TYPE */}
        <View style={styles.section}>
          <AppSelectField
            label="Election Type"
            value={
              value.electionTypes.length > 0
                ? `${value.electionTypes.length} selected`
                : ""
            }
            placeholder="Select election type"
            onPress={() => toggleExpanded("types")}
          />

          {expanded === "types" && (
            <View style={styles.chipsWrap}>
              {electionTypeOptions.map((type) => {
                const selected = selectedTypeSet.has(type);

                return (
                  <Pressable
                    key={type}
                    onPress={() => toggleType(type)}
                    style={[styles.chip, selected && styles.chipActive]}
                  >
                    <AppText
                      style={[
                        styles.chipText,
                        selected && styles.chipTextActive,
                      ]}
                    >
                      {type}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* STATE */}
        <View style={styles.section}>
          <AppSelectField
            label="State/Region"
            value={value.state}
            placeholder="All states"
            onPress={() => toggleExpanded("state")}
          />

          {expanded === "state" && (
            <View style={styles.listWrap}>
              {stateOptions.map((state) => {
                const selected = value.state === state;

                return (
                  <Pressable
                    key={state}
                    onPress={() => onChange({ ...value, state })}
                    style={[
                      styles.stateRow,
                      selected && styles.stateRowActive,
                    ]}
                  >
                    <AppText
                      style={[
                        styles.stateText,
                        selected && styles.stateTextActive,
                      ]}
                    >
                      {state}
                    </AppText>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={Theme.colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footerRow}>
          <Pressable
            onPress={() => {
              onReset();
              setExpanded("");
            }}
            style={styles.resetWrap}
          >
            <Ionicons name="refresh" size={18} color="#EA4335" />
            <AppText style={styles.resetText}>Reset</AppText>
          </Pressable>

          <AppButton
            title="Apply Now"
            onPress={() => {
              onApply();
              setExpanded("");
              closeSheet();
            }}
            style={styles.applyButton}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

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
    gap: 18,
  },

  header: {
    minHeight: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.body.semibold,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#DFE4EB",
    marginHorizontal: -16,
  },

  section: {
    gap: 10,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.body.semibold,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  half: {
    flex: 1,
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DDE6",
  },

  chipActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(25,183,176,0.12)",
  },

  chipText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },

  chipTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  listWrap: {
    borderWidth: 1,
    borderColor: "#D8DDE6",
    borderRadius: 16,
    overflow: "hidden",
  },

  stateRow: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF3",
  },

  stateRowActive: {
    backgroundColor: "rgba(25,183,176,0.06)",
  },

  stateText: {
    fontSize: 14,
  },

  stateTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  footerRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resetWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  resetText: {
    fontSize: 15,
    color: "#EA4335",
    fontFamily: Theme.fonts.body.semibold,
  },

  applyButton: {
    minHeight: 54,
    paddingHorizontal: 24,
  },
});