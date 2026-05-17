import { useQuery } from "@tanstack/react-query";

import {
  ElectionApiStatus,
  getActiveElections,
} from "@/lib/api/elections.api";

export { getActiveElections };

export const electionQueryKeys = {
  root: ["elections"] as const,
  active: (status: ElectionApiStatus) =>
    ["elections", "active", status] as const,
};

const ELECTIONS_STALE_TIME = 60 * 1000;

export function useActiveElectionsQuery(status: ElectionApiStatus = "all") {
  return useQuery({
    queryKey: electionQueryKeys.active(status),
    queryFn: () => getActiveElections(status),
    staleTime: ELECTIONS_STALE_TIME,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}