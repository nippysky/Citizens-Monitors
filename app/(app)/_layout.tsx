import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

import ToastNotification from "@/components/app/ToastNotification";
import TourOverlay from "@/components/tour/TourOverlay";
import { LiveNoticeProvider } from "@/components/feedback/LiveNoticeProvider";
import { useAuth } from "@/context/AuthContext";
import { ElectionsProvider } from "@/context/ElectionsContext";
import { NetworkProvider } from "@/context/NetworkContext";
import { OfflineSyncProvider } from "@/context/OfflineSyncContext";
import { TourProvider } from "@/context/TourContext";
import { onSessionExpired } from "@/lib/authEvent";

export default function AppLayout() {
  const { isAuthenticated, isOnboardingComplete, isRestoring, signOut } =
    useAuth();

  // Auto-logout when any API call returns 401 (session expired / token revoked).
  // Registered early so it also catches events queued before mount (see authEvent.ts).
  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      void signOut();
    });
    return unsubscribe;
  }, [signOut]);

  // Wait for SecureStore restore to complete before making any auth routing
  // decisions.  Without this guard, the component renders with isAuthenticated:
  // false during the async restore and immediately redirects the user to the
  // welcome screen — causing a flash or a stuck skeleton on every cold open.
  if (isRestoring) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(public)/welcome" />;
  }

  if (!isOnboardingComplete) {
    return <Redirect href="/(public)/onboarding" />;
  }

  return (
    <NetworkProvider>
      <OfflineSyncProvider>
        <ElectionsProvider>
          <LiveNoticeProvider>
            <TourProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                }}
              />
              <ToastNotification />
              <TourOverlay />
            </TourProvider>
          </LiveNoticeProvider>
        </ElectionsProvider>
      </OfflineSyncProvider>
    </NetworkProvider>
  );
}