import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import NoElection from "@/svgs/app/NoElection";
import ShakeHands from "@/svgs/app/ShakeHands";
import { Theme } from "@/theme";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { useAcademyArticlesQuery, useAcademyArticleQuery } from "@/hooks/api/useAcademyQueries";

export default function LearningFeedScreen() {
  const params = useLocalSearchParams<{ id?: string; slug?: string }>();
  const incomingSlug = normalizeRouteParam(params.slug) ?? normalizeRouteParam(params.id);

  const academyListQuery = useAcademyArticlesQuery();
  const fallbackSlug = academyListQuery.data?.articles[0]?.slug;
  const resolvedSlug = incomingSlug ?? fallbackSlug;

  const articleQuery = useAcademyArticleQuery(resolvedSlug);

  const article = articleQuery.data;

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

          <AppText style={styles.headerTitle}>Learning Feed</AppText>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={articleQuery.isRefetching}
              onRefresh={() => {
                void articleQuery.refetch();
              }}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
            />
          }
        >
          {articleQuery.isLoading && !article ? (
            <LearningFeedSkeleton />
          ) : articleQuery.isError || !article ? (
            <LearningFeedErrorState
              onRetry={() => {
                void articleQuery.refetch();
              }}
            />
          ) : (
            <>
              <View style={styles.iconWrap}>
                <ShakeHands width={56} height={56} />
              </View>

              <AppText style={styles.title}>{article.title}</AppText>

              <View style={styles.metaRow}>
                <AppText style={styles.category}>{article.category}</AppText>
                <View style={styles.dot} />
                <AppText style={styles.readTime}>
                  {article.readMinutes} min read
                </AppText>
              </View>

              <AppText style={styles.summary}>{article.summary}</AppText>

              <View style={styles.sectionsWrap}>
                {article.sections.map((section: { heading: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; paragraphs: any[]; }, index: any) => (
                  <View
                    key={`${article.slug}-${section.heading}-${index}`}
                    style={styles.sectionBlock}
                  >
                    <AppText style={styles.sectionHeading}>
                      {section.heading}
                    </AppText>

                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <AppText
                        key={`${article.slug}-${index}-${paragraphIndex}`}
                        style={styles.body}
                      >
                        {paragraph}
                      </AppText>
                    ))}
                  </View>
                ))}
              </View>

              <TabBarSpacer />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function normalizeRouteParam(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];

  const trimmed = value?.trim();
  return trimmed || undefined;
}

function LearningFeedSkeleton() {
  return (
    <>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonTitleShort} />

      <View style={styles.skeletonMetaRow}>
        <View style={styles.skeletonMeta} />
        <View style={styles.skeletonMetaSmall} />
      </View>

      <View style={styles.skeletonParagraphLong} />
      <View style={styles.skeletonParagraph} />
      <View style={styles.skeletonParagraphShort} />

      {Array.from({ length: 3 }).map((_, index) => (
        <View key={`learning-skeleton-${index}`} style={styles.skeletonSection}>
          <View style={styles.skeletonSectionHeading} />
          <View style={styles.skeletonParagraphLong} />
          <View style={styles.skeletonParagraph} />
          <View style={styles.skeletonParagraphShort} />
        </View>
      ))}

      <TabBarSpacer />
    </>
  );
}

function LearningFeedErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <NoElection width={96} height={96} />
      <AppText style={styles.emptyTitle}>Could not load article</AppText>
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
    paddingTop: 24,
    gap: 14,
  },

  iconWrap: {
    alignSelf: "flex-start",
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  category: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },

  readTime: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  summary: {
    fontSize: 15,
    lineHeight: 24,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  sectionsWrap: {
    gap: 20,
    paddingTop: 8,
  },

  sectionBlock: {
    gap: 9,
  },

  sectionHeading: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  body: {
    fontSize: 16,
    lineHeight: 26,
    color: Theme.colors.text,
  },

  emptyWrap: {
    minHeight: 420,
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

  skeletonIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: skeletonColor,
  },

  skeletonTitle: {
    width: "88%",
    height: 30,
    borderRadius: 999,
    backgroundColor: skeletonStrong,
  },

  skeletonTitleShort: {
    width: "58%",
    height: 30,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  skeletonMeta: {
    width: 76,
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonMetaSmall: {
    width: 86,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(25,183,176,0.14)",
  },

  skeletonParagraphLong: {
    width: "100%",
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonParagraph: {
    width: "88%",
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonParagraphShort: {
    width: "64%",
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonSection: {
    gap: 10,
    paddingTop: 8,
  },

  skeletonSectionHeading: {
    width: "62%",
    height: 20,
    borderRadius: 999,
    backgroundColor: skeletonStrong,
  },
});