import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { Theme } from "@/theme";

type Props = {
  firstName: string;
  roleLabel: string;
};

export default function HomeHeader({ firstName, roleLabel }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {/* Left: greeting */}
        <View style={styles.textBlock}>
          <AppText style={styles.title}>Hi, {firstName}!</AppText>
          <AppText style={styles.subtitle}>You&apos;re an {roleLabel}.</AppText>
        </View>

        {/* Right: icons */}
        <View style={styles.actions}>
          <Pressable style={styles.iconButton}>
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={Theme.colors.textMuted}
            />
          </Pressable>

          <Pressable
            style={styles.iconButton}
            onPress={() => router.push(Paths.appNotifications)}
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
    gap: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textBlock: {
    gap: 2,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: Theme.fonts.heading.bold,
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});