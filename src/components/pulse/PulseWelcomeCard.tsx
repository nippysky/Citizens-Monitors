// ─── src/components/pulse/PulseWelcomeCard.tsx ────────────────────────────────
// Default intro article pinned at the top of the Pulse feed for every user.
// Written by Ade Haastrup (Co-founder, Citizen Monitors).
// ─────────────────────────────────────────────────────────────────────────────

import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

const WELCOME_IMAGE = require("../../../assets/images/pulse-welcome.png");

const ARTICLE_BODY = `Welcome to Pulse. Your ward has been waiting for this.

For too long, information about elections, voting, and civic activity in your community has been scattered, noisy, or simply missing. Pulse changes that.

This is your real-time feed — a living conversation between citizens, observers, and volunteers in your ward. Every post here comes from someone physically present in your community: someone who saw what happened at the polling unit, who monitored the collation process, who wants the truth documented and shared.

Pulse is not social media. It is civic intelligence. Every discussion, every update, every report you see here is tied to a real election, a real location, and a real moment in Nigerian democratic history.

Here is how to use it:
• Post your observations from your ward or LGA — what you saw, heard, and verified.
• Like and engage with posts from other citizens near you.
• Join Live Discussions when an election is active in your area.
• Share updates to spread accurate information beyond the app.

Your voice matters. Your ward is watching. Let's get to work.

— Ade Haastrup, Co-founder, Citizen Monitors`;

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
