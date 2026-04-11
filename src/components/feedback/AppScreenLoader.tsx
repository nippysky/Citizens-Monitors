import CitizenIcon from "@/svgs/app/CitizenIcon";
import { Theme } from "@/theme";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  visible: boolean;
};

export default function AppScreenLoader({ visible }: Props) {
  const translateX = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (!visible) return;

    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 120,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
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
            <CitizenIcon width={52} height={52} />
          </View>

          <View style={styles.lineTrack}>
            <Animated.View
              style={[
                styles.lineRunner,
                { transform: [{ translateX }] },
              ]}
            >
              <View style={[styles.segment, styles.red]} />
              <View style={[styles.segment, styles.blue]} />
              <View style={[styles.segment, styles.green]} />
              <View style={[styles.segment, styles.yellow]} />
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
  width: 104,
  height: 96,
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
    marginBottom: 18,
  },
  lineTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  lineRunner: {
    width: 120,
    height: 6,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    height: 6,
  },
  red: {
    backgroundColor: "#EA4335",
  },
  blue: {
    backgroundColor: "#4285F4",
  },
  green: {
    backgroundColor: "#34A853",
  },
  yellow: {
    backgroundColor: "#FBBC05",
  },
});