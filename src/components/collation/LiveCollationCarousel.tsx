// ─── src/components/collation/LiveCollationCarousel.tsx ───────────────────────
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
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import { CollationItem } from "@/data/collation";
import { Theme } from "@/theme";

// Election type SVGs — import your actual SVGs here
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";

type Props = {
  items: CollationItem[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

/** Map election title keywords to the right SVG */
function getElectionIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("senatorial") || t.includes("senate")) return SenatorElection;
  if (t.includes("house of rep") || t.includes("state house")) return HouseOfRepsElection;
  // Presidential, Gubernatorial, Local Government all use Presidential icon
  return PresidentialElection;
}

export default function LiveCollationCarousel({ items, activeIndex, onIndexChange }: Props) {
  const listRef = useRef<FlatList<CollationItem>>(null);
  const { width } = useWindowDimensions();
  const cardWidth = useMemo(() => width - 52, [width]);
  const snapInterval = useMemo(() => cardWidth + 12, [cardWidth]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
    onIndexChange(Math.max(0, Math.min(next, items.length - 1)));
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
        renderItem={({ item }) => <CarouselCard item={item} width={cardWidth} />}
      />
      {items.length > 1 ? (
        <View style={styles.dotsRow}>
          {items.map((item, i) => (
            <View key={item.id} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function CarouselCard({ item, width }: { item: CollationItem; width: number }) {
  const ElectionIcon = getElectionIcon(item.electionTitle);

  return (
    <Pressable style={[styles.card, { width }]}>
      <View style={styles.cardHeader}>
        <View style={styles.livePill}>
          {item.status === "live" ? <PulsingDot /> : null}
          <AppText style={styles.liveText}>
            {item.status === "live" ? "LIVE NOW" : "ENDED"}
          </AppText>
        </View>
        {/* Election type SVG icon */}
        <View style={styles.electionIconWrap}>
          <ElectionIcon width={36} height={36} />
        </View>
      </View>

      <AppText style={styles.electionTitle} numberOfLines={2}>
        {item.electionTitle}
      </AppText>

      <View style={styles.progressMetaRow}>
        <View style={styles.progressLabelWrap}>
          <Ionicons name="bar-chart-outline" size={12} color={Theme.colors.primary} />
          <AppText style={styles.progressLabel}>COLLATION PROGRESS</AppText>
        </View>
        <AppText style={styles.progressPercent}>{item.progressPercent}%</AppText>
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
      withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.liveDot, animStyle]} />;
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  content: { paddingRight: 12 },
  card: {
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14,
    backgroundColor: "#F7F1D8", borderWidth: 1, borderColor: "#E8DFC0", gap: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 14 },
      android: { elevation: 4 },
    }),
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "#EF4444" },
  liveText: { fontSize: 11, lineHeight: 14, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  electionIconWrap: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  electionTitle: { fontSize: 20, lineHeight: 23, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold, marginBottom: 8 },
  progressMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 },
  progressLabelWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  progressLabel: { fontSize: 10, lineHeight: 14, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  progressPercent: { fontSize: 12, lineHeight: 16, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  unitsText: { marginTop: 4, fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  dotsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: "#CDE9E6" },
  dotActive: { width: 22, backgroundColor: Theme.colors.primary },
});