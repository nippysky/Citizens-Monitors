import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import { StyleSheet, Switch, View } from "react-native";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
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

function NotificationRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.textWrap}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{
          false: "#E5E7EB",
          true: Theme.colors.primary,
        }}
      />
    </View>
  );
}

const NotificationAlertBottomSheet = forwardRef<BottomSheetModal, Props>(
  function NotificationAlertBottomSheet({ value, onChange, onSave }, ref) {
    return (
      <AppBottomSheet ref={ref} title="Update Notification Alert" snapPoints={["58%"]}>
        <NotificationRow
          title="Election Updates"
          subtitle="Real-time results and polling data"
          value={value.electionUpdates}
          onValueChange={(electionUpdates) =>
            onChange({ ...value, electionUpdates })
          }
        />

        <NotificationRow
          title="Security Alerts"
          subtitle="Emergency broadcasts and safety tips"
          value={value.securityAlerts}
          onValueChange={(securityAlerts) =>
            onChange({ ...value, securityAlerts })
          }
        />

        <NotificationRow
          title="Newsletters"
          subtitle="Weekly digest of election news"
          value={value.newsletters}
          onValueChange={(newsletters) =>
            onChange({ ...value, newsletters })
          }
        />

        <AppButton title="Save Changes" onPress={onSave} />
      </AppBottomSheet>
    );
  }
);

export default NotificationAlertBottomSheet;

const styles = StyleSheet.create({
  card: {
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.42)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  textWrap: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
});