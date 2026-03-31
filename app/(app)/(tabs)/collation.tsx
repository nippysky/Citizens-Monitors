import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import ElectionsHeader from "@/components/elections/ElectionsHeader";
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
import CollationDiscussionsTab from "@/components/collation/CollationDiscussionTab";
import { useLiveNotice } from "@/components/feedback/LiveNoticeProvider";

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
        actionLabel: "Report Incidents",
        onPress: () => setActiveTab("review-reports"),
      });
    } else {
      hideNotice();
    }

    return () => {
      hideNotice();
    };
  }, [activeCollation, showNotice, hideNotice]);

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <ElectionsHeader
            title="Collations"
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
          {activeTab === "overview" ? (
            <CollationOverviewTab collation={activeCollation} />
          ) : null}

          {activeTab === "review-reports" ? (
            <CollationReviewReportsTab collation={activeCollation} />
          ) : null}

          {activeTab === "discussions" ? (
            <CollationDiscussionsTab collation={activeCollation} />
          ) : null}
        </View>
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },

  body: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    marginTop: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
});