// ─── src/lib/profileCommencement.ts ──────────────────────────────────────────
// Single source of truth for the user's polling-unit details in reporting
// flows. Every user has exactly ONE polling unit regardless of election, so
// every entry point (LiveNotice banner, Elections FAB, etc.) must build the
// CommencementContext from the PROFILE — never from per-screen fallbacks.

import {
  buildCommencementContext,
  CommencementContext,
} from "@/lib/reporting";

export type ProfileLike = {
  role?: string;
  userType?: string;
  state?: string | null;
  lga?: string | null;
  ward?: string | null;
  pollingUnit?: string | null;
  pollingUnitName?: string | null;
  pollingUnitCode?: string | null;
  user?: ProfileLike;
};

export function asProfileLike(value: unknown): ProfileLike | null {
  if (!value || typeof value !== "object") return null;
  return value as ProfileLike;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function pickProfileText(
  profile: ProfileLike | null,
  keys: (keyof ProfileLike)[],
  fallback: string,
): string {
  for (const key of keys) {
    const direct = clean(profile?.[key]);
    if (direct) return direct;

    const nested = clean(profile?.user?.[key]);
    if (nested) return nested;
  }

  return fallback;
}

/**
 * Builds the commencement context for an election using the user's real
 * polling unit from their profile.
 */
export function buildProfileCommencementContext(params: {
  electionId: string;
  electionTitle: string;
  profile: ProfileLike | null;
}): CommencementContext {
  const { electionId, electionTitle, profile } = params;

  const pollingUnitName = pickProfileText(
    profile,
    ["pollingUnitName", "pollingUnit"],
    "Your Polling Unit",
  );

  const pollingUnitCode = pickProfileText(
    profile,
    ["pollingUnitCode", "pollingUnit"],
    pollingUnitName,
  );

  return buildCommencementContext({
    electionId,
    electionTitle,
    pollingUnitName,
    pollingUnitCode,
    ward: pickProfileText(profile, ["ward"], "Your Ward"),
    lga: pickProfileText(profile, ["lga"], "Your LGA"),
    state: pickProfileText(profile, ["state"], "Your State"),
  });
}
