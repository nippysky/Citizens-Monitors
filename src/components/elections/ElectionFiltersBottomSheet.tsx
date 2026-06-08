import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo } from "react";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import {
  electionStatusPills,
  electionTypeOptions,
  ElectionFilterState,
  ElectionStatusFilter,
  ElectionType,
  getElectionTypeLabel,
} from "@/data/elections";
import { Theme } from "@/theme";

type Props = {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  value: ElectionFilterState;
  onChange: (value: ElectionFilterState) => void;
  onApply: () => void;
  onReset: () => void;
};

function statusLabel(status: ElectionStatusFilter): string {
  if (status === "all") return "All";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function ElectionFiltersBottomSheet({
  sheetRef,
  value,
  onChange,
  onApply,
  onReset,
}: Props) {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["76%"], []);
  const { handleSheetChange } = useBottomSheetBackHandler(sheetRef);

  const selectedTypeSet = useMemo(
    () => new Set(value.electionTypes),
    [value.electionTypes]
  );

  const toggleType = (type: ElectionType) => {
    const next = selectedTypeSet.has(type)
      ? value.electionTypes.filter((item) => item !== type)
      : [...value.electionTypes, type];

    onChange({ ...value, electionTypes: next });
  };

  const closeSheet = () => {
    sheetRef.current?.dismiss();
  };

  const handleApply = () => {
    onApply();
    closeSheet();
  };

  const handleReset = () => {
    onReset();
  };

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
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
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose
      enableDynamicSizing={false}
      topInset={insets.top + 12}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onChange={handleSheetChange}
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
        <View style={styles.header}>
          <View>
            <AppText style={styles.headerTitle}>Filter Elections</AppText>
            <AppText style={styles.headerSubtitle}>
              Refine election results by date, status, and type.
            </AppText>
          </View>

          <Pressable onPress={closeSheet} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Date Range</AppText>
          <AppText style={styles.sectionHint}>
            Use DD/MM/YYYY or YYYY-MM-DD.
          </AppText>

          <View style={styles.row}>
            <View style={styles.half}>
              <AppInput
                label="From"
                placeholder="01/05/2026"
                value={value.fromDate}
                onChangeText={(fromDate) => onChange({ ...value, fromDate })}
                autoCapitalize="none"
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
                placeholder="31/05/2026"
                value={value.toDate}
                onChangeText={(toDate) => onChange({ ...value, toDate })}
                autoCapitalize="none"
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

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Status</AppText>

          <View style={styles.pillGrid}>
            {electionStatusPills.map((status) => {
              const active = value.status === status;

              return (
                <Pressable
                  key={status}
                  onPress={() => onChange({ ...value, status })}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                >
                  <AppText
                    style={[
                      styles.filterPillText,
                      active && styles.filterPillTextActive,
                    ]}
                  >
                    {statusLabel(status)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Election Type</AppText>

          <View style={styles.pillGrid}>
            {electionTypeOptions.map((type) => {
              const active = selectedTypeSet.has(type);

              return (
                <Pressable
                  key={type}
                  onPress={() => toggleType(type)}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                >
                  <AppText
                    style={[
                      styles.filterPillText,
                      active && styles.filterPillTextActive,
                    ]}
                  >
                    {getElectionTypeLabel(type)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={handleReset} style={styles.resetButton}>
            <AppText style={styles.resetText}>Reset</AppText>
          </Pressable>

          <View style={styles.applyWrap}>
            <AppButton
              title="Apply Filters"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </View>
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
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  headerSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    marginTop: 2,
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

  section: {
    gap: 10,
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  sectionHint: {
    marginTop: -5,
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  half: {
    flex: 1,
  },

  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  filterPill: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#D8DDE6",
    backgroundColor: "rgba(255,255,255,0.58)",
    alignItems: "center",
    justifyContent: "center",
  },

  filterPillActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(25,183,176,0.12)",
  },

  filterPillText: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  filterPillTextActive: {
    color: Theme.colors.primary,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 4,
  },

  resetButton: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#D8DDE6",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  resetText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  applyWrap: {
    flex: 1,
  },

  applyButton: {
    marginVertical: 0,
  },
});