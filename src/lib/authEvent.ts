/**
 * Minimal event bus for auth-level signals that originate deep in the API
 * layer (e.g. a 401 response) and need to bubble up to the AuthContext /
 * AppLayout without prop-drilling or context dependency cycles.
 */

type Listener = () => void;

let sessionExpiredListener: Listener | null = null;

/** Register a single listener for the session-expired event. Returns a cleanup fn. */
export function onSessionExpired(listener: Listener): () => void {
  sessionExpiredListener = listener;
  return () => {
    if (sessionExpiredListener === listener) {
      sessionExpiredListener = null;
    }
  };
}

/** Called by the API client when it receives a 401. */
export function emitSessionExpired(): void {
  sessionExpiredListener?.();
}
