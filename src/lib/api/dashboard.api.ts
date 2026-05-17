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
  slug?: string;
  title?: string;
  headline?: string;
  body?: string;
  summary?: string;
  excerpt?: string;

  imageUrl?: string | null;
  imageURL?: string | null;

  thumbnailUrl?: string | null;
  thumbnailURL?: string | null;
  thumbnailURLUrl?: string | null;

  heroImageUrl?: string | null;
  heroImageURL?: string | null;

  date?: string;
  createdAt?: string;
  publishedAt?: string;
  updatedAt?: string;
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

function normalizeDashboardResponse(
  response?: Partial<DashboardResponse> | null
): DashboardResponse {
  return {
    liveElections: asArray<DashboardLiveElection>(response?.liveElections),
    electionUpdates: asArray<DashboardElectionUpdate>(response?.electionUpdates),
    collationUpdates: asArray<DashboardSocialUpdate>(response?.collationUpdates),
    pulseAndDiscourse: asArray<DashboardSocialUpdate>(
      response?.pulseAndDiscourse
    ),
    reportThreadUpdates: asArray<DashboardSocialUpdate>(
      response?.reportThreadUpdates
    ),
    latestNewsAndInsights: asArray<unknown>(
      response?.latestNewsAndInsights
    ).map(normalizeDashboardNewsItem),
  };
}

function normalizeDashboardNewsItem(
  rawValue: unknown,
  index: number
): DashboardNewsItem {
  const raw = isObject(rawValue)
    ? (rawValue as Partial<DashboardNewsItem> & Record<string, unknown>)
    : {};

  const id = firstNonEmptyString(
    raw.id,
    raw._id,
    raw.slug,
    `dashboard-news-${index + 1}`
  );

  const slug = firstNonEmptyString(raw.slug, id);

  const title = firstNonEmptyString(
    raw.title,
    raw.headline,
    raw.summary,
    raw.excerpt,
    raw.body,
    "News update"
  );

  const imageUrl = firstNullableString(
    raw.imageUrl,
    raw.imageURL,
    raw.thumbnailUrl,
    raw.thumbnailURLUrl,
    raw.thumbnailURL,
    raw.heroImageUrl,
    raw.heroImageURL
  );

  const publishedAt = firstNonEmptyString(
    raw.publishedAt,
    raw.date,
    raw.createdAt,
    raw.updatedAt
  );

  return {
    ...raw,
    id,
    slug,
    title,
    imageUrl,
    thumbnailUrl: firstNullableString(raw.thumbnailUrl, imageUrl),
    thumbnailURLUrl: firstNullableString(raw.thumbnailURLUrl, imageUrl),
    heroImageUrl: firstNullableString(raw.heroImageUrl, raw.heroImageURL),
    date: firstNonEmptyString(raw.date, publishedAt),
    publishedAt,
    createdAt: firstNonEmptyString(raw.createdAt, publishedAt),
    updatedAt: firstNonEmptyString(raw.updatedAt),
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
        data: normalizeDashboardResponse(data),
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

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function firstNonEmptyString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (trimmed.length > 0) {
        return trimmed;
      }
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function firstNullableString(...values: unknown[]): string | null {
  const value = firstNonEmptyString(...values);
  return value || null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}