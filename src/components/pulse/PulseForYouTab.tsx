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
import { useCallback, useMemo, useRef, useState } from "react";
import { router } from "expo-router";

import AppText from "@/components/ui/AppText";
import CommentsBottomSheet from "@/components/collation/CommentsBottomSheet";
import LiveDiscussionCarousel from "@/components/pulse/LiveDiscussionCarousel";
import PulseDiscussionCard from "@/components/pulse/PulseDiscussionCard";
import {
  LiveElectionDiscussion,
  PulseDiscussionPost,
  liveElectionDiscussions,
} from "@/data/pulse";
import { Paths } from "@/constants/paths";
import { useAppToast } from "@/hooks/useAppToast";
import { useOfflineSync } from "@/context/OfflineSyncContext";
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

export default function PulseForYouTab({ onScrollStateChange }: Props) {
  const { showToast } = useAppToast();
  const { enqueue, isOnline, queue } = useOfflineSync();

  const commentsRef = useRef<BottomSheetModal>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const postsQuery = usePulsePostsInfiniteQuery();
  const viewerQuery = usePulseViewerQuery();
  const likePostMutation = useLikePulsePostMutation();

  const [carouselIndex, setCarouselIndex] = useState(0);
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
          payload: {
            postId: post.apiPostId,
          },
        });

        return;
      }

      try {
        await likePostMutation.mutateAsync(post.apiPostId);
      } catch (error) {
        enqueue({
          type: "pulse-like-post",
          payload: {
            postId: post.apiPostId,
          },
        });

        console.log("Pulse post like queued:", error);
      }
    },
    [enqueue, isOnline, likePostMutation, likedIds, showToast]
  );

  const handleShare = useCallback(
    async (post: PulseFeedItem) => {
      try {
        await Share.share({
          message: `💬 ${post.author}\n🗳 ${post.electionLabel}\n\n${post.body}\n\n👍 ${
            likeCounts[post.apiPostId] ?? post.likes
          } Likes · 💬 ${
            post.commentCount
          } Comments\n\nShared via Citizen Monitors`,
        });
      } catch {
        showToast({ type: "error", message: "Unable to share." });
      }
    },
    [likeCounts, showToast]
  );

  const handleOpenComments = useCallback((post: PulseFeedItem) => {
    if (post.pendingSync) {
      showToast({
        type: "error",
        message: "Comments will be available after this post syncs.",
      });
      return;
    }

    setSelectedPostId(post.apiPostId);
    requestAnimationFrame(() => commentsRef.current?.present());
  }, [showToast]);

  const handleJoinDiscussion = useCallback((item: LiveElectionDiscussion) => {
    router.push({
      pathname: Paths.appCollation as never,
      params: {
        tab: "discussions",
        collationId: item.collationId,
      },
    });
  }, []);

  const handleEndReached = useCallback(() => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
      void postsQuery.fetchNextPage();
    }
  }, [postsQuery]);

  const renderHeader = () => (
    <>
      {liveElectionDiscussions.length > 0 ? (
        <LiveDiscussionCarousel
          items={liveElectionDiscussions}
          activeIndex={carouselIndex}
          onIndexChange={setCarouselIndex}
          onJoinDiscussion={handleJoinDiscussion}
        />
      ) : null}
    </>
  );

  const renderItem = ({ item }: ListRenderItemInfo<PulseFeedItem>) => {
    const isLiked =
      likedIds.has(item.apiPostId) || item.isLikedByCurrentUser;
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
  };

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
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
            refreshing={postsQuery.isRefetching}
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
          postsQuery.isLoading ? null : (
            <View style={styles.emptyWrap}>
              <NoDiscussion width={110} height={110} />
              <AppText style={styles.emptyTitle}>No Discussion yet</AppText>
              <AppText style={styles.emptySubtitle}>
                You will see discussions in your polling unit here.
              </AppText>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      <CommentsBottomSheet ref={commentsRef} postId={selectedPostId} />
    </>
  );
}

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
});