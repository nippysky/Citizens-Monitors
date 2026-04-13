// ─── src/data/pulse.ts ────────────────────────────────────────────────────────
// Pulse feed data: discussions, live elections, review reports.
// Swap dummy data for API responses — all consumers use these types.
// ─────────────────────────────────────────────────────────────────────────────

import { ReviewReportItem } from "@/data/collation";

/* ───── Types ───── */

export type PulseDiscussionPost = {
  id: string;
  author: string;
  avatarUri?: string;
  electionLabel: string;
  /** e.g. "Post Within Polling Unit" or election name */
  scopeLabel: string;
  body: string;
  imageUri?: string;
  minutesAgo: number;
  likes: number;
  commentCount: number;
  shares: number;
};

export type LiveElectionDiscussion = {
  id: string;
  status: "live" | "ended";
  electionTitle: string;
  /** e.g. "Presidential", "Senatorial", "House of Reps", "Gubernatorial", "Local Government" */
  electionType: string;
  activeDiscussions: number;
  /** Route to navigate to collation discussion tab */
  collationId: string;
};

export type PulseReviewReport = ReviewReportItem & {
  electionLabel: string;
};

/* ───── Dummy data ───── */

export const liveElectionDiscussions: LiveElectionDiscussion[] = [
  {
    id: "live-1",
    status: "live",
    electionTitle: "2026 Alimosho Local\nGovernment Election",
    electionType: "Local Government",
    activeDiscussions: 23,
    collationId: "alimosho-lg-2026",
  },
  {
    id: "live-2",
    status: "live",
    electionTitle: "2026 Lagos State\nGubernatorial Election",
    electionType: "Gubernatorial",
    activeDiscussions: 47,
    collationId: "lagos-gov-2026",
  },
];

export const pulseDiscussionPosts: PulseDiscussionPost[] = [
  {
    id: "pulse-1",
    author: "Yusuf J.",
    electionLabel: "Lagos State Governorship Election 2026",
    scopeLabel: "Post Within Polling Unit",
    body: "We need good water in our area. pls when voting, lets vote right",
    imageUri: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    minutesAgo: 2,
    likes: 14,
    commentCount: 12,
    shares: 3,
  },
  {
    id: "pulse-2",
    author: "@Iron Eagel",
    electionLabel: "Lagos State Governorship Election 2026",
    scopeLabel: "Post Within Polling Unit",
    body: "We have not have light since last year. how do you want us to vote!!",
    imageUri: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    minutesAgo: 2,
    likes: 14,
    commentCount: 12,
    shares: 3,
  },
  {
    id: "pulse-3",
    author: "Okafor J.",
    electionLabel: "Alimosho LGA Election 2026",
    scopeLabel: "Post Within My Ward",
    body: "We need good water in our area. pls when voting, lets vote right",
    imageUri: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
    minutesAgo: 3,
    likes: 14,
    commentCount: 12,
    shares: 3,
  },
  {
    id: "pulse-4",
    author: "@Viralman768",
    electionLabel: "Lagos State Governorship Election 2026",
    scopeLabel: "Post Within My Ward",
    body: "We need good water in our area. pls when voting, lets vote right",
    imageUri: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80",
    minutesAgo: 4,
    likes: 14,
    commentCount: 12,
    shares: 3,
  },
];

export const pulseReviewReports: PulseReviewReport[] = [
  {
    id: "pr-1",
    type: "result",
    title: "Result Report — EC8A",
    author: "@IronEagle23",
    createdAgo: "2 min ago",
    electionLabel: "Lagos State Governorship Election 2026",
    body: "Confirm what's accurate, and flag what's false. See evidence attached for your polling unit result.",
    reviewCount: 4,
  },
  {
    id: "pr-2",
    type: "incident",
    title: "Incident doing the Lagos State Governorship Election 2026",
    author: "Incident",
    createdAgo: "Feb 12, 2026 · 14:30 PM",
    tag: "VOTER INTIMIDATION",
    electionLabel: "Lagos State Governorship Election 2026",
    body: "Three men in black shirts arrived at the polling unit entrance and were turning away voters. INEC official told them to leave but they ignored. Police called and have since arrived. Situation calming.",
    reviewCount: 0,
  },
  {
    id: "pr-3",
    type: "incident",
    title: "Incident",
    author: "Incident",
    createdAgo: "Feb 12, 2026 · 14:30 PM",
    tag: "MISSING MATERIALS",
    electionLabel: "Lagos State Governorship Election 2026",
    body: "Result sheets (Form EC8A) not yet distributed to this polling unit as of 10am. INEC supervising officer informed. Voters waiting.",
    reviewCount: 0,
  },
  {
    id: "pr-4",
    type: "incident",
    title: "Incident",
    author: "Incident",
    createdAgo: "Feb 12, 2026 · 14:30 PM",
    tag: "MISSING MATERIALS",
    electionLabel: "Lagos State Governorship Election 2026",
    body: "Result sheets (Form EC8A) not yet distributed to this polling unit as of 10am. INEC supervising officer informed. Voters waiting.",
    reviewCount: 2,
    isConfirmed: true,
  },
];

/** Party results for the review collation result card */
export const pulsePartyResults = [
  { id: "apc", shortName: "APC", name: "All Progressives Congress", votes: 23450, percent: 65, color: "#E84C3D", logoKey: "APC" },
  { id: "lp", shortName: "LP", name: "Labour Party", votes: 23450, percent: 20, color: "#17A34A", logoKey: "LP" },
  { id: "pdp", shortName: "PDP", name: "People's Democratic Party", votes: 23450, percent: 10, color: "#3C63E5", logoKey: "PDP" },
  { id: "nnpp", shortName: "NNPP", name: "New Nigeria People's Party", votes: 23450, percent: 5, color: "#F29B2F", logoKey: "NNPP" },
  { id: "others", shortName: "OTHERS", name: "Other Parties", votes: 0, percent: 0, color: "#C8CDD7", logoKey: "OTHERS" },
];