/**
 * Minimal event bus for auth-level signals that originate deep in the API
 * layer (e.g. a 401 response) and need to bubble up to the AuthContext /
 * AppLayout without prop-drilling or context dependency cycles.
 *
 * Race-condition safe: if emitSessionExpired fires before the listener is
 * registered (e.g. during the JS boot / restore window), the event is queued
 * and replayed as soon as onSessionExpired is called.
 */

type Listener = () => void;

let sessionExpiredListener: Listener | null = null;
let pendingSessionExpired = false;

/** Register a single listener for the session-expired event. Returns a cleanup fn. */
export function onSessionExpired(listener: Listener): () => void {
  sessionExpiredListener = listener;

  // Deliver a queued event that fired before the listener was ready.
  if (pendingSessionExpired) {
    pendingSessionExpired = false;
    // Defer slightly so the component has fully mounted before we trigger signOut.
    setTimeout(listener, 0);
  }

  return () => {
    if (sessionExpiredListener === listener) {
      sessionExpiredListener = null;
    }
  };
}

/** Called by the API client when it receives a 401. */
export function emitSessionExpired(): void {
  if (sessionExpiredListener) {
    sessionExpiredListener();
  } else {
    // No listener registered yet — queue for delivery.
    pendingSessionExpired = true;
  }
}
