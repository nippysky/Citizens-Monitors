import { apiRequest } from "@/lib/api/http";

export type NewsInsightItem = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  summary: string;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
};

export type NewsInsightsResponse = {
  title: string;
  subtitle: string;
  total: number;
  page: number;
  limit: number;
  items: NewsInsightItem[];
};

export type NewsInsightDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnailUrl?: string | null;
  heroImageUrl?: string | null;
  publishedAt: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
};

type RawNewsInsight = {
  [key: string]: unknown;

  id?: unknown;
  _id?: unknown;
  slug?: unknown;
  title?: unknown;

  summary?: unknown;
  excerpt?: unknown;
  content?: unknown;
  body?: unknown;

  thumbnailUrl?: unknown;
  thumbnailURL?: unknown;
  thumbnailURLUrl?: unknown;
  thumbnail_url?: unknown;

  heroImageUrl?: unknown;
  heroImageURL?: unknown;
  hero_image_url?: unknown;

  publishedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;

  likesCount?: unknown;
  commentsCount?: unknown;
  isLikedByCurrentUser?: unknown;
};

type RawNewsInsightsResponse = {
  [key: string]: unknown;

  title?: unknown;
  subtitle?: unknown;
  total?: unknown;
  page?: unknown;
  limit?: unknown;
  items?: unknown;
  data?: unknown;
  results?: unknown;
};

export async function getNewsInsights(params?: {
  page?: number;
  limit?: number;
}): Promise<NewsInsightsResponse> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  const response = await apiRequest<RawNewsInsightsResponse | RawNewsInsight[]>(
    `/news-insights?page=${page}&limit=${limit}`,
    {
      method: "GET",
      auth: false,
    }
  );

  return normalizeNewsInsightsResponse(response, page, limit);
}

export async function getNewsInsight(
  slug: string
): Promise<NewsInsightDetail> {
  const response = await apiRequest<RawNewsInsight>(
    `/news-insights/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      auth: false,
    }
  );

  return normalizeNewsInsightDetail(response);
}

function normalizeNewsInsightsResponse(
  response: RawNewsInsightsResponse | RawNewsInsight[],
  fallbackPage: number,
  fallbackLimit: number
): NewsInsightsResponse {
  const { meta, rawItems } = unpackListResponse(response);

  const items = rawItems.map((item, index) =>
    normalizeNewsInsightItem(item, index)
  );

  return {
    title: firstNonEmptyString(meta.title, "News & Insight"),
    subtitle: firstNonEmptyString(
      meta.subtitle,
      "Latest political news from publications."
    ),
    total: toNumber(meta.total, items.length),
    page: toNumber(meta.page, fallbackPage),
    limit: toNumber(meta.limit, fallbackLimit),
    items,
  };
}

function normalizeNewsInsightDetail(raw: RawNewsInsight): NewsInsightDetail {
  const item = normalizeNewsInsightItem(raw, 0);

  const excerpt = firstNonEmptyString(
    raw?.excerpt,
    raw?.summary,
    item.summary
  );

  const content = firstNonEmptyString(raw?.content, raw?.body);

  const heroImageUrl = firstNullableString(
    raw?.heroImageUrl,
    raw?.heroImageURL,
    raw?.hero_image_url,
    item.thumbnailUrl
  );

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt,
    content,
    thumbnailUrl: item.thumbnailUrl,
    heroImageUrl,
    publishedAt: item.publishedAt,
    createdAt: firstNonEmptyString(raw?.createdAt, item.publishedAt),
    likesCount: item.likesCount,
    commentsCount: item.commentsCount,
    isLikedByCurrentUser: item.isLikedByCurrentUser,
  };
}

function normalizeNewsInsightItem(
  raw: RawNewsInsight,
  index: number
): NewsInsightItem {
  const title = firstNonEmptyString(raw?.title, "Untitled news");

  const id = firstNonEmptyString(
    raw?.id,
    raw?._id,
    raw?.slug,
    `news-${index + 1}`
  );

  const slug = firstNonEmptyString(raw?.slug, id);

  const contentText = stripHtmlToText(
    firstNonEmptyString(raw?.content, raw?.body)
  );

  const summary = firstNonEmptyString(
    raw?.summary,
    raw?.excerpt,
    contentText,
    title
  );

  return {
    id,
    slug,
    title,
    thumbnailUrl: firstNullableString(
      raw?.thumbnailUrl,
      raw?.thumbnailURLUrl,
      raw?.thumbnailURL,
      raw?.thumbnail_url
    ),
    summary,
    publishedAt: firstNonEmptyString(
      raw?.publishedAt,
      raw?.createdAt,
      raw?.updatedAt
    ),
    likesCount: toNumber(raw?.likesCount, 0),
    commentsCount: toNumber(raw?.commentsCount, 0),
    isLikedByCurrentUser: raw?.isLikedByCurrentUser === true,
  };
}

function unpackListResponse(
  response: RawNewsInsightsResponse | RawNewsInsight[]
): {
  meta: RawNewsInsightsResponse;
  rawItems: RawNewsInsight[];
} {
  if (Array.isArray(response)) {
    return {
      meta: {},
      rawItems: response,
    };
  }

  if (Array.isArray(response.items)) {
    return {
      meta: response,
      rawItems: response.items as RawNewsInsight[],
    };
  }

  if (Array.isArray(response.data)) {
    return {
      meta: response,
      rawItems: response.data as RawNewsInsight[],
    };
  }

  if (Array.isArray(response.results)) {
    return {
      meta: response,
      rawItems: response.results as RawNewsInsight[],
    };
  }

  if (isObject(response.data)) {
    const data = response.data as RawNewsInsightsResponse;

    if (Array.isArray(data.items)) {
      return {
        meta: {
          ...response,
          ...data,
        },
        rawItems: data.items as RawNewsInsight[],
      };
    }

    if (Array.isArray(data.results)) {
      return {
        meta: {
          ...response,
          ...data,
        },
        rawItems: data.results as RawNewsInsight[],
      };
    }
  }

  return {
    meta: response,
    rawItems: [],
  };
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

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, parsed);
}

function stripHtmlToText(value: string): string {
  if (!value) return "";

  return value
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}