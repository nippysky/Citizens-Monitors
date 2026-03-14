import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import EmptyNotificationState from "@/components/notifications/EmptyNotificationState";
import NotificationList from "@/components/notifications/NotificationList";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { mockNotifications } from "@/data/notifications";
import { Theme } from "@/theme";

export default function NotificationsScreen() {
  const notifications = useMemo(() => mockNotifications, []);
  const hasNotifications = notifications.length > 0;

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.backWrap}>
              <BackButton label="" />
            </View>

            <View style={styles.titleWrap}>
              <AppText style={styles.headerTitle}>Notifications</AppText>
            </View>

            <View style={styles.sideSpacer} />
          </View>

          <AppText style={styles.subtitle}>Don’t miss any message.</AppText>
        </View>

        <View style={styles.bodySection}>
          {hasNotifications ? (
            <NotificationList items={notifications} />
          ) : (
            <EmptyNotificationState />
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
    paddingBottom: 12,
    gap: 14,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 34,
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

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(17, 26, 50, 0.82)",
    fontFamily: Theme.fonts.body.medium,
  },

  bodySection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 6,
  },
});