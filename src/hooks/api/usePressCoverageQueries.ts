import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getPressCoverageDetail,
  getPressCoverageList,
  PressCoverageDetailResponse,
  PressCoverageListResponse,
} from "@/lib/api/pressCoverage.api";

export const pressCoverageQueryKeys = {
  all: ["press-coverage"] as const,
  list: () => [...pressCoverageQueryKeys.all, "list"] as const,
  detail: (slug: string) =>
    [...pressCoverageQueryKeys.all, "detail", slug] as const,
};

const PRESS_COVERAGE_STALE_TIME = 5 * 60 * 1000;
const PRESS_COVERAGE_GC_TIME = 30 * 60 * 1000;
const PRESS_COVERAGE_LIMIT = 20;

export function usePressCoverageInfiniteQuery() {
  return useInfiniteQuery<PressCoverageListResponse>({
    queryKey: pressCoverageQueryKeys.list(),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      getPressCoverageList({
        page: Number(pageParam),
        limit: PRESS_COVERAGE_LIMIT,
        signal,
      }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;

      if (loaded >= lastPage.total) {
        return undefined;
      }

      return lastPage.page + 1;
    },
    staleTime: PRESS_COVERAGE_STALE_TIME,
    gcTime: PRESS_COVERAGE_GC_TIME,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

export function usePressCoverageDetailQuery(slug?: string | null) {
  return useQuery<PressCoverageDetailResponse>({
    queryKey: pressCoverageQueryKeys.detail(slug ?? ""),
    enabled: Boolean(slug),
    queryFn: ({ signal }) =>
      getPressCoverageDetail({
        slug: slug ?? "",
        signal,
      }),
    staleTime: PRESS_COVERAGE_STALE_TIME,
    gcTime: PRESS_COVERAGE_GC_TIME,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}