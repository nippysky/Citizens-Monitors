import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import AuthShell from "@/components/auth/AuthShell";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import CheckIcon from "@/svgs/app/CheckIcon";
import CitizenIcon from "@/svgs/app/CitizenIcon";
import { Theme } from "@/theme";
import { OnboardingDraft } from "@/types/onboarding";

type Props = {
  draft: OnboardingDraft;
};

function ReadySprinkles() {
  return (
    <View pointerEvents="none" style={styles.sprinklesWrap}>
      <View style={[styles.sprinkle, styles.sprinkleOne]} />
      <View style={[styles.sprinkle, styles.sprinkleTwo]} />
      <View style={[styles.sprinkle, styles.sprinkleThree]} />
      <View style={[styles.sprinkle, styles.sprinkleFour]} />
      <View style={[styles.sprinkle, styles.sprinkleFive]} />
      <View style={[styles.sprinkle, styles.sprinkleSix]} />
      <View style={[styles.sprinkle, styles.sprinkleSeven]} />
      <View style={[styles.sprinkle, styles.sprinkleEight]} />
    </View>
  );
}

export default function OnboardingReady({ draft }: Props) {
  const firstName = draft.stepOne.firstName || "Citizen";

  const handleOpen = (): void => {
    if (__DEV__) {
      console.log("Final onboarding payload:", draft);
    }

    router.replace(Paths.appHome);
  };

  return (
    <AuthShell topSlot={<CitizenIcon width={28} height={28} />} scroll={false}>
      <ReadySprinkles />

      <View style={styles.container}>
        <View style={styles.centerContent}>
          <CheckIcon width={58} height={58} />

          <View style={styles.textWrap}>
            <AppText variant="heading" style={styles.title}>
              You&apos;re Ready, {firstName}!
            </AppText>

            <AppText style={styles.subtitle}>
              Your profile is complete. Time to protect democracy — your
              polling unit is watching.
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

  sprinklesWrap: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    height: 70,
  },

  sprinkle: {
    position: "absolute",
    width: 3,
    height: 14,
    borderRadius: 999,
  },

  sprinkleOne: {
    left: 22,
    top: 10,
    backgroundColor: "#F59E0B",
    transform: [{ rotate: "20deg" }],
  },

  sprinkleTwo: {
    left: 48,
    top: 24,
    backgroundColor: "#8B5CF6",
    transform: [{ rotate: "-28deg" }],
  },

  sprinkleThree: {
    left: 86,
    top: 6,
    backgroundColor: "#EF4444",
    transform: [{ rotate: "32deg" }],
  },

  sprinkleFour: {
    left: 132,
    top: 20,
    backgroundColor: "#14B8A6",
    transform: [{ rotate: "-18deg" }],
  },

  sprinkleFive: {
    right: 22,
    top: 10,
    backgroundColor: "#3B82F6",
    transform: [{ rotate: "-20deg" }],
  },

  sprinkleSix: {
    right: 48,
    top: 26,
    backgroundColor: "#EAB308",
    transform: [{ rotate: "28deg" }],
  },

  sprinkleSeven: {
    right: 84,
    top: 8,
    backgroundColor: "#EC4899",
    transform: [{ rotate: "-30deg" }],
  },

  sprinkleEight: {
    right: 128,
    top: 22,
    backgroundColor: "#22C55E",
    transform: [{ rotate: "16deg" }],
  },
});