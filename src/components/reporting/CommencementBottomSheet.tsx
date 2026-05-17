import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import TimePickerSheet from "@/components/reporting/TimePickerSheet";
import AppButton from "@/components/ui/AppButton";
import AppSelectField from "@/components/ui/AppSelectField";
import AppText from "@/components/ui/AppText";
import { CommencementContext } from "@/lib/reporting";
import { Theme } from "@/theme";

type Props = {
  contextData: CommencementContext | null;
  onProceedResult: (time: string) => void;
  onProceedIncident: () => void;
};

type Step = "choice" | "time";

function resolveElectionTitle(contextData: CommencementContext | null): string {
  return contextData?.electionTitle?.trim() || "this election";
}

function resolvePollingUnitName(contextData: CommencementContext | null): string {
  return contextData?.pollingUnitName?.trim() || "Your Polling Unit";
}

function resolveUnitMeta(contextData: CommencementContext | null): string {
  const parts = [
    contextData?.pollingUnitCode,
    contextData?.ward,
    contextData?.lga,
    contextData?.state,
  ]
    .map((item) => item?.trim())
    .filter(Boolean);

  return parts.length ? parts.join(" · ") : "Polling unit context will be attached to this report.";
}

const CommencementBottomSheet = forwardRef<BottomSheetModal, Props>(
  function CommencementBottomSheet(
    { contextData, onProceedIncident, onProceedResult },
    ref
  ) {
    const snapPoints = useMemo(() => ["78%"], []);

    const [step, setStep] = useState<Step>("choice");
    const [selectedTime, setSelectedTime] = useState("");
    const [iosPickerVisible, setIosPickerVisible] = useState(false);

    const electionTitle = resolveElectionTitle(contextData);
    const pollingUnitName = resolvePollingUnitName(contextData);
    const unitMeta = resolveUnitMeta(contextData);

    const dismiss = useCallback(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const reset = useCallback(() => {
      setStep("choice");
      setSelectedTime("");
      setIosPickerVisible(false);
    }, []);

    const handleClose = useCallback(() => {
      dismiss();
      reset();
    }, [dismiss, reset]);

    const handleElectionHappened = useCallback(() => {
      setStep("time");
      setIosPickerVisible(false);
    }, []);

    const handleProceed = useCallback(() => {
      if (!selectedTime) return;

      onProceedResult(selectedTime);
      handleClose();
    }, [selectedTime, onProceedResult, handleClose]);

    const handleIncident = useCallback(() => {
      onProceedIncident();
      handleClose();
    }, [onProceedIncident, handleClose]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={reset}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.3}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <AppText style={styles.title}>Commencement</AppText>

            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={Theme.colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {step === "choice" ? (
            <>
              <View style={styles.unitCard}>
                <AppText style={styles.unitLabel}>📍 Your Polling Unit</AppText>
                <AppText style={styles.unitName}>{pollingUnitName}</AppText>
                <AppText style={styles.unitMeta}>{unitMeta}</AppText>
              </View>

              <View style={styles.questionWrap}>
                <AppText style={styles.question}>
                  Did {electionTitle} hold in your polling unit?
                </AppText>
              </View>

              <Pressable
                onPress={handleElectionHappened}
                style={styles.optionCard}
              >
                <View style={styles.optionIconWrap}>
                  <AppText style={styles.optionEmoji}>🧺</AppText>
                </View>

                <View style={styles.optionTextWrap}>
                  <AppText style={styles.optionTitle}>
                    Yes — The election happened
                  </AppText>
                  <AppText style={styles.optionSubtitle}>
                    I want to submit an official result.
                  </AppText>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Theme.colors.textMuted}
                />
              </Pressable>

              <Pressable onPress={handleIncident} style={styles.optionCard}>
                <View style={styles.optionIconWrap}>
                  <AppText style={styles.optionEmoji}>🚨</AppText>
                </View>

                <View style={styles.optionTextWrap}>
                  <AppText style={styles.optionTitle}>
                    No — The election did not hold
                  </AppText>
                  <AppText style={styles.optionSubtitle}>
                    Report what happened.
                  </AppText>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Theme.colors.textMuted}
                />
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.timeStepHeader}>
                <AppText style={styles.timeStepIntro}>
                  Select the time polling opened at your unit today.
                </AppText>

                <AppText style={styles.timeFieldLabel}>
                  When did voting start?
                </AppText>
              </View>

              <AppSelectField
                label=""
                value={selectedTime}
                placeholder="Select time"
                onPress={() => setIosPickerVisible(true)}
                leftIcon={<AppText style={styles.clockEmoji}>⏰</AppText>}
              />

              <TimePickerSheet
                visible={iosPickerVisible}
                value={selectedTime}
                onClose={() => setIosPickerVisible(false)}
                onConfirm={(time) => {
                  setSelectedTime(time);
                  setIosPickerVisible(false);
                }}
              />

              <View style={styles.bottomActionWrap}>
                <AppButton
                  title="Proceed To Report"
                  onPress={handleProceed}
                  disabled={!selectedTime}
                />
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default CommencementBottomSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#FBF6E3",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: "#D1D5DB",
    width: 42,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E1E4E8",
    marginHorizontal: -20,
    marginBottom: 18,
  },
  unitCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 6,
  },
  unitLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },
  unitName: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  unitMeta: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
  },
  questionWrap: {
    marginTop: 18,
    marginBottom: 12,
  },
  question: {
    fontSize: 18,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  optionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7E8",
  },
  optionEmoji: {
    fontSize: 24,
    lineHeight: 26,
  },
  optionTextWrap: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  optionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
  timeStepHeader: {
    gap: 12,
    marginTop: 10,
    marginBottom: 12,
  },
  timeStepIntro: {
    fontSize: 16,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  timeFieldLabel: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  clockEmoji: {
    fontSize: 20,
    lineHeight: 20,
  },
  bottomActionWrap: {
    paddingTop: 20,
  },
});
