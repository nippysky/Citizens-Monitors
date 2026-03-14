export type UserRole = "observer" | "volunteer" | "public-viewer";

export type CalendarDayItem = {
  key: string;
  date: Date;
  weekdayShort: string;
  dayNumber: string;
  monthLabel: string;
};

export type ElectionCardItem = {
  id: string;
  title: string;
  location: string;
  time: string;
  ctaLabel: string;
  illustration: "observer" | "volunteer" | "public-viewer";
  live: boolean;
};

export type NotificationItem = {
  id: string;
  title: string;
  source: string;
  pollingUnit: string;
  timeAgo: string;
};

export type InfoBannerItem =
  | {
      id: string;
      type: "waitlist";
      title: string;
      subtitle: string;
      cta: string;
      illustration: "observer";
    }
  | {
      id: string;
      type: "tip";
      title: string;
      subtitle: string;
      cta: string;
      illustration: "observer" | "volunteer";
    };

export type HomeDayContent = {
  dateKey: string;
  hasElection: boolean;
  quietDay?: {
    title: string;
    subtitle: string;
  };
  electionCards: ElectionCardItem[];
  banners: InfoBannerItem[];
  notifications: NotificationItem[];
};