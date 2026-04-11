import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import DiscussionRoomSection from "@/components/home/DiscussionRoomSection";
import ElectionCarousel from "@/components/home/ElectionCarousel";
import ElectionUpdatesSection from "@/components/home/ElectionUpdatesSection";
import HomeHeader from "@/components/home/HomeHeader";
import LatestNewsSection from "@/components/home/LatestNewsSection";
import QuietDayBanner from "@/components/home/QuietDayBanner";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import VoterEssentialsModal from "@/components/home/VoterEssentialsModal";
import { useAuth } from "@/context/AuthContext";
import { useNetwork } from "@/context/NetworkContext";
import {
  buildFiveDayWindow,
  defaultHomeDate,
  homeContentByDate,
  mockRole,
} from "@/data/home";
import { Theme } from "@/theme";
import { CalendarDayItem } from "@/types/home";
import HomeCalendarStrip from "@/components/home/HomeCalenderStrip";
import VoterEssentialsSection from "@/components/home/VoterEssentialSection";

function roleLabelFromRole(role: typeof mockRole): string {
  if (role === "observer") return "Observer";
  if (role === "public-viewer") return "Public Viewer";
  return "Volunteer";
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { showToast, isConnected } = useNetwork();

  const [selectedDate, setSelectedDate] = useState<Date>(defaultHomeDate);
  const [refreshing, setRefreshing] = useState(false);
  const [voterEssentialsVisible, setVoterEssentialsVisible] = useState(false);

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

  // ── Pull to refresh ──
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // In production: fetch fresh data, update cache via cacheSet()
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

  // ── Show live election toast on mount if election day ──
  useEffect(() => {
    if (selectedContent.hasElection && selectedContent.electionCards.length > 0) {
      const timer = setTimeout(() => {
        showToast({
          type: "live-election",
          title: "Alimosho 2026 Election is Live!",
          subtitle: "Submit result & incident reports.",
          actionLabel: "Submit Election Report",
          actionRoute: "/(app)/election/election-1",
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedContent.hasElection]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.root}>
        {/* Gradient background for top portion */}
        <LinearGradient
          colors={["#F4F1D9", "#F4F1D9", "#FFFFFF", "#FFFFFF"]}
          locations={[0, 0.18, 0.48, 1]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
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
          {/* ── Top gradient section ── */}
          <View style={styles.topSection}>
            <HomeHeader
              firstName={firstName}
              roleLabel={roleLabelFromRole(mockRole)}
            />

            <HomeCalendarStrip
              items={calendarItems}
              selectedKey={selectedKey}
              monthLabel={monthLabel}
              onSelect={handleSelectDay}
            />

            {selectedContent.hasElection ? (
              <ElectionCarousel items={selectedContent.electionCards} />
            ) : selectedContent.quietDay ? (
              <QuietDayBanner
                title={selectedContent.quietDay.title}
                subtitle={selectedContent.quietDay.subtitle}
              />
            ) : null}
          </View>

          {/* ── White section — everything below the election card ── */}
          <View style={styles.whiteSection}>
            {/* Election Updates */}
            {selectedContent.electionUpdates.length > 0 && (
              <ElectionUpdatesSection items={selectedContent.electionUpdates} />
            )}

            {/* Discussion Room */}
            {selectedContent.discussions.length > 0 && (
              <DiscussionRoomSection items={selectedContent.discussions} />
            )}

            {/* Latest News & Insights */}
            {selectedContent.news.length > 0 && (
              <LatestNewsSection items={selectedContent.news} />
            )}

            {/* Voter Essentials */}
            <VoterEssentialsSection
              onViewAll={() => setVoterEssentialsVisible(true)}
            />

            <TabBarSpacer />
          </View>
        </ScrollView>

        {/* Voter Essentials Modal */}
        <VoterEssentialsModal
          visible={voterEssentialsVisible}
          onClose={() => setVoterEssentialsVisible(false)}
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
  whiteSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 24,
    gap: 32,
  },
});