import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { Theme } from "@/theme";
import CheckIcon from "@/svgs/app/CheckIcon";

type Props = {
  variant: "success" | "error";
  title: string;
  subtitle: string;
  infoCardText?: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  showConfetti?: boolean;
  children?: ReactNode;
};

function ConfettiTop() {
  return (
    <View pointerEvents="none" style={styles.confettiWrap}>
      <View style={[styles.confetti, styles.c1]} />
      <View style={[styles.confetti, styles.c2]} />
      <View style={[styles.confetti, styles.c3]} />
      <View style={[styles.confetti, styles.c4]} />
      <View style={[styles.confetti, styles.c5]} />
      <View style={[styles.confetti, styles.c6]} />
      <View style={[styles.confetti, styles.c7]} />
      <View style={[styles.confetti, styles.c8]} />
      <View style={[styles.confetti, styles.c9]} />
      <View style={[styles.confetti, styles.c10]} />
      <View style={[styles.confetti, styles.c11]} />
      <View style={[styles.confetti, styles.c12]} />
      <View style={[styles.streamer, styles.s1]} />
      <View style={[styles.streamer, styles.s2]} />
      <View style={[styles.streamer, styles.s3]} />
      <View style={[styles.streamer, styles.s4]} />
      <View style={[styles.streamer, styles.s5]} />
      <View style={[styles.streamer, styles.s6]} />
    </View>
  );
}

function OutcomeIcon({ variant }: { variant: "success" | "error" }) {
  const isSuccess = variant === "success";

  if (isSuccess) {
    return <CheckIcon />;
  }

  return (
    <View style={styles.errorBadge}>
      <Ionicons name="alert" size={34} color="#FFFFFF" />
    </View>
  );
}

export default function ReportingOutcomeState({
  variant,
  title,
  subtitle,
  infoCardText,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  showConfetti = false,
  children,
}: Props) {
  const isSuccess = variant === "success";
  const insets = useSafeAreaInsets();
  const showBottomPrimary = isSuccess || !!children;

  return (
    <AppGradientScreen scroll={false}>
      {showConfetti ? <ConfettiTop /> : null}

      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: showBottomPrimary
                ? Math.max(insets.bottom, 20) + 120
                : Math.max(insets.bottom, 20) + 36,
            },
          ]}
        >
          <View style={styles.headerRow}>
            {!isSuccess ? <BackButton label="" /> : <View style={styles.spacer} />}
          </View>

          <View style={styles.mainContent}>
            <OutcomeIcon variant={variant} />

            <View style={styles.textBlock}>
              <AppText style={styles.title}>{title}</AppText>
              <AppText style={styles.subtitle}>{subtitle}</AppText>
            </View>

            {children ? <View style={styles.childrenWrap}>{children}</View> : null}

            {!children && !isSuccess && secondaryActionLabel && onSecondaryAction ? (
              <Pressable onPress={onSecondaryAction} style={styles.secondaryBtn}>
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.secondaryBtnText}>
                  {secondaryActionLabel}
                </AppText>
              </Pressable>
            ) : null}

            {!children && !isSuccess ? (
              <AppButton
                title={primaryActionLabel}
                onPress={onPrimaryAction}
                style={[styles.primaryBtn, styles.primaryBtnDanger]}
              />
            ) : null}

            {infoCardText ? (
              <View style={styles.infoCard}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="alert" size={14} color="#FFFFFF" />
                </View>

                <AppText style={styles.infoCardText}>{infoCardText}</AppText>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {showBottomPrimary ? (
          <View
            style={[
              styles.footer,
              {
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            <AppButton
              title={primaryActionLabel}
              onPress={onPrimaryAction}
              style={styles.footerPrimaryBtn}
            />
          </View>
        ) : null}
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    flexGrow: 1,
  },

  headerRow: {
    minHeight: 34,
    justifyContent: "center",
  },

  spacer: {
    width: 32,
    height: 32,
  },

  mainContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 22,
  },

  errorBadge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FF1F12",
    alignItems: "center",
    justifyContent: "center",
  },

  textBlock: {
    alignItems: "center",
    gap: 10,
    maxWidth: 340,
    marginTop: 18,
  },

  title: {
    fontSize: 23,
    lineHeight: 30,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  childrenWrap: {
    width: "100%",
    marginTop: 28,
  },

  secondaryBtn: {
    width: "100%",
    minHeight: 68,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 26,
  },

  secondaryBtnText: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  primaryBtn: {
    width: "100%",
    marginTop: 18,
    marginVertical: 0,
    minHeight: 68,
    borderRadius: 18,
  },

  primaryBtnDanger: {
    backgroundColor: "#FF4B00",
  },

  infoCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#F1E6E1",
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 28,
  },

  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F45A17",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },

  infoCardText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#50565D",
  },

  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 0,
    paddingTop: 8,
    backgroundColor: "transparent",
  },

  footerPrimaryBtn: {
    marginVertical: 0,
    minHeight: 64,
    borderRadius: 18,
  },

  confettiWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 132,
  },

  confetti: {
    position: "absolute",
    width: 4,
    height: 18,
    borderRadius: 999,
  },

  streamer: {
    position: "absolute",
    width: 3,
    height: 20,
    borderRadius: 999,
  },

  c1: {
    left: 38,
    top: 14,
    backgroundColor: "#F59E0B",
    transform: [{ rotate: "20deg" }],
  },
  c2: {
    left: 82,
    top: 42,
    backgroundColor: "#8B5CF6",
    transform: [{ rotate: "-30deg" }],
  },
  c3: {
    left: 154,
    top: 18,
    backgroundColor: "#EF4444",
    transform: [{ rotate: "28deg" }],
  },
  c4: {
    left: 244,
    top: 44,
    backgroundColor: "#14B8A6",
    transform: [{ rotate: "-18deg" }],
  },
  c5: {
    left: 330,
    top: 14,
    backgroundColor: "#3B82F6",
    transform: [{ rotate: "20deg" }],
  },
  c6: {
    right: 108,
    top: 18,
    backgroundColor: "#F97316",
    transform: [{ rotate: "-12deg" }],
  },
  c7: {
    right: 62,
    top: 42,
    backgroundColor: "#EAB308",
    transform: [{ rotate: "30deg" }],
  },
  c8: {
    right: 34,
    top: 12,
    backgroundColor: "#22C55E",
    transform: [{ rotate: "-20deg" }],
  },
  c9: {
    right: 138,
    top: 40,
    backgroundColor: "#60A5FA",
    transform: [{ rotate: "14deg" }],
  },
  c10: {
    right: 224,
    top: 10,
    backgroundColor: "#EC4899",
    transform: [{ rotate: "-28deg" }],
  },
  c11: {
    right: 292,
    top: 46,
    backgroundColor: "#A855F7",
    transform: [{ rotate: "22deg" }],
  },
  c12: {
    left: 118,
    top: 24,
    backgroundColor: "#F472B6",
    transform: [{ rotate: "-18deg" }],
  },

  s1: {
    left: 18,
    top: 10,
    backgroundColor: "#F59E0B",
    transform: [{ rotate: "28deg" }],
  },
  s2: {
    left: 62,
    top: 34,
    backgroundColor: "#8B5CF6",
    transform: [{ rotate: "-30deg" }],
  },
  s3: {
    right: 24,
    top: 8,
    backgroundColor: "#22C55E",
    transform: [{ rotate: "-18deg" }],
  },
  s4: {
    right: 76,
    top: 34,
    backgroundColor: "#EAB308",
    transform: [{ rotate: "28deg" }],
  },
  s5: {
    right: 150,
    top: 10,
    backgroundColor: "#3B82F6",
    transform: [{ rotate: "-24deg" }],
  },
  s6: {
    left: 306,
    top: 12,
    backgroundColor: "#14B8A6",
    transform: [{ rotate: "22deg" }],
  },
});