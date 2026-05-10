import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { getMyProfile, MyProfileResponse } from "@/lib/api/profile.api";
import {
  getCachedMyProfile,
  saveCachedMyProfile,
} from "@/lib/profile/profileCache";

const PROFILE_STALE_TIME = 2 * 60 * 1000;
const PROFILE_GC_TIME = 24 * 60 * 60 * 1000;

export function useMyProfileQuery() {
  const { isAuthenticated, isRestoring, token } = useAuth();

  const [cachedProfile, setCachedProfile] =
    useState<MyProfileResponse | null>(null);
  const [hasRestoredCache, setHasRestoredCache] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function restoreCache() {
      try {
        const profile = await getCachedMyProfile();

        if (!mounted) return;

        setCachedProfile(profile);
      } finally {
        if (mounted) {
          setHasRestoredCache(true);
        }
      }
    }

    void restoreCache();

    return () => {
      mounted = false;
    };
  }, []);

  const query = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
    enabled: Boolean(isAuthenticated && token && !isRestoring),
    staleTime: PROFILE_STALE_TIME,
    gcTime: PROFILE_GC_TIME,
    retry: 1,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    networkMode: "offlineFirst",
  });

  useEffect(() => {
    if (!query.data) return;

    setCachedProfile(query.data);
    void saveCachedMyProfile(query.data);
  }, [query.data]);

  const profile = useMemo(
    () => query.data ?? cachedProfile,
    [query.data, cachedProfile]
  );

  return {
    ...query,
    profile,
    cachedProfile,
    hasRestoredCache,
    isInitialProfileLoading:
      !hasRestoredCache || (query.isPending && !profile),
  };
}