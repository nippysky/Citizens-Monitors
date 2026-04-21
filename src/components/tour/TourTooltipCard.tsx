import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  title: string;
  description: string;
  stepNumber: number;
  totalSteps: number;
  isLastStep: boolean;
  onProceed: () => void;
  onClose: () => void;
};

export default function TourTooltipCard({
  title,
  description,
  stepNumber,
  totalSteps,
  isLastStep,
  onProceed,
  onClose,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        hitSlop={14}
        onPress={onClose}
        style={({ pressed }) => [
          styles.closeButton,
          pressed && { opacity: 0.5 },
        ]}
      >
        <Ionicons name="close" size={18} color="#111A32" />
      </Pressable>

      <AppText style={styles.title}>{title}</AppText>
      <AppText style={styles.description}>{description}</AppText>

      <View style={styles.footer}>
        <AppText style={styles.stepCount}>
          {stepNumber} of {totalSteps}
        </AppText>

        <Pressable
          onPress={onProceed}
          style={({ pressed }) => [
            styles.proceedButton,
            pressed && { opacity: 0.85 },
          ]}
        >
          <AppText style={styles.proceedText}>
            {isLastStep ? "Finish" : "Proceed"}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FBF4C7",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.bold,
    color: "#111A32",
    marginBottom: 8,
    paddingRight: 28,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Theme.fonts.body.regular,
    color: "rgba(17,26,50,0.78)",
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepCount: {
    fontSize: 13,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.primary,
    paddingLeft: 2,
  },
  proceedButton: {
    backgroundColor: "#111A32",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
  },
  proceedText: {
    fontSize: 13,
    fontFamily: Theme.fonts.body.semibold,
    color: "#FFFFFF",
  },
});