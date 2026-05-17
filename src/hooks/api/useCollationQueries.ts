import { useQuery } from "@tanstack/react-query";

import {
  getElectionCollation,
  type ElectionCollationResponse,
} from "@/lib/api/collation.api";

export type { ElectionCollationResponse } from "@/lib/api/collation.api";

export const collationQueryKeys = {
  all: ["collation"] as const,
  detail: (activeElectionId: string | null | undefined) =>
    ["collation", "detail", activeElectionId ?? "none"] as const,
};

export const COLLATION_STALE_TIME = 2 * 60 * 1000;
export const COLLATION_GC_TIME = 15 * 60 * 1000;

export function useElectionCollationQuery(
  activeElectionId: string | null | undefined
) {
  return useQuery<ElectionCollationResponse>({
    queryKey: collationQueryKeys.detail(activeElectionId),
    queryFn: () => getElectionCollation(activeElectionId as string),
    enabled: Boolean(activeElectionId),
    staleTime: COLLATION_STALE_TIME,
    gcTime: COLLATION_GC_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
}