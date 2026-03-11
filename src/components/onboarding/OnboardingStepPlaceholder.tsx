import { StyleSheet, View } from "react-native";

import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  title: string;
  description: string;
  step: 2 | 3 | 4;
};

export default function OnboardingStepPlaceholder({
  title,
  description,
  step,
}: Props) {
  return (
    <View style={styles.body}>
      <AppText variant="title" style={styles.heading}>
        {title}
      </AppText>

      <AppText style={styles.subheading}>{description}</AppText>

      <TutorialBanner />

      <View style={styles.placeholderBox}>
        <AppText style={styles.placeholderTitle}>Step {step} placeholder</AppText>
        <AppText style={styles.placeholderText}>
          This step is intentionally scaffolded and ready for the real UI.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: 22,
    gap: 18,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
  },
  subheading: {
    color: Theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: -8,
  },
  placeholderBox: {
    minHeight: 220,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.46)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  placeholderTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
});