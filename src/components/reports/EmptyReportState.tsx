import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";

export default function EmptyReportsState() {
  return (
    <View style={styles.wrap}>
     <View style={styles.iconWrap}>
  <Ionicons name="document-text-outline" size={96} color="#D1D5DB" />
</View>

      <View style={styles.textBlock}>
        <AppText style={styles.title}>No reports yet</AppText>
        <AppText style={styles.subtitle}>
          Your submitted polling unit reports will appear here once they are
          recorded.
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
    paddingHorizontal: 26,
    paddingBottom: 80,
    gap: 16,
  },

  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  textBlock: {
    alignItems: "center",
    gap: 6,
  },

  title: {
    fontSize: 22,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 280,
    fontSize: 14.5,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
    textAlign: "center",
  },
});