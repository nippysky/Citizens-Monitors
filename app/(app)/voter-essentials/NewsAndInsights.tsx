import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import EmptyNewsState from "@/components/news/EmptyNewsState";
import NewsFeedList from "@/components/news/NewsFeedList";
import { mockNewsFeed } from "@/data/news";
import { Theme } from "@/theme";

export default function NewsAndInsightsScreen() {
  const hasNews = mockNewsFeed.length > 0;

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <BackButton />
        </View>

        <View style={styles.heroBlock}>
          <AppText style={styles.title}>News &amp; Insight</AppText>
          <AppText style={styles.subtitle}>
            Latest political news from publications.
          </AppText>
        </View>

        <View style={styles.listWrap}>
          {hasNews ? <NewsFeedList items={mockNewsFeed} /> : <EmptyNewsState />}
        </View>
      </View>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    alignItems: "flex-start",
  },

  heroBlock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 10,
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.regular,
  },

  listWrap: {
    flex: 1,
  },
});