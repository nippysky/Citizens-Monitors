// Branded loader: Citizen icon + smooth multi-color bar animation.

import { useEffect } from "react";
import { Animated, Easing, Modal, StyleSheet, View } from "react-native";
import { useAnimatedValue } from "@/hooks/useAnimatedValue";

import CitizenIcon from "@/svgs/app/CitizenIcon";
import { Theme } from "@/theme";

type Props = { visible: boolean };

export default function AppScreenLoader({ visible }: Props) {
  const translateX = useAnimatedValue(-120);

  useEffect(() => {
    if (!visible) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 120,
          duration: 1000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -120,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
      translateX.setValue(-120);
    };
  }, [translateX, visible]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <CitizenIcon width={48} height={48} />
          </View>

          <View style={styles.lineTrack}>
            <Animated.View
              style={[styles.lineRunner, { transform: [{ translateX }] }]}
            >
              <View style={[styles.segment, { backgroundColor: Theme.colors.primary }]} />
              <View style={[styles.segment, { backgroundColor: "#F29B2F" }]} />
              <View style={[styles.segment, { backgroundColor: "#E84C3D" }]} />
              <View style={[styles.segment, { backgroundColor: "#3C63E5" }]} />
            </Animated.View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 26, 50, 0.32)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: 100,
    height: 92,
    borderRadius: 18,
    backgroundColor: Theme.colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    overflow: "hidden",
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  lineTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  lineRunner: {
    width: 120,
    height: 5,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    height: 5,
  },
});