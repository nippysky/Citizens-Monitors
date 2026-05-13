import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createPulseComment,
  CreatePulseCommentPayload,
  createPulsePost,
  CreatePulsePostPayload,
  getLiveElectionCarousel,
  getPulseComments,
  getPulsePosts,
  getPulseViewer,
  likePulseComment,
  likePulsePost,
  PulsePostsResponse,
} from "@/lib/api/pulse.api";

const PULSE_PAGE_LIMIT = 20;

export const pulseQueryKeys = {
  viewer: ["pulse", "viewer"] as const,
  posts: ["pulse", "posts"] as const,
  comments: (postId: string | null) => ["pulse", "comments", postId] as const,
  liveCarousel: ["pulse", "live-carousel"] as const,
};

export function usePulseViewerQuery() {
  return useQuery({
    queryKey: pulseQueryKeys.viewer,
    queryFn: getPulseViewer,
    staleTime: 60 * 1000,
  });
}

export function useLiveElectionCarouselQuery() {
  return useQuery({
    queryKey: pulseQueryKeys.liveCarousel,
    queryFn: getLiveElectionCarousel,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function usePulsePostsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: pulseQueryKeys.posts,
    queryFn: ({ pageParam }) =>
      getPulsePosts({
        page: pageParam,
        limit: PULSE_PAGE_LIMIT,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;

      if (loaded >= lastPage.total) {
        return undefined;
      }

      return lastPage.page + 1;
    },
    staleTime: 20 * 1000,
  });
}

export function useCreatePulsePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePulsePostPayload) => createPulsePost(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: pulseQueryKeys.posts,
      });
    },
  });
}

export function useLikePulsePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => likePulsePost(postId),
    onSuccess: (response) => {
      queryClient.setQueryData<InfiniteData<PulsePostsResponse>>(
        pulseQueryKeys.posts,
        (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.id === response.id
                  ? {
                      ...post,
                      likesCount: response.likesCount,
                      isLikedByCurrentUser: response.isLikedByCurrentUser,
                    }
                  : post
              ),
            })),
          };
        }
      );
    },
  });
}

export function usePulseCommentsQuery(postId: string | null) {
  return useQuery({
    queryKey: pulseQueryKeys.comments(postId),
    queryFn: () => getPulseComments(postId ?? ""),
    enabled: Boolean(postId),
    staleTime: 15 * 1000,
  });
}

export function useCreatePulseCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      postId: string;
      payload: CreatePulseCommentPayload;
    }) => createPulseComment(params),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: pulseQueryKeys.comments(variables.postId),
      });

      await queryClient.invalidateQueries({
        queryKey: pulseQueryKeys.posts,
      });
    },
  });
}

export function useLikePulseCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { postId: string; commentId: string }) =>
      likePulseComment(params),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: pulseQueryKeys.comments(variables.postId),
      });
    },
  });
}