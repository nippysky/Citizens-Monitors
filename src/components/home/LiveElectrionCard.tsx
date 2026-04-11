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
import { Theme } from "@/theme";
import { ElectionCardItem, ElectionType } from "@/types/home";
import SenatorElection from "@/svgs/app/SenatorElection";

type Props = {
  item: ElectionCardItem;
};

function ElectionTypeIcon({ type }: { type: ElectionType }) {
  const size = 38;
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


export default function LiveElectionCard({ item }: Props) {
  // ── Pulsing red dot ──
  const dotOpacity = useSharedValue(1);
  useEffect(() => {
    dotOpacity.value = withRepeat(
      withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [dotOpacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  // ── Animated progress bar ──
  const progress = item.totalPollingUnits > 0
    ? item.pollingUnitsRecorded / item.totalPollingUnits
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

  const handleCollation = () => {
    router.push(Paths.electionDetails(item.id));
  };

  const handleSubmit = () => {
    router.push(Paths.electionDetails(item.id));
  };

  return (
    <View style={styles.card}>
      {/* LIVE badge + election type icon */}
      <View style={styles.topRow}>
        <View style={styles.liveRow}>
          <Animated.View style={[styles.dot, dotStyle]} />
          <AppText style={styles.liveText}>LIVE NOW</AppText>
        </View>
        <ElectionTypeIcon type={item.electionType} />
      </View>

      {/* Title + location + PU count */}
      <View style={styles.bodyRow}>
        <View style={styles.textWrap}>
          <AppText style={styles.title} numberOfLines={2}>
            {item.title}
          </AppText>

          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaText}>{item.location}</AppText>
          </View>

          <View style={styles.metaRow}>
            <Ionicons
              name="document-text-outline"
              size={14}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaText}>
              {item.pollingUnitsRecorded}/{item.totalPollingUnits} Polling Units
              recorded
            </AppText>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.collationBtn} onPress={handleCollation}>
          <Ionicons name="filter-outline" size={15} color="#FFFFFF" />
          <AppText style={styles.collationText}>Collation</AppText>
          <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
        </Pressable>

        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <Ionicons
            name="document-text-outline"
            size={15}
            color={Theme.colors.text}
          />
          <AppText style={styles.submitText}>Submit</AppText>
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
    width: 310,
    borderRadius: 18,
    backgroundColor: "#F6F1D9",
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4D4D",
  },
  liveText: {
    fontSize: 11,
    lineHeight: 15,
    color: "#FF4D4D",
    fontFamily: Theme.fonts.body.bold,
  },
  bodyRow: {
    gap: 8,
  },
  textWrap: {
    gap: 6,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
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
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(25, 183, 176, 0.18)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  collationBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
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
  },
  submitBtn: {
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.08)",
  },
  submitText: {
    color: Theme.colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: Theme.fonts.body.semibold,
  },
});