import { apiRequest } from "@/lib/api/http";
import type { ElectionResultDraft, IncidentDraft, ReportingUploadLocation } from "@/lib/reporting";

export type ApiUploadedFile = {
  location?: string;
  name?: string;
  type?: string;
  size?: number;
  url?: string;
  _id?: string;
  __v?: number;
};

export type SubmitElectionResultResponse = {
  _id: string;
  election: string;
  user: string;
  userRole: string;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  uploadLocation?: ReportingUploadLocation;
  resultPicture?: ApiUploadedFile;
  resultVideo?: ApiUploadedFile;
  partiesVotes: {
    party: string;
    count: number;
    _id?: string;
  }[];
  voteRating: "good" | "okay" | "poor" | string;
  voterIntimidation: "yes" | "no" | string;
  voteBuying: "yes" | "no" | string;
  agreed: boolean;
  flagged: boolean;
  hidden: boolean;
  timeBegan: string;
  accreditedVoters: number;
  rejectedPapers: number;
  spoiledBallotPapers: number;
  usedBallotPapers: number;
  actions: unknown[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type SubmitIncidentReportResponse = {
  _id: string;
  election: string;
  user: string;
  userRole: string;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  uploadLocation?: ReportingUploadLocation;
  selectIncident: string;
  incidentNote: string;
  electionRating: "good" | "okay" | "poor" | string;
  incidentPictures: ApiUploadedFile[];
  incidentVideos: ApiUploadedFile[];
  agreed: boolean;
  flagged: boolean;
  hidden: boolean;
  actions: unknown[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type ElectionResultSubmitPayload = {
  electionId: string;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  pollingUnitCode?: string;
  uploadLocation?: ReportingUploadLocation | null;
  resultPictureUri?: string | null;
  resultVideoUri?: string | null;
  partiesVotes: {
    party: string;
    count: number;
  }[];
  voteRating: "good" | "okay" | "poor";
  voterIntimidation: "yes" | "no";
  voteBuying: "yes" | "no";
  timeBegan: string;
  accreditedVoters: number;
  rejectedPapers: number;
  spoiledBallotPapers: number;
  usedBallotPapers: number;
};

export type IncidentReportSubmitPayload = {
  electionId: string;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  pollingUnitCode?: string;
  uploadLocation?: ReportingUploadLocation | null;
  selectIncident: string;
  incidentNote: string;
  electionRating: "good" | "okay" | "poor";
  incidentPictureUris: string[];
  incidentVideoUris: string[];
};

type ReactNativeFile = {
  uri: string;
  name: string;
  type: string;
};

function normalizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const parsed = Number(String(value ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getExtension(uri: string): string {
  const clean = uri.split("?")[0] ?? uri;
  const ext = clean.split(".").pop()?.toLowerCase();

  if (!ext || ext.length > 6) return "jpg";
  if (ext === "jpeg") return "jpg";

  return ext;
}

function getMimeType(uri: string): string {
  const ext = getExtension(uri);

  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/heic";
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/x-m4v";
    case "mp4":
      return "video/mp4";
    case "jpg":
    default:
      return "image/jpeg";
  }
}

function createNativeFile(uri: string, fallbackName: string): ReactNativeFile {
  const ext = getExtension(uri);

  return {
    uri,
    name: `${fallbackName}.${ext}`,
    type: getMimeType(uri),
  };
}

function appendFile(
  formData: FormData,
  key: string,
  uri: string | null | undefined,
  fallbackName: string
): void {
  if (!uri?.trim()) return;

  formData.append(
    key,
    createNativeFile(uri, fallbackName) as unknown as Blob
  );
}

function appendJson(formData: FormData, key: string, value: unknown): void {
  formData.append(key, JSON.stringify(value));
}

function appendNumber(formData: FormData, key: string, value: unknown): void {
  formData.append(key, String(normalizeNumber(value)));
}

function appendString(formData: FormData, key: string, value: unknown): void {
  const text = String(value ?? "").trim();

  if (text) {
    formData.append(key, text);
  }
}

function normalizeVoteRating(
  value: unknown
): "good" | "okay" | "poor" {
  const rating = String(value ?? "").trim().toLowerCase();

  if (rating === "poor") return "poor";
  if (rating === "manageable" || rating === "okay") return "okay";

  return "good";
}

function normalizeYesNo(value: unknown): "yes" | "no" {
  return String(value ?? "").trim().toLowerCase() === "yes" ? "yes" : "no";
}

function normalizeIncidentName(value: string): string {
  return value.replace(/\s*&\s*/g, " and ").trim();
}

function buildFallbackUploadLocation(params: {
  pollingUnit: string;
  pollingUnitCode?: string;
  state: string;
  lga: string;
  ward: string;
}): ReportingUploadLocation {
  const locationParts = [
    params.pollingUnitCode,
    params.pollingUnit,
    params.ward,
    params.lga,
    params.state,
  ].filter(Boolean);

  return {
    latitude: 0,
    longitude: 0,
    address: locationParts.join(", ") || "Polling unit location pending",
    accuracy: 0,
    capturedAt: new Date().toISOString(),
  };
}

function resolveUploadLocation(params: {
  uploadLocation?: ReportingUploadLocation | null;
  pollingUnit: string;
  pollingUnitCode?: string;
  state: string;
  lga: string;
  ward: string;
}): ReportingUploadLocation {
  if (
    params.uploadLocation &&
    typeof params.uploadLocation.latitude === "number" &&
    typeof params.uploadLocation.longitude === "number"
  ) {
    return params.uploadLocation;
  }

  return buildFallbackUploadLocation(params);
}

export function mapDraftToElectionResultPayload(params: {
  draft: ElectionResultDraft;
  feedback?: {
    rating?: "good" | "manageable" | "okay" | "poor" | "";
    intimidationToday?: "yes" | "no" | "";
    voteBuyingToday?: "yes" | "no" | "";
  };
}): ElectionResultSubmitPayload {
  const { draft, feedback } = params;

  return {
    electionId: draft.electionId,
    state: draft.state,
    lga: draft.lga,
    ward: draft.ward,
    pollingUnit: draft.pollingUnitName,
    pollingUnitCode: draft.pollingUnitCode,
    uploadLocation: draft.uploadLocation ?? null,
    resultPictureUri: draft.signedResultImageUri,
    resultVideoUri: draft.resultAnnouncementVideoUri,
    partiesVotes: draft.votesPerParty
      .filter((item) => item.party?.trim())
      .map((item) => ({
        party: item.party.trim().toUpperCase(),
        count: normalizeNumber(item.votes),
      })),
    voteRating: normalizeVoteRating(feedback?.rating),
    voterIntimidation: normalizeYesNo(feedback?.intimidationToday),
    voteBuying: normalizeYesNo(feedback?.voteBuyingToday),
    timeBegan: draft.votingStartTime || "08:00 AM",
    accreditedVoters: normalizeNumber(draft.accreditedVoters),
    rejectedPapers: normalizeNumber(draft.rejectedVoters),
    spoiledBallotPapers: normalizeNumber(draft.spoiledBallotPapers),
    usedBallotPapers: normalizeNumber(draft.usedBallotPapers),
  };
}

export function mapDraftToIncidentReportPayload(
  draft: IncidentDraft
): IncidentReportSubmitPayload {
  const incidentVideoUris = [
    ...draft.videoEvidenceUris,
    draft.liveVideoUri,
  ].filter((uri): uri is string => Boolean(uri?.trim()));

  return {
    electionId: draft.electionId,
    state: draft.state,
    lga: draft.lga,
    ward: draft.ward,
    pollingUnit: draft.pollingUnitName,
    pollingUnitCode: draft.pollingUnitCode,
    uploadLocation: draft.uploadLocation ?? null,
    selectIncident: normalizeIncidentName(draft.incidentType),
    incidentNote: draft.description.trim(),
    electionRating: normalizeVoteRating(draft.electionRating),
    incidentPictureUris: draft.imageEvidenceUris.filter(Boolean).slice(0, 5),
    incidentVideoUris: incidentVideoUris.slice(0, 2),
  };
}

export async function submitElectionResult(
  payload: ElectionResultSubmitPayload
): Promise<SubmitElectionResultResponse> {
  const uploadLocation = resolveUploadLocation({
    uploadLocation: payload.uploadLocation,
    pollingUnit: payload.pollingUnit,
    pollingUnitCode: payload.pollingUnitCode,
    state: payload.state,
    lga: payload.lga,
    ward: payload.ward,
  });

  const formData = new FormData();

  appendString(formData, "state", payload.state);
  appendString(formData, "lga", payload.lga);
  appendString(formData, "ward", payload.ward);
  appendString(formData, "pollingUnit", payload.pollingUnit);
  appendJson(formData, "uploadLocation", uploadLocation);
  appendJson(formData, "partiesVotes", payload.partiesVotes);

  appendString(formData, "voteRating", payload.voteRating);
  appendString(formData, "voterIntimidation", payload.voterIntimidation);
  appendString(formData, "voteBuying", payload.voteBuying);
  appendString(formData, "timeBegan", payload.timeBegan);

  appendNumber(formData, "accreditedVoters", payload.accreditedVoters);
  appendNumber(formData, "rejectedPapers", payload.rejectedPapers);
  appendNumber(formData, "spoiledBallotPapers", payload.spoiledBallotPapers);
  appendNumber(formData, "usedBallotPapers", payload.usedBallotPapers);

  appendFile(
    formData,
    "resultPicture",
    payload.resultPictureUri,
    "result-picture"
  );
  appendFile(
    formData,
    "resultVideo",
    payload.resultVideoUri,
    "result-video"
  );

  return apiRequest<SubmitElectionResultResponse>(
    `/elections/${encodeURIComponent(payload.electionId)}/results`,
    {
      method: "POST",
      body: formData,
    }
  );
}

export async function submitIncidentReport(
  payload: IncidentReportSubmitPayload
): Promise<SubmitIncidentReportResponse> {
  const uploadLocation = resolveUploadLocation({
    uploadLocation: payload.uploadLocation,
    pollingUnit: payload.pollingUnit,
    pollingUnitCode: payload.pollingUnitCode,
    state: payload.state,
    lga: payload.lga,
    ward: payload.ward,
  });

  const formData = new FormData();

  appendString(formData, "state", payload.state);
  appendString(formData, "lga", payload.lga);
  appendString(formData, "ward", payload.ward);
  appendString(formData, "pollingUnit", payload.pollingUnit);
  appendJson(formData, "uploadLocation", uploadLocation);

  appendString(formData, "selectIncident", payload.selectIncident);
  appendString(formData, "incidentNote", payload.incidentNote);
  appendString(formData, "electionRating", payload.electionRating);

  payload.incidentPictureUris.forEach((uri, index) => {
    appendFile(formData, "incidentPictures[]", uri, `incident-picture-${index + 1}`);
  });

  payload.incidentVideoUris.forEach((uri, index) => {
    appendFile(formData, "incidentVideos[]", uri, `incident-video-${index + 1}`);
  });

  return apiRequest<SubmitIncidentReportResponse>(
    `/elections/${encodeURIComponent(payload.electionId)}/report`,
    {
      method: "POST",
      body: formData,
    }
  );
}