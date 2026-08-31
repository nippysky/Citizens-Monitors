// app/(app)/insights/[id].tsx
// URL alias for Universal/App Links. The website publishes news articles at
// https://www.citizenmonitors.com/insights/<slug>, so when such a link opens
// the app, expo-router lands here — redirect to the real news detail screen.
import { Redirect, useLocalSearchParams } from "expo-router";

export default function InsightsDeepLinkAlias() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return (
    <Redirect
      href={{ pathname: "/(app)/news/[id]", params: { id } }}
    />
  );
}
