import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { StyleSheet, Switch, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

export type NotificationSettingsState = {
  electionUpdates: boolean;
  securityAlerts: boolean;
  newsletters: boolean;
};

type Props = {
  value: NotificationSettingsState;
  onChange: (value: NotificationSettingsState) => void;
  onSave: () => void;
};

const NotificationAlertBottomSheet = forwardRef<BottomSheetModal, Props>(
  function NotificationAlertBottomSheet({ value, onChange, onSave }, ref) {
    const snapPoints = useMemo(() => ["65%"], []);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView contentContainerStyle={styles.container}>
          <AppText style={styles.title}>Notification Alerts</AppText>

          {[
            {
              key: "electionUpdates",
              title: "Election Updates",
              subtitle: "Real-time results and polling data",
            },
            {
              key: "securityAlerts",
              title: "Security Alerts",
              subtitle: "Emergency broadcasts and safety tips",
            },
            {
              key: "newsletters",
              title: "Newsletters",
              subtitle: "Weekly digest of election news",
            },
          ].map((item) => (
            <View key={item.key} style={styles.card}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.cardTitle}>{item.title}</AppText>
                <AppText style={styles.cardSub}>{item.subtitle}</AppText>
              </View>

              <Switch
                value={value[item.key as keyof NotificationSettingsState]}
                onValueChange={(val) =>
                  onChange({ ...value, [item.key]: val })
                }
                trackColor={{
                  false: "#E5E7EB",
                  true: Theme.colors.primary,
                }}
              />
            </View>
          ))}

          <AppButton title="Save Changes" onPress={onSave} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default NotificationAlertBottomSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
  },
  handle: {
    backgroundColor: "#D1D5DB",
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    fontSize: 17,
    marginBottom: 8,
    fontFamily: Theme.fonts.body.semibold,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.body.semibold,
  },
  cardSub: {
    fontSize: 13,
    color: Theme.colors.textMuted,
  },
});