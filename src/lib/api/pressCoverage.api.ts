const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://citizen-monitors.onrender.com/api/v1/mobile";

const EXPO_PUBLIC_INHOUSE_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_INHOUSE_ACCESS_TOKEN ?? "";

export type PressCoverageApiItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnailURL?: string | null;
  heroImageURL?: string | null;
  publishedAt: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
};

export type PressCoverageListResponse = {
  title: string;
  subtitle: string;
  total: number;
  page: number;
  limit: number;
  items: PressCoverageApiItem[];
};

export type PressCoverageDetailResponse = PressCoverageApiItem;

type RequestOptions = {
  signal?: AbortSignal;
};

function buildUrl(path: string, params?: Record<string, string | number>) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function requestJson<T>(url: string, options?: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (EXPO_PUBLIC_INHOUSE_ACCESS_TOKEN) {
    headers["X-Inhouse-Access-Token"] = EXPO_PUBLIC_INHOUSE_ACCESS_TOKEN;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    signal: options?.signal,
  });

  const text = await response.text();

  let payload: unknown = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Unable to load press coverage.";

    throw new Error(message);
  }

  return payload as T;
}

export async function getPressCoverageList(params?: {
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<PressCoverageListResponse> {
  return requestJson<PressCoverageListResponse>(
    buildUrl("/press-coverage", {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    }),
    { signal: params?.signal }
  );
}

export async function getPressCoverageDetail(params: {
  slug: string;
  signal?: AbortSignal;
}): Promise<PressCoverageDetailResponse> {
  return requestJson<PressCoverageDetailResponse>(
    buildUrl(`/press-coverage/${encodeURIComponent(params.slug)}`),
    { signal: params.signal }
  );
}