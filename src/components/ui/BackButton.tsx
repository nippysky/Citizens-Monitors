import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  label?: string;
  onPress?: () => void;
};

export default function BackButton({ label = "Go back", onPress }: Props) {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const hasLabel = label.trim().length > 0;

  return (
    <Pressable onPress={handlePress} style={styles.button} hitSlop={10}>
      <View style={styles.inner}>
        <Ionicons name="chevron-back" size={22} color={Theme.colors.text} />
        {hasLabel ? (
          <AppText variant="body" style={styles.label}>
            {label}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    paddingTop: 2,
    paddingBottom: 8,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    color: Theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
  },
});