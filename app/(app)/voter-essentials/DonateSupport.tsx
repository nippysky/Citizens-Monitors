import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppGradientScreen from "@/components/app/AppGradientScreen";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import BackButton from "@/components/ui/BackButton";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import SelectPickerSheet from "@/components/ui/sheets/SelectPickerSheet";
import { useToastContext } from "@/components/feedback/ToastProvider";
import { Theme } from "@/theme";

type DonationForm = {
  amount: string;
  firstName: string;
  lastName: string;
  nationality: string;
};

const INITIAL_FORM: DonationForm = {
  amount: "",
  firstName: "",
  lastName: "",
  nationality: "",
};

const DONATION_IMPACT_ITEMS = [
  "Keeps the results server live for half a day",
  "Powers PU location data for 100 monitors",
  "Processes 200 citizen-submitted reports",
];

function formatNaira(value: string): string {
  const numeric = Number(String(value).replace(/[^\d]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return "0";
  return new Intl.NumberFormat("en-NG").format(numeric);
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

export default function DonateSupportScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToastContext();

  const nationalitySheetRef = useRef<BottomSheetModal>(null);

  const [form, setForm] = useState<DonationForm>(INITIAL_FORM);
  const [nationalityQuery, setNationalityQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [paystackVisible, setPaystackVisible] = useState(false);

  const amountNumber = useMemo(() => parseAmount(form.amount), [form.amount]);
  const formattedAmount = useMemo(
    () => formatNaira(form.amount),
    [form.amount]
  );

  const emailPreview = useMemo(() => {
    const first = form.firstName.trim().toLowerCase();
    const last = form.lastName.trim().toLowerCase();

    if (!first && !last) {
      return "+233241234567@gmail.com";
    }

    return `${first || "citizen"}${last ? `.${last}` : ""}@gmail.com`;
  }, [form.firstName, form.lastName]);

  const canDonate =
    amountNumber > 0 &&
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.nationality.trim().length > 0;

  const handleDonateNow = async () => {
    if (!amountNumber) {
      showToast({
        type: "error",
        message: "Please enter a valid donation amount.",
      });
      return;
    }

    if (!form.firstName.trim()) {
      showToast({
        type: "error",
        message: "Please enter your first name.",
      });
      return;
    }

    if (!form.lastName.trim()) {
      showToast({
        type: "error",
        message: "Please enter your last name.",
      });
      return;
    }

    if (!form.nationality.trim()) {
      showToast({
        type: "error",
        message: "Please select your nationality.",
      });
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    setPaystackVisible(true);
  };

  const handleConfirmMockPayment = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setPaystackVisible(false);

    showToast({
      type: "success",
      message: `Donation of ₦${formattedAmount} initialized successfully.`,
    });
  };

  const handleCancelPayment = () => {
    setPaystackVisible(false);
    showToast({
      type: "error",
      message: "Payment cancelled.",
    });
  };

  return (
    <>
      <AppGradientScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topRow}>
            <BackButton />
            <Pressable
              style={styles.helpBtn}
              onPress={() =>
                showToast({
                  type: "success",
                  message: "Donation help guide coming next.",
                })
              }
              hitSlop={10}
            >
              <AppText style={styles.helpText}>Get help</AppText>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={Theme.colors.primary}
              />
            </Pressable>
          </View>

          <View style={styles.headerBlock}>
            <AppText style={styles.title}>Donation</AppText>
            <AppText style={styles.subtitle}>
              Citizen Monitors is free — and always will be. We rely entirely on
              people like you to keep Nigeria&apos;s election monitoring
              transparent and independent.
            </AppText>
          </View>

          <AppInput
            label="Enter amount"
            value={form.amount}
            onChangeText={(value) =>
              setForm((prev) => ({
                ...prev,
                amount: value.replace(/[^\d]/g, ""),
              }))
            }
            keyboardType="number-pad"
            placeholder=""
            startIcon={
              <AppText style={styles.nairaIconText}>₦</AppText>
            }
          />

          <AppInput
            label="Your First Name"
            value={form.firstName}
            onChangeText={(firstName) =>
              setForm((prev) => ({ ...prev, firstName }))
            }
            placeholder="First Name"
            autoCapitalize="words"
          />

          <AppInput
            label="Your Last Name"
            value={form.lastName}
            onChangeText={(lastName) =>
              setForm((prev) => ({ ...prev, lastName }))
            }
            placeholder="Surname"
            autoCapitalize="words"
          />

          <View style={styles.selectWrap}>
            <AppText style={styles.selectLabel}>Nationality</AppText>
            <Pressable
              onPress={() => {
                setNationalityQuery("");
                nationalitySheetRef.current?.present();
              }}
            >
              <AppInput
                value={form.nationality}
                placeholder="Select your country"
                editable={false}
                pointerEvents="none"
                endIcon={
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={Theme.colors.textSoft}
                  />
                }
              />
            </Pressable>
          </View>

          <View style={styles.impactBlock}>
            <AppText style={styles.impactTitle}>What The Donation Is For:</AppText>

            <View style={styles.impactList}>
              {DONATION_IMPACT_ITEMS.map((item) => (
                <View key={item} style={styles.impactRow}>
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={Theme.colors.primary}
                  />
                  <AppText style={styles.impactText}>{item}</AppText>
                </View>
              ))}
            </View>
          </View>

          <AppButton
            title="Donate Now"
            onPress={handleDonateNow}
            disabled={!canDonate}
            style={styles.donateBtn}
          />
        </ScrollView>
      </AppGradientScreen>

      <SelectPickerSheet
        ref={nationalitySheetRef}
        title="Nationality"
        query={nationalityQuery}
        onChangeQuery={setNationalityQuery}
        selectedValue={form.nationality}
        onSelectValue={(nationality) =>
          setForm((prev) => ({ ...prev, nationality }))
        }
      />

      <PaystackCheckoutModal
        visible={paystackVisible}
        onClose={handleCancelPayment}
        onPay={handleConfirmMockPayment}
        amountLabel={`Pay NGN ${formattedAmount}`}
        email={emailPreview}
      />

      <AppScreenLoader visible={loading} />
    </>
  );
}

function PaystackCheckoutModal({
  visible,
  onClose,
  onPay,
  amountLabel,
  email,
}: {
  visible: boolean;
  onClose: () => void;
  onPay: () => void;
  amountLabel: string;
  email: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <View style={styles.checkoutRoot}>
        <View style={[styles.checkoutSafeTop, { paddingTop: insets.top + 8 }]}>
          <View style={styles.checkoutStatusBarMock}>
            <AppText style={styles.checkoutStatusTime}>9:41</AppText>

            <View style={styles.checkoutStatusIcons}>
              <Ionicons name="cellular" size={16} color="#111827" />
              <Ionicons name="wifi" size={16} color="#111827" />
              <Ionicons name="battery-full" size={18} color="#111827" />
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.checkoutContent,
            { paddingBottom: Math.max(insets.bottom + 24, 30) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.checkoutTopLabel}>
            <Ionicons name="card-outline" size={16} color="#4B5563" />
            <AppText style={styles.checkoutTopLabelText}>Pay with Card</AppText>
          </View>

          <View style={styles.checkoutCard}>
            <View style={styles.checkoutHeaderRow}>
              <View>
                <AppText style={styles.businessName}>Your Business</AppText>
                <AppText style={styles.businessLogoText}>Logo Here</AppText>
              </View>

              <View style={styles.checkoutAmountWrap}>
                <AppText style={styles.checkoutEmail}>{email}</AppText>
                <AppText style={styles.checkoutAmount}>{amountLabel}</AppText>
              </View>
            </View>

            <View style={styles.checkoutMiddle}>
              <AppText style={styles.checkoutPrompt}>
                Enter your card details to pay
              </AppText>

              <View style={styles.cardInputMock}>
                <AppText style={styles.cardInputLabel}>CARD NUMBER</AppText>
                <AppText style={styles.cardInputPlaceholder}>
                  0000 0000 0000 0000
                </AppText>
              </View>

              <View style={styles.cardInputRow}>
                <View style={[styles.cardInputMock, styles.halfInput]}>
                  <AppText style={styles.cardInputLabel}>CARD EXPIRY</AppText>
                  <AppText style={styles.cardInputPlaceholder}>MM/YY</AppText>
                </View>

                <View style={[styles.cardInputMock, styles.halfInput]}>
                  <View style={styles.cvvHeader}>
                    <AppText style={styles.cardInputLabel}>CVV</AppText>
                    <AppText style={styles.cardInputTiny}>HELP?</AppText>
                  </View>
                  <AppText style={styles.cardInputPlaceholder}>123</AppText>
                </View>
              </View>

              <Pressable onPress={onPay} style={styles.payBtn}>
                <AppText style={styles.payBtnText}>{amountLabel}</AppText>
              </Pressable>

              <AppText style={styles.levyText}>
                An additional E-levy fee of 1% may apply to this payment.{" "}
                <AppText style={styles.learnMore}>Learn more.</AppText>
              </AppText>
            </View>

            <View style={styles.checkoutActionRow}>
              <Pressable style={styles.secondaryCheckoutBtn}>
                <Ionicons name="close" size={12} color="#6B7280" />
                <AppText style={styles.secondaryCheckoutBtnText}>
                  Change Payment Method
                </AppText>
              </Pressable>

              <Pressable style={styles.secondaryCheckoutBtn} onPress={onClose}>
                <Ionicons name="close" size={12} color="#6B7280" />
                <AppText style={styles.secondaryCheckoutBtnText}>
                  Cancel Payment
                </AppText>
              </Pressable>
            </View>

            <View style={styles.securedRow}>
              <Ionicons name="lock-closed" size={13} color="#111827" />
              <AppText style={styles.securedText}>
                Secured by <AppText style={styles.paystackText}>paystack</AppText>
              </AppText>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },

  topRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  helpBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  helpText: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  headerBlock: {
    gap: 10,
    marginTop: 2,
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  subtitle: {
    maxWidth: 360,
    color: Theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },

  nairaIconText: {
    fontSize: 18,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  selectWrap: {
    gap: 8,
  },

  selectLabel: {
    color: Theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Theme.fonts.body.medium,
  },

  impactBlock: {
    gap: 12,
    marginTop: 2,
  },

  impactTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  impactList: {
    gap: 10,
  },

  impactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  impactText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
  },

  donateBtn: {
    marginTop: 4,
    marginVertical: 0,
  },

  checkoutRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  checkoutSafeTop: {
    backgroundColor: "#FFFFFF",
  },

  checkoutStatusBarMock: {
    minHeight: 28,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  checkoutStatusTime: {
    fontSize: 15,
    lineHeight: 20,
    color: "#111827",
    fontFamily: Theme.fonts.body.semibold,
  },

  checkoutStatusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  checkoutContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  checkoutTopLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  checkoutTopLabelText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#4B5563",
    fontFamily: Theme.fonts.body.medium,
  },

  checkoutCard: {
    borderWidth: 1,
    borderColor: "#F0F2F5",
    backgroundColor: "#FFFFFF",
  },

  checkoutHeaderRow: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  businessName: {
    fontSize: 15,
    lineHeight: 20,
    color: "#111827",
    fontFamily: Theme.fonts.body.semibold,
  },

  businessLogoText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#111827",
    fontFamily: Theme.fonts.body.semibold,
  },

  checkoutAmountWrap: {
    alignItems: "flex-end",
    gap: 2,
  },

  checkoutEmail: {
    fontSize: 12.5,
    lineHeight: 16,
    color: "#A1A1AA",
  },

  checkoutAmount: {
    fontSize: 15,
    lineHeight: 20,
    color: "#56C271",
    fontFamily: Theme.fonts.body.semibold,
  },

  checkoutMiddle: {
    paddingHorizontal: 16,
    paddingTop: 46,
    paddingBottom: 28,
    alignItems: "center",
  },

  checkoutPrompt: {
    fontSize: 16,
    lineHeight: 22,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 28,
  },

  cardInputMock: {
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
    marginBottom: 16,
  },

  cardInputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  halfInput: {
    flex: 1,
    marginBottom: 0,
  },

  cardInputLabel: {
    fontSize: 10,
    lineHeight: 12,
    color: "#C4C4C4",
    marginBottom: 6,
  },

  cardInputTiny: {
    fontSize: 9,
    lineHeight: 11,
    color: "#D4D4D8",
  },

  cvvHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardInputPlaceholder: {
    fontSize: 26 / 2,
    lineHeight: 18,
    color: "#A3A3A3",
  },

  payBtn: {
    width: "100%",
    minHeight: 52,
    borderRadius: 3,
    backgroundColor: "#93CF9F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 24,
  },

  payBtnText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },

  levyText: {
    textAlign: "center",
    fontSize: 12.5,
    lineHeight: 18,
    color: "#A1A1AA",
    maxWidth: 300,
  },

  learnMore: {
    color: "#38BDF8",
  },

  checkoutActionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 44,
  },

  secondaryCheckoutBtn: {
    minHeight: 32,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFFFFF",
  },

  secondaryCheckoutBtnText: {
    fontSize: 12.5,
    lineHeight: 16,
    color: "#374151",
    fontFamily: Theme.fonts.body.medium,
  },

  securedRow: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingBottom: 26,
  },

  securedText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#111827",
  },

  paystackText: {
    fontFamily: Theme.fonts.body.bold,
  },
});