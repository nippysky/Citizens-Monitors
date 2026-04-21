import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import { useToastContext } from "@/components/feedback/ToastProvider";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import MeHeader from "@/components/me/MeHeader";
import MeProfileCard from "@/components/me/MeProfileCard";
import MeSection from "@/components/me/MeSection";
import NotificationAlertBottomSheet from "@/components/me/NotificationAlertBottomSheet";
import ObserverRegistrationBottomSheet, {
  ObserverRegistrationFormState,
} from "@/components/me/ObserverRegistrationBottomSheet";
import PollingUnitBottomSheet, {
  PollingUnitFormState,
} from "@/components/me/PollingUnitBottomSheet";
import ProfileBottomSheet, {
  ProfileFormState,
} from "@/components/me/ProfileBottomSheet";
import SecurityBottomSheet, {
  SecurityFormState,
} from "@/components/me/SecurityBottomSheet";
import PVCVerificationBottomSheet from "@/components/me/PVCVerificationBottomSheet";
import BankDetailsBottomSheet, {
  BankFormState,
} from "@/components/me/BankDetailsBottomSheet";
import TourTarget from "@/components/tour/TourTarget";
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { useAuth } from "@/context/AuthContext";
import { useTour, useTourScrollReset } from "@/context/TourContext";
import {
  getMeAccountItems,
  getMeBanner,
  getMeOtherItems,
  MeMenuItem,
  mockMeUser,
  defaultNotificationSettings,
  NotificationSettingsState,
} from "@/data/me";
import { Theme } from "@/theme";
import { BirthdayValue, Gender } from "@/types/onboarding";

const DEFAULT_BIRTHDAY: BirthdayValue = {
  day: 4,
  month: "January",
  year: 2023,
  formatted: "4 January, 2023",
};

const pollingData = {
  Lagos: {
    Alimosho: {
      "Egbeda Ward": ["PU 024, Alimosho", "PU 031, Alimosho"],
      "Ipaja Ward": ["PU 011, Alimosho", "PU 018, Alimosho"],
    },
    Ikeja: { "Alausa Ward": ["PU 002, Ikeja", "PU 005, Ikeja"] },
  },
  Ogun: {
    Abeokuta: { "Kuto Ward": ["PU 001, Abeokuta", "PU 006, Abeokuta"] },
  },
} as const;

type PollingStateKey = keyof typeof pollingData;

const bankOptions = [
  "Access Bank",
  "First Bank",
  "GTBank",
  "Fidelity Bank",
  "UBA",
  "Zenith Bank",
  "Opay",
  "Moniepoint",
  "Sterling Bank",
  "Wema Bank",
];

// Step 7's target — when active we scroll the Me screen back to top.
const ME_TOUR_TARGET_IDS = ["me.my-account"];

export default function MeScreen() {
  const { signOut } = useAuth();
  const { showToast } = useToastContext();
  const { resetTour, startTour } = useTour();

  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  useTourScrollReset(scrollViewRef, ME_TOUR_TARGET_IDS);

  const banner = useMemo(() => getMeBanner(mockMeUser), []);
  const accountItems = useMemo(() => getMeAccountItems(mockMeUser), []);
  const otherItems = useMemo(() => getMeOtherItems(), []);

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    firstName: "Ifeoluwa",
    lastName: "Ajetomobi",
    birthday: DEFAULT_BIRTHDAY,
    gender: "Female" as Gender,
    nationality: "Nigeria",
    nationalityQuery: "",
    residence: "Lagos, Nigeria",
  });

  const [securityForm, setSecurityForm] = useState<SecurityFormState>({
    password: "",
    confirmPassword: "",
  });

  const [pollingUnitForm, setPollingUnitForm] = useState<PollingUnitFormState>({
    state: "Lagos",
    lga: "Alimosho",
    ward: "Egbeda Ward",
    pollingUnit: "PU 024, Alimosho",
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettingsState>(defaultNotificationSettings);

  const [observerForm, setObserverForm] =
    useState<ObserverRegistrationFormState>({
      phoneNumber: "",
      pvcFrontUri: null,
      pvcBackUri: null,
    });

  const [bankForm, setBankForm] = useState<BankFormState>({
    bankName: "",
    accountNumber: "",
    accountFullName: "",
  });

  const profileSheetRef = useRef<BottomSheetModal>(null);
  const securitySheetRef = useRef<BottomSheetModal>(null);
  const pollingUnitSheetRef = useRef<BottomSheetModal>(null);
  const notificationSheetRef = useRef<BottomSheetModal>(null);
  const observerSheetRef = useRef<BottomSheetModal>(null);
  const pvcSheetRef = useRef<BottomSheetModal>(null);
  const bankSheetRef = useRef<BottomSheetModal>(null);

  const birthdaySheetRef = useRef<BottomSheetModal>(null);
  const nationalitySheetRef = useRef<BottomSheetModal>(null);
  const genderSheetRef = useRef<BottomSheetModal>(null);

  const stateOptions = useMemo(() => Object.keys(pollingData), []);

  const lgaOptions = useMemo(() => {
    if (!pollingUnitForm.state) return [];
    return Object.keys(
      pollingData[pollingUnitForm.state as PollingStateKey] ?? {}
    );
  }, [pollingUnitForm.state]);

  const wardOptions = useMemo(() => {
    if (!pollingUnitForm.state || !pollingUnitForm.lga) return [];
    const sk = pollingUnitForm.state as PollingStateKey;
    return Object.keys(
      pollingData[sk]?.[
        pollingUnitForm.lga as keyof (typeof pollingData)[typeof sk]
      ] ?? {}
    );
  }, [pollingUnitForm.state, pollingUnitForm.lga]);

  const pollingUnitOptions = useMemo(() => {
    if (
      !pollingUnitForm.state ||
      !pollingUnitForm.lga ||
      !pollingUnitForm.ward
    ) {
      return [];
    }
    const sk = pollingUnitForm.state as PollingStateKey;
    const lk = pollingUnitForm.lga as keyof (typeof pollingData)[typeof sk];
    const wk =
      pollingUnitForm.ward as keyof (typeof pollingData)[typeof sk][typeof lk];
    return pollingData[sk]?.[lk]?.[wk] ?? [];
  }, [pollingUnitForm.state, pollingUnitForm.lga, pollingUnitForm.ward]);

  const runSave = async (
    message: string,
    dismissRef?: React.RefObject<BottomSheetModal | null>
  ) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    dismissRef?.current?.dismiss();
    showToast({ message, type: "success" });
  };

  const handleDevReplayTour = async () => {
    if (!__DEV__) return;
    await resetTour();
    router.navigate(Paths.appHome);
    setTimeout(() => startTour(), 350);
  };

  const handleItemPress = (item: MeMenuItem) => {
    switch (item.id) {
      case "personal-profile":
        profileSheetRef.current?.present();
        return;
      case "security":
        securitySheetRef.current?.present();
        return;
      case "polling-unit":
        pollingUnitSheetRef.current?.present();
        return;
      case "polling-unit-locator":
        router.push(Paths.voterPollingUnitLocator);
        return;
      case "notifications":
        notificationSheetRef.current?.present();
        return;
      case "upgrade-user":
        observerSheetRef.current?.present();
        return;
      case "pvc-verification":
        pvcSheetRef.current?.present();
        return;
      case "bank-details":
        bankSheetRef.current?.present();
        return;
      case "citizen-academy":
        router.push(Paths.voterCitizenAcademy);
        return;
      case "archive-reports":
        router.push(Paths.appArchiveReports);
        return;
      case "digital-vault":
        router.push(Paths.appDigitalVault);
        return;
      case "support-faq":
        router.push(Paths.appHelpSupport);
        return;
      case "feedback":
        showToast({ message: "Feedback flow coming next.", type: "success" });
        return;
      case "sign-out":
        Alert.alert("Sign Out", "Are you sure you want to log out?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: () => {
              signOut();
              router.replace(Paths.welcome);
            },
          },
        ]);
        return;
    }
  };

  const handleBannerPress = () => {
    observerSheetRef.current?.present();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        <LinearGradient
          colors={["#EEF5DB", "#F5F2DE", "#FAF8EE", "#F7F7F2"]}
          locations={[0, 0.24, 0.6, 1]}
          style={styles.gradientBg}
        />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          bounces
        >
          <View style={styles.headerWrap}>
            <Pressable
              onLongPress={handleDevReplayTour}
              delayLongPress={700}
              disabled={!__DEV__}
            >
              <MeHeader user={mockMeUser} />
            </Pressable>
          </View>

          <MeProfileCard banner={banner} onPress={handleBannerPress} />

          <TourTarget id="me.my-account">
            <View style={styles.sectionBlock}>
              <AppText style={styles.sectionTitle}>MY ACCOUNT</AppText>
              <MeSection items={accountItems} onItemPress={handleItemPress} />
            </View>
          </TourTarget>

          <View style={styles.sectionBlock}>
            <AppText style={styles.sectionTitle}>OTHERS</AppText>
            <MeSection items={otherItems} onItemPress={handleItemPress} />
          </View>

          {__DEV__ ? (
            <Pressable
              onPress={handleDevReplayTour}
              style={({ pressed }) => [
                styles.devButton,
                pressed && styles.devButtonPressed,
              ]}
            >
              <AppText style={styles.devButtonText}>
                🔄 Replay App Tour (Dev)
              </AppText>
            </Pressable>
          ) : null}

          <TabBarSpacer />
        </ScrollView>

        <ProfileBottomSheet
          ref={profileSheetRef}
          value={profileForm}
          onChange={setProfileForm}
          onSave={() => runSave("Successfully!!", profileSheetRef)}
          birthdaySheetRef={birthdaySheetRef}
          nationalitySheetRef={nationalitySheetRef}
          genderSheetRef={genderSheetRef}
        />

        <SecurityBottomSheet
          ref={securitySheetRef}
          value={securityForm}
          onChange={setSecurityForm}
          onSave={async () => {
            if (!securityForm.password || !securityForm.confirmPassword) {
              showToast({
                message: "Please fill both password fields.",
                type: "error",
              });
              return;
            }

            if (securityForm.password !== securityForm.confirmPassword) {
              showToast({
                message: "Passwords do not match.",
                type: "error",
              });
              return;
            }

            await runSave("Security updated successfully.", securitySheetRef);
            setSecurityForm({ password: "", confirmPassword: "" });
          }}
        />

        <PollingUnitBottomSheet
          ref={pollingUnitSheetRef}
          value={pollingUnitForm}
          onChange={setPollingUnitForm}
          onSave={() =>
            runSave("Polling unit updated successfully.", pollingUnitSheetRef)
          }
          stateOptions={stateOptions}
          lgaOptions={lgaOptions}
          wardOptions={wardOptions}
          pollingUnitOptions={pollingUnitOptions}
        />

        <NotificationAlertBottomSheet
          ref={notificationSheetRef}
          value={notificationSettings}
          onChange={setNotificationSettings}
          onSave={() =>
            runSave("Notification settings updated.", notificationSheetRef)
          }
        />

        <ObserverRegistrationBottomSheet
          ref={observerSheetRef}
          value={observerForm}
          onChange={setObserverForm}
          onSubmit={() =>
            runSave("Observer registration submitted.", observerSheetRef)
          }
        />

        <PVCVerificationBottomSheet
          ref={pvcSheetRef}
          pvcVerifiedDate={mockMeUser.pvcVerifiedDate}
          onSubmit={() => {
            showToast({
              message: "PVC submitted for verification.",
              type: "success",
            });
          }}
        />

        <BankDetailsBottomSheet
          ref={bankSheetRef}
          value={bankForm}
          onChange={setBankForm}
          onSave={() => runSave("Bank details saved.", bankSheetRef)}
          bankOptions={bankOptions}
        />

        <AppScreenLoader visible={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#EEF5DB" },
  screen: { flex: 1, backgroundColor: "#F7F7F2" },
  gradientBg: { ...StyleSheet.absoluteFillObject },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: "transparent",
  },
  headerWrap: { marginBottom: 14 },
  sectionBlock: { gap: 12, marginTop: 18 },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: "rgba(17,26,50,0.68)",
    fontFamily: Theme.fonts.body.semibold,
  },
  devButton: {
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#111A32",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  devButtonPressed: { opacity: 0.85 },
  devButtonText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: Theme.fonts.body.semibold,
  },
});