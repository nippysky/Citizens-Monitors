import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useEffect, useMemo, useRef } from "react";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ElectionsHeader from "@/components/elections/ElectionsHeader";
import ElectionCard from "@/components/elections/ElectionCard";
import ElectionFiltersBottomSheet from "@/components/elections/ElectionFiltersBottomSheet";
import ElectionStatusPill from "@/components/elections/ElectionStatusPill";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { useElections } from "@/context/ElectionsContext";
import {
  electionStatusPills,
  electionsDummyData,
  filterElections,
  formatDisplayDate,
  parseDateKeyLocal,
  getElectionDateRangeLabel,
  getElectionHeadline,
  startOfMonth,
} from "@/data/elections";
import { Theme } from "@/theme";
import ElectionScopeTabs from "@/components/elections/ElectionScopeTab";

export default function ElectionsScreen() {
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeTranslateY = useRef(new Animated.Value(-6)).current;

  const {
    scope,
    setScope,
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
      scope,
      filters,
      selectedCalendarDateKey
    );
  }, [filters, scope, selectedCalendarDateKey]);

  const headline = useMemo(() => getElectionHeadline(scope), [scope]);
  const rangeLabel = useMemo(() => getElectionDateRangeLabel(scope), [scope]);

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
          <ElectionsHeader
            onNotifications={() => router.push(Paths.appNotifications)}
          />

          <ElectionScopeTabs value={scope} onChange={setScope} />

          <View style={styles.discoverWrap}>
            <View style={styles.discoverTextBlock}>
              <AppText style={styles.discoverTitle}>{headline}</AppText>
              <AppText style={styles.discoverSubtitle}>{rangeLabel}</AppText>
            </View>

            <View style={styles.iconRow}>
              <Pressable onPress={() => router.push(Paths.appElectionCalendar)}>
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={Theme.colors.textMuted}
                />
              </Pressable>

              <Pressable onPress={() => filterSheetRef.current?.present()}>
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

          {scope === "all-elections" ? (
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
          ) : null}
        </View>

        <View style={styles.feedSection}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardsWrap}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ElectionCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(Paths.electionDetails(item.id))}
                />
              ))
            ) : (
              <View style={styles.emptyWrap}>
                <AppText style={styles.emptyTitle}>No elections found</AppText>
                <AppText style={styles.emptySubtitle}>
                  Adjust your filters or try another calendar date.
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