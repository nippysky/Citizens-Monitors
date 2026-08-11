import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";

import AppText from "@/components/ui/AppText";
import CommentsBottomSheet from "@/components/collation/CommentsBottomSheet";
import PulseDiscussionCard from "@/components/pulse/PulseDiscussionCard";
import PulseWelcomeCard from "@/components/pulse/PulseWelcomeCard";
import { PulseDiscussionPost } from "@/data/pulse";
import { useAppToast } from "@/hooks/useAppToast";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { useAuth } from "@/context/AuthContext";
import {
  useLikePulsePostMutation,
  usePulsePostsInfiniteQuery,
  usePulseViewerQuery,
} from "@/hooks/api/usePulseQueries";
import { PulsePost } from "@/lib/api/pulse.api";
import { Theme } from "@/theme";
import NoDiscussion from "@/svgs/app/collation/NoDiscussion";

type Props = {
  onScrollStateChange?: (scrolling: boolean) => void;
};

type PulseFeedItem = PulseDiscussionPost & {
  apiPostId: string;
  isLikedByCurrentUser: boolean;
  pendingSync?: boolean;
};

function getMinutesAgo(dateValue?: string): number {
  if (!dateValue) return 0;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 0;

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
}

function getScopeLabel(scope: string): string {
  return scope === "lga" ? "Post Within LGA" : "Post Within My Ward";
}

function mapPostToFeedItem(post: PulsePost): PulseFeedItem {
  return {
    id: post.id,
    apiPostId: post.id,
    author: post.author.displayName,
    electionLabel: "Pulse Update",
    scopeLabel: getScopeLabel(post.visibilityScope),
    body: post.body,
    imageUri: post.imageUrl ?? undefined,
    minutesAgo: getMinutesAgo(post.createdAt),
    likes: post.likesCount,
    commentCount: post.commentsCount,
    shares: 0,
    isLikedByCurrentUser: post.isLikedByCurrentUser,
  };
}

function getQueuedPostAuthor(params: {
  useAnonymousDisplay: boolean;
  anonymousUsername?: string;
  firstName?: string;
  lastName?: string;
}): string {
  if (params.useAnonymousDisplay) {
    return params.anonymousUsername || "Anonymous Citizen";
  }

  const name = [params.firstName, params.lastName].filter(Boolean).join(" ");

  return name || "@You";
}

function PulseSkeletonBlock({ style }: { style?: object }) {
  return <View style={[styles.skeletonBlock, style]} />;
}

function PulsePostSkeleton() {
  return (
    <View style={styles.skeletonPostCard}>
      <View style={styles.skeletonAuthorRow}>
        <PulseSkeletonBlock style={styles.skeletonAvatar} />

        <View style={styles.skeletonAuthorTextWrap}>
          <PulseSkeletonBlock style={styles.skeletonAuthorName} />
          <PulseSkeletonBlock style={styles.skeletonPostMeta} />
        </View>

        <PulseSkeletonBlock style={styles.skeletonTime} />
      </View>

      <PulseSkeletonBlock style={styles.skeletonBodyOne} />
      <PulseSkeletonBlock style={styles.skeletonBodyTwo} />
      <PulseSkeletonBlock style={styles.skeletonImage} />

      <View style={styles.skeletonActionsRow}>
        <PulseSkeletonBlock style={styles.skeletonAction} />
        <PulseSkeletonBlock style={styles.skeletonAction} />
        <PulseSkeletonBlock style={styles.skeletonAction} />
      </View>
    </View>
  );
}

function PulseFeedSkeleton() {
  return (
    <View>
      <PulsePostSkeleton />
      <PulsePostSkeleton />
      <PulsePostSkeleton />
      <View style={{ height: 120 }} />
    </View>
  );
}

/** SecureStore key scoped per-user so each account gets its own first-visit flag. */
function welcomeSeenKey(userId: string): string {
  return `pulse_welcome_seen_${userId}`;
}

export default function PulseForYouTab({ onScrollStateChange }: Props) {
  const { showToast } = useAppToast();
  const { enqueue, isOnline, queue } = useOfflineSync();
  const { user } = useAuth();

  const commentsRef = useRef<BottomSheetModal>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // null = still reading SecureStore (don't render card yet to avoid flash).
  // true = user has already seen the welcome card → never show again.
  // false = first visit → show card.
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  // Hoisted so the dependency is a plain value. Referencing `user?.id` inside
  // the hook made the compiler infer a dependency on the whole `user` object,
  // which is broader than the declared dep and disabled optimisation for the
  // entire component (react-hooks/preserve-manual-memoization).
  const userId = user?.id;

  // Read the per-user flag from SecureStore on mount.
  useEffect(() => {
    if (!userId) return;

    SecureStore.getItemAsync(welcomeSeenKey(userId))
      .then((value) => setHasSeenWelcome(value === "1"))
      .catch(() => setHasSeenWelcome(false)); // on error, show the card
  }, [userId]);

  const handleDismissWelcome = useCallback(() => {
    if (!userId) return;
    setHasSeenWelcome(true);
    void SecureStore.setItemAsync(welcomeSeenKey(userId), "1");
  }, [userId]);

  const postsQuery = usePulsePostsInfiniteQuery();
  const viewerQuery = usePulseViewerQuery();
  const likePostMutation = useLikePulsePostMutation();

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const apiPosts = useMemo(
    () =>
      postsQuery.data?.pages.flatMap((page) =>
        page.posts.map(mapPostToFeedItem)
      ) ?? [],
    [postsQuery.data]
  );

  const pendingPosts = useMemo<PulseFeedItem[]>(() => {
    const viewer = viewerQuery.data;

    return queue
      .filter((item) => item.type === "pulse-create-post" && !item.synced)
      .map((item) => {
        const body =
          typeof item.payload.body === "string" ? item.payload.body : "";
        const imageUri =
          typeof item.payload.imageUri === "string"
            ? item.payload.imageUri
            : undefined;
        const useAnonymousDisplay = item.payload.useAnonymousDisplay === true;

        return {
          id: item.id,
          apiPostId: item.id,
          author: getQueuedPostAuthor({
            useAnonymousDisplay,
            anonymousUsername: viewer?.anonymousUsername,
            firstName: viewer?.firstName,
            lastName: viewer?.lastName,
          }),
          electionLabel: "Pending Sync",
          scopeLabel: "Post Within My Ward",
          body,
          imageUri,
          minutesAgo: getMinutesAgo(new Date(item.createdAt).toISOString()),
          likes: 0,
          commentCount: 0,
          shares: 0,
          isLikedByCurrentUser: false,
          pendingSync: true,
        };
      })
      .reverse();
  }, [queue, viewerQuery.data]);

  const posts = useMemo(
    () => [...pendingPosts, ...apiPosts],
    [apiPosts, pendingPosts]
  );

  const hasPosts = posts.length > 0;

  const isInitialLoading =
    postsQuery.isLoading && !postsQuery.data && pendingPosts.length === 0;

  const isRefreshing = postsQuery.isRefetching;

  const onRefresh = useCallback(() => {
    void postsQuery.refetch();
  }, [postsQuery]);

  const handleScroll = useCallback(
    (_: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScrollStateChange?.(true);

      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      scrollTimerRef.current = setTimeout(
        () => onScrollStateChange?.(false),
        300
      );
    },
    [onScrollStateChange]
  );

  const handleLike = useCallback(
    async (post: PulseFeedItem) => {
      if (post.pendingSync) {
        showToast({
          type: "error",
          message: "This post will be available after it syncs.",
        });
        return;
      }

      const already =
        likedIds.has(post.apiPostId) || post.isLikedByCurrentUser;
      const nextLiked = !already;

      setLikedIds((prev) => {
        const next = new Set(prev);

        if (nextLiked) {
          next.add(post.apiPostId);
        } else {
          next.delete(post.apiPostId);
        }

        return next;
      });

      setLikeCounts((prev) => ({
        ...prev,
        [post.apiPostId]: Math.max(
          0,
          (prev[post.apiPostId] ?? post.likes) + (nextLiked ? 1 : -1)
        ),
      }));

      if (!isOnline) {
        enqueue({
          type: "pulse-like-post",
          payload: { postId: post.apiPostId },
        });

        return;
      }

      try {
        await likePostMutation.mutateAsync(post.apiPostId);
      } catch (error) {
        enqueue({
          type: "pulse-like-post",
          payload: { postId: post.apiPostId },
        });

        console.log("Pulse post like queued:", error);
      }
    },
    [enqueue, isOnline, likePostMutation, likedIds, showToast]
  );

  const handleShare = useCallback(
    async (post: PulseFeedItem) => {
      try {
        await Share.share({ message: post.body });
      } catch {
        showToast({ type: "error", message: "Unable to share." });
      }
    },
    // `likeCounts` was a stale dependency — this callback doesn't read it, and
    // including it re-created the handler (and re-rendered every card) on
    // every like.
    [showToast]
  );

  const handleOpenComments = useCallback(
    (post: PulseFeedItem) => {
      if (post.pendingSync) {
        showToast({
          type: "error",
          message: "Comments will be available after this post syncs.",
        });
        return;
      }

      setSelectedPostId(post.apiPostId);
      requestAnimationFrame(() => commentsRef.current?.present());
    },
    [showToast]
  );

  const handleEndReached = useCallback(() => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
      void postsQuery.fetchNextPage();
    }
  }, [postsQuery]);

  // ── Memoized header element ──
  // CRITICAL: passing a fresh function as ListHeaderComponent on every render
  // makes FlatList treat it as a NEW component type and remount it. By
  // memoizing the JSX element here, the header keeps its identity across
  // parent re-renders.
  //
  // The founder welcome card is the "nothing here yet" placeholder for a
  // brand new ward feed — it must never sit alongside real posts. So it only
  // shows when the feed is genuinely empty (no real posts, no queued posts)
  // AND the user hasn't already dismissed it. There is no live-election
  // carousel on this screen — that belongs on Collation, not Pulse.
  const headerElement = useMemo(() => {
    if (hasSeenWelcome === false && !hasPosts) {
      return <PulseWelcomeCard onDismiss={handleDismissWelcome} />;
    }

    return null;
  }, [hasSeenWelcome, hasPosts, handleDismissWelcome]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PulseFeedItem>) => {
      const isLiked = likedIds.has(item.apiPostId) || item.isLikedByCurrentUser;
      const displayLikes = likeCounts[item.apiPostId] ?? item.likes;

      return (
        <PulseDiscussionCard
          post={item}
          isLiked={isLiked}
          displayLikes={displayLikes}
          onLike={() => {
            void handleLike(item);
          }}
          onComment={() => handleOpenComments(item)}
          onShare={() => {
            void handleShare(item);
          }}
        />
      );
    },
    [handleLike, handleOpenComments, handleShare, likeCounts, likedIds]
  );

  if (isInitialLoading) {
    return <PulseFeedSkeleton />;
  }

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={headerElement}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          !hasPosts && styles.listContentEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <NoDiscussion width={110} height={110} />
            <AppText style={styles.emptyTitle}>No Discussion yet</AppText>
            <AppText style={styles.emptySubtitle}>
              You will see discussions in your polling unit here.
            </AppText>
          </View>
        }
        ListFooterComponent={
          <>
            {postsQuery.isFetchingNextPage ? <PulsePostSkeleton /> : null}
            <View style={{ height: 120 }} />
          </>
        }
      />

      <CommentsBottomSheet ref={commentsRef} postId={selectedPostId} />
    </>
  );
}

const skeletonColor = "rgba(17,26,50,0.08)";
const skeletonColorStrong = "rgba(17,26,50,0.12)";

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
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

  skeletonBlock: {
    backgroundColor: skeletonColor,
    overflow: "hidden",
  },

  skeletonPostCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    gap: 10,
  },
  skeletonAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  skeletonAuthorTextWrap: {
    flex: 1,
    gap: 6,
  },
  skeletonAuthorName: {
    width: "42%",
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColorStrong,
  },
  skeletonPostMeta: {
    width: "56%",
    height: 12,
    borderRadius: 999,
  },
  skeletonTime: {
    width: 44,
    height: 12,
    borderRadius: 999,
  },
  skeletonBodyOne: {
    width: "92%",
    height: 14,
    borderRadius: 999,
  },
  skeletonBodyTwo: {
    width: "64%",
    height: 14,
    borderRadius: 999,
  },
  skeletonImage: {
    width: "100%",
    height: 200,
    borderRadius: 14,
  },
  skeletonActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingTop: 2,
  },
  skeletonAction: {
    width: 78,
    height: 16,
    borderRadius: 999,
  },
});