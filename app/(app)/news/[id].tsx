import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { getNewsById } from "@/data/news";
import { Theme } from "@/theme";

export default function NewsDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const article = params.id ? getNewsById(params.id) : undefined;

  if (!article) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.missingWrap}>
          <BackButton label="" />
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
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        bounces
      >
        <View style={styles.topBar}>
          <BackButton label="" />
        </View>

        <View style={styles.headerBlock}>
          <AppText style={styles.title}>{article.title}</AppText>

          <View style={styles.metaRow}>
            <View
              style={[styles.sourceBadge, { backgroundColor: article.badgeBg }]}
            >
              <AppText style={styles.sourceBadgeText}>{article.badgeText}</AppText>
            </View>

            <AppText style={styles.sourceText}>{article.source}</AppText>

            <View style={styles.dot} />

            <AppText style={styles.dateText}>{article.date}</AppText>
          </View>
        </View>

        <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />

        <View style={styles.articleMetaCard}>
          <View style={styles.metaPill}>
            <Ionicons
              name="person-outline"
              size={14}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaPillText}>
              {article.author ?? "News Desk"}
            </AppText>
          </View>

          <View style={styles.metaPill}>
            <Ionicons
              name="time-outline"
              size={14}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaPillText}>{article.readTime}</AppText>
          </View>

          <View style={styles.metaPill}>
            <Ionicons
              name="pricetag-outline"
              size={14}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.metaPillText}>{article.category}</AppText>
          </View>
        </View>

        <View style={styles.bodyWrap}>
          {article.excerpt ? (
            <AppText style={styles.excerpt}>{article.excerpt}</AppText>
          ) : null}

          {article.content.map((paragraph, index) => (
            <AppText key={`${article.id}-p-${index}`} style={styles.paragraph}>
              {paragraph}
            </AppText>
          ))}
        </View>

        <View style={styles.actionsCard}>
          <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Ionicons name="heart-outline" size={18} color={Theme.colors.text} />
            <AppText style={styles.actionText}>{article.likes} Likes</AppText>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={Theme.colors.text}
            />
            <AppText style={styles.actionText}>{article.comments} Comments</AppText>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Ionicons
              name="share-social-outline"
              size={18}
              color={Theme.colors.text}
            />
            <AppText style={styles.actionText}>Share</AppText>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
            <Ionicons
              name="bookmark-outline"
              size={18}
              color={Theme.colors.text}
            />
            <AppText style={styles.actionText}>Save</AppText>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="globe-outline"
              size={16}
              color={Theme.colors.primary}
            />
            <AppText style={styles.infoLabel}>Source publication</AppText>
          </View>

          <AppText style={styles.infoValue}>{article.source}</AppText>
          <AppText style={styles.infoHint}>
            Aggregated news preview for citizens. Full-source linking can be wired later.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F5F1",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 28,
  },

  topBar: {
    paddingBottom: 6,
    alignItems: "flex-start",
  },

  headerBlock: {
    gap: 10,
    paddingBottom: 16,
  },

  title: {
    fontSize: 34,
    lineHeight: 36,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  sourceBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  sourceBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.bold,
  },

  sourceText: {
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary,
  },

  dateText: {
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  heroImage: {
    width: "100%",
    height: 230,
    borderRadius: 0,
    backgroundColor: "#EAECEF",
    marginBottom: 16,
  },

  articleMetaCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },

  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(17, 26, 50, 0.06)",
  },

  metaPillText: {
    fontSize: 12.5,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  bodyWrap: {
    gap: 16,
  },

  excerpt: {
    fontSize: 19,
    lineHeight: 31,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  paragraph: {
    fontSize: 17,
    lineHeight: 30,
    color: "rgba(17,26,50,0.78)",
    fontFamily: Theme.fonts.body.regular,
  },

  actionsCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 24,
    marginBottom: 16,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(17, 26, 50, 0.07)",
  },

  actionText: {
    fontSize: 13.5,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  pressed: {
    opacity: 0.86,
  },

  infoCard: {
    marginTop: 4,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(17, 26, 50, 0.06)",
    gap: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  infoLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  infoValue: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  infoHint: {
    fontSize: 13,
    lineHeight: 20,
    color: Theme.colors.textMuted,
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
});