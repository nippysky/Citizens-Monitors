// src/components/me/ReportSummarySheet.tsx

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import { ArchiveReportItem } from "@/data/me";
import { formatCompactNumber } from "@/data/collation";
import { Theme } from "@/theme";
import { getPartyLogo } from "@/svgs/app/collation/parties";

const partyResults = [
  {
    id: "apc",
    shortName: "APC",
    votes: 23450,
    percent: 65,
    color: "#E52B2F",
    logoKey: "APC",
  },
  {
    id: "lp",
    shortName: "LP",
    votes: 23450,
    percent: 20,
    color: "#119B3A",
    logoKey: "LP",
  },
  {
    id: "pdp",
    shortName: "PDP",
    votes: 23450,
    percent: 10,
    color: "#4056D6",
    logoKey: "PDP",
  },
  {
    id: "nnpp",
    shortName: "NNPP",
    votes: 23450,
    percent: 5,
    color: "#EF2F3C",
    logoKey: "NNPP",
  },
  {
    id: "others",
    shortName: "OTHERS",
    votes: 0,
    percent: 0,
    color: "#D4D4D8",
    logoKey: "OTHERS",
  },
];

type Props = {
  report: ArchiveReportItem | null;
  electionTitle: string;
};

const ReportSummarySheet = forwardRef<BottomSheetModal, Props>(
  function ReportSummarySheet({ report, electionTitle }, ref) {
    const insets = useSafeAreaInsets();
    const snaps = useMemo(() => ["76%"], []);

    const close = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    if (!report) return null;

    const isResult = report.type === "result";

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snaps}
        topInset={insets.top + 12}
        enablePanDownToClose
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.bg}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.32}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 28 },
          ]}
        >
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>{electionTitle}</AppText>

            <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={Theme.colors.textMuted}
              />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.reportHeader}>
            <View style={styles.reportDotRow}>
              <View style={styles.redDot} />
              <AppText style={styles.reportLabel}>Result Report — EC8A</AppText>
            </View>

            <View style={styles.timeRow}>
              <Ionicons
                name="alarm-outline"
                size={16}
                color={Theme.colors.textMuted}
              />
              <AppText style={styles.timeText}>{report.date}</AppText>
            </View>
          </View>

          {isResult ? (
            <View style={styles.resultCard}>
              <AppText style={styles.resultTitle}>
                Lagos State Governorship Election 2026 Result
              </AppText>

              {partyResults.map((party, index) => {
                const Logo = getPartyLogo(party.logoKey);

                return (
                  <View key={party.id} style={styles.partyRowWrap}>
                    <View style={styles.partyRow}>
                      <View style={styles.partyLeft}>
                        <View style={styles.logoWrap}>
                          <Logo width={46} height={34} />
                        </View>

                        <View style={styles.partyInfo}>
                          <AppText style={styles.partyName}>
                            {party.shortName} ({formatCompactNumber(party.votes)}{" "}
                            votes)
                          </AppText>

                          <CollationAnimatedProgressBar
                            progress={party.percent}
                            height={8}
                            color={party.color}
                            trackColor="#D9D9D9"
                          />
                        </View>
                      </View>

                      <AppText style={styles.partyPercent}>
                        {party.percent}%
                      </AppText>
                    </View>

                    {index !== partyResults.length - 1 ? (
                      <View style={styles.partyDivider} />
                    ) : null}
                  </View>
                );
              })}

              <Pressable style={styles.seeFullBtn}>
                <AppText style={styles.seeFullText}>
                  See Signed Result Sheet &amp; (EC8A)Figures
                </AppText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Theme.colors.primary}
                />
              </Pressable>
            </View>
          ) : (
            <View style={styles.incidentCard}>
              <AppText style={styles.incidentTitle}>{report.title}</AppText>

              <View style={styles.timeRow}>
                <Ionicons
                  name="alarm-outline"
                  size={14}
                  color={Theme.colors.textMuted}
                />
                <AppText style={styles.timeText}>
                  {report.date} · {report.time}
                </AppText>
              </View>

              {report.evidenceLabel ? (
                <AppText style={styles.evidenceText}>
                  {report.evidenceLabel}
                </AppText>
              ) : null}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default ReportSummarySheet;

const styles = StyleSheet.create({
  bg: {
    backgroundColor: "#FBF6E3",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  handle: {
    backgroundColor: "rgba(17, 26, 50, 0.12)",
    width: 44,
  },

  content: {
    paddingTop: 8,
    paddingHorizontal: 18,
    gap: 16,
  },

  header: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#D9DEE8",
    marginHorizontal: -18,
  },

  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
  },

  reportDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },

  redDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#F04444",
  },

  reportLabel: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  timeText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#8F96A3",
    fontFamily: Theme.fonts.body.medium,
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },

  resultTitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  partyRowWrap: {
    gap: 12,
  },

  partyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  partyLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logoWrap: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  partyInfo: {
    flex: 1,
    gap: 10,
  },

  partyName: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  partyPercent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#586162",
    fontFamily: Theme.fonts.body.semibold,
    minWidth: 40,
    textAlign: "right",
  },

  partyDivider: {
    height: 1,
    backgroundColor: "#E8E8E8",
  },

  seeFullBtn: {
    paddingTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  seeFullText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  incidentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    padding: 16,
    gap: 8,
  },

  incidentTitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  evidenceText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#F04A1D",
    fontFamily: Theme.fonts.body.semibold,
  },
});