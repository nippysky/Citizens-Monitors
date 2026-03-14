import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

import { AuthState, AuthUser } from "@/types/auth";

type SignInOptions = {
  hasCompletedOnboarding?: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (user: AuthUser, options?: SignInOptions) => void;
  signOut: () => void;
  completeOnboarding: (user?: Partial<AuthUser>) => void;
  startOnboarding: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isOnboardingComplete: false,
    user: null,
  });

  const signIn = (user: AuthUser, options?: SignInOptions) => {
    const hasCompletedOnboarding =
      options?.hasCompletedOnboarding ?? true;

    setState({
      isAuthenticated: true,
      isOnboardingComplete: hasCompletedOnboarding,
      user,
    });
  };

  const startOnboarding = (user: AuthUser) => {
    setState({
      isAuthenticated: true,
      isOnboardingComplete: false,
      user,
    });
  };

  const signOut = () => {
    setState({
      isAuthenticated: false,
      isOnboardingComplete: false,
      user: null,
    });
  };

  const completeOnboarding = (userPatch?: Partial<AuthUser>) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      isOnboardingComplete: true,
      user: prev.user
        ? {
            ...prev.user,
            ...userPatch,
          }
        : {
            id: "local-user",
            email: userPatch?.email ?? "",
            firstName: userPatch?.firstName,
          },
    }));
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signOut,
      completeOnboarding,
      startOnboarding,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}