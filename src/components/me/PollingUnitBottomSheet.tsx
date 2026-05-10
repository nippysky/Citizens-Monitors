import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type PollingUnitFormState = {
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
};

type Props = {
  value: PollingUnitFormState;
};

function ReadOnlyField({
  label,
  value,
  placeholder,
}: {
  label: string;
  value?: string;
  placeholder: string;
}) {
  const filled = Boolean(value?.trim());

  return (
    <View style={styles.fieldWrap}>
      <AppText style={styles.fieldLabel}>{label}</AppText>

      <View style={styles.readOnlyField}>
        <AppText style={[styles.fieldValue, !filled && styles.placeholder]}>
          {filled ? value : placeholder}
        </AppText>

        <View style={styles.lockPill}>
          <Ionicons
            name="lock-closed-outline"
            size={14}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.lockText}>Locked</AppText>
        </View>
      </View>
    </View>
  );
}

const PollingUnitBottomSheet = forwardRef<BottomSheetModal, Props>(
  function PollingUnitBottomSheet({ value }, ref) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["64%"], []);

    const close = () => {
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
            <AppText style={styles.headerTitle}>My Polling Unit</AppText>

            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.noteBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Theme.colors.primary}
              style={styles.noteIcon}
            />
            <AppText style={styles.noteText}>
              Your polling unit is locked after onboarding. Contact support if
              this information is incorrect.
            </AppText>
          </View>

          <ReadOnlyField
            label="State"
            value={value.state}
            placeholder="No state assigned"
          />

          <ReadOnlyField
            label="Local Government Area"
            value={value.lga}
            placeholder="No LGA assigned"
          />

          <ReadOnlyField
            label="Ward"
            value={value.ward}
            placeholder="No ward assigned"
          />

          <ReadOnlyField
            label="Polling Unit"
            value={value.pollingUnit}
            placeholder="No polling unit assigned"
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default PollingUnitBottomSheet;

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
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "rgba(5,163,156,0.10)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  noteIcon: {
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  readOnlyField: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.58)",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fieldValue: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.text,
  },
  placeholder: {
    color: Theme.colors.placeholder,
  },
  lockPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(17,26,50,0.06)",
  },
  lockText: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
});