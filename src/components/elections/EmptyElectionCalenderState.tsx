import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";

type Props = {
  title: string;
  subtitle: string;
};

export default function EmptyElectionCalendarState({
  title,
  subtitle,
}: Props) {
  return (
    <View style={styles.wrap}>
      <NoElection/>

      <View style={styles.textBlock}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 70,
    gap: 18,
  },

  textBlock: {
    alignItems: "center",
    gap: 6,
  },

  title: {
    fontSize: 24,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 280,
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
    textAlign: "center",
  },
});