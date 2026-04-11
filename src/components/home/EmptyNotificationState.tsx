import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import NoNotification from "@/svgs/app/NoNotification";
import { Theme } from "@/theme";

export default function EmptyNotificationsState() {
  return (
    <View style={styles.wrap}>
      <View style={styles.glowRing}>
        <View style={styles.innerCard}>
          <NoNotification width={42} height={42} />
        </View>
      </View>

      <View style={styles.textWrap}>
        <AppText style={styles.title}>No Notification</AppText>
        <AppText style={styles.subtitle}>
          Stay tuned! We will notify you as soon as an election is going on to monitor.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 26,
  },
  glowRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(25, 183, 176, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  innerCard: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  textWrap: {
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  subtitle: {
    maxWidth: 230,
    textAlign: "center",
    color: Theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});