import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type Props = {
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
};

export default function CollationAnimatedProgressBar({
  progress,
  height = 8,
  color = "#05A39C",
  trackColor = "#E8ECF2",
}: Props) {
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [animated, progress]);

  const width = animated.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    borderRadius: 999,
  },
});