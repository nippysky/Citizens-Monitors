import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { PickedMedia, useCollationMedia } from "@/hooks/useCollationMedia";
import { useAppToast } from "@/hooks/useAppToast";
import { Theme } from "@/theme";

type Props = {
  onSubmitted?: (payload: {
    opinion: string;
    audience: "my-polling-unit" | "my-world" | "my-state";
    shareToSocial: boolean;
    image?: PickedMedia | null;
  }) => void;
};

type Audience = "my-polling-unit" | "my-world" | "my-state";

const ShareOpinionBottomSheet = forwardRef<BottomSheetModal, Props>(
  function ShareOpinionBottomSheet({ onSubmitted }, ref) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();
    const { pickImageFromGallery, busy } = useCollationMedia();

    const [opinion, setOpinion] = useState("");
    const [audience, setAudience] = useState<Audience>("my-polling-unit");
    const [shareToSocial, setShareToSocial] = useState(true);
    const [imageAsset, setImageAsset] = useState<PickedMedia | null>(null);

    const snapPoints = useMemo(() => ["88%"], []);
    const canSubmit = useMemo(() => opinion.trim().length > 6, [opinion]);

    const handleClose = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleAttach = async () => {
      const result = await pickImageFromGallery();

      if (!result.ok) {
        showToast({
          type: "error",
          message: result.error,
        });
        return;
      }

      if (!result.data) return;

      setImageAsset(result.data);
    };

    const handleSubmit = () => {
      if (!canSubmit) {
        showToast({
          type: "error",
          message: "Please write your opinion before submitting.",
        });
        return;
      }

      onSubmitted?.({
        opinion: opinion.trim(),
        audience,
        shareToSocial,
        image: imageAsset,
      });

      showToast({
        type: "success",
        message: "Your opinion has been posted successfully.",
      });

      setOpinion("");
      setAudience("my-polling-unit");
      setShareToSocial(true);
      setImageAsset(null);
      handleClose();
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
            opacity={0.3}
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
            styles.scrollContent,
            { paddingBottom: insets.bottom + 18 },
          ]}
        >
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Share Your Opinion</AppText>

            <Pressable onPress={handleClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.guidelineBox}>
            <View style={styles.guidelineIconWrap}>
              <Ionicons
                name="information-circle"
                size={18}
                color={Theme.colors.primary}
              />
            </View>

            <AppText style={styles.guidelineText}>
              Be factual. Be respectful. The Electoral Act protects free
              expression but prohibits hate speech and incitement. — Citizen
              Monitors Community Guidelines
            </AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.label}>Your Opinion</AppText>

            <AppInput
              placeholder="Share what you have in mind about this election..."
              value={opinion}
              onChangeText={setOpinion}
              multiline
              inputWrapperStyle={styles.textAreaWrap}
              style={styles.textArea}
            />
          </View>

          <View style={styles.section}>
            <Pressable onPress={handleAttach} style={styles.attachButton}>
              <Ionicons
                name="camera-outline"
                size={18}
                color={Theme.colors.primary}
              />
              <AppText style={styles.attachText}>Attach image</AppText>
            </Pressable>

            {imageAsset?.uri ? (
              <Image source={{ uri: imageAsset.uri }} style={styles.previewImage} />
            ) : null}
          </View>

          <View style={styles.section}>
            <AppText style={styles.label}>Who can see this discussion?</AppText>

            <View style={styles.audienceWrap}>
              <AudienceChip
                label="My polling unit"
                active={audience === "my-polling-unit"}
                onPress={() => setAudience("my-polling-unit")}
              />
              <AudienceChip
                label="My world"
                active={audience === "my-world"}
                onPress={() => setAudience("my-world")}
              />
              <AudienceChip
                label="Within my state"
                active={audience === "my-state"}
                onPress={() => setAudience("my-state")}
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <AppText style={styles.switchLabel}>
              Give permission to share on social media.
            </AppText>

            <Switch
              value={shareToSocial}
              onValueChange={setShareToSocial}
              trackColor={{ false: "#D7DDE5", true: "#AEE7E1" }}
              thumbColor={shareToSocial ? Theme.colors.primary : "#FFFFFF"}
              ios_backgroundColor="#D7DDE5"
            />
          </View>

          <View style={styles.footer}>
            <AppButton
              title="Submit Post"
              onPress={handleSubmit}
              disabled={!canSubmit}
              loading={busy}
              style={styles.submitButton}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default ShareOpinionBottomSheet;

function AudienceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <AppText style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

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

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
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

  guidelineBox: {
    borderRadius: 18,
    backgroundColor: "#CDEFE4",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  guidelineIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(5,163,156,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },

  guidelineText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.text,
  },

  section: {
    gap: 10,
  },

  label: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.text,
  },

  textAreaWrap: {
    minHeight: 170,
    alignItems: "flex-start",
    paddingTop: 14,
  },

  textArea: {
    minHeight: 128,
    textAlignVertical: "top",
  },

  attachButton: {
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: "#DFF3F1",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  attachText: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    resizeMode: "cover",
    marginTop: 2,
  },

  audienceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "#F4F5F7",
    borderWidth: 1,
    borderColor: "#DDE3EA",
    alignItems: "center",
    justifyContent: "center",
  },

  chipActive: {
    backgroundColor: "#F3FFFD",
    borderColor: Theme.colors.primary,
  },

  chipText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  chipTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  switchRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  switchLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
  },

  footer: {
    paddingTop: 6,
  },

  submitButton: {
    marginVertical: 0,
  },
});