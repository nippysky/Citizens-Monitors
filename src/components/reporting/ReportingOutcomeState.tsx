import { StyleSheet, View } from "react-native";

import AuthShell from "@/components/auth/AuthShell";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import CheckIcon from "@/svgs/app/CheckIcon";
import CitizenIcon from "@/svgs/app/CitizenIcon";
import { Theme } from "@/theme";

type Variant = "success" | "warning" | "error";

type Props = {
  variant?: Variant;
  title: string;
  subtitle: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  infoCardText?: string;
  showConfetti?: boolean;
};

function OutcomeSprinkles() {
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

export default function ReportingOutcomeState({
  variant = "success",
  title,
  subtitle,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  infoCardText,
  showConfetti = false,
}: Props) {
  const isSuccess = variant === "success";
  const isError = variant === "error";

  return (
    <AuthShell topSlot={<CitizenIcon width={28} height={28} />} scroll={false}>
      {showConfetti ? <OutcomeSprinkles /> : null}

      <View style={styles.container}>
        <View style={styles.centerContent}>
          {isSuccess ? (
            <CheckIcon width={58} height={58} />
          ) : (
            <View
              style={[
                styles.fallbackIconWrap,
                isError ? styles.fallbackIconWrapError : styles.fallbackIconWrapWarning,
              ]}
            >
              <AppText style={styles.fallbackIconText}>!</AppText>
            </View>
          )}

          <View style={styles.textWrap}>
            <AppText variant="heading" style={styles.title}>
              {title}
            </AppText>

            <AppText style={styles.subtitle}>{subtitle}</AppText>
          </View>

          {infoCardText ? (
            <View style={styles.infoCard}>
              <AppText style={styles.infoCardText}>{infoCardText}</AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.actionsWrap}>
          {secondaryActionLabel && onSecondaryAction ? (
            <AppButton
              title={secondaryActionLabel}
              variant="secondary"
              onPress={onSecondaryAction}
            />
          ) : null}

          <AppButton title={primaryActionLabel} onPress={onPrimaryAction} />
        </View>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 110,
    paddingBottom: 8,
  },

  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    paddingHorizontal: 22,
  },

  textWrap: {
    gap: 10,
    alignItems: "center",
  },

  title: {
    textAlign: "center",
    fontSize: 28,
    lineHeight: 34,
    color: Theme.colors.text,
  },

  subtitle: {
    textAlign: "center",
    fontSize: 17,
    lineHeight: 26,
    color: Theme.colors.textMuted,
    maxWidth: 330,
  },

  actionsWrap: {
    gap: 12,
  },

  fallbackIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackIconWrapError: {
    backgroundColor: "#FFE9E4",
  },

  fallbackIconWrapWarning: {
    backgroundColor: "#FFF3D9",
  },

  fallbackIconText: {
    fontSize: 32,
    lineHeight: 34,
    color: "#E4572E",
    fontFamily: Theme.fonts.heading.bold,
  },

  infoCard: {
    marginTop: 6,
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#F7ECE7",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  infoCardText: {
    textAlign: "left",
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
  },

  sprinklesWrap: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    height: 72,
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