// ─── src/components/pulse/LiveDiscussionCarousel.tsx ──────────────────────────
import { useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { LiveElectionDiscussion } from "@/data/pulse";
import { Theme } from "@/theme";

import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";

type Props = {
  items: LiveElectionDiscussion[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onJoinDiscussion: (item: LiveElectionDiscussion) => void;
};

function getElectionIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("senatorial") || t.includes("senate")) return SenatorElection;
  if (t.includes("house of rep") || t.includes("state house"))
    return HouseOfRepsElection;
  return PresidentialElection;
}

export default function LiveDiscussionCarousel({
  items,
  activeIndex,
  onIndexChange,
  onJoinDiscussion,
}: Props) {
  const listRef = useRef<FlatList<LiveElectionDiscussion>>(null);
  const { width } = useWindowDimensions();
  const cardWidth = useMemo(() => width - 52, [width]);
  const snapInterval = useMemo(() => cardWidth + 12, [cardWidth]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
    onIndexChange(Math.max(0, Math.min(next, items.length - 1)));
  };

  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      <AppText style={styles.sectionTitle}>Live Election Discussions</AppText>

      <FlatList
        ref={listRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => (
          <DiscussionCard
            item={item}
            width={cardWidth}
            onJoin={() => onJoinDiscussion(item)}
          />
        )}
      />

      {items.length > 1 ? (
        <View style={styles.dotsRow}>
          {items.map((item, i) => (
            <View
              key={item.id}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function DiscussionCard({
  item,
  width,
  onJoin,
}: {
  item: LiveElectionDiscussion;
  width: number;
  onJoin: () => void;
}) {
  const ElectionIcon = getElectionIcon(item.electionType);

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.cardHeader}>
        <View style={styles.livePill}>
          {item.status === "live" ? <PulsingDot /> : null}
          <AppText style={styles.liveText}>
            {item.status === "live" ? "LIVE NOW" : "ENDED"}
          </AppText>
        </View>
        <View style={styles.electionIconWrap}>
          <ElectionIcon width={42} height={42} />
        </View>
      </View>

      <AppText style={styles.electionTitle} numberOfLines={2}>
        {item.electionTitle}
      </AppText>

      <View style={styles.cardFooter}>
        <View style={styles.discussionCountRow}>
          <Ionicons
            name="chatbubbles-outline"
            size={14}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.discussionCountText}>
            {item.activeDiscussions} active discussions
          </AppText>
        </View>

        {/* Join Discussion — soft green bg + thick teal border */}
        <Pressable onPress={onJoin} style={styles.joinBtn}>
          <AppText style={styles.joinBtnText}>Join Discussion</AppText>
        </Pressable>
      </View>
    </View>
  );
}

function PulsingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.liveDot, animStyle]} />;
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    paddingHorizontal: 16,
  },
  listContent: { paddingHorizontal: 16 },

  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#EF4444",
  },
  liveText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#EF4444",
    fontFamily: Theme.fonts.body.semibold,
  },
  electionIconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  electionTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  discussionCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  discussionCountText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  // Soft green transparent bg + thick primary border
  joinBtn: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 163, 156, 0.06)",
    borderWidth: 1.8,
    borderColor: Theme.colors.primary,
  },
  joinBtnText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#CDE9E6",
  },
  dotActive: {
    width: 22,
    backgroundColor: Theme.colors.primary,
  },
});