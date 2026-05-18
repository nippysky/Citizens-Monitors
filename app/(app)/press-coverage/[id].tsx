import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import {
  formatPressCoverageDate,
  htmlToParagraphs,
} from "@/data/pressCoverage";
import { usePressCoverageDetailQuery } from "@/hooks/api/usePressCoverageQueries";
import { Theme } from "@/theme";

function PressCoverageDetailsSkeleton() {
  return (
    <AppGradientScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        bounces
      >
        <View style={styles.topBar}>
          <BackButton />
        </View>

        <View style={styles.skeletonHeaderBlock}>
          <View style={styles.skeletonTitleLong} />
          <View style={styles.skeletonTitleMedium} />
          <View style={styles.skeletonMeta} />
        </View>

        <View style={styles.skeletonHero} />

        <View style={styles.skeletonBody}>
          <View style={styles.skeletonParagraphLong} />
          <View style={styles.skeletonParagraphLong} />
          <View style={styles.skeletonParagraphShort} />
          <View style={styles.skeletonParagraphLong} />
          <View style={styles.skeletonParagraphMedium} />
        </View>
      </ScrollView>
    </AppGradientScreen>
  );
}

function MissingState({
  title,
  subtitle,
  onRetry,
}: {
  title: string;
  subtitle: string;
  onRetry?: () => void;
}) {
  return (
    <AppGradientScreen>
      <View style={styles.missingWrap}>
        <BackButton />
        <View style={styles.missingContent}>
          <View style={styles.missingIconWrap}>
            <Ionicons
              name="megaphone-outline"
              size={28}
              color={Theme.colors.primary}
            />
          </View>

          <AppText style={styles.missingTitle}>{title}</AppText>
          <AppText style={styles.missingSubtitle}>{subtitle}</AppText>

          {onRetry ? (
            <Pressable onPress={onRetry} style={styles.retryBtn}>
              <AppText style={styles.retryText}>Retry</AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </AppGradientScreen>
  );
}

export default function PressCoverageDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const slug = typeof params.id === "string" ? params.id : "";

  const articleQuery = usePressCoverageDetailQuery(slug);

  const article = articleQuery.data;
  const date = formatPressCoverageDate(article?.publishedAt);
  const paragraphs = htmlToParagraphs(article?.content);
  const imageUrl = article?.heroImageURL || article?.thumbnailURL || "";

  const handleShare = async () => {
    if (!article) return;

    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.excerpt}`,
      });
    } catch {
      // Native share can be cancelled by the user; no noisy error needed.
    }
  };

  if (articleQuery.isLoading) {
    return <PressCoverageDetailsSkeleton />;
  }

  if (articleQuery.isError) {
    return (
      <MissingState
        title="Unable to load statement"
        subtitle="Check your connection and try again."
        onRetry={() => {
          void articleQuery.refetch();
        }}
      />
    );
  }

  if (!article) {
    return (
      <MissingState
        title="Statement not found"
        subtitle="This press release may have been removed or is no longer available."
      />
    );
  }

  return (
    <AppGradientScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        bounces
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
        <View style={styles.topBar}>
          <BackButton />

          <Pressable
            onPress={handleShare}
            hitSlop={10}
            style={({ pressed }) => [
              styles.shareBtn,
              pressed && styles.shareBtnPressed,
            ]}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={Theme.colors.primary}
            />
          </Pressable>
        </View>

        <View style={styles.headerBlock}>
          <AppText style={styles.title}>{article.title}</AppText>

          <View style={styles.metaRow}>
            <View style={styles.dot} />
            <AppText style={styles.dateText}>{date}</AppText>
          </View>
        </View>

        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroFallback}>
            <Ionicons
              name="megaphone-outline"
              size={34}
              color={Theme.colors.textMuted}
            />
          </View>
        )}

        <View style={styles.bodyWrap}>
          {article.excerpt ? (
            <AppText style={styles.excerpt}>{article.excerpt}</AppText>
          ) : null}

          {paragraphs.map((paragraph, index) => (
            <AppText key={`${article.id}-p-${index}`} style={styles.paragraph}>
              {paragraph}
            </AppText>
          ))}

          {articleQuery.isRefetching ? (
            <View style={styles.inlineRefresh}>
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </AppGradientScreen>
  );
}

const skeletonColor = "rgba(17, 26, 50, 0.08)";
const skeletonColorSoft = "rgba(17, 26, 50, 0.05)";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 30,
  },

  topBar: {
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },

  shareBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 163, 156, 0.08)",
  },

  shareBtnPressed: {
    opacity: 0.75,
  },

  headerBlock: {
    gap: 10,
    paddingBottom: 14,
  },

  title: {
    fontSize: 28,
    lineHeight: 32,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },

  dateText: {
    fontSize: 13,
    lineHeight: 17,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  heroImage: {
    width: "100%",
    height: 210,
    backgroundColor: "#EAECEF",
    marginBottom: 18,
  },

  heroFallback: {
    width: "100%",
    height: 210,
    backgroundColor: "#EAECEF",
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  bodyWrap: {
    gap: 18,
  },

  excerpt: {
    fontSize: 17,
    lineHeight: 30,
    color: "rgba(17,26,50,0.78)",
    fontFamily: Theme.fonts.body.regular,
  },

  paragraph: {
    fontSize: 17,
    lineHeight: 30,
    color: "rgba(17,26,50,0.78)",
    fontFamily: Theme.fonts.body.regular,
  },

  inlineRefresh: {
    paddingVertical: 10,
    alignItems: "center",
  },

  missingWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  missingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 20,
  },

  missingIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 163, 156, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(5, 163, 156, 0.14)",
  },

  missingTitle: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
  },

  missingSubtitle: {
    maxWidth: 280,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    color: Theme.colors.textMuted,
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

  skeletonHeaderBlock: {
    gap: 10,
    paddingTop: 8,
    paddingBottom: 14,
  },

  skeletonTitleLong: {
    width: "95%",
    height: 28,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonTitleMedium: {
    width: "72%",
    height: 28,
    borderRadius: 999,
    backgroundColor: skeletonColorSoft,
  },

  skeletonMeta: {
    width: 110,
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(5, 163, 156, 0.14)",
  },

  skeletonHero: {
    width: "100%",
    height: 210,
    backgroundColor: skeletonColor,
    marginBottom: 18,
  },

  skeletonBody: {
    gap: 14,
  },

  skeletonParagraphLong: {
    width: "100%",
    height: 18,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonParagraphMedium: {
    width: "76%",
    height: 18,
    borderRadius: 999,
    backgroundColor: skeletonColorSoft,
  },

  skeletonParagraphShort: {
    width: "58%",
    height: 18,
    borderRadius: 999,
    backgroundColor: skeletonColorSoft,
  },
});