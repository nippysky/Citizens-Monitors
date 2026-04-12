// ─── src/app/(app)/(tabs)/collation.tsx ───────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import CollationContextTabs, {
  CollationTabKey,
} from "@/components/collation/CollationContextTabs";
import CollationOverviewTab from "@/components/collation/CollationOverviewTab";
import CollationReviewReportsTab from "@/components/collation/CollationReviewReportsTab";
import LiveCollationCarousel from "@/components/collation/LiveCollationCarousel";
import { Paths } from "@/constants/paths";
import {
  collationDummyData,
  getCollationNotificationText,
} from "@/data/collation";
import { Theme } from "@/theme";
import { useLiveNotice } from "@/components/feedback/LiveNoticeProvider";
import ScreenHeader from "@/components/elections/ScreenHeader";
import CollationDiscussionsTab from "@/components/collation/CollationDiscussionTab";

export default function CollationScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<CollationTabKey>("overview");
  const { showNotice, hideNotice } = useLiveNotice();

  const activeCollation = useMemo(
    () => collationDummyData[activeIndex] ?? collationDummyData[0],
    [activeIndex]
  );

  useEffect(() => {
    if (activeCollation.status === "live") {
      showNotice({
        message: getCollationNotificationText(activeCollation),
        actionLabel: "Submit Election Report",
        onPress: () => setActiveTab("review-reports"),
      });
    } else {
      hideNotice();
    }
    return () => { hideNotice(); };
  }, [activeCollation, showNotice, hideNotice]);

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <ScreenHeader
            title="Collation"
            subtitle={activeCollation.electionDateLabel}
            onNotifications={() => router.push(Paths.appNotifications)}
          />

          <LiveCollationCarousel
            items={collationDummyData}
            activeIndex={activeIndex}
            onIndexChange={(index) => {
              setActiveIndex(index);
              setActiveTab("overview");
            }}
          />

          <CollationContextTabs value={activeTab} onChange={setActiveTab} />
        </View>

        <View style={styles.body}>
          {activeTab === "overview" && (
            <CollationOverviewTab collation={activeCollation} />
          )}
          {activeTab === "review-reports" && (
            <CollationReviewReportsTab collation={activeCollation} />
          )}
          {activeTab === "discussions" && (
            <CollationDiscussionsTab collation={activeCollation} />
          )}
        </View>
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  body: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    marginTop: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
});