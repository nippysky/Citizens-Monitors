import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearApiAccessToken,
  setApiAccessToken,
} from "@/lib/api/authToken";
import {
  clearAuthSession,
  restoreAuthSession,
  saveAuthSession,
} from "@/lib/auth/authSessionStorage";
import { AuthState, AuthUser } from "@/types/auth";
import { clearCachedMyProfile } from "@/lib/profile/profileCache";

type SignInOptions = {
  hasCompletedOnboarding?: boolean;
  token?: string | null;
};

type CompleteOnboardingOptions = {
  token?: string | null;
};

type AuthContextValue = AuthState & {
  signIn: (user: AuthUser, options?: SignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (
    user?: Partial<AuthUser>,
    options?: CompleteOnboardingOptions
  ) => Promise<void>;
  startOnboarding: (
    user: AuthUser,
    options?: { token?: string | null }
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  children: ReactNode;
};

const INITIAL_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  isOnboardingComplete: false,
  isRestoring: true,
  token: null,
  user: null,
};

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<AuthState>(INITIAL_AUTH_STATE);

  useEffect(() => {
    let mounted = true;

    async function hydrateAuthState() {
      try {
        const restored = await restoreAuthSession();

        if (!mounted) return;

        setApiAccessToken(restored.token);

        setState({
          isAuthenticated: Boolean(restored.token && restored.user),
          isOnboardingComplete: restored.isOnboardingComplete,
          isRestoring: false,
          token: restored.token,
          user: restored.user,
        });
      } catch (error) {
        console.log("Auth restore error:", error);

        if (!mounted) return;

        clearApiAccessToken();

        setState({
          isAuthenticated: false,
          isOnboardingComplete: false,
          isRestoring: false,
          token: null,
          user: null,
        });
      }
    }

    void hydrateAuthState();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(
    async (user: AuthUser, options?: SignInOptions) => {
      const hasCompletedOnboarding =
        options?.hasCompletedOnboarding ?? true;
      const token = options?.token ?? null;

      const nextState: AuthState = {
        isAuthenticated: true,
        isOnboardingComplete: hasCompletedOnboarding,
        isRestoring: false,
        token,
        user,
      };

      setApiAccessToken(token);
      setState(nextState);

      await saveAuthSession({
        token,
        user,
        isOnboardingComplete: hasCompletedOnboarding,
      });
    },
    []
  );

  const startOnboarding = useCallback(
    async (user: AuthUser, options?: { token?: string | null }) => {
      const token = options?.token ?? null;

      const nextState: AuthState = {
        isAuthenticated: true,
        isOnboardingComplete: false,
        isRestoring: false,
        token,
        user,
      };

      setApiAccessToken(token);
      setState(nextState);

      await saveAuthSession({
        token,
        user,
        isOnboardingComplete: false,
      });
    },
    []
  );

const signOut = useCallback(async () => {
  clearApiAccessToken();

  setState({
    isAuthenticated: false,
    isOnboardingComplete: false,
    isRestoring: false,
    token: null,
    user: null,
  });

  await Promise.all([clearAuthSession(), clearCachedMyProfile()]);
}, []);

  const completeOnboarding = useCallback(
    async (userPatch?: Partial<AuthUser>, options?: CompleteOnboardingOptions) => {
      const previousState = state;

      const token = options?.token ?? previousState.token;

      const user: AuthUser = previousState.user
        ? {
            ...previousState.user,
            ...userPatch,
          }
        : {
            id: userPatch?.id ?? userPatch?.email ?? "mobile-user",
            email: userPatch?.email ?? "",
            firstName: userPatch?.firstName,
            lastName: userPatch?.lastName,
            role: userPatch?.role,
            profileImageUrl: userPatch?.profileImageUrl,
            pendingObserverVerification:
              userPatch?.pendingObserverVerification,
          };

      const nextState: AuthState = {
        isAuthenticated: Boolean(token),
        isOnboardingComplete: true,
        isRestoring: false,
        token,
        user,
      };

      setApiAccessToken(token);
      setState(nextState);

      await saveAuthSession({
        token,
        user,
        isOnboardingComplete: true,
      });
    },
    [state]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signOut,
      completeOnboarding,
      startOnboarding,
    }),
    [state, signIn, signOut, completeOnboarding, startOnboarding]
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