import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { ReportElectionItem } from "@/data/myReports";
import { Theme } from "@/theme";

type Props = {
  item: ReportElectionItem;
  isLast?: boolean;
};

export default function ReportElectionCard({ item, isLast = false }: Props) {
  const handleOpenElection = () => {
    router.push(Paths.electionDetails(item.electionId));
  };

  return (
    <View style={[styles.card, !isLast && styles.cardBorder]}>
      <View style={styles.topRow}>
     <View style={styles.badgeWrap}>
  <Ionicons name="ribbon-outline" size={40} color="#F59E0B" />
</View>

        <View style={styles.content}>
          <AppText style={styles.title}>{item.title}</AppText>

          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={Theme.colors.textSoft}
            />
            <AppText style={styles.metaText}>{item.location}</AppText>
          </View>

          <View style={styles.metaRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={Theme.colors.textSoft}
            />
            <AppText style={styles.metaText}>{item.timeLabel}</AppText>
          </View>

          <View style={styles.bottomRow}>
            <AppText style={styles.reportsCount}>
              {item.reportsCount} REPORTS
            </AppText>

            <Pressable onPress={handleOpenElection} style={styles.linkRow}>
              <AppText style={styles.linkText}>View Reports</AppText>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Theme.colors.primary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    backgroundColor: "transparent",
  },

  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,26,50,0.08)",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  badgeWrap: {
    width: 52,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
  },

  content: {
    flex: 1,
    gap: 8,
  },

  title: {
    fontSize: 20,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  metaText: {
    fontSize: 13.5,
    lineHeight: 18,
    color: "rgba(17,26,50,0.72)",
    fontFamily: Theme.fonts.body.medium,
  },

  bottomRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  reportsCount: {
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  linkText: {
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});