import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
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
  const [expanded, setExpanded] = useState<ExpandKey>("");

  const selectedTypeSet = useMemo(() => new Set(value.electionTypes), [value.electionTypes]);

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

  return (
    <AppBottomSheet ref={sheetRef} title="Filter Elections" snapPoints={["76%"]}>
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

      <View style={styles.section}>
        <AppSelectField
          label="Election Status"
          value={value.status === "all" ? "All" : value.status}
          placeholder="Select status"
          onPress={() => toggleExpanded("status")}
        />

        {expanded === "status" ? (
          <View style={styles.chipsWrap}>
            {electionStatusPills.map((status) => {
              const selected = value.status === status;

              return (
                <Pressable
                  key={status}
                  onPress={() => onChange({ ...value, status })}
                  style={[styles.chip, selected && styles.chipActive]}
                >
                  <AppText style={[styles.chipText, selected && styles.chipTextActive]}>
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

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

        {expanded === "types" ? (
          <View style={styles.chipsWrap}>
            {electionTypeOptions.map((type) => {
              const selected = selectedTypeSet.has(type);

              return (
                <Pressable
                  key={type}
                  onPress={() => toggleType(type)}
                  style={[styles.chip, selected && styles.chipActive]}
                >
                  <AppText style={[styles.chipText, selected && styles.chipTextActive]}>
                    {type}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <AppSelectField
          label="State/Region"
          value={value.state}
          placeholder="All states"
          onPress={() => toggleExpanded("state")}
        />

        {expanded === "state" ? (
          <View style={styles.listWrap}>
            {stateOptions.map((state) => {
              const selected = value.state === state;

              return (
                <Pressable
                  key={state}
                  onPress={() => onChange({ ...value, state })}
                  style={[styles.stateRow, selected && styles.stateRowActive]}
                >
                  <AppText
                    style={[styles.stateText, selected && styles.stateTextActive]}
                  >
                    {state}
                  </AppText>

                  {selected ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={Theme.colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

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
          }}
          style={styles.applyButton}
        />
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
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
    backgroundColor: "rgba(255,255,255,0.56)",
  },

  chipActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(25,183,176,0.12)",
  },

  chipText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  chipTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  listWrap: {
    borderWidth: 1,
    borderColor: "#D8DDE6",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.42)",
    overflow: "hidden",
  },

  stateRow: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF3",
  },

  stateRowActive: {
    backgroundColor: "rgba(25,183,176,0.06)",
  },

  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
  },

  stateTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  footerRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  resetWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  resetText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#EA4335",
    fontFamily: Theme.fonts.body.semibold,
  },

  applyButton: {
    marginVertical: 0,
    minHeight: 54,
    paddingHorizontal: 24,
  },
});