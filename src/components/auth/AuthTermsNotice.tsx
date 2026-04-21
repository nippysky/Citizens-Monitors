import { Pressable, StyleSheet, View } from "react-native";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export default function AuthTermsNotice() {
  return (
    <View style={styles.container}>
      <AppText style={styles.text}>
        By registering you agree to our:
      </AppText>

      <View style={styles.linksRow}>
        <Pressable onPress={() => {}}>
          <AppText style={styles.link}>Terms of Use</AppText>
        </Pressable>

        <AppText style={styles.text}> & </AppText>

        <Pressable onPress={() => {}}>
          <AppText style={styles.link}>Privacy Policy</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6, // 👈 nice breathing space between lines
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    fontSize: 13,
    color: Theme.colors.primary,
    fontWeight: "600",
  },
});