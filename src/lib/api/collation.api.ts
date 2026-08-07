import { apiRequest } from "@/lib/api/http";

export type CollationElectionDetails = {
  electionType: string;
  electionName: string;
  mockElection: boolean;
  electionLocation: string | null;
  startDate: string;
  endDate: string;
};

export type CollationResultChartRow = {
  party?: string;
  [key: string]: string | number | undefined;
};

/**
 * Coverage counters. The backend keys these by the grouping level of the
 * election: a national/presidential election reports states, a state-level
 * (e.g. gubernatorial) election reports LGAs.
 */
export type CollationFooter = {
  "registered-lgas"?: number;
  "submitted-lgas"?: number;
  "registered-states"?: number;
  "submitted-states"?: number;
};

export type CollationRestriction = {
  name: string;
  value: string;
};

/**
 * One region's results. NOTE: the endpoint returns `result` as an ARRAY of
 * these (one entry per state/LGA that has reported), not a single object.
 * Treating it as an object is what previously produced an empty collation
 * screen — `result.aggregateAnalysis` was always undefined.
 */
export type CollationResultPayload = {
  /** Present on national elections (grouped by state). */
  state?: string;
  /** Present on state-level elections (grouped by LGA). */
  lga?: string;
  chart: CollationResultChartRow[];
  footer?: CollationFooter;
  aggregateAnalysis: Record<string, number>;
  restriction?: CollationRestriction;
};

export type CollationIncidentChartRow = {
  lga?: string;
  [key: string]: string | number | undefined;
};

export type CollationIncidentPayload = {
  chart: CollationIncidentChartRow[];
  footer?: CollationFooter;
  aggregateAnalysis: Record<string, number>;
  restriction?: CollationRestriction;
};

export type CollationSentimentPayload = {
  chart: {
    voteRating?: Record<string, number>;
    voterIntimidation?: Record<string, number>;
    voteBuying?: Record<string, number>;
  };
  aggregateAnalysis: {
    voteRating?: Record<string, number>;
    voterIntimidation?: Record<string, number>;
    voteBuying?: Record<string, number>;
  };
};

export type CollationGeoParty = {
  party: string;
  votes: number;
  percent: number;
  color: string | null;
};

export type CollationGeoRegion = {
  regionName: string;
  resultsCount: number;
  incidentsCount: number;
  reportedPollingUnits: number;
  totalPollingUnits: number;
  totalVotes: number;
  percentOfTotalVotes: number;
  parties: CollationGeoParty[];
};

/**
 * Server-computed geographic breakdown — the authoritative source for the
 * "Geo Election Result Breakdown" section. `groupBy` tells us whether regions
 * are states (national elections) or LGAs (state-level elections), so the UI
 * never has to guess the heading.
 */
export type CollationGeoBreakdownPayload = {
  groupBy: string;
  summary: {
    resultsCount: number;
    incidentsCount: number;
    reportedPollingUnits: number;
    totalPollingUnits: number;
    scopeLabel: string;
    totalVotes: number;
  };
  regions: CollationGeoRegion[];
};

export type CollationOverviewPayload = {
  lastSyncAt: string;
  resultsUploadedCount: number;
  incidentsReportedCount: number;
  distinctObserverSubmitters: number;
  administrativeFiguresFromReports: {
    accreditedVoters: number;
    rejectedVotes: number;
    spoiledBallotPapers: number;
    usedBallotPapers: number;
  };
  officialInecAggregate: {
    status: string;
    value: number | null;
  };
};

export type CollationMetaPayload = {
  activeElectionId: string;
  electionType: string;
  electionName: string;
  electionLocation: string | null;
  mockElection: boolean;
  startDate: string;
  endDate: string;
};

export type ElectionCollationResponse = {
  electionDetails: CollationElectionDetails;
  /** Array — one entry per reporting region. May be null/absent when empty. */
  result: CollationResultPayload[] | null;
  incidentReport: CollationIncidentPayload[] | null;
  sentimentAnalysis: CollationSentimentPayload | null;
  geoBreakdown: CollationGeoBreakdownPayload | null;
  overview: CollationOverviewPayload;
  meta: CollationMetaPayload;
};

export async function getElectionCollation(
  activeElectionId: string
): Promise<ElectionCollationResponse> {
  return apiRequest<ElectionCollationResponse>(
    `/elections/${encodeURIComponent(activeElectionId)}/collation`
  );
}
