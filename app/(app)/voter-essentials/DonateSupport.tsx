/**
 * Donate & Support — Coming Soon
 *
 * Stripe payment integration is being set up. Once the backend PaymentIntent
 * endpoint is ready and a compatible @stripe/stripe-react-native version is
 * confirmed, this screen will be fully activated.
 *
 * FUTURE INTEGRATION CHECKLIST:
 *  1. Confirm @stripe/stripe-react-native version has a compiled expo-plugin
 *     (check that package.json contains an "expo-plugin" field pointing to .js)
 *  2. Run: npx expo install @stripe/stripe-react-native
 *  3. Add to app.json plugins:
 *       ["@stripe/stripe-react-native", {
 *         "merchantIdentifier": "merchant.com.citizenmonitors",
 *         "enableGooglePay": true
 *       }]
 *  4. Register "merchant.com.citizenmonitors" in Apple Developer > Merchant IDs
 *  5. Add StripeProvider back to app/_layout.tsx with the publishable key
 *  6. Set STRIPE_PAYMENT_INTENT_URL to the backend endpoint
 *     Expected: POST → { amountKobo, donorName, donorEmail? }
 *     Returns:  { clientSecret: string }
 *
 * SECURITY: The Stripe SECRET key must NEVER go in this file or anywhere in
 * the app. Only the publishable key belongs client-side.
 *
 * Publishable key (safe to store here for when integration is ready):
 * pk_live_51R5Nea2LVd91FGoGUpCT2wnhGNxdtQrODu79C8PhztbAurwGVP4YyJw0Xv7LftQbBCujC9TAdkzVy4vb1JriAYZK00oj7P4I0d
 */

import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import BackButton from "@/components/ui/BackButton";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

// ─── Impact items ──────────────────────────────────────────────────────────────

const DONATION_IMPACT = [
  { icon: "server-outline" as const, text: "Keeps the results server live for half a day" },
  { icon: "location-outline" as const, text: "Powers PU location data for 100 monitors" },
  { icon: "document-text-outline" as const, text: "Processes 200 citizen-submitted reports" },
  { icon: "shield-checkmark-outline" as const, text: "Funds field verification for 50 observers" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DonateSupportScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AppGradientScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 32, 48) },
        ]}
      >
        {/* Top bar */}
        <View style={styles.topRow}>
          <BackButton />
        </View>

        {/* Header */}
        <View style={styles.headerBlock}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="heart" size={22} color="#FFFFFF" />
          </View>
          <AppText style={styles.title}>Donate & Support</AppText>
          <AppText style={styles.subtitle}>
            Citizen Monitors is free — and always will be. We rely entirely on
            citizens like you to keep Nigeria's election monitoring transparent
            and independent.
          </AppText>
        </View>

        {/* Coming Soon card */}
        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonIconWrap}>
            <Ionicons name="construct-outline" size={28} color={Theme.colors.primary} />
          </View>
          <AppText style={styles.comingSoonTitle}>Payments Coming Soon</AppText>
          <AppText style={styles.comingSoonBody}>
            We're setting up secure Stripe payments so you can support the mission
            directly from the app. This will be live shortly — thank you for your patience.
          </AppText>
        </View>

        {/* Stripe badge */}
        <View style={styles.stripeBadge}>
          <Ionicons name="lock-closed" size={13} color={Theme.colors.textMuted} />
          <AppText style={styles.stripeBadgeText}>
            Payments will be secured by{" "}
            <AppText style={styles.stripeWord}>Stripe</AppText>
          </AppText>
        </View>

        {/* Impact block */}
        <View style={styles.impactCard}>
          <AppText style={styles.impactTitle}>Your donation will help us:</AppText>

          <View style={styles.impactList}>
            {DONATION_IMPACT.map((item) => (
              <View key={item.text} style={styles.impactRow}>
                <View style={styles.impactIconWrap}>
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={Theme.colors.primary}
                  />
                </View>
                <AppText style={styles.impactText}>{item.text}</AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </AppGradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 20,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBlock: {
    gap: 10,
    alignItems: "flex-start",
  },

  headerIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },

  comingSoonCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(5,163,156,0.20)",
    backgroundColor: "rgba(5,163,156,0.05)",
    padding: 24,
    alignItems: "center",
    gap: 12,
  },

  comingSoonIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "rgba(5,163,156,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  comingSoonTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  comingSoonBody: {
    fontSize: 14,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  stripeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: -8,
  },

  stripeBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  stripeWord: {
    color: "#635BFF",
    fontFamily: Theme.fonts.body.semibold,
  },

  impactCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.16)",
    backgroundColor: "rgba(5,163,156,0.04)",
    padding: 16,
    gap: 12,
  },

  impactTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  impactList: {
    gap: 10,
  },

  impactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  impactIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(5,163,156,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  impactText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Theme.colors.text,
  },
});
