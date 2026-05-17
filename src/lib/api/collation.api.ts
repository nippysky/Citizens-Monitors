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

export type CollationFooter = {
  "registered-lgas"?: number;
  "submitted-lgas"?: number;
};

export type CollationRestriction = {
  name: string;
  value: string;
};

export type CollationResultPayload = {
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
  result: CollationResultPayload | null;
  incidentReport: CollationIncidentPayload | null;
  sentimentAnalysis: CollationSentimentPayload | null;
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
