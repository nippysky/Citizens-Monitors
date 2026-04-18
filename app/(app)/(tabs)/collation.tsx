// ─── src/app/(app)/(tabs)/collation.tsx ───────────────────────────────────────
// Fixed:
// 1. Live notice action now opens CommencementBottomSheet correctly
// 2. Notice now receives real context data from the active collation item
// 3. Dev + production flow now share the same notice plumbing cleanly
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import CollationContextTabs, {
  CollationTabKey,
} from "@/components/collation/CollationContextTabs";
import CollationDiscussionsTab from "@/components/collation/CollationDiscussionTab";
import CollationOverviewTab from "@/components/collation/CollationOverviewTab";
import CollationReviewReportsTab from "@/components/collation/CollationReviewReportsTab";
import LiveCollationCarousel from "@/components/collation/LiveCollationCarousel";
import { useLiveNotice } from "@/components/feedback/LiveNoticeProvider";
import ScreenHeader from "@/components/elections/ScreenHeader";
import { Paths } from "@/constants/paths";
import {
  collationDummyData,
  type CollationItem,
  getCollationNotificationText,
} from "@/data/collation";
import { buildCommencementContext } from "@/lib/reporting";
import { Theme } from "@/theme";

export default function CollationScreen() {
  const params = useLocalSearchParams<{ tab?: string; collationId?: string }>();

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<CollationTabKey>("overview");
  const { showNotice, hideNotice } = useLiveNotice();

  useEffect(() => {
    if (params.tab) {
      const validTabs: CollationTabKey[] = [
        "overview",
        "review-reports",
        "discussions",
      ];

      const incoming = params.tab as CollationTabKey;

      if (validTabs.includes(incoming)) {
        setActiveTab(incoming);
      }
    }

    if (params.collationId) {
      const idx = collationDummyData.findIndex(
        (c) => c.id === params.collationId
      );

      if (idx >= 0) {
        setActiveIndex(idx);
      }
    }
  }, [params.tab, params.collationId]);

  const activeCollation = useMemo(
    () => collationDummyData[activeIndex] ?? collationDummyData[0],
    [activeIndex]
  );

  const noticeContextData = useMemo(
    () => buildNoticeContextFromCollation(activeCollation),
    [activeCollation]
  );

  useEffect(() => {
    if (activeCollation.status === "live") {
      showNotice({
        message: getCollationNotificationText(activeCollation),
        actionLabel: "Submit Election Report",
        contextData: noticeContextData,
      });
    } else {
      hideNotice();
    }

    return () => {
      hideNotice();
    };
  }, [activeCollation, hideNotice, noticeContextData, showNotice]);

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
          {activeTab === "overview" ? (
            <CollationOverviewTab collation={activeCollation} />
          ) : activeTab === "review-reports" ? (
            <CollationReviewReportsTab collation={activeCollation} />
          ) : (
            <CollationDiscussionsTab collation={activeCollation} />
          )}
        </View>
      </View>
    </AppGradientScreen>
  );
}

function buildNoticeContextFromCollation(item: CollationItem) {
  const locationParts = item.location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const state = locationParts[0] || "Lagos";
  const lga = locationParts[1] || "Alimosho LGA";

  return buildCommencementContext({
    electionId: item.id,
    electionTitle: item.fullTitle,
    pollingUnitName: "Ikotun Community Primary School",
    pollingUnitCode: "LA/01/08/004",
    ward: "Ward 01",
    lga,
    state,
  });
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