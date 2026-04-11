import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import Observer from "@/svgs/app/Observer";
import Volunteer from "@/svgs/app/Volunteer";
import { Theme } from "@/theme";
import { InfoBannerItem } from "@/types/home";

type Props = {
  item: InfoBannerItem;
};

function renderBannerSvg(type: InfoBannerItem["illustration"]) {
  if (type === "volunteer") {
    return <Volunteer width={42} height={42} />;
  }

  return <Observer width={42} height={42} />;
}

export default function HomeBannerCard({ item }: Props) {
  if (item.type === "waitlist") {
    return (
      <View style={styles.waitlistCard}>
        <View style={styles.waitlistLeft}>
          <View style={styles.smallIconWrap}>{renderBannerSvg(item.illustration)}</View>

          <View style={styles.waitlistTextWrap}>
            <AppText style={styles.waitlistTitle}>{item.title}</AppText>
            <AppText style={styles.waitlistSubtitle}>{item.subtitle}</AppText>
          </View>
        </View>

        <Pressable>
          <AppText style={styles.waitlistCta}>{item.cta}</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.tipCard}>
      <View style={styles.tipTextWrap}>
        <AppText style={styles.tipTitle}>{item.title}</AppText>
        <Pressable style={styles.tipCtaWrap}>
          <AppText style={styles.tipCta}>{item.cta}</AppText>
          <Ionicons name="chevron-forward" size={14} color={Theme.colors.primary} />
        </Pressable>
      </View>

      <View style={styles.tipSvgWrap}>{renderBannerSvg(item.illustration)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  waitlistCard: {
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.56)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  waitlistLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  smallIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  waitlistTextWrap: {
    flex: 1,
    gap: 2,
  },
  waitlistTitle: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  waitlistSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },
  waitlistCta: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  tipCard: {
    minHeight: 84,
    borderRadius: 16,
    backgroundColor: "#DDF9EC",
    borderWidth: 1,
    borderColor: "rgba(25, 183, 176, 0.16)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipTextWrap: {
    flex: 1,
    gap: 8,
  },
  tipTitle: {
    fontSize: 14,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  tipCtaWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  tipCta: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
  tipSvgWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});