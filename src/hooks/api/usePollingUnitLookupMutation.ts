import { useMutation } from "@tanstack/react-query";

import {
  lookupPollingUnits,
  PollingUnitLookupPayload,
  PollingUnitLookupResponse,
} from "@/lib/api/pollingUnitLocator.api";

export function usePollingUnitLookupMutation() {
  return useMutation<PollingUnitLookupResponse, Error, PollingUnitLookupPayload>(
    {
      mutationFn: (payload) => lookupPollingUnits(payload),
    }
  );
}