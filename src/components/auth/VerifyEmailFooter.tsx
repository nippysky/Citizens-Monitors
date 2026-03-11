import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  secondsLeft: number;
  canResend: boolean;
  onResend: () => void;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function VerifyEmailFooter({
  secondsLeft,
  canResend,
  onResend,
}: Props) {
  if (canResend) {
    return (
      <View style={styles.wrap}>
        <View style={styles.row}>
          <AppText style={styles.text}>Don’t get the code? </AppText>
          <Pressable onPress={onResend} hitSlop={8}>
            <AppText style={styles.link}>Resend Again</AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <AppText style={styles.text}>Resend code after</AppText>
      <AppText style={styles.link}>{formatTime(secondsLeft)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  text: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },

  link: {
    color: Theme.colors.primary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
    textDecorationLine: "underline",
    textDecorationColor: Theme.colors.primary,
  },
});