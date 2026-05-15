import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import {
  ElectionVaultResult,
  UpdateElectionResultPayload,
  getVaultElectionName,
} from "@/lib/api/electionVault.api";
import { Theme } from "@/theme";

type Props = {
  result: ElectionVaultResult | null;
  saving?: boolean;
  deleting?: boolean;
  onSave: (payload: UpdateElectionResultPayload) => void;
  onDelete: () => void;
};

type EditablePartyVote = {
  key: string;
  party: string;
  count: string;
};

const VOTE_RATINGS = [
  { label: "Good", value: "good" },
  { label: "Okay", value: "okay" },
  { label: "Poor", value: "poor" },
];

const YES_NO_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const DEFAULT_PARTIES = ["APC", "PDP", "LP", "NNPP"];

function numberToText(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "";
  }

  return String(value);
}

function parseNumber(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, "");
  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}

function cleanText(value?: string): string {
  return value?.trim() ?? "";
}

function createPartyVoteState(result: ElectionVaultResult): EditablePartyVote[] {
  const existing = result.partiesVotes ?? [];

  if (existing.length > 0) {
    return existing.map((item, index) => ({
      key: item._id || `${item.party || "party"}-${index}`,
      party: item.party || "",
      count: numberToText(item.count),
    }));
  }

  return DEFAULT_PARTIES.map((party) => ({
    key: party,
    party,
    count: "",
  }));
}

function ChoicePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.choicePill, active && styles.choicePillActive]}
    >
      <AppText
        style={[styles.choiceText, active && styles.choiceTextActive]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function EditElectionResultForm({
  result,
  saving = false,
  deleting = false,
  onSave,
  onDelete,
}: {
  result: ElectionVaultResult;
  saving?: boolean;
  deleting?: boolean;
  onSave: (payload: UpdateElectionResultPayload) => void;
  onDelete: () => void;
}) {
  const [parties, setParties] = useState<EditablePartyVote[]>(() =>
    createPartyVoteState(result)
  );
  const [voteRating, setVoteRating] = useState(cleanText(result.voteRating));
  const [voterIntimidation, setVoterIntimidation] = useState(
    cleanText(result.voterIntimidation) || "no"
  );
  const [voteBuying, setVoteBuying] = useState(
    cleanText(result.voteBuying) || "no"
  );
  const [timeBegan, setTimeBegan] = useState(cleanText(result.timeBegan));
  const [accreditedVoters, setAccreditedVoters] = useState(
    numberToText(result.accreditedVoters)
  );
  const [usedBallotPapers, setUsedBallotPapers] = useState(
    numberToText(result.usedBallotPapers)
  );
  const [rejectedPapers, setRejectedPapers] = useState(
    numberToText(result.rejectedPapers)
  );
  const [spoiledBallotPapers, setSpoiledBallotPapers] = useState(
    numberToText(result.spoiledBallotPapers)
  );

  const canSave = !saving && !deleting;

  const updateParty = (
    key: string,
    field: "party" | "count",
    value: string
  ) => {
    setParties((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              [field]: field === "count" ? value.replace(/[^0-9]/g, "") : value,
            }
          : item
      )
    );
  };

  const addParty = () => {
    setParties((prev) => [
      ...prev,
      {
        key: `custom-${Date.now()}`,
        party: "",
        count: "",
      },
    ]);
  };

  const removeParty = (key: string) => {
    setParties((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSave = () => {
    const cleanedParties = parties
      .map((item) => ({
        party: item.party.trim().toUpperCase(),
        count: parseNumber(item.count),
      }))
      .filter((item) => item.party.length > 0);

    onSave({
      partiesVotes: cleanedParties,
      voteRating: voteRating || "okay",
      voterIntimidation: voterIntimidation || "no",
      voteBuying: voteBuying || "no",
      timeBegan: timeBegan.trim(),
      accreditedVoters: parseNumber(accreditedVoters),
      rejectedPapers: parseNumber(rejectedPapers),
      spoiledBallotPapers: parseNumber(spoiledBallotPapers),
      usedBallotPapers: parseNumber(usedBallotPapers),
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete result?",
      "This will permanently delete this election result from your vault.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <>
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Ionicons
            name="create-outline"
            size={21}
            color={Theme.colors.primary}
          />
        </View>

        <View style={styles.heroText}>
          <AppText style={styles.heroTitle}>
            {getVaultElectionName(result.election)}
          </AppText>
          <AppText style={styles.heroSubtitle}>
            {result.pollingUnit || "Polling unit result"}
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Party Results</AppText>

        <View style={styles.partyList}>
          {parties.map((party, index) => (
            <View key={party.key} style={styles.partyRow}>
              <View style={styles.partyNameCol}>
                <AppInput
                  label={index === 0 ? "Party" : undefined}
                  value={party.party}
                  placeholder="Party"
                  autoCapitalize="characters"
                  onChangeText={(value) =>
                    updateParty(party.key, "party", value)
                  }
                />
              </View>

              <View style={styles.partyVoteCol}>
                <AppInput
                  label={index === 0 ? "Votes" : undefined}
                  value={party.count}
                  placeholder="0"
                  keyboardType="number-pad"
                  onChangeText={(value) =>
                    updateParty(party.key, "count", value)
                  }
                />
              </View>

              <Pressable
                onPress={() => removeParty(party.key)}
                disabled={parties.length <= 1}
                style={[
                  styles.removePartyBtn,
                  parties.length <= 1 && styles.removePartyBtnDisabled,
                ]}
              >
                <Ionicons name="close" size={17} color="#F04A1D" />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable onPress={addParty} style={styles.addPartyButton}>
          <Ionicons name="add" size={17} color={Theme.colors.primary} />
          <AppText style={styles.addPartyText}>Add Party</AppText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Report Details</AppText>

        <AppInput
          label="Time Voting Began"
          value={timeBegan}
          placeholder="08:42AM"
          onChangeText={setTimeBegan}
        />

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <AppInput
              label="Accredited Voters"
              value={accreditedVoters}
              placeholder="0"
              keyboardType="number-pad"
              onChangeText={(value) =>
                setAccreditedVoters(value.replace(/[^0-9]/g, ""))
              }
            />
          </View>

          <View style={styles.col}>
            <AppInput
              label="Used Ballots"
              value={usedBallotPapers}
              placeholder="0"
              keyboardType="number-pad"
              onChangeText={(value) =>
                setUsedBallotPapers(value.replace(/[^0-9]/g, ""))
              }
            />
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <AppInput
              label="Rejected Papers"
              value={rejectedPapers}
              placeholder="0"
              keyboardType="number-pad"
              onChangeText={(value) =>
                setRejectedPapers(value.replace(/[^0-9]/g, ""))
              }
            />
          </View>

          <View style={styles.col}>
            <AppInput
              label="Spoiled Papers"
              value={spoiledBallotPapers}
              placeholder="0"
              keyboardType="number-pad"
              onChangeText={(value) =>
                setSpoiledBallotPapers(value.replace(/[^0-9]/g, ""))
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Election Conditions</AppText>

        <View style={styles.choiceBlock}>
          <AppText style={styles.choiceLabel}>Vote Rating</AppText>
          <View style={styles.choiceRow}>
            {VOTE_RATINGS.map((item) => (
              <ChoicePill
                key={item.value}
                label={item.label}
                active={voteRating === item.value}
                onPress={() => setVoteRating(item.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.choiceBlock}>
          <AppText style={styles.choiceLabel}>Voter Intimidation</AppText>
          <View style={styles.choiceRow}>
            {YES_NO_OPTIONS.map((item) => (
              <ChoicePill
                key={item.value}
                label={item.label}
                active={voterIntimidation === item.value}
                onPress={() => setVoterIntimidation(item.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.choiceBlock}>
          <AppText style={styles.choiceLabel}>Vote Buying</AppText>
          <View style={styles.choiceRow}>
            {YES_NO_OPTIONS.map((item) => (
              <ChoicePill
                key={item.value}
                label={item.label}
                active={voteBuying === item.value}
                onPress={() => setVoteBuying(item.value)}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.noticeCard}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={Theme.colors.primary}
        />
        <AppText style={styles.noticeText}>
          Evidence files are preserved from your original upload. Media editing
          can be added once the backend confirms the multipart update contract.
        </AppText>
      </View>

      <View style={styles.actionStack}>
        <AppButton
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          disabled={!canSave}
          style={styles.saveButton}
        />

        <Pressable
          onPress={handleDelete}
          disabled={saving || deleting}
          style={[
            styles.deleteButton,
            (saving || deleting) && styles.deleteButtonDisabled,
          ]}
        >
          <Ionicons name="trash-outline" size={17} color="#F04A1D" />
          <AppText style={styles.deleteButtonText}>
            {deleting ? "Deleting..." : "Delete Result"}
          </AppText>
        </Pressable>
      </View>
    </>
  );
}

const EditElectionResultSheet = forwardRef<BottomSheetModal, Props>(
  function EditElectionResultSheet(
    { result, saving = false, deleting = false, onSave, onDelete },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["92%", "97%"], []);

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
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
            opacity={0.32}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.bg}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={styles.header}>
            <View>
              <AppText style={styles.headerTitle}>Edit Election Result</AppText>
              <AppText style={styles.headerSubtitle}>
                Update result figures and election condition checks.
              </AppText>
            </View>

            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          {result ? (
            <EditElectionResultForm
              key={result._id}
              result={result}
              saving={saving}
              deleting={deleting}
              onSave={onSave}
              onDelete={onDelete}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={34}
                color={Theme.colors.textMuted}
              />
              <AppText style={styles.emptyTitle}>No result selected</AppText>
              <AppText style={styles.emptyText}>
                Select a result from your vault to edit it.
              </AppText>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default EditElectionResultSheet;

const styles = StyleSheet.create({
  bg: {
    backgroundColor: "#FBF8EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: "rgba(17,26,50,0.12)",
    width: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    maxWidth: 270,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE4EB",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(5,163,156,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontSize: 17,
    lineHeight: 23,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
  section: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DFE4EB",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  partyList: {
    gap: 12,
  },
  partyRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  partyNameCol: {
    flex: 1,
  },
  partyVoteCol: {
    width: 110,
  },
  removePartyBtn: {
    width: 38,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(240,74,29,0.18)",
    backgroundColor: "rgba(240,74,29,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  removePartyBtnDisabled: {
    opacity: 0.35,
  },
  addPartyButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.18)",
    backgroundColor: "rgba(5,163,156,0.06)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  addPartyText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  choiceBlock: {
    gap: 9,
  },
  choiceLabel: {
    fontSize: 14,
    lineHeight: 19,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  choicePill: {
    minHeight: 40,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  choicePillActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(5,163,156,0.08)",
  },
  choiceText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  choiceTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  noticeCard: {
    borderRadius: 18,
    backgroundColor: "rgba(5,163,156,0.08)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.14)",
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 19,
    color: Theme.colors.text,
  },
  actionStack: {
    gap: 12,
  },
  saveButton: {
    marginVertical: 0,
  },
  deleteButton: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(240,74,29,0.20)",
    backgroundColor: "rgba(240,74,29,0.06)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.55,
  },
  deleteButtonText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#F04A1D",
    fontFamily: Theme.fonts.body.semibold,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 260,
  },
});