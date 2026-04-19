import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import CollationDiscussionsTab from "@/components/collation/CollationDiscussionTab";
import CollationOverviewTab from "@/components/collation/CollationOverviewTab";
import CollationReviewReportsTab from "@/components/collation/CollationReviewReportsTab";
import {
  CollationItem,
  collationDummyData,
} from "@/data/collation";
import { Theme } from "@/theme";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";

type ElectionDetailsTabKey = "overview" | "review-collation" | "discussions";
type ViewerMode = "observer" | "volunteer" | "public";
type AccessScope = "assigned" | "general";

type ElectionTypeKey =
  | "presidential"
  | "gubernatorial"
  | "local-government"
  | "house-of-reps"
  | "senate"
  | "generic";

type ResolvedScenario = {
  election: CollationItem;
  viewerMode: ViewerMode;
  accessScope: AccessScope;
  showScopedTabs: boolean;
  electionType: ElectionTypeKey;
  electionTypeLabel: string;
};

const TAB_VALUES: ElectionDetailsTabKey[] = [
  "overview",
  "review-collation",
  "discussions",
];

/**
 * DEV QA SWITCHER
 * ----------------------------------------------------------
 * enabled: false  -> production behavior (reads route params / API later)
 * enabled: true   -> forced local test mode for this screen only
 *
 * QUICK EXAMPLES:
 * - public viewer:
 *   viewerMode: "public", accessScope: "general"
 *
 * - observer assigned:
 *   viewerMode: "observer", accessScope: "assigned"
 *
 * - volunteer assigned:
 *   viewerMode: "volunteer", accessScope: "assigned"
 *
 * - observer not tied to polling unit:
 *   viewerMode: "observer", accessScope: "general"
 */
const DEV_ELECTION_DETAILS_OVERRIDE: {
  enabled: boolean;
  electionId?: string;
  viewerMode: ViewerMode;
  accessScope: AccessScope;
  defaultTab?: ElectionDetailsTabKey;
} = {
  enabled: false,
  electionId: "alimosho-lg-2026",
  viewerMode: "observer",
  accessScope: "general",
  defaultTab: "overview",
};

export default function ElectionDetailsScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    tab?: string;
    viewer?: string;
    scope?: string;
  }>();

  const [activeTab, setActiveTab] = useState<ElectionDetailsTabKey>("overview");

  const resolvedInput = useMemo(() => {
    if (DEV_ELECTION_DETAILS_OVERRIDE.enabled) {
      return {
        id: DEV_ELECTION_DETAILS_OVERRIDE.electionId ?? params.id,
        viewer: DEV_ELECTION_DETAILS_OVERRIDE.viewerMode,
        scope: DEV_ELECTION_DETAILS_OVERRIDE.accessScope,
      };
    }

    return {
      id: params.id,
      viewer: params.viewer,
      scope: params.scope,
    };
  }, [params.id, params.viewer, params.scope]);

  const scenario = useMemo(
    () => resolveElectionDetailsScenario(resolvedInput),
    [resolvedInput]
  );

  useEffect(() => {
    if (DEV_ELECTION_DETAILS_OVERRIDE.enabled) {
      setActiveTab(DEV_ELECTION_DETAILS_OVERRIDE.defaultTab ?? "overview");
      return;
    }

    const incoming = params.tab as ElectionDetailsTabKey | undefined;
    if (incoming && TAB_VALUES.includes(incoming)) {
      setActiveTab(incoming);
      return;
    }

    setActiveTab("overview");
  }, [params.tab, params.id, params.viewer, params.scope]);

  const heroDateLabel = useMemo(
    () => getHeroDateLabel(scenario.election),
    [scenario.election]
  );

  const partyCount = useMemo(() => {
    const withVotes = scenario.election.parties.filter(
      (party) => party.shortName.toLowerCase() !== "others"
    );
    return withVotes.length;
  }, [scenario.election.parties]);

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.topNavRow}>
            <BackButton label="" />
            <AppText style={styles.topNavTitle}>Elections</AppText>
            <View style={styles.topNavSpacer} />
          </View>

          <View style={styles.heroBlock}>
            <View style={styles.heroRow}>
              <View style={styles.heroIconCol}>
                <ElectionTypeVisual type={scenario.electionType} />
              </View>

              <View style={styles.heroTextCol}>
                <AppText style={styles.heroTypeLabel}>
                  {scenario.electionTypeLabel}
                </AppText>

                <AppText style={styles.heroTitle}>
                  {scenario.election.fullTitle}
                </AppText>
              </View>
            </View>

            <View style={styles.metaRow}>
              <MetaPill
                icon="calendar-outline"
                label={heroDateLabel}
                tone="default"
              />
              <MetaPill
                icon="people-outline"
                label={`${partyCount} Parties`}
                tone="default"
              />
              <MetaPill
                icon="checkmark-circle-outline"
                label="Concluded"
                tone="primary"
              />
            </View>
          </View>

          {scenario.showScopedTabs ? (
            <ElectionDetailTabs value={activeTab} onChange={setActiveTab} />
          ) : null}
        </View>

        <View style={styles.body}>
          {!scenario.showScopedTabs ? (
            <CollationOverviewTab collation={scenario.election} />
          ) : activeTab === "overview" ? (
            <CollationOverviewTab collation={scenario.election} />
          ) : activeTab === "review-collation" ? (
            <CollationReviewReportsTab collation={scenario.election} />
          ) : (
            <CollationDiscussionsTab collation={scenario.election} />
          )}
        </View>
      </View>
    </AppGradientScreen>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Scenario resolution                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function resolveElectionDetailsScenario(input: {
  id?: string;
  viewer?: string;
  scope?: string;
}): ResolvedScenario {
  const fallbackElection =
    collationDummyData.find((item) => item.id === "alimosho-lg-2026") ??
    collationDummyData[0];

  const requested =
    collationDummyData.find((item) => item.id === input.id) ?? fallbackElection;

  const viewerMode = normalizeViewerMode(input.viewer);
  const accessScope = normalizeAccessScope(input.scope);

  const normalizedElection: CollationItem = {
    ...requested,
    status: "ended",
  };

  const showScopedTabs =
    viewerMode !== "public" && accessScope === "assigned";

  const electionType = inferElectionType(normalizedElection.fullTitle);
  const electionTypeLabel = getElectionTypeDisplayLabel(electionType);

  return {
    election: normalizedElection,
    viewerMode,
    accessScope,
    showScopedTabs,
    electionType,
    electionTypeLabel,
  };
}

function normalizeViewerMode(value?: string): ViewerMode {
  if (value === "observer" || value === "volunteer" || value === "public") {
    return value;
  }
  return "observer";
}

function normalizeAccessScope(value?: string): AccessScope {
  if (value === "assigned" || value === "general") {
    return value;
  }
  return "assigned";
}

function inferElectionType(title: string): ElectionTypeKey {
  const value = title.toLowerCase();

  if (value.includes("presidential")) return "presidential";
  if (value.includes("governorship") || value.includes("gubernatorial")) {
    return "gubernatorial";
  }
  if (value.includes("local government")) return "local-government";
  if (
    value.includes("house of reps") ||
    value.includes("house of representatives")
  ) {
    return "house-of-reps";
  }
  if (value.includes("senate") || value.includes("senatorial")) {
    return "senate";
  }

  return "generic";
}

function getElectionTypeDisplayLabel(type: ElectionTypeKey): string {
  switch (type) {
    case "presidential":
      return "PRESIDENTIAL ELECTION";
    case "gubernatorial":
      return "GUBERNATORIAL ELECTION";
    case "local-government":
      return "LOCAL GOVERNMENT ELECTION";
    case "house-of-reps":
      return "HOUSE OF REPS ELECTION";
    case "senate":
      return "SENATE ELECTION";
    default:
      return "GENERAL ELECTION";
  }
}

function getHeroDateLabel(election: CollationItem): string {
  const source = election.dateRange?.trim();
  if (!source) {
    return election.lastSyncLabel.split("·")[0]?.trim() || "Election Day";
  }

  const parts = source.split("–").map((part) => part.trim());
  if (parts.length >= 2) {
    const leftClean = parts[0]
      .replace(/\.$/, "")
      .replace(/th|st|nd|rd/gi, "")
      .trim();

    const yearMatch = parts[1].match(/(\d{4})/);
    const year = yearMatch?.[1];

    if (year) {
      return `${leftClean}, ${year}`;
    }

    return leftClean;
  }

  return source;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Top hero icon provision                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function ElectionTypeVisual({ type }: { type: ElectionTypeKey }) {
  let IconComponent = PresidentialElection;

  switch (type) {
    case "presidential":
      IconComponent = PresidentialElection;
      break;
    case "gubernatorial":
      IconComponent = PresidentialElection;
      break;
    case "local-government":
      IconComponent = PresidentialElection;
      break;
    case "senate":
      IconComponent = SenatorElection;
      break;
    case "house-of-reps":
      IconComponent = HouseOfRepsElection;
      break;
    default:
      IconComponent = PresidentialElection;
  }

  return (
    <View style={styles.electionIconWrap}>
      <IconComponent width={46} height={46} />
    </View>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Local tabs                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function ElectionDetailTabs({
  value,
  onChange,
}: {
  value: ElectionDetailsTabKey;
  onChange: (next: ElectionDetailsTabKey) => void;
}) {
  return (
    <View style={styles.tabsRow}>
      <ElectionDetailTabButton
        label="OVERVIEW"
        active={value === "overview"}
        onPress={() => onChange("overview")}
      />
      <ElectionDetailTabButton
        label="REVIEW COLLATION"
        active={value === "review-collation"}
        onPress={() => onChange("review-collation")}
      />
      <ElectionDetailTabButton
        label="DISCUSSIONS"
        active={value === "discussions"}
        onPress={() => onChange("discussions")}
      />
    </View>
  );
}

function ElectionDetailTabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <AppText
        numberOfLines={1}
        ellipsizeMode="clip"
        style={[styles.tabLabel, active && styles.tabLabelActive]}
      >
        {label}
      </AppText>
      <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
    </Pressable>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Meta pills                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function MetaPill({
  icon,
  label,
  tone = "default",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: "default" | "primary";
}) {
  const color = tone === "primary" ? Theme.colors.primary : Theme.colors.text;

  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon} size={15} color={color} />
      <AppText
        numberOfLines={1}
        style={[
          styles.metaPillText,
          tone === "primary" && styles.metaPillTextPrimary,
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },

  topNavRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  topNavTitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  topNavSpacer: {
    width: 32,
  },

  heroBlock: {
    gap: 22,
  },

  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  heroIconCol: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  electionIconWrap: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  heroTextCol: {
    flex: 1,
    gap: 8,
    alignItems: "center",
  },

  heroTypeLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
    alignSelf: "center",
  },

  heroTitle: {
    fontSize: 27,
    lineHeight: 32,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
    paddingHorizontal: 8,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "nowrap",
  },

  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },

  metaPillText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
    flexShrink: 1,
  },

  metaPillTextPrimary: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  tabsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    marginTop: 2,
  },

  tabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
    paddingBottom: 0,
    gap: 12,
  },

  tabLabel: {
    fontSize: Platform.OS === "android" ? 11 : 12,
    lineHeight: Platform.OS === "android" ? 15 : 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
    width: "100%",
    includeFontPadding: false,
  },

  tabLabelActive: {
    color: Theme.colors.primary,
  },

  tabIndicator: {
    height: 4,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "transparent",
  },

  tabIndicatorActive: {
    backgroundColor: Theme.colors.primary,
  },

  body: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    marginTop: 12,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
});