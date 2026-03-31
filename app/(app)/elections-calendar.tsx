import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ElectionCard from "@/components/elections/ElectionCard";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import CalendarDayCell from "@/components/elections/CalenderDayCell";
import EmptyElectionCalendarState from "@/components/elections/EmptyElectionCalenderState";
import { Paths } from "@/constants/paths";
import { useElections } from "@/context/ElectionsContext";
import {
  addMonths,
  electionsDummyData,
  formatMonthYear,
  getCalendarFilteredElections,
  getEmptyCalendarSubtitle,
  getHighlightedDateKeysForMonth,
  isSameDay,
  isSameMonth,
  parseDateKeyLocal,
  startOfMonth,
  toDateKeyLocal,
} from "@/data/elections";
import { Theme } from "@/theme";

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function buildCalendarMatrix(monthDate: Date): Date[][] {
  const firstDayOfMonth = startOfMonth(monthDate);
  const jsDay = firstDayOfMonth.getDay(); // Sunday = 0
  const mondayOffset = jsDay === 0 ? 6 : jsDay - 1;

  const gridStart = new Date(firstDayOfMonth);
  gridStart.setDate(firstDayOfMonth.getDate() - mondayOffset);

  const allDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });

  return Array.from({ length: 6 }, (_, rowIndex) =>
    allDays.slice(rowIndex * 7, rowIndex * 7 + 7)
  );
}

export default function ElectionsCalendarScreen() {
  const {
    scope,
    filters,
    todayKey,
    visibleCalendarMonth,
    setVisibleCalendarMonth,
    selectedCalendarDateKey,
    setSelectedCalendarDateKey,
  } = useElections();

  const today = useMemo(() => parseDateKeyLocal(todayKey), [todayKey]);

  const selectedDate = useMemo(() => {
    if (selectedCalendarDateKey) {
      return parseDateKeyLocal(selectedCalendarDateKey);
    }

    return today;
  }, [selectedCalendarDateKey, today]);

  const calendarMatrix = useMemo(
    () => buildCalendarMatrix(visibleCalendarMonth),
    [visibleCalendarMonth]
  );

  const selectedItems = useMemo(
    () =>
      getCalendarFilteredElections(
        electionsDummyData,
        scope,
        filters,
        toDateKeyLocal(selectedDate)
      ),
    [filters, scope, selectedDate]
  );

  const highlightedDateKeys = useMemo(
    () =>
      getHighlightedDateKeysForMonth(
        electionsDummyData,
        scope,
        filters,
        visibleCalendarMonth
      ),
    [visibleCalendarMonth, filters, scope]
  );

  const hasItems = selectedItems.length > 0;

  const handlePreviousMonth = (): void => {
    setVisibleCalendarMonth(addMonths(visibleCalendarMonth, -1));
  };

  const handleNextMonth = (): void => {
    setVisibleCalendarMonth(addMonths(visibleCalendarMonth, 1));
  };

  const handleSelectDate = (date: Date): void => {
    setSelectedCalendarDateKey(toDateKeyLocal(date));

    if (!isSameMonth(date, visibleCalendarMonth)) {
      setVisibleCalendarMonth(startOfMonth(date));
    }
  };

  const handleJumpToToday = (): void => {
    setSelectedCalendarDateKey(todayKey);
    setVisibleCalendarMonth(startOfMonth(today));
  };

  return (
    <AppGradientScreen>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <BackButton label="" />
            <AppText style={styles.headerTitle}>Filter by calendar</AppText>
            <View style={styles.headerSpacer} />
          </View>

          <AppText style={styles.subtext}>
            See elections held or to be held on a specific date
          </AppText>

          <View style={styles.monthNav}>
            <Pressable onPress={handlePreviousMonth} hitSlop={10}>
              <Ionicons
                name="chevron-back"
                size={22}
                color={Theme.colors.text}
              />
            </Pressable>

            <AppText style={styles.monthText}>
              {formatMonthYear(visibleCalendarMonth)}
            </AppText>

            <Pressable onPress={handleNextMonth} hitSlop={10}>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={Theme.colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {weekDays.map((day) => (
              <AppText key={day} style={styles.weekText}>
                {day}
              </AppText>
            ))}
          </View>

          <View style={styles.calendarWrap}>
            {calendarMatrix.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.calendarRow}>
                {row.map((dateItem) => {
                  const key = toDateKeyLocal(dateItem);
                  const label = String(dateItem.getDate()).padStart(2, "0");
                  const selected = isSameDay(dateItem, selectedDate);
                  const inVisibleMonth = isSameMonth(dateItem, visibleCalendarMonth);
                  const highlighted = inVisibleMonth && highlightedDateKeys.has(key);

                  return (
                    <CalendarDayCell
                      key={key}
                      label={label}
                      selected={selected}
                      highlighted={highlighted}
                      muted={!inVisibleMonth}
                      onPress={() => handleSelectDate(dateItem)}
                    />
                  );
                })}
              </View>
            ))}
          </View>

          {!isSameDay(selectedDate, today) ? (
            <Pressable onPress={handleJumpToToday} style={styles.todayPill}>
              <Ionicons
                name="time-outline"
                size={15}
                color={Theme.colors.primary}
              />
              <AppText style={styles.todayPillText}>Jump to today</AppText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.feedSection}>
          {hasItems ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsWrap}
            >
              {selectedItems.map((item) => (
                <ElectionCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(Paths.electionDetails(item.id))}
                />
              ))}

              <TabBarSpacer />
            </ScrollView>
          ) : (
            <EmptyElectionCalendarState
              title="No Election Report"
              subtitle={getEmptyCalendarSubtitle(
                toDateKeyLocal(selectedDate),
                todayKey
              )}
            />
          )}
        </View>
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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  headerSpacer: {
    width: 34,
  },

  subtext: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },

  monthText: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },

  weekText: {
    width: 40,
    textAlign: "center",
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  calendarWrap: {
    gap: 12,
  },

  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  todayPill: {
    alignSelf: "flex-start",
    marginTop: -4,
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(25,183,176,0.10)",
  },

  todayPillText: {
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  feedSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  cardsWrap: {
    gap: 14,
    paddingBottom: 16,
  },
});