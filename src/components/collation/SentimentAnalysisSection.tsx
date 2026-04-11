import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import { CollationItem } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";

type Props = {
  collation: CollationItem;
};

export default function SentimentAnalysisSection({ collation }: Props) {
  const empty = !collation.isAssignedToPollingUnit;

  if (empty) {
    return (
      <View style={styles.emptyWrap}>
        <NoElection width={86} height={86} />
        <AppText style={styles.emptyTitle}>No Election Report yet</AppText>
        <AppText style={styles.emptySubtitle}>
          Citizen Monitor have not commence operate then.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.section}>
        <AppText style={styles.title}>Sentiment Analysis</AppText>
        <AppText style={styles.subtitle}>
          Captured from real reports of this election from {collation.resultsUploaded}{" "}
          results and {collation.incidentsReported} incidents reported from 245/245
          polling units in Alimosho.
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Rating of today&apos;s election</AppText>

        <View style={styles.scoreCircle}>
          <AppText style={styles.scoreText}>Good{"\n"}{collation.sentiment.score}%</AppText>
        </View>

        <View style={styles.legend}>
          {collation.sentiment.legend.map((item) => (
            <View key={item.label} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <AppText style={styles.legendLabel}>{item.label}</AppText>
              </View>

              <View style={styles.legendRight}>
                <AppText style={styles.legendCount}>
                  {item.count} Observers
                </AppText>
                <AppText style={styles.legendPercent}>{item.value}%</AppText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Instances of vote buying?</AppText>
        <AppText style={styles.smallMuted}>
          Observer(s) submission for instances of voting buying activity at their
          polling unit(s).
        </AppText>

        <View style={styles.legendRow}>
          <View style={styles.legendLeft}>
            <View style={[styles.legendDot, { backgroundColor: Theme.colors.primary }]} />
            <AppText style={styles.legendLabel}>Observers</AppText>
          </View>

          <AppText style={styles.legendCount}>
            {collation.sentiment.voteBuyingSubmitted} Submissions
          </AppText>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendLeft}>
            <View style={[styles.legendDot, { backgroundColor: "#F04A1D" }]} />
            <AppText style={styles.legendLabel}>Observers</AppText>
          </View>

          <AppText style={styles.legendCount}>
            {collation.sentiment.voteBuyingObserverSubmitted} Submissions
          </AppText>
        </View>

        <CollationAnimatedProgressBar
          progress={100}
          height={14}
          color="#F04A1D"
          trackColor="#16B3AA"
        />
      </View>

      <View style={styles.card}>
        <AppText style={styles.cardTitle}>Instances of voter intimidation?</AppText>
        <AppText style={styles.smallMuted}>
          Observer(s) submission of instances of voting activity at their polling
          unit(s).
        </AppText>

        <View style={styles.intimidationGrid}>
          <MiniStat value={collation.sentiment.intimidation.total} label="Total" />
          <MiniStat
            value={collation.sentiment.intimidation.occurred}
            label="Occurred"
            color={Theme.colors.primary}
          />
          <MiniStat
            value={collation.sentiment.intimidation.notOccurred}
            label="Not Occurred"
            color="#F04A1D"
          />
        </View>

        <CollationAnimatedProgressBar
          progress={collation.sentiment.intimidationBarPercent}
          height={14}
          color="#F04A1D"
          trackColor="#16B3AA"
        />
      </View>
    </View>
  );
}

function MiniStat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <View style={styles.miniStat}>
      <AppText style={[styles.miniValue, color ? { color } : null]}>
        {value}
      </AppText>
      <AppText style={styles.miniLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },

  section: {
    gap: 8,
  },

  title: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    backgroundColor: Theme.colors.surface,
    padding: 14,
    gap: 12,
  },

  cardTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  scoreCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    alignSelf: "center",
    borderWidth: 10,
    borderColor: "#4377F0",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  legend: {
    gap: 10,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  legendRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },

  legendLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
  },

  legendCount: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  legendPercent: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  smallMuted: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  intimidationGrid: {
    flexDirection: "row",
    gap: 10,
  },

  miniStat: {
    flex: 1,
    minHeight: 78,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    backgroundColor: Theme.colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  miniValue: {
    fontSize: 28,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  miniLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 6,
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
    maxWidth: 220,
  },
});