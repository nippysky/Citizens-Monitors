import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import Observer from "@/svgs/Observer";
import { Theme } from "@/theme";


type Props = {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onPress?: () => void;
};

export default function MeProfileCard({
  title,
  subtitle,
  actionLabel,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <Observer width={44} height={44} />
      </View>

      <View style={styles.center}>
        <AppText style={styles.title}>{title}</AppText>

        <View style={styles.bottomRow}>
          <AppText style={styles.subtitle}>{subtitle}</AppText>

          {actionLabel ? (
            <AppText style={styles.actionLabel}>{actionLabel}</AppText>
          ) : null}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="rgba(17,26,50,0.62)"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "rgba(17,26,50,0.42)",
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },

  pressed: {
    opacity: 0.9,
  },

  left: {
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  subtitle: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: "rgba(17,26,50,0.78)",
    fontFamily: Theme.fonts.body.medium,
  },

  actionLabel: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "rgba(17,26,50,0.78)",
    textDecorationLine: "underline",
    fontFamily: Theme.fonts.body.semibold,
  },
});