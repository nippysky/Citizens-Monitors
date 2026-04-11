import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import EmptyNewsState from "@/components/news/EmptyNewsState";
import NewsFeedList from "@/components/news/NewsFeedList";
import NewsHeader from "@/components/news/NewsHeader";
import { mockNewsFeed } from "@/data/news";

export default function NewsScreen() {
  const newsItems = useMemo(() => mockNewsFeed, []);
  const hasNews = newsItems.length > 0;

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <NewsHeader />
        </View>

        <View style={styles.feedSection}>
          {hasNews ? (
            <NewsFeedList items={newsItems} />
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyNewsState />
            </View>
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

  topSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },

  feedSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  emptyWrap: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});