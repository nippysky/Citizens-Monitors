import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { getNotificationById } from "@/data/notifications";
import { Theme } from "@/theme";

export default function NotificationDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const notification = params.id ? getNotificationById(params.id) : undefined;

  return (
    <AppGradientScreen>
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
        </View>

        <View style={styles.body}>
          {notification ? (
            <View style={styles.contentWrap}>
              <AppText style={styles.title}>{notification.title}</AppText>

              <View style={styles.paragraphsWrap}>
                {notification.body.map((paragraph) => (
                  <AppText key={paragraph} style={styles.bodyText}>
                    {paragraph}
                  </AppText>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.fallbackWrap}>
              <AppText style={styles.fallbackTitle}>
                Notification not found
              </AppText>
              <AppText style={styles.fallbackText}>
                This notification may have been removed or is no longer available.
              </AppText>
            </View>
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
    paddingBottom: 10,
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

  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 6,
  },

  contentWrap: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 16,
  },

  title: {
    fontSize: 24,
    lineHeight: 30,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    maxWidth: 340,
  },

  paragraphsWrap: {
    gap: 18,
  },

  bodyText: {
    fontSize: 16,
    lineHeight: 28,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  fallbackWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },

  fallbackTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  fallbackText: {
    fontSize: 15,
    lineHeight: 24,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
  },
});