import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Theme } from "@/theme";
import { ElectionCardItem, UserRole } from "@/types/home";
import LiveElectionCard from "./LiveElectionCard";

type Props = {
  items: ElectionCardItem[];
  viewerRole: UserRole;
};

const SIDE_PADDING = 16;
const CARD_GAP = 14;
const NEXT_CARD_PEEK = 24;

function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 26 : 7);
  const opacity = useSharedValue(active ? 1 : 0.35);

  useEffect(() => {
    width.value = withSpring(active ? 26 : 7, {
      damping: 18,
      stiffness: 220,
      mass: 0.55,
    });

    opacity.value = withTiming(active ? 1 : 0.35, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, opacity, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function ElectionCarousel({ items, viewerRole }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const width = Math.floor(event.nativeEvent.layout.width);

    setContainerWidth((previous) => (previous === width ? previous : width));
  }, []);

  const { cardWidth, snapInterval } = useMemo(() => {
    if (containerWidth <= 0) {
      return {
        cardWidth: 0,
        snapInterval: 0,
      };
    }

    const width = Math.floor(
      containerWidth - SIDE_PADDING - CARD_GAP - NEXT_CARD_PEEK
    );

    return {
      cardWidth: width,
      snapInterval: width + CARD_GAP,
    };
  }, [containerWidth]);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!snapInterval) return;

      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / snapInterval
      );

      setActiveIndex(Math.max(0, Math.min(nextIndex, items.length - 1)));
    },
    [items.length, snapInterval]
  );

  const renderItem = useCallback(
    ({ item }: { item: ElectionCardItem }) => (
      <LiveElectionCard item={item} width={cardWidth} viewerRole={viewerRole} />
    ),
    [cardWidth, viewerRole]
  );

  const keyExtractor = useCallback((item: ElectionCardItem) => item.id, []);

  if (!items.length) return null;

  return (
    <View style={styles.wrap} onLayout={handleLayout}>
      {cardWidth > 0 ? (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={snapInterval}
          snapToAlignment="start"
          disableIntervalMomentum
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={{
            paddingLeft: SIDE_PADDING,
            paddingRight: SIDE_PADDING + NEXT_CARD_PEEK,
          }}
          ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
          renderItem={renderItem}
          onMomentumScrollEnd={handleMomentumEnd}
          scrollEventThrottle={16}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={false}
        />
      ) : null}

      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, index) => (
            <Dot
              key={`election-dot-${item.id}`}
              active={index === activeIndex}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },

  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: Platform.OS === "android" ? 2 : 0,
  },

  dot: {
    height: 7,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },
});
