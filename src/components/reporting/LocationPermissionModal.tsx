import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onGranted: (geoLabel: string) => void;
};

export default function LocationPermissionModal({
  visible,
  onClose,
  onGranted,
}: Props) {
  const [phase, setPhase] = useState<"idle" | "detecting">("idle");

  useEffect(() => {
    if (!visible) {
      setPhase("idle");
    }
  }, [visible]);

  const handleEnable = async () => {
    try {
      setPhase("detecting");

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setPhase("idle");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const label = `Lat ${position.coords.latitude.toFixed(
        4
      )}, Lng ${position.coords.longitude.toFixed(4)}`;

      onGranted(label);
    } catch {
      setPhase("idle");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeHit} />

          <View style={styles.pinWrap}>
            <AppText style={styles.pinEmoji}>📍</AppText>
          </View>

          <AppText style={styles.title}>
            {phase === "detecting" ? "Enabled & detecting location" : "Enable your Location"}
          </AppText>

          <AppText style={styles.subtitle}>
            {phase === "detecting"
              ? "Please make sure you're at the polling unit for our geo-locator to map your location."
              : "Please confirm you're at the polling unit by enabling our geo-locator to map your location."}
          </AppText>

          {phase === "detecting" ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            </View>
          ) : (
            <AppButton title="Enable location" onPress={handleEnable} />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17,26,50,0.22)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    backgroundColor: "#F7F4EA",
    paddingHorizontal: 20,
    paddingVertical: 26,
    alignItems: "center",
    gap: 18,
  },
  closeHit: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
  },
  pinWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(17,26,50,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  pinEmoji: {
    fontSize: 42,
    lineHeight: 46,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
    color: Theme.colors.textMuted,
    maxWidth: 300,
  },
  loaderWrap: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
});