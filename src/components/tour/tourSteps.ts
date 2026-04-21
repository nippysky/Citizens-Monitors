import { Paths } from "@/constants/paths";

export type StepPadding =
  | number
  | { top: number; bottom: number; horizontal: number };

export type TourStep = {
  id: string;
  targetId: string;
  route: string;
  title: string;
  description: string;
  placement?: "above" | "below" | "auto";
  highlightPadding?: StepPadding;
  highlightRadius?: number;
  /** When set, the tooltip arrow points at the center of this tab index (0–4). */
  arrowAtTab?: 0 | 1 | 2 | 3 | 4;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "home.calendar",
    targetId: "home.calendar-strip",
    route: Paths.appHome,
    title: "Tap to switch date",
    description:
      "Tap any date to view elections happening that day. Use the calendar to explore all events.",
    placement: "below",
    highlightPadding: { top: 6, bottom: 6, horizontal: 8 },
    highlightRadius: 18,
  },
  {
    id: "tabbar.elections",
    targetId: "app.tabbar",
    route: Paths.appElections,
    title: "The Election Calendar",
    description:
      "Stay ahead of upcoming elections. View dates at a glance and plan when to monitor.",
    placement: "above",
    // Negative top inset cancels out the BottomTabBar's internal layout overhang.
    highlightPadding: { top: -8, bottom: 0, horizontal: 0 },
    highlightRadius: 24,
    arrowAtTab: 1,
  },
  {
    id: "elections.first-card",
    targetId: "elections.first-card",
    route: Paths.appElections,
    title: "Browse All Elections",
    description:
      "See live, upcoming, and completed elections in one place. Track what matters to you.",
    placement: "below",
    highlightPadding: { top: 4, bottom: 4, horizontal: 6 },
    highlightRadius: 18,
  },
  {
    id: "tabbar.collation",
    targetId: "app.tabbar",
    route: Paths.appCollation,
    title: "Follow Live Elections",
    description:
      "View live collation data from polling units and wards as results are submitted.",
    placement: "above",
    highlightPadding: { top: -8, bottom: 0, horizontal: 0 },
    highlightRadius: 24,
    arrowAtTab: 2,
  },
  {
    id: "tabbar.pulse",
    targetId: "app.tabbar",
    route: Paths.appPulse,
    title: "Stay Informed Instantly",
    description:
      "Get alerts on important updates, incidents, and announcements.",
    placement: "above",
    highlightPadding: { top: -8, bottom: 0, horizontal: 0 },
    highlightRadius: 24,
    arrowAtTab: 3,
  },
  {
    id: "tabbar.me",
    targetId: "app.tabbar",
    route: Paths.appMe,
    title: "Your Profile",
    description:
      "Manage your profile details, notifications, support, and security here.",
    placement: "above",
    highlightPadding: { top: -8, bottom: 0, horizontal: 0 },
    highlightRadius: 24,
    arrowAtTab: 4,
  },
  {
    id: "me.complete",
    targetId: "me.my-account",
    route: Paths.appMe,
    title: "Complete Your Profile",
    description:
      "Set up your profile, verify your account, and access your polling unit details.",
    placement: "below",
    highlightPadding: { top: 4, bottom: 6, horizontal: 8 },
    highlightRadius: 18,
  },
];