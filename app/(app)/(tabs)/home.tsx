import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CollationUpdatesSection from "@/components/home/CollationUpdatesSection";
import ElectionCarousel from "@/components/home/ElectionCarousel";
import HomeCalendarStrip from "@/components/home/HomeCalenderStrip";
import HomeHeader from "@/components/home/HomeHeader";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import PulseAndDiscourseSection from "@/components/home/PulseAndDiscourseSection";
import QuietDayBanner from "@/components/home/QuietDayBanner";
import VoterEssentialsModal from "@/components/home/VoterEssentialsModal";
import VoterEssentialsSection from "@/components/home/VoterEssentialSection";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import TourTarget from "@/components/tour/TourTarget";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { useNetwork } from "@/context/NetworkContext";
import { useTourScrollReset } from "@/context/TourContext";
import {
  buildCalendarWindow,
  formatHomeDateKey,
  startOfLocalDay,
} from "@/data/home";
import { useDashboardQuery } from "@/hooks/api/useDashboardQuery";
import { useMyProfileQuery } from "@/hooks/api/useMyProfileQuery";
import {
  DashboardElectionUpdate,
  DashboardLiveElection,
  DashboardNewsItem,
  DashboardSocialUpdate,
} from "@/lib/api/dashboard.api";
import type { MyProfileResponse } from "@/lib/api/profile.api";
import { Theme } from "@/theme";
import {
  CalendarDayItem,
  DiscussionItem,
  ElectionCardItem,
  ElectionType,
  ElectionUpdateItem,
  NewsItem,
  UserRole,
} from "@/types/home";

const HOME_TOUR_TARGET_IDS = ["home.calendar-strip"];

function roleLabelFromRole(role?: string): string {
  if (role === "observer") return "Observer";
  if (role === "public-viewer") return "Public Viewer";

  return "Volunteer";
}

function userRoleFromProfileRole(role?: string): UserRole {
  if (role === "observer") return "observer";
  if (role === "public-viewer") return "public-viewer";

  return "volunteer";
}

function getFirstName(params: {
  profileFirstName?: string;
  authFirstName?: string;
  email?: string;
}): string {
  const cleanProfileName = params.profileFirstName?.trim();
  if (cleanProfileName) return cleanProfileName;

  const cleanAuthName = params.authFirstName?.trim();
  if (cleanAuthName) return cleanAuthName;

  const emailName = params.email?.split("@")[0]?.trim();
  if (emailName) return emailName;

  return "Citizen";
}

function normalizeElectionType(value: string): ElectionType {
  const clean = value.trim().toLowerCase();

  if (clean.includes("presidential") || clean === "national") return "national";

  if (clean.includes("senatorial") || clean.includes("senate")) {
    return "senatorial";
  }

  if (clean.includes("representatives") || clean.includes("house-of-rep")) {
    return "house-of-representatives";
  }

  if (clean.includes("assembly")) return "house-of-assembly";
  if (clean.includes("gubernatorial")) return "gubernatorial";
  if (clean.includes("local")) return "local-government";

  return "other";
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return "Live now";

  const formatter = new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    timeZone: "Africa/Lagos",
  });

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const startValid = start && !Number.isNaN(start.getTime());
  const endValid = end && !Number.isNaN(end.getTime());

  if (startValid && endValid) {
    return `${formatter.format(start)} - ${formatter.format(end)} · WAT`;
  }

  if (startValid) return `From ${formatter.format(start)} · WAT`;
  if (endValid) return `Until ${formatter.format(end)} · WAT`;

  return "Live now";
}

function getElectionLocation(election: DashboardLiveElection): string {
  return election.electionLocation?.trim() || "Nationwide";
}

/**
 * Maps a live election from the dashboard API into a card item, merging:
 *   1. Election context from the API (id, title, type, location, start/end dates)
 *   2. The submitter's polling-unit context from their profile (state, lga, ward, pollingUnit)
 *
 * The polling-unit context is what flows into the Submit Election Report screen.
 * Without it, the submit screen falls back to DEV_COMMENCEMENT_CONTEXT (dev fixture).
 *
 * Notes:
 *  - The dashboard API doesn't expose `votingStartTime`, so we leave it `undefined`.
 *    `LiveElectionCard.handleSubmitResult` falls back to `item.startDate` in that case.
 *  - The profile carries only `pollingUnit` (the name) — there is no separate code field.
 *    `submitElectionResult` accepts `pollingUnitCode` as optional, so we leave it `undefined`.
 *    If a code is added to onboarding/profile later, wire it here.
 */
function mapLiveElectionToCard(
  election: DashboardLiveElection,
  role: UserRole,
  profile?: MyProfileResponse | null
): ElectionCardItem {
  const apiElectionLocation = election.electionLocation?.trim() || "";

  const pollingUnitName = profile?.pollingUnit?.trim() || "";
  const ward = profile?.ward?.trim() || "";
  const lga = profile?.lga?.trim() || "";
  const state = profile?.state?.trim() || "";

  return {
    id: election.id,
    activeElectionId: election.id,
    title: election.electionName,
    location: getElectionLocation(election),
    time: formatDateRange(election.startDate, election.endDate),
    ctaLabel: role === "public-viewer" ? "View Collation" : "Submit / Collation",
    illustration: role,
    live: election.status === "live",
    electionType: normalizeElectionType(election.electionType),
    pollingUnitsRecorded: 0,
    totalPollingUnits: 0,
    partiesCount: election.partiesCount,
    status: election.status,

    // Election routing context (carried into Submit Election Report screen).
    electionLocation: apiElectionLocation || undefined,
    startDate: election.startDate,
    endDate: election.endDate,
    votingStartTime: undefined,

    // Submitter polling-unit context from the user's profile.
    pollingUnitName: pollingUnitName || undefined,
    pollingUnitCode: undefined,
    ward: ward || undefined,
    lga: lga || undefined,
    state: state || undefined,
  };
}

function mapElectionUpdate(
  item: DashboardElectionUpdate,
  fallbackElectionId?: string
): ElectionUpdateItem {
  return {
    id: item.id,
    collationId:
      item.activeElectionId ?? item.electionId ?? fallbackElectionId ?? item.id,
    tag: item.type === "incident-upload" ? "INCIDENT" : "RESULT",
    title: item.title,
    info: item.info,
    timeAgo: item.timeAgo,
  };
}

function mapSocialUpdateToDiscussion(
  item: DashboardSocialUpdate
): DiscussionItem {
  return {
    id: item.id,
    source: item.source,
    collationId: item.activeElectionId,
    timeAgo: item.timeAgo,
    title: item.body,
    author: item.authorName || "Citizen",
    pollingUnit:
      item.source === "collation-discussion"
        ? "Collation Discussion"
        : "Pulse",
    imageUrl: item.imageUrl ?? undefined,
    likesCount: item.likesCount,
    commentsCount: item.commentsCount,
  };
}

function getNewsTitle(item: DashboardNewsItem): string {
  return (
    item.title?.trim() ||
    item.headline?.trim() ||
    item.summary?.trim() ||
    item.excerpt?.trim() ||
    item.body?.trim() ||
    "News update"
  );
}

function getNewsSlug(item: DashboardNewsItem): string {
  return item.slug?.trim() || item.id?.trim() || "";
}

function getNewsImageUrl(item: DashboardNewsItem): string | undefined {
  return (
    item.imageUrl?.trim() ||
    item.imageURL?.trim() ||
    item.thumbnailUrl?.trim() ||
    item.thumbnailURLUrl?.trim() ||
    item.thumbnailURL?.trim() ||
    item.heroImageUrl?.trim() ||
    item.heroImageURL?.trim() ||
    undefined
  );
}

function getNewsDate(item: DashboardNewsItem): string {
  const rawDate = item.date ?? item.publishedAt ?? item.createdAt ?? item.updatedAt;

  if (!rawDate) return "";

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return rawDate;
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function mapNewsItem(item: DashboardNewsItem): NewsItem {
  const slug = getNewsSlug(item);

  return {
    id: item.id || slug,
    slug,
    title: getNewsTitle(item),
    date: getNewsDate(item),
    imageUrl: getNewsImageUrl(item),
  };
}

function HomeSkeleton() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.root}>
        <LinearGradient
          colors={["#F4F1D9", "#F4F1D9", "#FFFFFF", "#FFFFFF"]}
          locations={[0, 0.18, 0.48, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.skeletonContent}>
          <View style={styles.skeletonHeaderRow}>
            <View style={styles.skeletonHeaderCopy}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSubtitle} />
            </View>

            <View style={styles.skeletonIconRow}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonIcon} />
            </View>
          </View>

          <View style={styles.skeletonCalendarHeader} />

          <View style={styles.skeletonCalendarRow}>
            {[0, 1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.skeletonCalendarChip} />
            ))}
          </View>

          <View style={styles.skeletonElectionCard} />

          <View style={styles.skeletonWhiteSection}>
            <View style={styles.skeletonSectionTitle} />

            {[0, 1, 2].map((item) => (
              <View key={item} style={styles.skeletonListCard}>
                <View style={styles.skeletonListText}>
                  <View style={styles.skeletonLineLarge} />
                  <View style={styles.skeletonLineSmall} />
                </View>

                <View style={styles.skeletonThumb} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const { showToast, isConnected } = useNetwork();
  const dashboardQuery = useDashboardQuery();
  const { profile } = useMyProfileQuery();

  const [today, setToday] = useState(() => startOfLocalDay());
  const [selectedDate, setSelectedDate] = useState(() => startOfLocalDay());
  const [voterEssentialsVisible, setVoterEssentialsVisible] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const hasNavigatedRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useTourScrollReset(scrollViewRef, HOME_TOUR_TARGET_IDS);

  useFocusEffect(
    useCallback(() => {
      const liveToday = startOfLocalDay();

      setToday(liveToday);
      setSelectedDate(liveToday);
    }, [])
  );

  const calendarItems = useMemo(() => buildCalendarWindow(today, 15), [today]);

  const selectedKey = useMemo(
    () => formatHomeDateKey(selectedDate),
    [selectedDate]
  );

  const todayKey = useMemo(() => formatHomeDateKey(today), [today]);

  const isTodaySelected = selectedKey === todayKey;

  const monthLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [selectedDate]
  );

  const viewerRole = useMemo(
    () => userRoleFromProfileRole(profile?.role),
    [profile?.role]
  );

  const firstName = useMemo(
    () =>
      getFirstName({
        profileFirstName: profile?.firstName,
        email: profile?.email,
      }),
    [profile?.email, profile?.firstName]
  );

  const roleLabel = useMemo(
    () => roleLabelFromRole(profile?.role),
    [profile?.role]
  );

  const dashboard = dashboardQuery.data;

  const liveElectionCards = useMemo(() => {
    if (!dashboard || !isTodaySelected) return [];

    return dashboard.liveElections.map((election) =>
      mapLiveElectionToCard(election, viewerRole, profile)
    );
  }, [dashboard, isTodaySelected, viewerRole, profile]);

  const fallbackElectionId = liveElectionCards[0]?.activeElectionId;

  const electionUpdates = useMemo(() => {
    if (!dashboard) return [];

    return dashboard.electionUpdates.map((item) =>
      mapElectionUpdate(item, fallbackElectionId)
    );
  }, [dashboard, fallbackElectionId]);

  const discussions = useMemo(() => {
    if (!dashboard) return [];

    return [
      ...dashboard.collationUpdates.map(mapSocialUpdateToDiscussion),
      ...dashboard.pulseAndDiscourse.map(mapSocialUpdateToDiscussion),
      ...dashboard.reportThreadUpdates.map(mapSocialUpdateToDiscussion),
    ];
  }, [dashboard]);

  const news = useMemo(() => {
    if (!dashboard) return [];

    return dashboard.latestNewsAndInsights
      .map(mapNewsItem)
      .filter((item) => item.id || item.slug);
  }, [dashboard]);

  const hasElection = liveElectionCards.length > 0;

  const handleSelectDay = useCallback((item: CalendarDayItem): void => {
    setSelectedDate(item.date);
  }, []);

  const onRefresh = useCallback(async () => {
    const liveToday = startOfLocalDay();

    setToday(liveToday);
    setSelectedDate(liveToday);

    await dashboardQuery.refetch();

    if (isConnected) {
      showToast({
        type: "info",
        title: "Data refreshed!",
        subtitle: "You're viewing the latest dashboard updates.",
      });
    }
  }, [dashboardQuery, isConnected, showToast]);

  const handleOpenVoterEssentials = useCallback(() => {
    hasNavigatedRef.current = false;
    setVoterEssentialsVisible(true);
  }, []);

  const handleCloseVoterEssentials = useCallback(() => {
    setVoterEssentialsVisible(false);
  }, []);

  const handleNavigateFromVoterEssentials = useCallback((route: string) => {
    hasNavigatedRef.current = false;
    setPendingRoute(route);
    setVoterEssentialsVisible(false);
  }, []);

  useEffect(() => {
    if (voterEssentialsVisible) return;
    if (!pendingRoute) return;
    if (hasNavigatedRef.current) return;

    const timer = setTimeout(() => {
      if (hasNavigatedRef.current) return;

      hasNavigatedRef.current = true;
      const nextRoute = pendingRoute;
      setPendingRoute(null);

      requestAnimationFrame(() => {
        router.push(nextRoute as never);
      });
    }, 220);

    return () => clearTimeout(timer);
  }, [pendingRoute, voterEssentialsVisible]);

  if (dashboardQuery.isInitialDashboardLoading) {
    return <HomeSkeleton />;
  }

  if (!dashboard && dashboardQuery.error) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={[styles.root, styles.errorState]}>
          <AppText style={styles.errorTitle}>Unable to load dashboard</AppText>
          <AppText style={styles.errorText}>
            Check your connection and try again. If you were previously signed
            in, cached dashboard data will appear once available.
          </AppText>

          <AppButton
            title="Retry"
            onPress={() => {
              void dashboardQuery.refetch();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.root}>
        <LinearGradient
          colors={["#F4F1D9", "#F4F1D9", "#FFFFFF", "#FFFFFF"]}
          locations={[0, 0.18, 0.48, 1]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces
          overScrollMode="never"
          refreshControl={
            <RefreshControl
              refreshing={dashboardQuery.isRefetching}
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
              progressBackgroundColor="#FFFFFF"
            />
          }
        >
          <View style={styles.topSection}>
            <HomeHeader firstName={firstName} roleLabel={roleLabel} />

            <View style={styles.calendarBlock}>
              <TourTarget id="home.calendar-strip">
                <HomeCalendarStrip
                  items={calendarItems}
                  selectedKey={selectedKey}
                  todayKey={todayKey}
                  monthLabel={monthLabel}
                  onSelect={handleSelectDay}
                />
              </TourTarget>

              <AppText style={styles.calendarStatus}>
                {isTodaySelected
                  ? "See elections being monitored live right now."
                  : "Live dashboard updates are shown for today."}
              </AppText>
            </View>

            {hasElection ? (
              <ElectionCarousel
                items={liveElectionCards}
                viewerRole={viewerRole}
              />
            ) : (
              <QuietDayBanner
                title="QUIET DAY!"
                subtitle={
                  isTodaySelected
                    ? "No live voting events are available right now."
                    : "No live dashboard events for this date."
                }
              />
            )}
          </View>

          <View style={styles.whiteSection}>
            {electionUpdates.length > 0 ? (
              <CollationUpdatesSection items={electionUpdates} />
            ) : null}

            {discussions.length > 0 ? (
              <PulseAndDiscourseSection items={discussions} />
            ) : null}

            {news.length > 0 ? <LatestNewsSection items={news} /> : null}

            <VoterEssentialsSection onViewAll={handleOpenVoterEssentials} />

            <TabBarSpacer />
          </View>
        </ScrollView>

        <VoterEssentialsModal
          visible={voterEssentialsVisible}
          onClose={handleCloseVoterEssentials}
          onNavigate={handleNavigateFromVoterEssentials}
        />
      </View>
    </SafeAreaView>
  );
}

const skeletonColor = "rgba(17,26,50,0.08)";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F1D9",
  },
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
    paddingBottom: 20,
  },
  calendarBlock: {
    gap: 10,
  },
  calendarStatus: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
  whiteSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 24,
    gap: 32,
  },
  errorState: {
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 14,
    backgroundColor: "#FFFFFF",
  },
  errorTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  errorText: {
    fontSize: 15,
    lineHeight: 23,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  skeletonContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skeletonHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skeletonHeaderCopy: {
    gap: 8,
  },
  skeletonTitle: {
    width: 132,
    height: 22,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonSubtitle: {
    width: 184,
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonIconRow: {
    flexDirection: "row",
    gap: 8,
  },
  skeletonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: skeletonColor,
  },
  skeletonCalendarHeader: {
    width: "100%",
    height: 20,
    borderRadius: 999,
    marginTop: 26,
    backgroundColor: skeletonColor,
  },
  skeletonCalendarRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  skeletonCalendarChip: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: skeletonColor,
  },
  skeletonElectionCard: {
    height: 174,
    borderRadius: 24,
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.64)",
    borderWidth: 1,
    borderColor: "rgba(17,26,50,0.07)",
  },
  skeletonWhiteSection: {
    marginHorizontal: -16,
    marginTop: 26,
    paddingTop: 24,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    gap: 16,
  },
  skeletonSectionTitle: {
    width: 148,
    height: 16,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonListCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skeletonListText: {
    flex: 1,
    gap: 8,
  },
  skeletonLineLarge: {
    width: "78%",
    height: 15,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonLineSmall: {
    width: "48%",
    height: 12,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: skeletonColor,
  },
});