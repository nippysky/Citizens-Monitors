// ─── src/components/collation/ShareOpinionBottomSheet.tsx ─────────────────────
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
import { Theme } from "@/theme";

type Audience = "my-polling-unit" | "my-world" | "my-state";

type Props = {
  onSubmitted?: () => void;
  /** Called with the actual payload so parent can add to local list */
  onPayload?: (payload: {
    opinion: string;
    audience: Audience;
    shareToSocial: boolean;
  }) => void;
};

const ShareOpinionBottomSheet = forwardRef<BottomSheetModal, Props>(
  function ShareOpinionBottomSheet({ onSubmitted, onPayload }, ref) {
    const insets = useSafeAreaInsets();
    const { showToast } = useAppToast();
    const { pickImageFromGallery, pickVideoFromGallery, busy } =
      useCollationMedia();
    const [opinion, setOpinion] = useState("");
    const [audience, setAudience] = useState<Audience>("my-polling-unit");
    const [social, setSocial] = useState(true);
    const [imgAsset, setImgAsset] = useState<PickedMedia | null>(null);
    const [vidAsset, setVidAsset] = useState<PickedMedia | null>(null);
    const snaps = useMemo(() => ["88%"], []);
    const ok = opinion.trim().length > 6;

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

    const attachVideo = async () => {
      const r = await pickVideoFromGallery();
      if (!r.ok) {
        showToast({ type: "error", message: r.error });
        return;
      }
      if (r.data) setVidAsset(r.data);
    };

    const submit = () => {
      if (!ok) {
        showToast({ type: "error", message: "Write your opinion first." });
        return;
      }

      // Send payload to parent for local list insertion
      onPayload?.({
        opinion: opinion.trim(),
        audience,
        shareToSocial: social,
      });

      onSubmitted?.();

      // Reset
      setOpinion("");
      setAudience("my-polling-unit");
      setSocial(true);
      setImgAsset(null);
      setVidAsset(null);
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
          <View style={st.header}>
            <AppText style={st.headerTitle}>Share Your Opinion</AppText>
            <Pressable onPress={close} hitSlop={8} style={st.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={Theme.colors.textMuted}
              />
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
            <AppInput
              placeholder="Share what you have in mind about this election..."
              value={opinion}
              onChangeText={setOpinion}
              multiline
              inputWrapperStyle={st.taWrap}
              style={st.ta}
            />
          </View>

          <View style={st.sec}>
            <View style={st.attachRow}>
              <Pressable onPress={attachImage} style={st.attachBtn}>
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={Theme.colors.primary}
                />
                <AppText style={st.attachText}>Attach image</AppText>
              </Pressable>
              <Pressable onPress={attachVideo} style={st.attachBtn}>
                <Ionicons
                  name="videocam-outline"
                  size={18}
                  color={Theme.colors.primary}
                />
                <AppText style={st.attachText}>Attach Video</AppText>
              </Pressable>
            </View>
            {imgAsset?.uri ? (
              <Image source={{ uri: imgAsset.uri }} style={st.preview} />
            ) : null}
            {vidAsset?.uri ? (
              <View style={st.vidTag}>
                <Ionicons
                  name="videocam"
                  size={16}
                  color={Theme.colors.primary}
                />
                <AppText style={st.vidTagText}>Video attached</AppText>
                <Pressable onPress={() => setVidAsset(null)} hitSlop={8}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={Theme.colors.textMuted}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>

          <View style={st.sec}>
            <AppText style={st.label}>Who can see this discussion?</AppText>
            <View style={st.audWrap}>
              {(["my-polling-unit", "my-world", "my-state"] as Audience[]).map(
                (a) => (
                  <Pressable
                    key={a}
                    onPress={() => setAudience(a)}
                    style={[st.chip, audience === a && st.chipOn]}
                  >
                    <AppText
                      style={[st.chipText, audience === a && st.chipTextOn]}
                    >
                      {a === "my-polling-unit"
                        ? "My polling unit"
                        : a === "my-world"
                          ? "My world"
                          : "Within my state"}
                    </AppText>
                  </Pressable>
                )
              )}
            </View>
          </View>

          <View style={st.switchRow}>
            <AppText style={st.switchLabel}>
              Give permission to share on social media.
            </AppText>
            <Switch
              value={social}
              onValueChange={setSocial}
              trackColor={{ false: "#D7DDE5", true: "#AEE7E1" }}
              thumbColor={social ? Theme.colors.primary : "#FFF"}
              ios_backgroundColor="#D7DDE5"
            />
          </View>

          <View style={{ paddingTop: 6 }}>
            <AppButton
              title="Submit Post"
              onPress={submit}
              disabled={!ok}
              loading={busy}
              style={{ marginVertical: 0 }}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default ShareOpinionBottomSheet;

const st = StyleSheet.create({
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
    marginTop: 1,
  },
  guideText: { flex: 1, fontSize: 13, lineHeight: 19, color: Theme.colors.text },
  sec: { gap: 10 },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.medium,
    color: Theme.colors.text,
  },
  taWrap: { minHeight: 160, alignItems: "flex-start", paddingTop: 14 },
  ta: { minHeight: 120, textAlignVertical: "top" },
  attachRow: { flexDirection: "row", gap: 10 },
  attachBtn: {
    flex: 1,
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
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    resizeMode: "cover",
    marginTop: 2,
  },
  vidTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#EAFBF9",
    borderRadius: 12,
  },
  vidTagText: {
    flex: 1,
    fontSize: 13,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  audWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
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
  chipOn: { backgroundColor: "#F3FFFD", borderColor: Theme.colors.primary },
  chipText: {
    fontSize: 14,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  chipTextOn: {
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
  switchLabel: { flex: 1, fontSize: 15, lineHeight: 20, color: Theme.colors.text },
});