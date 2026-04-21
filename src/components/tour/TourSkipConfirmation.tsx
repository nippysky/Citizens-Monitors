import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function TourSkipConfirmation({
  visible,
  onConfirm,
  onCancel,
}: Props) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(160)}
      style={styles.overlay}
    >
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <Animated.View
        entering={FadeIn.duration(260).delay(60)}
        style={styles.card}
      >
        <AppText style={styles.title}>Skip the tour?</AppText>
        <AppText style={styles.subtitle}>
          You&apos;ll miss a quick walkthrough of the app.
        </AppText>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && { opacity: 0.75 },
            ]}
            onPress={onCancel}
          >
            <AppText style={styles.cancelText}>Continue tour</AppText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.confirmBtn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={onConfirm}
          >
            <AppText style={styles.confirmText}>Skip</AppText>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    width: "82%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontFamily: Theme.fonts.body.bold,
    color: "#111A32",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.regular,
    color: "rgba(17,26,50,0.68)",
    textAlign: "center",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#F0F2F7",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 13,
    fontFamily: Theme.fonts.body.semibold,
    color: "#111A32",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#111A32",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 13,
    fontFamily: Theme.fonts.body.semibold,
    color: "#FFFFFF",
  },
});