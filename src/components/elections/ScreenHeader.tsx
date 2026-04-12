// ─── src/components/app/ScreenHeader.tsx ─────────────────────────────────────
// Generic top-bar used across Elections, Collation, and future screens.
// Drop-in replacement for the old ElectionsHeader — just rename imports.
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  title?: string;
  subtitle?: string;
  onHelp?: () => void;
  onNotifications?: () => void;
};

export default function ScreenHeader({
  title = "Elections",
  subtitle,
  onHelp,
  onNotifications,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <AppText style={styles.title}>{title}</AppText>
          {subtitle ? (
            <AppText style={styles.subtitle}>{subtitle}</AppText>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onHelp} hitSlop={10} style={styles.iconButton}>
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={Theme.colors.primary}
            />
          </Pressable>

          <Pressable
            onPress={onNotifications}
            hitSlop={10}
            style={styles.iconButton}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={Theme.colors.text}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  titleWrap: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontSize: 26,
    lineHeight: 30,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});