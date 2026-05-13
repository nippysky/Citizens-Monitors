import { apiRequest } from "@/lib/api/http";

export type ProfileImage = {
  location?: string;
  name?: string;
  type?: string;
  size?: number;
  url?: string;
  _id?: string;
  __v?: number;
};

export type ObserverIdFile = {
  location?: string;
  name?: string;
  type?: string;
  size?: number;
  url?: string;
  _id?: string;
  __v?: number;
};

export type MobileNotificationSettingsState = {
  pollingUnitActivity: boolean;
  electionDayAlert: boolean;
  discussionReplies: boolean;
  resultAggregated: boolean;
  reportConfirmed: boolean;
  reportFlagged: boolean;
  securityAlerts: boolean;
  newsletter: boolean;
};

export type MyProfileResponse = {
  mobileMeta?: {
    appVersion?: string;
    deviceId?: string;
    lastLoginAt?: string;
    platform?: string;
    pushToken?: string;
  };
  notifications?: {
    email?: {
      inbox?: boolean;
      election?: boolean;
      newsletter?: boolean;
    };
    mobile?: Partial<MobileNotificationSettingsState>;
  };
  _id?: string;
  id?: string;
  role?: "observer" | "volunteer" | "public-viewer" | string;
  email?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  profileImage?: ProfileImage | null;
  state?: string;
  lga?: string;
  ward?: string;
  pollingUnit?: string;
  nationality?: string;
  whyYouJoinUs?: string;
  isRegisteredVoter?: boolean;
  isPoliticalPartyMember?: boolean;
  isElectionWitnessReady?: boolean;
  isOpenToSurvey?: boolean;
  useAnonymousIdentity?: boolean;
  anonymousUsername?: string;
  isObserverInPollingUnit?: boolean;
  pendingObserverVerification?: boolean;
  coverageUpdateCount?: number;
  observerId?: ObserverIdFile[];
  phoneNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  hasSubmittedRoleForm?: boolean;
  hasSetPassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  lastLogin?: string;
  [key: string]: unknown;
};

export type UpdateMyProfilePayload = {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  profileImageUri?: string | null;
};

export type UpdatePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type UpdateNotificationSettingsResponse = {
  message: string;
  settings: MobileNotificationSettingsState;
};

export type GenerateAnonymousUsernameResponse = {
  message: string;
  anonymousUsername: string;
};

export type UpdateAnonymousIdentityPayload = {
  enabled: boolean;
};

export type UpdateAnonymousIdentityResponse = {
  message: string;
  useAnonymousIdentity: boolean;
  anonymousUsername?: string;
};

export type BankOption = {
  code: string;
  name: string;
};

export type BanksResponse = {
  banks: BankOption[];
};

export type SubmitFeedbackPayload = {
  title: string;
  message: string;
};

export type SubmitFeedbackResponse = {
  message: string;
  feedbackId: string;
};

type ReactNativeFile = {
  uri: string;
  name: string;
  type: string;
};

function trimPayload<T extends Record<string, unknown>>(payload: T): T {
  const next: Record<string, unknown> = {};

  Object.entries(payload).forEach(([key, value]) => {
    next[key] = typeof value === "string" ? value.trim() : value;
  });

  return next as T;
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

export async function getMyProfile(): Promise<MyProfileResponse> {
  return apiRequest<MyProfileResponse>("/profile/me", {
    method: "GET",
    auth: true,
  });
}

export async function updateMyProfile(
  payload: UpdateMyProfilePayload
): Promise<MyProfileResponse> {
  const hasProfileImage = Boolean(payload.profileImageUri?.trim());

  if (hasProfileImage && payload.profileImageUri) {
    const formData = new FormData();

    formData.append("firstName", payload.firstName.trim());
    formData.append("lastName", payload.lastName.trim());
    formData.append("gender", payload.gender.trim());
    formData.append("dateOfBirth", payload.dateOfBirth.trim());
    formData.append(
      "profileImage",
      createImageFile(payload.profileImageUri, "profile-image") as unknown as Blob
    );

    return apiRequest<MyProfileResponse>("/profile/me", {
      method: "PUT",
      auth: true,
      body: formData,
    });
  }

  return apiRequest<MyProfileResponse>("/profile/me", {
    method: "PUT",
    auth: true,
    body: trimPayload({
      firstName: payload.firstName,
      lastName: payload.lastName,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
    }),
  });
}

export async function updatePassword(
  payload: UpdatePasswordPayload
): Promise<MyProfileResponse> {
  return apiRequest<MyProfileResponse>("/profile/me/password", {
    method: "PUT",
    auth: true,
    body: trimPayload(payload),
  });
}

export async function getMobileNotificationSettings(): Promise<MobileNotificationSettingsState> {
  return apiRequest<MobileNotificationSettingsState>("/profile/notifications", {
    method: "GET",
    auth: true,
  });
}

export async function updateNotificationSettings(
  payload: MobileNotificationSettingsState
): Promise<UpdateNotificationSettingsResponse> {
  return apiRequest<UpdateNotificationSettingsResponse>(
    "/profile/notifications",
    {
      method: "PUT",
      auth: true,
      body: payload,
    }
  );
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

export async function updateAnonymousIdentity(
  payload: UpdateAnonymousIdentityPayload
): Promise<UpdateAnonymousIdentityResponse> {
  return apiRequest<UpdateAnonymousIdentityResponse>(
    "/profile/me/anonymous-identity",
    {
      method: "PUT",
      auth: true,
      body: payload,
    }
  );
}

export async function getBanks(): Promise<BankOption[]> {
  const response = await apiRequest<BanksResponse>("/banks", {
    method: "GET",
    auth: false,
  });

  return response.banks;
}

export async function submitFeedback(
  payload: SubmitFeedbackPayload
): Promise<SubmitFeedbackResponse> {
  return apiRequest<SubmitFeedbackResponse>("/profile/feedback", {
    method: "POST",
    auth: true,
    body: trimPayload(payload),
  });
}