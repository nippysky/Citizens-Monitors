import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReportFlowMode = "submit-result" | "report-incident";

export type ReportingUploadLocation = {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number | null;
  capturedAt: string;
};

export type CommencementContext = {
  electionId: string;
  electionTitle: string;
  pollingUnitName: string;
  pollingUnitCode: string;
  ward: string;
  lga: string;
  state: string;
  uploadLocation?: ReportingUploadLocation | null;
};

export type ResultPartyVote = {
  id: string;
  party: string;
  candidate?: string;
  votes: number | string;
};

export type ElectionResultDraft = {
  electionId: string;
  electionTitle: string;
  pollingUnitName: string;
  pollingUnitCode: string;
  ward: string;
  lga: string;
  state: string;
  uploadLocation?: ReportingUploadLocation | null;
  votingStartTime: string;
  signedResultImageUri: string | null;
  resultAnnouncementVideoUri: string | null;
  votesPerParty: ResultPartyVote[];
  accreditedVoters: string;
  rejectedVoters: string;
  spoiledBallotPapers: string;
  rejectedBallots: string;
  usedBallotPapers: string;
  confirmTruthfulness: boolean;
};

export type IncidentDraft = {
  electionId: string;
  electionTitle: string;
  pollingUnitName: string;
  pollingUnitCode: string;
  ward: string;
  lga: string;
  state: string;
  uploadLocation?: ReportingUploadLocation | null;
  incidentType: string;
  description: string;
  incidentTime: string;
  electionRating?: "good" | "okay" | "poor" | "manageable" | "";
  imageEvidenceUris: string[];
  videoEvidenceUris: string[];
  liveVideoUri: string | null;
  geoLabel?: string;
};

const RESULT_DRAFT_KEY = "@cm_reporting_result_draft";
const INCIDENT_DRAFT_KEY = "@cm_reporting_incident_draft";
const LIVE_VIDEO_KEY = "@cm_reporting_live_video";

/**
 * Starter rows for the result table.
 *
 * Candidate names are intentionally EMPTY: they differ per election and per
 * office, so hardcoding them (previously Lagos governorship candidates) put
 * the wrong names under unrelated elections. Real candidates come from the
 * election payload.
 */
export const DEFAULT_PARTIES: ResultPartyVote[] = [
  { id: "apc", party: "APC", candidate: "", votes: "" },
  { id: "pdp", party: "PDP", candidate: "", votes: "" },
  { id: "lp", party: "LP", candidate: "", votes: "" },
  { id: "nnpp", party: "NNPP", candidate: "", votes: "" },
  { id: "others", party: "Other Parties", candidate: "", votes: "" },
];

export const INCIDENT_OPTIONS = [
  "Ballot Stuffing",
  "Thuggery & Violence",
  "Underage Voting",
  "INEC Misconduct",
  "Result Alteration",
  "Voter Intimidation",
  "Late Opening",
  "Missing Materials",
  "Other Incidents",
] as const;

/**
 * Normalises a commencement context.
 *
 * Missing values stay EMPTY on purpose. Substituting placeholder data here is
 * how a fixture polling unit ("Ikotun Community Primary School") once leaked
 * into real reports — a report with the wrong polling unit is worse than one
 * the UI refuses to submit. Use `isCommencementContextComplete` to gate
 * submission instead.
 */
export function buildCommencementContext(
  partial?: Partial<CommencementContext>
): CommencementContext {
  return {
    electionId: partial?.electionId?.trim() || "",
    electionTitle: partial?.electionTitle?.trim() || "",
    pollingUnitName: partial?.pollingUnitName?.trim() || "",
    pollingUnitCode: partial?.pollingUnitCode?.trim() || "",
    ward: partial?.ward?.trim() || "",
    lga: partial?.lga?.trim() || "",
    state: partial?.state?.trim() || "",
    uploadLocation: partial?.uploadLocation ?? null,
  };
}

/**
 * A report can only be submitted against a real, identified election.
 * Typed as a predicate so callers get proper narrowing after the check.
 */
export function isCommencementContextComplete(
  context: CommencementContext | null | undefined
): context is CommencementContext {
  return Boolean(context?.electionId?.trim());
}

export function buildInitialResultDraft(
  ctx: CommencementContext,
  votingStartTime: string
): ElectionResultDraft {
  return {
    electionId: ctx.electionId,
    electionTitle: ctx.electionTitle,
    pollingUnitName: ctx.pollingUnitName,
    pollingUnitCode: ctx.pollingUnitCode,
    ward: ctx.ward,
    lga: ctx.lga,
    state: ctx.state,
    uploadLocation: ctx.uploadLocation ?? null,
    votingStartTime,
    signedResultImageUri: null,
    resultAnnouncementVideoUri: null,
    votesPerParty: DEFAULT_PARTIES,
    accreditedVoters: "",
    rejectedVoters: "",
    spoiledBallotPapers: "",
    rejectedBallots: "",
    usedBallotPapers: "",
    confirmTruthfulness: false,
  };
}

export function buildInitialIncidentDraft(
  ctx: CommencementContext
): IncidentDraft {
  return {
    electionId: ctx.electionId,
    electionTitle: ctx.electionTitle,
    pollingUnitName: ctx.pollingUnitName,
    pollingUnitCode: ctx.pollingUnitCode,
    ward: ctx.ward,
    lga: ctx.lga,
    state: ctx.state,
    uploadLocation: ctx.uploadLocation ?? null,
    incidentType: "",
    description: "",
    incidentTime: "",
    electionRating: "",
    imageEvidenceUris: [],
    videoEvidenceUris: [],
    liveVideoUri: null,
    geoLabel: `${ctx.ward}, ${ctx.pollingUnitCode}`,
  };
}

export async function saveResultDraft(draft: ElectionResultDraft) {
  await AsyncStorage.setItem(RESULT_DRAFT_KEY, JSON.stringify(draft));
}

export async function getResultDraft(): Promise<ElectionResultDraft | null> {
  const raw = await AsyncStorage.getItem(RESULT_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ElectionResultDraft;
  } catch {
    return null;
  }
}

export async function clearResultDraft() {
  await AsyncStorage.removeItem(RESULT_DRAFT_KEY);
}

export async function saveIncidentDraft(draft: IncidentDraft) {
  await AsyncStorage.setItem(INCIDENT_DRAFT_KEY, JSON.stringify(draft));
}

export async function getIncidentDraft(): Promise<IncidentDraft | null> {
  const raw = await AsyncStorage.getItem(INCIDENT_DRAFT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as IncidentDraft;
  } catch {
    return null;
  }
}

export async function clearIncidentDraft() {
  await AsyncStorage.removeItem(INCIDENT_DRAFT_KEY);
}

export async function saveLiveVideoUri(uri: string) {
  await AsyncStorage.setItem(LIVE_VIDEO_KEY, uri);
}

export async function getLiveVideoUri(): Promise<string | null> {
  return AsyncStorage.getItem(LIVE_VIDEO_KEY);
}

export async function clearLiveVideoUri() {
  await AsyncStorage.removeItem(LIVE_VIDEO_KEY);
}

// ── Draft abandonment
// Drafts are kept while a flow is merely INTERRUPTED (phone call, app killed,
// camera detour) — losing half-entered election evidence in the field is
// expensive. But when the user deliberately LEAVES a reporting screen, the
// draft AND its staged media files are wiped so nothing stale greets them on
// re-entry and evidence files don't bloat storage.
// Both helpers are storage-driven and idempotent: after a successful submit
// or offline enqueue the stored draft is already cleared, so calling these on
// unmount is a safe no-op (and queued uploads keep their staged files).

export function collectResultDraftMediaUris(
  draft: ElectionResultDraft
): (string | null)[] {
  return [draft.signedResultImageUri, draft.resultAnnouncementVideoUri];
}

export function collectIncidentDraftMediaUris(
  draft: IncidentDraft
): (string | null)[] {
  return [
    ...draft.imageEvidenceUris,
    ...draft.videoEvidenceUris,
    draft.liveVideoUri,
  ];
}

export async function abandonResultDraft(): Promise<void> {
  try {
    const draft = await getResultDraft();
    if (!draft) return;

    const { deleteStagedMediaFiles } = await import("@/lib/offlineMedia");
    deleteStagedMediaFiles(collectResultDraftMediaUris(draft));

    await clearResultDraft();
  } catch {
    // Cleanup is best-effort — never crash a navigation over it.
  }
}

export async function abandonIncidentDraft(): Promise<void> {
  try {
    const draft = await getIncidentDraft();
    if (!draft) return;

    const { deleteStagedMediaFiles } = await import("@/lib/offlineMedia");
    deleteStagedMediaFiles(collectIncidentDraftMediaUris(draft));

    await clearIncidentDraft();
    await clearLiveVideoUri();
  } catch {
    // Cleanup is best-effort — never crash a navigation over it.
  }
}

export function parseNumeric(value: string | number): number {
  if (typeof value === "number") return value;

  const parsed = Number(String(value).replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateTotalValidVotes(votes: ResultPartyVote[]): number {
  return votes.reduce((acc, item) => acc + parseNumeric(item.votes), 0);
}

export function validateElectionResult(draft: ElectionResultDraft): {
  valid: boolean;
  reason?: string;
  totalValidVotes: number;
} {
  const totalValidVotes = calculateTotalValidVotes(draft.votesPerParty);
  const accreditedVoters = parseNumeric(draft.accreditedVoters);
  const rejectedVotes = parseNumeric(draft.rejectedVoters);
  const spoiledVotes = parseNumeric(draft.spoiledBallotPapers);

  const combined = totalValidVotes + rejectedVotes + spoiledVotes;

  if (accreditedVoters > 0 && combined !== accreditedVoters) {
    return {
      valid: false,
      reason:
        "Under Section 60 of the Electoral Act 2022, a result sheet where the total of valid votes, rejected votes, and spoil ballots does not equal the number of accredited voters cannot be accepted as an official result.",
      totalValidVotes,
    };
  }

  return {
    valid: true,
    totalValidVotes,
  };
}