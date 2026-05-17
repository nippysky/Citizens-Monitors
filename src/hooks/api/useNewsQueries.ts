import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getNewsInsight,
  getNewsInsights,
  type NewsInsightDetail,
  type NewsInsightItem,
  type NewsInsightsResponse,
} from "@/lib/api/news.api";

export const newsQueryKeys = {
  all: ["news-insights"] as const,
  list: ["news-insights", "list"] as const,
  detail: (slug: string | null | undefined) =>
    ["news-insights", "detail", slug ?? "none"] as const,
};

export const NEWS_STALE_TIME = 5 * 60 * 1000;
export const NEWS_GC_TIME = 60 * 60 * 1000;
export const NEWS_PAGE_LIMIT = 20;

export function useNewsInsightsInfiniteQuery() {
  return useInfiniteQuery<
    NewsInsightsResponse,
    Error,
    InfiniteData<NewsInsightsResponse>,
    typeof newsQueryKeys.list,
    number
  >({
    queryKey: newsQueryKeys.list,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getNewsInsights({ page: pageParam, limit: NEWS_PAGE_LIMIT }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;

      if (loaded >= lastPage.total) {
        return undefined;
      }

      return lastPage.page + 1;
    },
    staleTime: NEWS_STALE_TIME,
    gcTime: NEWS_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
}

export function useNewsInsightQuery(slug: string | null | undefined) {
  const queryClient = useQueryClient();

  return useQuery<NewsInsightDetail>({
    queryKey: newsQueryKeys.detail(slug),
    queryFn: () => getNewsInsight(slug as string),
    enabled: Boolean(slug),
    staleTime: NEWS_STALE_TIME,
    gcTime: NEWS_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,

    /**
     * Use placeholderData, not initialData.
     *
     * initialData marks the list-card preview as real cached detail data and can
     * prevent the actual article endpoint from being fetched while staleTime is active.
     * placeholderData gives the details page something instant to render, while the
     * real GET /news-insights/:slug request still runs normally.
     */
    placeholderData: () => {
      if (!slug) return undefined;

      const listData = queryClient.getQueryData<
        InfiniteData<NewsInsightsResponse>
      >(newsQueryKeys.list);

      const summary = listData?.pages
        .flatMap((page) => page.items)
        .find((item) => item.slug === slug);

      if (!summary) return undefined;

      return mapSummaryToPlaceholderDetail(summary);
    },
  });
}

export function usePrefetchNewsInsight() {
  const queryClient = useQueryClient();

  return (item: NewsInsightItem) => {
    if (!item.slug) return;

    void queryClient.prefetchQuery({
      queryKey: newsQueryKeys.detail(item.slug),
      queryFn: () => getNewsInsight(item.slug),
      staleTime: NEWS_STALE_TIME,
      gcTime: NEWS_GC_TIME,
    });
  };
}

function mapSummaryToPlaceholderDetail(
  item: NewsInsightItem
): NewsInsightDetail {
  const title = safeText(item.title) || "Untitled news";
  const summary = safeText(item.summary);
  const publishedAt = safeText(item.publishedAt);

  return {
    id: safeText(item.id) || safeText(item.slug),
    slug: safeText(item.slug),
    title,
    excerpt: summary,
    content: "",
    thumbnailUrl: item.thumbnailUrl ?? null,
    heroImageUrl: item.thumbnailUrl ?? null,
    publishedAt,
    createdAt: publishedAt,
    likesCount: safeNumber(item.likesCount),
    commentsCount: safeNumber(item.commentsCount),
    isLikedByCurrentUser: item.isLikedByCurrentUser === true,
  };
}

function safeText(value: unknown): string {
  if (typeof value === "string") return value.trim();

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function safeNumber(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
}