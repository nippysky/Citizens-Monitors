import { Pressable, StyleSheet } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  label: string;
  selected?: boolean;
  highlighted?: boolean;
  muted?: boolean;
  onPress?: () => void;
};

export default function CalendarDayCell({
  label,
  selected = false,
  highlighted = false,
  muted = false,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cell,
        selected && styles.cellSelected,
        highlighted && !selected && styles.cellHighlighted,
      ]}
    >
      <AppText
        style={[
          styles.text,
          muted && styles.textMuted,
          (selected || highlighted) && styles.textHighlighted,
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  cellSelected: {
    backgroundColor: "rgba(25,183,176,0.16)",
  },

  cellHighlighted: {
    backgroundColor: "rgba(25,183,176,0.08)",
  },

  text: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  textMuted: {
    color: "#7F8AA3",
  },

  textHighlighted: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});