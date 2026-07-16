import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Animated,
  Easing,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ElectionCard from "@/components/elections/ElectionCard";
import ElectionFiltersBottomSheet from "@/components/elections/ElectionFiltersBottomSheet";
import ElectionStatusPill from "@/components/elections/ElectionStatusPill";
import ScreenHeader from "@/components/elections/ScreenHeader";
import CommencementBottomSheet from "@/components/reporting/CommencementBottomSheet";
import TourTarget from "@/components/tour/TourTarget";
import AppText from "@/components/ui/AppText";
import { useToastContext } from "@/components/feedback/ToastProvider";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { Paths } from "@/constants/paths";
import { useElections } from "@/context/ElectionsContext";
import { useMyProfileQuery } from "@/hooks/api/useMyProfileQuery";
import { buildCommencementContext } from "@/lib/reporting";
import {
  coerceStatusForApi,
  electionStatusPills,
  ElectionItem,
  filterElections,
  formatDisplayDate,
  getElectionRangeLabel,
  mapApiElectionToItem,
  parseDateKeyLocal,
  sortElectionsForDisplay,
  startOfMonth,
} from "@/data/elections";
import { useActiveElectionsQuery } from "@/hooks/api/useElectionQueries";
import NoElection from "@/svgs/app/NoElection";
import { Theme } from "@/theme";

const FIXED_HEADLINE = "Discover your polling unit elections";

function ElectionListSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={`election-skeleton-${index}`} style={styles.skeletonCard}>
          <View style={styles.skeletonDateCol}>
            <View style={styles.skeletonCircle} />
            <View style={styles.skeletonSmallLine} />
            <View style={styles.skeletonNumber} />
          </View>

          <View style={styles.skeletonBody}>
            <View style={styles.skeletonStatusLine} />
            <View style={styles.skeletonTitleLine} />
            <View style={styles.skeletonTitleLineShort} />
            <View style={styles.skeletonMetaLine} />
            <View style={styles.skeletonMetaLineSmall} />
          </View>
        </View>
      ))}
    </View>
  );
}

function EmptyElectionsState({
  hasDateFilter,
  onClearDate,
  onResetFilters,
}: {
  hasDateFilter: boolean;
  onClearDate: () => void;
  onResetFilters: () => void;
}) {
  return (
    <View style={styles.emptyWrap}>
      <NoElection />

      <AppText style={styles.emptyTitle}>No elections found</AppText>
      <AppText style={styles.emptyText}>
        There are no elections matching the current filters for your polling
        unit.
      </AppText>

      <View style={styles.emptyActions}>
        {hasDateFilter ? (
          <Pressable onPress={onClearDate} style={styles.emptyButton}>
            <AppText style={styles.emptyButtonText}>Clear Date</AppText>
          </Pressable>
        ) : null}

        <Pressable onPress={onResetFilters} style={styles.emptyButtonPrimary}>
          <AppText style={styles.emptyButtonPrimaryText}>Reset Filters</AppText>
        </Pressable>
      </View>
    </View>
  );
}

export default function ElectionsScreen() {
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const commencementRef = useRef<BottomSheetModal>(null);
  const { showToast } = useToastContext();

  // Collapse the FAB to icon-only while the list is scrolling (same behaviour
  // as the Pulse Post button).
  const [scrolling, setScrolling] = useState(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleListScroll = () => {
    setScrolling(true);

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => setScrolling(false), 300);
  };

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

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

  const { profile } = useMyProfileQuery();
  const canSubmit =
    profile?.role === "observer" || profile?.role === "volunteer";

  const electionsQuery = useActiveElectionsQuery(
    coerceStatusForApi(filters.status)
  );

  const electionItems = useMemo(() => {
    const items = electionsQuery.data?.elections.map(mapApiElectionToItem) ?? [];

    return sortElectionsForDisplay(items);
  }, [electionsQuery.data]);

  // Live detection must NOT depend on the user's current status filter —
  // otherwise filtering by "Concluded" would hide a genuinely live election
  // from the submit flow. Query live elections directly (same query the
  // LiveNoticeProvider uses, so it's already cached).
  const liveElectionsQuery = useActiveElectionsQuery("live");

  const firstLiveElection = useMemo(() => {
    const liveItems =
      liveElectionsQuery.data?.elections.map(mapApiElectionToItem) ?? [];

    return (
      sortElectionsForDisplay(liveItems).find((e) => e.status === "live") ??
      null
    );
  }, [liveElectionsQuery.data]);

  const commencementContext = useMemo(
    () =>
      firstLiveElection
        ? buildCommencementContext({
            electionId: firstLiveElection.activeElectionId || firstLiveElection.id,
            electionTitle: firstLiveElection.title,
          })
        : null,
    [firstLiveElection]
  );

  const handleProceedResult = (time: string) => {
    if (!firstLiveElection) return;
    const electionId = firstLiveElection.activeElectionId || firstLiveElection.id;

    router.push({
      pathname: Paths.submitElectionReport as never,
      params: {
        electionId,
        activeElectionId: electionId,
        electionTitle: firstLiveElection.title,
        votingStartTime: time,
        location: firstLiveElection.location,
      },
    });
  };

  const handleProceedIncident = () => {
    if (!firstLiveElection) return;
    const electionId = firstLiveElection.activeElectionId || firstLiveElection.id;

    router.push({
      pathname: Paths.reportIncidentLive as never,
      params: {
        electionId,
        electionTitle: firstLiveElection.title,
      },
    });
  };

  const rangeLabel = useMemo(
    () => getElectionRangeLabel(electionItems),
    [electionItems]
  );

  const filteredItems = useMemo(() => {
    return filterElections(
      electionItems,
      "polling-unit",
      filters,
      selectedCalendarDateKey
    );
  }, [electionItems, filters, selectedCalendarDateKey]);

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

  const getCollationElectionId = (item: ElectionItem): string => {
    return item.activeElectionId || item.id;
  };

  const handleOpenCollation = (item: ElectionItem) => {
    const activeElectionId = getCollationElectionId(item);

    router.push({
      pathname: Paths.appCollation as never,
      params: {
        tab: "overview",
        collationId: activeElectionId,
        activeElectionId,
        electionId: activeElectionId,
      },
    });
  };

  const handleOpenDetails = (item: ElectionItem) => {
    router.push(Paths.electionDetails(item.id));
  };

  const renderHeader = () => (
    <View style={styles.topSection}>
      <ScreenHeader
        title="Elections"
        onNotifications={() => router.push(Paths.appNotifications)}
        onHelp={() => router.push(Paths.appHelpSupport)}
      />

      <View style={styles.discoverWrap}>
        <View style={styles.discoverTextBlock}>
          <AppText style={styles.discoverTitle}>{FIXED_HEADLINE}</AppText>
          <AppText style={styles.discoverSubtitle}>{rangeLabel}</AppText>
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
  );

  const renderItem = ({ item, index }: ListRenderItemInfo<ElectionItem>) => {
    const card = (
      <View style={styles.cardOuter}>
        <ElectionCard
          item={item}
          onLivePress={() => handleOpenCollation(item)}
          onConcludedPress={() => handleOpenDetails(item)}
          onUpcomingPress={() => handleOpenDetails(item)}
        />
      </View>
    );

    if (index === 0) {
      return <TourTarget id="elections.first-card">{card}</TourTarget>;
    }

    return card;
  };

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          showsVerticalScrollIndicator={false}
          onScroll={handleListScroll}
          scrollEventThrottle={16}
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
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            electionsQuery.isLoading ? (
              <ElectionListSkeleton />
            ) : electionsQuery.isError ? (
              <View style={styles.errorWrap}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={42}
                  color={Theme.colors.textMuted}
                />
                <AppText style={styles.errorTitle}>
                  Could not load elections
                </AppText>
                <AppText style={styles.errorText}>
                  Check your connection and try again.
                </AppText>
                <Pressable
                  onPress={() => {
                    void electionsQuery.refetch();
                  }}
                  style={styles.retryButton}
                >
                  <AppText style={styles.retryText}>Retry</AppText>
                </Pressable>
              </View>
            ) : (
              <EmptyElectionsState
                hasDateFilter={Boolean(selectedCalendarDateKey)}
                onClearDate={clearSelectedCalendarDateKey}
                onResetFilters={resetFilters}
              />
            )
          }
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      </View>

      {canSubmit ? (
        <FloatingActionButton
          onPress={() => {
            if (firstLiveElection) {
              commencementRef.current?.present();
            } else {
              showToast({
                type: "error",
                message:
                  "No live election right now. You can submit reports once an election goes live.",
              });
            }
          }}
          collapsed={scrolling}
          label="Submit Result"
          expandedWidth={172}
          icon={
            <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
          }
          accessibilityLabel="Submit election result"
        />
      ) : null}

      <ElectionFiltersBottomSheet
        sheetRef={filterSheetRef}
        value={filters}
        onChange={setFilters}
        onApply={() => undefined}
        onReset={resetFilters}
      />

      <CommencementBottomSheet
        ref={commencementRef}
        contextData={commencementContext}
        onProceedResult={handleProceedResult}
        onProceedIncident={handleProceedIncident}
      />
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 8,
  },

  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },

  discoverWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  discoverTextBlock: {
    flex: 1,
    gap: 4,
  },

  discoverTitle: {
    fontSize: 22,
    lineHeight: 27,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  discoverSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  iconPressed: {
    opacity: 0.65,
  },

  activeDateWrap: {
    overflow: "hidden",
  },

  activeDateRow: {
    minHeight: 38,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.62)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.15)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  activeDatePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  pillsRow: {
    gap: 10,
    paddingRight: 16,
  },

  cardOuter: {
    paddingHorizontal: 16,
  },

  skeletonWrap: {
    paddingHorizontal: 16,
    gap: 14,
  },

  skeletonCard: {
    minHeight: 146,
    flexDirection: "row",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3E6EA",
    backgroundColor: "#FFFFFF",
  },

  skeletonDateCol: {
    width: 62,
    backgroundColor: "#F3F3EF",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  skeletonCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E1E6EE",
  },

  skeletonSmallLine: {
    width: 34,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E1E6EE",
  },

  skeletonNumber: {
    width: 26,
    height: 20,
    borderRadius: 8,
    backgroundColor: "#DCE3EC",
  },

  skeletonBody: {
    flex: 1,
    padding: 14,
    gap: 10,
  },

  skeletonStatusLine: {
    width: 70,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E8EDF3",
  },

  skeletonTitleLine: {
    width: "78%",
    height: 18,
    borderRadius: 999,
    backgroundColor: "#E1E7EE",
  },

  skeletonTitleLineShort: {
    width: "54%",
    height: 18,
    borderRadius: 999,
    backgroundColor: "#E8EDF3",
  },

  skeletonMetaLine: {
    width: "88%",
    height: 12,
    borderRadius: 999,
    backgroundColor: "#E8EDF3",
    marginTop: 4,
  },

  skeletonMetaLineSmall: {
    width: "62%",
    height: 12,
    borderRadius: 999,
    backgroundColor: "#E8EDF3",
  },

  emptyWrap: {
    minHeight: 340,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  emptyTitle: {
    fontSize: 21,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
  },

  emptyActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  emptyButton: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8DDE6",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  emptyButtonPrimary: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonPrimaryText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },

  errorWrap: {
    minHeight: 340,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  errorTitle: {
    fontSize: 20,
    lineHeight: 25,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  retryButton: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },

});