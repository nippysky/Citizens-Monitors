export type AuthRole = "observer" | "volunteer" | "public-viewer";

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: AuthRole;
  profileImageUrl?: string;
  pendingObserverVerification?: boolean;
};

/**
 * Where the stored session stands at boot / after an expiry.
 *
 * - "authenticated": live token, user is in.
 * - "locked":        token expired BUT credentials are stored behind device
 *                    biometrics, so the user can return with Face ID /
 *                    fingerprint / PIN — no email + password retype.
 * - "signed-out":    nothing usable; show welcome / sign-in.
 */
export type SessionStatus = "authenticated" | "locked" | "signed-out";

export type AuthState = {
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isRestoring: boolean;
  token: string | null;
  user: AuthUser | null;
  /** Set when the session is "locked" — used to greet the returning user. */
  sessionStatus: SessionStatus;
  lockedUser: AuthUser | null;
};