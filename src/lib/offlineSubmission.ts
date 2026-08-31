// Shared "is there a local, not-yet-synced submission for this election"
// check. A report sitting in the offline sync queue counts as "already
// submitted" just as much as one the server has confirmed — the user
// genuinely submitted it, the backend just hasn't heard about it yet.
// Used by useSubmissionGate (to bypass the server round-trip entirely when
// we already know the answer locally) and by useHasSubmission (so election
// cards can render a "Submitted" state instantly, offline-first).

import type { QueuedAction } from "@/context/OfflineSyncContext";

/**
 * Decides whether a failed online submission should be silently re-queued
 * for background sync, or surfaced to the user as a real failure.
 *
 * Only genuine connectivity failures (no reachable server, dropped
 * connection, request timeout) should be queued — those are exactly the
 * cases the offline-first design exists for. Everything else (a validation
 * error, an auth failure, a malformed payload, a bug) is NOT a "will
 * succeed once we're back online" situation: silently queueing it would
 * just retry the same broken request forever while telling the user
 * "saved offline, will sync automatically" — a false promise that can
 * never be kept. Those errors must be shown to the user instead.
 */
export function shouldQueueAfterError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  return (
    message.includes("unable to reach") ||
    message.includes("network") ||
    message.includes("connection") ||
    message.includes("timeout")
  );
}

export function hasPendingLocalSubmission(
  queue: QueuedAction[],
  electionId: string
): boolean {
  return queue.some((item) => {
    if (item.synced) return false;

    // A permanently-failed item was rejected by the backend and will never
    // become a real submission — treating it as "already submitted" would
    // wrongly block the user from ever trying again for this election.
    if (item.failed) return false;

    if (
      item.type !== "submit-election-report" &&
      item.type !== "submit-incident-report"
    ) {
      return false;
    }

    const payload = item.payload as { electionId?: string };
    return payload?.electionId === electionId;
  });
}
