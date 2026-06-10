import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
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
import { Theme } from "@/theme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type UserType = "observer" | "volunteer" | "public-viewer";
type HelpScopeKey = "general" | "observer" | "volunteer";

type HelpFaqItem = {
  id: string;
  question: string;
  answer: string;
  videoTitle: string;
  thumbnailUrl: string;
  videoUrl: string;
};

// Placeholder — replace individual videoUrl values with actual hosted MP4/HLS links.
// Tapping a video thumbnail opens the Citizen Monitors YouTube channel.
const FAQ_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@CitizenMonitors";

const GENERAL_FAQS: HelpFaqItem[] = [
  {
    id: "general-password",
    question: "How can I change my password?",
    answer:
      "To change your Citizen Monitor password, go to the Me tab, open Security, enter your current password, set a new password, confirm it, and save changes. Use a strong password you do not reuse elsewhere.",
    videoTitle: "How to change your password",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
  {
    id: "general-profile",
    question: "How can I update my profile?",
    answer:
      "Open the Me tab, tap Personal Profile, edit the available fields, then save changes. Your updated details will reflect across your profile and supported app sections.",
    videoTitle: "How to update your profile",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
  {
    id: "general-notifications",
    question: "How can I manage notifications?",
    answer:
      "Open the Me tab and select Notification Settings. You can turn on or off election alerts, polling unit activity, report updates, discussion replies, newsletters, and security alerts.",
    videoTitle: "Managing notification settings",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
  {
    id: "general-anonymous",
    question: "How do I stay anonymous?",
    answer:
      "Citizen Monitor supports anonymous public participation where available. You can generate a public anonymous name from your profile and use it for sensitive discussions or posts when the screen supports anonymous display.",
    videoTitle: "Privacy and anonymous participation",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
];

const OBSERVER_FAQS: HelpFaqItem[] = [
  {
    id: "observer-identity",
    question: "Will my identity be revealed if I submit a report?",
    answer:
      "No. Your identity is protected in public-facing areas. Internally, Citizen Monitor may retain required account and verification details for accountability, audit, and platform safety.",
    videoTitle: "Observer privacy and secure reporting",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
  {
    id: "observer-upload",
    question: "My report is not uploading. What should I do?",
    answer:
      "Check your connection and media permissions first. If you are offline, supported reports can remain staged locally and sync later when the connection returns. Keep the app open long enough for uploads to complete when back online.",
    videoTitle: "Fixing report upload issues",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
  {
    id: "observer-issues",
    question: "What type of issues can I report?",
    answer:
      "You can report incidents such as violence, intimidation, ballot stuffing, missing materials, result-sheet irregularities, delayed opening, vote buying, and other election-day concerns supported by evidence.",
    videoTitle: "Types of observer reports",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
  {
    id: "observer-rejected",
    question: "Why was my report rejected?",
    answer:
      "A report may be rejected if the evidence is incomplete, unclear, inconsistent with the description, outside the election context, or does not meet verification standards. Review the issue, correct it where possible, and submit again.",
    videoTitle: "Why a report may be rejected",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
];

const VOLUNTEER_FAQS: HelpFaqItem[] = [
  {
    id: "volunteer-responsibility",
    question: "What are my responsibilities as a volunteer?",
    answer:
      "Volunteers support election transparency by reviewing information, adding context, participating in discussions, and helping surface credible election activity for wider visibility.",
    videoTitle: "Volunteer responsibilities explained",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
  {
    id: "volunteer-upgrade",
    question: "How do I become an observer?",
    answer:
      "Go to the Me tab and use the Observer Registration or Upgrade User Type option. You may be asked to provide your phone number and upload PVC verification images before your observer access is reviewed.",
    videoTitle: "How to upgrade to observer",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
  {
    id: "volunteer-mistake",
    question: "What happens if I approve a false report by mistake?",
    answer:
      "The platform supports layered review. Other users, moderators, or admins can still flag or correct suspicious activity. Always review evidence carefully before taking action.",
    videoTitle: "Correcting review mistakes",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
  {
    id: "volunteer-public",
    question: "Will my identity be public as a volunteer?",
    answer:
      "Volunteer identity is not public by default. Citizen Monitor only uses necessary internal account details for trust, workflow integrity, and platform safety.",
    videoTitle: "Volunteer privacy and visibility",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
    videoUrl: FAQ_VIDEO_URL,
  },
];

function normalizeRole(role?: string | null): UserType {
  if (role === "observer") return "observer";
  if (role === "public-viewer") return "public-viewer";
  return "volunteer";
}

function getFaqsForTab(tab: HelpScopeKey): HelpFaqItem[] {
  if (tab === "observer") return OBSERVER_FAQS;
  if (tab === "volunteer") return VOLUNTEER_FAQS;

  return GENERAL_FAQS;
}

function getAvailableTabs(role: UserType): HelpScopeKey[] {
  if (role === "observer") return ["general", "observer"];
  if (role === "volunteer") return ["general", "volunteer"];

  return ["general"];
}

function getDefaultTab(role: UserType): HelpScopeKey {
  if (role === "observer") return "observer";
  if (role === "volunteer") return "volunteer";

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
  const [expandedId, setExpandedId] = useState<string | null>(
    getFaqsForTab(defaultTab)[0]?.id ?? null
  );

  // Only reset the active tab when it's no longer available (e.g. role changed).
  // Do NOT force back to defaultTab when user intentionally switches to "general".
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      const nextTab = defaultTab;
      setActiveTab(nextTab);
      setExpandedId(getFaqsForTab(nextTab)[0]?.id ?? null);
    }
  }, [activeTab, availableTabs, defaultTab]);

  const faqs = useMemo(() => getFaqsForTab(activeTab), [activeTab]);

  const handleSwitchTab = (tab: HelpScopeKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    setExpandedId(getFaqsForTab(tab)[0]?.id ?? null);
  };

  const handleToggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
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

          {availableTabs.includes("volunteer") ? (
            <ScopeTab
              title="VOLUNTEER FAQ"
              active={activeTab === "volunteer"}
              onPress={() => handleSwitchTab("volunteer")}
            />
          ) : null}
        </View>

        <AppText style={styles.helperText}>
          Here are quick guides to help you use Citizen Monitor better.
        </AppText>

        <View style={styles.faqList}>
          {faqs.map((item) => (
            <FaqAccordionCard
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => handleToggleFaq(item.id)}
              onOpenVideo={() => void Linking.openURL(YOUTUBE_CHANNEL_URL)}
            />
          ))}
        </View>

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
  onOpenVideo,
}: {
  item: HelpFaqItem;
  expanded: boolean;
  onToggle: () => void;
  onOpenVideo: () => void; // opens YouTube channel
}) {
  const rotate = useRef(new Animated.Value(expanded ? 1 : 0)).current;

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

          <Pressable style={styles.videoCard} onPress={onOpenVideo}>
            <Image
              source={{ uri: item.thumbnailUrl }}
              style={styles.videoThumbnail}
            />

            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={26} color="#F15A24" />
              </View>
            </View>

            <AppText style={styles.videoCaption}>{item.videoTitle}</AppText>
          </Pressable>
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
    paddingBottom: 14,
    gap: 12,
  },

  accordionAnswer: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },

  videoCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7EE",
  },

  videoThumbnail: {
    width: "100%",
    height: 184,
    backgroundColor: "#EAECEF",
  },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  playButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },

  videoCaption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    lineHeight: 18,
    color: "#5D665F",
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