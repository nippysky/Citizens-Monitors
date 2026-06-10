// ─── src/components/pulse/PulseWelcomeCard.tsx ────────────────────────────────
// Default intro article pinned at the top of the Pulse feed for every user.
// Written by Ade Haastrup (Co-founder, Citizen Monitors).
// ─────────────────────────────────────────────────────────────────────────────

import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

const WELCOME_IMAGE = require("../../../assets/images/pulse-welcome.png");

const ARTICLE_BODY = `Hi, my name is Ade. I built Pulse for you. Not for politicians, not for parties — for you: the ordinary Nigerian who is tired of being lied to, manipulated, and left in the dark every election cycle.

Pulse is a civic space inside Citizen Monitors where you can share what you see, read what others are witnessing, and together build a real-time picture of what is actually happening across Nigeria — ward by ward, polling unit by polling unit.

This is not Twitter. This is not WhatsApp. This is something different. Every post on Pulse is anchored to a real Nigerian community. When you speak here, you speak as a citizen — and your words carry weight.

Here is what Pulse is for:
• Share what you observe at your polling unit during elections — calmly, factually, and clearly.
• Read updates from citizens in other wards across your state and Nigeria.
• Like, comment, and engage — because democratic accountability is a conversation, not a broadcast.
• Post anonymously if you need to — your safety matters.

Here is what Pulse is NOT for: hate speech, misinformation, party propaganda, or incitement. The Electoral Act applies here. Respect it.

We built Citizen Monitors because we believe that when ordinary Nigerians are organised, informed, and empowered — no election can be stolen in silence.

Pulse is your voice. Use it well.`;

export default function PulseWelcomeCard() {
  return (
    <View style={styles.card}>
      {/* ── Author row ── */}
      <View style={styles.authorRow}>
        <View style={styles.avatarWrap}>
          <Ionicons name="person" size={18} color={Theme.colors.primary} />
        </View>

        <View style={styles.authorInfo}>
          <AppText style={styles.authorName}>Ade Haastrup</AppText>
          <AppText style={styles.authorRole}>Co-founder · Citizen Monitors</AppText>
        </View>

        <View style={styles.pinnedBadge}>
          <Ionicons name="pin" size={11} color={Theme.colors.primary} />
          <AppText style={styles.pinnedText}>PINNED</AppText>
        </View>
      </View>

      {/* ── Hero image ── */}
      <Image
        source={WELCOME_IMAGE}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* ── Article body ── */}
      <AppText style={styles.body}>{ARTICLE_BODY}</AppText>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <View style={styles.footerTag}>
          <Ionicons name="megaphone-outline" size={13} color={Theme.colors.primary} />
          <AppText style={styles.footerTagText}>From the Team</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.18)",
    overflow: "hidden",
    gap: 0,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(5,163,156,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  authorInfo: {
    flex: 1,
    gap: 2,
  },

  authorName: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  authorRole: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(5,163,156,0.10)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.20)",
  },

  pinnedText: {
    fontSize: 10,
    lineHeight: 13,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
    letterSpacing: 0.4,
  },

  heroImage: {
    width: "100%",
    height: 200,
  },

  body: {
    fontSize: 14,
    lineHeight: 23,
    color: Theme.colors.text,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  footerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(5,163,156,0.08)",
  },

  footerTagText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});
