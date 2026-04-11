import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";

import {
  electionTypeOptions,
  ElectionFilterState,
  electionStatusPills,
  stateOptions,
  ElectionStatus,
  ElectionType,
} from "@/data/elections";
import { Theme } from "@/theme";
import SelectPickerSheet from "../ui/sheets/SelectPickerSheet";

type Props = {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  value: ElectionFilterState;
  onChange: (value: ElectionFilterState) => void;
  onApply: () => void;
  onReset: () => void;
};

function statusLabel(s: ElectionStatus | "all"): string {
  if (s === "all") return "All";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ElectionFiltersBottomSheet({
  sheetRef,
  value,
  onChange,
  onApply,
  onReset,
}: Props) {
  const insets = useSafeAreaInsets();
  const stateSheetRef = useRef<BottomSheetModal>(null);
  const [stateQuery, setStateQuery] = useState("");

  const snapPoints = useMemo(() => ["72%"], []);

  const selectedTypeSet = useMemo(
    () => new Set(value.electionTypes),
    [value.electionTypes]
  );

  const toggleType = (type: ElectionType) => {
    const next = selectedTypeSet.has(type)
      ? value.electionTypes.filter((t) => t !== type)
      : [...value.electionTypes, type];
    onChange({ ...value, electionTypes: next });
  };

  const closeSheet = () => {
    sheetRef.current?.dismiss();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.32}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        topInset={insets.top + 12}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
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
          {/* ── Header ── */}
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Filter Elections</AppText>
            <Pressable onPress={closeSheet} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* ── Date Range ── */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Date Range</AppText>
            <View style={styles.row}>
              <View style={styles.half}>
                <AppInput
                  label="From"
                  placeholder="dd/mm/yyyy"
                  value={value.fromDate}
                  onChangeText={(fromDate) => onChange({ ...value, fromDate })}
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
                  onChangeText={(toDate) => onChange({ ...value, toDate })}
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

          {/* ── Election Status (pills) ── */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Election Status</AppText>
            <View style={styles.pillsWrap}>
              {electionStatusPills.map((status) => {
                const selected = value.status === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => onChange({ ...value, status })}
                    style={[styles.pill, selected && styles.pillActive]}
                  >
                    <AppText
                      style={[
                        styles.pillText,
                        selected && styles.pillTextActive,
                      ]}
                    >
                      {statusLabel(status)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── Election Type (pills, multi-select) ── */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Election Type</AppText>
            <View style={styles.pillsWrap}>
              {electionTypeOptions.map((type) => {
                const selected = selectedTypeSet.has(type);
                return (
                  <Pressable
                    key={type}
                    onPress={() => toggleType(type)}
                    style={[styles.pill, selected && styles.pillActive]}
                  >
                    <AppText
                      style={[
                        styles.pillText,
                        selected && styles.pillTextActive,
                      ]}
                    >
                      {type}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── State / Region (select picker sheet) ── */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>State/Region</AppText>
            <Pressable
              style={styles.selectField}
              onPress={() => stateSheetRef.current?.present()}
            >
              <AppText
                style={[
                  styles.selectFieldText,
                  !value.state || value.state === "All states"
                    ? styles.selectFieldPlaceholder
                    : null,
                ]}
              >
                {value.state && value.state !== "All states"
                  ? value.state
                  : "All states"}
              </AppText>
              <Ionicons
                name="chevron-down"
                size={18}
                color={Theme.colors.textMuted}
              />
            </Pressable>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footerRow}>
            <Pressable
              onPress={() => onReset()}
              style={styles.resetWrap}
            >
              <Ionicons name="refresh" size={18} color="#EA4335" />
              <AppText style={styles.resetText}>Reset</AppText>
            </Pressable>

            <AppButton
              title="Apply Now"
              onPress={() => {
                onApply();
                closeSheet();
              }}
              style={styles.applyButton}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* State picker sheet */}
      <SelectPickerSheet
        ref={stateSheetRef}
        title="State/Region"
        options={stateOptions}
        query={stateQuery}
        onChangeQuery={setStateQuery}
        selectedValue={value.state || "All states"}
        onSelectValue={(state) => onChange({ ...value, state })}
      />
    </>
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
    gap: 20,
  },
  header: {
    minHeight: 56,
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
    color: Theme.colors.text,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  half: {
    flex: 1,
  },

  // ── Pills ──
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DDE6",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  pillActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(25,183,176,0.12)",
  },
  pillText: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  pillTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  // ── Select field ──
  selectField: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DDE6",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectFieldText: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
  },
  selectFieldPlaceholder: {
    color: Theme.colors.textSoft,
  },

  // ── Footer ──
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