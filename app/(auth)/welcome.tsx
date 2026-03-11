import { Theme } from "@/theme";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import AuthShell from "@/components/auth/AuthShell";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { PersonIcon } from "@/components/ui/InputIcons";
import { Paths } from "@/constants/paths";
import FullLogo from "@/svgs/FullLogo";

export default function WelcomeScreen() {
  return (
    <AuthShell
      topSlot={<FullLogo />}
      footer={
        <AppText variant="caption" style={styles.footerText}>
          Secure • Private • Verified
        </AppText>
      }
      scroll={false}
    >
      <View style={styles.container}>
        <View style={styles.heroBlock}>
          <AppText variant="screenTitle" style={styles.title}>
            Welcome,{`\n`}Citizen.
          </AppText>

          <AppText style={styles.subtitle}>
            Sign in or create an account to start protecting democracy in real time.
          </AppText>
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Sign Into My Account"
            onPress={() => router.push(Paths.signIn)}
          />

          <AppButton
            title="Create A New Account"
            variant="secondary"
            leftIcon={<PersonIcon size={22} color={Theme.colors.text} />}
            onPress={() => router.push(Paths.signUp)}
          />
        </View>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 120,
  },

  heroBlock: {
    width: "100%",
    maxWidth: 345,
    gap: 16,
  },

  title: {
    color: Theme.colors.text,
    maxWidth: 300,
  },

  subtitle: {
    fontSize: 17,
    lineHeight: 28,
    color: Theme.colors.textMuted,
  },

  actions: {
    gap: 16,
    paddingBottom: 2,
  },

  footerText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
});