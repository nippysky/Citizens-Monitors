import { useCallback, useEffect, useMemo, useRef } from "react";
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
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import AppText from "@/components/ui/AppText";
import { CollationItem } from "@/data/collation";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import { Theme } from "@/theme";

type Props = {
  items: CollationItem[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

const CARD_GAP = 12;

/**
 * Returns an ELEMENT rather than a component type. Binding a component to a
 * capitalised local during render gives it a fresh identity each pass, so
 * React remounts the subtree (react-hooks/static-components).
 */
function renderElectionIcon(type: Parameters<typeof getElectionIcon>[0], size: number) {
  const Icon = getElectionIcon(type);
  return <Icon width={size} height={size} />;
}

function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0;

  return Math.max(0, Math.min(index, total - 1));
}

function getElectionIcon(title: string) {
  const value = title.toLowerCase();

  if (value.includes("senatorial") || value.includes("senate")) {
    return SenatorElection;
  }

  if (value.includes("house of rep") || value.includes("state house")) {
    return HouseOfRepsElection;
  }

  return PresidentialElection;
}

export default function LiveCollationCarousel({
  items,
  activeIndex,
  onIndexChange,
}: Props) {
  const listRef = useRef<FlatList<CollationItem>>(null);
  const didMountRef = useRef(false);
  const lastOffsetIndexRef = useRef(activeIndex);

  const { width } = useWindowDimensions();

  const cardWidth = useMemo(() => Math.max(292, width - 52), [width]);
  const snapInterval = useMemo(() => cardWidth + CARD_GAP, [cardWidth]);

  const safeActiveIndex = clampIndex(activeIndex, items.length);

  const syncListToActiveIndex = useCallback(
    (animated: boolean) => {
      if (!items.length) return;

      const targetIndex = clampIndex(activeIndex, items.length);
      const targetOffset = targetIndex * snapInterval;

      lastOffsetIndexRef.current = targetIndex;

      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: targetOffset,
          animated,
        });
      });
    },
    [activeIndex, items.length, snapInterval]
  );

  useEffect(() => {
    if (!items.length) return;

    if (!didMountRef.current) {
      didMountRef.current = true;
      syncListToActiveIndex(false);
      return;
    }

    if (lastOffsetIndexRef.current !== safeActiveIndex) {
      syncListToActiveIndex(true);
    }
  }, [items.length, safeActiveIndex, syncListToActiveIndex]);

  const resolveIndexFromOffset = useCallback(
    (offsetX: number) => {
      const nextIndex = clampIndex(
        Math.round(offsetX / snapInterval),
        items.length
      );

      lastOffsetIndexRef.current = nextIndex;

      if (nextIndex !== activeIndex) {
        onIndexChange(nextIndex);
      }
    },
    [activeIndex, items.length, onIndexChange, snapInterval]
  );

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      resolveIndexFromOffset(event.nativeEvent.contentOffset.x);
    },
    [resolveIndexFromOffset]
  );

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!event.nativeEvent.velocity?.x) {
        resolveIndexFromOffset(event.nativeEvent.contentOffset.x);
      }
    },
    [resolveIndexFromOffset]
  );

  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CarouselCard item={item} width={cardWidth} />
        )}
        getItemLayout={(_, index) => ({
          length: snapInterval,
          offset: snapInterval * index,
          index,
        })}
        initialScrollIndex={safeActiveIndex}
        onScrollToIndexFailed={({ index }) => {
          const targetIndex = clampIndex(index, items.length);

          requestAnimationFrame(() => {
            listRef.current?.scrollToOffset({
              offset: targetIndex * snapInterval,
              animated: false,
            });
          });
        }}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleScrollEndDrag}
        extraData={safeActiveIndex}
      />

      {items.length > 1 ? (
        <View style={styles.dotsRow}>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.dot, index === safeActiveIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function CarouselCard({ item, width }: { item: CollationItem; width: number }) {

  return (
    <Pressable style={[styles.card, { width }]}>
      <View style={styles.cardHeader}>
        <View style={styles.livePill}>
          {item.status === "live" ? <PulsingDot /> : null}
          <AppText style={styles.liveText}>
            {item.status === "live" ? "LIVE NOW" : "ENDED"}
          </AppText>
        </View>

        <View style={styles.electionIconWrap}>
          {renderElectionIcon(item.electionTitle, 36)}
        </View>
      </View>

      <AppText style={styles.electionTitle} numberOfLines={2}>
        {item.electionTitle}
      </AppText>

      <View style={styles.progressMetaRow}>
        <View style={styles.progressLabelWrap}>
          <Ionicons
            name="bar-chart-outline"
            size={12}
            color={Theme.colors.primary}
          />
          <AppText style={styles.progressLabel}>COLLATION PROGRESS</AppText>
        </View>

        <AppText style={styles.progressPercent}>
          {item.progressPercent}%
        </AppText>
      </View>

      <CollationAnimatedProgressBar
        progress={item.progressPercent}
        color={Theme.colors.primary}
        trackColor="#DCDDE1"
        height={5}
      />

      <AppText style={styles.unitsText}>
        {item.coveredUnits} of {item.totalUnits} polling units
      </AppText>
    </Pressable>
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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.liveDot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },

  content: {
    paddingRight: 12,
  },

  card: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#F7F1D8",
    borderWidth: 1,
    borderColor: "#E8DFC0",
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EF4444",
  },

  liveText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  electionIconWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  electionTitle: {
    fontSize: 20,
    lineHeight: 23,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    marginBottom: 8,
  },

  progressMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },

  progressLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  progressLabel: {
    fontSize: 10,
    lineHeight: 14,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  progressPercent: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  unitsText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
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