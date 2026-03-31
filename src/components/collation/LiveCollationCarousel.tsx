import { useMemo, useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";

import { CollationItem } from "@/data/collation";
import { Theme } from "@/theme";
import CollationAnimatedProgressBar from "./CollationAnimatedProgressBar";

type Props = {
  items: CollationItem[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

export default function LiveCollationCarousel({
  items,
  activeIndex,
  onIndexChange,
}: Props) {
  const listRef = useRef<FlatList<CollationItem>>(null);
  const { width } = useWindowDimensions();

  const cardWidth = useMemo(() => width - 52, [width]);
  const snapInterval = useMemo(() => cardWidth + 12, [cardWidth]);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / snapInterval
    );
    onIndexChange(Math.max(0, Math.min(nextIndex, items.length - 1)));
  };

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => (
          <Pressable style={[styles.card, { width: cardWidth }]}>
            <View style={styles.cardHeader}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <AppText style={styles.liveText}>
                  {item.status === "live" ? "LIVE NOW" : "ENDED"}
                </AppText>
              </View>

              <Ionicons
                name="medal-outline"
                size={22}
                color={Theme.colors.warning}
              />
            </View>

            <AppText style={styles.electionTitle}>{item.electionTitle}</AppText>

            <View style={styles.progressMetaRow}>
              <View style={styles.progressLabelWrap}>
                <Ionicons
                  name="bar-chart-outline"
                  size={13}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.progressLabel}>
                  COLLATION PROGRESS
                </AppText>
              </View>

              <AppText style={styles.progressPercent}>
                {item.progressPercent}%
              </AppText>
            </View>

            <CollationAnimatedProgressBar
              progress={item.progressPercent}
              color={Theme.colors.primary}
              trackColor="#DCDDE1"
              height={4}
            />

            <AppText style={styles.unitsText}>
              {item.coveredUnits} of {item.totalUnits} polling units
            </AppText>
          </Pressable>
        )}
      />

      <View style={styles.dotsRow}>
        {items.map((item, index) => {
          const active = index === activeIndex;

          return (
            <View
              key={item.id}
              style={[styles.dot, active && styles.dotActive]}
            />
          );
        })}
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

  card: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#F7F1D8",
    borderWidth: 1,
    borderColor: "#E8DFC0",
    ...Theme.shadows.card,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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

  electionTitle: {
    fontSize: 22,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    marginBottom: 10,
  },

  progressMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },

  progressLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  progressLabel: {
    fontSize: 11,
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
    marginTop: 6,
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