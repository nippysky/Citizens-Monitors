import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import { Theme } from "@/theme";
import { ElectionCardItem, UserRole } from "@/types/home";

type Props = {
  item: ElectionCardItem;
  width: number;
  viewerRole: UserRole;
};

function canSubmitResult(role: UserRole): boolean {
  return role === "observer" || role === "volunteer";
}

function getElectionIcon(type: ElectionCardItem["electionType"]) {
  switch (type) {
    case "senatorial":
    case "senate":
      return SenatorElection;
    case "house-of-representatives":
    case "house-of-reps":
    case "house-of-assembly":
    case "gubernatorial":
      return HouseOfRepsElection;
    case "presidential":
    case "national":
    case "local-government":
    case "other":
    default:
      return PresidentialElection;
  }
}

function getRecordedText(item: ElectionCardItem): string {
  if (item.totalPollingUnits > 0) {
    return `${item.pollingUnitsRecorded}/${item.totalPollingUnits} Polling Units recorded`;
  }

  if (typeof item.partiesCount === "number" && item.partiesCount > 0) {
    return `${item.partiesCount} parties configured`;
  }

  return "Live collation in progress";
}

function getProgress(item: ElectionCardItem): number {
  if (!item.totalPollingUnits) return 0;

  return Math.min(
    1,
    Math.max(0, item.pollingUnitsRecorded / item.totalPollingUnits)
  );
}

function getSpecificLocation(value?: string): string {
  const clean = value?.trim();

  if (!clean) return "";
  if (clean.toLowerCase() === "nationwide") return "";

  return clean;
}

export default function LiveElectionCard({ item, width, viewerRole }: Props) {
  const ElectionIcon = getElectionIcon(item.electionType);
  const activeElectionId = item.activeElectionId ?? item.id;
  const submitEnabled = canSubmitResult(viewerRole);
  const progress = getProgress(item);

  const handleOpenCollation = () => {
    router.push({
      pathname: Paths.appCollation as never,
      params: {
        tab: "overview",
        collationId: activeElectionId,
        activeElectionId,
        electionId: activeElectionId,
      },
    });
  };

  const handleSubmitResult = () => {
    if (!submitEnabled) {
      handleOpenCollation();
      return;
    }

    const electionLocation = item.electionLocation?.trim() || item.location;
    const state = item.state?.trim() || getSpecificLocation(electionLocation);
    const votingStartTime = item.votingStartTime?.trim() || item.startDate || "";

    router.push({
      pathname: Paths.submitElectionReport as never,
      params: {
        electionId: activeElectionId,
        activeElectionId,
        electionTitle: item.title,
        electionType: item.electionType,
        electionLocation,
        electionStartDate: item.startDate ?? "",
        electionEndDate: item.endDate ?? "",
        votingStartTime,
        pollingUnitName: item.pollingUnitName ?? "",
        pollingUnitCode: item.pollingUnitCode ?? "",
        ward: item.ward ?? "",
        lga: item.lga ?? "",
        state,
      },
    });
  };

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.topRow}>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <AppText style={styles.liveText}>LIVE NOW</AppText>
        </View>

        <View style={styles.illustrationWrap}>
          <ElectionIcon width={54} height={54} />
        </View>
      </View>

      <AppText style={styles.title} numberOfLines={2}>
        {item.title}
      </AppText>

      <View style={styles.metaBlock}>
        <View style={styles.metaRow}>
          <Ionicons
            name="location-outline"
            size={17}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.metaText} numberOfLines={1}>
            {item.location}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name="podium-outline"
            size={16}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.metaText} numberOfLines={1}>
            {getRecordedText(item)}
          </AppText>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width:
                progress > 0
                  ? `${Math.max(8, Math.round(progress * 100))}%`
                  : "28%",
            },
          ]}
        />
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleOpenCollation}
          style={({ pressed }) => [
            styles.collationButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="list-outline" size={20} color="#FFFFFF" />
          <AppText style={styles.collationButtonText}>Collation</AppText>
          <Ionicons name="chevron-forward" size={17} color="#FFFFFF" />
        </Pressable>

        <Pressable
          onPress={handleSubmitResult}
          style={({ pressed }) => [
            styles.submitButton,
            !submitEnabled && styles.submitButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={submitEnabled ? "document-text-outline" : "eye-outline"}
            size={18}
            color={Theme.colors.text}
          />
          <AppText style={styles.submitButtonText}>
            {submitEnabled ? "Submit" : "View"}
          </AppText>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={Theme.colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: "#FFFBE8",
    borderWidth: 1,
    borderColor: "#DDE4EC",
    paddingHorizontal: 18,
    paddingVertical: 17,
    gap: 12,
    shadowColor: "#111A32",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  topRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingTop: 3,
  },

  liveDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: "#EF4444",
  },

  liveText: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.bold,
  },

  illustrationWrap: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -6,
  },

  title: {
    fontSize: 20,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    maxWidth: 260,
  },

  metaBlock: {
    gap: 7,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  metaText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#D8E0EA",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 3,
  },

  collationButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  collationButtonText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },

  submitButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.4,
    borderColor: Theme.colors.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  submitButtonDisabled: {
    borderColor: "rgba(17,26,50,0.25)",
    opacity: 0.8,
  },

  submitButtonText: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  pressed: {
    opacity: 0.78,
  },
});
