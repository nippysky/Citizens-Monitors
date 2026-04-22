import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useEffect, useMemo, useRef } from "react";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ElectionCard from "@/components/elections/ElectionCard";
import ElectionFiltersBottomSheet from "@/components/elections/ElectionFiltersBottomSheet";
import ElectionStatusPill from "@/components/elections/ElectionStatusPill";
import ScreenHeader from "@/components/elections/ScreenHeader";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import TourTarget from "@/components/tour/TourTarget";
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { useElections } from "@/context/ElectionsContext";
import { useTourScrollReset } from "@/context/TourContext";
import {
  electionStatusPills,
  electionsDummyData,
  filterElections,
  formatDisplayDate,
  parseDateKeyLocal,
  startOfMonth,
} from "@/data/elections";
import { Theme } from "@/theme";

const ELECTIONS_TOUR_TARGET_IDS = ["elections.first-card"];
const FIXED_SCOPE = "polling-unit" as const;
const FIXED_HEADLINE = "Discover your polling unit elections";
const FIXED_RANGE_LABEL = "Dec 2024 - Nov 2025";

export default function ElectionsScreen() {
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const cardsScrollRef = useRef<ScrollView>(null);

  useTourScrollReset(cardsScrollRef, ELECTIONS_TOUR_TARGET_IDS);

  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeTranslateY = useRef(new Animated.Value(-6)).current;

  const {
    filters,
    setFilters,
    resetFilters,
    selectedCalendarDateKey,
    clearSelectedCalendarDateKey,
    todayKey,
    setSelectedCalendarDateKey,
    setVisibleCalendarMonth,
  } = useElections();

  const filteredItems = useMemo(() => {
    return filterElections(
      electionsDummyData,
      FIXED_SCOPE,
      filters,
      selectedCalendarDateKey
    );
  }, [filters, selectedCalendarDateKey]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(badgeOpacity, {
        toValue: selectedCalendarDateKey ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(badgeTranslateY, {
        toValue: selectedCalendarDateKey ? 0 : -6,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [badgeOpacity, badgeTranslateY, selectedCalendarDateKey]);

  const handleJumpToToday = (): void => {
    setSelectedCalendarDateKey(todayKey);
    setVisibleCalendarMonth(startOfMonth(parseDateKeyLocal(todayKey)));
  };

  return (
    <AppGradientScreen>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <ScreenHeader
            onNotifications={() => router.push(Paths.appNotifications)}
            onHelp={() => router.push(Paths.appHelpSupport)}
          />

          <View style={styles.discoverWrap}>
            <View style={styles.discoverTextBlock}>
              <AppText style={styles.discoverTitle}>{FIXED_HEADLINE}</AppText>
              <AppText style={styles.discoverSubtitle}>
                {FIXED_RANGE_LABEL}
              </AppText>
            </View>

            <View style={styles.iconRow}>
              <Pressable
                onPress={() => router.push(Paths.appElectionCalendar)}
                hitSlop={10}
                style={({ pressed }) => pressed && styles.iconPressed}
              >
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={Theme.colors.textMuted}
                />
              </Pressable>

              <Pressable
                onPress={() => filterSheetRef.current?.present()}
                hitSlop={10}
                style={({ pressed }) => pressed && styles.iconPressed}
              >
                <Ionicons
                  name="options-outline"
                  size={28}
                  color={Theme.colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          <Animated.View
            pointerEvents={selectedCalendarDateKey ? "auto" : "none"}
            style={[
              styles.activeDateWrap,
              {
                opacity: badgeOpacity,
                transform: [{ translateY: badgeTranslateY }],
                height: selectedCalendarDateKey ? undefined : 0,
              },
            ]}
          >
            {selectedCalendarDateKey ? (
              <View style={styles.activeDateRow}>
                <View style={styles.activeDatePill}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={Theme.colors.primary}
                  />
                  <AppText style={styles.activeDateText}>
                    {formatDisplayDate(selectedCalendarDateKey)}
                  </AppText>
                </View>

                <View style={styles.activeDateActions}>
                  {selectedCalendarDateKey !== todayKey ? (
                    <Pressable onPress={handleJumpToToday}>
                      <AppText style={styles.actionText}>Today</AppText>
                    </Pressable>
                  ) : null}

                  <Pressable onPress={clearSelectedCalendarDateKey}>
                    <AppText style={styles.actionText}>Clear</AppText>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {electionStatusPills.map((status) => (
              <ElectionStatusPill
                key={status}
                value={status}
                selected={filters.status === status}
                onPress={() => setFilters({ ...filters, status })}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.feedSection}>
          <ScrollView
            ref={cardsScrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardsWrap}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                const card = (
                  <ElectionCard
                    item={item}
                    onLivePress={() =>
                      router.push({
                        pathname: Paths.appCollation,
                        params: { collationId: item.id },
                      })
                    }
                    onConcludedPress={() =>
                      router.push(Paths.electionDetails(item.id))
                    }
                  />
                );

                return index === 0 ? (
                  <TourTarget key={item.id} id="elections.first-card">
                    {card}
                  </TourTarget>
                ) : (
                  <View key={item.id}>{card}</View>
                );
              })
            ) : (
              <View style={styles.emptyWrap}>
                <AppText style={styles.emptyTitle}>No elections found</AppText>
                <AppText style={styles.emptySubtitle}>
                  Try another date or choose a different status.
                </AppText>
              </View>
            )}

            <TabBarSpacer />
          </ScrollView>
        </View>

        <ElectionFiltersBottomSheet
          sheetRef={filterSheetRef}
          value={filters}
          onChange={setFilters}
          onApply={() => filterSheetRef.current?.dismiss()}
          onReset={resetFilters}
        />
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },

  discoverWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  discoverTextBlock: {
    flex: 1,
    gap: 2,
  },

  discoverTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  discoverSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconPressed: {
    opacity: 0.72,
  },

  activeDateWrap: {
    marginTop: -6,
    overflow: "hidden",
  },

  activeDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  activeDatePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "rgba(25,183,176,0.12)",
  },

  activeDateText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  activeDateActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  actionText: {
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  pillsRow: {
    gap: 12,
    paddingRight: 8,
  },

  feedSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    marginTop: 8,
  },

  cardsWrap: {
    gap: 16,
    paddingBottom: 16,
  },

  emptyWrap: {
    paddingTop: 30,
    alignItems: "center",
    gap: 8,
  },

  emptyTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  emptySubtitle: {
    maxWidth: 280,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
});