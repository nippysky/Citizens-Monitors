import AppInput from "@/components/ui/AppInput";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  secureToggle?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  startIcon?: React.ReactNode;
};

export default function ControlledTextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  secureToggle,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  startIcon,
}: Props<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <AppInput
          label={label}
          placeholder={placeholder}
          value={typeof field.value === "string" ? field.value : ""}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          secureTextEntry={secureTextEntry}
          secureToggle={secureToggle}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          startIcon={startIcon}
          errorText={fieldState.error?.message}
        />
      )}
    />
  );
}