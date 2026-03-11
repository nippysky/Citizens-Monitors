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

type WorldCountryName = {
  common: string;
};

type WorldCountry = {
  cca2: string;
  name: WorldCountryName;
};

type Props = {
  query: string;
  onChangeQuery: (value: string) => void;
  selectedCountry: string;
  onSelectCountry: (value: string) => void;
};

function flagFromCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char: string) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

const typedCountries = countries as WorldCountry[];

const countryData: CountryItem[] = typedCountries
  .map((country: WorldCountry) => ({
    name: country.name.common,
    code: country.cca2,
    flag: flagFromCode(country.cca2),
  }))
  .sort((a: CountryItem, b: CountryItem) => a.name.localeCompare(b.name));

const NationalitySheet = forwardRef<BottomSheetModal, Props>(
  function NationalitySheet(
    { query, onChangeQuery, selectedCountry, onSelectCountry },
    ref
  ) {
    const insets = useSafeAreaInsets();

    const filteredCountries = useMemo<CountryItem[]>(() => {
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) {
        return countryData;
      }

      return countryData.filter((country: CountryItem) =>
        country.name.toLowerCase().includes(normalizedQuery)
      );
    }, [query]);

    const dismiss = (): void => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleSelectCountry = (countryName: string): void => {
      onSelectCountry(countryName);
      dismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={["84%"]}
        topInset={insets.top + 12}
        enablePanDownToClose
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
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <AppText variant="title" style={styles.title}>
                Nationality
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

          <View style={styles.staticTop}>
            <View style={styles.tipBox}>
              <AppText style={styles.tipText}>
                Your nationality is your legal country.
              </AppText>
            </View>

            <AppInput
              placeholder="Enter Country Name"
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
            <BottomSheetFlatList<CountryItem>
              data={filteredCountries}
              keyExtractor={(item: CountryItem) => item.code}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
              renderItem={({ item }: { item: CountryItem }) => {
                const selected = selectedCountry === item.name;

                return (
                  <Pressable
                    style={[
                      styles.countryRow,
                      selected && styles.countryRowSelected,
                    ]}
                    onPress={() => handleSelectCountry(item.name)}
                  >
                    <AppText style={styles.flag}>{item.flag}</AppText>

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
                    No country found for your search.
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
    minHeight: 76,
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
    paddingBottom: 14,
    gap: 16,
  },

  tipBox: {
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  tipText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },

  listWrap: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
  },

  countryRow: {
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#D9DEE8",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
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
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});