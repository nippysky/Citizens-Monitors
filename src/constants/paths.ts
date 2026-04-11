export const Paths = {
  welcome: "/(public)/welcome",
  signIn: "/(public)/sign-in",
  signUp: "/(public)/sign-up",
  setPassword: "/(public)/set-password",
  verifyEmail: "/(public)/verify-email",
  onboarding: "/(public)/onboarding",

  appHome: "/(app)/(tabs)/home",
  appElections: "/(app)/(tabs)/elections",
  appCollation: "/(app)/(tabs)/collation",
  appPulse: "/(app)/(tabs)/pulse",
  appMe: "/(app)/(tabs)/me",
  appProfile: "/(app)/(tabs)/profile",
  appNotifications: "/(app)/notifications",
  appMyReports: "/(app)/my-reports",
  appElectionCalendar: "/(app)/elections-calendar",

  // Voter essentials
  voterCitizenAcademy: "/(app)/voter-essentials/CitizenAcademy",
  voterDigitalElectionVault: "/(app)/voter-essentials/DigitalElectionVault",
  voterDonateSupport: "/(app)/voter-essentials/DonateSupport",
  voterElectionDayProcedure: "/(app)/voter-essentials/ElectionDayProcedure",
  voterNewsAndInsights: "/(app)/voter-essentials/NewsAndInsights",
  voterPollingUnitLocator: "/(app)/voter-essentials/PollingUnitLocator",
  voterPollStationConduct: "/(app)/voter-essentials/PollStationConduct",
  voterPressCoverage: "/(app)/voter-essentials/PressCoverage",
  voterVoterRegistration: "/(app)/voter-essentials/VoterRegistration",
  voterRegistrationGuide: "/(app)/voter-essentials/RegistrationGuide",
  voterUnderstandingTiers: "/(app)/voter-essentials/UnderstandingTiers",

  electionDetails: (id: string) =>
    ({
      pathname: "/(app)/election/[id]" as const,
      params: { id },
    }),

  newsDetails: (id: string) =>
    ({
      pathname: "/(app)/news/[id]" as const,
      params: { id },
    }),
} as const;