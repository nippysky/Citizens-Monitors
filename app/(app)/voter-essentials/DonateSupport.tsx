// app/(app)/voter-essentials/DonateSupport.tsx
// Donate & Support — native amount picker + Stripe Checkout.
// The donor picks/enters a naira amount entirely in native UI. Tapping
// Donate asks our backend for a Stripe Checkout Session and opens it in the
// system browser sheet (Safari View Controller / Chrome Custom Tabs) — a
// native, dismissible overlay, not an embedded WebView living in the screen.
// Once it closes, we ask the backend what actually happened (paid or not)
// and show the right outcome. No Stripe key of any kind lives in this app.

import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppKeyboardAwareScrollView from "@/components/ui/AppKeyboardAwareScrollView";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { useToastContext } from "@/components/feedback/ToastProvider";
import {
  DONATION_MAX_AMOUNT,
  DONATION_MIN_AMOUNT,
  DONATION_PRESET_AMOUNTS,
} from "@/constants/donations";
import { useDonationCheckout } from "@/hooks/useDonationCheckout";
import { Theme } from "@/theme";

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function DonateSupportScreen() {
  const { showToast } = useToastContext();
  const { donate, isProcessing } = useDonationCheckout();

  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    DONATION_PRESET_AMOUNTS[1]
  );
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const amount = useMemo(() => {
    if (isCustomMode) {
      const parsed = Number(customAmount.replace(/[^0-9]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return selectedPreset ?? 0;
  }, [isCustomMode, customAmount, selectedPreset]);

  const isAmountValid =
    amount >= DONATION_MIN_AMOUNT && amount <= DONATION_MAX_AMOUNT;

  const handleSelectPreset = (value: number) => {
    setIsCustomMode(false);
    setSelectedPreset(value);
    setCustomAmount("");
  };

  const handleSelectCustom = () => {
    setIsCustomMode(true);
    setSelectedPreset(null);
  };

  const handleDonate = async () => {
    if (!isAmountValid || isProcessing) return;

    const outcome = await donate(amount);

    if (outcome.status === "success") {
      showToast({
        message: `Thank you for donating ${formatNaira(outcome.amount)}!`,
        type: "success",
      });
      setCustomAmount("");
      setIsCustomMode(false);
      setSelectedPreset(DONATION_PRESET_AMOUNTS[1]);
      return;
    }

    if (outcome.status === "pending") {
      showToast({
        message:
          "We couldn't confirm this payment yet. If it went through, it'll be reflected shortly.",
        type: "error",
      });
      return;
    }

    if (outcome.status === "error") {
      showToast({ message: outcome.message, type: "error" });
    }
    // "cancelled" — the donor backed out of checkout themselves, no toast.
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <BackButton />
        <AppText style={styles.headerTitle}>Donate &amp; Support</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <AppKeyboardAwareScrollView
        containerStyle={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroIconWrap}>
          <Ionicons name="heart" size={30} color={Theme.colors.primary} />
        </View>

        <AppText style={styles.heroTitle}>Support Citizen Monitors</AppText>
        <AppText style={styles.heroSubtitle}>
          Your donation helps volunteer observers monitor elections and keep
          the process transparent for everyone.
        </AppText>

        <AppText style={styles.sectionLabel}>Choose an amount</AppText>

        <View style={styles.presetGrid}>
          {DONATION_PRESET_AMOUNTS.map((preset) => {
            const isSelected = !isCustomMode && selectedPreset === preset;

            return (
              <Pressable
                key={preset}
                onPress={() => handleSelectPreset(preset)}
                style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <AppText
                  style={[
                    styles.presetChipText,
                    isSelected && styles.presetChipTextSelected,
                  ]}
                >
                  {formatNaira(preset)}
                </AppText>
              </Pressable>
            );
          })}

          <Pressable
            onPress={handleSelectCustom}
            style={[styles.presetChip, isCustomMode && styles.presetChipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected: isCustomMode }}
          >
            <AppText
              style={[
                styles.presetChipText,
                isCustomMode && styles.presetChipTextSelected,
              ]}
            >
              Custom
            </AppText>
          </Pressable>
        </View>

        {isCustomMode ? (
          <AppInput
            label="Enter amount (₦)"
            placeholder="e.g. 3000"
            keyboardType="number-pad"
            value={customAmount}
            onChangeText={setCustomAmount}
            containerStyle={styles.customInput}
          />
        ) : null}

        {isCustomMode && customAmount.length > 0 && !isAmountValid ? (
          <AppText style={styles.validationText}>
            Enter an amount between {formatNaira(DONATION_MIN_AMOUNT)} and{" "}
            {formatNaira(DONATION_MAX_AMOUNT)}.
          </AppText>
        ) : null}

        <View style={styles.secureRow}>
          <Ionicons
            name="lock-closed-outline"
            size={14}
            color={Theme.colors.textMuted}
          />
          <AppText style={styles.secureText}>
            Payments are processed securely by Stripe. Card details never
            touch our servers.
          </AppText>
        </View>

        <AppButton
          title={
            isAmountValid
              ? isProcessing
                ? "Completing checkout…"
                : `Donate ${formatNaira(amount)}`
              : "Enter a valid amount"
          }
          onPress={handleDonate}
          disabled={!isAmountValid}
          loading={isProcessing}
        />
      </AppKeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  headerSpacer: {
    width: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  heroIconWrap: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  heroTitle: {
    textAlign: "center",
    fontSize: 20,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    marginBottom: 6,
  },
  heroSubtitle: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
  },
  presetChip: {
    minWidth: "30%",
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  presetChipSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primarySoft,
  },
  presetChipText: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  presetChipTextSelected: {
    color: Theme.colors.primary,
  },
  customInput: {
    marginTop: 10,
  },
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.danger,
    marginTop: 6,
    marginBottom: 6,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 20,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  secureText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },
});
