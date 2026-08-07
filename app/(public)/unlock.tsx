// ─── app/(public)/unlock.tsx ─────────────────────────────────────────────────
// Returning-user unlock route. Reached when a stored session has expired but
// credentials are vaulted behind device security, so the user can get back in
// with Face ID / fingerprint / PIN instead of retyping a password.

import { Redirect, router } from "expo-router";

import SessionLockScreen from "@/components/auth/SessionLockScreen";
import { Paths } from "@/constants/paths";
import { useAuth } from "@/context/AuthContext";

export default function UnlockScreen() {
  const {
    sessionStatus,
    lockedUser,
    isRestoring,
    unlockSession,
    signOut,
  } = useAuth();

  // Still reading storage — index.tsx owns the splash, render nothing here.
  if (isRestoring) return null;

  // Unlocked (or never locked) — hand routing back to the normal flow.
  if (sessionStatus === "authenticated") {
    return <Redirect href={Paths.appHome as never} />;
  }

  if (sessionStatus === "signed-out") {
    return <Redirect href={Paths.welcome as never} />;
  }

  return (
    <SessionLockScreen
      user={lockedUser}
      onUnlock={unlockSession}
      onUsePassword={async () => {
        // Await the sign-out so state + storage are fully cleared before we
        // navigate — otherwise the router can race the state transition.
        await signOut();
        router.replace(Paths.signIn as never);
      }}
    />
  );
}
