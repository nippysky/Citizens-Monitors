import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteElectionResult,
  getElectionVault,
  updateElectionResult,
} from "@/lib/api/electionVault.api";

export const electionVaultQueryKeys = {
  root: ["profile", "election-vault"] as const,
};

export function useElectionVaultQuery() {
  return useQuery({
    queryKey: electionVaultQueryKeys.root,
    queryFn: getElectionVault,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUpdateElectionResultMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateElectionResult,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: electionVaultQueryKeys.root,
      });
    },
  });
}

export function useDeleteElectionResultMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteElectionResult,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: electionVaultQueryKeys.root,
      });
    },
  });
}