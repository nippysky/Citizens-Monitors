// ─── src/lib/auth/jwt.ts ─────────────────────────────────────────────────────
// Minimal, dependency-free JWT inspection.
//
// We only ever READ the unverified payload to learn when a token expires —
// signature verification stays server-side. This lets the app know a stored
// session is dead BEFORE rendering the app shell, instead of discovering it
// through a wave of failed requests.

/** Treat a token as expired this many ms early (clock skew + request time). */
const EXPIRY_SKEW_MS = 30_000;

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Self-contained base64url decoder.
 *
 * Deliberately does NOT rely on a global `atob`: React Native doesn't polyfill
 * it and engine support varies. If decoding silently failed we'd stop
 * detecting expired sessions — the exact bug this module exists to prevent —
 * so the implementation is kept local and predictable.
 */
function decodeBase64Url(segment: string): string | null {
  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const clean = normalized.replace(/[^A-Za-z0-9+/]/g, "");

    let output = "";
    let buffer = 0;
    let bits = 0;

    for (const char of clean) {
      const value = BASE64_ALPHABET.indexOf(char);
      if (value === -1) return null;

      buffer = (buffer << 6) | value;
      bits += 6;

      if (bits >= 8) {
        bits -= 8;
        output += String.fromCharCode((buffer >> bits) & 0xff);
      }
    }

    // JWT payloads are ASCII/UTF-8 JSON; decode UTF-8 byte sequences so
    // non-ASCII claim values don't corrupt JSON.parse.
    try {
      return decodeURIComponent(
        output
          .split("")
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join("")
      );
    } catch {
      // Not valid UTF-8 — the raw string is still fine for `exp` parsing.
      return output;
    }
  } catch {
    return null;
  }
}

/**
 * Returns the token's expiry as epoch milliseconds, or null when the token
 * isn't a JWT / carries no `exp` claim (opaque tokens, mocked tokens, …).
 */
export function getTokenExpiryMs(token: string | null | undefined): number | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) return null;

  try {
    const payload = JSON.parse(decoded) as { exp?: unknown };
    const exp = payload?.exp;

    if (typeof exp !== "number" || !Number.isFinite(exp)) return null;

    return exp * 1000;
  } catch {
    return null;
  }
}

/**
 * True only when we can PROVE the token is expired.
 *
 * Unknown-shape tokens return false on purpose: we must never lock a user out
 * because the backend switched to an opaque token format. A genuinely invalid
 * token still gets caught by the 401 handler.
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) return false;

  return Date.now() >= expiryMs - EXPIRY_SKEW_MS;
}

/** Milliseconds until expiry (null when unknown, 0 when already expired). */
export function getTokenTimeRemainingMs(
  token: string | null | undefined
): number | null {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null) return null;

  return Math.max(0, expiryMs - Date.now());
}
