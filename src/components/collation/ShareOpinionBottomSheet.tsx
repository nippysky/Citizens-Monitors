import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Switch, View } from "react-native";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { useCollationMedia, PickedMedia } from "@/hooks/useCollationMedia";
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
    const { showToast } = useAppToast();
    const { pickImageFromGallery, busy } = useCollationMedia();

    const [opinion, setOpinion] = useState("");
    const [audience, setAudience] = useState<Audience>("my-polling-unit");
    const [shareToSocial, setShareToSocial] = useState(true);
    const [imageAsset, setImageAsset] = useState<PickedMedia | null>(null);

    const canSubmit = useMemo(() => opinion.trim().length > 6, [opinion]);

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

      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <AppBottomSheet ref={ref} title="Share Your Opinion" snapPoints={["82%"]}>
        <View style={styles.content}>
          <View style={styles.guidelineBox}>
            <Ionicons
              name="information-circle"
              size={18}
              color={Theme.colors.primary}
            />
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
                name="attach-outline"
                size={16}
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
              trackColor={{ false: "#D8DDE6", true: "#AEE7E1" }}
              thumbColor={shareToSocial ? Theme.colors.primary : "#fff"}
            />
          </View>

          <AppButton
            title="Submit Post"
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={busy}
            style={styles.submitButton}
          />
        </View>
      </AppBottomSheet>
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
  content: {
    gap: 18,
  },

  guidelineBox: {
    borderRadius: 14,
    backgroundColor: "#E5F8F4",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  guidelineText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.text,
  },

  section: {
    gap: 10,
  },

  label: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  textAreaWrap: {
    minHeight: 140,
    alignItems: "flex-start",
    paddingTop: 14,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  attachButton: {
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: "#EAFBF9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  attachText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    resizeMode: "cover",
  },

  audienceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "#F4F5F7",
    alignItems: "center",
    justifyContent: "center",
  },

  chipActive: {
    backgroundColor: "#DFF7F3",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.24)",
  },

  chipText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  chipTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  switchLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    color: Theme.colors.text,
  },

  submitButton: {
    marginVertical: 0,
  },
});