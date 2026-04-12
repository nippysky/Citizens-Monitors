// ─── src/components/collation/CollationDiscussionsTab.tsx ─────────────────────
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useCallback, useRef, useState } from "react";

import AppText from "@/components/ui/AppText";
import CommentsBottomSheet, {
  DiscussionComment,
} from "@/components/collation/CommentsBottomSheet";
import ShareOpinionBottomSheet from "@/components/collation/ShareOpinionBottomSheet";
import { useAppToast } from "@/hooks/useAppToast";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { CollationItem, DiscussionItem } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";

type Props = { collation: CollationItem };

const seedComments: DiscussionComment[] = [
  { id: "c1", author: "@IronEagle23", body: "Here is the latest verified election result from Alimosho Ward 4. The process was peaceful and orderly throughout the morning.", minutesAgo: 2, likes: 14, shares: 3 },
  { id: "c2", author: "@SilverKing65", body: "The process was calm in my area too, and officials arrived early enough.", minutesAgo: 4, likes: 11, shares: 2 },
  { id: "c3", author: "@Fishtank89", body: "Crowd control improved later in the morning and things became easier.", minutesAgo: 6, likes: 9, shares: 1 },
];

export default function CollationDiscussionsTab({ collation }: Props) {
  const { showToast } = useAppToast();
  const { enqueue } = useOfflineSync();
  const commentsRef = useRef<BottomSheetModal>(null);
  const shareOpinionRef = useRef<BottomSheetModal>(null);
  const [comments, setComments] = useState<DiscussionComment[]>(seedComments);
  const [refreshing, setRefreshing] = useState(false);

  // Local discussions list — starts from collation data, grows with user posts
  const [localDiscussions, setLocalDiscussions] = useState<DiscussionItem[]>(
    collation.discussions
  );

  // Like state
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [localLikeCounts, setLocalLikeCounts] = useState<Record<string, number>>({});

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1400);
  }, []);

  const handleLike = useCallback(
    (id: string, currentLikes: number) => {
      const alreadyLiked = likedIds.has(id);
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (alreadyLiked) next.delete(id);
        else next.add(id);
        return next;
      });
      setLocalLikeCounts((prev) => ({
        ...prev,
        [id]: alreadyLiked
          ? (prev[id] ?? currentLikes) - 1
          : (prev[id] ?? currentLikes) + 1,
      }));
      enqueue({
        type: "like",
        payload: { discussionId: id, liked: !alreadyLiked },
      });
    },
    [likedIds, enqueue]
  );

  const handleShare = useCallback(
    async (item: DiscussionItem) => {
      const message = [
        `💬 ${item.author}`,
        `🗳 ${collation.fullTitle}`,
        "",
        item.body,
        "",
        `👍 ${item.likes} Likes · 💬 ${item.commentCount} Comments · 🔗 ${item.shares} Shares`,
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

  const handleNewComment = useCallback(
    (text: string) => {
      const next: DiscussionComment = {
        id: String(Date.now()),
        author: "@You",
        body: text,
        minutesAgo: 0,
        likes: 0,
        shares: 0,
      };
      setComments((prev) => [next, ...prev]);
      enqueue({
        type: "comment",
        payload: { collationId: collation.id, text },
      });
      showToast({ type: "success", message: "Comment submitted." });
    },
    [showToast, enqueue, collation.id]
  );

  // ── Share opinion → adds to discussion list immediately ──
  const handleOpinionSubmitted = useCallback(() => {
    showToast({ type: "success", message: "Discussion post created." });
  }, [showToast]);

  const handleOpinionPayload = useCallback(
    (payload: {
      opinion: string;
      audience: string;
      shareToSocial: boolean;
    }) => {
      // Add to local discussions immediately (offline-first)
      const newDiscussion: DiscussionItem = {
        id: `local-${Date.now()}`,
        author: "@You",
        body: payload.opinion,
        minutesAgo: 0,
        likes: 0,
        commentCount: 0,
        shares: 0,
      };
      setLocalDiscussions((prev) => [newDiscussion, ...prev]);

      // Queue for server sync
      enqueue({
        type: "opinion",
        payload: {
          collationId: collation.id,
          opinion: payload.opinion,
          audience: payload.audience,
          shareToSocial: payload.shareToSocial,
        },
      });
    },
    [enqueue, collation.id]
  );

  const openShareOpinion = useCallback(() => {
    requestAnimationFrame(() => {
      shareOpinionRef.current?.present();
    });
  }, []);

  const hasDiscussions = collation.canJoinDiscussion || localDiscussions.length > 0;

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

        {!hasDiscussions ? (
          <View style={styles.emptyWrap}>
            <NoElection width={110} height={110} />
            <AppText style={styles.emptyTitle}>No Discussion yet</AppText>
            <AppText style={styles.emptySubtitle}>
              You can be the first to drop your opinion
            </AppText>
          </View>
        ) : (
          localDiscussions.map((item) => {
            const isLiked = likedIds.has(item.id);
            const displayLikes = localLikeCounts[item.id] ?? item.likes;

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.authorRow}>
                    <Ionicons
                      name="chatbox-ellipses-outline"
                      size={16}
                      color={Theme.colors.textMuted}
                    />
                    <AppText style={styles.author}>{item.author}</AppText>
                  </View>
                  <AppText style={styles.timeText}>
                    {item.minutesAgo} min ago
                  </AppText>
                </View>

                <View style={styles.electionLabelRow}>
                  <View style={styles.electionDot} />
                  <AppText style={styles.electionLabelText}>
                    {collation.fullTitle}
                  </AppText>
                </View>

                <AppText style={styles.body}>{item.body}</AppText>

                <View style={styles.metaRow}>
                  <Pressable
                    onPress={() => handleLike(item.id, item.likes)}
                    style={styles.metaItem}
                    hitSlop={6}
                  >
                    <Ionicons
                      name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
                      size={16}
                      color={
                        isLiked
                          ? Theme.colors.primary
                          : Theme.colors.textMuted
                      }
                    />
                    <AppText
                      style={[
                        styles.metaText,
                        isLiked && { color: Theme.colors.primary },
                      ]}
                    >
                      {displayLikes} Likes
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => commentsRef.current?.present()}
                    style={styles.metaItem}
                    hitSlop={6}
                  >
                    <Ionicons
                      name="chatbox-ellipses-outline"
                      size={16}
                      color={Theme.colors.textMuted}
                    />
                    <AppText style={styles.metaText}>
                      {item.commentCount} Comments
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => handleShare(item)}
                    style={styles.metaItem}
                    hitSlop={6}
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={16}
                      color={Theme.colors.textMuted}
                    />
                    <AppText style={styles.metaText}>
                      {item.shares} Shares
                    </AppText>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Sticky input */}
      <StickyInput onPress={openShareOpinion} />

      <CommentsBottomSheet
        ref={commentsRef}
        comments={comments}
        onSubmitComment={handleNewComment}
      />
      <ShareOpinionBottomSheet
        ref={shareOpinionRef}
        onSubmitted={handleOpinionSubmitted}
        onPayload={handleOpinionPayload}
      />
    </View>
  );
}

function StickyInput({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.stickyWrap}>
      <Pressable onPress={onPress} style={styles.stickyRow}>
        <View style={styles.stickyIcon}>
          <Ionicons
            name="chatbubbles-outline"
            size={20}
            color={Theme.colors.textMuted}
          />
        </View>
        <View style={styles.stickyInputFake}>
          <AppText style={styles.stickyPlaceholder}>
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
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  author: {
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
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  body: { fontSize: 14, lineHeight: 22, color: Theme.colors.text },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingTop: 4,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, lineHeight: 16, color: Theme.colors.textMuted },

  stickyWrap: {
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 8 : 10,
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