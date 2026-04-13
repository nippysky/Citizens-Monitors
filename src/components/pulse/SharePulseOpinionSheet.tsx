// ─── src/components/pulse/SharePulseOpinionSheet.tsx ──────────────────────────
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { PickedMedia, useCollationMedia } from "@/hooks/useCollationMedia";
import { useAppToast } from "@/hooks/useAppToast";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { Theme } from "@/theme";
import ProfileAvatar from "@/svgs/app/profile/ProfileAvatar";

type Audience = "my-lga" | "my-ward";

type Props = {
  onSubmitted?: () => void;
  onPayload?: (payload: {
    body: string;
    audience: Audience;
    anonymous: boolean;
    imageUri?: string;
  }) => void;
};

const SharePulseOpinionSheet = forwardRef<BottomSheetModal, Props>(
  function SharePulseOpinionSheet({ onSubmitted, onPayload }, ref) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();
    const { enqueue } = useOfflineSync();
    const { pickImageFromGallery, busy } = useCollationMedia();

    const [body, setBody] = useState("");
    const [audience, setAudience] = useState<Audience>("my-lga");
    const [anonymous, setAnonymous] = useState(false);
    const [imgAsset, setImgAsset] = useState<PickedMedia | null>(null);

    const snaps = useMemo(() => ["85%"], []);
    const canSubmit = body.trim().length > 3;

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) ref.current.dismiss();
    };

    const attachImage = async () => {
      const r = await pickImageFromGallery();
      if (!r.ok) {
        showToast({ type: "error", message: r.error });
        return;
      }
      if (r.data) setImgAsset(r.data);
    };

    const submit = () => {
      if (!canSubmit) {
        showToast({ type: "error", message: "Write something first." });
        return;
      }
      onPayload?.({
        body: body.trim(),
        audience,
        anonymous,
        imageUri: imgAsset?.uri,
      });
      enqueue({
        type: "opinion",
        payload: {
          body: body.trim(),
          audience,
          anonymous,
          imageUri: imgAsset?.uri ?? null,
          source: "pulse",
        },
      });
      onSubmitted?.();
      setBody("");
      setAudience("my-lga");
      setAnonymous(false);
      setImgAsset(null);
      close();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snaps}
        enablePanDownToClose
        topInset={insets.top + 12}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={(p) => (
          <BottomSheetBackdrop
            {...p}
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
          contentContainerStyle={[
            st.content,
            { paddingBottom: insets.bottom + 18 },
          ]}
        >
          {/* ── Header with avatar ── */}
          <View style={st.header}>
            <View style={st.headerLeft}>
              <View style={st.avatarWrap}>
                <ProfileAvatar width={32} height={32} />
              </View>
              <AppText style={st.headerTitle}>Share Your Opinion</AppText>
            </View>
            <Pressable onPress={close} hitSlop={8} style={st.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          {/* Guidelines */}
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

          {/* Input */}
          <View style={st.sec}>
            <AppText style={st.label}>Your Opinion</AppText>
            <AppInput
              placeholder="What's happening.."
              value={body}
              onChangeText={setBody}
              multiline
              inputWrapperStyle={st.taWrap}
              style={st.ta}
            />
          </View>

          {/* Attach image */}
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
                <Image source={{ uri: imgAsset.uri }} style={st.preview} />
                <Pressable
                  onPress={() => setImgAsset(null)}
                  style={st.removePreview}
                >
                  <Ionicons name="close-circle" size={22} color="#F04A1D" />
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* Audience */}
          <View style={st.sec}>
            <AppText style={st.label}>Who can see this post?</AppText>
            <View style={st.audRow}>
              <Pressable
                onPress={() => setAudience("my-lga")}
                style={[st.audPill, audience === "my-lga" && st.audPillOn]}
              >
                <AppText
                  style={[
                    st.audText,
                    audience === "my-lga" && st.audTextOn,
                  ]}
                >
                  My LGA
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => setAudience("my-ward")}
                style={[st.audPill, audience === "my-ward" && st.audPillOn]}
              >
                <AppText
                  style={[
                    st.audText,
                    audience === "my-ward" && st.audTextOn,
                  ]}
                >
                  My Ward
                </AppText>
              </Pressable>
            </View>
          </View>

          {/* Anonymous toggle */}
          <View style={st.switchRow}>
            <View style={st.switchTextWrap}>
              <AppText style={st.switchTitle}>Stay Anonymous</AppText>
              <AppText style={st.switchSubtitle}>
                Your identity is protected. This post will be posted as{" "}
                <AppText style={st.switchBold}>IronEagle345</AppText>, and not
                as <AppText style={st.switchBold}>Adeyemi</AppText>.
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

          {/* Submit */}
          <AppButton
            title="Submit Post"
            onPress={submit}
            disabled={!canSubmit}
            loading={busy}
            style={{ marginVertical: 0 }}
          />
        </BottomSheetScrollView>
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
  handle: { backgroundColor: "rgba(17,26,50,0.12)", width: 44 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 18 },

  /* Header with avatar */
  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#EEF2F6",
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

  sec: { gap: 10 },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.text,
  },
  taWrap: { minHeight: 140, alignItems: "flex-start", paddingTop: 14 },
  ta: { minHeight: 100, textAlignVertical: "top" },

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
  previewWrap: { position: "relative" },
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    resizeMode: "cover",
    backgroundColor: "#EEF2F6",
  },
  removePreview: { position: "absolute", top: 8, right: 8 },

  audRow: { flexDirection: "row", gap: 10 },
  audPill: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 18,
    backgroundColor: "#F4F5F7",
    borderWidth: 1,
    borderColor: "#DDE3EA",
    alignItems: "center",
    justifyContent: "center",
  },
  audPillOn: {
    backgroundColor: "#F3FFFD",
    borderColor: Theme.colors.primary,
  },
  audText: {
    fontSize: 14,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  audTextOn: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  switchTextWrap: { flex: 1, gap: 4 },
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
});