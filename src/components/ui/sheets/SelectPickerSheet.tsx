import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import countries from "world-countries";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";

import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type CountryItem = {
  id: string;
  name: string;
  code: string;
  flag: string;
};

type WorldCountry = {
  cca2: string;
  name: { common: string };
};

type Props = {
  title?: string;
  query: string;
  onChangeQuery: (value: string) => void;
  selectedValue: string;
  onSelectValue: (value: string) => void;
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
  .map((country) => ({
    id: `country-${country.cca2}`,
    name: country.name.common,
    code: country.cca2,
    flag: flagFromCode(country.cca2),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function buildCustomOptionItems(options: string[]): CountryItem[] {
  const seen = new Map<string, number>();

  return options
    .map((option) => option.trim())
    .filter(Boolean)
    .map((option, index) => {
      const count = seen.get(option) ?? 0;
      seen.set(option, count + 1);

      return {
        id: `option-${index}-${count}-${option}`,
        name: option,
        code: option,
        flag: "",
      };
    });
}

const SelectPickerSheet = forwardRef<BottomSheetModal, Props>(
  function SelectPickerSheet(
    {
      title = "Nationality",
      query,
      onChangeQuery,
      selectedValue,
      onSelectValue,
      options,
    },
    ref
  ) {
    const insets = useSafeAreaInsets();
    // Open at 92% immediately so the search box is never hidden by the keyboard
    const snapPoints = useMemo(() => ["92%"], []);
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );

    const listData = useMemo(() => {
      const q = normalizeSearch(query);

      if (options) {
        const customOptions = buildCustomOptionItems(options);

        if (!q) return customOptions;

        return customOptions.filter((item) =>
          item.name.toLowerCase().includes(q)
        );
      }

      if (!q) return countryData;

      return countryData.filter((item) =>
        item.name.toLowerCase().includes(q)
      );
    }, [options, query]);

    const dismiss = useCallback(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.32}
        />
      ),
      []
    );

    const renderItem = useCallback(
      ({ item }: { item: CountryItem }) => {
        const selected = selectedValue === item.name;

        return (
          <Pressable
            style={[styles.row, selected && styles.rowSelected]}
            onPress={() => {
              onSelectValue(item.name);
              dismiss();
            }}
          >
            {item.flag ? (
              <AppText style={styles.flag}>{item.flag}</AppText>
            ) : null}

            <AppText
              style={[styles.rowName, selected && styles.rowNameActive]}
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
      },
      [selectedValue, onSelectValue, dismiss]
    );

    const keyExtractor = useCallback((item: CountryItem) => item.id, []);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        index={0}
        stackBehavior="push"
        enableDynamicSizing={false}
        topInset={insets.top + 12}
        enablePanDownToClose
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        onChange={handleSheetChange}
        backgroundStyle={styles.sheetBgTransparent}
        handleIndicatorStyle={styles.sheetHandle}
        backdropComponent={renderBackdrop}
      >
        <View style={styles.sheetWrap}>
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
              <Ionicons
                name="close"
                size={22}
                color={Theme.colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.searchWrap}>
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

          <View style={styles.listWrap}>
            <BottomSheetFlatList
              data={listData}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: Math.max(insets.bottom, 24) },
              ]}
              renderItem={renderItem}
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

export default SelectPickerSheet;

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
  searchWrap: {
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
  row: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#D9DEE8",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
    backgroundColor: "transparent",
  },
  rowSelected: {
    backgroundColor: "rgba(25, 183, 176, 0.04)",
  },
  flag: {
    fontSize: 22,
    lineHeight: 28,
  },
  rowName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
  },
  rowNameActive: {
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