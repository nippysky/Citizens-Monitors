import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  cacheDashboard,
  DashboardResponse,
  getDashboard,
  readCachedDashboard,
} from "@/lib/api/dashboard.api";

export const dashboardQueryKeys = {
  dashboard: ["dashboard"] as const,
};

const DASHBOARD_STALE_TIME = 60 * 1000;
const DASHBOARD_GC_TIME = 30 * 60 * 1000;

export function useDashboardQuery() {
  const [cachedDashboard, setCachedDashboard] =
    useState<DashboardResponse | null>(null);
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadCache = async () => {
      const cached = await readCachedDashboard();

      if (!mounted) return;

      setCachedDashboard(cached);
      setCacheReady(true);
    };

    void loadCache();

    return () => {
      mounted = false;
    };
  }, []);

  const query = useQuery({
    queryKey: dashboardQueryKeys.dashboard,
    enabled: cacheReady,
    queryFn: async () => {
      const dashboard = await getDashboard();
      await cacheDashboard(dashboard);
      return dashboard;
    },
    staleTime: DASHBOARD_STALE_TIME,
    gcTime: DASHBOARD_GC_TIME,
    retry: 1,
    placeholderData: cachedDashboard ?? undefined,
  });

  const data = query.data ?? cachedDashboard;

  return {
    ...query,
    data,
    hasCachedDashboard: Boolean(cachedDashboard),
    isInitialDashboardLoading: !data && query.isLoading,
  };
}