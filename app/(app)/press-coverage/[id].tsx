import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, View } from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import { getPressCoverageById } from "@/data/pressCoverage";
import { Theme } from "@/theme";

export default function PressCoverageDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const article = params.id ? getPressCoverageById(params.id) : undefined;

  if (!article) {
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

            <AppText style={styles.missingTitle}>Statement not found</AppText>
            <AppText style={styles.missingSubtitle}>
              This press release may have been removed or is no longer available.
            </AppText>
          </View>
        </View>
      </AppGradientScreen>
    );
  }

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

        <View style={styles.headerBlock}>
          <AppText style={styles.title}>{article.title}</AppText>

          <View style={styles.metaRow}>
            <View style={styles.dot} />
            <AppText style={styles.dateText}>{article.date}</AppText>
          </View>
        </View>

        <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />

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
      </ScrollView>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 30,
  },

  topBar: {
    paddingBottom: 8,
    alignItems: "flex-start",
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