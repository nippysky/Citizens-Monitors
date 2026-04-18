import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export default function EmptyPressCoverageState() {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons
          name="megaphone-outline"
          size={30}
          color={Theme.colors.primary}
        />
      </View>

      <View style={styles.textBlock}>
        <AppText style={styles.title}>No press coverage yet</AppText>
        <AppText style={styles.subtitle}>
          Official statements, releases, and public updates will appear here.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 163, 156, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(5, 163, 156, 0.14)",
  },

  textBlock: {
    alignItems: "center",
    gap: 6,
  },

  title: {
    fontSize: 18,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 270,
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
});