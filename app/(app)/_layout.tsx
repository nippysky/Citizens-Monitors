import { Redirect, Stack } from "expo-router";


import { ElectionsProvider } from "@/context/ElectionsContext";
import { useAuth } from "@/context/AuthContext";
import { NetworkProvider } from "@/context/NetworkContext";
import ToastNotification from "@/components/app/ToastNotification";

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
      <ElectionsProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <ToastNotification />
      </ElectionsProvider>
    </NetworkProvider>
  );
}