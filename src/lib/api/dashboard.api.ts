import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiRequest } from "@/lib/api/http";

export type DashboardElectionStatus = "live" | "upcoming" | "ended" | string;

export type DashboardLiveElection = {
  id: string;
  electionName: string;
  electionType: string;
  electionLocation: string | null;
  startDate: string;
  endDate: string;
  mockElection: boolean;
  partiesCount: number;
  status: DashboardElectionStatus;
};

export type DashboardElectionUpdate = {
  id: string;
  type: "incident-upload" | "result-upload" | string;
  title: string;
  info: string;
  timeAgo: string;
  createdAt: string;
  activeElectionId?: string;
  electionId?: string;
};

export type DashboardSocialUpdate = {
  id: string;
  source: "pulse" | "collation-discussion" | string;
  activeElectionId?: string;
  body: string;
  imageUrl?: string | null;
  likesCount: number;
  commentsCount: number;
  authorName: string;
  timeAgo: string;
  createdAt: string;
};

export type DashboardNewsItem = {
  id: string;
  title?: string;
  headline?: string;
  body?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  date?: string;
  createdAt?: string;
  publishedAt?: string;
};

export type DashboardResponse = {
  liveElections: DashboardLiveElection[];
  electionUpdates: DashboardElectionUpdate[];
  collationUpdates: DashboardSocialUpdate[];
  pulseAndDiscourse: DashboardSocialUpdate[];
  reportThreadUpdates: DashboardSocialUpdate[];
  latestNewsAndInsights: DashboardNewsItem[];
};

const DASHBOARD_CACHE_KEY = "@citizen_monitors/dashboard_cache/v1";

function normalizeDashboardResponse(response: Partial<DashboardResponse>): DashboardResponse {
  return {
    liveElections: Array.isArray(response.liveElections)
      ? response.liveElections
      : [],
    electionUpdates: Array.isArray(response.electionUpdates)
      ? response.electionUpdates
      : [],
    collationUpdates: Array.isArray(response.collationUpdates)
      ? response.collationUpdates
      : [],
    pulseAndDiscourse: Array.isArray(response.pulseAndDiscourse)
      ? response.pulseAndDiscourse
      : [],
    reportThreadUpdates: Array.isArray(response.reportThreadUpdates)
      ? response.reportThreadUpdates
      : [],
    latestNewsAndInsights: Array.isArray(response.latestNewsAndInsights)
      ? response.latestNewsAndInsights
      : [],
  };
}

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await apiRequest<DashboardResponse>("/dashboard", {
    method: "GET",
  });

  return normalizeDashboardResponse(response);
}

export async function cacheDashboard(data: DashboardResponse): Promise<void> {
  try {
    await AsyncStorage.setItem(
      DASHBOARD_CACHE_KEY,
      JSON.stringify({
        cachedAt: Date.now(),
        data,
      })
    );
  } catch {
    // best effort cache
  }
}

export async function readCachedDashboard(): Promise<DashboardResponse | null> {
  try {
    const raw = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      cachedAt?: number;
      data?: Partial<DashboardResponse>;
    };

    if (!parsed.data) return null;

    return normalizeDashboardResponse(parsed.data);
  } catch {
    return null;
  }
}