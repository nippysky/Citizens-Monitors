import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { ReportStat } from "@/data/myReports";
import { Theme } from "@/theme";

type Props = {
  items: ReportStat[];
};

export default function ReportStatsGrid({ items }: Props) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.iconWrap}>{item.icon}</View>
            <AppText style={styles.value}>{item.value}</AppText>
          </View>

          <AppText style={styles.label}>{item.label}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  card: {
    width: "48.6%",
    minHeight: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  iconWrap: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  value: {
    fontSize: 28,
    lineHeight: 30,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  label: {
    fontSize: 11.5,
    lineHeight: 15,
    color: "rgba(17,26,50,0.76)",
    fontFamily: Theme.fonts.body.semibold,
    alignSelf: "center",
  },
});