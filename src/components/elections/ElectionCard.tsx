import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import type { ElectionItem, ElectionType } from "@/data/elections";
import PresidentialElection from "@/svgs/app/PresidentialElection";
import SenatorElection from "@/svgs/app/SenatorElection";
import HouseOfRepsElection from "@/svgs/app/HouseOfRepsElection";
import { Theme } from "@/theme";

type Props = {
  item: ElectionItem;
  onPress?: () => void;
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
  switch (type) {
    case "Presidential":
      return <PresidentialElection width={size} height={size} />;
    case "Senatorial":
      return <SenatorElection width={size} height={size} />;
    case "House of Reps":
    case "State House of Assembly":
      return <HouseOfRepsElection width={size} height={size} />;
    case "Governorship":
    case "Gubernatorial":
      // Placeholder: using presidential for now
      return <PresidentialElection width={size} height={size} />;
    case "Local Government":
      return <PresidentialElection width={size} height={size} />;
    default:
      return <PresidentialElection width={size} height={size} />;
  }
}

export default function ElectionCard({ item, onPress }: Props) {
  const isLive = item.status === "live";

  return (
    <View style={[styles.cardWrap, isLive && styles.cardWrapLive]}>
      <View style={[styles.dateCol, isLive && styles.dateColLive]}>
        <Ionicons
          name="calendar-outline"
          size={24}
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
            <AppText style={styles.title}>{item.title}</AppText>
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
            <AppText style={styles.metaText}>{item.location}</AppText>
          </View>

          {typeof item.partiesCount === "number" ? (
            <View style={styles.metaItem}>
              <Ionicons
                name="people-outline"
                size={18}
                color={Theme.colors.textMuted}
              />
              <AppText style={styles.metaText}>
                {item.partiesCount} Parties
              </AppText>
            </View>
          ) : null}
        </View>

        <Pressable onPress={onPress} style={styles.ctaRow}>
          <AppText style={styles.ctaText}>{item.ctaLabel}</AppText>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Theme.colors.primary}
          />
        </Pressable>
      </View>
    </View>
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
    borderColor: "#FF2A2A",
    backgroundColor: "#FF2A2A",
    padding: 10,
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  contentCardLive: {
    borderRadius: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  topLeft: {
    flex: 1,
    gap: 4,
  },
  status: {
    fontSize: 13.5,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  badgeWrap: {
    paddingTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  ctaText: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});