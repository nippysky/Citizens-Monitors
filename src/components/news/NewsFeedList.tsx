import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import NewsFeedCard from "@/components/news/NewsFeedCard";
import {
  usePrefetchNewsInsight,
} from "@/hooks/api/useNewsQueries";
import type { NewsInsightItem } from "@/lib/api/news.api";
import { Theme } from "@/theme";

type Props = {
  items: NewsInsightItem[];
  refreshing?: boolean;
  loadingMore?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
};

function NewsFeedList({
  items,
  refreshing = false,
  loadingMore = false,
  onRefresh,
  onEndReached,
}: Props) {
  const prefetchNewsInsight = usePrefetchNewsInsight();

  const renderItem: ListRenderItem<NewsInsightItem> = ({ item, index }) => {
    const isLast = index === items.length - 1;

    return (
      <NewsFeedCard
        item={item}
        isLast={isLast}
        onPressIn={() => prefetchNewsInsight(item)}
      />
    );
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      bounces
      style={styles.list}
      contentContainerStyle={styles.content}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.45}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={9}
      removeClippedSubviews
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        ) : undefined
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={Theme.colors.primary} />
          </View>
        ) : (
          <View style={{ height: 20 }} />
        )
      }
    />
  );
}

function NewsFeedListSkeleton() {
  return (
    <View style={styles.skeletonContent}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={`news-skeleton-${index}`} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />

          <View style={styles.skeletonBody}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonTitleShort} />

            <View style={styles.skeletonDateRow}>
              <View style={styles.skeletonDot} />
              <View style={styles.skeletonDate} />
            </View>
          </View>

          <View style={styles.skeletonChevron} />
        </View>
      ))}
    </View>
  );
}

NewsFeedList.Skeleton = NewsFeedListSkeleton;

export default NewsFeedList;

const skeletonColor = "rgba(17, 26, 50, 0.08)";
const skeletonStrong = "rgba(17, 26, 50, 0.13)";

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 20,
  },

  footerLoader: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },

  skeletonContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 20,
  },

  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 26, 50, 0.10)",
  },

  skeletonImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: skeletonColor,
  },

  skeletonBody: {
    flex: 1,
    gap: 10,
  },

  skeletonTitle: {
    width: "88%",
    height: 18,
    borderRadius: 999,
    backgroundColor: skeletonStrong,
  },

  skeletonTitleShort: {
    width: "62%",
    height: 18,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  skeletonDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(25,183,176,0.25)",
  },

  skeletonDate: {
    width: 88,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(25,183,176,0.14)",
  },

  skeletonChevron: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: skeletonColor,
  },
});