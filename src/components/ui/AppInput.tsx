import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { cloneElement, isValidElement, ReactNode, useMemo, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

type Props = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onPressStartIcon?: () => void;
  onPressEndIcon?: () => void;
  secureToggle?: boolean;
};

export default function AppInput({
  label,
  helperText,
  errorText,
  containerStyle,
  inputWrapperStyle,
  startIcon,
  endIcon,
  onPressStartIcon,
  onPressEndIcon,
  secureToggle = false,
  secureTextEntry,
  editable = true,
  style,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(errorText);
  const showSecureToggle = secureToggle || secureTextEntry;

  const resolvedSecureTextEntry = useMemo(() => {
    if (!showSecureToggle) return secureTextEntry;
    return !isSecureVisible;
  }, [showSecureToggle, secureTextEntry, isSecureVisible]);

  const iconColor = hasError
    ? Theme.colors.danger
    : isFocused
      ? Theme.colors.primary
      : Theme.colors.textSoft;

  const getTintedIcon = (icon: ReactNode) => {
    if (!isValidElement(icon)) return icon;

    return cloneElement(icon, {
      color: iconColor,
    } as Record<string, unknown>);
  };

  const renderStartIcon = () => {
    if (!startIcon) return null;

    const tintedStartIcon = getTintedIcon(startIcon);

    if (onPressStartIcon) {
      return (
        <Pressable onPress={onPressStartIcon} style={styles.iconButton}>
          {tintedStartIcon}
        </Pressable>
      );
    }

    return <View style={styles.iconSlot}>{tintedStartIcon}</View>;
  };

  const renderEndIcon = () => {
    if (showSecureToggle) {
      return (
        <Pressable
          onPress={() => setIsSecureVisible((prev) => !prev)}
          style={styles.iconButton}
          hitSlop={8}
        >
          <Ionicons
            name={isSecureVisible ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={iconColor}
          />
        </Pressable>
      );
    }

    if (!endIcon) return null;

    const tintedEndIcon = getTintedIcon(endIcon);

    if (onPressEndIcon) {
      return (
        <Pressable onPress={onPressEndIcon} style={styles.iconButton}>
          {tintedEndIcon}
        </Pressable>
      );
    }

    return <View style={styles.iconSlot}>{tintedEndIcon}</View>;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="bodyMedium" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          !editable && styles.inputWrapperDisabled,
          hasError && styles.inputWrapperError,
          inputWrapperStyle,
        ]}
      >
        {renderStartIcon()}
<TextInput
  {...props}
  editable={editable}
  secureTextEntry={resolvedSecureTextEntry}
  placeholderTextColor={Theme.colors.placeholder}
  style={[styles.input, !editable && styles.inputDisabled, style]}
  onFocus={(e) => {
    setIsFocused(true);
    onFocus?.(e);
  }}
  onBlur={(e) => {
    setIsFocused(false);
    onBlur?.(e);
  }}
/>

        {renderEndIcon()}
      </View>

      {hasError ? (
        <AppText variant="caption" style={styles.errorText}>
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" style={styles.helperText}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },

  label: {
    color: Theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
  },

  inputWrapper: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.58)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  inputWrapperDisabled: {
    opacity: 0.6,
  },

  inputWrapperError: {
    borderColor: Theme.colors.danger,
  },

  iconSlot: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    minHeight: 56,
    color: Theme.colors.text,
    fontSize: 16,
    fontFamily: Theme.fonts.body.regular,
    paddingVertical: 0,
    backgroundColor: "transparent",
  },

  inputDisabled: {},

  helperText: {
    color: Theme.colors.textMuted,
  },

  errorText: {
    color: Theme.colors.danger,
  },
});