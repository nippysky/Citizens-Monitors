export const Paths = {
  welcome: "/(public)/welcome",
  signIn: "/(public)/sign-in",
  signUp: "/(public)/sign-up",
  setPassword: "/(public)/set-password",
  verifyEmail: "/(public)/verify-email",
  onboarding: "/(public)/onboarding",

  appHome: "/(app)/(tabs)/home",
  appElections: "/(app)/(tabs)/elections",
  appLive: "/(app)/(tabs)/collation",
  appAlerts: "/(app)/(tabs)/alerts",
  appMe: "/(app)/(tabs)/me",
  appProfile: "/(app)/(tabs)/profile",
  appNotifications: "/(app)/notifications",
  appMyReports: "/(app)/my-reports",
  appElectionCalendar: "/(app)/elections-calendar",

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