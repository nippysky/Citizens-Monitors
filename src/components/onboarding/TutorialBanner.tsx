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
      // noop for now
    }
  };

  return (
    <Pressable onPress={handleOpen} style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="play" size={16} color="#EF4444" />
      </View>

      <View style={styles.textWrap}>
        <AppText style={styles.title}>
          Feeling stuck here? Watch tutorial guide
        </AppText>

        <View style={styles.linkRow}>
          <AppText style={styles.link}>Watch this quick video</AppText>
          <Ionicons name="open-outline" size={14} color={Theme.colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(235, 92, 92, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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
  },
});