import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { Keyboard, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import {
  useCreatePulseCommentMutation,
  useLikePulseCommentMutation,
  usePulseCommentsQuery,
  usePulseViewerQuery,
} from "@/hooks/api/usePulseQueries";
import { PulseComment } from "@/lib/api/pulse.api";
import { Theme } from "@/theme";

export type DiscussionComment = {
  id: string;
  author: string;
  body: string;
  minutesAgo: number;
  likes: number;
  shares: number;
  isLikedByCurrentUser?: boolean;
  pendingSync?: boolean;
};

type Props = {
  postId?: string | null;
  comments?: DiscussionComment[];
  onSubmitComment?: (text: string) => void;
};

function getMinutesAgo(dateValue?: string): number {
  if (!dateValue) return 0;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
}

function mapPulseComment(comment: PulseComment): DiscussionComment {
  return {
    id: comment.id,
    author: comment.author.displayName,
    body: comment.body,
    minutesAgo: getMinutesAgo(comment.createdAt),
    likes: comment.likesCount,
    shares: 0,
    isLikedByCurrentUser: comment.isLikedByCurrentUser,
  };
}

function getViewerName(params: {
  firstName?: string;
  lastName?: string;
  anonymousUsername?: string;
  anonymous?: boolean;
}): string {
  if (params.anonymous) {
    return params.anonymousUsername || "Anonymous Citizen";
  }

  const name = [params.firstName, params.lastName].filter(Boolean).join(" ");

  return name || "@You";
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

const CommentsBottomSheet = forwardRef<BottomSheetModal, Props>(
  function CommentsBottomSheet(
    { postId: rawPostId, comments = [], onSubmitComment },
    ref
  ) {
    const insets = useSafeAreaInsets();

    /**
     * Two snap points:
     *  - 62% — default open position. When the keyboard appears,
     *    keyboardBehavior="interactive" lifts the whole sheet above the
     *    keyboard smoothly (Instagram/Facebook style). 62% gives the sheet
     *    enough height so the comment list is still usable after the lift.
     *  - 92% — expanded, for reading long threads.
     */
    const snapPoints = useMemo(() => ["62%", "92%"], []);
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );

    const postId = rawPostId ?? null;

    const { enqueue, isOnline, queue } = useOfflineSync();

    const commentsQuery = usePulseCommentsQuery(postId);
    const createCommentMutation = useCreatePulseCommentMutation();
    const likeCommentMutation = useLikePulseCommentMutation();
    const viewerQuery = usePulseViewerQuery();

    const [text, setText] = useState("");
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

    const apiComments = useMemo(() => {
      return commentsQuery.data?.comments.map(mapPulseComment) ?? [];
    }, [commentsQuery.data]);

    const pendingComments = useMemo<DiscussionComment[]>(() => {
      if (!postId) return [];

      const viewer = viewerQuery.data;

      return queue
        .filter((item) => {
          return (
            item.type === "pulse-create-comment" &&
            !item.synced &&
            item.payload.postId === postId
          );
        })
        .map((item) => {
          const body =
            typeof item.payload.body === "string" ? item.payload.body : "";

          return {
            id: item.id,
            author: getViewerName({
              firstName: viewer?.firstName,
              lastName: viewer?.lastName,
              anonymousUsername: viewer?.anonymousUsername,
              anonymous: item.payload.useAnonymousDisplay === true,
            }),
            body,
            minutesAgo: getMinutesAgo(new Date(item.createdAt).toISOString()),
            likes: 0,
            shares: 0,
            pendingSync: true,
          };
        })
        .filter((item) => item.body.trim().length > 0)
        .reverse();
    }, [postId, queue, viewerQuery.data]);

    const resolvedComments = useMemo(() => {
      if (!postId) return comments;

      return [...pendingComments, ...apiComments];
    }, [apiComments, comments, pendingComments, postId]);

    const close = useCallback(() => {
      Keyboard.dismiss();

      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const submit = useCallback(async () => {
      const trimmed = text.trim();

      if (!trimmed) return;

      if (!postId) {
        onSubmitComment?.(trimmed);
        setText("");
        return;
      }

      const queuedPayload = {
        postId,
        body: trimmed,
        useAnonymousDisplay: false,
      };

      if (!isOnline) {
        enqueue({
          type: "pulse-create-comment",
          payload: queuedPayload,
        });

        setText("");
        return;
      }

      try {
        await createCommentMutation.mutateAsync({
          postId,
          payload: {
            body: trimmed,
            useAnonymousDisplay: false,
          },
        });

        setText("");
        await commentsQuery.refetch();
      } catch (error) {
        if (shouldQueueAfterError(error)) {
          enqueue({
            type: "pulse-create-comment",
            payload: queuedPayload,
          });

          setText("");
          return;
        }

        console.log("Pulse comment submit error:", error);
      }
    }, [
      commentsQuery,
      createCommentMutation,
      enqueue,
      isOnline,
      onSubmitComment,
      postId,
      text,
    ]);

    const toggleLike = useCallback(
      async (comment: DiscussionComment) => {
        if (!postId || comment.pendingSync) return;

        const already =
          likedIds.has(comment.id) || comment.isLikedByCurrentUser === true;

        const nextLiked = !already;

        setLikedIds((prev) => {
          const next = new Set(prev);

          if (nextLiked) {
            next.add(comment.id);
          } else {
            next.delete(comment.id);
          }

          return next;
        });

        setLikeCounts((prev) => ({
          ...prev,
          [comment.id]: Math.max(
            0,
            (prev[comment.id] ?? comment.likes) + (nextLiked ? 1 : -1)
          ),
        }));

        const queuedPayload = {
          postId,
          commentId: comment.id,
        };

        if (!isOnline) {
          enqueue({
            type: "pulse-like-comment",
            payload: queuedPayload,
          });

          return;
        }

        try {
          await likeCommentMutation.mutateAsync({
            postId,
            commentId: comment.id,
          });
        } catch (error) {
          if (shouldQueueAfterError(error)) {
            enqueue({
              type: "pulse-like-comment",
              payload: queuedPayload,
            });

            return;
          }

          console.log("Pulse comment like error:", error);
        }
      },
      [enqueue, isOnline, likeCommentMutation, likedIds, postId]
    );

    const canSend = text.trim().length > 0 && !createCommentMutation.isPending;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        index={0}
        enablePanDownToClose
        enableDynamicSizing={false}
        topInset={insets.top + 12}
        /**
         * "interactive" — the sheet slides up to sit just above the keyboard
         * on both iOS and Android physical devices. This is the correct mode
         * for any sheet with a pinned bottom input (comments, chat, etc.).
         *
         * Do NOT use "extend" + android_keyboardInputMode="adjustResize" here:
         * adjustResize is deprecated on Android 11+ edge-to-edge layouts and
         * fails silently on physical devices, leaving the input buried under
         * the keyboard.
         */
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
            <View style={styles.headerTextWrap}>
              <AppText style={styles.headerTitle}>Comments</AppText>

              {postId && !isOnline ? (
                <AppText style={styles.headerSubtitle}>
                  Offline comments will sync automatically
                </AppText>
              ) : null}
            </View>

            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <BottomSheetFlatList
            style={styles.list}
            data={resolvedComments}
            keyExtractor={(comment) => comment.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            refreshing={commentsQuery.isRefetching}
            onRefresh={() => {
              if (postId) {
                void commentsQuery.refetch();
              }
            }}
            contentContainerStyle={[
              styles.listContent,
              resolvedComments.length === 0 && styles.listContentEmpty,
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
                    Be the first to respond to this pulse update.
                  </AppText>
                </View>
              )
            }
            renderItem={({ item }) => {
              const isLiked =
                likedIds.has(item.id) || item.isLikedByCurrentUser === true;

              const displayLikes = likeCounts[item.id] ?? item.likes;

              return (
                <View style={styles.commentCard}>
                  <View style={styles.commentHead}>
                    <View style={styles.commentAuthorRow}>
                      <Ionicons
                        name={
                          item.pendingSync
                            ? "cloud-upload-outline"
                            : "chatbox-ellipses-outline"
                        }
                        size={14}
                        color={Theme.colors.textMuted}
                      />

                      <AppText style={styles.commentAuthor}>
                        {item.author}
                      </AppText>
                    </View>

                    <AppText style={styles.commentTime}>
                      {item.pendingSync
                        ? "Pending sync"
                        : formatTimeAgo(item.minutesAgo)}
                    </AppText>
                  </View>

                  <AppText style={styles.commentBody}>{item.body}</AppText>

                  <View style={styles.commentActions}>
                    <Pressable
                      onPress={() => {
                        void toggleLike(item);
                      }}
                      style={styles.likeBtn}
                      hitSlop={6}
                      disabled={item.pendingSync}
                    >
                      <Ionicons
                        name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
                        size={15}
                        color={
                          isLiked
                            ? Theme.colors.primary
                            : Theme.colors.textMuted
                        }
                      />

                      <AppText
                        style={[
                          styles.likeText,
                          isLiked && { color: Theme.colors.primary },
                        ]}
                      >
                        {displayLikes} Likes
                      </AppText>
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />

          <View
            style={[
              styles.inputContainer,
              // With keyboardBehavior="interactive" the sheet sits above the
              // keyboard, so just use safe-area insets for the bottom gap.
              { paddingBottom: Math.max(insets.bottom, 8) },
            ]}
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
                  onSubmitEditing={() => {
                    void submit();
                  }}
                  multiline
                />
              </View>
            </View>

            <Pressable
              onPress={() => {
                void submit();
              }}
              disabled={!canSend}
              style={[styles.submitBtn, !canSend && styles.submitBtnDisabled]}
            >
              <AppText
                style={[
                  styles.submitBtnText,
                  !canSend && styles.submitBtnTextDisabled,
                ]}
              >
                {isOnline ? "Submit Comment" : "Save Offline"}
              </AppText>
            </Pressable>
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

export default CommentsBottomSheet;

const styles = StyleSheet.create({
  bg: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  handle: {
    backgroundColor: "rgba(17,26,50,0.12)",
    width: 44,
  },

  sheetBody: {
    flex: 1,
  },

  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },

  headerTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },

  headerSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },

  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },

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
  },

  commentAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  commentAuthor: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  commentTime: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },

  commentBody: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.text,
  },

  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 2,
  },

  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  likeText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
  },

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