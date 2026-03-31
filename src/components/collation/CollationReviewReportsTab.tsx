import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { useRef, useState } from "react";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import FlagReportBottomSheet from "@/components/collation/FlagReportBottomSheet";
import SeeEvidenceBottomSheet, {
  EvidencePayload,
} from "@/components/collation/SeeEvidenceBottomSheet";
import { useAppToast } from "@/hooks/useAppToast";
import { CollationItem } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/NoElection";

type Props = {
  collation: CollationItem;
};

export default function CollationReviewReportsTab({ collation }: Props) {
  const { showToast } = useAppToast();

  const evidenceRef = useRef<BottomSheetModal>(null);
  const flagRef = useRef<BottomSheetModal>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidencePayload | null>(
    null
  );

  const handleOpenEvidence = (report: (typeof collation.reviewReports)[number]) => {
    const isResult = report.type === "result";
    const isIncident = report.type === "incident";

    setSelectedEvidence({
      title: report.title,
      note: isResult
        ? "Signed result sheet was captured immediately after polling unit collation. Figures were read aloud in the presence of officials, agents, and observers before submission."
        : "Incident evidence was captured live at the polling unit while observers documented the scene and surrounding context for verification.",
      locationMeta: "No 20 Ao, Alimosho, Lagos State, Nigeria",
      pollingUnitName: "Ikotun Primary School",
      pollingUnitCode: "PU LA/12/35",
      observerName: isResult ? "Citizen Monitor Field Observer" : "Community Reporter",
      observerHandle: report.author,
      submittedAt: isResult ? "15 Mar 2027 · 08:42 AM WAT" : report.createdAgo,
      verificationStatus: isResult ? "verified" : "pending",
      sourceType: isResult ? "observer-upload" : "community-report",
      electionName: collation.fullTitle,
      accreditedVoter: isResult ? "675,435" : "—",
      rejectedVotes: isResult ? "657" : "—",
      spoiledBallots: isResult ? "320" : "—",
      usedBallots: isResult ? "601" : "—",
      unusedBallots: isResult ? "87" : "—",
      imageUri: isIncident
        ? "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
        : "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80",
      videoUri: "https://www.w3schools.com/html/mov_bbb.mp4",
    });

    requestAnimationFrame(() => {
      evidenceRef.current?.present();
    });
  };

  const handleShare = async (title: string) => {
    try {
      await Share.share({
        message: `${collation.fullTitle}\n\n${title}`,
      });
    } catch {
      showToast({
        type: "error",
        message: "Unable to share this report right now.",
      });
    }
  };

  if (!collation.canReviewReports) {
    return (
      <>
        <View style={styles.pageContent}>
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Community Verification</AppText>
            <AppText style={styles.sectionSubtitle}>
              Review report submitted by our observer at your Polling Units in
              Ikotun Primary School, PU LA/12/35. Confirm what&apos;s accurate, and
              flag what&apos;s false.
            </AppText>
          </View>

          <View style={styles.emptyWrap}>
            <NoElection width={110} height={110} />
            <AppText style={styles.emptyTitle}>No Election Report yet</AppText>
            <AppText style={styles.emptySubtitle}>
              Citizen Monitor have not commence operate then.
            </AppText>
          </View>
        </View>

        <SeeEvidenceBottomSheet ref={evidenceRef} evidence={selectedEvidence} />
        <FlagReportBottomSheet ref={flagRef} />
      </>
    );
  }

  return (
    <>
      <ScrollView style={styles.pageContent}>
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Community Verification</AppText>
          <AppText style={styles.sectionSubtitle}>
            Review report submitted by our observer at your Polling Units in
            Ikotun Primary School, PU LA/12/35. Confirm what&apos;s accurate, and
            flag what&apos;s false.
          </AppText>
        </View>

        {collation.reviewReports.map((report) => {
          const isResult = report.type === "result";

          return (
            <View key={report.id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.authorRow}>
                  <AppText style={styles.author}>{report.author}</AppText>
                  <AppText style={styles.createdAgo}>{report.createdAgo}</AppText>
                </View>

                {report.tag ? (
                  <View style={styles.tagPill}>
                    <AppText style={styles.tagText}>{report.tag}</AppText>
                  </View>
                ) : null}
              </View>

              <AppText style={styles.reportTitle}>{report.title}</AppText>
              <AppText style={styles.reportBody}>{report.body}</AppText>

              <Pressable onPress={() => handleOpenEvidence(report)} hitSlop={8}>
                <AppText style={styles.linkText}>
                  {isResult ? "See Evidence Here >" : "See evidence >"}
                </AppText>
              </Pressable>

              <AppText style={styles.reviewCount}>
                {report.reviewCount} People have reviewed
              </AppText>

              <View style={styles.actionsRow}>
                {report.isConfirmed ? (
                  <View style={[styles.statePill, styles.confirmedPill]}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color={Theme.colors.primary}
                    />
                    <AppText style={styles.confirmedText}>
                      You confirmed this – thank you
                    </AppText>
                  </View>
                ) : report.flagged ? (
                  <View style={[styles.statePill, styles.flaggedPill]}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color="#F04A1D"
                    />
                    <AppText style={styles.flaggedText}>
                      Flagged - evidence under review
                    </AppText>
                  </View>
                ) : (
                  <View style={styles.buttonRow}>
                    <MiniActionButton
                      icon="checkmark-circle-outline"
                      label="Confirm"
                      activeColor={Theme.colors.primary}
                      onPress={() =>
                        showToast({
                          type: "success",
                          message: "Report confirmed successfully.",
                        })
                      }
                    />
                    <MiniActionButton
                      icon="flag-outline"
                      label="Flag"
                      activeColor="#F04A1D"
                      onPress={() => flagRef.current?.present()}
                    />
                  </View>
                )}

                <AppButton
                  title="Share"
                  variant="ghost"
                  style={styles.shareGhost}
                  leftIcon={
                    <Ionicons
                      name="share-social-outline"
                      size={14}
                      color={Theme.colors.textMuted}
                    />
                  }
                  onPress={() => handleShare(report.title)}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <SeeEvidenceBottomSheet ref={evidenceRef} evidence={selectedEvidence} />
      <FlagReportBottomSheet
        ref={flagRef}
        onSubmitted={() =>
          showToast({
            type: "success",
            message: "Your report has been submitted successfully.",
          })
        }
      />
    </>
  );
}

function MiniActionButton({
  icon,
  label,
  activeColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  activeColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.miniAction, { borderColor: `${activeColor}55` }]}
    >
      <Ionicons name={icon} size={14} color={activeColor} />
      <AppText style={[styles.miniActionText, { color: activeColor }]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },

  section: {
    gap: 8,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  card: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderSoft,
    paddingBottom: 14,
    gap: 10,
  },

  cardHead: {
    gap: 8,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  author: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  createdAgo: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },

  tagPill: {
    alignSelf: "flex-start",
    minHeight: 22,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEAE3",
  },

  tagText: {
    fontSize: 10,
    lineHeight: 12,
    color: "#F04A1D",
    fontFamily: Theme.fonts.body.semibold,
  },

  reportTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  reportBody: {
    fontSize: 13,
    lineHeight: 20,
    color: Theme.colors.text,
  },

  linkText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  reviewCount: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    flexWrap: "wrap",
  },

  miniAction: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    backgroundColor: Theme.colors.surface,
  },

  miniActionText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
  },

  shareGhost: {
    minHeight: 30,
    marginVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 0,
  },

  statePill: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  confirmedPill: {
    backgroundColor: "#E9FBF8",
  },

  flaggedPill: {
    backgroundColor: "#FFF1EC",
  },

  confirmedText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  flaggedText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#F04A1D",
    fontFamily: Theme.fonts.body.semibold,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    gap: 10,
  },

  emptyTitle: {
    fontSize: 22,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 240,
  },
});