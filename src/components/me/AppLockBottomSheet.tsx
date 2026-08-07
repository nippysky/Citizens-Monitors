// ─── src/components/me/AppLockBottomSheet.tsx ────────────────────────────────
// Settings → App Lock. Available to every role (observer, volunteer,
// public viewer) since it's a device privacy feature, not a permission.

import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import { ActivityIndicator, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  enabled: boolean;
  /** False when the phone has no biometrics/PIN enrolled. */
  deviceSupported: boolean;
  /** "Face ID" | "Fingerprint" | "device passcode" */
  methodLabel: string;
  busy?: boolean;
  onToggle: (next: boolean) => void;
};

const AppLockBottomSheet = forwardRef<BottomSheetModal, Props>(
  function AppLockBottomSheet(
    { enabled, deviceSupported, methodLabel, busy = false, onToggle },
    ref
  ) {
    const insets = useSafeAreaInsets();

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.4}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView
          style={[
            styles.container,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Theme.colors.primary}
              />
            </View>

            <View style={styles.headerTextWrap}>
              <AppText style={styles.title}>App Lock</AppText>
              <AppText style={styles.subtitle}>
                Require {methodLabel} to open Citizen Monitors
              </AppText>
            </View>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <AppText style={styles.toggleLabel}>
                {enabled ? "App Lock is on" : "App Lock is off"}
              </AppText>
              <AppText style={styles.toggleHint}>
                {enabled
                  ? `You'll unlock with ${methodLabel} each time you open the app.`
                  : "The app opens straight away. Your login is always remembered either way."}
              </AppText>
            </View>

            {busy ? (
              <ActivityIndicator color={Theme.colors.primary} />
            ) : (
              <Switch
                value={enabled}
                onValueChange={onToggle}
                disabled={!deviceSupported}
                trackColor={{ false: "#D8DDE5", true: "rgba(5,163,156,0.45)" }}
                thumbColor={enabled ? Theme.colors.primary : "#F4F4F5"}
              />
            )}
          </View>

          {!deviceSupported ? (
            <View style={styles.noticeRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#C2410C"
              />
              <AppText style={styles.noticeText}>
                Set up a screen lock (PIN, pattern, password or biometrics) in
                your phone settings to use App Lock.
              </AppText>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={Theme.colors.primary}
              />
              <AppText style={styles.infoText}>
                Your session stays signed in regardless — App Lock only
                controls whether the app asks to verify you first.
              </AppText>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default AppLockBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: "#D8DDE5",
    width: 44,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(5,163,156,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 18,
    lineHeight: 23,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#F8FAFB",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.07)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 3,
  },
  toggleLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  toggleHint: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(194,65,12,0.07)",
    borderWidth: 1,
    borderColor: "rgba(194,65,12,0.18)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: "#9A3412",
    fontFamily: Theme.fonts.body.medium,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
});
