import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import {
  clearApiAccessToken,
  setApiAccessToken,
} from "@/lib/api/authToken";
import {
  clearAuthSession,
  restoreAuthSession,
  saveAuthSession,
} from "@/lib/auth/authSessionStorage";
import { isTokenExpired } from "@/lib/auth/jwt";
import { refreshAccessToken, onSessionInvalidated } from "@/lib/auth/sessionRefresh";
import { AuthState, AuthUser } from "@/types/auth";
import { clearCachedMyProfile } from "@/lib/profile/profileCache";

type SignInOptions = {
  hasCompletedOnboarding?: boolean;
  token?: string | null;
  /**
   * Long-lived refresh token from the auth response. This is what keeps the
   * user signed in across app restarts — without it they'd be forced back to
   * the login form once the 1-hour access token lapses.
   */
  refreshToken?: string | null;
};

type CompleteOnboardingOptions = {
  token?: string | null;
};

type AuthContextValue = AuthState & {
  signIn: (user: AuthUser, options?: SignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  /** Biometric unlock + silent re-auth. Resolves true when back in. */
  unlockSession: () => Promise<boolean>;
  /** Downgrade to the locked state (expired token, vault available). */
  lockSession: () => Promise<void>;
  completeOnboarding: (
    user?: Partial<AuthUser>,
    options?: CompleteOnboardingOptions
  ) => Promise<void>;
  startOnboarding: (
    user: AuthUser,
    options?: { token?: string | null; refreshToken?: string | null }
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
  sessionStatus: "signed-out",
  lockedUser: null,
};

const SIGNED_OUT_STATE: AuthState = {
  ...INITIAL_AUTH_STATE,
  isRestoring: false,
};

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<AuthState>(INITIAL_AUTH_STATE);

  // Lets the AppState listener call lockSession without re-subscribing.
  const lockSessionRef = useRef<(() => Promise<void>) | null>(null);

  /**
   * Decide the session state from what's on disk.
   *
   * The old bug: we trusted the mere PRESENCE of a token, so an expired one
   * rendered a fully "logged in" shell where every request 401'd — blank
   * screens, then a jarring bounce to welcome once some request finally
   * tripped the session-expired handler. Now expiry is checked up front and
   * the user is either in, gently locked (biometric re-entry), or signed out.
   */
  const resolveStoredSession = useCallback(async (): Promise<AuthState> => {
    const restored = await restoreAuthSession();

    if (!restored.user) return SIGNED_OUT_STATE;

    const authenticatedState = (token: string): AuthState => ({
      isAuthenticated: true,
      isOnboardingComplete: restored.isOnboardingComplete,
      isRestoring: false,
      token,
      user: restored.user,
      sessionStatus: "authenticated",
      lockedUser: null,
    });

    // Access token still good — straight in.
    if (restored.token && !isTokenExpired(restored.token)) {
      return authenticatedState(restored.token);
    }

    // Access token lapsed (it only lives an hour). The refresh token is what
    // actually keeps the user signed in, so renew silently — this is why a
    // returning user never sees a login form.
    if (restored.refreshToken) {
      const outcome = await refreshAccessToken();

      if (outcome.ok) return authenticatedState(outcome.token);

      // Offline: keep the session and let the app retry later rather than
      // signing out someone who simply has no connection.
      if (outcome.reason === "network" && restored.token) {
        return authenticatedState(restored.token);
      }

      if (outcome.reason === "network") {
        return {
          ...SIGNED_OUT_STATE,
          isOnboardingComplete: restored.isOnboardingComplete,
          sessionStatus: "locked",
          lockedUser: restored.user,
        };
      }
    }

    // No refresh token, or the server rejected it — the session is truly over.
    await clearAuthSession();
    return SIGNED_OUT_STATE;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function hydrateAuthState() {
      try {
        const next = await resolveStoredSession();

        if (!mounted) return;

        setApiAccessToken(next.token);
        setState(next);
      } catch (error) {
        console.log("Auth restore error:", error);

        if (!mounted) return;

        clearApiAccessToken();
        setState(SIGNED_OUT_STATE);
      }
    }

    void hydrateAuthState();

    return () => {
      mounted = false;
    };
  }, [resolveStoredSession]);

  /**
   * Catch expiry the moment the app comes back to the foreground.
   *
   * Without this, a session that died while the app was backgrounded stays
   * visually "logged in" until some request happens to 401 — the exact
   * deceptive state we're eliminating.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      if (next !== "active") return;

      setState((previous) => {
        if (previous.sessionStatus !== "authenticated") return previous;
        if (!isTokenExpired(previous.token)) return previous;

        clearApiAccessToken();

        // Decide lock-vs-signout asynchronously; lockSession handles both.
        void lockSessionRef.current?.();

        return previous;
      });
    });

    return () => subscription.remove();
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
        sessionStatus: "authenticated",
        lockedUser: null,
      };

      setApiAccessToken(token);
      setState(nextState);

      await saveAuthSession({
        token,
        refreshToken: options?.refreshToken ?? null,
        user,
        isOnboardingComplete: hasCompletedOnboarding,
      });
    },
    []
  );

  /**
   * Retry a stalled session — used by the unlock screen when an earlier
   * refresh failed because the device was offline.
   */
  const unlockSession = useCallback(async (): Promise<boolean> => {
    const outcome = await refreshAccessToken();
    if (!outcome.ok) return false;

    const stored = await restoreAuthSession();
    if (!stored.user) return false;

    setState({
      isAuthenticated: true,
      isOnboardingComplete: stored.isOnboardingComplete,
      isRestoring: false,
      token: outcome.token,
      user: stored.user,
      sessionStatus: "authenticated",
      lockedUser: null,
    });

    return true;
  }, []);

  /**
   * Session can't be renewed right now (offline). Hold the user in a
   * recoverable locked state instead of destroying their session.
   */
  const lockSession = useCallback(async (): Promise<void> => {
    clearApiAccessToken();

    setState((previous) => ({
      isAuthenticated: false,
      isOnboardingComplete: previous.isOnboardingComplete,
      isRestoring: false,
      token: null,
      user: null,
      sessionStatus: "locked",
      lockedUser: previous.user ?? previous.lockedUser,
    }));
  }, []);

  useEffect(() => {
    lockSessionRef.current = lockSession;
  }, [lockSession]);

  const startOnboarding = useCallback(
    async (
      user: AuthUser,
      options?: { token?: string | null; refreshToken?: string | null }
    ) => {
      const token = options?.token ?? null;

      const nextState: AuthState = {
        isAuthenticated: true,
        isOnboardingComplete: false,
        isRestoring: false,
        token,
        user,
        sessionStatus: "authenticated",
        lockedUser: null,
      };

      setApiAccessToken(token);
      setState(nextState);

      await saveAuthSession({
        token,
        refreshToken: options?.refreshToken ?? null,
        user,
        isOnboardingComplete: false,
      });
    },
    []
  );

const signOut = useCallback(async () => {
  clearApiAccessToken();

  setState(SIGNED_OUT_STATE);

  // Explicit sign-out also forgets the vaulted credentials — biometric
  // re-entry must never outlive a deliberate logout.
  await Promise.all([
    clearAuthSession(),
    clearCachedMyProfile(),
  ]);
}, []);

  /**
   * The refresh token itself was rejected (expired / revoked / reused) —
   * the ONLY condition that genuinely ends a session. Network failures never
   * reach here, so a user offline is never signed out.
   */
  useEffect(() => {
    return onSessionInvalidated(() => {
      void signOut();
    });
  }, [signOut]);

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
        sessionStatus: token ? "authenticated" : "signed-out",
        lockedUser: null,
      };

      setApiAccessToken(token);
      setState(nextState);

      // Preserve the stored refresh token — completing onboarding must not
      // wipe the credential that keeps the session alive.
      const persisted = await restoreAuthSession();

      await saveAuthSession({
        token,
        refreshToken: persisted.refreshToken,
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
      unlockSession,
      lockSession,
      completeOnboarding,
      startOnboarding,
    }),
    [
      state,
      signIn,
      signOut,
      unlockSession,
      lockSession,
      completeOnboarding,
      startOnboarding,
    ]
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