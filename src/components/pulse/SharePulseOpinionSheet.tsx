import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import {
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import ProfileAvatar from "@/svgs/app/profile/ProfileAvatar";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { PickedMedia, useCollationMedia } from "@/hooks/useCollationMedia";
import { useAppToast } from "@/hooks/useAppToast";
import {
  pulseQueryKeys,
  useCreatePulsePostMutation,
  usePulseViewerQuery,
} from "@/hooks/api/usePulseQueries";
import { useGenerateAnonymousUsernameMutation } from "@/hooks/api/useProfileMutations";
import { Theme } from "@/theme";

type Props = {
  onSubmitted?: () => void;
};

function getFullName(firstName?: string, lastName?: string): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || "Citizen";
}

function shouldQueueAfterError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  return (
    message.includes("unable to reach") ||
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("timeout")
  );
}

const SharePulseOpinionSheet = forwardRef<BottomSheetModal, Props>(
  function SharePulseOpinionSheet({ onSubmitted }, ref) {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );

    const { showToast } = useAppToast();
    const { enqueue, isOnline } = useOfflineSync();
    const { pickImageFromGallery, busy } = useCollationMedia();

    const viewerQuery = usePulseViewerQuery();
    const createPostMutation = useCreatePulsePostMutation();
    const generateAnonymousMutation = useGenerateAnonymousUsernameMutation();

    const viewer = viewerQuery.data;

    const realName = getFullName(viewer?.firstName, viewer?.lastName);
    const profileImageUrl = viewer?.profileImageUrl ?? null;

    const [body, setBody] = useState("");
    const [anonymous, setAnonymous] = useState(false);
    const [imgAsset, setImgAsset] = useState<PickedMedia | null>(null);
    const [generatedAnonymousName, setGeneratedAnonymousName] = useState("");

    const resolvedAnonymousName =
      generatedAnonymousName.trim() ||
      viewer?.anonymousUsername?.trim() ||
      "Anonymous Citizen";

    const snapPoints = useMemo(() => ["62%", "92%"], []);

    const isSubmitting =
      busy || createPostMutation.isPending || generateAnonymousMutation.isPending;

    const canSubmit = body.trim().length > 3 && !isSubmitting;

    const close = () => {
      Keyboard.dismiss();

      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const reset = () => {
      setBody("");
      setAnonymous(false);
      setImgAsset(null);
    };

    const attachImage = async () => {
      const result = await pickImageFromGallery();

      if (!result.ok) {
        showToast({ type: "error", message: result.error });
        return;
      }

      if (result.data) {
        setImgAsset(result.data);
      }
    };

    const ensureAnonymousName = async (): Promise<void> => {
      if (!anonymous || viewer?.anonymousUsername || generatedAnonymousName) {
        return;
      }

      if (!isOnline) {
        return;
      }

      try {
        const response = await generateAnonymousMutation.mutateAsync();

        if (response.anonymousUsername) {
          setGeneratedAnonymousName(response.anonymousUsername);
        }

        await queryClient.invalidateQueries({
          queryKey: pulseQueryKeys.viewer,
        });
      } catch {
        // Non-blocking. Backend can still accept useAnonymousDisplay.
      }
    };

    const submit = async () => {
      const trimmedBody = body.trim();

      if (!canSubmit) {
        showToast({ type: "error", message: "Write something first." });
        return;
      }

      await ensureAnonymousName();

      const payload = {
        body: trimmedBody,
        visibilityScope: "ward" as const,
        useAnonymousDisplay: anonymous,
        imageUri: imgAsset?.uri ?? null,
      };

      if (!isOnline) {
        enqueue({
          type: "pulse-create-post",
          payload,
        });

        showToast({
          type: "success",
          message: "Post saved offline. It will sync automatically.",
        });

        reset();
        close();
        onSubmitted?.();
        return;
      }

      try {
        await createPostMutation.mutateAsync(payload);

        showToast({
          type: "success",
          message: "Post submitted successfully.",
        });

        reset();
        close();
        onSubmitted?.();

        await queryClient.invalidateQueries({
          queryKey: pulseQueryKeys.posts,
        });
      } catch (error) {
        if (shouldQueueAfterError(error)) {
          enqueue({
            type: "pulse-create-post",
            payload,
          });

          showToast({
            type: "success",
            message: "Post saved offline. It will sync automatically.",
          });

          reset();
          close();
          onSubmitted?.();
          return;
        }

        showToast({
          type: "error",
          message:
            error instanceof Error ? error.message : "Unable to submit post.",
        });
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        index={1}
        enablePanDownToClose
        enableDynamicSizing={false}
        topInset={insets.top + 12}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onChange={handleSheetChange}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.3}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={st.handle}
        backgroundStyle={st.bg}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          contentContainerStyle={[
            st.content,
            {
              paddingBottom: Math.max(insets.bottom + 28, 44),
            },
          ]}
        >
          <View style={st.header}>
            <View style={st.headerLeft}>
              <View style={st.avatarWrap}>
                {profileImageUrl ? (
                  <Image source={{ uri: profileImageUrl }} style={st.avatar} />
                ) : (
                  <ProfileAvatar width={32} height={32} />
                )}
              </View>

              <View style={st.headerTextWrap}>
                <AppText style={st.headerTitle}>Share Your Opinion</AppText>
                <AppText style={st.headerSubtitle}>
                  Posting within your ward
                </AppText>
              </View>
            </View>

            <Pressable onPress={close} hitSlop={8} style={st.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={st.guideBox}>
            <View style={st.guideIcon}>
              <Ionicons
                name="information-circle"
                size={18}
                color={Theme.colors.primary}
              />
            </View>

            <AppText style={st.guideText}>
              Be factual. Be respectful. The Electoral Act protects free
              expression but prohibits hate speech and incitement. — Citizen
              Monitors Community Guidelines
            </AppText>
          </View>

          <View style={st.sec}>
            <AppText style={st.label}>Your Opinion</AppText>

            <View style={st.textareaWrap}>
              <BottomSheetTextInput
                placeholder="What's happening in your ward?"
                placeholderTextColor={Theme.colors.placeholder}
                value={body}
                onChangeText={setBody}
                multiline
                textAlignVertical="top"
                style={st.textareaInput}
              />
            </View>
          </View>

          <View style={st.sec}>
            <Pressable onPress={attachImage} style={st.attachBtn}>
              <Ionicons
                name="camera-outline"
                size={18}
                color={Theme.colors.primary}
              />
              <AppText style={st.attachText}>Attach Image</AppText>
            </Pressable>

            {imgAsset?.uri ? (
              <View style={st.previewWrap}>
                <Image
                  source={{ uri: imgAsset.uri }}
                  style={[
                    st.preview,
                    imgAsset.width && imgAsset.height
                      ? { aspectRatio: imgAsset.width / imgAsset.height, height: undefined }
                      : null,
                  ]}
                  resizeMode="cover"
                />

                <Pressable
                  onPress={() => setImgAsset(null)}
                  style={st.removePreview}
                >
                  <Ionicons name="close-circle" size={22} color="#F04A1D" />
                </Pressable>
              </View>
            ) : null}
          </View>

          <View style={st.scopeCard}>
            <View style={st.scopeIcon}>
              <Ionicons
                name="people-outline"
                size={18}
                color={Theme.colors.primary}
              />
            </View>

            <View style={st.scopeTextWrap}>
              <AppText style={st.scopeTitle}>Ward visibility</AppText>
              <AppText style={st.scopeText}>
                This post will only be visible within your ward pulse feed.
              </AppText>
            </View>
          </View>

          <View style={st.switchRow}>
            <View style={st.switchTextWrap}>
              <AppText style={st.switchTitle}>Post Anonymously</AppText>

              <AppText style={st.switchSubtitle}>
                This post will be shown as{" "}
                <AppText style={st.switchBold}>
                  {anonymous ? resolvedAnonymousName : realName}
                </AppText>
                .
              </AppText>
            </View>

            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{ false: "#D7DDE5", true: "#AEE7E1" }}
              thumbColor={anonymous ? Theme.colors.primary : "#FFF"}
              ios_backgroundColor="#D7DDE5"
            />
          </View>

        </BottomSheetScrollView>

        {/* Sticky submit — always above keyboard */}
        <View style={[st.footer, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
          <AppButton
            title={isOnline ? "Submit Post" : "Save Offline"}
            onPress={() => {
              void submit();
            }}
            disabled={!canSubmit}
            loading={isSubmitting}
            style={st.submitButton}
          />
        </View>
      </BottomSheetModal>
    );
  }
);

export default SharePulseOpinionSheet;

const st = StyleSheet.create({
  bg: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: "rgba(17,26,50,0.12)",
    width: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 12,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#EEF2F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
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
  guideBox: {
    borderRadius: 18,
    backgroundColor: "#CDEFE4",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  guideIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(5,163,156,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  guideText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.text,
  },
  sec: {
    gap: 10,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.text,
  },
  textareaWrap: {
    minHeight: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(255,255,255,0.58)",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  textareaInput: {
    minHeight: 116,
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.regular,
    padding: 0,
    textAlignVertical: "top",
  },
  attachBtn: {
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: "#DFF3F1",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  attachText: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  previewWrap: {
    position: "relative",
  },
  preview: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#EEF2F6",
    minHeight: 120,
  },
  removePreview: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  scopeCard: {
    borderRadius: 18,
    backgroundColor: "rgba(25,183,176,0.08)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.16)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 12,
  },
  scopeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  scopeTextWrap: {
    flex: 1,
    gap: 3,
  },
  scopeTitle: {
    fontSize: 14,
    lineHeight: 19,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  scopeText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  switchTextWrap: {
    flex: 1,
    gap: 4,
  },
  switchTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  switchSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
  switchBold: {
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(17,26,50,0.07)",
    backgroundColor: Theme.colors.background,
  },
  submitButton: {
    marginVertical: 0,
  },
});