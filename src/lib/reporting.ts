import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReportFlowMode = "submit-result" | "report-incident";

export type CommencementContext = {
  electionId: string;
  electionTitle: string;
  pollingUnitName: string;
  pollingUnitCode: string;
  ward: string;
  lga: string;
  state: string;
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
  incidentType: string;
  description: string;
  incidentTime: string;
  imageEvidenceUris: string[];
  videoEvidenceUris: string[];
  liveVideoUri: string | null;
  geoLabel?: string;
};

const RESULT_DRAFT_KEY = "@cm_reporting_result_draft";
const INCIDENT_DRAFT_KEY = "@cm_reporting_incident_draft";
const LIVE_VIDEO_KEY = "@cm_reporting_live_video";

export const REPORTING_DEV_CONFIG = {
  autoShowDemoLiveNotice: true,
  enableGlobalLiveNoticeDevTrigger: true,
  forceInvalidResultSubmission: false,
  forceIncidentSuccess: true,
  forceResultSuccess: true,
} as const;

export const DEV_COMMENCEMENT_CONTEXT: CommencementContext = {
  electionId: "alimosho-lg-2026",
  electionTitle: "Alimosho LG Election Result",
  pollingUnitName: "Ikotun Community Primary School",
  pollingUnitCode: "LA/01/08/004",
  ward: "Ward 01",
  lga: "Alimosho LGA",
  state: "Lagos",
};

export const DEFAULT_PARTIES: ResultPartyVote[] = [
  { id: "apc", party: "APC", candidate: "Babajide Sanwo-Olu", votes: "" },
  { id: "pdp", party: "PDP", candidate: "Gbadebo Rhodes", votes: "" },
  { id: "lp", party: "LP", candidate: "Olajide Adediran", votes: "" },
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
 * Production-ready helper:
 * lets any screen build a commencement context from partial data
 * while still falling back safely in development.
 */
export function buildCommencementContext(
  partial?: Partial<CommencementContext>
): CommencementContext {
  return {
    electionId: partial?.electionId?.trim() || DEV_COMMENCEMENT_CONTEXT.electionId,
    electionTitle:
      partial?.electionTitle?.trim() || DEV_COMMENCEMENT_CONTEXT.electionTitle,
    pollingUnitName:
      partial?.pollingUnitName?.trim() ||
      DEV_COMMENCEMENT_CONTEXT.pollingUnitName,
    pollingUnitCode:
      partial?.pollingUnitCode?.trim() ||
      DEV_COMMENCEMENT_CONTEXT.pollingUnitCode,
    ward: partial?.ward?.trim() || DEV_COMMENCEMENT_CONTEXT.ward,
    lga: partial?.lga?.trim() || DEV_COMMENCEMENT_CONTEXT.lga,
    state: partial?.state?.trim() || DEV_COMMENCEMENT_CONTEXT.state,
  };
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
    incidentType: "",
    description: "",
    incidentTime: "",
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

  if (REPORTING_DEV_CONFIG.forceInvalidResultSubmission) {
    return {
      valid: false,
      reason:
        "Under Section 60 of the Electoral Act 2022, a result sheet where the total of valid votes, rejected votes, and spoil ballots does not equal the number of accredited voters cannot be accepted as an official result.",
      totalValidVotes,
    };
  }

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