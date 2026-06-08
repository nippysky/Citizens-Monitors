import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { MobileNotificationSettingsState } from "@/lib/api/profile.api";
import { Theme } from "@/theme";
import NotifyMyReport from "@/svgs/app/profile/NotifyMyReport";
import NotifyBell from "@/svgs/app/profile/NotifyBell";
import ResultAndCollation from "@/svgs/app/profile/ResultAndCollation";
import ElectionNotification from "@/svgs/app/profile/ElectionNotification";

type Props = {
  value: MobileNotificationSettingsState;
  onChange: (value: MobileNotificationSettingsState) => void;
  onSave: () => void;
  saving?: boolean;
};

type ToggleRow = {
  key: keyof MobileNotificationSettingsState;
  title: string;
  subtitle: string;
};

type Section = {
  icon: React.ReactNode;
  title: string;
  rows: ToggleRow[];
};

const NotificationAlertBottomSheet = forwardRef<BottomSheetModal, Props>(
  function NotificationAlertBottomSheet(
    { value, onChange, onSave, saving = false },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["88%"], []);
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const sections: Section[] = [
      {
        icon: <ElectionNotification width={22} height={22} />,
        title: "Election Notifications",
        rows: [
          {
            key: "pollingUnitActivity",
            title: "Polling Unit Activity",
            subtitle:
              "Real-time results and incident reports from your polling unit.",
          },
          {
            key: "electionDayAlert",
            title: "Election Day Alert",
            subtitle: "Polls open and close reminders.",
          },
          {
            key: "discussionReplies",
            title: "Discussion Replies",
            subtitle: "When someone replies to your discussion posts.",
          },
        ],
      },
      {
        icon: <ResultAndCollation width={22} height={22} />,
        title: "Results and Collations",
        rows: [
          {
            key: "resultAggregated",
            title: "Results Aggregated",
            subtitle: "When final collation is ready for an election.",
          },
        ],
      },
      {
        icon: <NotifyMyReport width={22} height={22} />,
        title: "My Reports",
        rows: [
          {
            key: "reportConfirmed",
            title: "Report Confirmed",
            subtitle: "When your reports are verified by others.",
          },
          {
            key: "reportFlagged",
            title: "Report Flagged",
            subtitle: "When a dispute is raised on your report.",
          },
        ],
      },
      {
        icon: <NotifyBell width={22} height={22} />,
        title: "Other Notifications",
        rows: [
          {
            key: "securityAlerts",
            title: "Security Alerts",
            subtitle: "Emergency broadcasts and safety tips.",
          },
          {
            key: "newsletter",
            title: "Newsletter",
            subtitle: "Weekly digest of election news from Citizen Monitor.",
          },
        ],
      },
    ];

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        index={0}
        enablePanDownToClose
        topInset={insets.top + 12}
        onChange={handleSheetChange}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.bg}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 22 },
          ]}
        >
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>Notification Setting</AppText>
            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.introBlock}>
            <AppText style={styles.introTitle}>
              Update Notification Alert
            </AppText>
            <AppText style={styles.introSub}>
              Choose what you get notified about.
            </AppText>
          </View>

          {sections.map((section) => (
            <View key={section.title} style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                {section.icon}
                <AppText style={styles.sectionTitle}>{section.title}</AppText>
              </View>

              <View style={styles.sectionCard}>
                {section.rows.map((row, index) => {
                  const isLast = index === section.rows.length - 1;

                  return (
                    <View
                      key={row.key}
                      style={[
                        styles.toggleRow,
                        !isLast && styles.toggleRowBorder,
                      ]}
                    >
                      <View style={styles.toggleTextWrap}>
                        <AppText style={styles.toggleTitle}>
                          {row.title}
                        </AppText>
                        <AppText style={styles.toggleSub}>
                          {row.subtitle}
                        </AppText>
                      </View>

                      <Switch
                        value={value[row.key]}
                        onValueChange={(nextValue) =>
                          onChange({ ...value, [row.key]: nextValue })
                        }
                        trackColor={{
                          false: "#E5E7EB",
                          true: Theme.colors.primary,
                        }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#E5E7EB"
                        disabled={saving}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          <AppButton
            title="Save Changes"
            onPress={onSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default NotificationAlertBottomSheet;

const styles = StyleSheet.create({
  bg: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: "rgba(17,26,50,0.12)",
    width: 44,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.semibold,
    color: Theme.colors.text,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#DFE4EB",
    marginHorizontal: -16,
  },
  introBlock: {
    gap: 4,
  },
  introTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  introSub: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  sectionWrap: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    overflow: "hidden",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  toggleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  toggleSub: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
  saveButton: {
    marginVertical: 0,
  },
});