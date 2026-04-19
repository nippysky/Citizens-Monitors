import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import { Theme } from "@/theme";
import { ElectionCardItem, ElectionType } from "@/types/home";

type Props = {
  item: ElectionCardItem;
  width?: number;
};

function ElectionTypeIcon({ type }: { type: ElectionType }) {
  const size = 40;
  switch (type) {
    case "presidential":
    case "gubernatorial":
      return <PresidentialElection width={size} height={size} />;
    case "senate":
      return <SenatorElection width={size} height={size} />;
    case "house-of-reps":
      return <HouseOfRepsElection width={size} height={size} />;
    default:
      return <PresidentialElection width={size} height={size} />;
  }
}

export default function LiveElectionCard({ item, width }: Props) {
  // ── Pulsing red dot ──
  const dotOpacity = useSharedValue(1);
  useEffect(() => {
    dotOpacity.value = withRepeat(
      withTiming(0.25, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [dotOpacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  // ── Animated progress bar ──
  const progress =
    item.totalPollingUnits > 0
      ? Math.min(1, item.pollingUnitsRecorded / item.totalPollingUnits)
      : 0;

  const progressWidth = useSharedValue(0);
  useEffect(() => {
    progressWidth.value = withTiming(progress, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, progressWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const handleCollation = () => router.push(Paths.appCollation);
  const handleSubmit = () => router.push(Paths.submitElectionReport);

  return (
    <View style={[styles.card, width ? { width } : null]}>
      {/* LIVE badge + election type icon */}
      <View style={styles.topRow}>
        <View style={styles.liveRow}>
          <Animated.View style={[styles.liveDot, dotStyle]} />
          <AppText style={styles.liveText}>LIVE NOW</AppText>
        </View>
        <View style={styles.iconWrap}>
          <ElectionTypeIcon type={item.electionType} />
        </View>
      </View>

      {/* Title + location + PU count — all single-line for alignment parity */}
      <View style={styles.textWrap}>
        <AppText
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
        >
          {item.title}
        </AppText>

        <View style={styles.metaRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={Theme.colors.textMuted}
          />
          <AppText
            style={styles.metaText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.location}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name="document-text-outline"
            size={14}
            color={Theme.colors.textMuted}
          />
          <AppText
            style={styles.metaText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.pollingUnitsRecorded}/{item.totalPollingUnits} Polling Units
            recorded
          </AppText>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.collationBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={handleCollation}
        >
          <Ionicons name="filter-outline" size={15} color="#FFFFFF" />
          <AppText style={styles.collationText} numberOfLines={1}>
            Collation
          </AppText>
          <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={handleSubmit}
        >
          <Ionicons
            name="document-text-outline"
            size={15}
            color={Theme.colors.text}
          />
          <AppText style={styles.submitText} numberOfLines={1}>
            Submit
          </AppText>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={Theme.colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: "#F6F1D9",
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    // TIGHT shadow — keeps depth under the card without bleeding into the
    // gap between cards on iOS. Wide shadowRadius was the culprit before.
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4D4D",
  },
  liveText: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.bold,
    letterSpacing: 0.6,
  },
  iconWrap: {
    marginLeft: 8,
  },
  textWrap: {
    gap: 6,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.bold,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(25, 183, 176, 0.18)",
    overflow: "hidden",
    marginTop: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  collationBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  collationText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },
  submitBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.12)",
  },
  submitText: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});