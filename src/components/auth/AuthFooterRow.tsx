import AppText from "@/components/ui/AppText";
import InlineTextLink from "@/components/ui/InlineTextLink";
import { Theme } from "@/theme";
import { StyleSheet, View } from "react-native";

type Props = {
  prefix: string;
  actionLabel: string;
  onPress?: () => void;
};

export default function AuthFooterRow({ prefix, actionLabel, onPress }: Props) {
  return (
    <View style={styles.row}>
      <AppText style={styles.prefix}>{prefix} </AppText>
      <InlineTextLink label={actionLabel} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  prefix: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
});