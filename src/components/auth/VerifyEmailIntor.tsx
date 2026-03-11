import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  email: string;
};

export default function VerifyEmailIntro({ email }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText variant="title">Verify Email</AppText>

      <Text style={styles.text}>
        Check your inbox & spam folder. We just sent a{" "}
        <Text style={styles.text}>5-digit code to </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.text}>.</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },

  text: {
    color: Theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: Theme.fonts.body.regular,
  },

  email: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
});