import AppText from "@/components/ui/AppText";
import { useKeyboardAwareInput } from "@/components/ui/AppKeyboardAwareScrollView";
import { Theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  cloneElement,
  ComponentType,
  isValidElement,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
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
  multiline?: boolean;
  numberOfLines?: number;
  textareaMinHeight?: number;
  /** Override the underlying TextInput. Pass BottomSheetTextInput when using
   *  AppInput inside a @gorhom/bottom-sheet to fix Android keyboard handling. */
  InputComponent?: ComponentType<TextInputProps>;
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
  multiline = false,
  numberOfLines,
  textareaMinHeight = 110,
  InputComponent,
  ...props
}: Props) {
  // Cast to typeof TextInput so ref and all native props typecheck correctly.
  // BottomSheetTextInput is API-compatible and safe to pass here.
  const ResolvedInput = (InputComponent ?? TextInput) as typeof TextInput;
  const inputRef = useRef<TextInput | null>(null);
  const keyboardAware = useKeyboardAwareInput();

  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(errorText);
  const showSecureToggle = !multiline && (secureToggle || secureTextEntry);

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

    return (
      <View style={[styles.iconSlot, multiline && styles.iconSlotMultiline]}>
        {tintedStartIcon}
      </View>
    );
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
        <Pressable
          onPress={onPressEndIcon}
          style={[styles.iconButton, multiline && styles.iconButtonMultiline]}
        >
          {tintedEndIcon}
        </Pressable>
      );
    }

    return (
      <View style={[styles.iconSlot, multiline && styles.iconSlotMultiline]}>
        {tintedEndIcon}
      </View>
    );
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
          multiline && styles.inputWrapperMultiline,
          !editable && styles.inputWrapperDisabled,
          hasError && styles.inputWrapperError,
          isFocused && !hasError && styles.inputWrapperFocused,
          multiline && { minHeight: textareaMinHeight },
          inputWrapperStyle,
        ]}
      >
        {renderStartIcon()}

        <ResolvedInput
          ref={inputRef}
          {...props}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={resolvedSecureTextEntry}
          placeholderTextColor={Theme.colors.placeholder}
          textAlignVertical={multiline ? "top" : "center"}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            !editable && styles.inputDisabled,
            style,
          ]}
          onFocus={(event) => {
            setIsFocused(true);
            keyboardAware?.notifyInputFocus(inputRef.current);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
        />

        {!multiline ? renderEndIcon() : null}
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

  inputWrapperMultiline: {
    alignItems: "flex-start",
    paddingTop: 14,
    paddingBottom: 14,
  },

  inputWrapperFocused: {
    borderColor: Theme.colors.primary,
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

  iconSlotMultiline: {
    marginTop: 2,
  },

  iconButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  iconButtonMultiline: {
    marginTop: 2,
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

  inputMultiline: {
    minHeight: 84,
    paddingTop: 0,
    paddingBottom: 0,
    lineHeight: 22,
  },

  inputDisabled: {},

  helperText: {
    color: Theme.colors.textMuted,
  },

  errorText: {
    color: Theme.colors.danger,
  },
});