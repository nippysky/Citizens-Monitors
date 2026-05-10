import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPulseComment,
  createPulsePost,
  CreatePulseCommentPayload,
  CreatePulsePostPayload,
  generateAnonymousUsername,
  getPulseViewerProfile,
  likePulseComment,
  likePulsePost,
  listPulseComments,
  listPulsePosts,
  ListPulseCommentsResponse,
  ListPulsePostsResponse,
  PulseViewerProfile,
} from "@/lib/api/pulse.api";

const PULSE_POSTS_LIMIT = 20;

export const pulseQueryKeys = {
  viewer: ["pulse", "viewer"] as const,
  posts: ["pulse", "posts"] as const,
  comments: (postId: string) => ["pulse", "posts", postId, "comments"] as const,
};

export function usePulseViewerQuery() {
  return useQuery<PulseViewerProfile, Error>({
    queryKey: pulseQueryKeys.viewer,
    queryFn: getPulseViewerProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateAnonymousUsernameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateAnonymousUsername,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pulseQueryKeys.viewer });
    },
  });
}

export function usePulsePostsInfiniteQuery() {
  return useInfiniteQuery<
    ListPulsePostsResponse,
    Error,
    InfiniteData<ListPulsePostsResponse>,
    typeof pulseQueryKeys.posts,
    number
  >({
    queryKey: pulseQueryKeys.posts,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listPulsePosts({
        page: pageParam,
        limit: PULSE_POSTS_LIMIT,
      }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 30 * 1000,
  });
}

export function useCreatePulsePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePulsePostPayload) => createPulsePost(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pulseQueryKeys.posts });
    },
  });
}

export function useLikePulsePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => likePulsePost(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pulseQueryKeys.posts });
    },
  });
}

export function usePulseCommentsQuery(postId?: string | null) {
  return useQuery<ListPulseCommentsResponse, Error>({
    queryKey: pulseQueryKeys.comments(postId ?? ""),
    queryFn: () => listPulseComments(postId ?? ""),
    enabled: Boolean(postId),
    staleTime: 15 * 1000,
  });
}

export function useCreatePulseCommentMutation(postId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreatePulseCommentPayload, "postId">) =>
      createPulseComment({
        postId: postId ?? "",
        ...payload,
      }),
    onSuccess: () => {
      if (postId) {
        void queryClient.invalidateQueries({
          queryKey: pulseQueryKeys.comments(postId),
        });
        void queryClient.invalidateQueries({ queryKey: pulseQueryKeys.posts });
      }
    },
  });
}

export function useLikePulseCommentMutation(postId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      likePulseComment({
        postId: postId ?? "",
        commentId,
      }),
    onSuccess: () => {
      if (postId) {
        void queryClient.invalidateQueries({
          queryKey: pulseQueryKeys.comments(postId),
        });
      }
    },
  });
}