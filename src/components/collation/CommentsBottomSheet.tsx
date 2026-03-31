import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["86%"], []);
    const [text, setText] = useState("");

    const handleClose = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleSubmit = () => {
      const value = text.trim();
      if (!value) return;

      onSubmitComment?.(value);
      setText("");
      handleClose();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        topInset={insets.top + 12}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
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
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 18 },
          ]}
        >
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Comments</AppText>

            <Pressable onPress={handleClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.commentsWrap}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.authorRow}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={18}
                    color={Theme.colors.text}
                  />
                  <AppText style={styles.authorText}>{comment.author}</AppText>
                </View>

                <AppText style={styles.bodyText}>{comment.body}</AppText>

                <AppText style={styles.timeText}>
                  {comment.minutesAgo} min ago
                </AppText>

                <View style={styles.metaRow}>
                  <MetaItem
                    icon="thumbs-up-outline"
                    value={`${comment.likes} Likes`}
                  />
                  <MetaItem
                    icon="share-social-outline"
                    value={`${comment.shares} Shares`}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.composerWrap}>
            <View style={styles.composerInputRow}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={18}
                color={Theme.colors.text}
                style={styles.composerIcon}
              />

              <View style={styles.composerInputBox}>
                <AppInput
                  placeholder="Leave Comment"
                  value={text}
                  onChangeText={setText}
                  multiline
                  inputWrapperStyle={styles.commentInputWrap}
                  style={styles.commentInput}
                />
              </View>
            </View>

            <AppButton
              title="Submit Comment"
              onPress={handleSubmit}
              disabled={!text.trim()}
              style={styles.submitButton}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default CommentsBottomSheet;

function MetaItem({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={16} color={Theme.colors.textMuted} />
      <AppText style={styles.metaText}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
      backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  handle: {
    backgroundColor: "rgba(17, 26, 50, 0.12)",
    width: 44,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 0,
  },

  header: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#DFE4EB",
    marginHorizontal: -16,
  },

  commentsWrap: {
    paddingTop: 14,
  },

  commentCard: {
    paddingBottom: 18,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E8EE",
    gap: 10,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  authorText: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },

  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: Theme.colors.text,
  },

  timeText: {
    fontSize: 12,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 2,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },

  composerWrap: {
    gap: 12,
    paddingTop: 6,
  },

  composerInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  composerIcon: {
    marginTop: 14,
  },

  composerInputBox: {
    flex: 1,
  },

  commentInputWrap: {
    minHeight: 116,
    alignItems: "flex-start",
    paddingTop: 14,
  },

  commentInput: {
    minHeight: 82,
    textAlignVertical: "top",
  },

  submitButton: {
    marginVertical: 0,
  },
});