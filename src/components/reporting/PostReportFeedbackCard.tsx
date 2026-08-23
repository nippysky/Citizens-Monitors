import Slider from "@react-native-community/slider";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Rating = "good" | "manageable" | "poor" | "";
type BinaryAnswer = "yes" | "no" | "";

type Props = {
  rating: Rating;
  intimidationToday: BinaryAnswer;
  voteBuyingToday: BinaryAnswer;
  onChangeRating: (rating: Rating) => void;
  onChangeIntimidationToday: (value: BinaryAnswer) => void;
  onChangeVoteBuyingToday: (value: BinaryAnswer) => void;
};

type RatingOption = {
  key: Exclude<Rating, "">;
  label: string;
  emoji: string;
  sliderValue: number;
};

const RATING_OPTIONS: RatingOption[] = [
  {
    key: "good",
    label: "Good",
    emoji: "😍",
    sliderValue: 0,
  },
  {
    key: "manageable",
    label: "Manageable",
    emoji: "😎",
    sliderValue: 1,
  },
  {
    key: "poor",
    label: "Poor",
    emoji: "😡",
    sliderValue: 2,
  },
];

function getSliderValueFromRating(rating: Rating): number {
  if (rating === "manageable") return 1;
  if (rating === "poor") return 2;
  return 0;
}

function getRatingFromSliderValue(value: number): Exclude<Rating, ""> {
  if (value >= 1.5) return "poor";
  if (value >= 0.5) return "manageable";
  return "good";
}

function AnswerPill({
  label,
  active,
  onPress,
}: {
  label: "Yes" | "No";
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.answerPill, active && styles.answerPillActive]}
    >
      <AppText
        style={[
          styles.answerPillText,
          active && styles.answerPillTextActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export default function PostReportFeedbackCard({
  rating,
  intimidationToday,
  voteBuyingToday,
  onChangeRating,
  onChangeIntimidationToday,
  onChangeVoteBuyingToday,
}: Props) {
  const sliderValue = getSliderValueFromRating(rating);

  return (
    <View style={styles.card}>
      <AppText style={styles.questionTitle}>
        How would you rate today’s election in your polling unit?
      </AppText>

      <View style={styles.sliderWrap}>
        <Slider
          value={sliderValue}
          minimumValue={0}
          maximumValue={2}
          step={1}
          minimumTrackTintColor={Theme.colors.primary}
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor={Theme.colors.primary}
          style={styles.slider}
          onValueChange={(value) => {
            onChangeRating(getRatingFromSliderValue(value));
          }}
        />
      </View>

      <View style={styles.ratingRow}>
        {RATING_OPTIONS.map((option) => {
          const active = rating === option.key;

          return (
            <Pressable
              key={option.key}
              onPress={() => onChangeRating(option.key)}
              style={styles.ratingOption}
            >
              <AppText style={styles.ratingEmoji}>{option.emoji}</AppText>
              <AppText
                style={[
                  styles.ratingLabel,
                  active && styles.ratingLabelActive,
                ]}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.block}>
        <AppText style={styles.binaryQuestion}>
          Is there any instances of voter intimidation today?
        </AppText>

        <View style={styles.answerRow}>
          <AnswerPill
            label="Yes"
            active={intimidationToday === "yes"}
            onPress={() => onChangeIntimidationToday("yes")}
          />
          <AnswerPill
            label="No"
            active={intimidationToday === "no"}
            onPress={() => onChangeIntimidationToday("no")}
          />
        </View>
      </View>

      <View style={styles.block}>
        <AppText style={styles.binaryQuestion}>
          Is there any instances of voter buying today?
        </AppText>

        <View style={styles.answerRow}>
          <AnswerPill
            label="Yes"
            active={voteBuyingToday === "yes"}
            onPress={() => onChangeVoteBuyingToday("yes")}
          />
          <AnswerPill
            label="No"
            active={voteBuyingToday === "no"}
            onPress={() => onChangeVoteBuyingToday("no")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 18,
  },

  questionTitle: {
    fontSize: 23,
    lineHeight: 36,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  sliderWrap: {
    marginTop: -2,
  },

  slider: {
    width: "100%",
    height: 24,
    marginHorizontal: -6,
  },

  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginTop: -4,
  },

  ratingOption: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },

  ratingEmoji: {
    fontSize: 44,
    lineHeight: 48,
  },

  ratingLabel: {
    fontSize: 16,
    lineHeight: 22,
    color: "#5F6671",
    fontFamily: Theme.fonts.body.medium,
    textAlign: "center",
  },

  ratingLabelActive: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  block: {
    gap: 12,
  },

  binaryQuestion: {
    fontSize: 21,
    lineHeight: 34,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  answerRow: {
    flexDirection: "row",
    gap: 14,
  },

  answerPill: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "#D9DEE8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  answerPillActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "#F4FFFE",
  },

  answerPillText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#5F6671",
    fontFamily: Theme.fonts.body.semibold,
  },

  answerPillTextActive: {
    color: Theme.colors.primary,
  },
});