import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, Pressable } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import EmptyNewsState from "@/components/news/EmptyNewsState";
import NewsFeedList from "@/components/news/NewsFeedList";
import { useNewsInsightsInfiniteQuery } from "@/hooks/api/useNewsQueries";
import { Theme } from "@/theme";

export default function NewsAndInsightsScreen() {
  const newsQuery = useNewsInsightsInfiniteQuery();

  const pages = newsQuery.data?.pages ?? [];
  const firstPage = pages[0];

  const items = pages.flatMap((page) => page.items);
  const hasNews = items.length > 0;

  const handleRefresh = () => {
    void newsQuery.refetch();
  };

  const handleLoadMore = () => {
    if (newsQuery.hasNextPage && !newsQuery.isFetchingNextPage) {
      void newsQuery.fetchNextPage();
    }
  };

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <BackButton />
        </View>

        <View style={styles.heroBlock}>
          <AppText style={styles.title}>
            {firstPage?.title ?? "News & Insight"}
          </AppText>
          <AppText style={styles.subtitle}>
            {firstPage?.subtitle ?? "Latest political news from publications."}
          </AppText>
        </View>

        <View style={styles.listWrap}>
          {newsQuery.isLoading ? (
            <NewsFeedList.Skeleton />
          ) : newsQuery.isError ? (
            <View style={styles.errorWrap}>
              <Ionicons
                name="cloud-offline-outline"
                size={42}
                color={Theme.colors.textMuted}
              />
              <AppText style={styles.errorTitle}>Could not load news</AppText>
              <AppText style={styles.errorText}>
                Check your connection and try again.
              </AppText>

              <Pressable onPress={handleRefresh} style={styles.retryButton}>
                <AppText style={styles.retryText}>Retry</AppText>
              </Pressable>
            </View>
          ) : hasNews ? (
            <NewsFeedList
              items={items}
              refreshing={newsQuery.isRefetching && !newsQuery.isFetchingNextPage}
              onRefresh={handleRefresh}
              onEndReached={handleLoadMore}
              loadingMore={newsQuery.isFetchingNextPage}
            />
          ) : (
            <EmptyNewsState />
          )}
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

  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },

  errorTitle: {
    fontSize: 20,
    lineHeight: 25,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
  },

  retryButton: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
});