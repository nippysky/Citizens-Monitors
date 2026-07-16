import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import CollationDiscussionsTab from "@/components/collation/CollationDiscussionTab";
import CollationOverviewTab from "@/components/collation/CollationOverviewTab";
import CollationReviewReportsTab from "@/components/collation/CollationReviewReportsTab";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import {
  buildCollationItem,
  type CollationElectionSource,
  type CollationItem,
} from "@/data/collation";
import { useElectionCollationQuery } from "@/hooks/api/useCollationQueries";
import { useActiveElectionsQuery } from "@/hooks/api/useElectionQueries";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import NoElection from "@/svgs/app/NoElection";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import { Theme } from "@/theme";

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

type RuntimeElectionLike = Partial<CollationItem> & {
  title?: string;
  name?: string;
  electionName?: string;
  electionType?: string;
};

type RouteParams = {
  id?: string;
  tab?: string;
  viewer?: string;
  scope?: string;
};

const TAB_VALUES: ElectionDetailsTabKey[] = [
  "overview",
  "review-collation",
  "discussions",
];

export default function ElectionDetailsScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const routeElectionId = normalizeRouteParam(params.id);

  const [activeTab, setActiveTab] =
    useState<ElectionDetailsTabKey>("overview");

  const collationQuery = useElectionCollationQuery(routeElectionId);
  const electionsQuery = useActiveElectionsQuery("all");

  const electionSource = useMemo(() => {
    if (!routeElectionId) return undefined;

    const election = electionsQuery.data?.elections.find(
      (item) => item.id === routeElectionId
    );

    return election ? normalizeElectionSource(election) : undefined;
  }, [electionsQuery.data, routeElectionId]);

  const apiElection = useMemo<CollationItem | null>(() => {
    if (!collationQuery.data) return null;

    const item = buildCollationItem(collationQuery.data, electionSource);

    return {
      ...item,
      status: "ended",
      fullTitle: getElectionDisplayTitle(item),
      electionTitle: getElectionShortTitle(item),
      parties: item.parties ?? [],
      reviewReports: item.reviewReports ?? [],
      discussions: item.discussions ?? [],
      geoBreakdown: item.geoBreakdown ?? [],
    };
  }, [collationQuery.data, electionSource]);

  const scenario = useMemo(() => {
    if (!apiElection) return null;

    return resolveElectionDetailsScenario({
      election: apiElection,
      viewer: normalizeRouteParam(params.viewer),
      scope: normalizeRouteParam(params.scope),
    });
  }, [apiElection, params.scope, params.viewer]);

  useEffect(() => {
    const incoming = normalizeRouteParam(
      params.tab
    ) as ElectionDetailsTabKey | undefined;

    if (incoming && TAB_VALUES.includes(incoming)) {
      setActiveTab(incoming);
      return;
    }

    setActiveTab("overview");
  }, [params.tab, params.id, params.viewer, params.scope]);

  const heroDateLabel = useMemo(() => {
    if (!scenario) return "Election Day";

    return getHeroDateLabel(scenario.election);
  }, [scenario]);

  const partyCount = useMemo(() => {
    if (!scenario) return 0;

    return scenario.election.parties.filter(
      (party) => party.shortName.toLowerCase() !== "others"
    ).length;
  }, [scenario]);

  if (!routeElectionId) {
    return (
      <ElectionDetailsShell>
        <EmptyState
          title="Election not found"
          message="This election is no longer available or the link is invalid."
          onRetry={() => router.back()}
          actionLabel="Go Back"
        />
      </ElectionDetailsShell>
    );
  }

  if (collationQuery.isLoading && !scenario) {
    return <ElectionDetailsSkeleton />;
  }

  if (collationQuery.isError || !scenario) {
    return (
      <ElectionDetailsShell
        refreshing={collationQuery.isRefetching}
        onRefresh={() => {
          void collationQuery.refetch();
        }}
      >
        <EmptyState
          title="Could not load election report"
          message="Check your connection and try again."
          onRetry={() => {
            void collationQuery.refetch();
          }}
          actionLabel="Retry"
        />
      </ElectionDetailsShell>
    );
  }

  const heroTitle = getElectionDisplayTitle(scenario.election);

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

                <AppText style={styles.heroTitle}>{heroTitle}</AppText>
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
            <CollationOverviewTab
              collation={scenario.election}
              refreshing={collationQuery.isRefetching}
              onRefresh={() => {
                void collationQuery.refetch();
              }}
            />
          ) : activeTab === "overview" ? (
            <CollationOverviewTab
              collation={scenario.election}
              refreshing={collationQuery.isRefetching}
              onRefresh={() => {
                void collationQuery.refetch();
              }}
            />
          ) : activeTab === "review-collation" ? (
            <CollationReviewReportsTab
              collation={scenario.election}
              refreshing={collationQuery.isRefetching}
              onRefresh={() => {
                void collationQuery.refetch();
              }}
            />
          ) : (
            <CollationDiscussionsTab
              collation={scenario.election}
              refreshing={collationQuery.isRefetching}
              onRefresh={() => {
                void collationQuery.refetch();
              }}
            />
          )}
        </View>
      </View>
    </AppGradientScreen>
  );
}

function ElectionDetailsSkeleton() {
  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.topNavRow}>
            <View style={styles.skeletonBackButton} />
            <View style={styles.skeletonTopTitle} />
            <View style={styles.topNavSpacer} />
          </View>

          <View style={styles.heroBlock}>
            <View style={styles.heroRow}>
              <View style={styles.heroIconCol}>
                <View style={styles.skeletonHeroIcon} />
              </View>

              <View style={styles.heroTextCol}>
                <View style={styles.skeletonTypeLabel} />
                <View style={styles.skeletonHeroTitle} />
                <View style={styles.skeletonHeroTitleShort} />
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.skeletonMetaPill} />
              <View style={styles.skeletonMetaPill} />
              <View style={styles.skeletonMetaPill} />
            </View>
          </View>

          <View style={styles.skeletonTabsRow}>
            <View style={styles.skeletonTab} />
            <View style={styles.skeletonTab} />
            <View style={styles.skeletonTab} />
          </View>
        </View>

        <View style={styles.body}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.skeletonBodyContent}
          >
            <View style={styles.skeletonSyncRow}>
              <View style={styles.skeletonLineMedium} />
              <View style={styles.skeletonButton} />
            </View>

            <View style={styles.skeletonLargeTitle} />
            <View style={styles.skeletonLineLong} />
            <View style={styles.skeletonLineMedium} />

            <View style={styles.skeletonStatsRow}>
              <View style={styles.skeletonStatCard} />
              <View style={styles.skeletonStatCard} />
              <View style={styles.skeletonStatCard} />
            </View>

            <View style={styles.skeletonSectionHeader} />
            <View style={styles.skeletonProgressBar} />
            <View style={styles.skeletonLineLong} />

            <View style={styles.skeletonReportCard} />
            <View style={styles.skeletonReportCard} />
          </ScrollView>
        </View>
      </View>
    </AppGradientScreen>
  );
}

function ElectionDetailsShell({
  children,
  refreshing = false,
  onRefresh,
}: {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.topNavRow}>
            <BackButton label="" />
            <AppText style={styles.topNavTitle}>Elections</AppText>
            <View style={styles.topNavSpacer} />
          </View>
        </View>

        <View style={styles.body}>
          {onRefresh ? (
            <ScrollView
              contentContainerStyle={styles.fallbackScrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={Theme.colors.primary}
                  colors={[Theme.colors.primary]}
                />
              }
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </View>
      </View>
    </AppGradientScreen>
  );
}

function EmptyState({
  title,
  message,
  actionLabel,
  onRetry,
}: {
  title: string;
  message: string;
  actionLabel: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.emptyWrap}>
      <NoElection width={110} height={110} />
      <AppText style={styles.emptyTitle}>{title}</AppText>
      <AppText style={styles.emptyText}>{message}</AppText>

      <Pressable onPress={onRetry} style={styles.emptyButton}>
        <AppText style={styles.emptyButtonText}>{actionLabel}</AppText>
      </Pressable>
    </View>
  );
}

function resolveElectionDetailsScenario(input: {
  election: CollationItem;
  viewer?: string;
  scope?: string;
}): ResolvedScenario {
  const viewerMode = normalizeViewerMode(input.viewer);
  const accessScope = normalizeAccessScope(input.scope);

  const normalizedElection: CollationItem = {
    ...input.election,
    fullTitle: getElectionDisplayTitle(input.election),
    electionTitle: getElectionShortTitle(input.election),
    status: "ended",
    parties: input.election.parties ?? [],
    reviewReports: input.election.reviewReports ?? [],
    discussions: input.election.discussions ?? [],
    geoBreakdown: input.election.geoBreakdown ?? [],
  };

  const showScopedTabs =
    viewerMode !== "public" && accessScope === "assigned";

  const titleForInference = [
    normalizedElection.fullTitle,
    normalizedElection.electionTitle,
    (input.election as RuntimeElectionLike).title,
    (input.election as RuntimeElectionLike).name,
    (input.election as RuntimeElectionLike).electionName,
    (input.election as RuntimeElectionLike).electionType,
  ]
    .filter(Boolean)
    .join(" ");

  const electionType = inferElectionType(titleForInference);
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

function normalizeRouteParam(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];

  return value;
}

function normalizeElectionSource(
  value: unknown
): CollationElectionSource | undefined {
  if (!value || typeof value !== "object") return undefined;

  const item = value as Partial<CollationElectionSource>;

  if (!item.id || !item.electionName || !item.startDate || !item.endDate) {
    return undefined;
  }

  return {
    id: String(item.id),
    electionName: String(item.electionName),
    electionType: String(item.electionType ?? "election"),
    electionLocation:
      typeof item.electionLocation === "string" ? item.electionLocation : null,
    startDate: String(item.startDate),
    endDate: String(item.endDate),
    mockElection: Boolean(item.mockElection),
    partiesCount: typeof item.partiesCount === "number" ? item.partiesCount : 0,
    status: String(item.status ?? "concluded"),
  };
}

function getElectionDisplayTitle(election?: RuntimeElectionLike): string {
  const title =
    election?.fullTitle?.trim() ||
    election?.electionTitle?.trim() ||
    election?.electionName?.trim() ||
    election?.title?.trim() ||
    election?.name?.trim();

  return title || "Election";
}

function getElectionShortTitle(election?: RuntimeElectionLike): string {
  const title =
    election?.electionTitle?.trim() ||
    election?.electionName?.trim() ||
    election?.fullTitle?.trim() ||
    election?.title?.trim() ||
    election?.name?.trim();

  return title || "Election";
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

function inferElectionType(title?: string | null): ElectionTypeKey {
  const value = String(title ?? "").trim().toLowerCase();

  if (!value) return "generic";

  if (value.includes("presidential") || value.includes("national")) {
    return "presidential";
  }

  if (value.includes("governorship") || value.includes("gubernatorial")) {
    return "gubernatorial";
  }

  if (
    value.includes("local government") ||
    value.includes("lga") ||
    value.includes("local-government")
  ) {
    return "local-government";
  }

  if (
    value.includes("house of reps") ||
    value.includes("house of representatives") ||
    value.includes("house-of-representatives") ||
    value.includes("house-of-assembly") ||
    value.includes("state house")
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
    return election.lastSyncLabel?.split("·")[0]?.trim() || "Election Day";
  }

  const parts = source.split("–").map((part) => part.trim());

  if (parts.length >= 2) {
    // Strip ordinals and trailing dot from the left side, then also remove any
    // trailing 4-digit year so we don't duplicate it when we append below.
    const leftClean = parts[0]
      .replace(/\.$/, "")
      .replace(/th|st|nd|rd/gi, "")
      .replace(/,?\s*\d{4}\s*$/, "")
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

function ElectionTypeVisual({ type }: { type: ElectionTypeKey }) {
  let IconComponent = PresidentialElection;

  switch (type) {
    case "senate":
      IconComponent = SenatorElection;
      break;
    case "house-of-reps":
      IconComponent = HouseOfRepsElection;
      break;
    case "presidential":
    case "gubernatorial":
    case "local-government":
    case "generic":
    default:
      IconComponent = PresidentialElection;
      break;
  }

  return (
    <View style={styles.electionIconWrap}>
      <IconComponent width={46} height={46} />
    </View>
  );
}

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

const skeletonColor = "rgba(17, 26, 50, 0.08)";
const skeletonColorStrong = "rgba(17, 26, 50, 0.12)";

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

  fallbackScrollContent: {
    flexGrow: 1,
  },

  emptyWrap: {
    flex: 1,
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    gap: 10,
  },

  emptyTitle: {
    fontSize: 20,
    lineHeight: 25,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
  },

  emptyButton: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },

  skeletonBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: skeletonColor,
  },

  skeletonTopTitle: {
    width: 72,
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonHeroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: skeletonColor,
  },

  skeletonTypeLabel: {
    width: 150,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(25,183,176,0.16)",
  },

  skeletonHeroTitle: {
    width: "82%",
    height: 28,
    borderRadius: 999,
    backgroundColor: skeletonColorStrong,
  },

  skeletonHeroTitleShort: {
    width: "58%",
    height: 28,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonMetaPill: {
    flex: 1,
    height: 18,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonTabsRow: {
    height: 38,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },

  skeletonTab: {
    flex: 1,
    height: 18,
    marginBottom: 10,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonBodyContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 16,
  },

  skeletonSyncRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  skeletonLineMedium: {
    width: "42%",
    height: 16,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonButton: {
    width: 126,
    height: 42,
    borderRadius: 999,
    backgroundColor: "rgba(25,183,176,0.12)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.18)",
  },

  skeletonLargeTitle: {
    width: "68%",
    height: 32,
    borderRadius: 999,
    backgroundColor: skeletonColorStrong,
  },

  skeletonLineLong: {
    width: "86%",
    height: 16,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  skeletonStatCard: {
    flex: 1,
    height: 92,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  skeletonSectionHeader: {
    width: "54%",
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(25,183,176,0.14)",
    marginTop: 4,
  },

  skeletonProgressBar: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonReportCard: {
    width: "100%",
    height: 142,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});