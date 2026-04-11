import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import Observer from "@/svgs/app/Observer";
import PublicViewer from "@/svgs/app/PublicViewer";
import Volunteer from "@/svgs/app/Volunteer";
import { Theme } from "@/theme";
import { ElectionCardItem } from "@/types/home";

type Props = {
  item: ElectionCardItem;
};

function renderIllustration(type: ElectionCardItem["illustration"]) {
  if (type === "volunteer") {
    return <Volunteer width={52} height={52} />;
  }

  if (type === "public-viewer") {
    return <PublicViewer width={52} height={52} />;
  }

  return <Observer width={52} height={52} />;
}

export default function LiveElectrionCard({ item }: Props) {
  const handlePress = (): void => {
    router.push(Paths.electionDetails(item.id));
  };

  return (
    <View style={styles.card}>
      <View style={styles.liveRow}>
        <View style={styles.dot} />
        <AppText style={styles.liveText}>LIVE NOW</AppText>
      </View>

      <View style={styles.titleRow}>
        <View style={styles.textWrap}>
          <AppText style={styles.title}>{item.title}</AppText>

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
              name="time-outline"
              size={14}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaText}>{item.time}</AppText>
          </View>
        </View>

        <View style={styles.illustrationWrap}>
          {renderIllustration(item.illustration)}
        </View>
      </View>

      <Pressable style={styles.cta} onPress={handlePress}>
        <View style={styles.ctaLeft}>
          <MaterialCommunityIcons
            name="binoculars"
            size={17}
            color="#FFFFFF"
          />
          <AppText style={styles.ctaText}>{item.ctaLabel}</AppText>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 314,
    borderRadius: 18,
    backgroundColor: "#F6F1D9",
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    backgroundColor: "#FF6B6B",
  },
  liveText: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.bold,
  },
  titleRow: {
    flexDirection: "row",
    gap: 12,
  },
  textWrap: {
    flex: 1,
    gap: 7,
  },
  title: {
    fontSize: 16,
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
  illustrationWrap: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  cta: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontFamily: Theme.fonts.body.semibold,
  },
});