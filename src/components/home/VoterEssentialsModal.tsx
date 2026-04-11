import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { allVoterEssentials } from "@/data/home";
import { Theme } from "@/theme";
import { VoterEssentialItem } from "@/types/home";


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
  visible: boolean;
  onClose: () => void;
};

function EssentialIcon({ item }: { item: VoterEssentialItem }) {
  const IconComponent = ICON_MAP[item.icon];

  return (
    <Pressable
      style={styles.iconWrap}
      onPress={() => {
        router.push(item.route as any);
      }}
    >
      {IconComponent ? (
        <IconComponent width={56} height={56} />
      ) : (
        <View style={styles.iconFallback} />
      )}
      <AppText style={styles.iconLabel} numberOfLines={2}>
        {item.label}
      </AppText>
    </Pressable>
  );
}

export default function VoterEssentialsModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  const rows: VoterEssentialItem[][] = [];
  for (let i = 0; i < allVoterEssentials.length; i += 3) {
    rows.push(allVoterEssentials.slice(i, i + 3));
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <AppText style={styles.headerTitle}>Voters Essentials</AppText>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={Theme.colors.text} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 24, 39, 0.06)",
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.bold,
    color: Theme.colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  grid: {
    gap: 28,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: "30%",
    alignItems: "center",
    gap: 10,
  },
  iconFallback: {
    width: 56,
    height: 56,
  },
  iconLabel: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.text,
    textAlign: "center",
    fontFamily: Theme.fonts.body.semibold,
  },
});