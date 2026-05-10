import { StyleSheet, View } from "react-native";

import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import {
  JoinReason,
  StepThreeForm,
  VoterStatus,
  YesNo,
} from "@/types/onboarding";

type Props = {
  value: StepThreeForm;
  onChange: (value: StepThreeForm) => void;
};

type ChoiceChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function ChoiceChip({ label, active, onPress }: ChoiceChipProps) {
  return (
    <AppText
      onPress={onPress}
      style={[styles.choiceChip, active && styles.choiceChipActive]}
    >
      {label}
    </AppText>
  );
}

const JOIN_REASON_OPTIONS: JoinReason[] = [
  "Civic duty",
  "Fight corruption",
  "Community service",
  "Support democracy",
  "Personal interest",
  "Academic research",
];

const VOTER_OPTIONS: VoterStatus[] = ["Yes", "No"];
const YES_NO_OPTIONS: YesNo[] = ["Yes", "No"];

export default function OnboardingStepTwoCoverage({
  value,
  onChange,
}: Props) {
  const toggleJoinReason = (reason: JoinReason) => {
    const exists = value.joinReasons.includes(reason);

    onChange({
      ...value,
      joinReasons: exists
        ? value.joinReasons.filter((item) => item !== reason)
        : [...value.joinReasons, reason],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <AppText variant="title" style={styles.heading}>
          Your Coverage
        </AppText>
        <AppText style={styles.subheading}>
          Help us understand your background to better assign your monitoring
          roles.
        </AppText>
      </View>

      <TutorialBanner />

      <View style={styles.form}>
        <View style={styles.fieldBlock}>
          <AppText style={styles.label}>Are You A Registered Voter?</AppText>
          <View style={styles.choiceRow}>
            {VOTER_OPTIONS.map((option) => (
              <ChoiceChip
                key={option}
                label={option}
                active={value.registeredVoter === option}
                onPress={() => onChange({ ...value, registeredVoter: option })}
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <AppText style={styles.label}>
            If required, are you willing to testify in court as an election
            witness?
          </AppText>
          <View style={styles.choiceRow}>
            {YES_NO_OPTIONS.map((option) => (
              <ChoiceChip
                key={option}
                label={option}
                active={value.willingToTestify === option}
                onPress={() =>
                  onChange({ ...value, willingToTestify: option })
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <AppText style={styles.label}>
            Interested in taking part in our online data surveys?
          </AppText>
          <View style={styles.choiceRow}>
            {YES_NO_OPTIONS.map((option) => (
              <ChoiceChip
                key={option}
                label={option}
                active={value.interestedInSurveys === option}
                onPress={() =>
                  onChange({ ...value, interestedInSurveys: option })
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <AppText style={styles.label}>
            Why Are You Joining Citizen Monitor?
          </AppText>
          <View style={styles.reasonWrap}>
            {JOIN_REASON_OPTIONS.map((reason) => (
              <ChoiceChip
                key={reason}
                label={reason}
                active={value.joinReasons.includes(reason)}
                onPress={() => toggleJoinReason(reason)}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
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

  form: {
    gap: 18,
    paddingBottom: 12,
  },

  fieldBlock: {
    gap: 10,
  },

  label: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
  },

  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  reasonWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  choiceChip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8DDE6",
    backgroundColor: "rgba(255,255,255,0.56)",
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    minWidth: 96,
    textAlign: "center",
    overflow: "hidden",
  },

  choiceChipActive: {
    borderColor: Theme.colors.primary,
    color: Theme.colors.primary,
    backgroundColor: "rgba(25, 183, 176, 0.08)",
    fontFamily: Theme.fonts.body.semibold,
  },
});