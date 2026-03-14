import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import type { MeMenuItem } from "@/data/me";
import { Theme } from "@/theme";

type Props = {
  item: MeMenuItem;
  isLast?: boolean;
  onPress?: () => void;
};

export default function MeSectionItem({
  item,
  isLast = false,
  onPress,
}: Props) {
  const isDanger = item.tone === "danger";

  const titleColor = isDanger ? "#F15A24" : Theme.colors.text;
  const subtitleColor = isDanger
    ? "rgba(241,90,36,0.86)"
    : "rgba(17,26,50,0.70)";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.leading}>
        {isDanger ? (
          <View style={styles.dangerIconWrap}>
            <Ionicons name="log-out-outline" size={20} color="#F15A24" />
          </View>
        ) : (
          item.icon
        )}
      </View>

      <View style={styles.textWrap}>
        <AppText style={[styles.title, { color: titleColor }]}>
          {item.title}
        </AppText>
        <AppText style={[styles.subtitle, { color: subtitleColor }]}>
          {item.subtitle}
        </AppText>
      </View>

      {!isDanger ? (
        <Ionicons
          name="chevron-forward"
          size={17}
          color="rgba(17,26,50,0.62)"
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,26,50,0.08)",
  },

  pressed: {
    opacity: 0.88,
  },

  leading: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  dangerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDEAE5",
  },

  textWrap: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.semibold,
  },

  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    fontFamily: Theme.fonts.body.medium,
  },
});