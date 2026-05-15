import { apiRequest } from "@/lib/api/http";

export type ElectionVaultUploadedFile = {
  location?: string;
  name?: string;
  type?: string;
  size?: number;
  url?: string;
  _id?: string;
  __v?: number;
};

export type ElectionVaultUploadLocation = {
  latitude?: number;
  longitude?: number;
  address?: string;
  accuracy?: number;
  capturedAt?: string;
};

export type ElectionVaultNestedElectionType = {
  _id?: string;
  electionType?: string;
  electionName?: string;
};

export type ElectionVaultElection = {
  _id?: string;
  election?: ElectionVaultNestedElectionType;
  electionLocation?: string | null;
  startDate?: string;
  endDate?: string;
  results?: string[];
  incidentReports?: string[];
  resultsCount?: number;
  mockElection?: boolean;
  politicalParties?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type ElectionVaultPartyVote = {
  _id?: string;
  party?: string;
  count?: number;
};

export type ElectionVaultResult = {
  _id: string;
  election?: ElectionVaultElection;
  user?: string;
  userRole?: string;
  state?: string;
  lga?: string;
  ward?: string;
  pollingUnit?: string;
  uploadLocation?: ElectionVaultUploadLocation;
  resultPicture?: ElectionVaultUploadedFile;
  resultVideo?: ElectionVaultUploadedFile;
  partiesVotes?: ElectionVaultPartyVote[];
  voteRating?: string;
  voterIntimidation?: string;
  voteBuying?: string;
  agreed?: boolean;
  flagged?: boolean;
  hidden?: boolean;
  timeBegan?: string;
  accreditedVoters?: number;
  rejectedPapers?: number;
  spoiledBallotPapers?: number;
  usedBallotPapers?: number;
  actions?: {
    userId?: string;
    action?: string;
    _id?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type ElectionVaultIncident = {
  _id: string;
  election?: ElectionVaultElection;
  user?: string;
  userRole?: string;
  state?: string;
  lga?: string;
  ward?: string;
  pollingUnit?: string;
  uploadLocation?: ElectionVaultUploadLocation;
  selectIncident?: string;
  incidentNote?: string;
  electionRating?: string;
  incidentPictures?: ElectionVaultUploadedFile[];
  incidentVideos?: ElectionVaultUploadedFile[];
  agreed?: boolean;
  flagged?: boolean;
  hidden?: boolean;
  actions?: {
    userId?: string;
    action?: string;
    _id?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type ElectionVaultSummary = {
  totalSubmissions: number;
  resultsUploaded: number;
  incidentsUploaded: number;
};

export type ElectionVaultResponse = {
  summary: ElectionVaultSummary;
  results: ElectionVaultResult[];
  incidents: ElectionVaultIncident[];
};

export type ElectionVaultSubmission =
  | {
      kind: "result";
      id: string;
      createdAt?: string;
      data: ElectionVaultResult;
    }
  | {
      kind: "incident";
      id: string;
      createdAt?: string;
      data: ElectionVaultIncident;
    };

export type UpdateElectionResultPayload = {
  partiesVotes: {
    party: string;
    count: number;
  }[];
  voteRating: string;
  voterIntimidation: string;
  voteBuying: string;
  timeBegan: string;
  accreditedVoters: number;
  rejectedPapers: number;
  spoiledBallotPapers: number;
  usedBallotPapers: number;
};

export type DeleteElectionResultResponse = {
  message: string;
};

export function isVaultResult(
  item: ElectionVaultSubmission
): item is Extract<ElectionVaultSubmission, { kind: "result" }> {
  return item.kind === "result";
}

export async function getElectionVault(): Promise<ElectionVaultResponse> {
  const response = await apiRequest<ElectionVaultResponse>(
    "/profile/election-vault",
    {
      method: "GET",
      auth: true,
    }
  );

  return {
    summary: {
      totalSubmissions: response.summary?.totalSubmissions ?? 0,
      resultsUploaded: response.summary?.resultsUploaded ?? 0,
      incidentsUploaded: response.summary?.incidentsUploaded ?? 0,
    },
    results: Array.isArray(response.results) ? response.results : [],
    incidents: Array.isArray(response.incidents) ? response.incidents : [],
  };
}

export async function updateElectionResult(params: {
  activeElectionId: string;
  payload: UpdateElectionResultPayload;
}): Promise<ElectionVaultResult> {
  return apiRequest<ElectionVaultResult>(
    `/elections/${encodeURIComponent(params.activeElectionId)}/results`,
    {
      method: "PUT",
      auth: true,
      body: params.payload,
    }
  );
}

export async function deleteElectionResult(params: {
  activeElectionId: string;
}): Promise<DeleteElectionResultResponse> {
  return apiRequest<DeleteElectionResultResponse>(
    `/elections/${encodeURIComponent(params.activeElectionId)}/results`,
    {
      method: "DELETE",
      auth: true,
    }
  );
}

export function getVaultElectionName(
  election?: ElectionVaultElection
): string {
  return (
    election?.election?.electionName?.trim() ||
    formatElectionType(election?.election?.electionType || "") ||
    "Election"
  );
}

export function getVaultElectionType(
  election?: ElectionVaultElection
): string {
  return election?.election?.electionType || "";
}

export function getVaultElectionLocation(
  election?: ElectionVaultElection
): string {
  return election?.electionLocation?.trim() || "Polling unit submission";
}

export function getActiveElectionIdFromResult(
  result: ElectionVaultResult
): string {
  return result.election?._id ?? "";
}

export function formatElectionType(value: string): string {
  if (!value.trim()) return "";

  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildElectionVaultSubmissions(
  vault: ElectionVaultResponse | undefined
): ElectionVaultSubmission[] {
  if (!vault) return [];

  const results: ElectionVaultSubmission[] = vault.results.map((item) => ({
    kind: "result",
    id: item._id,
    createdAt: item.createdAt,
    data: item,
  }));

  const incidents: ElectionVaultSubmission[] = vault.incidents.map((item) => ({
    kind: "incident",
    id: item._id,
    createdAt: item.createdAt,
    data: item,
  }));

  return [...results, ...incidents].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return bTime - aTime;
  });
} 