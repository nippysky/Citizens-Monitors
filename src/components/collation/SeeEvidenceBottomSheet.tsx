import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef } from "react";
import { Image, StyleSheet, View } from "react-native";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
import AppText from "@/components/ui/AppText";
import CollationVideoPlayer from "@/components/collation/CollationVideoPlayer";
import { Theme } from "@/theme";

export type EvidencePayload = {
  title: string;
  imageUri?: string;
  videoUri?: string;
  note?: string;
  accreditedVoter?: string;
  rejectedVotes?: string;
  spoiledBallots?: string;
  usedBallots?: string;
  unusedBallots?: string;
  locationMeta?: string;
  pollingUnitName?: string;
  pollingUnitCode?: string;
  observerName?: string;
  observerHandle?: string;
  submittedAt?: string;
  verificationStatus?: "verified" | "pending";
  sourceType?: "observer-upload" | "community-report";
  electionName?: string;
};

type Props = {
  evidence: EvidencePayload | null;
};

const demoImage =
  "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80";
const demoVideo =
  "https://www.w3schools.com/html/mov_bbb.mp4";

const SeeEvidenceBottomSheet = forwardRef<BottomSheetModal, Props>(
  function SeeEvidenceBottomSheet({ evidence }, ref) {
    if (!evidence) return null;

    const imageUri = evidence.imageUri ?? demoImage;
    const videoUri = evidence.videoUri ?? demoVideo;

    const verificationStatus = evidence.verificationStatus ?? "verified";
    const sourceType = evidence.sourceType ?? "observer-upload";

    return (
      <AppBottomSheet ref={ref} title="See Evidence" snapPoints={["90%"]}>
        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTopLeft}>
                <View style={styles.heroIconWrap}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={Theme.colors.primary}
                  />
                </View>

                <View style={styles.heroTextWrap}>
                  <AppText style={styles.heroTitle}>
                    Verified Election Evidence
                  </AppText>
                  <AppText style={styles.heroSubtitle}>
                    Submitted from polling unit evidence flow and stored with
                    report metadata.
                  </AppText>
                </View>
              </View>

              <View
                style={[
                  styles.verificationPill,
                  verificationStatus === "verified"
                    ? styles.verificationPillVerified
                    : styles.verificationPillPending,
                ]}
              >
                <Ionicons
                  name={
                    verificationStatus === "verified"
                      ? "checkmark-circle"
                      : "time-outline"
                  }
                  size={14}
                  color={
                    verificationStatus === "verified"
                      ? Theme.colors.primary
                      : "#B45309"
                  }
                />
                <AppText
                  style={[
                    styles.verificationPillText,
                    verificationStatus === "verified"
                      ? styles.verificationPillTextVerified
                      : styles.verificationPillTextPending,
                  ]}
                >
                  {verificationStatus === "verified" ? "Verified" : "Pending"}
                </AppText>
              </View>
            </View>

            <AppText style={styles.evidenceTitle}>{evidence.title}</AppText>

            <View style={styles.heroMetaGrid}>
              <MetaItem
                icon="calendar-outline"
                label="Submitted"
                value={evidence.submittedAt ?? "15 Mar 2027 · 08:42 AM WAT"}
              />
              <MetaItem
                icon="location-outline"
                label="Polling Unit"
                value={evidence.pollingUnitName ?? "Ikotun Primary School"}
              />
              <MetaItem
                icon="qr-code-outline"
                label="Unit Code"
                value={evidence.pollingUnitCode ?? "PU LA/12/35"}
              />
              <MetaItem
                icon="person-outline"
                label="Observer"
                value={evidence.observerHandle ?? "@IronEagle23"}
              />
            </View>

            <View style={styles.sourcePill}>
              <Ionicons
                name="document-text-outline"
                size={14}
                color={Theme.colors.primary}
              />
              <AppText style={styles.sourcePillText}>
                {sourceType === "observer-upload"
                  ? "Observer submitted evidence"
                  : "Community submitted report"}
              </AppText>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <AppText style={styles.sectionTitle}>
                Image of the Signed Result Sheet
              </AppText>
              <View style={styles.mediaBadge}>
                <Ionicons
                  name="image-outline"
                  size={14}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.mediaBadgeText}>Image</AppText>
              </View>
            </View>

            <View style={styles.mediaCard}>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </View>

            <View style={styles.infoStrip}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color="#B45309"
              />
              <AppText style={styles.infoStripText}>
                The uploaded picture must show a signed polling unit result sheet
                clearly enough for public review and verification.
              </AppText>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <AppText style={styles.sectionTitle}>
                Video of Cumulative Result Announcement
              </AppText>
              <View style={styles.mediaBadge}>
                <Ionicons
                  name="videocam-outline"
                  size={14}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.mediaBadgeText}>Video</AppText>
              </View>
            </View>

            <View style={styles.mediaCard}>
              <CollationVideoPlayer
                uri={videoUri}
                title="Cumulative result announcement"
                subtitle="Tap to load the verified video evidence"
                posterMode
              />
            </View>

            <View style={styles.infoStrip}>
              <Ionicons
                name="mic-outline"
                size={14}
                color="#B45309"
              />
              <AppText style={styles.infoStripText}>
                Video evidence should include voice proof of place and context so
                the announcement remains authentic and verifiable.
              </AppText>
            </View>
          </View>

          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color={Theme.colors.primary}
              />
              <AppText style={styles.noteTitle}>Observer Note</AppText>
            </View>

            <AppText style={styles.noteBody}>
              {evidence.note ??
                "Result sheet was captured immediately after collation at the polling unit. The announcement video was recorded after party agents and officials confirmed the figures on site."}
            </AppText>
          </View>

          <View style={styles.statsSection}>
            <AppText style={styles.statsSectionTitle}>
              Administrative Figures from EC8A Sheet
            </AppText>
            <AppText style={styles.statsSectionSubtitle}>
              These figures were extracted from the polling unit result evidence
              submitted for this election report.
            </AppText>

            <View style={styles.statsGrid}>
              <StatCard
                label="Accredited Voter"
                value={evidence.accreditedVoter ?? "675,435"}
              />
              <StatCard
                label="Rejected Votes"
                value={evidence.rejectedVotes ?? "657"}
              />
              <StatCard
                label="Spoiled Ballot Papers"
                value={evidence.spoiledBallots ?? "320"}
              />
              <StatCard
                label="Used Ballot Papers"
                value={evidence.usedBallots ?? "601"}
              />
              <StatCard
                label="Unused Ballot Papers"
                value={evidence.unusedBallots ?? "87"}
              />
            </View>
          </View>

          <View style={styles.verifiedMetaCard}>
            <View style={styles.verifiedMetaHeader}>
              <View style={styles.verifiedMetaTitleWrap}>
                <Ionicons
                  name="navigate-outline"
                  size={16}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.verifiedMetaTitle}>
                  Verified Submission Metadata
                </AppText>
              </View>

              <View style={styles.geoTag}>
                <AppText style={styles.geoTagText}>GPS Tagged</AppText>
              </View>
            </View>

            <View style={styles.verifiedMetaBody}>
              <VerifiedMetaRow
                label="Election"
                value={
                  evidence.electionName ??
                  "Alimosho Local Government Election 2026"
                }
              />
              <VerifiedMetaRow
                label="Submitted By"
                value={
                  evidence.observerName
                    ? `${evidence.observerName} (${evidence.observerHandle ?? "@observer"})`
                    : evidence.observerHandle ?? "@IronEagle23"
                }
              />
              <VerifiedMetaRow
                label="Submitted At"
                value={evidence.submittedAt ?? "15 Mar 2027 · 08:42 AM WAT"}
              />
              <VerifiedMetaRow
                label="Geo Address"
                value={
                  evidence.locationMeta ??
                  "No 20 Ao, Alimosho, Lagos State, Nigeria"
                }
              />
            </View>

            <View style={styles.legalFootnote}>
              <Ionicons
                name="document-lock-outline"
                size={14}
                color={Theme.colors.primary}
              />
              <AppText style={styles.legalFootnoteText}>
                Evidence metadata is stored with timestamp and verified location
                context for transparency and audit review.
              </AppText>
            </View>
          </View>
        </View>
      </AppBottomSheet>
    );
  }
);

export default SeeEvidenceBottomSheet;

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaItem}>
      <View style={styles.metaItemTop}>
        <Ionicons name={icon} size={13} color={Theme.colors.textMuted} />
        <AppText style={styles.metaItemLabel}>{label}</AppText>
      </View>
      <AppText style={styles.metaItemValue}>{value}</AppText>
    </View>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <AppText style={styles.statLabel}>{label}</AppText>
      <AppText style={styles.statValue}>{value}</AppText>
    </View>
  );
}

function VerifiedMetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.verifiedMetaRow}>
      <AppText style={styles.verifiedMetaRowLabel}>{label}</AppText>
      <AppText style={styles.verifiedMetaRowValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },

  heroCard: {
    borderRadius: 20,
    backgroundColor: "#F4FBFA",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.14)",
    padding: 14,
    gap: 14,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  heroTopLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
  },

  heroIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAFBF9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  heroTextWrap: {
    flex: 1,
    gap: 3,
  },

  heroTitle: {
    fontSize: 15,
    lineHeight: 19,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  heroSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  verificationPill: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  verificationPillVerified: {
    backgroundColor: "#EAFBF9",
  },

  verificationPillPending: {
    backgroundColor: "#FFF7E7",
  },

  verificationPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
  },

  verificationPillTextVerified: {
    color: Theme.colors.primary,
  },

  verificationPillTextPending: {
    color: "#B45309",
  },

  evidenceTitle: {
    fontSize: 24,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  heroMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  metaItem: {
    width: "47%",
    borderRadius: 14,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    padding: 10,
    gap: 6,
  },

  metaItemTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metaItemLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },

  metaItemValue: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  sourcePill: {
    alignSelf: "flex-start",
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  sourcePillText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  section: {
    gap: 10,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  mediaBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "#EAFBF9",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  mediaBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  mediaCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    backgroundColor: "#F8FAFC",
  },

  image: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
    backgroundColor: "#EEF2F6",
  },

  infoStrip: {
    borderRadius: 14,
    backgroundColor: "#FFF8EC",
    borderWidth: 1,
    borderColor: "#F6E1B7",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  infoStripText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: "#9A6700",
  },

  noteCard: {
    borderRadius: 18,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    padding: 14,
    gap: 10,
  },

  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  noteTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  noteBody: {
    fontSize: 13,
    lineHeight: 20,
    color: Theme.colors.text,
  },

  statsSection: {
    gap: 8,
  },

  statsSectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  statsSectionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  statCard: {
    width: "47%",
    minHeight: 92,
    borderRadius: 16,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "space-between",
  },

  statLabel: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.textMuted,
  },

  statValue: {
    fontSize: 28,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  verifiedMetaCard: {
    borderRadius: 20,
    backgroundColor: "#DFF7EB",
    padding: 14,
    gap: 12,
  },

  verifiedMetaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  verifiedMetaTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  verifiedMetaTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  geoTag: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },

  geoTagText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  verifiedMetaBody: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.72)",
    padding: 12,
    gap: 10,
  },

  verifiedMetaRow: {
    gap: 4,
  },

  verifiedMetaRowLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },

  verifiedMetaRowValue: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  legalFootnote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  legalFootnoteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: Theme.colors.text,
  },
});