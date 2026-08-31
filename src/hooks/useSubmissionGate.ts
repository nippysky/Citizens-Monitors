// A user may submit EITHER an official result OR an incident report per
// election, never both. Every entry point that opens the commencement sheet
// (Elections tab, the home LiveElectionCard, the global LiveNotice banner)
// must check this FIRST — if the user already has a submission for the
// election, skip the sheet entirely and send them to their Digital Vault.

import { useCallback, useRef } from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAppToast } from "@/hooks/useAppToast";
import { useOfflineSync } from "@/context/OfflineSyncContext";
import { reportingQueryKeys } from "@/hooks/api/useReportingMutations";
import { Paths } from "@/constants/paths";
import { hasPendingLocalSubmission } from "@/lib/offlineSubmission";
import {
  getMySubmission,
  hasExistingSubmission,
} from "@/lib/api/reporting.api";

export function useSubmissionGate() {
  const queryClient = useQueryClient();
  const { showToast } = useAppToast();
  const { queue } = useOfflineSync();
  const checkingRef = useRef(false);

  /**
   * Checks whether the user already submitted for `electionId`. If so,
   * shows a toast and routes to the Digital Vault. Otherwise calls
   * `onEligible()` to proceed with opening the commencement sheet.
   *
   * Fails OPEN: if the check itself errors (network hiccup, or the backend
   * 404s for "no submission yet" instead of returning empty arrays), we
   * proceed to `onEligible()` rather than blocking a legitimate first-time
   * submission on an inconclusive check.
   */
  const checkAndProceed = useCallback(
    async (electionId: string, onEligible: () => void) => {
      const id = electionId?.trim();
      if (!id) {
        onEligible();
        return;
      }

      if (hasPendingLocalSubmission(queue, id)) {
        showToast({
          type: "success",
          message:
            "You've already submitted a report for this election — here it is in your Digital Vault.",
        });
        router.push(Paths.appDigitalVault as never);
        return;
      }

      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const response = await queryClient.fetchQuery({
          queryKey: reportingQueryKeys.mySubmission(id),
          queryFn: () => getMySubmission(id),
          staleTime: 10_000,
        });

        if (hasExistingSubmission(response)) {
          showToast({
            type: "success",
            message:
              "You've already submitted a report for this election — here it is in your Digital Vault.",
          });
          router.push(Paths.appDigitalVault as never);
          return;
        }
      } catch {
        // See fail-open note above.
      } finally {
        checkingRef.current = false;
      }

      onEligible();
    },
    [queue, queryClient, showToast]
  );

  return { checkAndProceed };
}
