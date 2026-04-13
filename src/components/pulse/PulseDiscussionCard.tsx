// ─── src/components/pulse/PulseDiscussionCard.tsx ─────────────────────────────
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";
import { PulseDiscussionPost } from "@/data/pulse";
import { Theme } from "@/theme";
import ProfileAvatar from "@/svgs/app/profile/ProfileAvatar";

type Props = {
  post: PulseDiscussionPost;
  isLiked: boolean;
  displayLikes: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
};

export default function PulseDiscussionCard({
  post,
  isLiked,
  displayLikes,
  onLike,
  onComment,
  onShare,
}: Props) {
  return (
    <View style={styles.card}>
      {/* Author row */}
      <View style={styles.authorRow}>
        <View style={styles.avatarWrap}>
          {post.avatarUri ? (
            <Image source={{ uri: post.avatarUri }} style={styles.avatar} />
          ) : (
            <ProfileAvatar width={36} height={36} />
          )}
        </View>

        <View style={styles.authorInfo}>
          <View style={styles.authorNameRow}>
            <AppText style={styles.authorName}>{post.author}</AppText>
            <AppText style={styles.timeText}>{post.minutesAgo} min ago</AppText>
          </View>
          <View style={styles.electionLabelRow}>
            <View style={styles.electionDot} />
            <AppText style={styles.electionLabelText} numberOfLines={1}>
              {post.electionLabel}
            </AppText>
          </View>
        </View>
      </View>

      {/* Body */}
      <AppText style={styles.body}>{post.body}</AppText>

      {/* Image */}
      {post.imageUri ? (
        <Image
          source={{ uri: post.imageUri }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Pressable onPress={onLike} style={styles.actionItem} hitSlop={6}>
          <Ionicons
            name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
            size={16}
            color={isLiked ? Theme.colors.primary : Theme.colors.textMuted}
          />
          <AppText
            style={[
              styles.actionText,
              isLiked && { color: Theme.colors.primary },
            ]}
          >
            {displayLikes} Likes
          </AppText>
        </Pressable>

        <Pressable onPress={onComment} style={styles.actionItem} hitSlop={6}>
          <Ionicons
            name="chatbox-ellipses-outline"
            size={16}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.actionText}>
            {post.commentCount} Comments
          </AppText>
        </Pressable>

        <Pressable onPress={onShare} style={styles.actionItem} hitSlop={6}>
          <Ionicons
            name="share-social-outline"
            size={16}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.actionText}>{post.shares} Shares</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    gap: 10,
  },

  authorRow: { flexDirection: "row", gap: 10 },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#EEF2F6",
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  authorInfo: { flex: 1, gap: 2 },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorName: {
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
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },

  body: { fontSize: 14, lineHeight: 22, color: Theme.colors.text },

  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    backgroundColor: "#EEF2F6",
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingTop: 2,
  },
  actionItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, lineHeight: 16, color: Theme.colors.textMuted },
});