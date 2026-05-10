import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type SecurityFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Props = {
  value: SecurityFormState;
  onChange: (value: SecurityFormState) => void;
  onSave: () => void;
  saving?: boolean;
};

const SecurityBottomSheet = forwardRef<BottomSheetModal, Props>(
  function SecurityBottomSheet({ value, onChange, onSave, saving = false }, ref) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["64%"], []);

    const closeSheet = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        topInset={insets.top + 12}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 22 },
          ]}
        >
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Update Security</AppText>

            <Pressable onPress={closeSheet} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <AppInput
            label="Current Password"
            value={value.currentPassword}
            onChangeText={(currentPassword) =>
              onChange({ ...value, currentPassword })
            }
            placeholder="Current password"
            secureTextEntry
            secureToggle
          />

          <AppInput
            label="New Password"
            value={value.newPassword}
            onChangeText={(newPassword) => onChange({ ...value, newPassword })}
            placeholder="New password"
            secureTextEntry
            secureToggle
          />

          <AppInput
            label="Confirm New Password"
            value={value.confirmPassword}
            onChangeText={(confirmPassword) =>
              onChange({ ...value, confirmPassword })
            }
            placeholder="Confirm new password"
            secureTextEntry
            secureToggle
          />

          <AppButton
            title="Save Changes"
            onPress={onSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default SecurityBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: "rgba(17, 26, 50, 0.12)",
    width: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  header: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#DFE4EB",
    marginHorizontal: -16,
  },
  saveButton: {
    marginVertical: 0,
  },
});