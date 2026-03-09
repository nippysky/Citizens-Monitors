import AuthBottomLines from "@/svgs/AuthBottomLines";
import AuthTopLines from "@/svgs/AuthTopLines";
import { Theme } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";


type Props = {
  children: ReactNode;
};

export default function AuthBackground({ children }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[
          Theme.colors.authBgTop,
          Theme.colors.authBgMid,
          Theme.colors.authBgBottom,
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.topLines}>
        <AuthTopLines />
      </View>

      <View pointerEvents="none" style={styles.bottomLines}>
        <AuthBottomLines />
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
  },
  topLines: {
    position: "absolute",
    top: 108,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  bottomLines: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 88,
    zIndex: 0,
  },
});