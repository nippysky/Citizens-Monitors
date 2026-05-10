import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type FeedbackFormState = {
  title: string;
  message: string;
};

type Props = {
  value: FeedbackFormState;
  onChange: (value: FeedbackFormState) => void;
  onSubmit: () => void;
  submitting?: boolean;
};

const MAX_MESSAGE_LENGTH = 700;

const FeedbackBottomSheet = forwardRef<BottomSheetModal, Props>(
  function FeedbackBottomSheet(
    { value, onChange, onSubmit, submitting = false },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["72%", "90%"], []);

    const title = value.title.trim();
    const message = value.message.trim();

    const canSubmit =
      title.length >= 2 && message.length >= 5 && !submitting;

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        index={0}
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
            <View style={styles.headerTextWrap}>
              <AppText style={styles.headerTitle}>Give Feedback</AppText>
              <AppText style={styles.headerSubtitle}>
                Tell us what worked, what felt confusing, or what you want
                improved.
              </AppText>
            </View>

            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={Theme.colors.primary}
              />
            </View>

            <View style={styles.infoTextWrap}>
              <AppText style={styles.infoTitle}>
                Your feedback helps improve Citizen Monitor.
              </AppText>
              <AppText style={styles.infoText}>
                Keep it clear and specific. Reports about bugs, design issues,
                or missing features are welcome.
              </AppText>
            </View>
          </View>

          <AppInput
            label="Title"
            value={value.title}
            onChangeText={(titleValue) =>
              onChange({ ...value, title: titleValue })
            }
            placeholder="e.g. Feedback, Bug report, Feature request"
            autoCapitalize="sentences"
            editable={!submitting}
          />

          <View style={styles.messageWrap}>
            <View style={styles.messageHeader}>
              <AppText style={styles.messageLabel}>Message</AppText>
              <AppText style={styles.counterText}>
                {value.message.length}/{MAX_MESSAGE_LENGTH}
              </AppText>
            </View>

            <TextInput
              value={value.message}
              onChangeText={(messageValue) =>
                onChange({
                  ...value,
                  message: messageValue.slice(0, MAX_MESSAGE_LENGTH),
                })
              }
              placeholder="Write your feedback here..."
              placeholderTextColor={Theme.colors.placeholder}
              multiline
              editable={!submitting}
              textAlignVertical="top"
              style={styles.messageInput}
            />
          </View>

          <AppButton
            title="Submit Feedback"
            onPress={onSubmit}
            loading={submitting}
            disabled={!canSubmit}
            style={styles.submitButton}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default FeedbackBottomSheet;

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
    minHeight: 74,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 8,
  },
  headerTextWrap: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
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
  infoCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.18)",
    backgroundColor: "rgba(5,163,156,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,163,156,0.12)",
  },
  infoTextWrap: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  messageWrap: {
    gap: 8,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageLabel: {
    color: Theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
  },
  counterText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  messageInput: {
    minHeight: 148,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.58)",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.regular,
  },
  submitButton: {
    marginVertical: 0,
  },
});