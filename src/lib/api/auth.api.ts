import { apiRequest } from "@/lib/api/http";
import { getRegistrationDevicePayload } from "@/lib/device/getRegistrationDevicePayload";

export type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterResponse = {
  message: string;
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const devicePayload = await getRegistrationDevicePayload();

  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: {
      email: normalizeEmail(payload.email),
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      ...devicePayload,
    },
  });
}

export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<VerifyEmailResponse> {
  return apiRequest<VerifyEmailResponse>("/auth/verify-email", {
    method: "POST",
    body: {
      email: normalizeEmail(payload.email),
      verificationCode: payload.verificationCode.trim(),
    },
  });
}

export async function resendVerificationToken(
  payload: ResendVerificationTokenPayload
): Promise<ResendVerificationTokenResponse> {
  return apiRequest<ResendVerificationTokenResponse>("/auth/resend-token", {
    method: "POST",
    body: {
      email: normalizeEmail(payload.email),
    },
  });
}