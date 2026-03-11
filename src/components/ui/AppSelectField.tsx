import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  label: string;
  value?: string;
  placeholder: string;
  onPress?: () => void;
  leftIcon?: React.ReactNode;
};

export default function AppSelectField({
  label,
  value,
  placeholder,
  onPress,
  leftIcon,
}: Props) {
  const filled = Boolean(value);

  return (
    <View style={styles.wrap}>
      <AppText variant="bodyMedium" style={styles.label}>
        {label}
      </AppText>

      <Pressable onPress={onPress} style={styles.field}>
        <View style={styles.left}>
          {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
          <AppText style={[styles.value, !filled && styles.placeholder]}>
            {filled ? value : placeholder}
          </AppText>
        </View>

        <Ionicons name="chevron-down" size={18} color={Theme.colors.textSoft} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: Theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  field: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.58)",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  leftIcon: {
    marginRight: 10,
  },
  value: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
  },
  placeholder: {
    color: Theme.colors.placeholder,
  },
});