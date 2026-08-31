// Functional discussion tab — real backend-backed (create/list posts, like,
// comment). (Named singular to match the existing import in election/[id].tsx.)
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";

import { isTabPathname } from "@/constants/tabRoutes";
import { useTabBarLayout } from "@/hooks/useTabBarLayout";

import AppText from "@/components/ui/AppText";
import DiscussionCommentsBottomSheet from "@/components/collation/DiscussionCommentsBottomSheet";
import ShareOpinionBottomSheet from "@/components/collation/ShareOpinionBottomSheet";
import { useAppToast } from "@/hooks/useAppToast";
import {
  useDiscussionPostsInfiniteQuery,
  useLikeDiscussionPostMutation,
} from "@/hooks/api/useDiscussionQueries";
import { DiscussionPost } from "@/lib/api/discussion.api";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import { CollationItem } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";

type Props = {
  collation: CollationItem;
  refreshing?: boolean;
  onRefresh?: () => void;
};

function getMinutesAgo(dateValue?: string): number {
  if (!dateValue) return 0;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
}

export default function CollationDiscussionsTab({
  collation,
  refreshing: externalRefreshing,
  onRefresh: externalRefresh,
}: Props) {
  const { showToast } = useAppToast();
  const commentsRef = useRef<BottomSheetModal>(null);
  const shareOpinionRef = useRef<BottomSheetModal>(null);

  const electionId = collation.id;
  const postsQuery = useDiscussionPostsInfiniteQuery(electionId);
  const likePostMutation = useLikeDiscussionPostMutation(electionId);

  const [activePostId, setActivePostId] = useState<string | null>(null);

  const posts = useMemo<DiscussionPost[]>(
    () => postsQuery.data?.pages.flatMap((page) => page.posts) ?? [],
    [postsQuery.data]
  );

  const refreshing = externalRefreshing ?? postsQuery.isRefetching;

  const onRefresh = useCallback(() => {
    void postsQuery.refetch();
    externalRefresh?.();
  }, [externalRefresh, postsQuery]);

  const handleLike = useCallback(
    (postId: string) => {
      likePostMutation.mutate(postId, {
        onError: (error) => {
          showToast({
            type: "error",
            message:
              error instanceof Error ? error.message : "Couldn't like this post.",
          });
        },
      });
    },
    [likePostMutation, showToast]
  );

  const handleShare = useCallback(
    async (item: DiscussionPost) => {
      const message = [
        `💬 ${item.author.displayName}`,
        `🗳 ${collation.fullTitle}`,
        "",
        item.body,
        "",
        `👍 ${item.likesCount} Likes`,
        "",
        "Shared via Citizen Monitors",
      ].join("\n");

      try {
        await Share.share({ message });
      } catch {
        showToast({ type: "error", message: "Unable to share right now." });
      }
    },
    [collation.fullTitle, showToast]
  );

  const openComments = useCallback((postId: string) => {
    setActivePostId(postId);
    requestAnimationFrame(() => {
      commentsRef.current?.present();
    });
  }, []);

  const openShareOpinion = useCallback(() => {
    requestAnimationFrame(() => {
      shareOpinionRef.current?.present();
    });
  }, []);

  const handleOpinionSubmitted = useCallback(() => {
    showToast({ type: "success", message: "Discussion post created." });
  }, [showToast]);

  const hasDiscussions = posts.length > 0;
  const isInitialLoading = postsQuery.isLoading;
  const hasError = postsQuery.isError && !hasDiscussions;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.pageContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        }
      >
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Election Discussion</AppText>
          <AppText style={styles.sectionSubtitle}>
            See the updates of this election from polling unit members.
          </AppText>
        </View>

        {isInitialLoading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={Theme.colors.primary} />
          </View>
        ) : hasError ? (
          <View style={styles.emptyWrap}>
            <NoElection width={110} height={110} />
            <AppText style={styles.emptyTitle}>Couldn&apos;t load discussions</AppText>
            <AppText style={styles.emptySubtitle}>
              Pull down to try again.
            </AppText>
          </View>
        ) : !hasDiscussions ? (
          <View style={styles.emptyWrap}>
            <NoElection width={110} height={110} />
            <AppText style={styles.emptyTitle}>No Discussion yet</AppText>
            <AppText style={styles.emptySubtitle}>
              You can be the first to drop your opinion
            </AppText>
          </View>
        ) : (
          posts.map((item) => {
            const previewImage = item.imageUrls?.[0];
            const hasVideo = (item.videoUrls?.length ?? 0) > 0;

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.authorRow}>
                    <Ionicons
                      name="chatbox-ellipses-outline"
                      size={16}
                      color={Theme.colors.textMuted}
                    />
                    <AppText style={styles.author} numberOfLines={1}>
                      {item.author.displayName}
                    </AppText>
                  </View>
                  <AppText style={styles.timeText}>
                    {formatTimeAgo(getMinutesAgo(item.createdAt))}
                  </AppText>
                </View>

                <View style={styles.electionLabelRow}>
                  <View style={styles.electionDot} />
                  <AppText style={styles.electionLabelText} numberOfLines={1}>
                    {collation.fullTitle}
                  </AppText>
                </View>

                <AppText style={styles.body}>{item.body}</AppText>

                {previewImage ? (
                  <Image source={{ uri: previewImage }} style={styles.previewImage} />
                ) : null}

                {hasVideo ? (
                  <View style={styles.videoTag}>
                    <Ionicons name="videocam" size={14} color={Theme.colors.primary} />
                    <AppText style={styles.videoTagText}>Video attached</AppText>
                  </View>
                ) : null}

                <View style={styles.metaRow}>
                  <Pressable
                    onPress={() => handleLike(item.id)}
                    style={styles.metaItem}
                    hitSlop={6}
                  >
                    <Ionicons
                      name={item.isLikedByCurrentUser ? "thumbs-up" : "thumbs-up-outline"}
                      size={16}
                      color={
                        item.isLikedByCurrentUser
                          ? Theme.colors.primary
                          : Theme.colors.textMuted
                      }
                    />
                    <AppText
                      style={[
                        styles.metaText,
                        item.isLikedByCurrentUser && { color: Theme.colors.primary },
                      ]}
                    >
                      {item.likesCount} Likes
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => openComments(item.id)}
                    style={styles.metaItem}
                    hitSlop={6}
                  >
                    <Ionicons
                      name="chatbox-ellipses-outline"
                      size={16}
                      color={Theme.colors.textMuted}
                    />
                    <AppText style={styles.metaText}>Comments</AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => void handleShare(item)}
                    style={styles.metaItem}
                    hitSlop={6}
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={16}
                      color={Theme.colors.textMuted}
                    />
                    <AppText style={styles.metaText}>Share</AppText>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        {postsQuery.hasNextPage ? (
          <Pressable
            onPress={() => void postsQuery.fetchNextPage()}
            style={styles.loadMoreBtn}
            disabled={postsQuery.isFetchingNextPage}
          >
            <AppText style={styles.loadMoreText}>
              {postsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
            </AppText>
          </Pressable>
        ) : null}
      </ScrollView>

      <StickyInput onPress={openShareOpinion} />

      <DiscussionCommentsBottomSheet
        ref={commentsRef}
        electionId={electionId}
        postId={activePostId}
      />
      <ShareOpinionBottomSheet
        ref={shareOpinionRef}
        electionId={electionId}
        onSubmitted={handleOpinionSubmitted}
      />
    </View>
  );
}

function StickyInput({ onPress }: { onPress: () => void }) {
  const { bottomInset, tabBarHeight } = useTabBarLayout();
  const pathname = usePathname();

  // This tab renders in two very different places:
  // - Collation tab screen → the absolute tab bar overlays the bottom, so the
  //   input must sit fully above it.
  // - Election details (stack screen, no tab bar) → the input only needs to
  //   clear the home indicator / gesture area.
  const paddingBottom = isTabPathname(pathname)
    ? tabBarHeight + 10
    : Math.max(bottomInset, 10);

  return (
    <View style={[styles.stickyWrap, { paddingBottom }]}>
      <Pressable onPress={onPress} style={styles.stickyRow}>
        <View style={styles.stickyIcon}>
          <Ionicons name="chatbubbles-outline" size={20} color={Theme.colors.textMuted} />
        </View>
        <View style={styles.stickyInputFake}>
          <AppText style={styles.stickyPlaceholder} numberOfLines={1}>
            How Do You Feel About This Election Today?
          </AppText>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageContent: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  section: { gap: 8, marginBottom: 16 },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  card: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: 16,
    marginBottom: 16,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  authorRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  author: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  timeText: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted },
  electionLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  electionDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#EF4444",
  },
  electionLabelText: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  body: { fontSize: 14, lineHeight: 22, color: Theme.colors.text },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    resizeMode: "cover",
  },
  videoTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#EAFBF9",
    borderRadius: 10,
  },
  videoTagText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingTop: 4,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, lineHeight: 16, color: Theme.colors.textMuted },
  loadMoreBtn: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  loadMoreText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  stickyWrap: {
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    // paddingBottom is applied inline — it depends on safe-area insets and
    // whether the tab bar overlays this screen.
  },
  stickyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stickyIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyInputFake: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  stickyPlaceholder: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textSoft,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 240,
  },
});
