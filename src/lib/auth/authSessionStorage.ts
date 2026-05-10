import * as SecureStore from "expo-secure-store";

import { AuthUser } from "@/types/auth";

const AUTH_TOKEN_KEY = "citizen_monitors.auth.token";
const AUTH_USER_KEY = "citizen_monitors.auth.user";
const AUTH_ONBOARDING_COMPLETE_KEY =
  "citizen_monitors.auth.onboarding_complete";

export type StoredAuthSession = {
  token: string | null;
  user: AuthUser | null;
  isOnboardingComplete: boolean;
};

async function safeSetItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

async function safeGetItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

async function safeDeleteItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

function parseStoredUser(rawUser: string | null): AuthUser | null {
  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser) as AuthUser;

    if (!parsed.email || !parsed.id) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function saveAuthSession(session: StoredAuthSession): Promise<void> {
  const writes: Promise<void>[] = [];

  if (session.token) {
    writes.push(safeSetItem(AUTH_TOKEN_KEY, session.token));
  } else {
    writes.push(safeDeleteItem(AUTH_TOKEN_KEY));
  }

  if (session.user) {
    writes.push(safeSetItem(AUTH_USER_KEY, JSON.stringify(session.user)));
  } else {
    writes.push(safeDeleteItem(AUTH_USER_KEY));
  }

  writes.push(
    safeSetItem(
      AUTH_ONBOARDING_COMPLETE_KEY,
      session.isOnboardingComplete ? "true" : "false"
    )
  );

  await Promise.all(writes);
}

export async function restoreAuthSession(): Promise<StoredAuthSession> {
  const [token, rawUser, rawOnboardingComplete] = await Promise.all([
    safeGetItem(AUTH_TOKEN_KEY),
    safeGetItem(AUTH_USER_KEY),
    safeGetItem(AUTH_ONBOARDING_COMPLETE_KEY),
  ]);

  const user = parseStoredUser(rawUser);

  return {
    token,
    user,
    isOnboardingComplete: rawOnboardingComplete === "true",
  };
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([
    safeDeleteItem(AUTH_TOKEN_KEY),
    safeDeleteItem(AUTH_USER_KEY),
    safeDeleteItem(AUTH_ONBOARDING_COMPLETE_KEY),
  ]);
}