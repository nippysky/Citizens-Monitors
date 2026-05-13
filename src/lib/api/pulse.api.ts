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

export type PulsePostsResponse = {
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

export type PulseComment = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: PulseAuthor;
  likesCount: number;
  isLikedByCurrentUser: boolean;
};

export type PulseCommentsResponse = {
  comments: PulseComment[];
};

export type CreatePulseCommentPayload = {
  body: string;
  useAnonymousDisplay: boolean;
};

export type CreatePulseCommentResponse = {
  comment: PulseComment;
};

export type LikePulseCommentResponse = {
  comment: PulseComment;
};

export type PulseViewer = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  anonymousUsername?: string;
  useAnonymousIdentity?: boolean;
  profileImageUrl?: string | null;
};

export type PulseLiveElectionStatus = "live" | "ended" | string;

export type PulseLiveElection = {
  id: string;
  electionName: string;
  electionType: string;
  electionLocation: string | null;
  startDate: string;
  endDate: string;
  mockElection: boolean;
  partiesCount: number;
  status: PulseLiveElectionStatus;
};

export type PulseLiveCarouselResponse = {
  status: PulseLiveElectionStatus;
  scope: string;
  total: number;
  elections: PulseLiveElection[];
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

export async function getPulseViewer(): Promise<PulseViewer> {
  const response = await apiRequest<Record<string, unknown>>("/profile/me", {
    method: "GET",
    auth: true,
  });

  const profileImage =
    response.profileImage &&
    typeof response.profileImage === "object" &&
    "url" in response.profileImage
      ? String((response.profileImage as { url?: string }).url ?? "")
      : "";

  return {
    id: typeof response._id === "string" ? response._id : undefined,
    email: typeof response.email === "string" ? response.email : undefined,
    firstName:
      typeof response.firstName === "string" ? response.firstName : undefined,
    lastName:
      typeof response.lastName === "string" ? response.lastName : undefined,
    anonymousUsername:
      typeof response.anonymousUsername === "string"
        ? response.anonymousUsername
        : undefined,
    useAnonymousIdentity:
      typeof response.useAnonymousIdentity === "boolean"
        ? response.useAnonymousIdentity
        : undefined,
    profileImageUrl: profileImage || null,
  };
}

export async function getPulsePosts(params: {
  page: number;
  limit: number;
}): Promise<PulsePostsResponse> {
  return apiRequest<PulsePostsResponse>(
    `/pulse/posts?page=${encodeQueryValue(params.page)}&limit=${encodeQueryValue(
      params.limit
    )}`,
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

  formData.append("body", normalizeBody(payload.body));
  formData.append("visibilityScope", payload.visibilityScope);
  formData.append(
    "useAnonymousDisplay",
    payload.useAnonymousDisplay ? "true" : "false"
  );

  if (payload.imageUri) {
    formData.append(
      "image",
      createImageFile(payload.imageUri, "pulse-post") as unknown as Blob
    );
  }

  return apiRequest<CreatePulsePostResponse>("/pulse/posts", {
    method: "POST",
    auth: true,
    body: formData,
  });
}

export async function likePulsePost(
  postId: string
): Promise<LikePulsePostResponse> {
  return apiRequest<LikePulsePostResponse>(
    `/pulse/posts/${encodePathSegment(postId)}/like`,
    {
      method: "POST",
      auth: true,
    }
  );
}

export async function getPulseComments(
  postId: string
): Promise<PulseCommentsResponse> {
  return apiRequest<PulseCommentsResponse>(
    `/pulse/posts/${encodePathSegment(postId)}/comments`,
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function createPulseComment(params: {
  postId: string;
  payload: CreatePulseCommentPayload;
}): Promise<CreatePulseCommentResponse> {
  return apiRequest<CreatePulseCommentResponse>(
    `/pulse/posts/${encodePathSegment(params.postId)}/comments`,
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

export async function likePulseComment(params: {
  postId: string;
  commentId: string;
}): Promise<LikePulseCommentResponse> {
  return apiRequest<LikePulseCommentResponse>(
    `/pulse/posts/${encodePathSegment(
      params.postId
    )}/comments/${encodePathSegment(params.commentId)}/like`,
    {
      method: "POST",
      auth: true,
    }
  );
}

export async function getLiveElectionCarousel(): Promise<PulseLiveCarouselResponse> {
  return apiRequest<PulseLiveCarouselResponse>("/elections/live-carousel", {
    method: "GET",
    auth: true,
  });
}