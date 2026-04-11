import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import countries from "world-countries";

import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type CountryItem = {
  name: string;
  code: string;
  flag: string;
};

type WorldCountry = {
  cca2: string;
  name: { common: string };
};

type Props = {
  // Optional title — defaults to "Nationality"
  title?: string;
  query: string;
  onChangeQuery: (value: string) => void;
  selectedCountry: string;
  onSelectCountry: (value: string) => void;
  // If provided, renders these options instead of the full country list.
  // Used by polling unit sheets.
  options?: string[];
};

function flagFromCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

const typedCountries = countries as WorldCountry[];

const countryData: CountryItem[] = typedCountries
  .map((c) => ({
    name: c.name.common,
    code: c.cca2,
    flag: flagFromCode(c.cca2),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const NationalitySheet = forwardRef<BottomSheetModal, Props>(
  function NationalitySheet(
    { title = "Nationality", query, onChangeQuery, selectedCountry, onSelectCountry, options },
    ref
  ) {
    const insets = useSafeAreaInsets();

    // If custom options provided (polling unit mode), wrap them as simple items
    const listData = useMemo(() => {
      if (options) {
        return options.map((o) => ({ name: o, code: o, flag: "" }));
      }

      const q = query.trim().toLowerCase();
      if (!q) return countryData;
      return countryData.filter((c) => c.name.toLowerCase().includes(q));
    }, [options, query]);

    const dismiss = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        // Two snap points — full and mid.
        // Sheet won't collapse to a tiny size when keyboard appears.
        snapPoints={["60%", "92%"]}
        topInset={insets.top + 12}
        enablePanDownToClose
        // ← Keyboard fix: sheet extends upward when keyboard shows
        // instead of snapping to a lower point
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={styles.sheetBgTransparent}
        handleIndicatorStyle={styles.sheetHandle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
          />
        )}
      >
        <View style={styles.sheetWrap}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <AppText variant="title" style={styles.title}>
                {title}
              </AppText>
              <Ionicons
                name="help-circle"
                size={18}
                color={Theme.colors.textMuted}
              />
            </View>
            <Pressable onPress={dismiss} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Search input */}
          <View style={styles.staticTop}>
            <AppInput
              placeholder={options ? "Search…" : "Enter Country Name"}
              value={query}
              onChangeText={onChangeQuery}
              startIcon={
                <Ionicons
                  name="search-outline"
                  size={22}
                  color={Theme.colors.textSoft}
                />
              }
            />
          </View>

          {/* List */}
          <View style={styles.listWrap}>
            <BottomSheetFlatList
              data={listData}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              // ← Critical: keeps keyboard open when tapping a list item
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: Math.max(insets.bottom, 24) },
              ]}
              renderItem={({ item }) => {
                const selected = selectedCountry === item.name;
                return (
                  <Pressable
                    style={[
                      styles.countryRow,
                      selected && styles.countryRowSelected,
                    ]}
                    onPress={() => {
                      onSelectCountry(item.name);
                      dismiss();
                    }}
                  >
                    {item.flag ? (
                      <AppText style={styles.flag}>{item.flag}</AppText>
                    ) : null}

                    <AppText
                      style={[
                        styles.countryName,
                        selected && styles.countryNameActive,
                      ]}
                    >
                      {item.name}
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
              }}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <AppText style={styles.emptyText}>
                    No results found.
                  </AppText>
                </View>
              }
            />
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

export default NationalitySheet;

const styles = StyleSheet.create({
  sheetBgTransparent: {
    backgroundColor: "transparent",
  },
  sheetHandle: {
    backgroundColor: "rgba(17, 26, 50, 0.12)",
    width: 44,
  },
  sheetWrap: {
    flex: 1,
    backgroundColor: "#FBF8EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#D9DEE8",
  },
  staticTop: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  countryRow: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#D9DEE8",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
    backgroundColor: "transparent",
  },
  countryRowSelected: {
    backgroundColor: "rgba(25, 183, 176, 0.04)",
  },
  flag: {
    fontSize: 22,
    lineHeight: 28,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
  },
  countryNameActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  emptyWrap: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});