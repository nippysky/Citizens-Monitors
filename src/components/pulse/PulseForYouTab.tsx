// ─── src/components/pulse/PulseForYouTab.tsx ──────────────────────────────────
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useCallback, useRef, useState } from "react";
import { router } from "expo-router";

import AppText from "@/components/ui/AppText";
import CommentsBottomSheet, {
  DiscussionComment,
} from "@/components/collation/CommentsBottomSheet";
import LiveDiscussionCarousel from "@/components/pulse/LiveDiscussionCarousel";
import PulseDiscussionCard from "@/components/pulse/PulseDiscussionCard";
import {
  LiveElectionDiscussion,
  PulseDiscussionPost,
  liveElectionDiscussions,
  pulseDiscussionPosts,
} from "@/data/pulse";
import { Paths } from "@/constants/paths";
import { useAppToast } from "@/hooks/useAppToast";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { Theme } from "@/theme";
import NoDiscussion from "@/svgs/app/collation/NoDiscussion";

type Props = {
  onScrollStateChange?: (scrolling: boolean) => void;
  injectedPosts: PulseDiscussionPost[];
};

const seedComments: DiscussionComment[] = [
  {
    id: "pc1",
    author: "@IronEagle23",
    body: "Here is the latest verified election result from Alimosho Ward 4. The process was peaceful and orderly throughout the morning.",
    minutesAgo: 2,
    likes: 2,
    shares: 0,
  },
  {
    id: "pc2",
    author: "@IronEagle23",
    body: "Here is the latest verified election result. The process was peaceful and orderly.",
    minutesAgo: 3,
    likes: 12,
    shares: 1,
  },
  {
    id: "pc3",
    author: "Johnson K.",
    body: "Here is the latest verified election result from Alimosho Ward 4.",
    minutesAgo: 4,
    likes: 0,
    shares: 0,
  },
];

export default function PulseForYouTab({
  onScrollStateChange,
  injectedPosts,
}: Props) {
  const { showToast } = useAppToast();
  const { enqueue } = useOfflineSync();
  const commentsRef = useRef<BottomSheetModal>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [comments, setComments] = useState<DiscussionComment[]>(seedComments);

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allPosts = [...injectedPosts, ...pulseDiscussionPosts];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1400);
  }, []);

  const handleScroll = useCallback(
    (_: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScrollStateChange?.(true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(
        () => onScrollStateChange?.(false),
        300
      );
    },
    [onScrollStateChange]
  );

  const handleLike = useCallback(
    (id: string, currentLikes: number) => {
      const already = likedIds.has(id);
      setLikedIds((prev) => {
        const n = new Set(prev);
        if (already) n.delete(id);
        else n.add(id);
        return n;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [id]: already
          ? (prev[id] ?? currentLikes) - 1
          : (prev[id] ?? currentLikes) + 1,
      }));
      enqueue({ type: "like", payload: { postId: id, liked: !already } });
    },
    [likedIds, enqueue]
  );

  const handleShare = useCallback(
    async (post: PulseDiscussionPost) => {
      try {
        await Share.share({
          message: `💬 ${post.author}\n🗳 ${post.electionLabel}\n\n${post.body}\n\n👍 ${post.likes} Likes · 💬 ${post.commentCount} Comments\n\nShared via Citizen Monitors`,
        });
      } catch {
        showToast({ type: "error", message: "Unable to share." });
      }
    },
    [showToast]
  );

  const handleComment = useCallback(
    (text: string) => {
      setComments((prev) => [
        {
          id: String(Date.now()),
          author: "@You",
          body: text,
          minutesAgo: 0,
          likes: 0,
          shares: 0,
        },
        ...prev,
      ]);
      enqueue({ type: "comment", payload: { text, source: "pulse" } });
      showToast({ type: "success", message: "Comment submitted." });
    },
    [enqueue, showToast]
  );

  // ── Navigate to collation screen's discussion tab ──
  const handleJoinDiscussion = useCallback(
    (item: LiveElectionDiscussion) => {
      router.push({
        pathname: Paths.appCollation as any,
        params: {
          tab: "discussions",
          collationId: item.collationId,
        },
      });
    },
    []
  );

  const hasPosts = allPosts.length > 0;

  return (
    <>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        }
      >
        {liveElectionDiscussions.length > 0 ? (
          <LiveDiscussionCarousel
            items={liveElectionDiscussions}
            activeIndex={carouselIndex}
            onIndexChange={setCarouselIndex}
            onJoinDiscussion={handleJoinDiscussion}
          />
        ) : null}

        {hasPosts ? (
          <View style={styles.feedWrap}>
            {allPosts.map((post) => (
              <PulseDiscussionCard
                key={post.id}
                post={post}
                isLiked={likedIds.has(post.id)}
                displayLikes={likeCounts[post.id] ?? post.likes}
                onLike={() => handleLike(post.id, post.likes)}
                onComment={() => commentsRef.current?.present()}
                onShare={() => handleShare(post)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <NoDiscussion width={110} height={110} />
            <AppText style={styles.emptyTitle}>No Discussion yet</AppText>
            <AppText style={styles.emptySubtitle}>
              You will see discussion is going on in your polling unit here.
            </AppText>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <CommentsBottomSheet
        ref={commentsRef}
        comments={comments}
        onSubmitComment={handleComment}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8 },
  feedWrap: { marginTop: 8 },
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