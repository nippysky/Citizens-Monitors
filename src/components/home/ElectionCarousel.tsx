import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Theme } from "@/theme";
import { ElectionCardItem } from "@/types/home";
import LiveElectionCard from "./LiveElectrionCard";

type Props = {
  items: ElectionCardItem[];
};

// Layout constants. Every number below plays a role in the snap math —
// change one, and you'll need to reason through the others.
const SIDE_PADDING = 16;    // gutter from container edge to first card
const CARD_GAP = 14;        // space between adjacent cards
const NEXT_CARD_PEEK = 20;  // how much of the following card is visible

// ─────────────────────────────────────────────────────────────────
// Pagination dot
// ─────────────────────────────────────────────────────────────────
function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 22 : 6);
  const opacity = useSharedValue(active ? 1 : 0.32);

  useEffect(() => {
    // Spring for width — gives the pill a natural, slightly squishy expansion.
    width.value = withSpring(active ? 22 : 6, {
      damping: 18,
      stiffness: 220,
      mass: 0.55,
      overshootClamping: false,
    });
    // Timing for opacity — a clean linear-ish fade looks better than a spring here.
    opacity.value = withTiming(active ? 1 : 0.32, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, width, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

// ─────────────────────────────────────────────────────────────────
// Carousel
// ─────────────────────────────────────────────────────────────────
export default function ElectionCarousel({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  // containerWidth is measured from the component's actual parent.
  // Using useWindowDimensions() was the earlier bug — it reports the full
  // device width, not the width this component has to work with. When the
  // parent has any horizontal padding, the math overflows and the peek
  // disappears. onLayout is the only reliable source of truth here.
  const [containerWidth, setContainerWidth] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.floor(e.nativeEvent.layout.width);
    setContainerWidth((prev) => (prev === w ? prev : w));
  }, []);

  // Derived sizing. Floor everything so sub-pixel rounding (Android especially)
  // doesn't cause cards to land one pixel off the snap point.
  const { CARD_WIDTH, SNAP_INTERVAL } = useMemo(() => {
    if (containerWidth <= 0) return { CARD_WIDTH: 0, SNAP_INTERVAL: 0 };
    const cw = Math.floor(
      containerWidth - SIDE_PADDING - CARD_GAP - NEXT_CARD_PEEK
    );
    return { CARD_WIDTH: cw, SNAP_INTERVAL: cw + CARD_GAP };
  }, [containerWidth]);

  // ── Viewability (drives the active dot) ──
  // Stable refs required — FlatList warns loudly if these change between renders.
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) return;
      const leading =
        viewableItems.find((v) => v.isViewable) ?? viewableItems[0];
      if (leading?.index != null) setActiveIndex(leading.index);
    }
  ).current;

  const viewabilityConfig = useRef({
    // 60% threshold means the dot only advances once the new card
    // clearly dominates the viewport — no flicker mid-swipe.
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 60,
  }).current;

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const renderItem = useCallback(
    ({ item }: { item: ElectionCardItem }) => (
      <LiveElectionCard item={item} width={CARD_WIDTH} />
    ),
    [CARD_WIDTH]
  );

  const ItemSep = useCallback(
    () => <View style={{ width: CARD_GAP }} />,
    []
  );

  const keyExtractor = useCallback((item: ElectionCardItem) => item.id, []);

  return (
    <View style={styles.wrap} onLayout={handleLayout}>
      {CARD_WIDTH > 0 && (
        <FlatList
          ref={flatListRef}
          data={items}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          // ── Snapping ──
          decelerationRate="fast"
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="start"
          // One swipe = exactly one card. Without this, a fast flick can skip
          // two cards at once, which always feels janky on a peeking carousel.
          disableIntervalMomentum
          // ── Bounce feel ──
          // iOS: rubber-band at the edges, then snap back to the last card.
          bounces
          alwaysBounceHorizontal
          // Android: overscroll glow + snap back. Native equivalent of bounce.
          overScrollMode="always"
          // ── Layout ──
          contentContainerStyle={{
            paddingLeft: SIDE_PADDING,
            // paddingRight MUST equal CARD_GAP + NEXT_CARD_PEEK, otherwise the
            // last card can't snap to the same left offset as every other card
            // and you get a rubber-band-and-settle-off-center jump on it.
            paddingRight: CARD_GAP + NEXT_CARD_PEEK,
          }}
          ItemSeparatorComponent={ItemSep}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          renderItem={renderItem}
          scrollEventThrottle={16}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          // Never clip subviews — on Android this can prune off-screen cards
          // and cause a flash when they re-enter the viewport.
          removeClippedSubviews={false}
        />
      )}

      {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((_, index) => (
            <Dot key={`dot-${index}`} active={index === activeIndex} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
    // Small trick: letting the wrap shadow-clip itself would cut off the
    // card shadow. We leave overflow default (visible) so shadows render fully.
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    // Tiny vertical breathing room on Android where spacing is tighter.
    paddingVertical: Platform.OS === "android" ? 2 : 0,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    // Single base color. Active vs inactive is driven by opacity (0.32 → 1),
    // so the transition is a smooth fade, never a hard color swap.
    backgroundColor: Theme.colors.primary,
  },
});