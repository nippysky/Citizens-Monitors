export type PartyResult = {
  id: string;
  name: string;
  shortName: string;
  votes: number;
  percent: number;
  color: string;
  logoKey: string;
};

export type SentimentLegendItem = {
  label: string;
  value: number;
  count: number;
  color: string;
};

export type GeoBreakdownItem = {
  id: string;
  name: string;
  reports: number;
  incidents: number;
  coveredUnits: number;
  totalUnits: number;
  totalVotes: number;
  parties: {
    shortName: string;
    percent: number;
    color: string;
  }[];
};

export type ReviewReportItem = {
  id: string;
  type: "result" | "incident";
  title: string;
  author: string;
  createdAgo: string;
  tag?: string;
  body: string;
  reviewCount: number;
  isConfirmed?: boolean;
  flagged?: boolean;
};

export type DiscussionItem = {
  id: string;
  author: string;
  body: string;
  minutesAgo: number;
  likes: number;
  commentCount: number;
  shares: number;
};

export type CollationItem = {
  id: string;
  status: "live" | "ended";
  electionTitle: string;
  electionDateLabel: string;
  progressPercent: number;
  coveredUnits: number;
  totalUnits: number;
  lastSyncLabel: string;
  fullTitle: string;
  location: string;
  dateRange: string;
  description: string;
  resultsUploaded: number;
  incidentsReported: number;
  observersCount: number;
  totalVotesLabel: string;
  canReviewReports: boolean;
  canJoinDiscussion: boolean;
  isAssignedToPollingUnit: boolean;
  parties: PartyResult[];
  officialSummary: {
    accreditedVoters: number;
    rejectedVotes: number;
    spoiledBallots: number;
    usedBallots: number;
    unusedBallots: number;
    aggregateVoters: string;
  };
  sentiment: {
    score: number;
    legend: SentimentLegendItem[];
    voteBuyingSubmitted: number;
    voteBuyingObserverSubmitted: number;
    intimidation: {
      total: number;
      occurred: number;
      notOccurred: number;
    };
    intimidationBarPercent: number;
  };
  geoBreakdown: GeoBreakdownItem[];
  reviewReports: ReviewReportItem[];
  discussions: DiscussionItem[];
};

export const collationDummyData: CollationItem[] = [
  {
    id: "alimosho-lg-2026",
    status: "live",
    electionTitle: "2026 Alimosho Local Government Election",
    electionDateLabel: "Live results from all elections · Nov 8, 2025",
    progressPercent: 43,
    coveredUnits: 248,
    totalUnits: 326,
    lastSyncLabel: "Feb 23, 2026 · 02:14 PM",
    fullTitle: "Alimosho Local Government Election 2026",
    location: "Lagos State, Alimosho District",
    dateRange: "Jun. 15th - Jun 16th, 2026",
    description:
      "See the vote result from 14 Polling Units in Alimosho reported by our observer.",
    resultsUploaded: 14,
    incidentsReported: 24,
    observersCount: 56,
    totalVotesLabel: "675690 Votes",
    canReviewReports: true,
    canJoinDiscussion: true,
    isAssignedToPollingUnit: true,
    parties: [
      {
        id: "apc",
        name: "All Progressives Congress",
        shortName: "APC",
        votes: 123450,
        percent: 65,
        color: "#E84C3D",
        logoKey: "APC",
      },
      {
        id: "lp",
        name: "Labour Party",
        shortName: "LP",
        votes: 62345,
        percent: 20,
        color: "#17A34A",
        logoKey: "LP",
      },
      {
        id: "pdp",
        name: "People's Democratic Party",
        shortName: "PDP",
        votes: 856,
        percent: 10,
        color: "#3C63E5",
        logoKey: "PDP",
      },
      {
        id: "nnpp",
        name: "New Nigeria People's Party",
        shortName: "NNPP",
        votes: 201,
        percent: 5,
        color: "#F29B2F",
        logoKey: "NNPP",
      },
      {
        id: "others",
        name: "Other Parties",
        shortName: "Other Parties",
        votes: 0,
        percent: 0,
        color: "#C8CDD7",
        logoKey: "OTHERS",
      },
    ],
    officialSummary: {
      accreditedVoters: 675435,
      rejectedVotes: 657,
      spoiledBallots: 320,
      usedBallots: 601,
      unusedBallots: 87,
      aggregateVoters: "8,570,298",
    },
    sentiment: {
      score: 63,
      legend: [
        {
          label: "Good",
          value: 64,
          count: 112,
          color: "#16B3AA",
        },
        {
          label: "Manageable",
          value: 20,
          count: 76,
          color: "#4377F0",
        },
        {
          label: "Poor",
          value: 6,
          count: 32,
          color: "#F04A1D",
        },
      ],
      voteBuyingSubmitted: 15,
      voteBuyingObserverSubmitted: 5,
      intimidation: {
        total: 20,
        occurred: 15,
        notOccurred: 5,
      },
      intimidationBarPercent: 75,
    },
    geoBreakdown: [
      {
        id: "alimosho-south",
        name: "ALIMOSHO SOUTH",
        reports: 45,
        incidents: 8,
        coveredUnits: 234,
        totalUnits: 279,
        totalVotes: 3206321,
        parties: [
          { shortName: "APC", percent: 53, color: "#16B3AA" },
          { shortName: "LP", percent: 42, color: "#F39B2F" },
          { shortName: "NNPP", percent: 12, color: "#3C63E5" },
          { shortName: "PDP", percent: 43, color: "#F04A1D" },
        ],
      },
      {
        id: "alimosho-north",
        name: "ALIMOSHO NORTH",
        reports: 45,
        incidents: 8,
        coveredUnits: 234,
        totalUnits: 279,
        totalVotes: 3206321,
        parties: [
          { shortName: "APC", percent: 53, color: "#16B3AA" },
          { shortName: "LP", percent: 42, color: "#F39B2F" },
          { shortName: "NNPP", percent: 12, color: "#3C63E5" },
          { shortName: "PDP", percent: 43, color: "#F04A1D" },
        ],
      },
      {
        id: "alimosho-west",
        name: "ALIMOSHO WEST",
        reports: 45,
        incidents: 8,
        coveredUnits: 234,
        totalUnits: 279,
        totalVotes: 3206321,
        parties: [
          { shortName: "APC", percent: 53, color: "#16B3AA" },
          { shortName: "LP", percent: 42, color: "#F39B2F" },
          { shortName: "NNPP", percent: 12, color: "#3C63E5" },
          { shortName: "PDP", percent: 43, color: "#F04A1D" },
        ],
      },
      {
        id: "alimosho-east",
        name: "ALIMOSHO EAST",
        reports: 45,
        incidents: 8,
        coveredUnits: 234,
        totalUnits: 279,
        totalVotes: 3206321,
        parties: [
          { shortName: "APC", percent: 53, color: "#16B3AA" },
          { shortName: "LP", percent: 42, color: "#F39B2F" },
          { shortName: "NNPP", percent: 12, color: "#3C63E5" },
          { shortName: "PDP", percent: 43, color: "#F04A1D" },
        ],
      },
    ],
    reviewReports: [
      {
        id: "report-1",
        type: "result",
        title: "Result Report — EC8A",
        author: "@IronEagle23",
        createdAgo: "2 min ago",
        body:
          "Confirm what's accurate, and flag what's false. See evidence attached for your polling unit result.",
        reviewCount: 4,
      },
      {
        id: "report-2",
        type: "incident",
        title: "Incident doing the Lagos State Governorship Election 2026",
        author: "Incident",
        createdAgo: "Feb 12, 2026 · 1:43 PM",
        tag: "VOTER INTIMIDATION",
        body:
          "Three men in black shirts arrived at the polling unit entrance and were turning away voters. INEC officials told them to leave but they ignored. Police called and few since arrived. Situation calming.",
        reviewCount: 0,
      },
      {
        id: "report-3",
        type: "incident",
        title: "Incident",
        author: "Incident",
        createdAgo: "Feb 12, 2026 · 1:43 PM",
        tag: "MISSING MATERIALS",
        body:
          "Result sheets (Form EC8A) not yet distributed to this polling unit as of 10am. INEC supervising officer informed. Voters waiting.",
        reviewCount: 0,
      },
      {
        id: "report-4",
        type: "incident",
        title: "Incident",
        author: "Incident",
        createdAgo: "Feb 12, 2026 · 1:43 PM",
        tag: "MISSING MATERIALS",
        body:
          "Result sheets (Form EC8A) not yet distributed to this polling unit as of 10am. INEC supervising officer informed. Voters waiting.",
        reviewCount: 2,
        isConfirmed: true,
      },
      {
        id: "report-5",
        type: "incident",
        title: "Incident",
        author: "Incident",
        createdAgo: "Feb 12, 2026 · 1:43 PM",
        tag: "MISSING MATERIALS",
        body:
          "Result sheets (Form EC8A) not yet distributed to this polling unit as of 10am. INEC supervising officer informed. Voters waiting.",
        reviewCount: 14,
        flagged: true,
      },
    ],
    discussions: [
      {
        id: "discussion-1",
        author: "@IronEagle23",
        body:
          "Here is the latest verified election result from Alimosho Ward 4. The process was peaceful and orderly throughout the morning.",
        minutesAgo: 2,
        likes: 14,
        commentCount: 12,
        shares: 3,
      },
      {
        id: "discussion-2",
        author: "@SilverKing65",
        body:
          "Here is the latest verified election result from Alimosho Ward 4. The process was peaceful and orderly throughout the morning.",
        minutesAgo: 2,
        likes: 14,
        commentCount: 12,
        shares: 3,
      },
      {
        id: "discussion-3",
        author: "@Fishtank89",
        body:
          "Here is the latest verified election result from Alimosho Ward 4. The process was peaceful and orderly throughout the morning.",
        minutesAgo: 2,
        likes: 14,
        commentCount: 12,
        shares: 3,
      },
    ],
  },

  {
    id: "alimosho-lg-public",
    status: "live",
    electionTitle: "2026 Alimosho Local Government Election",
    electionDateLabel: "Live results from all elections · Nov 8, 2025",
    progressPercent: 0,
    coveredUnits: 0,
    totalUnits: 326,
    lastSyncLabel: "Feb 23, 2026 · 02:14 PM",
    fullTitle: "Alimosho Local Government Election 2026",
    location: "Lagos State, Alimosho District",
    dateRange: "Jun. 15th - Jun 16th, 2026",
    description:
      "See the vote result from 14 Polling Units in Alimosho reported by our observer.",
    resultsUploaded: 0,
    incidentsReported: 0,
    observersCount: 56,
    totalVotesLabel: "Votes",
    canReviewReports: false,
    canJoinDiscussion: false,
    isAssignedToPollingUnit: false,
    parties: [
      {
        id: "apc-2",
        name: "All Progressives Congress",
        shortName: "APC",
        votes: 123450,
        percent: 65,
        color: "#E84C3D",
        logoKey: "APC",
      },
      {
        id: "lp-2",
        name: "Labour Party",
        shortName: "LP",
        votes: 62345,
        percent: 20,
        color: "#17A34A",
        logoKey: "LP",
      },
      {
        id: "pdp-2",
        name: "People's Democratic Party",
        shortName: "PDP",
        votes: 856,
        percent: 10,
        color: "#3C63E5",
        logoKey: "PDP",
      },
      {
        id: "nnpp-2",
        name: "New Nigeria People's Party",
        shortName: "NNPP",
        votes: 201,
        percent: 5,
        color: "#F29B2F",
        logoKey: "NNPP",
      },
      {
        id: "others-2",
        name: "Other Parties",
        shortName: "Other Parties",
        votes: 0,
        percent: 0,
        color: "#C8CDD7",
        logoKey: "OTHERS",
      },
    ],
    officialSummary: {
      accreditedVoters: 675435,
      rejectedVotes: 657,
      spoiledBallots: 320,
      usedBallots: 601,
      unusedBallots: 87,
      aggregateVoters: "Not recorded yet",
    },
    sentiment: {
      score: 100,
      legend: [
        {
          label: "Good",
          value: 100,
          count: 1,
          color: "#4377F0",
        },
      ],
      voteBuyingSubmitted: 0,
      voteBuyingObserverSubmitted: 1,
      intimidation: {
        total: 15,
        occurred: 15,
        notOccurred: 0,
      },
      intimidationBarPercent: 100,
    },
    geoBreakdown: [],
    reviewReports: [],
    discussions: [],
  },
];

export function getCollationNotificationText(item: CollationItem) {
  if (item.isAssignedToPollingUnit) {
    return `${item.fullTitle} is Live! Submit result & incident reports as our observer.`;
  }

  return `${item.fullTitle} is Live! Join public collation updates and follow reports.`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}