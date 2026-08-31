// Pulse feed data: discussions, live elections, review reports.
// Swap dummy data for API responses — all consumers use these types.

import { ReviewReportItem } from "@/data/collation";

// Types

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

// Dummy data

/** Party results for the review collation result card */
