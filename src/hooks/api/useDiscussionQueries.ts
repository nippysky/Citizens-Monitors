// ─── src/hooks/api/useDiscussionQueries.ts ────────────────────────────────
// Collation "Election Discussion" — mirrors usePulseQueries.ts's structure,
// scoped per-election instead of globally.

import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDiscussionComment,
  CreateDiscussionCommentPayload,
  createDiscussionPost,
  CreateDiscussionPostPayload,
  getDiscussionComments,
  getDiscussionPosts,
  likeDiscussionComment,
  likeDiscussionPost,
  DiscussionPostsResponse,
} from "@/lib/api/discussion.api";

const DISCUSSION_PAGE_LIMIT = 20;

export const discussionQueryKeys = {
  posts: (electionId: string | null) =>
    ["discussion", "posts", electionId] as const,
  comments: (electionId: string | null, postId: string | null) =>
    ["discussion", "comments", electionId, postId] as const,
};

export function useDiscussionPostsInfiniteQuery(electionId: string | null) {
  return useInfiniteQuery({
    queryKey: discussionQueryKeys.posts(electionId),
    queryFn: ({ pageParam }) =>
      getDiscussionPosts({
        electionId: electionId ?? "",
        page: pageParam,
        limit: DISCUSSION_PAGE_LIMIT,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;

      if (loaded >= lastPage.total) {
        return undefined;
      }

      return lastPage.page + 1;
    },
    enabled: Boolean(electionId),
    staleTime: 20 * 1000,
  });
}

export function useCreateDiscussionPostMutation(electionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDiscussionPostPayload) =>
      createDiscussionPost({ electionId: electionId ?? "", payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.posts(electionId),
      });
    },
  });
}

export function useLikeDiscussionPostMutation(electionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      likeDiscussionPost({ electionId: electionId ?? "", postId }),
    onSuccess: (response) => {
      queryClient.setQueryData<InfiniteData<DiscussionPostsResponse>>(
        discussionQueryKeys.posts(electionId),
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

export function useDiscussionCommentsQuery(
  electionId: string | null,
  postId: string | null
) {
  return useQuery({
    queryKey: discussionQueryKeys.comments(electionId, postId),
    queryFn: () =>
      getDiscussionComments({
        electionId: electionId ?? "",
        postId: postId ?? "",
      }),
    enabled: Boolean(electionId && postId),
    staleTime: 15 * 1000,
  });
}

export function useCreateDiscussionCommentMutation(
  electionId: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      postId: string;
      payload: CreateDiscussionCommentPayload;
    }) =>
      createDiscussionComment({
        electionId: electionId ?? "",
        postId: params.postId,
        payload: params.payload,
      }),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.comments(electionId, variables.postId),
      });

      await queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.posts(electionId),
      });
    },
  });
}

export function useLikeDiscussionCommentMutation(electionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { postId: string; commentId: string }) =>
      likeDiscussionComment({
        electionId: electionId ?? "",
        postId: params.postId,
        commentId: params.commentId,
      }),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: discussionQueryKeys.comments(electionId, variables.postId),
      });
    },
  });
}
