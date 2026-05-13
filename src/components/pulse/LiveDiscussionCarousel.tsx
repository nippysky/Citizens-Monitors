// ─── src/components/pulse/LiveDiscussionCarousel.tsx ──────────────────────────
import { Ionicons } from "@expo/vector-icons";
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
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { PulseLiveElection } from "@/lib/api/pulse.api";
import { Theme } from "@/theme";

import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";

type Props = {
  items: PulseLiveElection[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onJoinDiscussion: (item: PulseLiveElection) => void;
};

const SIDE_PADDING = 16;
const CARD_GAP = 12;
const NEXT_CARD_PEEK = 24;

function getElectionIcon(type: string) {
  const normalizedType = type.toLowerCase();

  if (
    normalizedType.includes("senatorial") ||
    normalizedType.includes("senate")
  ) {
    return SenatorElection;
  }

  if (
    normalizedType.includes("house-of-representatives") ||
    normalizedType.includes("house of representatives") ||
    normalizedType.includes("house of rep") ||
    normalizedType.includes("state house")
  ) {
    return HouseOfRepsElection;
  }

  return PresidentialElection;
}

function formatElectionType(type: string): string {
  return type
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getElectionTitle(item: PulseLiveElection): string {
  if (item.electionName?.trim()) {
    return item.electionName.trim();
  }

  return formatElectionType(item.electionType);
}

function getDiscussionCountText(item: PulseLiveElection): string {
  if (item.partiesCount > 0) {
    return `${item.partiesCount} parties active`;
  }

  return "Live collation discussion";
}

function clampIndex(index: number, total: number): number {
  return Math.max(0, Math.min(index, Math.max(0, total - 1)));
}

export default function LiveDiscussionCarousel({
  items,
  activeIndex,
  onIndexChange,
  onJoinDiscussion,
}: Props) {
  const listRef = useRef<FlatList<PulseLiveElection>>(null);
  const { width } = useWindowDimensions();

  const cardWidth = useMemo(() => {
    return width - SIDE_PADDING * 2 - NEXT_CARD_PEEK;
  }, [width]);

  const snapInterval = useMemo(() => {
    return cardWidth + CARD_GAP;
  }, [cardWidth]);

  const scrollEnabled = items.length > 1;

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (!scrollEnabled) return;

    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = clampIndex(Math.round(offsetX / snapInterval), items.length);

    if (nextIndex !== activeIndex) {
      onIndexChange(nextIndex);
    }
  };

  const handleScrollEndDrag = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (!scrollEnabled) return;

    const velocityX = event.nativeEvent.velocity?.x ?? 0;

    /**
     * If there is no real momentum, iOS may not fire momentum end.
     * This keeps the dot correct after slow drags.
     */
    if (Math.abs(velocityX) < 0.05) {
      handleMomentumEnd(event);
    }
  };

  const getItemLayout = (
    _: ArrayLike<PulseLiveElection> | null | undefined,
    index: number
  ) => ({
    length: snapInterval,
    offset: snapInterval * index,
    index,
  });

  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      <AppText style={styles.sectionTitle}>Live Election Discussions</AppText>

      <FlatList
        ref={listRef}
        data={items}
        horizontal
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        alwaysBounceHorizontal={false}
        overScrollMode="never"
        snapToInterval={scrollEnabled ? snapInterval : undefined}
        snapToAlignment="start"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleScrollEndDrag}
        getItemLayout={getItemLayout}
        initialNumToRender={Math.min(items.length, 3)}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={false}
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
          {items.map((item, index) => (
            <View
              key={`${item.id}-dot-${index}`}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
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
  item: PulseLiveElection;
  width: number;
  onJoin: () => void;
}) {
  const ElectionIcon = getElectionIcon(item.electionType);
  const isLive = item.status === "live";

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.livePill, !isLive && styles.endedPill]}>
          {isLive ? <PulsingDot /> : null}

          <AppText style={[styles.liveText, !isLive && styles.endedText]}>
            {isLive ? "LIVE NOW" : "ENDED"}
          </AppText>
        </View>

        <View style={styles.electionIconWrap}>
          <ElectionIcon width={42} height={42} />
        </View>
      </View>

      <AppText style={styles.electionTitle} numberOfLines={2}>
        {getElectionTitle(item)}
      </AppText>

      {item.electionLocation ? (
        <AppText style={styles.locationText} numberOfLines={1}>
          {item.electionLocation}
        </AppText>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.discussionCountRow}>
          <Ionicons
            name="chatbubbles-outline"
            size={14}
            color={Theme.colors.textMuted}
          />

          <AppText style={styles.discussionCountText}>
            {getDiscussionCountText(item)}
          </AppText>
        </View>

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
      withTiming(0.2, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.liveDot, animStyle]} />;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    paddingTop: 4,
    paddingBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    paddingHorizontal: SIDE_PADDING,
  },

  /**
   * Right padding is intentionally larger than left padding.
   * This is what lets the final card scroll fully into position while keeping
   * the next-card peek on earlier slides.
   */
  listContent: {
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING + NEXT_CARD_PEEK,
  },

  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 7,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  livePill: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "rgba(239,68,68,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  endedPill: {
    backgroundColor: "rgba(17,26,50,0.06)",
  },

  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#EF4444",
  },

  liveText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#EF4444",
    fontFamily: Theme.fonts.body.semibold,
  },

  endedText: {
    color: Theme.colors.textMuted,
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

  locationText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 7,
  },

  discussionCountRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  discussionCountText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

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