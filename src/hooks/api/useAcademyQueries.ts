import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAcademyArticle,
  getAcademyArticles,
  type AcademyArticleDetail,
  type AcademyArticleSummary,
  type AcademyListResponse,
} from "@/lib/api/academy.api";

export const academyQueryKeys = {
  all: ["academy"] as const,
  list: ["academy", "list"] as const,
  detail: (slug: string | null | undefined) =>
    ["academy", "detail", slug ?? "none"] as const,
};

export const ACADEMY_STALE_TIME = 12 * 60 * 60 * 1000;
export const ACADEMY_GC_TIME = 3 * 24 * 60 * 60 * 1000;

export function useAcademyArticlesQuery() {
  return useQuery<AcademyListResponse>({
    queryKey: academyQueryKeys.list,
    queryFn: getAcademyArticles,
    staleTime: ACADEMY_STALE_TIME,
    gcTime: ACADEMY_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
}

export function useAcademyArticleQuery(slug: string | null | undefined) {
  const queryClient = useQueryClient();

  return useQuery<AcademyArticleDetail>({
    queryKey: academyQueryKeys.detail(slug),
    queryFn: () => getAcademyArticle(slug as string),
    enabled: Boolean(slug),
    staleTime: ACADEMY_STALE_TIME,
    gcTime: ACADEMY_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    initialData: () => {
      if (!slug) return undefined;

      const list = queryClient.getQueryData<AcademyListResponse>(
        academyQueryKeys.list
      );

      const summary = list?.articles.find((article) => article.slug === slug);

      if (!summary) return undefined;

      return {
        ...summary,
        sections: [
          {
            heading: "Overview",
            paragraphs: [summary.summary],
          },
        ],
      };
    },
  });
}

export function usePrefetchAcademyArticle() {
  const queryClient = useQueryClient();

  return (article: AcademyArticleSummary) => {
    void queryClient.prefetchQuery({
      queryKey: academyQueryKeys.detail(article.slug),
      queryFn: () => getAcademyArticle(article.slug),
      staleTime: ACADEMY_STALE_TIME,
      gcTime: ACADEMY_GC_TIME,
    });
  };
}