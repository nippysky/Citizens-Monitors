import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ElectionCarousel from "@/components/home/ElectionCarousel";
import EmptyNotificationsState from "@/components/home/EmptyNotificationState";
import HomeBannerCard from "@/components/home/HomeBannerCard";
import HomeCalendarStrip from "@/components/home/HomeCalenderStrip";
import HomeHeader from "@/components/home/HomeHeader";
import NotificationList from "@/components/home/NotificationList";
import QuietDayBanner from "@/components/home/QuietDayBanner";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import AppText from "@/components/ui/AppText";
import { useAuth } from "@/context/AuthContext";
import {
  buildFiveDayWindow,
  defaultHomeDate,
  homeContentByDate,
  mockRole,
} from "@/data/home";
import { Theme } from "@/theme";
import { CalendarDayItem } from "@/types/home";

function roleLabelFromRole(role: typeof mockRole): string {
  if (role === "observer") return "Observer";
  if (role === "public-viewer") return "Public Viewer";
  return "Volunteer";
}

export default function HomeScreen() {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date>(defaultHomeDate);

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

  return (
    <AppGradientScreen>
      <View style={styles.container}>
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

          {selectedContent.banners.length > 0 ? (
            <View style={styles.bannerWrap}>
              {selectedContent.banners.map((banner) => (
                <HomeBannerCard key={banner.id} item={banner} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.feedSection}>
          {selectedContent.notifications.length > 0 ? (
            <NotificationList items={selectedContent.notifications} />
          ) : (
            <View style={styles.emptyWrap}>
              <AppText style={styles.sectionTitle}>Notifications</AppText>
              <EmptyNotificationsState />
            </View>
          )}

          <TabBarSpacer />
        </View>
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 0,
  },

  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },

  bannerWrap: {
    gap: 12,
    marginBottom: 8,
  },

  feedSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    marginTop: 6,
  },

  emptyWrap: {
    gap: 12,
    paddingTop: 2,
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },
});