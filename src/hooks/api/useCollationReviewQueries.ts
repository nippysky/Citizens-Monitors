// Collation "Review Reports" — Community Verification (agree/flag).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CollationUserActionPayload,
  getCollationReviewFeed,
  submitCollationUserAction,
} from "@/lib/api/collationReview.api";

export const collationReviewQueryKeys = {
  feed: (electionId: string | null) =>
    ["collation-review", "feed", electionId] as const,
};

export function useCollationReviewFeedQuery(electionId: string | null) {
  return useQuery({
    queryKey: collationReviewQueryKeys.feed(electionId),
    queryFn: () => getCollationReviewFeed(electionId ?? ""),
    enabled: Boolean(electionId),
    staleTime: 20 * 1000,
  });
}

export function useCollationUserActionMutation(electionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CollationUserActionPayload) =>
      submitCollationUserAction({ electionId: electionId ?? "", payload }),
    onSuccess: (response) => {
      queryClient.setQueryData(
        collationReviewQueryKeys.feed(electionId),
        response
      );
    },
  });
}
