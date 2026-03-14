import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EmptyReportsState from "@/components/reports/EmptyReportState";
import ReportsList from "@/components/reports/ReportList";
import ReportsHeader from "@/components/reports/ReportsHeader";
import ReportStatsGrid from "@/components/reports/ReportsStatGrid";
import {
    myReportsList,
    myReportStats
} from "@/data/myReports";

export default function MyReportsScreen() {
  const stats = useMemo(() => myReportStats, []);
  const reports = useMemo(() => myReportsList, []);

  const hasReports = reports.length > 0;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        <LinearGradient
          colors={["#EEF5DB", "#F5F2DE", "#FAF8EE", "#F7F7F2"]}
          locations={[0, 0.24, 0.6, 1]}
          style={styles.gradientBg}
        />

        <View style={styles.content}>
          <ReportsHeader />

          {hasReports ? (
            <>
              <View style={styles.statsWrap}>
                <ReportStatsGrid items={stats} />
              </View>

              <View style={styles.listWrap}>
                <ReportsList items={reports} />
              </View>
            </>
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyReportsState />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#EEF5DB",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },

  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  statsWrap: {
    marginTop: 14,
  },

  listWrap: {
    flex: 1,
    marginTop: 18,
  },

  emptyWrap: {
    flex: 1,
  },
});