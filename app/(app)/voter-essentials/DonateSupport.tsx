// ─── app/(app)/voter-essentials/DonateSupport.tsx ────────────────────────────
//
// Donate & Support — in-app WebView of the live web donation page.
//
// The website already runs the full Stripe checkout, so the app simply hosts
// it. Nothing payment-related lives in the mobile bundle: no Stripe keys, no
// card handling, no PCI surface.

import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { WebViewProps } from "react-native-webview";

import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { DONATE_URL } from "@/constants/links";
import { Theme } from "@/theme";

/*
 * react-native-webview@14 still ships React 18-era class-component types,
 * which React 19 rejects (every prop resolves to `never`). The runtime
 * component is fine — this alias just restores the correct prop typing.
 */
const RNWebView = WebView as unknown as React.ComponentType<
  WebViewProps & { ref?: React.Ref<WebView> }
>;

export default function DonateSupportScreen() {
  const webViewRef = useRef<WebView>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      {/* Header stays native so back/reload are always reachable, even if the
          page itself fails to load. */}
      <View style={styles.header}>
        <BackButton />

        <AppText style={styles.headerTitle}>Donate &amp; Support</AppText>

        <Pressable
          onPress={handleReload}
          hitSlop={10}
          style={styles.reloadBtn}
          accessibilityRole="button"
          accessibilityLabel="Reload page"
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color={Theme.colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        {hasError ? (
          <View style={styles.stateWrap}>
            <View style={styles.stateIconWrap}>
              <Ionicons
                name="cloud-offline-outline"
                size={28}
                color={Theme.colors.textMuted}
              />
            </View>

            <AppText style={styles.stateTitle}>Couldn&apos;t load the page</AppText>
            <AppText style={styles.stateBody}>
              Check your connection and try again.
            </AppText>

            <Pressable
              onPress={handleReload}
              style={({ pressed }) => [
                styles.retryBtn,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <AppText style={styles.retryBtnText}>Try again</AppText>
            </Pressable>
          </View>
        ) : (
          <>
            <RNWebView
              ref={webViewRef}
              source={{ uri: DONATE_URL }}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              // Only fires for the main document, so a failed analytics call
              // can't blank out a page that actually rendered.
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              startInLoadingState={false}
              // Stripe's card fields need JS + cookies/storage to work.
              javaScriptEnabled
              domStorageEnabled
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              // 3-D Secure challenges open in a new window; allow that inline.
              setSupportMultipleWindows={false}
              allowsBackForwardNavigationGestures
              originWhitelist={["https://*"]}
              style={styles.webview}
            />

            {isLoading ? (
              <View style={styles.loadingOverlay} pointerEvents="none">
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <AppText style={styles.loadingText}>
                  Loading secure donation page…
                </AppText>
              </View>
            ) : null}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(15,23,42,0.10)",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  reloadBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
  },
  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 32,
  },
  stateIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(15,23,42,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stateTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  stateBody: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  retryBtnText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
  pressed: {
    opacity: 0.82,
  },
});
