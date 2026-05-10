import { apiRequest } from "@/lib/api/http";
import { MobileUser } from "@/lib/api/auth.api";

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

export type MyProfileResponse = MobileUser & {
  mobileMeta?: {
    appVersion?: string;
    deviceId?: string;
    platform?: string;
    pushToken?: string;
    lastLoginAt?: string;
  };
  notifications?: {
    email?: {
      inbox?: boolean;
      election?: boolean;
      newsletter?: boolean;
    };
    mobile?: Partial<MobileNotificationSettingsState>;
  };
  phoneNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  anonymousUsername?: string;
  useAnonymousIdentity?: boolean;
  coverageUpdateCount?: number;
  lastLogin?: string;
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

const PROFILE_NOTIFICATIONS_PATH = "/profile/notifications";

export async function getMyProfile(): Promise<MyProfileResponse> {
  return apiRequest<MyProfileResponse>("/profile/me", {
    method: "GET",
    auth: true,
  });
}

export async function updateMyPassword(
  payload: UpdatePasswordPayload
): Promise<MyProfileResponse> {
  return apiRequest<MyProfileResponse>("/profile/me/password", {
    method: "PUT",
    auth: true,
    body: payload,
  });
}

export async function getMobileNotificationSettings(): Promise<MobileNotificationSettingsState> {
  return apiRequest<MobileNotificationSettingsState>(
    PROFILE_NOTIFICATIONS_PATH,
    {
      method: "GET",
      auth: true,
    }
  );
}

export async function updateMobileNotificationSettings(
  payload: MobileNotificationSettingsState
): Promise<UpdateNotificationSettingsResponse> {
  return apiRequest<UpdateNotificationSettingsResponse>(
    PROFILE_NOTIFICATIONS_PATH,
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

  return response.banks
    .filter((bank) => bank.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type SubmitFeedbackPayload = {
  title: string;
  message: string;
};

export type SubmitFeedbackResponse = {
  message: string;
  feedbackId: string;
};

export async function submitFeedback(
  payload: SubmitFeedbackPayload
): Promise<SubmitFeedbackResponse> {
  return apiRequest<SubmitFeedbackResponse>("/profile/feedback", {
    method: "POST",
    auth: true,
    body: {
      title: payload.title.trim(),
      message: payload.message.trim(),
    },
  });
}