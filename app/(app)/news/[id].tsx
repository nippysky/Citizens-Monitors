import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import { buildNewsShareUrl } from "@/constants/links";
import { useAppToast } from "@/hooks/useAppToast";
import { useNewsInsightQuery } from "@/hooks/api/useNewsQueries";
import { Theme } from "@/theme";

export default function NewsDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string; slug?: string }>();
  const slug = normalizeRouteParam(params.slug) ?? normalizeRouteParam(params.id);

  const insets = useSafeAreaInsets();
  const { showToast } = useAppToast();

  const articleQuery = useNewsInsightQuery(slug);
  const article = articleQuery.data;

  const scrollContentStyle = [
    styles.content,
    {
      paddingBottom: Math.max(insets.bottom + 96, 128),
    },
  ];

  const handleShare = async () => {
    if (!article) return;

    const articleSlug = slug ?? article.slug ?? article.id;
    // https link — custom schemes (citizenmonitors://) are NOT clickable in
    // WhatsApp/SMS. This opens the app directly via Universal/App Links once
    // the domain hosts the well-known association files.
    const shareUrl = buildNewsShareUrl(articleSlug);

    try {
      await Share.share({
        title: article.title,
        // url is used on iOS (appears as a link attachment in the share sheet).
        // message is used on Android — include the link inline so it's tappable.
        url: shareUrl,
        message: [
          article.title,
          "",
          article.excerpt,
          "",
          shareUrl,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } catch {
      showToast({
        type: "error",
        message: "Unable to share this article right now.",
      });
    }
  };

  if (articleQuery.isLoading && !article) {
    return (
      <AppGradientScreen scroll={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollContentStyle}
        >
          <View style={styles.topBar}>
            <BackButton label="" />
          </View>

          <NewsDetailsSkeleton />
        </ScrollView>
      </AppGradientScreen>
    );
  }

  if (articleQuery.isError || !article) {
    return (
      <AppGradientScreen scroll={false}>
        <View
          style={[
            styles.missingWrap,
            {
              paddingBottom: Math.max(insets.bottom + 24, 40),
            },
          ]}
        >
          <View style={styles.topBar}>
            <BackButton label="" />
          </View>

          <View style={styles.missingContent}>
            <View style={styles.missingIconWrap}>
              <Ionicons
                name="newspaper-outline"
                size={28}
                color={Theme.colors.primary}
              />
            </View>

            <AppText style={styles.missingTitle}>Article not found</AppText>
            <AppText style={styles.missingSubtitle}>
              This news story may have been removed or is no longer available.
            </AppText>

            <Pressable
              onPress={() => {
                void articleQuery.refetch();
              }}
              style={styles.retryButton}
            >
              <AppText style={styles.retryText}>Retry</AppText>
            </Pressable>
          </View>
        </View>
      </AppGradientScreen>
    );
  }

  const paragraphs = htmlToParagraphs(article.content);
  const heroImage = article.heroImageUrl ?? article.thumbnailUrl;

  return (
    <AppGradientScreen scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={scrollContentStyle}
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
          <BackButton label="" />

          <Pressable onPress={handleShare} style={styles.shareButton} hitSlop={8}>
            <Ionicons
              name="share-social-outline"
              size={20}
              color={Theme.colors.primary}
            />
          </Pressable>
        </View>

        <View style={styles.headerBlock}>
          <AppText style={styles.title}>{article.title}</AppText>

          <View style={styles.dateRow}>
            <View style={styles.dot} />
            <AppText style={styles.dateText}>
              {formatNewsDate(article.publishedAt)}
            </AppText>
          </View>
        </View>

        {heroImage ? (
          <Image source={{ uri: heroImage }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroFallback]}>
            <Ionicons
              name="newspaper-outline"
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
            <AppText
              key={`${article.id}-p-${index}`}
              style={styles.paragraph}
            >
              {paragraph}
            </AppText>
          ))}
        </View>
      </ScrollView>
    </AppGradientScreen>
  );
}

function normalizeRouteParam(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];

  const trimmed = value?.trim();
  return trimmed || undefined;
}

function formatNewsDate(value?: string): string {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function htmlToParagraphs(html?: string): string[] {
  if (!html) return [];

  const normalized = html
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ");

  const plain = decodeHtmlEntities(normalized.replace(/<[^>]*>/g, ""));

  return plain
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function NewsDetailsSkeleton() {
  return (
    <>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonTitleShort} />

      <View style={styles.skeletonDateRow}>
        <View style={styles.skeletonDot} />
        <View style={styles.skeletonDate} />
      </View>

      <View style={styles.skeletonHero} />

      <View style={styles.skeletonBodyWrap}>
        <View style={styles.skeletonParagraphLong} />
        <View style={styles.skeletonParagraph} />
        <View style={styles.skeletonParagraphShort} />

        <View style={styles.skeletonParagraphLong} />
        <View style={styles.skeletonParagraph} />
        <View style={styles.skeletonParagraphShort} />

        <View style={styles.skeletonParagraphLong} />
        <View style={styles.skeletonParagraph} />
      </View>
    </>
  );
}

const skeletonColor = "rgba(17, 26, 50, 0.08)";
const skeletonStrong = "rgba(17, 26, 50, 0.13)";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },

  topBar: {
    minHeight: 40,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  shareButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 163, 156, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(5, 163, 156, 0.14)",
  },

  headerBlock: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },

  title: {
    fontSize: 28,
    lineHeight: 32,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  dateRow: {
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
    fontSize: 16,
    lineHeight: 20,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  heroImage: {
    width: "100%",
    height: 246,
    backgroundColor: "#E8EBEF",
    marginBottom: 18,
  },

  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  bodyWrap: {
    gap: 14,
  },

  excerpt: {
    fontSize: 17,
    lineHeight: 30,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  paragraph: {
    fontSize: 17,
    lineHeight: 30,
    color: "rgba(17,26,50,0.74)",
    fontFamily: Theme.fonts.body.regular,
  },

  missingWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
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

  skeletonTitle: {
    width: "92%",
    height: 30,
    borderRadius: 999,
    backgroundColor: skeletonStrong,
    marginTop: 12,
  },

  skeletonTitleShort: {
    width: "64%",
    height: 30,
    borderRadius: 999,
    backgroundColor: skeletonColor,
    marginTop: 8,
  },

  skeletonDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    marginBottom: 16,
  },

  skeletonDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(25,183,176,0.25)",
  },

  skeletonDate: {
    width: 92,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(25,183,176,0.14)",
  },

  skeletonHero: {
    width: "100%",
    height: 246,
    backgroundColor: skeletonColor,
    marginBottom: 18,
  },

  skeletonBodyWrap: {
    gap: 14,
  },

  skeletonParagraphLong: {
    width: "100%",
    height: 16,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonParagraph: {
    width: "88%",
    height: 16,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },

  skeletonParagraphShort: {
    width: "62%",
    height: 16,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
});