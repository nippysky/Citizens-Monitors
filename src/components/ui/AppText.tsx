import { Theme } from "@/theme";
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from "react-native";

type Variant =
  | "body"
  | "bodyMedium"
  | "label"
  | "caption"
  | "title"
  | "heading"
  | "screenTitle"
  | "button"
  | "link";

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export default function AppText({
  variant = "body",
  color,
  style,
  ...props
}: Props) {
  return (
    <Text
      {...props}
      style={[styles.base, styles[variant], color ? { color } : null, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.regular,
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Theme.fonts.body.regular,
  },

  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Theme.fonts.body.medium,
  },

  label: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.medium,
  },

  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.regular,
    color: Theme.colors.textMuted,
  },

  title: {
    fontSize: 29,
    lineHeight: 33,
    fontFamily: Theme.fonts.heading.semibold,
    letterSpacing: -0.4,
  },

  heading: {
    fontSize: 37,
    lineHeight: 41,
    fontFamily: Theme.fonts.heading.semibold,
    letterSpacing: -0.8,
  },

  screenTitle: {
    fontSize: 58,
    lineHeight: 53,
    fontFamily: Theme.fonts.heading.semibold,
    letterSpacing: -1.25,
  },

  button: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.semibold,
  },

  link: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.primary,
  },
});