import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
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
  onSubmitComment?: (text: string) => void;
};

const CommentsBottomSheet = forwardRef<BottomSheetModal, Props>(
  function CommentsBottomSheet({ comments, onSubmitComment }, ref) {
    const [text, setText] = useState("");

    const handleSubmit = () => {
      const value = text.trim();
      if (!value) return;

      onSubmitComment?.(value);
      setText("");

      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <AppBottomSheet ref={ref} title="Comments" snapPoints={["86%"]}>
        <View style={styles.content}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <AppText style={styles.author}>{comment.author}</AppText>
              <AppText style={styles.body}>{comment.body}</AppText>
              <AppText style={styles.timeText}>{comment.minutesAgo} min ago</AppText>

              <View style={styles.metaRow}>
                <Meta icon="thumbs-up-outline" value={`${comment.likes} Likes`} />
                <Meta icon="share-social-outline" value={`${comment.shares} Shares`} />
              </View>
            </View>
          ))}

          <View style={styles.inputSection}>
            <AppInput
              placeholder="Leave Comment"
              value={text}
              onChangeText={setText}
              multiline
              inputWrapperStyle={styles.commentInputWrap}
              style={styles.commentInput}
            />
            <AppButton
              title="Submit Comment"
              onPress={handleSubmit}
              disabled={!text.trim()}
              style={styles.submitButton}
            />
          </View>
        </View>
      </AppBottomSheet>
    );
  }
);

export default CommentsBottomSheet;

function Meta({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={Theme.colors.textMuted} />
      <AppText style={styles.metaText}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },

  commentCard: {
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
    lineHeight: 21,
    color: Theme.colors.text,
  },

  timeText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metaText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  inputSection: {
    gap: 12,
    paddingTop: 8,
  },

  commentInputWrap: {
    minHeight: 96,
    alignItems: "flex-start",
    paddingTop: 14,
  },

  commentInput: {
    minHeight: 64,
    textAlignVertical: "top",
  },

  submitButton: {
    marginVertical: 0,
  },
});