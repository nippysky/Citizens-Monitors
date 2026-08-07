import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from "react-native";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import { useToastContext } from "@/components/feedback/ToastProvider";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { useMyProfileQuery } from "@/hooks/api/useMyProfileQuery";
import { useGeneralFaqQuery, useObserverFaqQuery } from "@/hooks/api/useFaqQueries";
import { FaqItem } from "@/lib/api/faq.api";
import { Theme } from "@/theme";
import { useAnimatedValue } from "@/hooks/useAnimatedValue";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type UserType = "observer" | "volunteer" | "public-viewer";
type HelpScopeKey = "general" | "observer";

function normalizeRole(role?: string | null): UserType {
  if (role === "observer") return "observer";
  if (role === "public-viewer") return "public-viewer";
  return "volunteer";
}

function getAvailableTabs(role: UserType): HelpScopeKey[] {
  if (role === "observer") return ["general", "observer"];
  return ["general"];
}

function getDefaultTab(role: UserType): HelpScopeKey {
  if (role === "observer") return "observer";
  return "general";
}

export default function HelpSupportScreen() {
  const { profile } = useMyProfileQuery();

  const resolvedRole = useMemo<UserType>(
    () => normalizeRole(profile?.role),
    [profile?.role]
  );

  const availableTabs = useMemo(
    () => getAvailableTabs(resolvedRole),
    [resolvedRole]
  );

  const defaultTab = useMemo(
    () => getDefaultTab(resolvedRole),
    [resolvedRole]
  );

  const [activeTab, setActiveTab] = useState<HelpScopeKey>(defaultTab);
  // undefined = untouched (first item auto-expands); null = user collapsed all
  const [expandedId, setExpandedId] = useState<string | null | undefined>(
    undefined
  );

  const isObserver = resolvedRole === "observer";

  // Always fetch general FAQ; observer FAQ only when the user is an observer
  const generalQuery = useGeneralFaqQuery();
  const observerQuery = useObserverFaqQuery(isObserver);

  // Build item list for the active tab.
  //
  // GET /faq returns { categories: [{ category: "general", items }, { category: "observer", items }] }
  // → General tab: only items from the "general" category.
  //
  // GET /faq/observer returns a single FaqCategory: { category: "observer", items }
  // → Observer tab: items directly from that response.
  const faqs = useMemo<FaqItem[]>(() => {
    if (activeTab === "observer") {
      return observerQuery.data?.items ?? [];
    }
    const generalCategory = generalQuery.data?.categories?.find(
      (cat) => cat.category === "general"
    );
    return generalCategory?.items ?? [];
  }, [activeTab, generalQuery.data, observerQuery.data]);

  // Show a loading spinner when data is still being fetched for the active tab.
  // isPending covers both "query is disabled/no cache" and "actively fetching".
  const activeQuery = activeTab === "observer" ? observerQuery : generalQuery;
  const isLoading =
    activeQuery.isPending ||
    (activeQuery.isFetching && faqs.length === 0);
  const isError = !isLoading && activeQuery.isError;

  /*
   * The first FAQ is expanded by default. Derived rather than stored: no
   * effect, no extra render, and it stays correct when the list changes.
   * `null` means "user explicitly collapsed everything".
   */
  const effectiveExpandedId =
    expandedId === undefined ? faqs[0]?.id ?? null : expandedId;

  // Fall back to the default tab if the current one disappears after a role
  // change. Adjusted during render — no extra commit, no flash of an empty tab.
  if (!availableTabs.includes(activeTab)) {
    setActiveTab(defaultTab);
    setExpandedId(undefined);
  }

  const handleSwitchTab = (tab: HelpScopeKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    setExpandedId(null);
  };

  const handleToggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // Compare against the EFFECTIVE id: while state is still `undefined` the
    // first card is visually open, so tapping it must collapse it.
    setExpandedId(effectiveExpandedId === id ? null : id);
  };

  return (
    <AppGradientScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton />

        <View style={styles.headerBlock}>
          <AppText style={styles.screenTitle}>Help & Support</AppText>
          <AppText style={styles.screenSubtitle}>
            Get quick answers and guides based on your account type.
          </AppText>
        </View>

        <View style={styles.tabRow}>
          <ScopeTab
            title="GENERAL FAQ"
            active={activeTab === "general"}
            onPress={() => handleSwitchTab("general")}
          />

          {availableTabs.includes("observer") ? (
            <ScopeTab
              title="OBSERVER FAQ"
              active={activeTab === "observer"}
              onPress={() => handleSwitchTab("observer")}
            />
          ) : null}
        </View>

        <AppText style={styles.helperText}>
          Here are quick guides to help you use Citizen Monitor better.
        </AppText>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={Theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.errorWrap}>
            <Ionicons
              name="wifi-outline"
              size={28}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.errorText}>
              Unable to load FAQs. Check your connection.
            </AppText>
            <Pressable
              onPress={() => void activeQuery.refetch()}
              style={styles.retryBtn}
            >
              <AppText style={styles.retryBtnText}>Retry</AppText>
            </Pressable>
          </View>
        ) : faqs.length === 0 ? (
          <View style={styles.errorWrap}>
            <AppText style={styles.errorText}>No FAQs available yet.</AppText>
          </View>
        ) : (
          <View style={styles.faqList}>
            {faqs.map((item) => (
              <FaqAccordionCard
                key={item.id}
                item={item}
                expanded={effectiveExpandedId === item.id}
                onToggle={() => handleToggleFaq(item.id)}
              />
            ))}
          </View>
        )}

        <StillNeedHelpCard />
      </ScrollView>
    </AppGradientScreen>
  );
}

function ScopeTab({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.scopeTab, active && styles.scopeTabActive]}
    >
      <AppText
        style={[styles.scopeTabText, active && styles.scopeTabTextActive]}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

function FaqAccordionCard({
  item,
  expanded,
  onToggle,
}: {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const rotate = useAnimatedValue(expanded ? 1 : 0);

  useEffect(() => {
    Animated.timing(rotate, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [expanded, rotate]);

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.accordionCard}>
      <Pressable onPress={onToggle} style={styles.accordionHeader}>
        <AppText style={styles.accordionQuestion}>{item.question}</AppText>

        <Animated.View style={{ transform: [{ rotate: rotateDeg }] }}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={Theme.colors.textMuted}
          />
        </Animated.View>
      </Pressable>

      {expanded ? (
        <View style={styles.accordionBody}>
          <AppText style={styles.accordionAnswer}>{item.answer}</AppText>
        </View>
      ) : null}
    </View>
  );
}

function StillNeedHelpCard() {
  const { showToast } = useToastContext();

  const openResources = async () => {
    const url = "https://www.citizenmonitors.com/resources";

    try {
      await Linking.openURL(url);
    } catch {
      showToast({
        type: "error",
        message: "Unable to open resources page right now.",
      });
    }
  };

  const openMail = async () => {
    const email = "support@citizenmonitors.com";
    const url = `mailto:${email}?subject=${encodeURIComponent(
      "Citizen Monitors Support"
    )}`;

    try {
      await Linking.openURL(url);
    } catch {
      showToast({
        type: "error",
        message: "No mail app available on this device right now.",
      });
    }
  };

  return (
    <View style={styles.supportCard}>
      <View style={styles.supportIconWrap}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={22}
          color="#FFFFFF"
        />
      </View>

      <AppText style={styles.supportTitle}>Still Need Help?</AppText>
      <AppText style={styles.supportSubtitle}>
        Our dedicated support team is available to assist you.
      </AppText>

      <View style={styles.supportActionRow}>
        <Pressable style={styles.whatsappBtn} onPress={openResources}>
          <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
          <AppText style={styles.whatsappBtnText}>RESOURCES</AppText>
        </Pressable>

        <Pressable style={styles.emailBtn} onPress={openMail}>
          <Ionicons name="mail-outline" size={18} color="#5D665F" />
          <AppText style={styles.emailBtnText}>EMAIL SUPPORT</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 56,
    gap: 18,
  },

  headerBlock: {
    gap: 8,
    marginTop: 2,
  },

  screenTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  screenSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },

  tabRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  scopeTab: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.2,
    borderColor: Theme.colors.border,
  },

  scopeTabActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },

  scopeTabText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  scopeTabTextActive: {
    color: "#FFFFFF",
  },

  helperText: {
    marginTop: -10,
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },

  loadingWrap: {
    paddingVertical: 48,
    alignItems: "center",
  },

  errorWrap: {
    paddingVertical: 36,
    alignItems: "center",
    gap: 12,
  },

  errorText: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 260,
  },

  retryBtn: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },

  faqList: {
    gap: 12,
  },

  accordionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCE2EA",
    backgroundColor: "rgba(255,255,255,0.72)",
    overflow: "hidden",
  },

  accordionHeader: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  accordionQuestion: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  accordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 16,
  },

  accordionAnswer: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },

  supportCard: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    padding: 16,
    gap: 10,
  },

  supportIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.36)",
    alignItems: "center",
    justifyContent: "center",
  },

  supportTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.heading.bold,
  },

  supportSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.9)",
  },

  supportActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
    flexWrap: "wrap",
  },

  whatsappBtn: {
    flex: 1,
    minWidth: 140,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
  },

  whatsappBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },

  emailBtn: {
    flex: 1,
    minWidth: 140,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
  },

  emailBtnText: {
    color: "#5D665F",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
});
