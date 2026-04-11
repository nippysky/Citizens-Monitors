import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import QuietDay from "@/svgs/app/QuietDay";
import { Theme } from "@/theme";

type Props = {
  title: string;
  subtitle: string;
};

export default function QuietDayBanner({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <QuietDay width={32} height={32} />
      </View>

      <View style={styles.textWrap}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 82,
    borderRadius: 16,
    backgroundColor: "#F6F1D9",
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.06)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Theme.colors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.bold,
  },
  subtitle: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});