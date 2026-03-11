import { Theme } from "@/theme";
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

type Props = {
  values: string[];
  onChangeDigit: (index: number, value: string) => void;
  onKeyPressDigit: (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => void;
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
};

export default function OtpInputRow({
  values,
  onChangeDigit,
  onKeyPressDigit,
  inputRefs,
}: Props) {
  return (
    <View style={styles.row}>
      {values.map((value, index) => {
        const isFilled = value.length > 0;

        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={value}
            onChangeText={(text) => onChangeDigit(index, text)}
            onKeyPress={(e) => onKeyPressDigit(index, e)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={1}
            style={[styles.input, isFilled && styles.inputFilled]}
            selectionColor={Theme.colors.primary}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  input: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    textAlign: "center",
    fontSize: 22,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  inputFilled: {
    borderColor: Theme.colors.primary,
  },
});