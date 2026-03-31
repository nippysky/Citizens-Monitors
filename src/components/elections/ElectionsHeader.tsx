import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  title?: string;
  onHelp?: () => void;
  onNotifications?: () => void;
};

export default function ElectionsHeader({
  title = "Elections",
  onHelp,
  onNotifications,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <AppText style={styles.title}>{title}</AppText>

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
    gap: 12,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 28,
    lineHeight: 31,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
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