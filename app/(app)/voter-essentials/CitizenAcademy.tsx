import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TabBarSpacer from "@/components/layout/TabBarSpacer";
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import type { AcademyArticleSummary } from "@/lib/api/academy.api";
import NoElection from "@/svgs/app/NoElection";
import ShakeHands from "@/svgs/app/ShakeHands";
import { Theme } from "@/theme";
import { useAcademyArticlesQuery, usePrefetchAcademyArticle } from "@/hooks/api/useAcademyQueries";

export default function CitizenAcademyScreen() {
  const academyQuery = useAcademyArticlesQuery();
  const prefetchAcademyArticle = usePrefetchAcademyArticle();

  const academy = academyQuery.data;
  const articles = academy?.articles ?? [];

  const handleItemPress = (item: AcademyArticleSummary) => {
    prefetchAcademyArticle(item);

    router.push({
      pathname: Paths.appLearningFeed as never,
      params: { id: item.slug },
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={Theme.colors.text}
            />
          </Pressable>

          <AppText style={styles.headerTitle}>Citizen Academy</AppText>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={academyQuery.isRefetching}
              onRefresh={() => {
                void academyQuery.refetch();
              }}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
            />
          }
        >
          {academyQuery.isLoading ? (
            <AcademyListSkeleton />
          ) : academyQuery.isError ? (
            <AcademyErrorState
              onRetry={() => {
                void academyQuery.refetch();
              }}
            />
          ) : (
            <>
              <View style={styles.introBlock}>
                <AppText style={styles.introTitle}>
                  {academy?.title ?? "Citizen Academy"}
                </AppText>
                <AppText style={styles.introSub}>
                  {academy?.subtitle ??
                    "Discover all you need to know about election knowledge and awareness in Nigeria."}
                </AppText>
              </View>

              {articles.length > 0 ? (
                articles.map((item) => (
                  <AcademyCard
                    key={item.slug}
                    item={item}
                    onPress={() => handleItemPress(item)}
                    onPressIn={() => prefetchAcademyArticle(item)}
                  />
                ))
              ) : (
                <AcademyEmptyState />
              )}

              <TabBarSpacer />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function AcademyCard({
  item,
  onPress,
  onPressIn,
}: {
  item: AcademyArticleSummary;
  onPress: () => void;
  onPressIn: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardIconWrap}>
        <ShakeHands width={40} height={40} />
      </View>

      <View style={styles.cardContent}>
        <AppText style={styles.cardTitle}>{item.title}</AppText>

        <View style={styles.cardMetaRow}>
          <AppText style={styles.cardCategory}>{item.category}</AppText>
          <View style={styles.cardDot} />
          <AppText style={styles.cardReadTime}>
            {item.readMinutes} min read
          </AppText>
        </View>

        <AppText style={styles.cardDesc} numberOfLines={2}>
          {item.summary}
        </AppText>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={Theme.colors.textMuted}
      />
    </Pressable>
  );
}

function AcademyListSkeleton() {
  return (
    <>
      <View style={styles.skeletonIntro}>
        <View style={styles.skeletonIntroTitle} />
        <View style={styles.skeletonIntroLine} />
        <View style={styles.skeletonIntroLineShort} />
      </View>

      {Array.from({ length: 5 }).map((_, index) => (
        <View key={`academy-skeleton-${index}`} style={styles.skeletonCard}>
          <View style={styles.skeletonIcon} />

          <View style={styles.skeletonCardContent}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonMeta} />
            <View style={styles.skeletonDesc} />
            <View style={styles.skeletonDescShort} />
          </View>

          <View style={styles.skeletonChevron} />
        </View>
      ))}

      <TabBarSpacer />
    </>
  );
}

function AcademyEmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <NoElection width={96} height={96} />
      <AppText style={styles.emptyTitle}>No academy articles yet</AppText>
      <AppText style={styles.emptyText}>
        Learning resources will appear here once they are available.
      </AppText>
    </View>
  );
}

function AcademyErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons
        name="cloud-offline-outline"
        size={42}
        color={Theme.colors.textMuted}
      />
      <AppText style={styles.emptyTitle}>Could not load academy</AppText>
      <AppText style={styles.emptyText}>
        Check your connection and try again.
      </AppText>

      <Pressable onPress={onRetry} style={styles.retryBtn}>
        <AppText style={styles.retryText}>Retry</AppText>
      </Pressable>
    </View>
  );
}

const skeletonColor = "rgba(17, 26, 50, 0.08)";
const skeletonStrong = "rgba(17, 26, 50, 0.13)";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  screen: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },

  backBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  introBlock: {
    gap: 6,
    marginBottom: 6,
  },

  introTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  introSub: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },

  cardPressed: {
    opacity: 0.9,
  },

  cardIconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  cardContent: {
    flex: 1,
    gap: 3,
  },

  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  cardCategory: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  cardDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary,
  },

  cardReadTime: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  emptyWrap: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },

  emptyTitle: {
    fontSize: 20,
    lineHeight: 25,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
  },

  retryBtn: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  retryText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },

  skeletonIntro: {
    gap: 8,
    marginBottom: 6,
  },

  skeletonIntroTitle: {
    width: 154,
    height: 18,
    borderRadius: 999,
    backgroundColor: skeletonStrong,
  },

  skeletonIntroLine: {
    width: "92%",
    height: 13,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonIntroLineShort: {
    width: "68%",
    height: 13,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },

  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: skeletonColor,
  },

  skeletonCardContent: {
    flex: 1,
    gap: 7,
  },

  skeletonTitle: {
    width: "62%",
    height: 15,
    borderRadius: 999,
    backgroundColor: skeletonStrong,
  },

  skeletonMeta: {
    width: "38%",
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(25,183,176,0.14)",
  },

  skeletonDesc: {
    width: "94%",
    height: 12,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonDescShort: {
    width: "72%",
    height: 12,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonChevron: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: skeletonColor,
  },
});