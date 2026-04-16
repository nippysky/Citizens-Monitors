import { Redirect, Stack } from "expo-router";

import ToastNotification from "@/components/app/ToastNotification";
import { LiveNoticeProvider } from "@/components/feedback/LiveNoticeProvider";
import { useAuth } from "@/context/AuthContext";
import { ElectionsProvider } from "@/context/ElectionsContext";
import { NetworkProvider } from "@/context/NetworkContext";
import { OfflineSyncProvider } from "@/context/OfflineSyncContext";

export default function AppLayout() {
  const { isAuthenticated, isOnboardingComplete } = useAuth();

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
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <ToastNotification />
          </LiveNoticeProvider>
        </ElectionsProvider>
      </OfflineSyncProvider>
    </NetworkProvider>
  );
}