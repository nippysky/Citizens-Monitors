import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useBottomSheetBackHandler } from "@/hooks/useBottomSheetBackHandler";
import { forwardRef, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { INCIDENT_OPTIONS } from "@/lib/reporting";
import { Theme } from "@/theme";
import Incident from "@/svgs/app/collation/Incident";
import LateOpening from "@/svgs/app/collation/LateOpening";
import MisConduct from "@/svgs/app/collation/MisConduct";
import MissingMaterial from "@/svgs/app/collation/MissingMaterial";
import ResultAlter from "@/svgs/app/collation/ResultAlter";
import Thuggery from "@/svgs/app/collation/Thuggery";
import UnderAge from "@/svgs/app/collation/UnderAge";
import VoterIntimidation from "@/svgs/app/collation/VoterIntimidation";
import ElectionNotification from "@/svgs/app/profile/ElectionNotification";

type Props = {
  selectedIncidentType: string;
  onSelectIncidentType: (value: string) => void;
  geoLabel?: string;
  onStartRecording: () => void;
  onClose?: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function IncidentTypeIcon({
  label,
  size,
}: {
  label: string;
  size: number;
}) {
  const glyph =
    label === "Ballot Stuffing"
      ? <ElectionNotification />
      : label === "Thuggery & Violence"
        ? <Thuggery />
        : label === "Underage Voting"
          ? <UnderAge />
          : label === "INEC Misconduct"
            ? <MisConduct />
            : label === "Result Alteration"
              ? <ResultAlter />
              : label === "Voter Intimidation"
                ? <VoterIntimidation />
                : label === "Late Opening"
                  ? <LateOpening />
                  : label === "Missing Materials"
                    ? <MissingMaterial />
                    : <Incident />;

  return (
    <AppText
      style={[
        styles.incidentTypeEmoji,
        { fontSize: size, lineHeight: size + 2 },
      ]}
    >
      {glyph}
    </AppText>
  );
}

const RecordLiveIncidentSheet = forwardRef<BottomSheetModal, Props>(
  function RecordLiveIncidentSheet(
    {
      selectedIncidentType,
      onSelectIncidentType,
      geoLabel,
      onStartRecording,
      onClose,
    },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const snapPoints = useMemo(() => ["86%"], []);
    const { handleSheetChange } = useBottomSheetBackHandler(
      ref as React.RefObject<BottomSheetModal | null>
    );

    const metrics = useMemo(() => {
      const sidePadding = 20;
      const gap = width <= 360 ? 8 : 10;
      const gridWidth = width - sidePadding * 2;
      const cardSize = Math.floor((gridWidth - gap * 2) / 3);

      return {
        gap,
        cardSize,
        cardHeight: clamp(cardSize, 92, 124),
        iconSize: clamp(cardSize * 0.24, 22, 28),
        textSize: cardSize <= 98 ? 10.8 : 12,
        lineHeight: cardSize <= 98 ? 14 : 16,
        horizontalPadding: cardSize <= 98 ? 6 : 8,
      };
    }, [width]);

    const dismiss = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
      onClose?.();
    };

    const canStart = Boolean(selectedIncidentType?.trim());

    return (
      <BottomSheetModal
        ref={ref}
        onChange={handleSheetChange}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={onClose}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.34}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 20) + 8 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <AppText style={styles.title}>Record Live Incident</AppText>

            <Pressable onPress={dismiss} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={Theme.colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionIntro}>
            <AppText style={styles.questionTitle}>
              What are you recording?
            </AppText>
            <AppText style={styles.questionSubtitle}>
              Select what you are about to record, then tap Start Recording.
            </AppText>
          </View>

          <View
            style={[
              styles.incidentGrid,
              {
                rowGap: metrics.gap,
                columnGap: metrics.gap,
              },
            ]}
          >
            {INCIDENT_OPTIONS.map((option) => {
              const active = selectedIncidentType === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => onSelectIncidentType(option)}
                  style={[
                    styles.incidentTypeCard,
                    {
                      width: metrics.cardSize,
                      height: metrics.cardHeight,
                      paddingHorizontal: metrics.horizontalPadding,
                    },
                    active && styles.incidentTypeCardActive,
                  ]}
                >
                  <IncidentTypeIcon label={option} size={metrics.iconSize} />

                  <AppText
                    style={[
                      styles.incidentTypeText,
                      {
                        fontSize: metrics.textSize,
                        lineHeight: metrics.lineHeight,
                      },
                      active && styles.incidentTypeTextActive,
                    ]}
                  >
                    {option}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.geoCard}>
            <Ionicons name="location" size={22} color="#E45858" />
            <AppText style={styles.geoCardText}>
              Geo-tagged: {geoLabel || "Polling unit location verified"} · Recording
              will be timestamped automatically
            </AppText>
          </View>

          {!canStart ? (
            <View style={styles.helperCard}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={Theme.colors.primary}
              />
              <AppText style={styles.helperText}>
                Select an incident type to enable live recording.
              </AppText>
            </View>
          ) : null}

        </BottomSheetScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
          <AppButton
            title={canStart ? "◉ Start Recording" : "Select Incident Type First"}
            onPress={onStartRecording}
            style={[
              styles.startRecordingBtn,
              !canStart && styles.startRecordingBtnDisabled,
            ]}
            disabled={!canStart}
          />
        </View>
      </BottomSheetModal>
    );
  }
);

export default RecordLiveIncidentSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#F8F4E6",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  handle: {
    backgroundColor: "#CCD2DA",
    width: 84,
    height: 8,
    borderRadius: 999,
  },

  content: {
    paddingHorizontal: 20,
  },

  header: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 19,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#E0D9CA",
    marginHorizontal: -20,
    marginBottom: 18,
  },

  sectionIntro: {
    gap: 6,
    marginBottom: 16,
  },

  questionTitle: {
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  questionSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  incidentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },

  incidentTypeCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9DEE5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 7,
  },

  incidentTypeCardActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(5,163,156,0.06)",
  },

  incidentTypeEmoji: {
    textAlign: "center",
  },

  incidentTypeText: {
    color: Theme.colors.text,
    textAlign: "center",
  },

  incidentTypeTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  geoCard: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: "#DDF6E8",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  geoCardText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#426A5B",
    fontFamily: Theme.fonts.body.medium,
  },

  helperCard: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: "rgba(5,163,156,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  helperText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },

  startRecordingBtn: {
    marginTop: 18,
    marginVertical: 0,
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: "#F84C00",
  },

  startRecordingBtnDisabled: {
    backgroundColor: "#C9CCD3",
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(17,26,50,0.07)",
    backgroundColor: Theme.colors.background,
  },
});