import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Share, StyleSheet, View } from "react-native";
import { useRef, useState } from "react";

import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import CommentsBottomSheet, {
  DiscussionComment,
} from "@/components/collation/CommentsBottomSheet";
import ShareOpinionBottomSheet from "@/components/collation/ShareOpinionBottomSheet";
import { useAppToast } from "@/hooks/useAppToast";
import { CollationItem } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/NoElection";

type Props = {
  collation: CollationItem;
};

const initialComments: DiscussionComment[] = [
  {
    id: "comment-1",
    author: "@IronEagle23",
    body: "Here is the latest verified election result from Alimosho Ward 4. The process was peaceful and orderly throughout the morning.",
    minutesAgo: 2,
    likes: 14,
    shares: 3,
  },
  {
    id: "comment-2",
    author: "@SilverKing65",
    body: "The process was calm in my area too, and officials arrived early enough.",
    minutesAgo: 2,
    likes: 11,
    shares: 2,
  },
  {
    id: "comment-3",
    author: "@Fishtank89",
    body: "Crowd control improved later in the morning and things became easier.",
    minutesAgo: 2,
    likes: 9,
    shares: 1,
  },
];

export default function CollationDiscussionsTab({ collation }: Props) {
  const { showToast } = useAppToast();
  const commentsRef = useRef<BottomSheetModal>(null);
  const shareOpinionRef = useRef<BottomSheetModal>(null);

  const [comments, setComments] = useState<DiscussionComment[]>(initialComments);

  const handleShare = async (body: string) => {
    try {
      await Share.share({
        message: `${collation.fullTitle}\n\n${body}`,
      });
    } catch {
      showToast({
        type: "error",
        message: "Unable to share this discussion right now.",
      });
    }
  };

  return (
    <>
      <ScrollView style={styles.pageContent}>
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Community Verification</AppText>
          <AppText style={styles.sectionSubtitle}>
            Discuss this election with observer and volunteer at your Polling
            Units in Ikotun Primary School, PU LA/12/35.
          </AppText>
        </View>

        {!collation.canJoinDiscussion ? (
          <View style={styles.emptyWrap}>
            <NoElection width={110} height={110} />
            <AppText style={styles.emptyTitle}>No Discussion yet</AppText>
            <AppText style={styles.emptySubtitle}>
              You can be the first to drop your opinion
            </AppText>
          </View>
        ) : (
          <>
            {collation.discussions.map((item) => (
              <View key={item.id} style={styles.card}>
                <AppText style={styles.author}>{item.author}</AppText>
                <AppText style={styles.body}>{item.body}</AppText>
                <AppText style={styles.timeText}>{item.minutesAgo} min ago</AppText>

                <View style={styles.footerRow}>
                  <View style={styles.metaRow}>
                    <MetaItem icon="thumbs-up-outline" value={`${item.likes} Likes`} />
                    <MetaButton
                      icon="chatbox-ellipses-outline"
                      value={`${item.commentCount} Comments`}
                      onPress={() => commentsRef.current?.present()}
                    />
                    <MetaButton
                      icon="share-social-outline"
                      value={`${item.shares} Shares`}
                      onPress={() => handleShare(item.body)}
                    />
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.inputWrap}>
              <AppInput
                placeholder="How Do You Feel About This Election Today?"
                editable={false}
                onPressIn={() => shareOpinionRef.current?.present()}
              />
            </View>
          </>
        )}
      </ScrollView>

      <CommentsBottomSheet
        ref={commentsRef}
        comments={comments}
        onSubmitComment={(text) => {
          const next: DiscussionComment = {
            id: String(Date.now()),
            author: "@You",
            body: text,
            minutesAgo: 0,
            likes: 0,
            shares: 0,
          };

          setComments((prev) => [next, ...prev]);
          showToast({
            type: "success",
            message: "Comment submitted successfully.",
          });
        }}
      />

      <ShareOpinionBottomSheet
        ref={shareOpinionRef}
        onSubmitted={() =>
          showToast({
            type: "success",
            message: "Discussion post created successfully.",
          })
        }
      />
    </>
  );
}

function MetaItem({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={Theme.colors.textMuted} />
      <AppText style={styles.metaText}>{value}</AppText>
    </View>
  );
}

function MetaButton({
  icon,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={Theme.colors.textMuted} onPress={onPress} />
      <AppText style={styles.metaText} onPress={onPress}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },

  section: {
    gap: 8,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
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
    borderBottomColor: Theme.colors.borderSoft,
    paddingBottom: 14,
    gap: 8,
  },

  author: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  body: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.text,
  },

  timeText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  inputWrap: {
    paddingTop: 8,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    gap: 10,
  },

  emptyTitle: {
    fontSize: 22,
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