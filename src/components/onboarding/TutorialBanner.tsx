import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  url?: string;
};

export default function TutorialBanner({
  url = "https://www.youtube.com/",
}: Props) {
  const handleOpen = async () => {
    try {
      await Linking.openURL(url);
    } catch {
      // noop
    }
  };

  return (
    <Pressable onPress={handleOpen} style={styles.card}>
      {/* Outer soft red ring → inner solid red circle → white play icon */}
      <View style={styles.iconOuter}>
        <View style={styles.iconInner}>
          <Ionicons name="play" size={14} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.textWrap}>
        <AppText style={styles.title}>
          Feeling stuck here? Watch tutorial guide
        </AppText>

        <View style={styles.linkRow}>
          <AppText style={styles.link}>Watch this quick video</AppText>
          <Ionicons
            name="open-outline"
            size={14}
            color={Theme.colors.primary}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.2,
    borderColor: Theme.colors.primary,
    borderRadius: 22,
    backgroundColor: "rgba(5, 163, 156, 0.04)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  /* Outer semi-transparent red ring */
  iconOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  /* Inner solid red circle */
  iconInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  link: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
    textDecorationLine: "underline",
  },
});