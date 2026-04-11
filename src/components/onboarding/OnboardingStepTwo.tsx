import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppText from "@/components/ui/AppText";
import Observer from "@/svgs/app/Observer";
import PublicViewer from "@/svgs/app/PublicViewer";
import Volunteer from "@/svgs/app/Volunteer";
import { Theme } from "@/theme";
import { CitizenType } from "@/types/onboarding";

type Props = {
  value: CitizenType;
  onChange: (value: CitizenType) => void;
};

type OptionConfig = {
  key: Exclude<CitizenType, "">;
  title: string;
  description: string;
  strengthTitle: string;
  bullets: string[];
  note: string;
  icon: React.ReactNode;
};

const OPTIONS: OptionConfig[] = [
  {
    key: "observer",
    title: "Become An Observer",
    description:
      "You will be the sole Citizen monitor official of your polling unit on election day. Your reports are the ground truth.",
    strengthTitle: "Be The Voice Of Your Polling Unit",
    bullets: [
      "Submit official PU field reports",
      "Report irregularities & incidents at PU",
      "Report live election day activities",
      "Access observer briefings & training",
    ],
    note:
      "Anyone can be an accredited observer but only one observer is accredited per polling unit.",
    icon: <Observer width={52} height={52} />,
  },
  {
    key: "volunteer",
    title: "Become A Volunteer",
    description:
      "A community member of a polling unit. You support your observer, engage with reports, and share your on-the-ground perspective.",
    strengthTitle: "Stand Up For Your Polling Unit",
    bullets: [
      "Upvote & flag observer reports",
      "Report irregularities & incidents at PU",
      "Give opinion on elections in your PU",
      "Access observer briefings on all elections.",
    ],
    note:
      "Anyone with a valid PVC and a polling unit in Nigeria can volunteer.",
    icon: <Volunteer width={52} height={52} />,
  },
  {
    key: "public-viewer",
    title: "Become A Public Viewer",
    description:
      "Follow all elections nationwide — results, news, and learning content — without the reporting responsibilities.",
    strengthTitle: "Stay Informed, Stay Empowered",
    bullets: [
      "View all elections & live results",
      "Can’t upvote & flag observer reports",
      "Can’t give opinion on any election",
      "Cannot submit reports or flag content",
    ],
    note: "Open to everyone — no PVC or polling unit needed.",
    icon: <PublicViewer width={52} height={52} />,
  },
];

function StepTwoOptionCard({
  option,
  selected,
  expanded,
  onSelect,
  onToggleExpand,
}: {
  option: OptionConfig;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) {
  return (
    <View style={styles.optionGroup}>
      <Pressable
        onPress={onSelect}
        style={[
          styles.card,
          selected && styles.cardSelected,
          expanded && styles.cardExpanded,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconCircle}>{option.icon}</View>

            <View style={styles.textBlock}>
              <AppText style={styles.cardTitle}>{option.title}</AppText>
              <AppText style={styles.cardDescription}>
                {option.description}
              </AppText>
            </View>
          </View>

          <View style={[styles.radio, selected && styles.radioSelected]}>
            {selected ? (
              <Ionicons name="checkmark" size={15} color="#FFFFFF" />
            ) : null}
          </View>
        </View>

        <Pressable onPress={onToggleExpand} hitSlop={8} style={styles.learnMoreWrap}>
          <AppText style={styles.learnMoreText}>Learn More</AppText>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={Theme.colors.primary}
          />
        </Pressable>

        {expanded ? (
          <View style={styles.expandedBlock}>
            <AppText style={styles.strengthTitle}>
              {option.strengthTitle}
            </AppText>

            <View style={styles.bulletsWrap}>
              {option.bullets.map((bullet) => (
                <View key={bullet} style={styles.bulletRow}>
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color={Theme.colors.primary}
                    style={styles.bulletIcon}
                  />
                  <AppText style={styles.bulletText}>{bullet}</AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </Pressable>

      {expanded ? (
        <View style={styles.noteCard}>
          <AppText style={styles.noteText}>{option.note}</AppText>
        </View>
      ) : null}
    </View>
  );
}

export default function OnboardingStepTwo({ value, onChange }: Props) {
  const [expandedKey, setExpandedKey] = useState<CitizenType>("");

  const selectedOption = useMemo(
    () => OPTIONS.find((option) => option.key === value),
    [value]
  );

  const handleSelect = (key: Exclude<CitizenType, "">) => {
    onChange(key);

    setExpandedKey((prev) => (prev === key ? prev : key));
  };

  const handleToggleExpand = (key: Exclude<CitizenType, "">) => {
    setExpandedKey((prev) => (prev === key ? "" : key));
  };

  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.headerBlock}>
          <AppText variant="title" style={styles.heading}>
            Citizen Type
          </AppText>
          <AppText style={styles.subheading}>
            Choose how you want to participate.
          </AppText>
        </View>

        <TutorialBanner />

        <View style={styles.optionsWrap}>
          {OPTIONS.map((option) => (
            <StepTwoOptionCard
              key={option.key}
              option={option}
              selected={value === option.key}
              expanded={expandedKey === option.key}
              onSelect={() => handleSelect(option.key)}
              onToggleExpand={() => handleToggleExpand(option.key)}
            />
          ))}
        </View>
      </View>

      {selectedOption ? null : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },

  scrollContent: {
    gap: 18,
    paddingBottom: 6,
  },

  headerBlock: {
    gap: 6,
    marginTop: 22,
  },

  heading: {
    fontSize: 18,
    lineHeight: 24,
  },

  subheading: {
    color: Theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },

  optionsWrap: {
    gap: 12,
  },

  optionGroup: {
    gap: 10,
  },

  card: {
    borderWidth: 1,
    borderColor: "#D8DDE6",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.52)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },

  cardSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(255,255,255,0.62)",
  },

  cardExpanded: {
    paddingBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  cardHeaderLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "linear-gradient(180deg, #FFF8E6 0%, #F4F8FF 100%)",
  },

  textBlock: {
    flex: 1,
    gap: 4,
  },

  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },

  cardDescription: {
    fontSize: 14,
    lineHeight: 23,
    color: Theme.colors.textMuted,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#D0D6DE",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  radioSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },

  learnMoreWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },

  learnMoreText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
    textDecorationLine: "underline",
  },

  expandedBlock: {
    gap: 12,
    paddingTop: 4,
  },

  strengthTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },

  bulletsWrap: {
    gap: 8,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  bulletIcon: {
    marginTop: 2,
  },

  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
  },

  noteCard: {
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
    backgroundColor: "#F6F1D9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  noteText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
  },
});