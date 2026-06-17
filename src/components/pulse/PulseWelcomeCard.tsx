// ─── src/components/pulse/PulseWelcomeCard.tsx ────────────────────────────────
// Default intro article pinned at the top of the Pulse feed for every user.
// Written by Ade Haastrup (Co-founder, Citizen Monitors).
// ─────────────────────────────────────────────────────────────────────────────

import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

const WELCOME_IMAGE = require("../../../assets/images/pulse-welcome.png");

const ARTICLE_BODY = `Hi, my name is Ade. I built Pulse for you. Not for politicians. Not for institutions. For the person on your street who has been watching things fall apart and wondering if anyone else sees it too. They do. And now you have somewhere to find each other.

This is your ward, finally in one place. A community of real people, your neighbours, your streets, your shared frustrations, with somewhere useful to put it all.

Talk about the clinic with no drugs. The road that's been "under construction" since 2019. The extortion everyone experiences and nobody is officially reporting. The government announcement and what it actually means for your street. Governance isn't just elections; it's every broken thing in between.

And here's where it gets interesting. When enough people from your ward are saying the same thing, it stops being a complaint and becomes a pattern. A pattern becomes evidence. And evidence? Evidence travels; to the right desks, the right authorities, the right people who suddenly can't pretend they didn't know.

Your gist has power. Use it.

Post with your name or stay anonymous. Both work. Both matter.

The magic happens when your whole ward is here. So don't come alone - bring your neighbours, your friends, the person on your street who notices everything. Every voice added makes this harder to ignore.

Your ward has receipts. This is where you file them!`;

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
