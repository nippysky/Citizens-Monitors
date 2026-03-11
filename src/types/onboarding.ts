export type Gender = "Male" | "Female" | "";

export type CitizenType = "observer" | "volunteer" | "public-viewer" | "";

export type YesNo = "Yes" | "No" | "";
export type VoterStatus = "Yes" | "No" | "In Progress" | "";
export type MonitoringExperience = "First time" | "1-5 year" | "10 yr above" | "";

export type JoinReason =
  | "Civic duty"
  | "Fight corruption"
  | "Community service"
  | "Support democracy"
  | "Personal interest"
  | "Academic research";

export type StepOneForm = {
  firstName: string;
  lastName: string;
  birthday: string;
  gender: Gender;
  nationality: string;
  cityCountry: string;
};

export type BirthdayValue = {
  day: number;
  month: string;
  year: number;
  formatted: string;
};

export type StepThreeForm = {
  registeredVoter: VoterStatus;
  firstElection: YesNo;
  monitoringExperience: MonitoringExperience;
  partyAffiliation: boolean;
  partyName: string;
  willingToTestify: YesNo;
  interestedInSurveys: YesNo;
  joinReasons: JoinReason[];
};

export type StepFourForm = {
  pollingState: string;
  localGovernmentArea: string;
  ward: string;
  pollingUnit: string;
};

export type OnboardingDraft = {
  stepOne: StepOneForm;
  citizenType: CitizenType;
  stepThree: StepThreeForm;
  stepFour: StepFourForm;
};