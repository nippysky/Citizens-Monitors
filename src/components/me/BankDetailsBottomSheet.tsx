// ─── src/components/me/BankDetailsBottomSheet.tsx ─────────────────────────────
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, RefObject, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MeOptionsSheet from "@/components/me/MeOptionsSheet";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type BankFormState = {
  bankName: string;
  accountNumber: string;
  accountFullName: string;
};

type Props = {
  value: BankFormState;
  onChange: (value: BankFormState) => void;
  onSave: () => void;
  bankSheetRef: RefObject<BottomSheetModal | null>;
  bankOptions: string[];
};

const BankDetailsBottomSheet = forwardRef<BottomSheetModal, Props>(
  function BankDetailsBottomSheet({ value, onChange, onSave, bankSheetRef, bankOptions }, ref) {
    const insets = useSafeAreaInsets();
    const snaps = useMemo(() => ["78%"], []);

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) ref.current.dismiss();
    };

    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={snaps}
          enablePanDownToClose
          topInset={insets.top + 12}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backdropComponent={(p) => (
            <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.32} pressBehavior="close" />
          )}
          handleIndicatorStyle={styles.handle}
          backgroundStyle={styles.bg}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 22 }]}
          >
            <View style={styles.header}>
              <AppText style={styles.headerTitle}>Your Bank Detail</AppText>
              <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.divider} />

            {/* Info banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={18} color="#B45309" />
              <AppText style={styles.infoBannerText}>
                As a verified observer, you are entitled to compensation when Citizen Monitors licences anonymized election data per Section 149 of the Electoral Act 2022 and our data sharing policy.
              </AppText>
            </View>

            <View style={styles.section}>
              <AppText style={styles.sectionTitle}>Bank Details</AppText>
              <AppText style={styles.sectionSub}>
                Please Submit your bank account details for volunteering allowance.
              </AppText>
            </View>

            <AppSelectField
              label="Bank Name"
              value={value.bankName}
              placeholder="Select your bank"
              onPress={() => bankSheetRef.current?.present()}
            />

            <AppInput
              label="Account Number"
              value={value.accountNumber}
              onChangeText={(accountNumber) => onChange({ ...value, accountNumber })}
              placeholder="Your account number"
              keyboardType="number-pad"
              maxLength={10}
            />

            <AppInput
              label="Your Full Name"
              value={value.accountFullName}
              onChangeText={(accountFullName) => onChange({ ...value, accountFullName })}
              placeholder="Your names"
            />

            <AppButton title="Submit" onPress={onSave} style={{ marginVertical: 0 }} />
          </BottomSheetScrollView>
        </BottomSheetModal>

        <MeOptionsSheet
          ref={bankSheetRef}
          title="Select Bank"
          options={bankOptions}
          selectedValue={value.bankName}
          onSelect={(bankName) => onChange({ ...value, bankName })}
        />
      </>
    );
  }
);

export default BankDetailsBottomSheet;

const styles = StyleSheet.create({
  bg: { backgroundColor: Theme.colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  handle: { backgroundColor: "rgba(17,26,50,0.12)", width: 44 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 18, lineHeight: 24, fontFamily: Theme.fonts.heading.semibold, color: Theme.colors.text },
  closeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.74)", alignItems: "center", justifyContent: "center" },
  divider: { height: 1, backgroundColor: "#DFE4EB", marginHorizontal: -16 },

  infoBanner: {
    borderRadius: 16, backgroundColor: "#FFF8EC", borderWidth: 1, borderColor: "#F6E1B7",
    paddingHorizontal: 14, paddingVertical: 14, flexDirection: "row", alignItems: "flex-start", gap: 10,
  },
  infoBannerText: { flex: 1, fontSize: 13, lineHeight: 19, color: "#9A6700" },

  section: { gap: 6 },
  sectionTitle: { fontSize: 16, lineHeight: 22, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  sectionSub: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },
});