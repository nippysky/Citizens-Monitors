// ─── src/components/pulse/LiveDiscussionCarousel.tsx ──────────────────────────
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
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

// Self-contained carousel. Owns its own scroll/active-index state — does NOT
// ask the parent to track it. Previously activeIndex/onIndexChange were props,
// which caused the parent (PulseForYouTab) to re-render on every swipe and
// remount this component, killing scroll state. Hence the "snap back" bug.
type Props = {
  items: PulseLiveElection[];
  onJoinDiscussion: (item: PulseLiveElection) => void;
};

// Layout constants.
//
// CARD_GAP       : space between adjacent cards
// NEXT_CARD_PEEK : how much of each neighbour peeks on a middle card
// SECTION_HPAD   : horizontal padding for the section title
//
// Derived:
//   CARD_INSET    = NEXT_CARD_PEEK + CARD_GAP   ← symmetric on both sides
//   CARD_WIDTH    = containerWidth − 2 × CARD_INSET
//   SNAP_INTERVAL = CARD_WIDTH + CARD_GAP
const CARD_GAP = 12;
const NEXT_CARD_PEEK = 20;
const SECTION_HPAD = 16;

const DOT_COLOR = Theme.colors.primary;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function getElectionIcon(type: string) {
  const t = type.toLowerCase();

  if (t.includes("senatorial") || t.includes("senate")) return SenatorElection;
  if (
    t.includes("house-of-representatives") ||
    t.includes("house of representatives") ||
    t.includes("house of rep") ||
    t.includes("state house")
  ) {
    return HouseOfRepsElection;
  }
  return PresidentialElection;
}

function formatElectionType(type: string): string {
  return type
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function getElectionTitle(item: PulseLiveElection): string {
  return item.electionName?.trim() || formatElectionType(item.electionType);
}

function getDiscussionCountText(item: PulseLiveElection): string {
  if (item.partiesCount > 0) return `${item.partiesCount} parties active`;
  return "Live collation discussion";
}

/* ------------------------------------------------------------------ */
/* Pulsing LIVE indicator                                             */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Pagination dot — driven by scrollX                                 */
/* ------------------------------------------------------------------ */

function PageDot({
  index,
  scrollX,
  snapInterval,
}: {
  index: number;
  scrollX: SharedValue<number>;
  snapInterval: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    if (snapInterval <= 0) return { width: 6, opacity: 0.32 };

    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    const w = interpolate(
      scrollX.value,
      inputRange,
      [6, 22, 6],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.32, 1, 0.32],
      Extrapolation.CLAMP
    );

    return { width: w, opacity };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

/* ------------------------------------------------------------------ */
/* Card — scroll-driven scale + opacity                               */
/* ------------------------------------------------------------------ */

function DiscussionCard({
  item,
  index,
  cardWidth,
  snapInterval,
  scrollX,
  isLast,
  onJoin,
}: {
  item: PulseLiveElection;
  index: number;
  cardWidth: number;
  snapInterval: number;
  scrollX: SharedValue<number>;
  isLast: boolean;
  onJoin: () => void;
}) {
  const ElectionIcon = getElectionIcon(item.electionType);
  const isLive = item.status === "live";

  const animatedStyle = useAnimatedStyle(() => {
    if (snapInterval <= 0) return {};

    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.94, 1, 0.94],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.65, 1, 0.65],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width: cardWidth,
          marginRight: isLast ? 0 : CARD_GAP,
        },
        animatedStyle,
      ]}
    >
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

        <Pressable
          onPress={onJoin}
          style={({ pressed }) => [
            styles.joinBtn,
            pressed && styles.joinBtnPressed,
          ]}
        >
          <AppText style={styles.joinBtnText}>Join Discussion</AppText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* Carousel                                                           */
/* ------------------------------------------------------------------ */

export default function LiveDiscussionCarousel({
  items,
  onJoinDiscussion,
}: Props) {
  // Measure the actual parent width — useWindowDimensions() lies inside
  // PulseScreen's rounded body wrapper. onLayout is the source of truth.
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.floor(e.nativeEvent.layout.width);
    setContainerWidth((prev) => (prev === w ? prev : w));
  }, []);

  const { CARD_WIDTH, SNAP_INTERVAL, CARD_INSET } = useMemo(() => {
    if (containerWidth <= 0) {
      return { CARD_WIDTH: 0, SNAP_INTERVAL: 0, CARD_INSET: 0 };
    }

    const inset = NEXT_CARD_PEEK + CARD_GAP;
    const cw = Math.floor(containerWidth - 2 * inset);

    return {
      CARD_WIDTH: cw,
      SNAP_INTERVAL: cw + CARD_GAP,
      CARD_INSET: inset,
    };
  }, [containerWidth]);

  // Single source of truth — everything (cards + dots) interpolates from this.
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const scrollEnabled = items.length > 1;

  if (!items.length) return null;

  return (
    <View style={styles.wrap} onLayout={handleLayout}>
      <AppText style={styles.sectionTitle}>Live Election Discussions</AppText>

      {CARD_WIDTH > 0 && (
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
          decelerationRate="fast"
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="start"
          bounces
          alwaysBounceHorizontal={false}
          overScrollMode="never"
          // Stops vertical drags from the outer feed confusing this scroll.
          directionalLockEnabled
          // Symmetric inset → both neighbours peek on a middle card,
          // and max scroll == (N−1) × SNAP_INTERVAL exactly (no drift).
          contentContainerStyle={{
            paddingLeft: CARD_INSET,
            paddingRight: CARD_INSET,
          }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {items.map((item, index) => (
            <DiscussionCard
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              cardWidth={CARD_WIDTH}
              snapInterval={SNAP_INTERVAL}
              scrollX={scrollX}
              isLast={index === items.length - 1}
              onJoin={() => onJoinDiscussion(item)}
            />
          ))}
        </Animated.ScrollView>
      )}

      {items.length > 1 ? (
        <View style={styles.dotsRow}>
          {items.map((item, index) => (
            <PageDot
              key={`${item.id}-dot-${index}`}
              index={index}
              scrollX={scrollX}
              snapInterval={SNAP_INTERVAL}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

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
    paddingHorizontal: SECTION_HPAD,
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

  joinBtnPressed: {
    backgroundColor: "rgba(5, 163, 156, 0.14)",
    transform: [{ scale: 0.98 }],
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
    paddingVertical: Platform.OS === "android" ? 2 : 0,
  },

  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: DOT_COLOR,
  },
});