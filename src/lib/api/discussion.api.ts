// Collation "Election Discussion" — real backend endpoints, confirmed by the
// backend engineer with sample request/response bodies. Mirrors the existing
// Pulse post/comment API shape (src/lib/api/pulse.api.ts) — same author
// shape, same like/comment mechanics — except discussion posts have no
// `visibilityScope` field (Pulse posts do). That means the "Polling Unit /
// Ward" audience picker in ShareOpinionBottomSheet currently has nothing to
// bind to on this endpoint; it's kept as UI only until/unless the backend
// adds a scope field.

import { apiRequest } from "@/lib/api/http";

export type DiscussionAuthor = {
  id: string;
  displayName: string;
  usedAnonymous: boolean;
};

export type DiscussionPost = {
  id: string;
  body: string;
  imageUrls: string[];
  videoUrls: string[];
  allowSocialShare: boolean;
  createdAt: string;
  updatedAt: string;
  author: DiscussionAuthor;
  likesCount: number;
  isLikedByCurrentUser: boolean;
};

export type DiscussionPostsResponse = {
  posts: DiscussionPost[];
  total: number;
  page: number;
  limit: number;
};

export type CreateDiscussionPostPayload = {
  body: string;
  allowSocialShare: boolean;
  useAnonymousDisplay: boolean;
  imageUri?: string | null;
  videoUri?: string | null;
};

export type CreateDiscussionPostResponse = {
  post: DiscussionPost;
};

export type LikeDiscussionPostResponse = {
  id: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  author: DiscussionAuthor;
};

export type DiscussionComment = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: DiscussionAuthor;
  likesCount: number;
  isLikedByCurrentUser: boolean;
};

export type DiscussionCommentsResponse = {
  comments: DiscussionComment[];
};

export type CreateDiscussionCommentPayload = {
  body: string;
  useAnonymousDisplay: boolean;
};

export type CreateDiscussionCommentResponse = {
  comment: DiscussionComment;
};

export type LikeDiscussionCommentResponse = {
  comment: DiscussionComment;
};

type ReactNativeFile = {
  uri: string;
  name: string;
  type: string;
};

function encodePathSegment(value: string): string {
  return encodeURIComponent(value.trim());
}

function encodeQueryValue(value: string | number): string {
  return encodeURIComponent(String(value));
}

function normalizeBody(value: string): string {
  return value.trim();
}

function getFileExtension(uri: string): string {
  const cleanUri = uri.split("?")[0] ?? uri;
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return "jpg";
  }

  return extension;
}

function getImageMimeType(uri: string): string {
  const extension = getFileExtension(uri);

  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/heic";
    case "jpeg":
    case "jpg":
    default:
      return "image/jpeg";
  }
}

function getVideoMimeType(uri: string): string {
  const extension = getFileExtension(uri);

  switch (extension) {
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/x-m4v";
    case "mp4":
    default:
      return "video/mp4";
  }
}

function createNativeFile(
  uri: string,
  fallbackName: string,
  mimeType: string
): ReactNativeFile {
  const extension = getFileExtension(uri);

  return {
    uri,
    name: `${fallbackName}.${extension}`,
    type: mimeType,
  };
}

export async function getDiscussionPosts(params: {
  electionId: string;
  page: number;
  limit: number;
}): Promise<DiscussionPostsResponse> {
  return apiRequest<DiscussionPostsResponse>(
    `/elections/${encodePathSegment(params.electionId)}/discussion/posts?page=${encodeQueryValue(
      params.page
    )}&limit=${encodeQueryValue(params.limit)}`,
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function createDiscussionPost(params: {
  electionId: string;
  payload: CreateDiscussionPostPayload;
}): Promise<CreateDiscussionPostResponse> {
  const formData = new FormData();

  formData.append("body", normalizeBody(params.payload.body));
  formData.append(
    "allowSocialShare",
    params.payload.allowSocialShare ? "true" : "false"
  );
  formData.append(
    "useAnonymousDisplay",
    params.payload.useAnonymousDisplay ? "true" : "false"
  );

  if (params.payload.imageUri) {
    formData.append(
      "images[]",
      createNativeFile(
        params.payload.imageUri,
        "discussion-image",
        getImageMimeType(params.payload.imageUri)
      ) as unknown as Blob
    );
  }

  if (params.payload.videoUri) {
    formData.append(
      "videos[]",
      createNativeFile(
        params.payload.videoUri,
        "discussion-video",
        getVideoMimeType(params.payload.videoUri)
      ) as unknown as Blob
    );
  }

  return apiRequest<CreateDiscussionPostResponse>(
    `/elections/${encodePathSegment(params.electionId)}/discussion/posts`,
    {
      method: "POST",
      auth: true,
      body: formData,
    }
  );
}

export async function likeDiscussionPost(params: {
  electionId: string;
  postId: string;
}): Promise<LikeDiscussionPostResponse> {
  return apiRequest<LikeDiscussionPostResponse>(
    `/elections/${encodePathSegment(
      params.electionId
    )}/discussion/posts/${encodePathSegment(params.postId)}/like`,
    {
      method: "POST",
      auth: true,
    }
  );
}

export async function getDiscussionComments(params: {
  electionId: string;
  postId: string;
}): Promise<DiscussionCommentsResponse> {
  return apiRequest<DiscussionCommentsResponse>(
    `/elections/${encodePathSegment(
      params.electionId
    )}/discussion/posts/${encodePathSegment(params.postId)}/comments`,
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function createDiscussionComment(params: {
  electionId: string;
  postId: string;
  payload: CreateDiscussionCommentPayload;
}): Promise<CreateDiscussionCommentResponse> {
  return apiRequest<CreateDiscussionCommentResponse>(
    `/elections/${encodePathSegment(
      params.electionId
    )}/discussion/posts/${encodePathSegment(params.postId)}/comments`,
    {
      method: "POST",
      auth: true,
      body: {
        body: normalizeBody(params.payload.body),
        useAnonymousDisplay: params.payload.useAnonymousDisplay,
      },
    }
  );
}

export async function likeDiscussionComment(params: {
  electionId: string;
  postId: string;
  commentId: string;
}): Promise<LikeDiscussionCommentResponse> {
  return apiRequest<LikeDiscussionCommentResponse>(
    `/elections/${encodePathSegment(
      params.electionId
    )}/discussion/posts/${encodePathSegment(
      params.postId
    )}/comments/${encodePathSegment(params.commentId)}/like`,
    {
      method: "POST",
      auth: true,
    }
  );
}
