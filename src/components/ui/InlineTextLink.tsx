import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  underline?: boolean;
  centered?: boolean;
};

export default function InlineTextLink({
  label,
  onPress,
  underline = false,
  centered = false,
}: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={centered ? styles.centered : undefined}>
      <AppText
        variant="link"
        style={[
          styles.text,
          underline && styles.underline,
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignSelf: "center",
  },
  text: {
    color: Theme.colors.primary,
  },
  underline: {
    textDecorationLine: "underline",
    textDecorationColor: Theme.colors.primary,
  },
});