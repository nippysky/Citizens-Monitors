import {
    CalendarDayItem,
    ElectionCardItem,
    HomeDayContent,
    InfoBannerItem,
    UserRole,
} from "@/types/home";

function formatKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function weekdayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function monthLabel(date: Date): string {
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
      monthLabel: monthLabel(date),
    };
  });
}

export const mockRole: UserRole = "volunteer";

function getElectionCtaLabel(role: UserRole): string {
  return role === "public-viewer" ? "View Report" : "Monitor Election";
}

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

const seedDate = new Date(2026, 1, 14);
const fullKey = formatKey(seedDate);

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
        ctaLabel: getElectionCtaLabel(mockRole),
        illustration: getElectionIllustration(mockRole),
        live: true,
      },
      {
        id: "election-2",
        title: "Ikeja Ward Chairmanship Election 2026",
        location: "Lagos State, Ikeja District",
        time: "9:00 AM - 3:00 PM (GMT+1)",
        ctaLabel: getElectionCtaLabel(mockRole),
        illustration: "observer",
        live: true,
      },
    ],
    banners: getHomeBanners(mockRole),
    notifications: [
      {
        id: "n1",
        title: "New result uploaded for Awka south .",
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
      {
        id: "n3",
        title: "Polling station opened at 8:05 AM. B..",
        source: "From Observer",
        pollingUnit: "PU 024, Ikeja",
        timeAgo: "2 mins ago",
      },
      {
        id: "n4",
        title: "Polling station opened at 8:05 AM. B..",
        source: "From Observer",
        pollingUnit: "PU 024, Alimosho",
        timeAgo: "2 mins ago",
      },
    ],
  },

  [formatKey(previousQuiet)]: {
    dateKey: formatKey(previousQuiet),
    hasElection: false,
    quietDay: {
      title: "QUIET DAY!",
      subtitle: "No voting events happening today.",
    },
    electionCards: [],
    banners: [
      {
        id: "waitlist-1",
        type: "waitlist",
        title: "Observer Registration",
        subtitle: "Join the waitlist for 2027",
        cta: "Join Now",
        illustration: "observer",
      },
    ],
    notifications: [],
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
  },
};

export const defaultHomeDate = seedDate;