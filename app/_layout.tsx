import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

import { ToastProvider } from "@/components/feedback/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";
import {
  registerForPushNotificationsAsync,
  getNotificationDataFromResponse,
  addForegroundNotificationListener,
  addNotificationResponseListener,
} from "@/lib/notifications";
import AppQueryProvider from "@/providers/AppQueryProvider";

void SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

function handleNotificationRoute(data: Record<string, unknown> | null) {
  if (!data) return;

  if (typeof data.url === "string" && data.url.length > 0) {
    router.push(data.url as never);
    return;
  }

  if (data.type === "result-submitted" && typeof data.collationId === "string") {
    router.push({
      pathname: "/(app)/election/[id]",
      params: { id: data.collationId },
    } as never);
    return;
  }

  if (data.type === "incident-reported" && typeof data.electionId === "string") {
    router.push({
      pathname: "/(app)/election/[id]",
      params: { id: data.electionId },
    } as never);
    return;
  }

  if (data.type === "polling-unit-alert") {
    router.push("/(app)/notifications" as never);
    return;
  }

  if (data.type === "discussion-reply") {
    router.push("/(app)/notifications" as never);
    return;
  }

  router.push("/(app)/notifications" as never);
}

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

  // 🔔 Notifications bootstrap
  useEffect(() => {
    let mounted = true;

    const bootNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();

        // ✅ ALWAYS show for APK testing
        console.log("Expo push token:", token);

        if (token) {
          Alert.alert("Push Token", token);

          // 🔮 FUTURE: send to backend
          // await api.savePushToken(token)
        }
      } catch (err) {
        console.log("Push registration failed:", err);
      }

      // 🔁 Handle app opened from killed state via notification
      try {
        const lastResponse =
          await Notifications.getLastNotificationResponseAsync();

        if (!mounted || !lastResponse) return;

        const data = getNotificationDataFromResponse(lastResponse);
        handleNotificationRoute(data);

        await Notifications.clearLastNotificationResponseAsync();
      } catch (err) {
        console.log("Initial notification handling failed:", err);
      }
    };

    void bootNotifications();

    // 📩 Foreground listener
    const foregroundSub = addForegroundNotificationListener(
      (notification) => {
        console.log("Foreground notification received:", notification);
      }
    );

    // 👆 Tap / response listener
    const responseSub = addNotificationResponseListener((response) => {
      const data = getNotificationDataFromResponse(response);
      handleNotificationRoute(data);
    });

    return () => {
      mounted = false;
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#F7F4EA" }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
        <AppQueryProvider>
          <AuthProvider>
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