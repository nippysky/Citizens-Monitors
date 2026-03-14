import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef } from "react";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";

export type SecurityFormState = {
  password: string;
  confirmPassword: string;
};

type Props = {
  value: SecurityFormState;
  onChange: (value: SecurityFormState) => void;
  onSave: () => void;
};

const SecurityBottomSheet = forwardRef<BottomSheetModal, Props>(function SecurityBottomSheet(
  { value, onChange, onSave },
  ref
) {
  return (
    <AppBottomSheet ref={ref} title="Update Security" snapPoints={["54%"]}>
      <AppInput
        label="New Password"
        value={value.password}
        onChangeText={(password) => onChange({ ...value, password })}
        placeholder="Password"
        secureTextEntry
        secureToggle
      />

      <AppInput
        label="Confirm Password"
        value={value.confirmPassword}
        onChangeText={(confirmPassword) =>
          onChange({ ...value, confirmPassword })
        }
        placeholder="Password"
        secureTextEntry
        secureToggle
      />

      <AppButton title="Save Changes" onPress={onSave} />
    </AppBottomSheet>
  );
});

export default SecurityBottomSheet;