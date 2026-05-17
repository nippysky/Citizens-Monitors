import type {
  CollationIncidentPayload,
  CollationResultPayload,
  CollationSentimentPayload,
  ElectionCollationResponse,
} from "@/lib/api/collation.api";

export type PartyResult = {
  id: string;
  name: string;
  shortName: string;
  votes: number;
  percent: number;
  color: string;
  logoKey: string;
};

export type SentimentLegendItem = {
  label: string;
  value: number;
  count: number;
  color: string;
};

export type GeoBreakdownItem = {
  id: string;
  name: string;
  reports: number;
  incidents: number;
  coveredUnits: number;
  totalUnits: number;
  totalVotes: number;
  percentOfTotalVotes: number;
  parties: {
    shortName: string;
    percent: number;
    color: string;
  }[];
};

export type ReviewReportItem = {
  id: string;
  type: "result" | "incident";
  title: string;
  author: string;
  createdAgo: string;
  tag?: string;
  body: string;
  reviewCount: number;
  isConfirmed?: boolean;
  flagged?: boolean;
  evidence?: {
    note?: string;
    locationMeta?: string;
    pollingUnitName?: string;
    pollingUnitCode?: string;
    observerHandle?: string;
    submittedAt?: string;
    verificationStatus?: "verified" | "pending";
    sourceType?: "observer-upload" | "community-report";
    electionName?: string;
    accreditedVoter?: string;
    rejectedVotes?: string;
    spoiledBallots?: string;
    usedBallots?: string;
    unusedBallots?: string;
    imageUri?: string;
    videoUri?: string;
  };
};

export type DiscussionItem = {
  id: string;
  author: string;
  body: string;
  minutesAgo: number;
  likes: number;
  commentCount: number;
  shares: number;
};

export type MonitoringActivityItem = {
  label: string;
  value: string;
  icon: string;
  color: string;
};

export type IncidentAnalyticsItem = {
  id: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  iconKey:
    | "thuggery"
    | "ballot-stuffing"
    | "underage-voting"
    | "inec-misconduct"
    | "result-alteration"
    | "voter-intimidation";
};

export type CollationItem = {
  id: string;
  status: "live" | "ended";
  electionTitle: string;
  electionType: string;
  electionDateLabel: string;
  progressPercent: number;
  coveredUnits: number;
  totalUnits: number;
  lastSyncLabel: string;
  fullTitle: string;
  location: string;
  dateRange: string;
  description: string;
  resultsUploaded: number;
  incidentsReported: number;
  observersCount: number;
  totalVotesLabel: string;
  canReviewReports: boolean;
  canJoinDiscussion: boolean;
  isAssignedToPollingUnit: boolean;
  parties: PartyResult[];
  officialSummary: {
    accreditedVoters: number;
    rejectedVotes: number;
    spoiledBallots: number;
    usedBallots: number;
    unusedBallots: number;
    aggregateVoters: string;
  };
  sentiment: {
    score: number;
    legend: SentimentLegendItem[];
    voteBuyingSubmitted: number;
    voteBuyingObserverSubmitted: number;
    intimidation: {
      total: number;
      occurred: number;
      notOccurred: number;
    };
    intimidationBarPercent: number;
  };
  incidentAnalytics: IncidentAnalyticsItem[];
  monitoringActivity: MonitoringActivityItem[];
  geoBreakdown: GeoBreakdownItem[];
  reviewReports: ReviewReportItem[];
  discussions: DiscussionItem[];
};

export type CollationElectionSource = {
  id: string;
  electionName: string;
  electionType: string;
  electionLocation: string | null;
  startDate: string;
  endDate: string;
  mockElection: boolean;
  partiesCount: number;
  status: string;
};

export const collationDummyData: CollationItem[] = [];

const WAT_TIME_ZONE = "Africa/Lagos";

const PARTY_COLORS: Record<string, string> = {
  APC: "#E84C3D",
  LP: "#17A34A",
  PDP: "#3C63E5",
  NNPP: "#F29B2F",
  OTHER: "#C8CDD7",
  OTHERS: "#C8CDD7",
};

const PARTY_NAMES: Record<string, string> = {
  APC: "All Progressives Congress",
  LP: "Labour Party",
  PDP: "People's Democratic Party",
  NNPP: "New Nigeria People's Party",
  OTHER: "Other Parties",
  OTHERS: "Other Parties",
};

const INCIDENT_META: Record<
  string,
  { label: string; color: string; iconKey: IncidentAnalyticsItem["iconKey"] }
> = {
  "thuggery & violence": {
    label: "Thuggery & Violence",
    color: "#DF3F38",
    iconKey: "thuggery",
  },
  "thuggery and violence": {
    label: "Thuggery & Violence",
    color: "#DF3F38",
    iconKey: "thuggery",
  },
  "ballot stuffing": {
    label: "Ballot Stuffing",
    color: "#BF39B6",
    iconKey: "ballot-stuffing",
  },
  "underage voting": {
    label: "Underage Voting",
    color: "#3F63DD",
    iconKey: "underage-voting",
  },
  "inec misconduct": {
    label: "INEC Misconduct",
    color: "#EB9446",
    iconKey: "inec-misconduct",
  },
  "fraudulent electoral officers": {
    label: "INEC Misconduct",
    color: "#EB9446",
    iconKey: "inec-misconduct",
  },
  "result alteration": {
    label: "Result Alteration",
    color: "#B685F5",
    iconKey: "result-alteration",
  },
  "voter intimidation": {
    label: "Voter Intimidation",
    color: "#DD4137",
    iconKey: "voter-intimidation",
  },
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function safeDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDate(value?: string | null): string {
  const date = safeDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: WAT_TIME_ZONE,
  }).format(date);
}

function formatDateRange(start?: string | null, end?: string | null): string {
  const startLabel = formatDate(start);
  const endLabel = formatDate(end);

  if (startLabel !== "—" && endLabel !== "—") return `${startLabel} – ${endLabel}`;
  if (startLabel !== "—") return `From ${startLabel}`;
  if (endLabel !== "—") return `Until ${endLabel}`;

  return "Date unavailable";
}

function formatElectionDateLabel(start?: string | null): string {
  const dateLabel = formatDate(start);
  return dateLabel === "—"
    ? "Live results from all elections"
    : `Live results from all elections · ${dateLabel}`;
}

function getTimeAgo(value?: string | null): string {
  const date = safeDate(value);
  if (!date) return "Not synced yet";

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatDate(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

export function getCollationNotificationText(item: CollationItem): string {
  return `${item.fullTitle} is Live! Submit result & incident reports as our observer.`;
}

function normalizeLocation(value?: string | null): string {
  return value?.trim() || "Nationwide";
}

function resolvePartyKey(party: string): string {
  const key = party.trim().toUpperCase();
  return PARTY_COLORS[key] ? key : "OTHERS";
}

function resolvePartyName(party: string): string {
  const key = resolvePartyKey(party);
  return PARTY_NAMES[key] ?? party;
}

function buildParties(result: CollationResultPayload | null): PartyResult[] {
  const entries = Object.entries(result?.aggregateAnalysis ?? {})
    .map(([party, votes]) => ({ party: party.trim(), votes: toNumber(votes) }))
    .filter((item) => item.party && item.votes >= 0);

  const total = entries.reduce((sum, item) => sum + item.votes, 0);

  return entries
    .sort((a, b) => b.votes - a.votes)
    .map((item) => {
      const key = resolvePartyKey(item.party);
      const percent = total > 0 ? Math.round((item.votes / total) * 100) : 0;

      return {
        id: slugify(item.party),
        name: resolvePartyName(item.party),
        shortName: item.party.toUpperCase(),
        votes: item.votes,
        percent,
        color: PARTY_COLORS[key] ?? PARTY_COLORS.OTHERS,
        logoKey: key,
      };
    });
}

function getTotalVotes(parties: PartyResult[]): number {
  return parties.reduce((sum, party) => sum + party.votes, 0);
}

function getCoverage(response: ElectionCollationResponse) {
  const registered = Math.max(
    toNumber(response.result?.footer?.["registered-lgas"]),
    toNumber(response.incidentReport?.footer?.["registered-lgas"])
  );
  const submitted = Math.max(
    toNumber(response.result?.footer?.["submitted-lgas"]),
    toNumber(response.incidentReport?.footer?.["submitted-lgas"])
  );

  if (registered > 0 || submitted > 0) {
    return { coveredUnits: submitted, totalUnits: registered };
  }

  const fallback =
    response.overview.resultsUploadedCount + response.overview.incidentsReportedCount;

  return { coveredUnits: fallback, totalUnits: fallback };
}

function buildOfficialSummary(response: ElectionCollationResponse): CollationItem["officialSummary"] {
  const figures = response.overview.administrativeFiguresFromReports;
  const accreditedVoters = toNumber(figures.accreditedVoters);
  const usedBallots = toNumber(figures.usedBallotPapers);
  const rejectedVotes = toNumber(figures.rejectedVotes);
  const spoiledBallots = toNumber(figures.spoiledBallotPapers);

  return {
    accreditedVoters,
    rejectedVotes,
    spoiledBallots,
    usedBallots,
    unusedBallots: Math.max(0, accreditedVoters - usedBallots),
    aggregateVoters:
      typeof response.overview.officialInecAggregate.value === "number"
        ? formatCompactNumber(response.overview.officialInecAggregate.value)
        : "Not Recorded",
  };
}

function buildSentiment(payload: CollationSentimentPayload | null): CollationItem["sentiment"] {
  const voteRating = payload?.aggregateAnalysis.voteRating ?? {};
  const voterIntimidation = payload?.aggregateAnalysis.voterIntimidation ?? {};
  const voteBuying = payload?.aggregateAnalysis.voteBuying ?? {};

  const good = toNumber(voteRating.good);
  const okay = toNumber(voteRating.okay);
  const poor = toNumber(voteRating.poor);
  const ratingTotal = good + okay + poor;

  const goodPercent = ratingTotal > 0 ? Math.round((good / ratingTotal) * 100) : 0;
  const okayPercent = ratingTotal > 0 ? Math.round((okay / ratingTotal) * 100) : 0;
  const poorPercent = ratingTotal > 0 ? Math.max(0, 100 - goodPercent - okayPercent) : 0;

  const voteBuyingYes = toNumber(voteBuying.yes);
  const voteBuyingNo = toNumber(voteBuying.no);
  const intimidationYes = toNumber(voterIntimidation.yes);
  const intimidationNo = toNumber(voterIntimidation.no);
  const intimidationTotal = intimidationYes + intimidationNo;

  return {
    score: goodPercent,
    legend: [
      { label: "Good", value: goodPercent, count: good, color: "#58B8AB" },
      { label: "Manageable", value: okayPercent, count: okay, color: "#4B7BE7" },
      { label: "Poor", value: poorPercent, count: poor, color: "#E45125" },
    ],
    voteBuyingSubmitted: voteBuyingYes + voteBuyingNo,
    voteBuyingObserverSubmitted: voteBuyingYes,
    intimidation: {
      total: intimidationTotal,
      occurred: intimidationYes,
      notOccurred: intimidationNo,
    },
    intimidationBarPercent:
      intimidationTotal > 0 ? Math.round((intimidationYes / intimidationTotal) * 100) : 0,
  };
}

function normalizeIncidentKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveIncidentMeta(label: string) {
  const key = normalizeIncidentKey(label);
  return (
    INCIDENT_META[key] ?? {
      label,
      color: "#DF3F38",
      iconKey: "thuggery" as const,
    }
  );
}

function buildIncidentAnalytics(payload: CollationIncidentPayload | null): IncidentAnalyticsItem[] {
  const aggregate = payload?.aggregateAnalysis ?? {};
  const entries = Object.entries(aggregate)
    .map(([label, count]) => ({ label, count: toNumber(count) }))
    .filter((item) => item.count > 0);

  const merged = new Map<string, { label: string; count: number; color: string; iconKey: IncidentAnalyticsItem["iconKey"] }>();

  for (const item of entries) {
    const meta = resolveIncidentMeta(item.label);
    const key = normalizeIncidentKey(meta.label);
    const existing = merged.get(key);

    merged.set(key, {
      label: meta.label,
      count: (existing?.count ?? 0) + item.count,
      color: meta.color,
      iconKey: meta.iconKey,
    });
  }

  const total = Array.from(merged.values()).reduce((sum, item) => sum + item.count, 0);

  return Array.from(merged.values()).map((item) => ({
    id: slugify(item.label),
    label: item.label,
    count: item.count,
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    color: item.color,
    iconKey: item.iconKey,
  }));
}

function buildGeoBreakdown(response: ElectionCollationResponse, parties: PartyResult[]): GeoBreakdownItem[] {
  if (!response.result && !response.incidentReport) return [];

  const totalVotes = getTotalVotes(parties);
  const { coveredUnits, totalUnits } = getCoverage(response);
  const incidentRows = response.incidentReport?.chart ?? [];

  if (response.result?.restriction?.value || response.meta.electionLocation) {
    const name = response.result?.restriction?.value ?? response.meta.electionLocation ?? "Election Scope";

    return [
      {
        id: slugify(name),
        name: name.toUpperCase(),
        reports: response.overview.resultsUploadedCount,
        incidents: response.overview.incidentsReportedCount,
        coveredUnits,
        totalUnits,
        totalVotes,
        percentOfTotalVotes: 100,
        parties: parties.map((party) => ({
          shortName: party.shortName,
          percent: party.percent,
          color: party.color,
        })),
      },
    ];
  }

  return incidentRows
    .map((row) => {
      const name = typeof row.lga === "string" ? row.lga : "Unknown LGA";
      const incidents = Object.entries(row).reduce((sum, [key, value]) => {
        if (key === "lga") return sum;
        return sum + toNumber(value);
      }, 0);

      return {
        id: slugify(name),
        name: name.toUpperCase(),
        reports: response.overview.resultsUploadedCount,
        incidents,
        coveredUnits,
        totalUnits,
        totalVotes,
        percentOfTotalVotes: 100,
        parties: parties.map((party) => ({
          shortName: party.shortName,
          percent: party.percent,
          color: party.color,
        })),
      };
    })
    .filter((item) => item.incidents > 0 || item.reports > 0);
}

function buildMonitoringActivity(response: ElectionCollationResponse): MonitoringActivityItem[] {
  const totalReports = response.overview.resultsUploadedCount + response.overview.incidentsReportedCount;
  const submitters = response.overview.distinctObserverSubmitters;

  return [
    {
      label: "Active Volunteer",
      value: String(submitters),
      icon: "people-outline",
      color: "#111827",
    },
    {
      label: "PVC Verified",
      value: totalReports > 0 ? "Active" : "—",
      icon: "shield-checkmark-outline",
      color: "#16B3AA",
    },
    {
      label: "Active Observers",
      value: String(submitters),
      icon: "binoculars-outline",
      color: "#111827",
    },
    {
      label: "Avg, submission time",
      value: getTimeAgo(response.overview.lastSyncAt),
      icon: "time-outline",
      color: "#111827",
    },
  ];
}

function buildFallbackItem(election: CollationElectionSource): CollationItem {
  const location = normalizeLocation(election.electionLocation);
  const dateRange = formatDateRange(election.startDate, election.endDate);

  return {
    id: election.id,
    status: election.status === "live" ? "live" : "ended",
    electionTitle: election.electionName || "Election",
    electionType: election.electionType,
    electionDateLabel: formatElectionDateLabel(election.startDate),
    progressPercent: 0,
    coveredUnits: 0,
    totalUnits: 0,
    lastSyncLabel: "Not synced yet",
    fullTitle: election.electionName || "Election",
    location,
    dateRange,
    description: "No verified collation report has been submitted yet.",
    resultsUploaded: 0,
    incidentsReported: 0,
    observersCount: 0,
    totalVotesLabel: "0 Votes",
    canReviewReports: false,
    canJoinDiscussion: election.status === "live",
    isAssignedToPollingUnit: false,
    parties: [],
    officialSummary: {
      accreditedVoters: 0,
      rejectedVotes: 0,
      spoiledBallots: 0,
      usedBallots: 0,
      unusedBallots: 0,
      aggregateVoters: "Not Recorded",
    },
    sentiment: buildSentiment(null),
    incidentAnalytics: [],
    monitoringActivity: [
      { label: "Active Volunteer", value: "0", icon: "people-outline", color: "#111827" },
      { label: "PVC Verified", value: "—", icon: "shield-checkmark-outline", color: "#16B3AA" },
      { label: "Active Observers", value: "0", icon: "binoculars-outline", color: "#111827" },
      { label: "Avg, submission time", value: "—", icon: "time-outline", color: "#111827" },
    ],
    geoBreakdown: [],
    reviewReports: [],
    discussions: [],
  };
}

export function mapCollationResponseToItem(
  response: ElectionCollationResponse,
  fallbackElection?: CollationElectionSource
): CollationItem {
  const meta = response.meta;
  const location = normalizeLocation(meta.electionLocation ?? response.electionDetails.electionLocation);
  const electionTitle = meta.electionName || response.electionDetails.electionName || "Election";
  const parties = buildParties(response.result);
  const totalVotes = getTotalVotes(parties);
  const { coveredUnits, totalUnits } = getCoverage(response);
  const progressPercent = totalUnits > 0 ? Math.round((coveredUnits / totalUnits) * 100) : 0;
  const hasReportData = response.overview.resultsUploadedCount > 0 || response.overview.incidentsReportedCount > 0;

  return {
    id: meta.activeElectionId,
    status: fallbackElection?.status === "live" ? "live" : "ended",
    electionTitle,
    electionType: meta.electionType,
    electionDateLabel: formatElectionDateLabel(meta.startDate),
    progressPercent,
    coveredUnits,
    totalUnits,
    lastSyncLabel: getTimeAgo(response.overview.lastSyncAt),
    fullTitle: electionTitle,
    location,
    dateRange: formatDateRange(meta.startDate, meta.endDate),
    description:
      response.overview.resultsUploadedCount > 0
        ? `See the vote result from ${response.overview.resultsUploadedCount} result${
            response.overview.resultsUploadedCount === 1 ? "" : "s"
          } and ${response.overview.incidentsReportedCount} incident${
            response.overview.incidentsReportedCount === 1 ? "" : "s"
          } in ${location} reported by observers.`
        : "No verified collation report has been submitted yet.",
    resultsUploaded: response.overview.resultsUploadedCount,
    incidentsReported: response.overview.incidentsReportedCount,
    observersCount: response.overview.distinctObserverSubmitters,
    totalVotesLabel: `${formatCompactNumber(totalVotes)} Votes`,
    canReviewReports: false,
    canJoinDiscussion: fallbackElection?.status === "live",
    isAssignedToPollingUnit: hasReportData,
    parties,
    officialSummary: buildOfficialSummary(response),
    sentiment: buildSentiment(response.sentimentAnalysis),
    incidentAnalytics: buildIncidentAnalytics(response.incidentReport),
    monitoringActivity: buildMonitoringActivity(response),
    geoBreakdown: buildGeoBreakdown(response, parties),
    reviewReports: [],
    discussions: [],
  };
}

export function buildCollationItem(
  response?: ElectionCollationResponse,
  fallbackElection?: CollationElectionSource
): CollationItem {
  if (response) return mapCollationResponseToItem(response, fallbackElection);
  if (fallbackElection) return buildFallbackItem(fallbackElection);

  return buildFallbackItem({
    id: "unknown-election",
    electionName: "Election",
    electionType: "election",
    electionLocation: null,
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    mockElection: false,
    partiesCount: 0,
    status: "live",
  });
}

function startTime(item: CollationItem): number {
  const source = item.dateRange.split("–")[0]?.trim();
  const date = source ? new Date(source) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

export function sortCollationItems(items: CollationItem[]): CollationItem[] {
  return [...items].sort((a, b) => {
    if (a.status === "live" && b.status !== "live") return -1;
    if (a.status !== "live" && b.status === "live") return 1;
    return startTime(b) - startTime(a);
  });
}
