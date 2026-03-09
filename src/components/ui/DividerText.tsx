import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { StyleSheet, View } from "react-native";

type Props = {
  text: string;
};

export default function DividerText({ text }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <AppText variant="caption" style={styles.text}>
        {text}
      </AppText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  text: {
    color: Theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.medium,
    letterSpacing: 0.25,
    textTransform: "uppercase",
  },
});