import { Theme } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  onPressTerms?: () => void;
  onPressPrivacy?: () => void;
};

export default function AuthTermsSetPassword({
  onPressTerms,
  onPressPrivacy,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        By setting your password, you agree to our{" "}
        <Text style={styles.link} onPress={onPressTerms}>
          Terms of{"\n"}Use
        </Text>{" "}
        &{" "}
        <Text style={styles.link} onPress={onPressPrivacy}>
          Privacy Policy.
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: 18,
  },
  text: {
    textAlign: "center",
    color: Theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.regular,
  },
  link: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
});