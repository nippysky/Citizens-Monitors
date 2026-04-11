import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import CitizenIcon from "@/svgs/app/CitizenIcon";
import { Theme } from "@/theme";

export default function NewsHeader() {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <CitizenIcon width={28} height={28} />

        <View style={styles.actions}>
          <Pressable style={styles.iconButton}>
            <Ionicons
              name="help-circle-outline"
              size={18}
              color={Theme.colors.primary}
            />
          </Pressable>

          <Pressable
            style={styles.iconButton}
            onPress={() => router.push(Paths.appNotifications)}
          >
            <Ionicons
              name="notifications-outline"
              size={18}
              color={Theme.colors.text}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.textBlock}>
        <AppText style={styles.title}>News Feeds</AppText>
        <AppText style={styles.subtitle}>
          Latest political news from publications.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.42)",
  },

  textBlock: {
    gap: 4,
  },

  title: {
    fontSize: 28,
    lineHeight: 31,
    fontFamily: Theme.fonts.heading.bold,
    color: Theme.colors.text,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
});