import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { Theme } from "@/theme";

export default function ReportsHeader() {
  return (
    <View style={styles.wrap}>
      <BackButton label="" />

      <View style={styles.textBlock}>
        <AppText style={styles.title}>My Reports</AppText>
        <AppText style={styles.subtitle}>Review yours reports</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },

  textBlock: {
    gap: 4,
  },

  title: {
    fontSize: 32,
    lineHeight: 34,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
});