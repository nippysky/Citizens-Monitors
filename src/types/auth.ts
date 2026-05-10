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

export type AuthState = {
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isRestoring: boolean;
  token: string | null;
  user: AuthUser | null;
};