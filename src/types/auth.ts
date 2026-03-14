export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  user: AuthUser | null;
};