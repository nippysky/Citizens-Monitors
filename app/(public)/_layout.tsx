import { Stack } from "expo-router";

export { default as ErrorBoundary } from "@/components/app/RouteErrorFallback";

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}