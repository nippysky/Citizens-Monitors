import AppText from "@/components/ui/AppText";
import GoogleIcon from "@/svgs/GoogleIcon";
import { Theme } from "@/theme";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export default function SocialButton({
  title,
  onPress,
  style,
  disabled = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        <GoogleIcon width={24} height={24} />
        <AppText style={styles.text}>{title}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 18,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 18,
    justifyContent: "center",
  },

  content: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  text: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.text,
    marginTop: 1,
  },

  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },

  disabled: {
    opacity: 0.55,
  },
});