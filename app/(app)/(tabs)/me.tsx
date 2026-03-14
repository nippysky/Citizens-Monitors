import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import { useToastContext } from "@/components/feedback/ToastProvider";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import MeHeader from "@/components/me/MeHeader";
import MeProfileCard from "@/components/me/MeProfileCard";
import MeSection from "@/components/me/MeSection";
import NotificationAlertBottomSheet, {
  NotificationSettingsState,
} from "@/components/me/NotificationAlertBottomSheet";
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
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { useAuth } from "@/context/AuthContext";
import {
  getMeProfileItems,
  MeMenuItem,
  meOtherItems,
  mockMeUser,
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
    Ikeja: {
      "Alausa Ward": ["PU 002, Ikeja", "PU 005, Ikeja"],
    },
  },
  Ogun: {
    Abeokuta: {
      "Kuto Ward": ["PU 001, Abeokuta", "PU 006, Abeokuta"],
    },
  },
} as const;

const defaultGender: Gender = "Female";

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

export default function MeScreen() {
  const { signOut } = useAuth();
  const { showToast } = useToastContext();

  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    firstName: "Ifeoluwa",
    lastName: "Ajetomobi",
    birthday: DEFAULT_BIRTHDAY,
    gender: defaultGender,
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
    useState<NotificationSettingsState>({
      electionUpdates: false,
      securityAlerts: true,
      newsletters: false,
    });

  const [observerRegistrationForm, setObserverRegistrationForm] =
    useState<ObserverRegistrationFormState>({
      phoneNumber: "",
      pvcFrontUri: null,
      pvcBackUri: null,
      bankName: "",
      accountNumber: "",
      accountFullName: "",
    });

  const profileSheetRef = useRef<BottomSheetModal>(null);
  const securitySheetRef = useRef<BottomSheetModal>(null);
  const pollingUnitSheetRef = useRef<BottomSheetModal>(null);
  const notificationSheetRef = useRef<BottomSheetModal>(null);
  const observerRegistrationSheetRef = useRef<BottomSheetModal>(null);

  const birthdaySheetRef = useRef<BottomSheetModal>(null);
  const nationalitySheetRef = useRef<BottomSheetModal>(null);
  const genderSheetRef = useRef<BottomSheetModal>(null);

  const stateSelectorRef = useRef<BottomSheetModal>(null);
  const lgaSelectorRef = useRef<BottomSheetModal>(null);
  const wardSelectorRef = useRef<BottomSheetModal>(null);
  const puSelectorRef = useRef<BottomSheetModal>(null);
  const bankSelectorRef = useRef<BottomSheetModal>(null);

  const profileItems = useMemo(() => getMeProfileItems(mockMeUser), []);
  const otherItems = useMemo(() => meOtherItems, []);

  const stateOptions = useMemo(() => Object.keys(pollingData), []);

  const lgaOptions = useMemo(() => {
    if (!pollingUnitForm.state) return [];
    const stateKey = pollingUnitForm.state as PollingStateKey;
    return Object.keys(pollingData[stateKey] ?? {});
  }, [pollingUnitForm.state]);

  const wardOptions = useMemo(() => {
    if (!pollingUnitForm.state || !pollingUnitForm.lga) return [];

    const stateKey = pollingUnitForm.state as PollingStateKey;
    return Object.keys(
      pollingData[stateKey]?.[
        pollingUnitForm.lga as keyof (typeof pollingData)[typeof stateKey]
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

    const stateKey = pollingUnitForm.state as PollingStateKey;
    const lgaKey =
      pollingUnitForm.lga as keyof (typeof pollingData)[typeof stateKey];
    const wardKey =
      pollingUnitForm.ward as keyof (typeof pollingData)[typeof stateKey][typeof lgaKey];

    return pollingData[stateKey]?.[lgaKey]?.[wardKey] ?? [];
  }, [pollingUnitForm.state, pollingUnitForm.lga, pollingUnitForm.ward]);

  const runSave = async (
    message: string,
    dismissRef?: React.RefObject<BottomSheetModal | null>
  ) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);
    dismissRef?.current?.dismiss();

    showToast({
      message,
      type: "success",
    });
  };

  const pickPvcImage = async (side: "front" | "back") => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast({
        message: "Please allow photo library access to upload your PVC.",
        type: "error",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const pickedUri = result.assets[0].uri;

    setObserverRegistrationForm((prev) => ({
      ...prev,
      pvcFrontUri: side === "front" ? pickedUri : prev.pvcFrontUri,
      pvcBackUri: side === "back" ? pickedUri : prev.pvcBackUri,
    }));
  };

  const handleItemPress = (item: MeMenuItem) => {
    switch (item.id) {
      case "personal-profile":
        profileSheetRef.current?.present();
        return;

      case "my-reports":
        router.push(Paths.appMyReports);
        return;

      case "security":
        securitySheetRef.current?.present();
        return;

      case "polling-unit":
        pollingUnitSheetRef.current?.present();
        return;

      case "notifications":
        notificationSheetRef.current?.present();
        return;

      case "support-faq":
        showToast({
          message: "Support & FAQ coming next.",
          type: "success",
        });
        return;

      case "feedback":
        showToast({
          message: "Feedback flow coming next.",
          type: "success",
        });
        return;

      case "sign-out":
        Alert.alert(
          "Sign Out",
          "Are you sure you want to log out from this device?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Sign Out",
              style: "destructive",
              onPress: () => {
                signOut();
                router.replace(Paths.welcome);
              },
            },
          ]
        );
        return;

      default:
        return;
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      showToast({
        message: "Please complete your first and last name.",
        type: "error",
      });
      return;
    }

    await runSave("Successfully!!", profileSheetRef);
  };

  const handleSaveSecurity = async () => {
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

    setSecurityForm({
      password: "",
      confirmPassword: "",
    });
  };

  const handleSavePollingUnit = async () => {
    if (
      !pollingUnitForm.state ||
      !pollingUnitForm.lga ||
      !pollingUnitForm.ward ||
      !pollingUnitForm.pollingUnit
    ) {
      showToast({
        message: "Please complete your polling unit selection.",
        type: "error",
      });
      return;
    }

    await runSave("Polling unit updated successfully.", pollingUnitSheetRef);
  };

  const handleSaveNotifications = async () => {
    await runSave("Notification settings updated.", notificationSheetRef);
  };

  const handleSubmitObserverRegistration = async () => {
    if (!observerRegistrationForm.phoneNumber.trim()) {
      showToast({
        message: "Please enter your phone number.",
        type: "error",
      });
      return;
    }

    if (
      !observerRegistrationForm.pvcFrontUri ||
      !observerRegistrationForm.pvcBackUri
    ) {
      showToast({
        message: "Please upload both PVC front and back images.",
        type: "error",
      });
      return;
    }

    if (!observerRegistrationForm.bankName.trim()) {
      showToast({
        message: "Please select your bank.",
        type: "error",
      });
      return;
    }

    if (observerRegistrationForm.accountNumber.trim().length !== 10) {
      showToast({
        message: "Account number must be 10 digits.",
        type: "error",
      });
      return;
    }

    if (!observerRegistrationForm.accountFullName.trim()) {
      showToast({
        message: "Please enter your account full name.",
        type: "error",
      });
      return;
    }

    await runSave(
      "Observer registration submitted successfully.",
      observerRegistrationSheetRef
    );
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          bounces
        >
          <View style={styles.headerWrap}>
            <MeHeader user={mockMeUser} />
          </View>

          {mockMeUser.showRegistrationCard ? (
            <MeProfileCard
              title={mockMeUser.registrationTitle}
              subtitle={mockMeUser.registrationSubtitle}
              actionLabel={mockMeUser.registrationActionLabel}
              onPress={() => observerRegistrationSheetRef.current?.present()}
            />
          ) : null}

          <View style={styles.sectionBlock}>
            <AppText style={styles.sectionTitle}>PROFILE</AppText>
            <MeSection items={profileItems} onItemPress={handleItemPress} />
          </View>

          <View style={styles.sectionBlock}>
            <AppText style={styles.sectionTitle}>OTHERS</AppText>
            <MeSection items={otherItems} onItemPress={handleItemPress} />
          </View>

          <TabBarSpacer />
        </ScrollView>

        <ProfileBottomSheet
          ref={profileSheetRef}
          value={profileForm}
          onChange={setProfileForm}
          onSave={handleSaveProfile}
          birthdaySheetRef={birthdaySheetRef}
          nationalitySheetRef={nationalitySheetRef}
          genderSheetRef={genderSheetRef}
        />

        <SecurityBottomSheet
          ref={securitySheetRef}
          value={securityForm}
          onChange={setSecurityForm}
          onSave={handleSaveSecurity}
        />

        <PollingUnitBottomSheet
          ref={pollingUnitSheetRef}
          value={pollingUnitForm}
          onChange={setPollingUnitForm}
          onSave={handleSavePollingUnit}
          stateSheetRef={stateSelectorRef}
          lgaSheetRef={lgaSelectorRef}
          wardSheetRef={wardSelectorRef}
          pollingUnitSheetRef={puSelectorRef}
          stateOptions={stateOptions}
          lgaOptions={lgaOptions}
          wardOptions={wardOptions}
          pollingUnitOptions={pollingUnitOptions}
        />

        <NotificationAlertBottomSheet
          ref={notificationSheetRef}
          value={notificationSettings}
          onChange={setNotificationSettings}
          onSave={handleSaveNotifications}
        />

        <ObserverRegistrationBottomSheet
          ref={observerRegistrationSheetRef}
          value={observerRegistrationForm}
          onChange={setObserverRegistrationForm}
          onSubmit={handleSubmitObserverRegistration}
          onPickFront={() => pickPvcImage("front")}
          onPickBack={() => pickPvcImage("back")}
          bankSheetRef={bankSelectorRef}
          bankOptions={bankOptions}
        />

        <AppScreenLoader visible={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#EEF5DB",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },

  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: "transparent",
  },

  headerWrap: {
    marginBottom: 16,
  },

  sectionBlock: {
    gap: 12,
    marginTop: 18,
  },

  sectionTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: "rgba(17,26,50,0.68)",
    fontFamily: Theme.fonts.body.semibold,
  },
});