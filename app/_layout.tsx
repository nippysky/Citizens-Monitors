import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";
import AppQueryProvider from "@/providers/AppQueryProvider";
import NotificationsGate from "@/components/app/NotificationsGate";

void SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "LeagueSpartan-Medium": require("../assets/fonts/LeagueSpartan-Medium.ttf"),
    "LeagueSpartan-SemiBold": require("../assets/fonts/LeagueSpartan-SemiBold.ttf"),
    "LeagueSpartan-Bold": require("../assets/fonts/LeagueSpartan-Bold.ttf"),
  });

  // Splash screen control
  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#F7F4EA" }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AppQueryProvider>
            <AuthProvider>
              {/* Owns the entire push notification lifecycle. Renders nothing. */}
              <NotificationsGate />

              <ToastProvider>
                <StatusBar
                  style="dark"
                  translucent
                  backgroundColor="transparent"
                />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                    contentStyle: { backgroundColor: "#F7F4EA" },
                  }}
                />
              </ToastProvider>
            </AuthProvider>
          </AppQueryProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}