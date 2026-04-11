import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Theme } from "@/theme";
import { ElectionCardItem } from "@/types/home";
import LiveElectionCard from "./LiveElectrionCard";

type Props = {
  items: ElectionCardItem[];
};

const CARD_WIDTH = 310;
const CARD_GAP = 14;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 22 : 6);
  const opacity = useSharedValue(active ? 1 : 0.35);

  useEffect(() => {
    width.value = withTiming(active ? 22 : 6, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(active ? 1 : 0.35, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, width, opacity]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        active && styles.dotActive,
        style,
      ]}
    />
  );
}

export default function ElectionCarousel({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => <LiveElectionCard item={item} />}
      />

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
    gap: 10,
  },
  content: {
    paddingRight: 16,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(25, 183, 176, 0.3)",
  },
  dotActive: {
    backgroundColor: Theme.colors.primary,
  },
});