import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import DiscussionRoomSection from "@/components/home/DiscussionRoomSection";
import ElectionCarousel from "@/components/home/ElectionCarousel";
import HomeHeader from "@/components/home/HomeHeader";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import QuietDayBanner from "@/components/home/QuietDayBanner";
import VoterEssentialsModal from "@/components/home/VoterEssentialsModal";
import HomeCalendarStrip from "@/components/home/HomeCalenderStrip";
import VoterEssentialsSection from "@/components/home/VoterEssentialSection";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import TourTarget from "@/components/tour/TourTarget";
import AppText from "@/components/ui/AppText";
import { useAuth } from "@/context/AuthContext";
import { useNetwork } from "@/context/NetworkContext";
import { useTourScrollReset } from "@/context/TourContext";
import {
  buildFiveDayWindow,
  defaultHomeDate,
  homeContentByDate,
  mockRole,
} from "@/data/home";
import { Theme } from "@/theme";
import { CalendarDayItem } from "@/types/home";
import CollationUpdatesSection from "@/components/home/CollationUpdatesSection";

function roleLabelFromRole(role: typeof mockRole): string {
  if (role === "observer") return "Observer";
  if (role === "public-viewer") return "Public Viewer";
  return "Volunteer";
}

const HOME_TOUR_TARGET_IDS = ["home.calendar-strip"];

export default function HomeScreen() {
  const { user } = useAuth();
  const { showToast, isConnected } = useNetwork();

  const [selectedDate, setSelectedDate] = useState<Date>(defaultHomeDate);
  const [refreshing, setRefreshing] = useState(false);
  const [voterEssentialsVisible, setVoterEssentialsVisible] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const hasNavigatedRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Snap to top when the home tour step becomes active.
  useTourScrollReset(scrollViewRef, HOME_TOUR_TARGET_IDS);

  const calendarItems = useMemo(
    () => buildFiveDayWindow(selectedDate),
    [selectedDate]
  );

  const selectedKey = selectedDate.toISOString().slice(0, 10);

  const selectedContent = homeContentByDate[selectedKey] ?? {
    dateKey: selectedKey,
    hasElection: false,
    quietDay: {
      title: "QUIET DAY!",
      subtitle: "No voting events happening today.",
    },
    electionCards: [],
    banners: [],
    notifications: [],
    electionUpdates: [],
    discussions: [],
    news: [],
  };

  const monthLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [selectedDate]
  );

  const firstName = user?.firstName ?? "Ifeoluwa";

  const handleSelectDay = (item: CalendarDayItem): void => {
    setSelectedDate(item.date);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setRefreshing(false);

    if (isConnected) {
      showToast({
        type: "info",
        title: "Data refreshed!",
        subtitle: "You're viewing the latest updates.",
      });
    }
  }, [isConnected, showToast]);

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
  }, [voterEssentialsVisible, pendingRoute]);

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
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
              progressBackgroundColor="#FFFFFF"
            />
          }
        >
          <View style={styles.topSection}>
            <HomeHeader
              firstName={firstName}
              roleLabel={roleLabelFromRole(mockRole)}
            />

            <View style={styles.calendarBlock}>
              <TourTarget id="home.calendar-strip">
                <HomeCalendarStrip
                  items={calendarItems}
                  selectedKey={selectedKey}
                  monthLabel={monthLabel}
                  onSelect={handleSelectDay}
                />
              </TourTarget>

              <AppText style={styles.calendarStatus}>
                See elections being monitored live right now.
              </AppText>
            </View>

            {selectedContent.hasElection ? (
              <ElectionCarousel items={selectedContent.electionCards} />
            ) : selectedContent.quietDay ? (
              <QuietDayBanner
                title={selectedContent.quietDay.title}
                subtitle={selectedContent.quietDay.subtitle}
              />
            ) : null}
          </View>

          <View style={styles.whiteSection}>
            {selectedContent.electionUpdates.length > 0 && (
              <CollationUpdatesSection
                items={selectedContent.electionUpdates}
              />
            )}

            {selectedContent.discussions.length > 0 && (
              <DiscussionRoomSection items={selectedContent.discussions} />
            )}

            {selectedContent.news.length > 0 && (
              <LatestNewsSection items={selectedContent.news} />
            )}

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
    gap: 8,
  },
  calendarStatus: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
  whiteSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 24,
    gap: 32,
  },
});