import { useRef, useState } from "react";
import {
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    View,
} from "react-native";

import { Theme } from "@/theme";
import { ElectionCardItem } from "@/types/home";
import LiveElectionCard from "./LiveElectrionCard";

type Props = {
  items: ElectionCardItem[];
};

export default function ElectionCarousel({ items }: Props) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / 330);
    setActiveIndex(index);
  };

  return (
    <View style={styles.wrap}>
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={330}
        snapToAlignment="start"
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        renderItem={({ item }) => <LiveElectionCard item={item} />}
      />

      <View style={styles.dots}>
        {items.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  content: {
    paddingRight: 12,
  },
  separator: {
    width: 16,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(25, 183, 176, 0.22)",
  },
  dotActive: {
    width: 18,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },
});