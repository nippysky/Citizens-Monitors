import { apiRequest } from "@/lib/api/http";
import { getRegistrationDevicePayload } from "@/lib/device/getRegistrationDevicePayload";
import {
  normalizePvcImageForUpload,
  NormalizedPvcImage,
} from "@/lib/media/normalizePvcImage";

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

type ReactNativeUploadFile = {
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

function appendUploadFile(
  formData: FormData,
  fieldName: string,
  file: NormalizedPvcImage
): void {
  const uploadFile: ReactNativeUploadFile = {
    uri: file.uri,
    name: file.name,
    type: file.type,
  };

  formData.append(fieldName, uploadFile as unknown as Blob);
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
    auth: true,
    body: {
      email: normalizeEmail(payload.email),
      role: payload.role,
    },
  });
}

export async function submitObserverRole(
  payload: SubmitObserverRolePayload
): Promise<SubmitObserverRoleResponse> {
  const [frontPvc, backPvc] = await Promise.all([
    normalizePvcImageForUpload(payload.frontPvcUri, "front"),
    normalizePvcImageForUpload(payload.backPvcUri, "back"),
  ]);

  const formData = new FormData();

  formData.append("email", normalizeEmail(payload.email));
  appendUploadFile(formData, "observerId[]", frontPvc);
  appendUploadFile(formData, "observerId[]", backPvc);

  return apiRequest<SubmitObserverRoleResponse>("/auth/observer-role", {
    method: "POST",
    auth: true,
    body: formData,
    timeoutMs: 180_000,
  });
}

// ============================================================================
// REPLACE the previous googleAuth snippet at the bottom of src/lib/api/auth.api.ts
// with this version. Everything above (registerUser, signInUser, etc.) stays
// exactly as it is.
// ============================================================================
//
// Matches the actual backend contract:
//   Request:  { idToken, expires_in, ...devicePayload (platform, deviceId, ...) }
//   Response: { message, token, user: MobileUser, requiresPasswordSetup, nextStep }
//
// Routing rules (handled by the caller, not here):
//   - requiresPasswordSetup === true   → set-password screen
//   - requiresPasswordSetup === false  → app home
//
// ============================================================================

// ----- Types -----------------------------------------------------------------

export type GoogleAuthPayload = {
  /** The ID token returned by Google's native SDK to the mobile app.
   *  Backend verifies its `aud` claim against our Web OAuth Client ID and
   *  trusts the `email` + `sub` claims. */
  idToken: string;
};

export type GoogleAuthResponse = {
  message: string;
  token: string;
  user: MobileUser;
  /**
   * True when this Google account had no existing user OR the existing user
   * has not yet set a password. Client should route to the set-password
   * screen so the user can also log in later via email + password.
   *
   * False for returning users who already have a password set. Client routes
   * straight to the app shell.
   */
  requiresPasswordSetup: boolean;
  /**
   * Backend-suggested next step in the onboarding funnel.
   * Observed values: "set_password", "select_role", "submit_details", "home".
   * Reserved for richer routing logic later; today the client only acts on
   * `requiresPasswordSetup`. Kept on the type so future screens can read it
   * without another API change.
   */
  nextStep?: string;
};

// ----- Request ---------------------------------------------------------------

/**
 * Google ID tokens issued by the mobile SDK have a 1-hour lifetime.
 * "3599" matches what Google's official OAuth libraries report (one second
 * short of an hour, to account for clock skew). This is informational only —
 * the backend decodes the idToken's `exp` claim itself for the authoritative
 * value — but the field is in the documented contract so we include it.
 */
const GOOGLE_ID_TOKEN_EXPIRES_IN = "3599";

/**
 * Exchange a Google idToken for a Citizen Monitors session.
 *
 * The same endpoint handles both first-time Google sign-up AND repeat
 * sign-in:
 *   - If the Google account is brand new, the backend creates a user record
 *     with `hasSetPassword: false` and returns requiresPasswordSetup: true.
 *   - If the Google account already maps to an existing user, the backend
 *     signs them in and returns requiresPasswordSetup: false.
 *
 * Device telemetry is attached the same way as register/sign-in so the
 * backend has consistent context for fraud, audit, and push-target lookup.
 */
export async function googleAuth(
  payload: GoogleAuthPayload
): Promise<GoogleAuthResponse> {
  const devicePayload = await getRegistrationDevicePayload();

  return apiRequest<GoogleAuthResponse>("/auth/google", {
    method: "POST",
    auth: false,
    body: {
      idToken: payload.idToken,
      expires_in: GOOGLE_ID_TOKEN_EXPIRES_IN,
      ...devicePayload,
    },
  });
}

// ============================================================================
// APPEND to src/lib/api/auth.api.ts (next to / below the googleAuth section).
// ============================================================================
//
// Endpoint: POST /auth/set-password
// Auth:     REQUIRED — Bearer token from the prior /auth/google response.
//
// Used by users who signed up via Google OAuth (where requiresPasswordSetup
// came back true). Setting a password here lets them ALSO log in later with
// email + password — without needing Google.
//
// IMPORTANT — Not to be confused with /auth/reset-password (the OTP-based
// forgot-password flow). That one is `resetPassword()` above; this one is
// for an already-authenticated user choosing a password for the first time.
// ============================================================================

// ----- Types -----------------------------------------------------------------

export type SetPasswordPayload = {
  password: string;
  confirmPassword: string;
};

export type SetPasswordResponse = {
  message: string;
  /** Backend-suggested next step in the onboarding funnel.
   *  Observed values: "user_coverage", "select_role", "home".
   *  Captured for future routing logic; today the client always sends the
   *  user to the onboarding wizard after a successful set-password. */
  nextStep?: string;
};

// ----- Request ---------------------------------------------------------------

export async function setPassword(
  payload: SetPasswordPayload
): Promise<SetPasswordResponse> {
  return apiRequest<SetPasswordResponse>("/auth/set-password", {
    method: "POST",
    // Backend requires the Bearer token issued by the prior /auth/google call.
    // apiRequest auto-attaches it from getApiAccessToken(), which reads from
    // SecureStore — that token was persisted when we called signIn() during
    // the Google flow.
    auth: true,
    body: {
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    },
  });
}