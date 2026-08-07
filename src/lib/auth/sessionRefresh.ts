// ─── src/lib/auth/sessionRefresh.ts ──────────────────────────────────────────
// Single source of truth for renewing the access token.
//
// HOW THE BACKEND'S TOKENS WORK
// - access token  (`token`)        — short-lived, 1 hour. Sent as the Bearer
//                                    header on every request.
// - refresh token (`refreshToken`) — long-lived. Its ONLY job is to mint a
//                                    new access token via POST /auth/refresh.
//
// So "staying logged in" is not about keeping the access token alive; it's
// about holding a valid refresh token and quietly swapping it for a new
// access token whenever the old one lapses. The user never notices.
//
// SINGLE-FLIGHT
// A cold start can fire several requests at once, each hitting a 401. Without
// coordination they'd all POST /auth/refresh simultaneously — and because the
// backend ROTATES the refresh token on every call, the later ones would
// present an already-consumed token and fail, logging the user out. Every
// caller therefore awaits the same in-flight promise.

import {
  refreshSession as refreshSessionRequest,
} from "@/lib/api/auth.api";
import { setApiAccessToken } from "@/lib/api/authToken";
import {
  restoreAuthSession,
  saveRotatedTokens,
} from "@/lib/auth/authSessionStorage";

export type RefreshOutcome =
  | { ok: true; token: string; refreshToken: string }
  /** No refresh token stored — the user must sign in again. */
  | { ok: false; reason: "no-refresh-token" }
  /** Server rejected the refresh token (expired / revoked / reused). */
  | { ok: false; reason: "rejected" }
  /** Network or server error — the session may still be fine, retry later. */
  | { ok: false; reason: "network" };

let inFlight: Promise<RefreshOutcome> | null = null;

/** Listeners notified when a refresh definitively fails (session is dead). */
type InvalidListener = () => void;
const invalidListeners = new Set<InvalidListener>();

export function onSessionInvalidated(listener: InvalidListener): () => void {
  invalidListeners.add(listener);
  return () => invalidListeners.delete(listener);
}

function notifyInvalidated(): void {
  invalidListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // A bad listener must not break the refresh pipeline.
    }
  });
}

function isRejection(error: unknown): boolean {
  // ApiError carries a numeric status; 4xx means the token itself is bad,
  // which is unrecoverable. Anything else (offline, 5xx) is worth retrying.
  const status = (error as { status?: unknown })?.status;
  return typeof status === "number" && status >= 400 && status < 500;
}

async function performRefresh(): Promise<RefreshOutcome> {
  const stored = await restoreAuthSession();

  if (!stored.refreshToken) {
    return { ok: false, reason: "no-refresh-token" };
  }

  try {
    const response = await refreshSessionRequest(stored.refreshToken);

    if (!response?.token) {
      return { ok: false, reason: "rejected" };
    }

    // Rotation: the backend returns a NEW refresh token each time. Persist it
    // immediately or the next refresh will present a consumed one.
    const nextRefreshToken = response.refreshToken || stored.refreshToken;

    await saveRotatedTokens({
      token: response.token,
      refreshToken: nextRefreshToken,
    });

    setApiAccessToken(response.token);

    return {
      ok: true,
      token: response.token,
      refreshToken: nextRefreshToken,
    };
  } catch (error) {
    if (isRejection(error)) {
      return { ok: false, reason: "rejected" };
    }

    return { ok: false, reason: "network" };
  }
}

/**
 * Renew the access token, coalescing concurrent callers into one request.
 */
export async function refreshAccessToken(): Promise<RefreshOutcome> {
  if (inFlight) return inFlight;

  inFlight = performRefresh().finally(() => {
    inFlight = null;
  });

  const outcome = await inFlight;

  // Only a definitive rejection kills the session. Network blips must not
  // sign people out — they'd lose access while simply being offline.
  if (!outcome.ok && outcome.reason !== "network") {
    notifyInvalidated();
  }

  return outcome;
}
