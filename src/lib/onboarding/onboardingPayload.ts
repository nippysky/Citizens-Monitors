import { SubmitDetailsPayload } from "@/lib/api/auth.api";
import { OnboardingDraft } from "@/types/onboarding";

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function yesNoToBoolean(value: string): boolean {
  return value.trim().toLowerCase() === "yes";
}

export function formatBirthdayForApi(birthday: string): string {
  const clean = birthday.trim();

  /**
   * UI value currently looks like: "1 January, 2000"
   * API expects: "2000-01-01"
   */
  const match = clean.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/);

  if (!match) {
    return clean;
  }

  const [, rawDay, rawMonth, rawYear] = match;
  const month = MONTHS[rawMonth.toLowerCase()];

  if (!month) {
    return clean;
  }

  const day = rawDay.padStart(2, "0");

  return `${rawYear}-${month}-${day}`;
}

export function buildWhyYouJoinUs(draft: OnboardingDraft): string {
  const reasons = draft.stepThree.joinReasons;

  if (reasons.length === 0) {
    return "To support transparent elections";
  }

  return reasons.join(", ");
}

export function buildSubmitDetailsPayload(
  email: string,
  draft: OnboardingDraft
): SubmitDetailsPayload {
  return {
    email: normalizeEmail(email),
    firstName: draft.stepOne.firstName,
    lastName: draft.stepOne.lastName,
    gender: draft.stepOne.gender,
    dateOfBirth: formatBirthdayForApi(draft.stepOne.birthday),
    state: draft.stepFour.pollingState,
    lga: draft.stepFour.localGovernmentArea,
    ward: draft.stepFour.ward,
    pollingUnit: draft.stepFour.pollingUnit,
    nationality: draft.stepOne.nationality,
    whyYouJoinUs: buildWhyYouJoinUs(draft),
    isRegisteredVoter: yesNoToBoolean(draft.stepThree.registeredVoter),
    isPoliticalPartyMember: draft.stepThree.partyAffiliation,
    isElectionWitnessReady: yesNoToBoolean(draft.stepThree.willingToTestify),
    isOpenToSurvey: yesNoToBoolean(draft.stepThree.interestedInSurveys),
  };
}

export function buildSubmitDetailsFingerprint(
  email: string,
  draft: OnboardingDraft
): string {
  return JSON.stringify(buildSubmitDetailsPayload(email, draft));
}