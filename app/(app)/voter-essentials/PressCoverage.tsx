import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import EmptyPressCoverageState from "@/components/press-coverage/EmptyPressCoverageState";
import PressCoverageFeedList from "@/components/press-coverage/PressCoverageFeedList";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import { mapPressCoverageApiItem } from "@/data/pressCoverage";
import { usePressCoverageInfiniteQuery } from "@/hooks/api/usePressCoverageQueries";
import { Theme } from "@/theme";

function PressCoverageSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={`press-coverage-skeleton-${index}`}
          style={[
            styles.skeletonCard,
            index !== 5 && styles.skeletonCardBorder,
          ]}
        >
          <View style={styles.skeletonImage} />

          <View style={styles.skeletonTextWrap}>
            <View style={styles.skeletonTitleLong} />
            <View style={styles.skeletonTitleShort} />

            <View style={styles.skeletonMetaRow}>
              <View style={styles.skeletonDot} />
              <View style={styles.skeletonDate} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorWrap}>
      <View style={styles.errorIconWrap}>
        <Ionicons
          name="cloud-offline-outline"
          size={28}
          color={Theme.colors.primary}
        />
      </View>

      <AppText style={styles.errorTitle}>Unable to load press coverage</AppText>
      <AppText style={styles.errorText}>
        Check your connection and try again.
      </AppText>

      <Pressable onPress={onRetry} style={styles.retryBtn}>
        <AppText style={styles.retryText}>Retry</AppText>
      </Pressable>
    </View>
  );
}

export default function PressCoverageScreen() {
  const pressQuery = usePressCoverageInfiniteQuery();

  const firstPage = pressQuery.data?.pages[0];

  const title = firstPage?.title ?? "Press Coverage";
  const subtitle =
    firstPage?.subtitle ??
    "Official statements, press releases, and public information by Citizen Monitor.";

  const items = useMemo(() => {
    return (
      pressQuery.data?.pages.flatMap((page) =>
        page.items.map(mapPressCoverageApiItem)
      ) ?? []
    );
  }, [pressQuery.data]);

  const hasItems = items.length > 0;

  const handleRefresh = () => {
    void pressQuery.refetch();
  };

  const handleEndReached = () => {
    if (pressQuery.hasNextPage && !pressQuery.isFetchingNextPage) {
      void pressQuery.fetchNextPage();
    }
  };

  return (
    <AppGradientScreen scroll={false}>
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <BackButton />
          <View style={styles.titleBlock}>
            <AppText style={styles.title}>{title}</AppText>
            <AppText style={styles.subtitle}>{subtitle}</AppText>
          </View>
        </View>

        <View style={styles.feedWrap}>
          {pressQuery.isLoading ? (
            <PressCoverageSkeleton />
          ) : pressQuery.isError ? (
            <ErrorState
              onRetry={() => {
                void pressQuery.refetch();
              }}
            />
          ) : hasItems ? (
            <PressCoverageFeedList
              items={items}
              refreshing={pressQuery.isRefetching}
              onRefresh={handleRefresh}
              onEndReached={handleEndReached}
              ListFooterComponent={
                pressQuery.isFetchingNextPage ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator color={Theme.colors.primary} />
                  </View>
                ) : (
                  <View style={{ height: 20 }} />
                )
              }
            />
          ) : (
            <EmptyPressCoverageState />
          )}
        </View>
      </View>
    </AppGradientScreen>
  );
}

const skeletonColor = "rgba(17, 26, 50, 0.08)";
const skeletonColorSoft = "rgba(17, 26, 50, 0.05)";

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

  skeletonWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 18,
  },

  skeletonCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17, 26, 50, 0.08)",
  },

  skeletonImage: {
    width: 86,
    height: 74,
    borderRadius: 12,
    backgroundColor: skeletonColor,
  },

  skeletonTextWrap: {
    flex: 1,
    gap: 9,
  },

  skeletonTitleLong: {
    width: "92%",
    height: 18,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonTitleShort: {
    width: "68%",
    height: 18,
    borderRadius: 999,
    backgroundColor: skeletonColorSoft,
  },

  skeletonMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },

  skeletonDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(5, 163, 156, 0.28)",
  },

  skeletonDate: {
    width: 84,
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(5, 163, 156, 0.14)",
  },

  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },

  errorIconWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 163, 156, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(5, 163, 156, 0.14)",
  },

  errorTitle: {
    fontSize: 20,
    lineHeight: 25,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  retryBtn: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  retryText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },

  footerLoader: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});