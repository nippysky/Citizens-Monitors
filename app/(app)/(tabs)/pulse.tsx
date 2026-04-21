import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import AppText from "@/components/ui/AppText";
import PulseScopeTabs, {
  PulseTabKey,
} from "@/components/pulse/PulseScopeTabs";
import PulseForYouTab from "@/components/pulse/PulseForYouTab";
import PulsePostButton from "@/components/pulse/PulsePostButton";
import SharePulseOpinionSheet from "@/components/pulse/SharePulseOpinionSheet";
import TourTarget from "@/components/tour/TourTarget";
import { Paths } from "@/constants/paths";
import { pulseReviewReports, PulseDiscussionPost } from "@/data/pulse";
import { Theme } from "@/theme";
import ScreenHeader from "@/components/elections/ScreenHeader";
import PulseReviewCollationTab from "@/components/pulse/PulseReviewCollaborationTab";

export default function PulseScreen() {
  const [activeTab, setActiveTab] = useState<PulseTabKey>("for-you");
  const [scrolling, setScrolling] = useState(false);
  const shareSheetRef = useRef<BottomSheetModal>(null);

  const [userPosts, setUserPosts] = useState<PulseDiscussionPost[]>([]);

  const handleOpenShareSheet = useCallback(() => {
    requestAnimationFrame(() => shareSheetRef.current?.present());
  }, []);

  const handleOpinionPayload = useCallback(
    (payload: { body: string; audience: string; imageUri?: string }) => {
      const newPost: PulseDiscussionPost = {
        id: `user-${Date.now()}`,
        author: "@You",
        electionLabel: "Your Polling Unit",
        scopeLabel:
          payload.audience === "my-lga"
            ? "Post Within LGA"
            : "Post Within My Ward",
        body: payload.body,
        imageUri: payload.imageUri,
        minutesAgo: 0,
        likes: 0,
        commentCount: 0,
        shares: 0,
      };
      setUserPosts((prev) => [newPost, ...prev]);
    },
    []
  );

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <ScreenHeader
            title="Pulse"
            onNotifications={() => router.push(Paths.appNotifications)}
            onHelp={() => router.push(Paths.appHelpSupport)}
          />

          <TourTarget id="pulse.scope-tabs">
            <PulseScopeTabs
              value={activeTab}
              onChange={setActiveTab}
              reviewCount={pulseReviewReports.length}
            />
          </TourTarget>

          <AppText style={styles.subtitle}>
            Stay informed. Stay vigilant. Every update matters.
          </AppText>
        </View>

        <View style={styles.body}>
          {activeTab === "for-you" && (
            <PulseForYouTab
              onScrollStateChange={setScrolling}
              injectedPosts={userPosts}
            />
          )}

          {activeTab === "review-collation" && <PulseReviewCollationTab />}
        </View>

        {activeTab === "for-you" ? (
          <PulsePostButton
            onPress={handleOpenShareSheet}
            collapsed={scrolling}
          />
        ) : null}
      </View>

      <SharePulseOpinionSheet
        ref={shareSheetRef}
        onSubmitted={() => {}}
        onPayload={handleOpinionPayload}
      />
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
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