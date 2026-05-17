import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  submitElectionResult,
  submitIncidentReport,
  type ElectionResultSubmitPayload,
  type IncidentReportSubmitPayload,
} from "@/lib/api/reporting.api";

export const reportingQueryKeys = {
  all: ["reporting"] as const,
  electionVault: ["profile", "election-vault"] as const,
  dashboard: ["dashboard"] as const,
  collation: ["collation"] as const,
  electionCollation: (electionId: string) =>
    ["collation", "detail", electionId] as const,
};

export function useSubmitElectionResultMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ElectionResultSubmitPayload) =>
      submitElectionResult(payload),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: reportingQueryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: reportingQueryKeys.electionVault });
      void queryClient.invalidateQueries({ queryKey: reportingQueryKeys.collation });
      void queryClient.invalidateQueries({
        queryKey: reportingQueryKeys.electionCollation(payload.electionId),
      });
    },
  });
}

export function useSubmitIncidentReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IncidentReportSubmitPayload) =>
      submitIncidentReport(payload),
    onSuccess: (_, payload) => {
      void queryClient.invalidateQueries({ queryKey: reportingQueryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: reportingQueryKeys.electionVault });
      void queryClient.invalidateQueries({ queryKey: reportingQueryKeys.collation });
      void queryClient.invalidateQueries({
        queryKey: reportingQueryKeys.electionCollation(payload.electionId),
      });
    },
  });
}