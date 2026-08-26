// ─── src/components/collation/FlagReasonBottomSheet.tsx ───────────────────
// Lightweight reason-capture sheet for flagging a Review Reports submission.
// The real /collation/user-action "flag" endpoint only requires a
// `flagReason` string alongside the target id — no location/media, unlike
// the older, heavier FlagReportBottomSheet (a separate, unrelated feature).

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
import { Theme } from "@/theme";

export type FlagReasonSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

type Props = {
  submitting?: boolean;
  onSubmit: (reason: string) => void;
};

const FlagReasonBottomSheet = forwardRef<FlagReasonSheetHandle, Props>(
  function FlagReasonBottomSheet({ submitting, onSubmit }, ref) {
    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);
    const { handleSheetChange } = useBottomSheetBackHandler(sheetRef);
    const snaps = useMemo(() => ["50%"], []);
    const [reason, setReason] = useState("");

    useImperativeHandle(ref, () => ({
      present: () => {
        setReason("");
        requestAnimationFrame(() => sheetRef.current?.present());
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const close = () => sheetRef.current?.dismiss();
    const canSubmit = reason.trim().length > 4 && !submitting;

    const submit = () => {
      if (!canSubmit) return;
      onSubmit(reason.trim());
    };

    return (
      <BottomSheetModal
        ref={sheetRef}
        onChange={handleSheetChange}
        snapPoints={snaps}
        enablePanDownToClose
        topInset={insets.top + 12}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={(p) => (
          <BottomSheetBackdrop
            {...p}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.bg}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 18 },
          ]}
        >
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Flag This Report</AppText>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.warnBox}>
            <View style={styles.warnIcon}>
              <Ionicons name="flag" size={16} color="#F04A1D" />
            </View>
            <AppText style={styles.warnText}>
              Tell us why this submission looks inaccurate or false. Your
              flag is recorded and reviewed alongside others from the
              community.
            </AppText>
          </View>

          <View style={styles.sec}>
            <AppText style={styles.label}>Reason for flagging</AppText>
            <AppInput
              placeholder="e.g. Evidence mismatch, Suspicious numbers..."
              value={reason}
              onChangeText={setReason}
              multiline
              inputWrapperStyle={styles.taWrap}
              style={styles.ta}
            />
          </View>
        </BottomSheetScrollView>

        <View
          style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}
        >
          <AppButton
            title={submitting ? "Submitting..." : "Submit Flag"}
            onPress={submit}
            disabled={!canSubmit}
            loading={submitting}
            style={{ marginVertical: 0 }}
          />
        </View>
      </BottomSheetModal>
    );
  }
);

export default FlagReasonBottomSheet;

const styles = StyleSheet.create({
  bg: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: { backgroundColor: "rgba(17,26,50,0.12)", width: 44 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 18 },
  header: {
    minHeight: 58,
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
  warnBox: {
    borderRadius: 18,
    backgroundColor: "#FFF1EC",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  warnIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(240,74,29,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  warnText: { flex: 1, fontSize: 13, lineHeight: 19, color: Theme.colors.text },
  sec: { gap: 10 },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.text,
  },
  taWrap: { minHeight: 130, alignItems: "flex-start", paddingTop: 14 },
  ta: { minHeight: 100, textAlignVertical: "top" },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(17,26,50,0.07)",
    backgroundColor: Theme.colors.background,
  },
});
