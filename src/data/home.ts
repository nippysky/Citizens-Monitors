import { Paths } from "@/constants/paths";
import {
  CalendarDayItem,
  DiscussionItem,
  ElectionCardItem,
  ElectionUpdateItem,
  HomeDayContent,
  InfoBannerItem,
  NewsItem,
  UserRole,
  VoterEssentialItem,
} from "@/types/home";

function formatKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function weekdayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function monthLabelFn(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function buildFiveDayWindow(centerDate: Date): CalendarDayItem[] {
  return [-2, -1, 0, 1, 2].map((offset) => {
    const date = new Date(centerDate);
    date.setDate(centerDate.getDate() + offset);

    return {
      key: formatKey(date),
      date,
      weekdayShort: weekdayShort(date),
      dayNumber: String(date.getDate()),
      monthLabel: monthLabelFn(date),
    };
  });
}

export const mockRole: UserRole = "observer";

function getElectionIllustration(
  role: UserRole
): ElectionCardItem["illustration"] {
  if (role === "observer") return "observer";
  if (role === "public-viewer") return "public-viewer";
  return "volunteer";
}

function getHomeBanners(role: UserRole): InfoBannerItem[] {
  if (role === "observer") {
    return [
      {
        id: "tip-observer",
        type: "tip",
        title:
          "Your real-time report helps ensure a fair election process for everyone.",
        subtitle: "Report incident at your PU",
        cta: "Report Incident at your PU",
        illustration: "observer",
      },
    ];
  }

  if (role === "volunteer") {
    return [
      {
        id: "waitlist",
        type: "waitlist",
        title: "Observer Registration",
        subtitle: "Join the waitlist for 2027",
        cta: "Join Now",
        illustration: "observer",
      },
    ];
  }

  return [];
}

// ── Election Updates (shared across all days with elections) ──
const mockElectionUpdates: ElectionUpdateItem[] = [
  {
    id: "eu-1",
    tag: "RESULT",
    title: "Lagos Island results have been submitted",
    timeAgo: "2 mins ago",
  },
  {
    id: "eu-2",
    tag: "INCIDENT",
    title: "Report: Ballot box snatching attempt 03 by unknown individuals",
    timeAgo: "2 mins ago",
  },
  {
    id: "eu-3",
    tag: "RESULT",
    title: "Ikeja Ward 4 preliminary results uploaded",
    timeAgo: "5 mins ago",
  },
  {
    id: "eu-4",
    tag: "INCIDENT",
    title: "Voting machine malfunction reported at PU 012",
    timeAgo: "8 mins ago",
  },
];

// ── Discussion Room ──
const mockDiscussions: DiscussionItem[] = [
  {
    id: "d-1",
    timeAgo: "2 mins ago",
    title: "Ballot stuffing happening now at our polling unit",
    author: "BoldTouch88",
    pollingUnit: "PU 024, Alimosho",
  },
  {
    id: "d-2",
    timeAgo: "30 mins ago",
    title: "Voter intimidation happening now at our polling unit",
    author: "IronEagle99",
    pollingUnit: "PU 024, Alimosho",
  },
  {
    id: "d-3",
    timeAgo: "1 hr ago",
    title: "INEC officials arrived late at several units in Surulere",
    author: "CivicWatch01",
    pollingUnit: "PU 008, Surulere",
  },
];

// ── Latest News ──
const mockNews: NewsItem[] = [
  {
    id: "news-1",
    title: "Young Nigerians' push for change must go beyond street..",
    date: "02/02/2026",
  },
  {
    id: "news-2",
    title: "Kano by-election: APC sweeps assembly seats",
    date: "02/02/2026",
  },
  {
    id: "news-3",
    title: "El-Rufai vs Nuhu Ribadu: Tinubu's secret opinion poll",
    date: "02/02/2026",
  },
];

// ── Voter Essentials ──
export const allVoterEssentials: VoterEssentialItem[] = [
  {
    id: "ve-1",
    label: "Citizen Academy",
    icon: "CitizenAcademy",
    route: Paths.voterCitizenAcademy,
  },
  {
    id: "ve-2",
    label: "Digital Election Vault",
    icon: "DigitalElectionVault",
    route: Paths.voterDigitalElectionVault,
  },
  {
    id: "ve-3",
    label: "News & Insights",
    icon: "NewsAndInsights",
    route: Paths.voterNewsAndInsights,
  },
  {
    id: "ve-4",
    label: "Donate to Support",
    icon: "DonateSupport",
    route: Paths.voterDonateSupport,
  },
  {
    id: "ve-5",
    label: "Press Coverage",
    icon: "PressCoverage",
    route: Paths.voterPressCoverage,
  },
  {
    id: "ve-6",
    label: "Polling Unit Locator",
    icon: "PollingUnitLocator",
    route: Paths.voterPollingUnitLocator,
  },
  {
    id: "ve-7",
    label: "Registration Guide 101",
    icon: "VoterRegistration",
    route: Paths.voterRegistrationGuide,
  },
  {
    id: "ve-8",
    label: "Poll Station Conduct",
    icon: "PollStationConduct",
    route: Paths.voterPollStationConduct,
  },
  {
    id: "ve-9",
    label: "Voter Registration",
    icon: "VoterRegistration",
    route: Paths.voterVoterRegistration,
  },
  {
    id: "ve-10",
    label: "Election Day Procedure",
    icon: "ElectionDayProcedure",
    route: Paths.voterElectionDayProcedure,
  },
  {
    id: "ve-11",
    label: "Understanding Tiers",
    icon: "PollStationConduct",
    route: Paths.voterUnderstandingTiers,
  },
];

/** Returns 6 random voter essentials (shuffled each render) */
export function getRandomVoterEssentials(): VoterEssentialItem[] {
  const shuffled = [...allVoterEssentials].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}

// ── Seed dates ──
const seedDate = new Date(2026, 10, 14); // Nov 14, 2026
const fullKey = formatKey(seedDate);

const previousDay = new Date(seedDate);
previousDay.setDate(seedDate.getDate() - 1);

const previousQuiet = new Date(seedDate);
previousQuiet.setDate(seedDate.getDate() - 2);

const nextQuiet = new Date(seedDate);
nextQuiet.setDate(seedDate.getDate() + 1);

const anotherQuiet = new Date(seedDate);
anotherQuiet.setDate(seedDate.getDate() + 2);

export const homeContentByDate: Record<string, HomeDayContent> = {
  [fullKey]: {
    dateKey: fullKey,
    hasElection: true,
    electionCards: [
      {
        id: "election-1",
        title: "Alimosho Local Government Election 2026",
        location: "Lagos State, Alimosho District",
        time: "8:00 AM - 4:00 PM (GMT+1)",
        ctaLabel: "Collation",
        illustration: getElectionIllustration(mockRole),
        live: true,
        electionType: "local-government",
        pollingUnitsRecorded: 234,
        totalPollingUnits: 452,
      },
      {
        id: "election-2",
        title: "Ikeja Ward Chairmanship Election 2026",
        location: "Lagos State, Ikeja District",
        time: "9:00 AM - 3:00 PM (GMT+1)",
        ctaLabel: "Collation",
        illustration: "observer",
        live: true,
        electionType: "local-government",
        pollingUnitsRecorded: 120,
        totalPollingUnits: 310,
      },
      {
        id: "election-3",
        title: "Surulere Local Government Election 2026",
        location: "Lagos State, Surulere District",
        time: "8:30 AM - 4:00 PM (GMT+1)",
        ctaLabel: "Collation",
        illustration: "volunteer",
        live: true,
        electionType: "local-government",
        pollingUnitsRecorded: 88,
        totalPollingUnits: 200,
      },
    ],
    banners: getHomeBanners(mockRole),
    notifications: [
      {
        id: "n1",
        title: "New result uploaded for Awka south.",
        source: "From Observer",
        pollingUnit: "PU 024, Alimosho",
        timeAgo: "2 mins ago",
      },
      {
        id: "n2",
        title: "Sensitive ballot boxes have been br..",
        source: "From Volunteer",
        pollingUnit: "PU 024, Ikeja",
        timeAgo: "2 mins ago",
      },
    ],
    electionUpdates: mockElectionUpdates,
    discussions: mockDiscussions,
    news: mockNews,
  },

  [formatKey(previousDay)]: {
    dateKey: formatKey(previousDay),
    hasElection: false,
    quietDay: {
      title: "QUIET DAY!",
      subtitle: "No voting events happening today.",
    },
    electionCards: [],
    banners: [],
    notifications: [],
    electionUpdates: mockElectionUpdates,
    discussions: mockDiscussions,
    news: mockNews,
  },

  [formatKey(previousQuiet)]: {
    dateKey: formatKey(previousQuiet),
    hasElection: false,
    quietDay: {
      title: "QUIET DAY!",
      subtitle: "No voting events happening today.",
    },
    electionCards: [],
    banners: [],
    notifications: [],
    electionUpdates: mockElectionUpdates,
    discussions: mockDiscussions,
    news: mockNews,
  },

  [formatKey(nextQuiet)]: {
    dateKey: formatKey(nextQuiet),
    hasElection: false,
    quietDay: {
      title: "QUIET DAY!",
      subtitle: "No voting events happening today.",
    },
    electionCards: [],
    banners: [],
    notifications: [],
    electionUpdates: mockElectionUpdates,
    discussions: mockDiscussions,
    news: mockNews,
  },

  [formatKey(anotherQuiet)]: {
    dateKey: formatKey(anotherQuiet),
    hasElection: false,
    quietDay: {
      title: "QUIET DAY!",
      subtitle: "No voting events happening today.",
    },
    electionCards: [],
    banners: [],
    notifications: [],
    electionUpdates: mockElectionUpdates,
    discussions: mockDiscussions,
    news: mockNews,
  },
};

export const defaultHomeDate = seedDate;