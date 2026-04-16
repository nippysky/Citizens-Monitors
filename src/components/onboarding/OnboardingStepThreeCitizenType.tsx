import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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
  observerSlotTaken?: boolean;
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
      "Access observer briefings on all elections",
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
      "Cannot upvote & flag observer reports",
      "Cannot give opinion on any election",
      "Cannot submit reports or flag content",
    ],
    note: "Open to everyone — no PVC or polling unit needed.",
    icon: <PublicViewer width={52} height={52} />,
  },
];

function CitizenTypeCard({
  option,
  selected,
  expanded,
  disabled,
  onSelect,
  onToggleExpand,
}: {
  option: OptionConfig;
  selected: boolean;
  expanded: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) {
  return (
    <View style={styles.optionGroup}>
      <Pressable
        disabled={disabled}
        onPress={onSelect}
        style={[
          styles.card,
          selected && styles.cardSelected,
          expanded && styles.cardExpanded,
          disabled && styles.cardDisabled,
        ]}
      >
        {disabled ? (
          <View style={styles.slotTakenBadge}>
            <AppText style={styles.slotTakenText}>SLOT TAKEN</AppText>
          </View>
        ) : null}

        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconCircle}>{option.icon}</View>

            <View style={styles.textBlock}>
              <AppText style={[styles.cardTitle, disabled && styles.disabledText]}>
                {option.title}
              </AppText>
              <AppText
                style={[styles.cardDescription, disabled && styles.disabledTextSoft]}
              >
                {option.description}
              </AppText>
            </View>
          </View>

          <View
            style={[
              styles.radio,
              selected && styles.radioSelected,
              disabled && styles.radioDisabled,
            ]}
          >
            {selected ? (
              <Ionicons name="checkmark" size={15} color="#FFFFFF" />
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={onToggleExpand}
          hitSlop={8}
          style={styles.learnMoreWrap}
        >
          <AppText style={styles.learnMoreText}>Learn More</AppText>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={Theme.colors.primary}
          />
        </Pressable>

        {expanded ? (
          <View style={styles.expandedBlock}>
            <AppText style={[styles.strengthTitle, disabled && styles.disabledText]}>
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
                  <AppText
                    style={[styles.bulletText, disabled && styles.disabledTextSoft]}
                  >
                    {bullet}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </Pressable>

      {expanded ? (
        <View style={[styles.noteCard, disabled && styles.noteCardDisabled]}>
          <AppText style={[styles.noteText, disabled && styles.disabledTextSoft]}>
            {option.note}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

export default function OnboardingStepThreeCitizenType({
  value,
  onChange,
  observerSlotTaken = false,
}: Props) {
  const [expandedKey, setExpandedKey] = useState<CitizenType>("");

  const handleSelect = (key: Exclude<CitizenType, "">) => {
    if (key === "observer" && observerSlotTaken) return;
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
          {OPTIONS.map((option) => {
            const disabled = option.key === "observer" && observerSlotTaken;

            return (
              <CitizenTypeCard
                key={option.key}
                option={option}
                selected={value === option.key}
                expanded={expandedKey === option.key}
                disabled={disabled}
                onSelect={() => handleSelect(option.key)}
                onToggleExpand={() => handleToggleExpand(option.key)}
              />
            );
          })}
        </View>
      </View>
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
    gap: 8,
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
    position: "relative",
  },

  cardSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(255,255,255,0.66)",
  },

  cardExpanded: {
    paddingBottom: 12,
  },

  cardDisabled: {
    opacity: 0.54,
  },

  slotTakenBadge: {
    position: "absolute",
    top: -10,
    right: 12,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFF3CC",
    borderWidth: 1,
    borderColor: "#E8D597",
  },

  slotTakenText: {
    color: Theme.colors.primary,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Theme.fonts.body.semibold,
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
    backgroundColor: "#FFF7E8",
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

  radioDisabled: {
    borderColor: "#D8DDE6",
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

  noteCardDisabled: {
    opacity: 0.75,
  },

  noteText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
  },

  disabledText: {
    color: "#9CA3AF",
  },

  disabledTextSoft: {
    color: "#B0B8C4",
  },
});