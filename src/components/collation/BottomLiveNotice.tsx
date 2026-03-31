import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  title: string;
  actionLabel: string;
  onPress?: () => void;
};

export default function BottomLiveNotice({
  title,
  actionLabel,
  onPress,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="megaphone-outline" size={18} color="#F59E0B" />
      </View>

      <View style={styles.content}>
        <AppText style={styles.title}>{title}</AppText>

        <Pressable onPress={onPress} style={styles.linkButton}>
          <AppText style={styles.linkText}>{actionLabel} &gt;</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: "#FFF9EA",
    borderWidth: 1,
    borderColor: "#F4E3B2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFF1C7",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  linkButton: {
    alignSelf: "flex-start",
  },

  linkText: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});