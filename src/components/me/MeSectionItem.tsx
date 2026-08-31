import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import type { MeMenuItem } from "@/data/me";
import { Theme } from "@/theme";

type Props = {
  item: MeMenuItem;
  isLast: boolean;
  onPress: () => void;
};

export default function MeSectionItem({ item, isLast, onPress }: Props) {
  const isDanger = item.tone === "danger";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && styles.pressed,
      ]}
    >
      {/* Icon */}
      <View style={styles.iconWrap}>{item.icon}</View>

      {/* Text */}
      <View style={styles.textWrap}>
        <AppText
          style={[styles.title, isDanger && styles.titleDanger]}
        >
          {item.title}
        </AppText>
        <AppText style={styles.subtitle}>{item.subtitle}</AppText>
      </View>

      {/* Chevron */}
      {!isDanger ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Theme.colors.textMuted}
        />
      ) : (
        <Ionicons
          name="log-out-outline"
          size={18}
          color="#DC2626"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,26,50,0.06)",
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  titleDanger: {
    color: "#DC2626",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
});