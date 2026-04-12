// ─── src/components/collation/CommentsBottomSheet.tsx ─────────────────────────
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type DiscussionComment = {
  id: string;
  author: string;
  body: string;
  minutesAgo: number;
  likes: number;
  shares: number;
};

type Props = {
  comments: DiscussionComment[];
  onSubmitComment: (text: string) => void;
};

const CommentsBottomSheet = forwardRef<BottomSheetModal, Props>(
  function CommentsBottomSheet({ comments, onSubmitComment }, ref) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["75%", "92%"], []);
    const [text, setText] = useState("");

    // Local like state
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

    const close = useCallback(() => {
      if (ref && typeof ref !== "function" && ref.current) ref.current.dismiss();
    }, [ref]);

    const submit = useCallback(() => {
      const trimmed = text.trim();
      if (!trimmed) return;
      onSubmitComment(trimmed);
      setText("");
    }, [text, onSubmitComment]);

    const toggleLike = useCallback((id: string, baseLikes: number) => {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setLikeCounts((prev) => {
        const liked = likedIds.has(id);
        return { ...prev, [id]: liked ? (prev[id] ?? baseLikes) - 1 : (prev[id] ?? baseLikes) + 1 };
      });
    }, [likedIds]);

    const canSend = text.trim().length > 0;

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
        backdropComponent={(p) => (
          <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.3} pressBehavior="close" />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.bg}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.headerTitle}>Comments</AppText>
          <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        {/* Comment list */}
        <BottomSheetFlatList
          data={comments}
          keyExtractor={(c) => c.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const isLiked = likedIds.has(item.id);
            const displayLikes = likeCounts[item.id] ?? item.likes;

            return (
              <View style={styles.commentCard}>
                <View style={styles.commentHead}>
                  <View style={styles.commentAuthorRow}>
                    <Ionicons name="chatbox-ellipses-outline" size={14} color={Theme.colors.textMuted} />
                    <AppText style={styles.commentAuthor}>{item.author}</AppText>
                  </View>
                  <AppText style={styles.commentTime}>{item.minutesAgo} min ago</AppText>
                </View>
                <AppText style={styles.commentBody}>{item.body}</AppText>
                <View style={styles.commentActions}>
                  <Pressable onPress={() => toggleLike(item.id, item.likes)} style={styles.likeBtn} hitSlop={6}>
                    <Ionicons
                      name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
                      size={15}
                      color={isLiked ? Theme.colors.primary : Theme.colors.textMuted}
                    />
                    <AppText style={[styles.likeText, isLiked && { color: Theme.colors.primary }]}>
                      {displayLikes} Likes
                    </AppText>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />

        {/* ── Sticky input — always visible in white container ── */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.inputRow}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="chatbubbles-outline" size={20} color={Theme.colors.textMuted} />
            </View>
            <View style={styles.inputFieldWrap}>
              <BottomSheetTextInput
                placeholder="Leave Comment, @ To Mention"
                placeholderTextColor={Theme.colors.textSoft}
                value={text}
                onChangeText={setText}
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={submit}
                multiline
              />
            </View>
          </View>

          {/* Submit button — visible when text is entered */}
          <Pressable
            onPress={submit}
            disabled={!canSend}
            style={[styles.submitBtn, !canSend && styles.submitBtnDisabled]}
          >
            <AppText style={[styles.submitBtnText, !canSend && styles.submitBtnTextDisabled]}>
              Submit Comment
            </AppText>
          </Pressable>
        </View>
      </BottomSheetModal>
    );
  }
);

export default CommentsBottomSheet;

const styles = StyleSheet.create({
  bg: { backgroundColor: Theme.colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  handle: { backgroundColor: "rgba(17,26,50,0.12)", width: 44 },

  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: { fontSize: 18, lineHeight: 24, fontFamily: Theme.fonts.heading.semibold, color: Theme.colors.text },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.74)", alignItems: "center", justifyContent: "center" },

  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 0 },

  commentCard: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: 14,
    marginBottom: 14,
    gap: 6,
  },
  commentHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  commentAuthorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  commentAuthor: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  commentTime: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted },
  commentBody: { fontSize: 14, lineHeight: 22, color: Theme.colors.text },
  commentActions: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: 2 },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  likeText: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },

  /* ── Sticky input container ── */
  inputContainer: {
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  inputIconWrap: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  inputFieldWrap: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    fontSize: 14,
    color: Theme.colors.text,
    maxHeight: 100,
  },

  /* Submit button */
  submitBtn: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitBtnText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.body.semibold,
  },
  submitBtnTextDisabled: {
    color: "#9CA3AF",
  },
});