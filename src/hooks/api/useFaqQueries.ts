import { useQuery } from "@tanstack/react-query";

import {
  getGeneralFaq,
  getObserverFaq,
  FaqCategory,
  FaqResponse,
} from "@/lib/api/faq.api";

export const faqQueryKeys = {
  general: ["faq", "general"] as const,
  observer: ["faq", "observer"] as const,
};

const FAQ_STALE_TIME = 5 * 60 * 1000;  // 5 min
const FAQ_GC_TIME   = 60 * 60 * 1000; // 1 hr

/**
 * Fetches GET /faq which returns { title, subtitle, categories: FaqCategory[] }.
 * The categories array contains both "general" and "observer" items — filter
 * by category slug in the UI.
 */
export function useGeneralFaqQuery() {
  return useQuery<FaqResponse>({
    queryKey: faqQueryKeys.general,
    queryFn: getGeneralFaq,
    staleTime: FAQ_STALE_TIME,
    gcTime: FAQ_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
}

/**
 * Fetches GET /faq/observer which returns a single FaqCategory object
 * (NOT a FaqResponse). Shape: { category, title, items }.
 */
export function useObserverFaqQuery(enabled = true) {
  return useQuery<FaqCategory>({
    queryKey: faqQueryKeys.observer,
    queryFn: getObserverFaq,
    enabled,
    staleTime: FAQ_STALE_TIME,
    gcTime: FAQ_GC_TIME,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
}
