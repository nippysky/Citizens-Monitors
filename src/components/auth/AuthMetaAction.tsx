import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  prefix?: string;
  actionLabel: string;
  onPress?: () => void;
  underline?: boolean;
  centered?: boolean;
  stacked?: boolean;
};

export default function AuthMetaAction({
  prefix,
  actionLabel,
  onPress,
  underline = false,
  centered = true,
  stacked = false,
}: Props) {
  if (stacked) {
    return (
      <View style={[styles.stackedWrap, centered && styles.centered]}>
        {prefix ? <AppText style={styles.prefixStacked}>{prefix}</AppText> : null}
        <Pressable onPress={onPress} hitSlop={8}>
          <AppText style={[styles.action, underline && styles.underline]}>
            {actionLabel}
          </AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.inlineWrap, centered && styles.centered]}>
      {prefix ? <AppText style={styles.prefixInline}>{prefix} </AppText> : null}
      <Pressable onPress={onPress} hitSlop={8}>
        <AppText style={[styles.action, underline && styles.underline]}>
          {actionLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },

  inlineWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },

  stackedWrap: {
    gap: 4,
  },

  prefixInline: {
    color: Theme.colors.text,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.regular,
  },

  prefixStacked: {
    color: Theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Theme.fonts.body.regular,
    textAlign: "center",
  },

  action: {
    color: Theme.colors.primary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
    textAlign: "center",
  },

  underline: {
    textDecorationLine: "underline",
    textDecorationColor: Theme.colors.primary,
  },
});