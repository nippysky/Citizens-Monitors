import { Redirect, Stack, router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import ToastNotification from "@/components/app/ToastNotification";
import TourOverlay from "@/components/tour/TourOverlay";
import BiometricLockScreen from "@/components/auth/BiometricLockScreen";
import { LiveNoticeProvider } from "@/components/feedback/LiveNoticeProvider";
import { useAuth } from "@/context/AuthContext";
import { ElectionsProvider } from "@/context/ElectionsContext";
import { NetworkProvider } from "@/context/NetworkContext";
import { OfflineSyncProvider } from "@/context/OfflineSyncContext";
import { TourProvider } from "@/context/TourContext";
import { onSessionExpired } from "@/lib/authEvent";
import { useBiometricGate } from "@/hooks/useBiometricGate";

export default function AppLayout() {
  const { isAuthenticated, isOnboardingComplete, isRestoring, signOut } =
    useAuth();

  const { isLocked, isReady, authenticate } = useBiometricGate(
    isAuthenticated && !isRestoring && isOnboardingComplete
  );

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

              {/* Biometric gate overlay — sits on top of all app screens.
                  While the gate is still deciding (isReady false) we cover the
                  content with an opaque view so the home screen never flashes
                  before the lock appears on cold open. */}
              {!isReady || isLocked ? (
                <View style={styles.lockOverlay}>
                  {isLocked ? (
                    <BiometricLockScreen
                      onAuthenticate={authenticate}
                      onUsePassword={async () => {
                        // Await signOut so state and SecureStore are fully
                        // cleared before navigating — prevents a navigation
                        // race where the router fires before isAuthenticated
                        // transitions to false.
                        await signOut();
                        router.replace("/(public)/sign-in");
                      }}
                    />
                  ) : (
                    <View style={styles.gateCurtain} />
                  )}
                </View>
              ) : null}
            </TourProvider>
          </LiveNoticeProvider>
        </ElectionsProvider>
      </OfflineSyncProvider>
    </NetworkProvider>
  );
}

const styles = StyleSheet.create({
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },

  gateCurtain: {
    flex: 1,
    backgroundColor: "#F7F4EA",
  },
});