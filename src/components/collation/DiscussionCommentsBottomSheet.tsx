// ─── src/components/collation/DiscussionCommentsBottomSheet.tsx ───────────
// Comments for a Collation discussion post — real backend-backed (mirrors
// src/components/collation/CommentsBottomSheet.tsx, which is Pulse-specific;
// this is the Collation-discussion equivalent so neither feature risks
// regressing the other).

import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import { Keyboard, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
import { useAppToast } from "@/hooks/useAppToast";
import {
  useCreateDiscussionCommentMutation,
  useDiscussionCommentsQuery,
  useLikeDiscussionCommentMutation,
} from "@/hooks/api/useDiscussionQueries";
import { DiscussionComment as ApiDiscussionComment } from "@/lib/api/discussion.api";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import { Theme } from "@/theme";

type Props = {
  electionId: string;
  postId: string | null;
};

function getMinutesAgo(dateValue?: string): number {
  if (!dateValue) return 0;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
}

const DiscussionCommentsBottomSheet = forwardRef<BottomSheetModal, Props>(
  function DiscussionCommentsBottomSheet({ electionId, postId }, ref) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["62%", "92%"], []);
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );
    const { showToast } = useAppToast();

    const commentsQuery = useDiscussionCommentsQuery(electionId, postId);
    const createCommentMutation = useCreateDiscussionCommentMutation(electionId);
    const likeCommentMutation = useLikeDiscussionCommentMutation(electionId);

    const [text, setText] = useState("");

    const comments = commentsQuery.data?.comments ?? [];

    const close = () => {
      Keyboard.dismiss();
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const submit = async () => {
      const trimmed = text.trim();
      if (!trimmed || !postId) return;

      try {
        await createCommentMutation.mutateAsync({
          postId,
          payload: { body: trimmed, useAnonymousDisplay: false },
        });
        setText("");
      } catch (error) {
        showToast({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Couldn't post your comment. Please try again.",
        });
      }
    };

    const toggleLike = async (comment: ApiDiscussionComment) => {
      if (!postId) return;

      try {
        await likeCommentMutation.mutateAsync({
          postId,
          commentId: comment.id,
        });
      } catch (error) {
        showToast({
          type: "error",
          message:
            error instanceof Error ? error.message : "Couldn't like this comment.",
        });
      }
    };

    const canSend = text.trim().length > 0 && !createCommentMutation.isPending;

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
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.bg}
      >
        <View style={styles.sheetBody}>
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Comments</AppText>

            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <BottomSheetFlatList
            style={styles.list}
            data={comments}
            keyExtractor={(comment) => comment.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            refreshing={commentsQuery.isRefetching}
            onRefresh={() => {
              if (postId) void commentsQuery.refetch();
            }}
            contentContainerStyle={[
              styles.listContent,
              comments.length === 0 && styles.listContentEmpty,
            ]}
            ListEmptyComponent={
              commentsQuery.isLoading ? null : (
                <View style={styles.emptyWrap}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={32}
                    color={Theme.colors.textMuted}
                  />
                  <AppText style={styles.emptyTitle}>No comments yet</AppText>
                  <AppText style={styles.emptyText}>
                    Be the first to respond to this post.
                  </AppText>
                </View>
              )
            }
            renderItem={({ item }) => (
              <View style={styles.commentCard}>
                <View style={styles.commentHead}>
                  <View style={styles.commentAuthorRow}>
                    <Ionicons
                      name="chatbox-ellipses-outline"
                      size={14}
                      color={Theme.colors.textMuted}
                    />
                    <AppText style={styles.commentAuthor} numberOfLines={1}>
                      {item.author.displayName}
                    </AppText>
                  </View>

                  <AppText style={styles.commentTime}>
                    {formatTimeAgo(getMinutesAgo(item.createdAt))}
                  </AppText>
                </View>

                <AppText style={styles.commentBody}>{item.body}</AppText>

                <View style={styles.commentActions}>
                  <Pressable
                    onPress={() => void toggleLike(item)}
                    style={styles.likeBtn}
                    hitSlop={6}
                  >
                    <Ionicons
                      name={item.isLikedByCurrentUser ? "thumbs-up" : "thumbs-up-outline"}
                      size={15}
                      color={
                        item.isLikedByCurrentUser
                          ? Theme.colors.primary
                          : Theme.colors.textMuted
                      }
                    />
                    <AppText
                      style={[
                        styles.likeText,
                        item.isLikedByCurrentUser && { color: Theme.colors.primary },
                      ]}
                    >
                      {item.likesCount} Likes
                    </AppText>
                  </Pressable>
                </View>
              </View>
            )}
          />

          <View
            style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}
          >
            <View style={styles.inputRow}>
              <View style={styles.inputIconWrap}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={20}
                  color={Theme.colors.textMuted}
                />
              </View>

              <View style={styles.inputFieldWrap}>
                <BottomSheetTextInput
                  placeholder="Leave Comment, @ To Mention"
                  placeholderTextColor={Theme.colors.textSoft}
                  value={text}
                  onChangeText={setText}
                  style={styles.input}
                  returnKeyType="send"
                  onSubmitEditing={() => void submit()}
                  multiline
                />
              </View>
            </View>

            <Pressable
              onPress={() => void submit()}
              disabled={!canSend}
              style={[styles.submitBtn, !canSend && styles.submitBtnDisabled]}
            >
              <AppText
                style={[styles.submitBtnText, !canSend && styles.submitBtnTextDisabled]}
                numberOfLines={1}
              >
                {createCommentMutation.isPending ? "Posting..." : "Submit Comment"}
              </AppText>
            </Pressable>
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

export default DiscussionCommentsBottomSheet;

const styles = StyleSheet.create({
  bg: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: { backgroundColor: "rgba(17,26,50,0.12)", width: 44 },
  sheetBody: { flex: 1 },
  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20 },
  listContentEmpty: { flexGrow: 1, justifyContent: "center" },
  commentCard: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: 14,
    marginBottom: 14,
    gap: 6,
  },
  commentHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  commentAuthorRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  commentAuthor: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  commentTime: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted },
  commentBody: { fontSize: 14, lineHeight: 22, color: Theme.colors.text },
  commentActions: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: 2 },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  likeText: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20, gap: 8 },
  emptyTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 240,
  },
  inputContainer: {
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  inputIconWrap: { width: 36, height: 44, alignItems: "center", justifyContent: "center" },
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
    minHeight: 22,
    maxHeight: 100,
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.regular,
    padding: 0,
    textAlignVertical: "top",
  },
  submitBtn: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: { backgroundColor: "#D1D5DB" },
  submitBtnText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.body.semibold,
  },
  submitBtnTextDisabled: { color: "#9CA3AF" },
});
