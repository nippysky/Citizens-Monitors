import { apiRequest } from "@/lib/api/http";
import { getRegistrationDevicePayload } from "@/lib/device/getRegistrationDevicePayload";

export type MobileUserRole = "observer" | "volunteer" | "public-viewer";

export type MobileUploadedFile = {
  location?: string;
  name?: string;
  type?: string;
  size?: number;
  url?: string;
  _id?: string;
  __v?: number;
};

export type MobileUser = {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  role?: MobileUserRole;
  state?: string;
  lga?: string;
  ward?: string;
  pollingUnit?: string;
  nationality?: string;
  whyYouJoinUs?: string;
  profileImage?: MobileUploadedFile;
  observerId?: MobileUploadedFile[];
  isRegisteredVoter?: boolean;
  isPoliticalPartyMember?: boolean;
  isElectionWitnessReady?: boolean;
  isOpenToSurvey?: boolean;
  isObserverInPollingUnit?: boolean;
  pendingObserverVerification?: boolean;
  hasSubmittedRoleForm?: boolean;
  hasSetPassword?: boolean;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterResponse = {
  message: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignInResponse = {
  message: string;
  token: string;
  user: MobileUser;
};

export type VerifyEmailPayload = {
  email: string;
  verificationCode: string;
};

export type VerifyEmailResponse = {
  message: string;
};

export type ResendVerificationTokenPayload = {
  email: string;
};

export type ResendVerificationTokenResponse = {
  message: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResendForgotPasswordOtpPayload = {
  email: string;
};

export type ResendForgotPasswordOtpResponse = {
  message: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  password: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type SubmitDetailsPayload = {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  nationality: string;
  whyYouJoinUs: string;
  isRegisteredVoter: boolean;
  isPoliticalPartyMember: boolean;
  isElectionWitnessReady: boolean;
  isOpenToSurvey: boolean;
};

export type SubmitDetailsResponse = {
  message: string;
  user: MobileUser;
  isObserverInPollingUnit: boolean;
};

export type CitizenRole = MobileUserRole;

export type SelectRolePayload = {
  email: string;
  role: CitizenRole;
};

export type SelectRoleResponse = {
  message: string;
  token?: string;
  user?: MobileUser;
  nextStep?: string;
};

export type SubmitObserverRolePayload = {
  email: string;
  frontPvcUri: string;
  backPvcUri: string;
};

export type SubmitObserverRoleResponse = {
  message: string;
  token: string;
  user: MobileUser;
};

type ReactNativeFile = {
  uri: string;
  name: string;
  type: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function cleanText(value: string): string {
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

function appendImageFile(
  formData: FormData,
  fieldName: string,
  uri: string,
  fallbackName: string
): void {
  formData.append(
    fieldName,
    createImageFile(uri, fallbackName) as unknown as Blob
  );
}

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const devicePayload = await getRegistrationDevicePayload();

  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: {
      email: normalizeEmail(payload.email),
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      ...devicePayload,
    },
  });
}

export async function signInUser(
  payload: SignInPayload
): Promise<SignInResponse> {
  const devicePayload = await getRegistrationDevicePayload();

  return apiRequest<SignInResponse>("/auth/signin", {
    method: "POST",
    auth: false,
    body: {
      email: normalizeEmail(payload.email),
      password: payload.password,
      ...devicePayload,
    },
  });
}

export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<VerifyEmailResponse> {
  return apiRequest<VerifyEmailResponse>("/auth/verify-email", {
    method: "POST",
    auth: false,
    body: {
      email: normalizeEmail(payload.email),
      verificationCode: cleanText(payload.verificationCode),
    },
  });
}

export async function resendVerificationToken(
  payload: ResendVerificationTokenPayload
): Promise<ResendVerificationTokenResponse> {
  return apiRequest<ResendVerificationTokenResponse>("/auth/resend-token", {
    method: "POST",
    auth: false,
    body: {
      email: normalizeEmail(payload.email),
    },
  });
}

export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: {
      email: normalizeEmail(payload.email),
    },
  });
}

export async function resendForgotPasswordOtp(
  payload: ResendForgotPasswordOtpPayload
): Promise<ResendForgotPasswordOtpResponse> {
  return apiRequest<ResendForgotPasswordOtpResponse>(
    "/auth/resend-forgot-password-otp",
    {
      method: "POST",
      auth: false,
      body: {
        email: normalizeEmail(payload.email),
      },
    }
  );
}

export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>("/auth/reset-password", {
    method: "POST",
    auth: false,
    body: {
      email: normalizeEmail(payload.email),
      otp: cleanText(payload.otp),
      password: payload.password,
    },
  });
}

export async function submitDetails(
  payload: SubmitDetailsPayload
): Promise<SubmitDetailsResponse> {
  return apiRequest<SubmitDetailsResponse>("/auth/submit-details", {
    method: "POST",
    auth: false,
    body: {
      email: normalizeEmail(payload.email),
      firstName: cleanText(payload.firstName),
      lastName: cleanText(payload.lastName),
      gender: cleanText(payload.gender),
      dateOfBirth: cleanText(payload.dateOfBirth),
      state: cleanText(payload.state),
      lga: cleanText(payload.lga),
      ward: cleanText(payload.ward),
      pollingUnit: cleanText(payload.pollingUnit),
      nationality: cleanText(payload.nationality),
      whyYouJoinUs: cleanText(payload.whyYouJoinUs),
      isRegisteredVoter: payload.isRegisteredVoter,
      isPoliticalPartyMember: payload.isPoliticalPartyMember,
      isElectionWitnessReady: payload.isElectionWitnessReady,
      isOpenToSurvey: payload.isOpenToSurvey,
    },
  });
}

export async function selectRole(
  payload: SelectRolePayload
): Promise<SelectRoleResponse> {
  return apiRequest<SelectRoleResponse>("/auth/select-role", {
    method: "POST",
    auth: false,
    body: {
      email: normalizeEmail(payload.email),
      role: payload.role,
    },
  });
}

export async function submitObserverRole(
  payload: SubmitObserverRolePayload
): Promise<SubmitObserverRoleResponse> {
  const formData = new FormData();

  formData.append("email", normalizeEmail(payload.email));
  appendImageFile(formData, "observerId[]", payload.frontPvcUri, "front-pvc");
  appendImageFile(formData, "observerId[]", payload.backPvcUri, "back-pvc");

  return apiRequest<SubmitObserverRoleResponse>("/auth/observer-role", {
    method: "POST",
    auth: false,
    body: formData,
  });
}