import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { getRandomVoterEssentials } from "@/data/home";
import { Theme } from "@/theme";
import { VoterEssentialItem } from "@/types/home";


// ── SVG imports for voter essentials ──
import CitizenAcademy from "@/svgs/app/voter-essentials/CitizenAcademy";
import DigitalElectionVault from "@/svgs/app/voter-essentials/DigitalElectionVault";
import DonateSupport from "@/svgs/app/voter-essentials/DonateSupport";
import ElectionDayProcedure from "@/svgs/app/voter-essentials/ElectionDayProcedure";
import NewsAndInsights from "@/svgs/app/voter-essentials/NewsAndInsights";
import PollingUnitLocator from "@/svgs/app/voter-essentials/PollingUnitLocator";
import PollStationConduct from "@/svgs/app/voter-essentials/PollStationConduct";
import PressCoverage from "@/svgs/app/voter-essentials/PressCoverage";
import VoterRegistration from "@/svgs/app/voter-essentials/VoterRegistration";

const ICON_MAP: Record<string, React.FC<{ width: number; height: number }>> = {
  CitizenAcademy,
  DigitalElectionVault,
  DonateSupport,
  ElectionDayProcedure,
  NewsAndInsights,
  PollingUnitLocator,
  PollStationConduct,
  PressCoverage,
  VoterRegistration,
};

type Props = {
  onViewAll: () => void;
};

function EssentialIcon({ item }: { item: VoterEssentialItem }) {
  const IconComponent = ICON_MAP[item.icon];

  return (
    <Pressable
      style={styles.iconWrap}
      onPress={() => router.push(item.route as any)}
    >
      {IconComponent ? (
        <IconComponent width={52} height={52} />
      ) : (
        <View style={styles.iconFallback} />
      )}
      <AppText style={styles.iconLabel} numberOfLines={2}>
        {item.label}
      </AppText>
    </Pressable>
  );
}

export default function VoterEssentialsSection({ onViewAll }: Props) {
  const essentials = useMemo(() => getRandomVoterEssentials(), []);

  const rows: VoterEssentialItem[][] = [];
  for (let i = 0; i < essentials.length; i += 3) {
    rows.push(essentials.slice(i, i + 3));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Voters Essentials</AppText>
        <Pressable onPress={onViewAll}>
          <AppText style={styles.viewAll}>VIEW ALL</AppText>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {rows.map((row, rowIdx) => (
          <View key={`row-${rowIdx}`} style={styles.gridRow}>
            {row.map((item) => (
              <EssentialIcon key={item.id} item={item} />
            ))}
            {row.length < 3 &&
              Array.from({ length: 3 - row.length }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.iconWrap} />
              ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 18,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.heading.bold,
    color: Theme.colors.text,
  },
  viewAll: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.primary,
  },
  grid: {
    gap: 22,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: "30%",
    alignItems: "center",
    gap: 8,
  },
  iconFallback: {
    width: 52,
    height: 52,
  },
  iconLabel: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.text,
    textAlign: "center",
    fontFamily: Theme.fonts.body.semibold,
  },
});