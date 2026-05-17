import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useMemo } from "react";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ElectionCard from "@/components/elections/ElectionCard";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { Paths } from "@/constants/paths";
import { useElections } from "@/context/ElectionsContext";
import {
  addMonths,
  buildMonthMatrix,
  ElectionItem,
  filterElections,
  formatDisplayDate,
  isElectionActiveOnDate,
  mapApiElectionToItem,
  sortElectionsForDisplay,
  toMonthTitle,
} from "@/data/elections";
import { useActiveElectionsQuery } from "@/hooks/api/useElectionQueries";
import { ActiveElectionApiItem } from "@/lib/api/elections.api";
import NoElection from "@/svgs/app/NoElection";
import { Theme } from "@/theme";
import CalendarDayCell from "@/components/elections/CalenderDayCell";

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function CalendarSkeleton() {
  return (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 42 }).map((_, index) => (
        <View key={`calendar-skeleton-${index}`} style={styles.skeletonCell} />
      ))}
    </View>
  );
}

function EmptySelectedDay({
  selectedLabel,
  onClear,
}: {
  selectedLabel: string;
  onClear: () => void;
}) {
  return (
    <View style={styles.emptyWrap}>
      <NoElection />

      <AppText style={styles.emptyTitle}>No election on {selectedLabel}</AppText>
      <AppText style={styles.emptyText}>
        Select another highlighted date to see monitored elections.
      </AppText>
      <Pressable onPress={onClear} style={styles.clearDateButton}>
        <AppText style={styles.clearDateText}>Clear selected date</AppText>
      </Pressable>
    </View>
  );
}

export default function ElectionsCalendarScreen() {
  const {
    filters,
    selectedCalendarDateKey,
    setSelectedCalendarDateKey,
    clearSelectedCalendarDateKey,
    visibleCalendarMonth,
    setVisibleCalendarMonth,
    todayKey,
  } = useElections();

  const electionsQuery = useActiveElectionsQuery("all");

  const elections = useMemo<ElectionItem[]>(() => {
    const items: ActiveElectionApiItem[] = electionsQuery.data?.elections ?? [];

    return sortElectionsForDisplay(items.map(mapApiElectionToItem));
  }, [electionsQuery.data]);

  const calendarCells = useMemo(
    () => buildMonthMatrix(visibleCalendarMonth),
    [visibleCalendarMonth]
  );

  const selectedKey = selectedCalendarDateKey ?? todayKey;
  const selectedLabel = formatDisplayDate(selectedKey);

  const selectedDayElections = useMemo(
    () =>
      filterElections(
        elections,
        "polling-unit",
        { ...filters, status: "all" },
        selectedKey
      ),
    [elections, filters, selectedKey]
  );

  const highlightedKeys = useMemo(() => {
    const keys = new Set<string>();

    for (const cell of calendarCells) {
      const hasElection = elections.some((election) =>
        isElectionActiveOnDate(election, cell.key)
      );

      if (hasElection) {
        keys.add(cell.key);
      }
    }

    return keys;
  }, [calendarCells, elections]);

  const handleOpenCollation = (item: ElectionItem) => {
    router.push({
      pathname: Paths.appCollation as never,
      params: {
        tab: "overview",
        collationId: item.activeElectionId,
        activeElectionId: item.activeElectionId,
        electionId: item.activeElectionId,
      },
    });
  };

  const handleOpenDetails = (item: ElectionItem) => {
    router.push(Paths.electionDetails(item.id));
  };

  const renderElection = ({ item }: { item: ElectionItem }) => (
    <ElectionCard
      item={item}
      onLivePress={() => handleOpenCollation(item)}
      onConcludedPress={() => handleOpenDetails(item)}
      onUpcomingPress={() => handleOpenDetails(item)}
    />
  );

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.backWrap}>
              <BackButton label="" />
            </View>

            <View style={styles.titleWrap}>
              <AppText style={styles.headerTitle}>Election Calendar</AppText>
            </View>

            <View style={styles.sideSpacer} />
          </View>

          <View style={styles.monthRow}>
            <Pressable
              onPress={() =>
                setVisibleCalendarMonth(addMonths(visibleCalendarMonth, -1))
              }
              style={styles.monthButton}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={Theme.colors.text}
              />
            </Pressable>

            <AppText style={styles.monthTitle}>
              {toMonthTitle(visibleCalendarMonth)}
            </AppText>

            <Pressable
              onPress={() =>
                setVisibleCalendarMonth(addMonths(visibleCalendarMonth, 1))
              }
              style={styles.monthButton}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
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

          {electionsQuery.isLoading ? (
            <CalendarSkeleton />
          ) : (
            <View style={styles.calendarGrid}>
              {calendarCells.map((cell) => (
                <CalendarDayCell
                  key={cell.key}
                  label={cell.label}
                  muted={cell.muted}
                  selected={cell.key === selectedKey}
                  highlighted={highlightedKeys.has(cell.key)}
                  onPress={() => setSelectedCalendarDateKey(cell.key)}
                />
              ))}
            </View>
          )}

          <View style={styles.selectedDateRow}>
            <View>
              <AppText style={styles.selectedDateLabel}>Selected date</AppText>
              <AppText style={styles.selectedDateValue}>{selectedLabel}</AppText>
            </View>

            <Pressable
              onPress={() => setSelectedCalendarDateKey(todayKey)}
              style={styles.todayButton}
            >
              <AppText style={styles.todayText}>Today</AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          <FlatList
            data={selectedDayElections}
            keyExtractor={(item) => item.id}
            renderItem={renderElection}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              selectedDayElections.length === 0 && styles.listContentEmpty,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={electionsQuery.isRefetching}
                onRefresh={() => {
                  void electionsQuery.refetch();
                }}
                tintColor={Theme.colors.primary}
                colors={[Theme.colors.primary]}
              />
            }
            ListEmptyComponent={
              electionsQuery.isLoading ? null : (
                <EmptySelectedDay
                  selectedLabel={selectedLabel}
                  onClear={clearSelectedCalendarDateKey}
                />
              )
            }
          />
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
    gap: 14,
  },

  headerRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backWrap: {
    width: 52,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  titleWrap: {
    flex: 1,
    alignItems: "center",
  },

  sideSpacer: {
    width: 52,
  },

  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },

  monthRow: {
    minHeight: 44,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.56)",
    borderWidth: 1,
    borderColor: "rgba(17,26,50,0.08)",
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  monthTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 3,
  },

  weekText: {
    width: 40,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 7,
  },

  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 7,
  },

  skeletonCell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(17,26,50,0.08)",
  },

  selectedDateRow: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "rgba(25,183,176,0.08)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.18)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedDateLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  selectedDateValue: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  todayButton: {
    minHeight: 34,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  todayText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },

  body: {
    flex: 1,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 34,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  emptyWrap: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    gap: 10,
  },

  emptyTitle: {
    fontSize: 19,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 290,
  },

  clearDateButton: {
    minHeight: 40,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  clearDateText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
});