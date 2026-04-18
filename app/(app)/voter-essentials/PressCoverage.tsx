import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import EmptyPressCoverageState from "@/components/press-coverage/EmptyPressCoverageState";
import PressCoverageFeedList from "@/components/press-coverage/PressCoverageFeedList";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import { mockPressCoverage } from "@/data/pressCoverage";
import { Theme } from "@/theme";

export default function PressCoverageScreen() {
  const hasItems = mockPressCoverage.length > 0;

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <BackButton />
          <View style={styles.titleBlock}>
            <AppText style={styles.title}>Press Coverage</AppText>
            <AppText style={styles.subtitle}>
              Official statements, press releases, and public information by
              Citizen Monitor
            </AppText>
          </View>
        </View>

        <View style={styles.feedWrap}>
          {hasItems ? (
            <PressCoverageFeedList items={mockPressCoverage} />
          ) : (
            <EmptyPressCoverageState />
          )}
        </View>
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 10,
  },

  titleBlock: {
    gap: 10,
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  subtitle: {
    maxWidth: 330,
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.regular,
  },

  feedWrap: {
    flex: 1,
    marginTop: 6,
  },
});