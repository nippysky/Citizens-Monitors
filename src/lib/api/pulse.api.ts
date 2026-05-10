import { apiRequest } from "@/lib/api/http";

export type PulseVisibilityScope = "ward" | "lga";

export type PulseAuthor = {
  id: string;
  displayName: string;
  usedAnonymous: boolean;
};

export type PulsePost = {
  id: string;
  body: string;
  imageUrl?: string | null;
  visibilityScope: PulseVisibilityScope;
  createdAt: string;
  updatedAt: string;
  author: PulseAuthor;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
};

export type PulseComment = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: PulseAuthor;
  likesCount: number;
  isLikedByCurrentUser: boolean;
};

export type ListPulsePostsParams = {
  page?: number;
  limit?: number;
};

export type ListPulsePostsResponse = {
  posts: PulsePost[];
  total: number;
  page: number;
  limit: number;
};

export type CreatePulsePostPayload = {
  body: string;
  visibilityScope: PulseVisibilityScope;
  useAnonymousDisplay: boolean;
  imageUri?: string | null;
};

export type CreatePulsePostResponse = {
  post: PulsePost;
};

export type LikePulsePostResponse = {
  id: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
};

export type ListPulseCommentsResponse = {
  comments: PulseComment[];
};

export type CreatePulseCommentPayload = {
  postId: string;
  body: string;
  useAnonymousDisplay: boolean;
};

export type CreatePulseCommentResponse = {
  comment: PulseComment;
};

export type LikePulseCommentResponse = {
  comment: PulseComment;
};

export type PulseViewerProfile = {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  anonymousUsername?: string;
  useAnonymousIdentity?: boolean;
  profileImage?: {
    url?: string;
  } | null;
};

export type GenerateAnonymousUsernameResponse = {
  message: string;
  anonymousUsername: string;
};

type ReactNativeFile = {
  uri: string;
  name: string;
  type: string;
};

function clean(value: string): string {
  return value.trim();
}

function toQueryString(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

function getFileExtension(uri: string): string {
  const cleanUri = uri.split("?")[0] ?? uri;
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (!extension || extension.length > 5) {
    return "jpg";
  }

  return extension;
}

function getMimeType(uri: string): string {
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

function createImageFile(uri: string, fallbackName: string): ReactNativeFile {
  const extension = getFileExtension(uri);

  return {
    uri,
    name: `${fallbackName}.${extension}`,
    type: getMimeType(uri),
  };
}

export async function getPulseViewerProfile(): Promise<PulseViewerProfile> {
  return apiRequest<PulseViewerProfile>("/profile/me", {
    method: "GET",
    auth: true,
  });
}

export async function generateAnonymousUsername(): Promise<GenerateAnonymousUsernameResponse> {
  return apiRequest<GenerateAnonymousUsernameResponse>(
    "/profile/me/anonymous-username/generate",
    {
      method: "POST",
      auth: true,
    }
  );
}

export async function listPulsePosts(
  params: ListPulsePostsParams = {}
): Promise<ListPulsePostsResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return apiRequest<ListPulsePostsResponse>(
    `/pulse/posts?${toQueryString({ page, limit })}`,
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function createPulsePost(
  payload: CreatePulsePostPayload
): Promise<CreatePulsePostResponse> {
  const formData = new FormData();

  formData.append("body", clean(payload.body));
  formData.append("visibilityScope", payload.visibilityScope);
  formData.append("useAnonymousDisplay", payload.useAnonymousDisplay ? "true" : "false");

  if (payload.imageUri) {
    formData.append(
      "image",
      createImageFile(payload.imageUri, "pulse-post-image") as unknown as Blob
    );
  }

  return apiRequest<CreatePulsePostResponse>("/pulse/posts", {
    method: "POST",
    auth: true,
    body: formData,
  });
}

export async function likePulsePost(postId: string): Promise<LikePulsePostResponse> {
  return apiRequest<LikePulsePostResponse>(
    `/pulse/posts/${encodeURIComponent(postId)}/like`,
    {
      method: "POST",
      auth: true,
    }
  );
}

export async function listPulseComments(
  postId: string
): Promise<ListPulseCommentsResponse> {
  return apiRequest<ListPulseCommentsResponse>(
    `/pulse/posts/${encodeURIComponent(postId)}/comments`,
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function createPulseComment(
  payload: CreatePulseCommentPayload
): Promise<CreatePulseCommentResponse> {
  return apiRequest<CreatePulseCommentResponse>(
    `/pulse/posts/${encodeURIComponent(payload.postId)}/comments`,
    {
      method: "POST",
      auth: true,
      body: {
        body: clean(payload.body),
        useAnonymousDisplay: payload.useAnonymousDisplay,
      },
    }
  );
}

export async function likePulseComment(params: {
  postId: string;
  commentId: string;
}): Promise<LikePulseCommentResponse> {
  return apiRequest<LikePulseCommentResponse>(
    `/pulse/posts/${encodeURIComponent(params.postId)}/comments/${encodeURIComponent(
      params.commentId
    )}/like`,
    {
      method: "POST",
      auth: true,
    }
  );
}