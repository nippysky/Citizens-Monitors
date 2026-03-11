import { StyleSheet, Switch, View } from "react-native";

import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { CitizenType, JoinReason, MonitoringExperience, StepThreeForm, VoterStatus, YesNo } from "@/types/onboarding";

type Props = {
  citizenType: CitizenType;
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

const VOTER_OPTIONS: VoterStatus[] = ["Yes", "No", "In Progress"];
const YES_NO_OPTIONS: YesNo[] = ["Yes", "No"];
const EXPERIENCE_OPTIONS: MonitoringExperience[] = [
  "First time",
  "1-5 year",
  "10 yr above",
];

export default function OnboardingStepThree({
  citizenType,
  value,
  onChange,
}: Props) {
  const isPublicViewer = citizenType === "public-viewer";

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
          Help us understand your background to better assign your monitoring roles.
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
          <AppText style={styles.label}>Is This Your First Election?</AppText>
          <View style={styles.choiceRow}>
            {YES_NO_OPTIONS.map((option) => (
              <ChoiceChip
                key={option}
                label={option}
                active={value.firstElection === option}
                onPress={() => onChange({ ...value, firstElection: option })}
              />
            ))}
          </View>
        </View>

        {!isPublicViewer ? (
          <View style={styles.fieldBlock}>
            <AppText style={styles.label}>Election Monitoring Experience</AppText>
            <View style={styles.choiceRow}>
              {EXPERIENCE_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  active={value.monitoringExperience === option}
                  onPress={() =>
                    onChange({ ...value, monitoringExperience: option })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        {!isPublicViewer ? (
          <View style={styles.partyCard}>
            <View style={styles.partyRow}>
              <View style={styles.partyTextWrap}>
                <AppText style={styles.label}>Party Affiliation</AppText>
                <AppText style={styles.helperText}>
                  Do you belong to a political party?
                </AppText>
              </View>

              <Switch
                value={value.partyAffiliation}
                onValueChange={(enabled: boolean) =>
                  onChange({
                    ...value,
                    partyAffiliation: enabled,
                    partyName: enabled ? value.partyName : "",
                  })
                }
                trackColor={{
                  false: "#DADFE7",
                  true: "#8EDFD8",
                }}
                thumbColor={value.partyAffiliation ? Theme.colors.primary : "#FFFFFF"}
              />
            </View>

            {value.partyAffiliation ? (
              <View style={styles.partyInputWrap}>
                <AppInput
                  label="Party Name (Optional)"
                  placeholder="e.g. APC, PDP"
                  value={value.partyName}
                  onChangeText={(text: string) =>
                    onChange({ ...value, partyName: text })
                  }
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {!isPublicViewer ? (
          <View style={styles.fieldBlock}>
            <AppText style={styles.label}>
              If required, are you willing to testify in court as an election witness?
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
        ) : null}

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

  helperText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
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

  partyCard: {
    borderWidth: 1,
    borderColor: "#D8DDE6",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.4)",
    padding: 12,
    gap: 14,
  },

  partyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  partyTextWrap: {
    flex: 1,
    gap: 2,
  },

  partyInputWrap: {
    marginTop: 2,
  },
});