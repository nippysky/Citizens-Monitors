export type UserRole = "observer" | "volunteer" | "public-viewer";

export type CalendarDayItem = {
  key: string;
  date: Date;
  weekdayShort: string;
  dayNumber: string;
  monthLabel: string;
};

export type ElectionType =
  | "presidential"
  | "national"
  | "senatorial"
  | "senate"
  | "house-of-reps"
  | "house-of-representatives"
  | "house-of-assembly"
  | "gubernatorial"
  | "local-government"
  | "other";

export type ElectionCardItem = {
  id: string;
  title: string;
  location: string;
  time: string;
  ctaLabel: string;
  illustration: "observer" | "volunteer" | "public-viewer";
  live: boolean;
  electionType: ElectionType;
  pollingUnitsRecorded: number;
  totalPollingUnits: number;
  partiesCount?: number;
  status?: string;
  activeElectionId?: string;
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

export type ElectionUpdateItem = {
  id: string;
  collationId: string;
  tag: "RESULT" | "INCIDENT";
  title: string;
  info?: string;
  timeAgo: string;
};

export type DiscussionItem = {
  id: string;
  source?: string;
  collationId?: string;
  timeAgo: string;
  title: string;
  author: string;
  pollingUnit: string;
  imageUrl?: string;
  likesCount?: number;
  commentsCount?: number;
};

export type NewsItem = {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
};

export type VoterEssentialItem = {
  id: string;
  label: string;
  icon: string;
  route: string;
};

export type ToastType =
  | "network-offline"
  | "network-online"
  | "live-election"
  | "info"
  | "success"
  | "error";

export type ToastData = {
  id: string;
  type: ToastType;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionRoute?: string;
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
  electionUpdates: ElectionUpdateItem[];
  discussions: DiscussionItem[];
  news: NewsItem[];
};