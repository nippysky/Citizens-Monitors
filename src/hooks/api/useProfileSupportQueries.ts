import { useQuery } from "@tanstack/react-query";

import {
  getBanks,
  getMobileNotificationSettings,
} from "@/lib/api/profile.api";

const LONG_STALE_TIME = 24 * 60 * 60 * 1000;

export function useBanksQuery() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: getBanks,
    staleTime: LONG_STALE_TIME,
    gcTime: LONG_STALE_TIME,
    retry: 1,
    networkMode: "offlineFirst",
  });
}

export function useMobileNotificationSettingsQuery() {
  return useQuery({
    queryKey: ["profile", "notifications"],
    queryFn: getMobileNotificationSettings,
    staleTime: 2 * 60 * 1000,
    gcTime: LONG_STALE_TIME,
    retry: 1,
    refetchOnReconnect: true,
    networkMode: "offlineFirst",
  });
}