import { StyleSheet, View } from "react-native";

import AuthShell from "@/components/auth/AuthShell";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import CheckIcon from "@/svgs/CheckIcon";
import CitizenIcon from "@/svgs/CitizenIcon";
import { Theme } from "@/theme";
import { OnboardingDraft } from "@/types/onboarding";

type Props = {
  draft: OnboardingDraft;
  onOpenApp?: () => Promise<void> | void;
};

export default function OnboardingReady({ draft, onOpenApp }: Props) {
  const firstName = draft.stepOne.firstName || "Citizen";

  const handleOpen = async () => {
    await onOpenApp?.();

    console.log("Final onboarding payload:", draft);

    // Replace this with your actual app home route later.
    // router.replace("/(tabs)");
  };

  return (
    <AuthShell
      topSlot={<CitizenIcon width={28} height={28} />}
      scroll={false}
    >
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <CheckIcon width={58} height={58} />

          <View style={styles.textWrap}>
            <AppText variant="heading" style={styles.title}>
              You&apos;re Ready, {firstName}!
            </AppText>

            <AppText style={styles.subtitle}>
              Your profile is complete. Time to protect democracy — your polling unit is watching.
            </AppText>
          </View>
        </View>

        <AppButton title="Open Citizen Monitor" onPress={handleOpen} />
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 120,
    paddingBottom: 8,
  },

  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    paddingHorizontal: 22,
  },

  textWrap: {
    gap: 8,
    alignItems: "center",
  },

  title: {
    textAlign: "center",
    fontSize: 26,
    lineHeight: 32,
    color: Theme.colors.text,
  },

  subtitle: {
    textAlign: "center",
    fontSize: 17,
    lineHeight: 25,
    color: Theme.colors.textMuted,
    maxWidth: 320,
  },
});