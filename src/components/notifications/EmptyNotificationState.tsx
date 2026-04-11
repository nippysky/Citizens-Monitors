import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import NoNotification from "@/svgs/app/NoNotification";
import { Theme } from "@/theme";

export default function EmptyNotificationState() {
  return (
    <View style={styles.wrap}>
      <NoNotification width={220} height={220} />

      <View style={styles.textBlock}>
        <AppText style={styles.title}>No Notification</AppText>
        <AppText style={styles.subtitle}>
          Stay tuned! We will notify you as soon as anything is going on.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 70,
    gap: 18,
  },

  textBlock: {
    alignItems: "center",
    gap: 8,
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 280,
    fontSize: 15,
    lineHeight: 24,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
    textAlign: "center",
  },
});