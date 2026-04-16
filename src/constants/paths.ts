// ─── src/constants/paths.ts ───────────────────────────────────────────────────

export const Paths = {
  welcome: "/(public)/welcome",
  signIn: "/(public)/sign-in",
  signUp: "/(public)/sign-up",
  resetPassword: "/(public)/reset-password",
  setPassword: "/(public)/set-password",
  verifyEmail: "/(public)/verify-email",
  onboarding: "/(public)/onboarding",

  appHome: "/(app)/(tabs)/home",
  appElections: "/(app)/(tabs)/elections",
  appCollation: "/(app)/(tabs)/collation",
  appPulse: "/(app)/(tabs)/pulse",
  appMe: "/(app)/(tabs)/me",
  appNotifications: "/(app)/notifications",
  appMyReports: "/(app)/my-reports",
  appArchiveReports: "/(app)/archive-reports",
  appElectionCalendar: "/(app)/elections-calendar",
  appLearningFeed: "/(app)/learning-feed",
  appSubmitReport: "/(app)/submit-report",

  appNotificationDetails: (id: string) =>
    ({
      pathname: "/(app)/notification/[id]" as const,
      params: { id },
    }),

  submitElectionReport: "/(app)/reporting/submit-election-report",
  reportIncident: "/(app)/reporting/report-incident",
  reportIncidentLive: "/(app)/reporting/report-incident-live",

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

  learningFeedDetails: (id: string) =>
    ({
      pathname: "/(app)/learning-feed" as const,
      params: { id },
    }),
} as const;