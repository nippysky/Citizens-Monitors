// Reactive "does the signed-in user already have a submission for this
// election" check, for UI that needs to know BEFORE any button is tapped —
// e.g. swapping a live election card's "Submit" button for a "Submitted"
// state. This is a sibling to useSubmissionGate: that hook gates the button
// press (async, fails open), this one drives what the button looks like in
// the first place (synchronous-feeling, offline-first, fails closed).
// Local-first: a report still sitting in the offline sync queue counts as
// submitted immediately, no network round-trip needed — consistent with the
// app's offline-first design. Only when nothing is queued locally do we ask
// the server, and only when `enabled` is true (callers pass this so cards
// that can't submit anyway — wrong role, non-live election — skip the fetch
// entirely).

import { useQuery } from "@tanstack/react-query";

import { useOfflineSync } from "@/context/OfflineSyncContext";
import { reportingQueryKeys } from "@/hooks/api/useReportingMutations";
import { hasPendingLocalSubmission } from "@/lib/offlineSubmission";
import {
  getMySubmission,
  hasExistingSubmission,
} from "@/lib/api/reporting.api";

export function useHasSubmission(
  electionId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const id = electionId?.trim() || null;
  const enabled = (options?.enabled ?? true) && Boolean(id);

  const { queue } = useOfflineSync();
  const hasLocal = id ? hasPendingLocalSubmission(queue, id) : false;

  const query = useQuery({
    queryKey: reportingQueryKeys.mySubmission(id ?? "none"),
    queryFn: () => getMySubmission(id as string),
    // Already know the answer locally — no need to hit the network at all.
    enabled: enabled && !hasLocal,
    staleTime: 10_000,
  });

  return {
    hasSubmission: hasLocal || hasExistingSubmission(query.data),
    isChecking: enabled && !hasLocal && query.isLoading,
  };
}
