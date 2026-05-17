import { useQueries } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import CollationContextTabs, {
  CollationTabKey,
} from "@/components/collation/CollationContextTabs";
import CollationDiscussionsTab from "@/components/collation/CollationDiscussionTab";
import CollationOverviewTab from "@/components/collation/CollationOverviewTab";
import CollationReviewReportsTab from "@/components/collation/CollationReviewReportsTab";
import LiveCollationCarousel from "@/components/collation/LiveCollationCarousel";
import ScreenHeader from "@/components/elections/ScreenHeader";
import { useLiveNotice } from "@/components/feedback/LiveNoticeProvider";
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import {
  buildCollationItem,
  CollationElectionSource,
  CollationItem,
  getCollationNotificationText,
  sortCollationItems,
} from "@/data/collation";
import {
  collationQueryKeys,
  getElectionCollation,
  useElectionCollationQuery,
} from "@/hooks/api/useCollationQueries";
import { useActiveElectionsQuery } from "@/hooks/api/useElectionQueries";
import { buildCommencementContext } from "@/lib/reporting";
import NoElection from "@/svgs/app/NoElection";
import { Theme } from "@/theme";

function normalizeTab(value?: string): CollationTabKey {
  if (value === "review-reports") return "review-reports";
  if (value === "discussions") return "discussions";

  return "overview";
}

function resolveIncomingElectionId(params: {
  collationId?: string;
  activeElectionId?: string;
  electionId?: string;
}): string | null {
  return params.activeElectionId ?? params.collationId ?? params.electionId ?? null;
}

function normalizeElectionSource(value: unknown): CollationElectionSource | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<CollationElectionSource>;

  if (!item.id || !item.electionName || !item.startDate || !item.endDate) {
    return null;
  }

  return {
    id: String(item.id),
    electionName: String(item.electionName),
    electionType: String(item.electionType ?? "election"),
    electionLocation:
      typeof item.electionLocation === "string" ? item.electionLocation : null,
    startDate: String(item.startDate),
    endDate: String(item.endDate),
    mockElection: Boolean(item.mockElection),
    partiesCount: typeof item.partiesCount === "number" ? item.partiesCount : 0,
    status: String(item.status ?? "live"),
  };
}

function CollationLoader() {
  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonCarousel} />
          <View style={styles.skeletonTabs} />
        </View>

        <View style={styles.body}>
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Theme.colors.primary} />
            <AppText style={styles.loadingText}>Loading collation data...</AppText>
          </View>
        </View>
      </View>
    </AppGradientScreen>
  );
}

function EmptyCollationState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <ScrollView
      contentContainerStyle={styles.emptyWrap}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={onRefresh}
          tintColor={Theme.colors.primary}
          colors={[Theme.colors.primary]}
        />
      }
    >
      <NoElection width={110} height={110} />
      <AppText style={styles.emptyTitle}>No live collation available</AppText>
      <AppText style={styles.emptyText}>
        Election collation data will appear here when active elections are
        available.
      </AppText>
    </ScrollView>
  );
}

export default function CollationScreen() {
  const params = useLocalSearchParams<{
    tab?: string;
    collationId?: string;
    activeElectionId?: string;
    electionId?: string;
  }>();

  const incomingElectionId = useMemo(
    () => resolveIncomingElectionId(params),
    [params]
  );

  const [activeTab, setActiveTab] = useState<CollationTabKey>(() =>
    normalizeTab(params.tab)
  );

  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(
    incomingElectionId
  );

  const { showNotice, hideNotice } = useLiveNotice();

  const electionsQuery = useActiveElectionsQuery("live");
  const routedCollationQuery = useElectionCollationQuery(incomingElectionId);

  const elections = useMemo<CollationElectionSource[]>(() => {
    const raw = electionsQuery.data?.elections ?? [];

    return raw
      .map((item: unknown) => normalizeElectionSource(item))
      .filter((item): item is CollationElectionSource => Boolean(item));
  }, [electionsQuery.data]);

  const collationQueries = useQueries({
    queries: elections.map((election) => ({
      queryKey: collationQueryKeys.detail(election.id),
      queryFn: () => getElectionCollation(election.id),
      enabled: Boolean(election.id),
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
    })),
  });

  useEffect(() => {
    setActiveTab(normalizeTab(params.tab));
  }, [params.tab]);

  useEffect(() => {
    if (incomingElectionId) {
      setSelectedElectionId(incomingElectionId);
    }
  }, [incomingElectionId]);

  const collations = useMemo<CollationItem[]>(() => {
    const mapped = elections.map((election, index) =>
      buildCollationItem(collationQueries[index]?.data, election)
    );

    const routeExists = incomingElectionId
      ? mapped.some((item) => item.id === incomingElectionId)
      : true;

    if (!routeExists && routedCollationQuery.data) {
      mapped.push(buildCollationItem(routedCollationQuery.data));
    }

    return sortCollationItems(mapped);
  }, [
    elections,
    incomingElectionId,
    routedCollationQuery.data,
    collationQueries,
  ]);

  const resolvedSelectedId =
    selectedElectionId ?? incomingElectionId ?? collations[0]?.id ?? null;

  const activeIndex = useMemo(() => {
    if (!collations.length || !resolvedSelectedId) return 0;

    const index = collations.findIndex((item) => item.id === resolvedSelectedId);

    return index >= 0 ? index : 0;
  }, [collations, resolvedSelectedId]);

  const activeCollation = collations[activeIndex] ?? collations[0] ?? null;

  const isInitialLoading =
    electionsQuery.isLoading ||
    Boolean(
      incomingElectionId && routedCollationQuery.isLoading && !activeCollation
    );

  const isRefreshing =
    electionsQuery.isRefetching ||
    routedCollationQuery.isRefetching ||
    collationQueries.some((query) => query.isRefetching);

  const refreshAll = useCallback(() => {
    void electionsQuery.refetch();

    if (incomingElectionId) {
      void routedCollationQuery.refetch();
    }

    collationQueries.forEach((query) => {
      void query.refetch();
    });
  }, [collationQueries, electionsQuery, incomingElectionId, routedCollationQuery]);

  const handleCarouselIndexChange = useCallback(
    (index: number) => {
      const next = collations[index];
      if (!next) return;

      setSelectedElectionId(next.id);
      setActiveTab("overview");
    },
    [collations]
  );

  const noticeContextData = useMemo(() => {
    if (!activeCollation) return null;

    return buildCommencementContext({
      electionId: activeCollation.id,
      electionTitle: activeCollation.fullTitle,
      pollingUnitName: activeCollation.location,
      pollingUnitCode: activeCollation.location,
      ward: activeCollation.location,
      lga: activeCollation.location,
      state: activeCollation.location,
    });
  }, [activeCollation]);

  useEffect(() => {
    if (
      !activeCollation ||
      activeCollation.status !== "live" ||
      !noticeContextData
    ) {
      hideNotice();
      return;
    }

    showNotice({
      message: getCollationNotificationText(activeCollation),
      actionLabel: "Submit Election Report",
      contextData: noticeContextData,
    });

    return () => {
      hideNotice();
    };
  }, [activeCollation, hideNotice, noticeContextData, showNotice]);

  if (isInitialLoading) {
    return <CollationLoader />;
  }

  if (!activeCollation) {
    return (
      <AppGradientScreen scroll={false}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <ScreenHeader
              title="Collation"
              onNotifications={() => router.push(Paths.appNotifications)}
              onHelp={() => router.push(Paths.appHelpSupport)}
            />
          </View>

          <View style={styles.body}>
            <EmptyCollationState onRefresh={refreshAll} />
          </View>
        </View>
      </AppGradientScreen>
    );
  }

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <ScreenHeader
            title="Collation"
            subtitle={activeCollation.electionDateLabel}
            onNotifications={() => router.push(Paths.appNotifications)}
            onHelp={() => router.push(Paths.appHelpSupport)}
          />

          <LiveCollationCarousel
            items={collations}
            activeIndex={activeIndex}
            onIndexChange={handleCarouselIndexChange}
          />

          <CollationContextTabs value={activeTab} onChange={setActiveTab} />
        </View>

        <View style={styles.body}>
          {activeTab === "overview" ? (
            <CollationOverviewTab
              collation={activeCollation}
              refreshing={isRefreshing}
              onRefresh={refreshAll}
            />
          ) : activeTab === "review-reports" ? (
            <CollationReviewReportsTab
              collation={activeCollation}
              refreshing={isRefreshing}
              onRefresh={refreshAll}
            />
          ) : (
            <CollationDiscussionsTab
              collation={activeCollation}
              refreshing={isRefreshing}
              onRefresh={refreshAll}
            />
          )}
        </View>
      </View>
    </AppGradientScreen>
  );
}

const skeletonColor = "rgba(17,26,50,0.08)";

const styles = StyleSheet.create({
  container: { flex: 1 },

  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },

  body: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    marginTop: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  emptyWrap: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    gap: 10,
  },

  emptyTitle: {
    fontSize: 20,
    lineHeight: 25,
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

  skeletonHeader: {
    height: 48,
    borderRadius: 18,
    backgroundColor: skeletonColor,
  },

  skeletonCarousel: {
    height: 148,
    borderRadius: 18,
    backgroundColor: "#F7F1D8",
    borderWidth: 1,
    borderColor: "#E8DFC0",
  },

  skeletonTabs: {
    height: 38,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
});