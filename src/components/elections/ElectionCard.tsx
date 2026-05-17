import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import type { ElectionItem, ElectionType } from "@/data/elections";
import { getElectionTypeLabel } from "@/data/elections";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import { Theme } from "@/theme";

type Props = {
  item: ElectionItem;
  onLivePress?: () => void;
  onConcludedPress?: () => void;
  onUpcomingPress?: () => void;
};

function statusColor(status: ElectionItem["status"]): string {
  if (status === "live") return "#FF2A2A";
  if (status === "upcoming") return "#F28C38";

  return "#159A32";
}

function statusLabel(status: ElectionItem["status"]): string {
  if (status === "live") return "Live";
  if (status === "upcoming") return "UPCOMING";

  return "CONCLUDED";
}

function ElectionTypeIcon({ type }: { type: ElectionType }) {
  const size = 34;
  const normalized = String(type).toLowerCase();

  if (normalized.includes("senatorial") || normalized.includes("senate")) {
    return <SenatorElection width={size} height={size} />;
  }

  if (
    normalized.includes("house") ||
    normalized.includes("gubernatorial") ||
    normalized.includes("governorship")
  ) {
    return <HouseOfRepsElection width={size} height={size} />;
  }

  return <PresidentialElection width={size} height={size} />;
}

export default function ElectionCard({
  item,
  onLivePress,
  onConcludedPress,
  onUpcomingPress,
}: Props) {
  const isLive = item.status === "live";
  const isUpcoming = item.status === "upcoming";
  const isConcluded = item.status === "concluded";

  const showCTA = isLive || isConcluded || isUpcoming;
  const ctaLabel = isLive
    ? "Monitor Election"
    : isConcluded
      ? "View Reports"
      : "View Details";

  const handleCardPress = () => {
    if (isLive) {
      onLivePress?.();
      return;
    }

    if (isConcluded) {
      onConcludedPress?.();
      return;
    }

    onUpcomingPress?.();
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.cardWrap,
        isLive && styles.cardWrapLive,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.dateCol, isLive && styles.dateColLive]}>
        <Ionicons
          name="calendar-outline"
          size={22}
          color={isLive ? "#FFFFFF" : Theme.colors.textMuted}
        />

        <AppText style={[styles.month, isLive && styles.monthLive]}>
          {item.date.monthShort}
        </AppText>

        <AppText style={[styles.day, isLive && styles.dayLive]}>
          {item.date.day}
        </AppText>

        <AppText style={[styles.year, isLive && styles.yearLive]}>
          {item.date.year}
        </AppText>
      </View>

      <View style={[styles.contentCard, isLive && styles.contentCardLive]}>
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <AppText
              style={[styles.status, { color: statusColor(item.status) }]}
            >
              • {statusLabel(item.status)}
            </AppText>

            <AppText style={styles.title} numberOfLines={2}>
              {item.title}
            </AppText>

            <AppText style={styles.typeText} numberOfLines={1}>
              {getElectionTypeLabel(item.type)}
            </AppText>
          </View>

          <View style={styles.badgeWrap}>
            <ElectionTypeIcon type={item.type} />
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="location-outline"
              size={18}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaText} numberOfLines={1}>
              {item.location}
            </AppText>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={18}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaText} numberOfLines={1}>
              {item.dateRangeLabel}
            </AppText>
          </View>

          {typeof item.partiesCount === "number" ? (
            <View style={styles.metaItem}>
              <Ionicons
                name="people-outline"
                size={18}
                color={Theme.colors.textMuted}
              />
              <AppText style={styles.metaText}>
                {item.partiesCount} parties configured
              </AppText>
            </View>
          ) : null}
        </View>

        {showCTA ? (
          <View style={styles.ctaRow}>
            <AppText style={styles.ctaText}>{ctaLabel}</AppText>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Theme.colors.primary}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    flexDirection: "row",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3E6EA",
    backgroundColor: "#FFFFFF",
  },

  cardWrapLive: {
    borderColor: "#F04438",
    backgroundColor: "#F04438",
    padding: 10,
  },

  cardPressed: {
    opacity: 0.88,
  },

  dateCol: {
    width: 62,
    backgroundColor: "#F3F3EF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 2,
  },

  dateColLive: {
    backgroundColor: "transparent",
  },

  month: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  monthLive: {
    color: "#FFFFFF",
  },

  day: {
    fontSize: 24,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  dayLive: {
    color: "#FFFFFF",
  },

  year: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  yearLive: {
    color: "#FFFFFF",
  },

  contentCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },

  contentCardLive: {
    borderRadius: 14,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  topLeft: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },

  status: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.bold,
    textTransform: "uppercase",
  },

  title: {
    fontSize: 18,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  typeText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  badgeWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(25,183,176,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  metaRow: {
    gap: 7,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  metaText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  ctaRow: {
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: "rgba(25,183,176,0.08)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.22)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ctaText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});