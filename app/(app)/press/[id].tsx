// app/(app)/press/[id].tsx
// URL alias for Universal/App Links. The website publishes press articles at
// https://www.citizenmonitors.com/press/<slug>, so when such a link opens the
// app, expo-router lands here — redirect to the real press-coverage screen.
import { Redirect, useLocalSearchParams } from "expo-router";

export default function PressDeepLinkAlias() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return (
    <Redirect
      href={{ pathname: "/(app)/press-coverage/[id]", params: { id } }}
    />
  );
}
