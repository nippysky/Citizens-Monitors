import { useQuery } from "@tanstack/react-query";

import {
  getLocalGovernments,
  getPollingUnits,
  getStates,
  getWards,
} from "@/lib/api/locations.api";

const LOCATION_STALE_TIME = 24 * 60 * 60 * 1000;

export function useStatesQuery() {
  return useQuery({
    queryKey: ["locations", "states"],
    queryFn: getStates,
    staleTime: LOCATION_STALE_TIME,
  });
}

export function useLocalGovernmentsQuery(state: string) {
  return useQuery({
    queryKey: ["locations", "local-governments", state],
    queryFn: () => getLocalGovernments(state),
    enabled: Boolean(state),
    staleTime: LOCATION_STALE_TIME,
  });
}

export function useWardsQuery(state: string, localGovernmentArea: string) {
  return useQuery({
    queryKey: ["locations", "wards", state, localGovernmentArea],
    queryFn: () => getWards(state, localGovernmentArea),
    enabled: Boolean(state && localGovernmentArea),
    staleTime: LOCATION_STALE_TIME,
  });
}

export function usePollingUnitsQuery(
  state: string,
  localGovernmentArea: string,
  ward: string
) {
  return useQuery({
    queryKey: ["locations", "polling-units", state, localGovernmentArea, ward],
    queryFn: () => getPollingUnits(state, localGovernmentArea, ward),
    enabled: Boolean(state && localGovernmentArea && ward),
    staleTime: LOCATION_STALE_TIME,
  });
}