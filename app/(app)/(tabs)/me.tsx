import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import { useToastContext } from "@/components/feedback/ToastProvider";
import TabBarSpacer from "@/components/layout/TabBarSpacer";
import BankDetailsBottomSheet, {
  BankFormState,
} from "@/components/me/BankDetailsBottomSheet";
import FeedbackBottomSheet, {
  FeedbackFormState,
} from "@/components/me/FeedbackBottomSheet";
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
import PVCVerificationBottomSheet from "@/components/me/PVCVerificationBottomSheet";
import SecurityBottomSheet, {
  SecurityFormState,
} from "@/components/me/SecurityBottomSheet";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { useAuth } from "@/context/AuthContext";
import {
  getMeAccountItems,
  getMeBanner,
  getMeOtherItems,
  MeMenuItem,
  MeUser,
} from "@/data/me";
import {
  useLocalGovernmentsQuery,
  usePollingUnitsQuery,
  useStatesQuery,
  useWardsQuery,
} from "@/hooks/api/useLocationQueries";
import { useMyProfileQuery } from "@/hooks/api/useMyProfileQuery";
import {
  useGenerateAnonymousUsernameMutation,
  useSubmitFeedbackMutation,
  useUpdateAnonymousIdentityMutation,
  useUpdateMyProfileMutation,
  useUpdateNotificationSettingsMutation,
  useUpdatePasswordMutation,
} from "@/hooks/api/useProfileMutations";
import { useSelectRoleMutation } from "@/hooks/api/useSelectRoleMutation";
import { useSubmitObserverRoleMutation } from "@/hooks/api/useSubmitObserverRoleMutation";
import {
  useBanksQuery,
  useMobileNotificationSettingsQuery,
} from "@/hooks/api/useProfileSupportQueries";
import {
  MobileNotificationSettingsState,
  MyProfileResponse,
} from "@/lib/api/profile.api";
import { Theme } from "@/theme";
import { BirthdayValue, Gender } from "@/types/onboarding";

const EMPTY_BIRTHDAY: BirthdayValue = {
  day: 0,
  month: "",
  year: 0,
  formatted: "",
};

const DEFAULT_NOTIFICATION_SETTINGS: MobileNotificationSettingsState = {
  pollingUnitActivity: true,
  electionDayAlert: false,
  discussionReplies: false,
  resultAggregated: false,
  reportConfirmed: false,
  reportFlagged: false,
  securityAlerts: false,
  newsletter: true,
};

const DEFAULT_FEEDBACK_FORM: FeedbackFormState = {
  title: "Feedback",
  message: "",
};

function getFullName(profile: MyProfileResponse): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
}

function getDisplayName(profile: MyProfileResponse): string {
  return getFullName(profile) || profile.email || "Citizen";
}

function getPollingUnitLabel(profile: MyProfileResponse): string {
  return profile.pollingUnit?.trim() || "No polling unit assigned";
}

function getUserType(role?: string): MeUser["userType"] {
  if (role === "observer") return "observer";
  if (role === "volunteer") return "volunteer";

  return "public-viewer";
}

function getVerificationStatus(
  profile: MyProfileResponse
): MeUser["verificationStatus"] {
  if (profile.role !== "observer") return "none";

  return profile.pendingObserverVerification ? "pending" : "verified";
}

function getRoleLabel(profile: MyProfileResponse): string {
  const pollingUnit = profile.pollingUnit?.trim();

  switch (profile.role) {
    case "observer":
      return pollingUnit ? `Observer at ${pollingUnit}` : "Citizen Observer";
    case "volunteer":
      return pollingUnit ? `Volunteer at ${pollingUnit}` : "Citizen Volunteer";
    case "public-viewer":
      return "Public Viewer";
    default:
      return "Citizen";
  }
}

function getUsername(profile: MyProfileResponse): string {
  if (profile.anonymousUsername?.trim()) {
    return profile.anonymousUsername.trim();
  }

  const fallback =
    profile.email?.split("@")[0] || profile.firstName || "citizen";

  return fallback.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
}

function buildMeUser(profile: MyProfileResponse): MeUser {
  return {
    fullName: getDisplayName(profile),
    username: getUsername(profile),
    roleLabel: getRoleLabel(profile),
    userType: getUserType(profile.role),
    verificationStatus: getVerificationStatus(profile),
    pollingUnit: getPollingUnitLabel(profile),
    avatarUri: profile.profileImage?.url,
    pvcVerifiedDate:
      profile.role === "observer" && !profile.pendingObserverVerification
        ? profile.updatedAt ?? profile.createdAt
        : undefined,
    reportsCount: 0,
    electionsCount: 0,
    incidentsCount: 0,
  };
}

function toBirthdayValue(dateOfBirth?: string): BirthdayValue {
  if (!dateOfBirth) return EMPTY_BIRTHDAY;

  const date = new Date(dateOfBirth);

  if (Number.isNaN(date.getTime())) return EMPTY_BIRTHDAY;

  const month = new Intl.DateTimeFormat("en", {
    month: "long",
    timeZone: "UTC",
  }).format(date);

  const formatted = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return {
    day: date.getUTCDate(),
    month,
    year: date.getUTCFullYear(),
    formatted,
  };
}

function toGender(value?: string): Gender {
  if (value === "Male" || value === "Female") return value;

  return "";
}

function monthNameToNumber(month: string): number {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const index = months.findIndex(
    (item) => item.toLowerCase() === month.toLowerCase()
  );

  return index >= 0 ? index + 1 : 0;
}

function toApiDateOfBirth(birthday: BirthdayValue): string {
  if (!birthday.day || !birthday.month || !birthday.year) return "";

  const month = monthNameToNumber(birthday.month);

  if (!month) return "";

  const yyyy = String(birthday.year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(birthday.day).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function buildProfileForm(profile: MyProfileResponse): ProfileFormState {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    birthday: toBirthdayValue(profile.dateOfBirth),
    gender: toGender(profile.gender),
    avatarUri: profile.profileImage?.url ?? null,
    avatarChanged: false,
  };
}

function buildPollingUnitForm(profile: MyProfileResponse): PollingUnitFormState {
  return {
    state: profile.state ?? "",
    lga: profile.lga ?? "",
    ward: profile.ward ?? "",
    pollingUnit: profile.pollingUnit ?? "",
  };
}

function applyPollingUnitOverride(
  profile: MyProfileResponse,
  override: PollingUnitFormState | null
): MyProfileResponse {
  if (!override) return profile;

  return {
    ...profile,
    state: override.state,
    lga: override.lga,
    ward: override.ward,
    pollingUnit: override.pollingUnit,
  };
}

function buildNotificationSettings(
  profile?: MyProfileResponse | null,
  remote?: Partial<MobileNotificationSettingsState> | null
): MobileNotificationSettingsState {
  return {
    ...DEFAULT_NOTIFICATION_SETTINGS,
    ...(profile?.notifications?.mobile ?? {}),
    ...(remote ?? {}),
  };
}

function buildObserverForm(
  profile: MyProfileResponse
): ObserverRegistrationFormState {
  return {
    phoneNumber: profile.phoneNumber ?? "",
    pvcFrontUri: profile.observerId?.[0]?.url ?? null,
    pvcBackUri: profile.observerId?.[1]?.url ?? null,
  };
}

function buildBankForm(profile: MyProfileResponse): BankFormState {
  return {
    bankName: profile.bankName ?? "",
    accountNumber: profile.bankAccountNumber ?? "",
    accountFullName: profile.bankAccountName ?? "",
  };
}

function applyAnonymousDraft(
  profile: MyProfileResponse,
  draftPublicName: string
): MyProfileResponse {
  const cleanName = draftPublicName.trim();

  if (!cleanName) return profile;

  return {
    ...profile,
    anonymousUsername: cleanName,
  };
}

function resolveUserEmail(
  profileEmail?: string | null,
  authEmail?: string | null
): string {
  return (profileEmail || authEmail || "").trim().toLowerCase();
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function MeScreenSkeleton() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        <LinearGradient
          colors={["#EEF5DB", "#F5F2DE", "#FAF8EE", "#F7F7F2"]}
          locations={[0, 0.24, 0.6, 1]}
          style={styles.gradientBg}
        />

        <View style={styles.content}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonHeaderText}>
              <View style={styles.skeletonLineLarge} />
              <View style={styles.skeletonLineMedium} />
              <View style={styles.skeletonLineSmall} />
              <View style={styles.skeletonLineTiny} />
            </View>
          </View>

          <View style={styles.skeletonBanner} />

          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonCard}>
            {[0, 1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonRow}>
                <View style={styles.skeletonRowIcon} />
                <View style={styles.skeletonRowContent}>
                  <View style={styles.skeletonRowLine} />
                  <View style={styles.skeletonRowSubLine} />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonCard}>
            {[0, 1, 2].map((item) => (
              <View key={item} style={styles.skeletonRow}>
                <View style={styles.skeletonRowIcon} />
                <View style={styles.skeletonRowContent}>
                  <View style={styles.skeletonRowLine} />
                  <View style={styles.skeletonRowSubLine} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function MeScreen() {
  const { signOut, user: authUser } = useAuth();
  const { showToast } = useToastContext();

  const { profile, isInitialProfileLoading, isFetching, refetch, error } =
    useMyProfileQuery();

  const banksQuery = useBanksQuery();
  const notificationsQuery = useMobileNotificationSettingsQuery();

  const updateMyProfileMutation = useUpdateMyProfileMutation();
  const selectRoleMutation = useSelectRoleMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();
  const updateNotificationSettingsMutation =
    useUpdateNotificationSettingsMutation();
  const generateAnonymousUsernameMutation =
    useGenerateAnonymousUsernameMutation();
  const updateAnonymousIdentityMutation = useUpdateAnonymousIdentityMutation();
  const submitObserverRoleMutation = useSubmitObserverRoleMutation();
  const submitFeedbackMutation = useSubmitFeedbackMutation();

  const scrollViewRef = useRef<ScrollView>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    birthday: EMPTY_BIRTHDAY,
    gender: "",
    avatarUri: null,
    avatarChanged: false,
  });

  const [securityForm, setSecurityForm] = useState<SecurityFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [pollingUnitForm, setPollingUnitForm] = useState<PollingUnitFormState>({
    state: "",
    lga: "",
    ward: "",
    pollingUnit: "",
  });

  const [savedPollingUnitOverride, setSavedPollingUnitOverride] =
    useState<PollingUnitFormState | null>(null);

  const [pollingUnitSaving, setPollingUnitSaving] = useState(false);

  const [notificationSettings, setNotificationSettings] =
    useState<MobileNotificationSettingsState>(DEFAULT_NOTIFICATION_SETTINGS);

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

  const [feedbackForm, setFeedbackForm] =
    useState<FeedbackFormState>(DEFAULT_FEEDBACK_FORM);

  const [pvcSubmitLocked, setPvcSubmitLocked] = useState(false);
  const [draftPublicName, setDraftPublicName] = useState("");

  const profileSheetRef = useRef<BottomSheetModal>(null);
  const securitySheetRef = useRef<BottomSheetModal>(null);
  const pollingUnitSheetRef = useRef<BottomSheetModal>(null);
  const notificationSheetRef = useRef<BottomSheetModal>(null);
  const observerSheetRef = useRef<BottomSheetModal>(null);
  const pvcSheetRef = useRef<BottomSheetModal>(null);
  const bankSheetRef = useRef<BottomSheetModal>(null);
  const feedbackSheetRef = useRef<BottomSheetModal>(null);

  const birthdaySheetRef = useRef<BottomSheetModal>(null);
  const genderSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (!profile) return;

    setProfileForm(buildProfileForm(profile));
    setPollingUnitForm(buildPollingUnitForm(profile));
    setSavedPollingUnitOverride(null);
    setObserverForm(buildObserverForm(profile));
    setBankForm(buildBankForm(profile));
    setDraftPublicName(profile.anonymousUsername ?? "");
    setNotificationSettings((previous) =>
      buildNotificationSettings(profile, notificationsQuery.data ?? previous)
    );
  }, [notificationsQuery.data, profile]);

  const profileWithDraftPublicName = useMemo(() => {
    if (!profile) return null;

    return applyAnonymousDraft(profile, draftPublicName);
  }, [draftPublicName, profile]);

  const displayProfile = useMemo(() => {
    if (!profileWithDraftPublicName) return null;

    return applyPollingUnitOverride(
      profileWithDraftPublicName,
      savedPollingUnitOverride
    );
  }, [profileWithDraftPublicName, savedPollingUnitOverride]);

  const meUser = useMemo(() => {
    if (!displayProfile) return null;

    return buildMeUser(displayProfile);
  }, [displayProfile]);

  const banner = useMemo(() => {
    if (!meUser) return null;

    return getMeBanner(meUser);
  }, [meUser]);

  const accountItems = useMemo(() => {
    if (!meUser) return [];

    return getMeAccountItems(meUser);
  }, [meUser]);

  const otherItems = useMemo(() => getMeOtherItems(), []);

  const statesQuery = useStatesQuery();
  const lgasQuery = useLocalGovernmentsQuery(pollingUnitForm.state);
  const wardsQuery = useWardsQuery(pollingUnitForm.state, pollingUnitForm.lga);
  const pollingUnitsQuery = usePollingUnitsQuery(
    pollingUnitForm.state,
    pollingUnitForm.lga,
    pollingUnitForm.ward
  );

  const stateOptions = useMemo(
    () => statesQuery.data ?? [],
    [statesQuery.data]
  );

  const lgaOptions = useMemo(() => lgasQuery.data ?? [], [lgasQuery.data]);

  const wardOptions = useMemo(() => wardsQuery.data ?? [], [wardsQuery.data]);

  const pollingUnitOptions = useMemo(
    () => pollingUnitsQuery.data ?? [],
    [pollingUnitsQuery.data]
  );

  const bankOptions = useMemo(() => {
    const names = banksQuery.data?.map((bank) => bank.name) ?? [];

    if (names.length > 0) return names;

    return profile?.bankName ? [profile.bankName] : [];
  }, [banksQuery.data, profile?.bankName]);

  const isElectionLive = false;

  const isPvcSubmitting =
    pvcSubmitLocked ||
    selectRoleMutation.isPending ||
    submitObserverRoleMutation.isPending;

  const isMutating =
    updateMyProfileMutation.isPending ||
    pollingUnitSaving ||
    updatePasswordMutation.isPending ||
    updateNotificationSettingsMutation.isPending ||
    generateAnonymousUsernameMutation.isPending ||
    updateAnonymousIdentityMutation.isPending ||
    submitFeedbackMutation.isPending ||
    isPvcSubmitting;

  const handleGenerateAnonymousUsername = async () => {
    try {
      const response = await generateAnonymousUsernameMutation.mutateAsync();

      setDraftPublicName(response.anonymousUsername);

      showToast({
        message: "Anonymous name generated. Tap Save Changes to apply it.",
        type: "success",
      });
    } catch (mutationError) {
      showToast({
        message: getErrorMessage(
          mutationError,
          "Unable to generate anonymous username."
        ),
        type: "error",
      });
    }
  };

  const handleUpdateProfile = async () => {
    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const gender = profileForm.gender.trim();
    const dateOfBirth = toApiDateOfBirth(profileForm.birthday);

    if (!firstName || !lastName) {
      showToast({
        message: "Please enter your first and last name.",
        type: "error",
      });
      return;
    }

    if (!gender) {
      showToast({
        message: "Please select your gender.",
        type: "error",
      });
      return;
    }

    if (!dateOfBirth) {
      showToast({
        message: "Please select a valid birthday.",
        type: "error",
      });
      return;
    }

    try {
      await updateMyProfileMutation.mutateAsync({
        firstName,
        lastName,
        gender,
        dateOfBirth,
        profileImageUri:
          profileForm.avatarChanged && profileForm.avatarUri
            ? profileForm.avatarUri
            : null,
      });

      if (draftPublicName.trim()) {
        await updateAnonymousIdentityMutation.mutateAsync({
          enabled: true,
        });
      }

      await refetch();

      profileSheetRef.current?.dismiss();

      showToast({
        message: "Profile updated successfully.",
        type: "success",
      });
    } catch (mutationError) {
      showToast({
        message: getErrorMessage(mutationError, "Unable to update profile."),
        type: "error",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (
      !securityForm.currentPassword ||
      !securityForm.newPassword ||
      !securityForm.confirmPassword
    ) {
      showToast({
        message: "Please fill all password fields.",
        type: "error",
      });
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast({
        message: "Passwords do not match.",
        type: "error",
      });
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
        confirmPassword: securityForm.confirmPassword,
      });

      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      securitySheetRef.current?.dismiss();

      showToast({
        message: "Password updated successfully.",
        type: "success",
      });
    } catch (mutationError) {
      showToast({
        message: getErrorMessage(mutationError, "Unable to update password."),
        type: "error",
      });
    }
  };

  const handleUpdatePollingUnit = async () => {
    if (isElectionLive) {
      showToast({
        message: "Polling unit changes are locked while an election is live.",
        type: "error",
      });
      return;
    }

    if (
      !pollingUnitForm.state.trim() ||
      !pollingUnitForm.lga.trim() ||
      !pollingUnitForm.ward.trim() ||
      !pollingUnitForm.pollingUnit.trim()
    ) {
      showToast({
        message: "Please complete your polling unit details.",
        type: "error",
      });
      return;
    }

    try {
      setPollingUnitSaving(true);

      setSavedPollingUnitOverride({
        state: pollingUnitForm.state.trim(),
        lga: pollingUnitForm.lga.trim(),
        ward: pollingUnitForm.ward.trim(),
        pollingUnit: pollingUnitForm.pollingUnit.trim(),
      });

      pollingUnitSheetRef.current?.dismiss();

      showToast({
        message: "Polling unit details updated.",
        type: "success",
      });
    } finally {
      setPollingUnitSaving(false);
    }
  };

  const handleUpdateNotifications = async () => {
    try {
      const response =
        await updateNotificationSettingsMutation.mutateAsync(
          notificationSettings
        );

      setNotificationSettings(response.settings);
      notificationSheetRef.current?.dismiss();

      showToast({
        message: response.message ?? "Notification settings updated.",
        type: "success",
      });
    } catch (mutationError) {
      showToast({
        message: getErrorMessage(
          mutationError,
          "Unable to update notification settings."
        ),
        type: "error",
      });
    }
  };

  const handleSubmitPvcUpdate = async (frontUri: string, backUri: string) => {
    if (pvcSubmitLocked) return;

    const email = resolveUserEmail(profile?.email, authUser?.email);

    if (!email) {
      showToast({
        message: "Profile email is missing. Please sign in again.",
        type: "error",
      });
      return;
    }

    try {
      setPvcSubmitLocked(true);

      if (profile?.role !== "observer") {
        await selectRoleMutation.mutateAsync({
          email,
          role: "observer",
        });
      }

      const response = await submitObserverRoleMutation.mutateAsync({
        email,
        frontPvcUri: frontUri,
        backPvcUri: backUri,
      });

      showToast({
        message:
          response.message ??
          "PVC submitted successfully, pending admin verification.",
        type: "success",
      });

      await refetch();
    } catch (mutationError) {
      showToast({
        message: getErrorMessage(mutationError, "Unable to submit PVC."),
        type: "error",
      });

      throw mutationError;
    } finally {
      setPvcSubmitLocked(false);
    }
  };

  const handleSubmitFeedback = async () => {
    const title = feedbackForm.title.trim();
    const message = feedbackForm.message.trim();

    if (title.length < 2) {
      showToast({
        message: "Please enter a feedback title.",
        type: "error",
      });
      return;
    }

    if (message.length < 5) {
      showToast({
        message: "Please enter a more detailed feedback message.",
        type: "error",
      });
      return;
    }

    try {
      const response = await submitFeedbackMutation.mutateAsync({
        title,
        message,
      });

      feedbackSheetRef.current?.dismiss();
      setFeedbackForm(DEFAULT_FEEDBACK_FORM);

      showToast({
        message: response.message ?? "Feedback submitted successfully.",
        type: "success",
      });
    } catch (mutationError) {
      showToast({
        message: getErrorMessage(mutationError, "Unable to submit feedback."),
        type: "error",
      });
    }
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
        feedbackSheetRef.current?.present();
        return;
      case "sign-out":
        Alert.alert("Sign Out", "Are you sure you want to log out?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: () => {
              void signOut();
              router.replace(Paths.welcome);
            },
          },
        ]);
        return;
    }
  };

  const handleBannerPress = () => {
    if (profile?.role === "observer") {
      pvcSheetRef.current?.present();
      return;
    }

    observerSheetRef.current?.present();
  };

  if (isInitialProfileLoading) {
    return <MeScreenSkeleton />;
  }

  if (!profile || !displayProfile || !meUser || !banner) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={[styles.screen, styles.emptyState]}>
          <AppText style={styles.emptyTitle}>Profile unavailable</AppText>
          <AppText style={styles.emptyText}>
            We could not load your profile. Check your connection and try again.
          </AppText>

          <AppButton
            title="Retry"
            onPress={() => {
              void refetch();
            }}
          />

          {error ? (
            <AppText style={styles.errorText}>
              {getErrorMessage(error, "Unknown error")}
            </AppText>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

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
            <MeHeader user={meUser} />
          </View>

          <MeProfileCard banner={banner} onPress={handleBannerPress} />

          <View style={styles.sectionBlock}>
            <AppText style={styles.sectionTitle}>MY ACCOUNT</AppText>
            <MeSection items={accountItems} onItemPress={handleItemPress} />
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
          onSave={() => {
            void handleUpdateProfile();
          }}
          birthdaySheetRef={birthdaySheetRef}
          genderSheetRef={genderSheetRef}
          publicName={draftPublicName}
          generatingPublicName={generateAnonymousUsernameMutation.isPending}
          saving={
            updateMyProfileMutation.isPending ||
            updateAnonymousIdentityMutation.isPending
          }
          currentAvatarUri={profile.profileImage?.url ?? null}
          onGeneratePublicName={() => {
            void handleGenerateAnonymousUsername();
          }}
        />

        <SecurityBottomSheet
          ref={securitySheetRef}
          value={securityForm}
          onChange={setSecurityForm}
          onSave={() => {
            void handleUpdatePassword();
          }}
          saving={updatePasswordMutation.isPending}
        />

        <PollingUnitBottomSheet
          ref={pollingUnitSheetRef}
          value={pollingUnitForm}
          onChange={setPollingUnitForm}
          onSave={() => {
            void handleUpdatePollingUnit();
          }}
          stateOptions={stateOptions}
          lgaOptions={lgaOptions}
          wardOptions={wardOptions}
          pollingUnitOptions={pollingUnitOptions}
          saving={pollingUnitSaving}
          isElectionLive={isElectionLive}
        />

        <NotificationAlertBottomSheet
          ref={notificationSheetRef}
          value={notificationSettings}
          onChange={setNotificationSettings}
          onSave={() => {
            void handleUpdateNotifications();
          }}
          saving={updateNotificationSettingsMutation.isPending}
        />

        <ObserverRegistrationBottomSheet
          ref={observerSheetRef}
          value={observerForm}
          onChange={setObserverForm}
          onSubmit={() => {
            observerSheetRef.current?.dismiss();
            pvcSheetRef.current?.present();
          }}
        />

        <PVCVerificationBottomSheet
          ref={pvcSheetRef}
          pvcVerifiedDate={meUser.pvcVerifiedDate}
          saving={isPvcSubmitting}
          onSubmit={handleSubmitPvcUpdate}
        />

        <BankDetailsBottomSheet
          ref={bankSheetRef}
          value={bankForm}
          onChange={setBankForm}
          onSave={() => {
            bankSheetRef.current?.dismiss();
            showToast({
              message: "Bank details update is not available yet.",
              type: "success",
            });
          }}
          bankOptions={bankOptions}
        />

        <FeedbackBottomSheet
          ref={feedbackSheetRef}
          value={feedbackForm}
          onChange={setFeedbackForm}
          onSubmit={() => {
            void handleSubmitFeedback();
          }}
          submitting={submitFeedbackMutation.isPending}
        />

        <AppScreenLoader visible={isMutating || (isFetching && !profile)} />
      </View>
    </SafeAreaView>
  );
}

const skeletonColor = "rgba(17,26,50,0.08)";

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
  emptyState: {
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 14,
  },
  emptyTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.text,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: "#B42318",
    textAlign: "center",
  },
  skeletonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  skeletonAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: skeletonColor,
  },
  skeletonHeaderText: {
    flex: 1,
    gap: 7,
  },
  skeletonLineLarge: {
    width: "72%",
    height: 22,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonLineMedium: {
    width: "54%",
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonLineSmall: {
    width: "62%",
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonLineTiny: {
    width: "42%",
    height: 13,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonBanner: {
    height: 78,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.20)",
    backgroundColor: "rgba(255,255,255,0.46)",
    marginBottom: 18,
  },
  skeletonSectionTitle: {
    width: 112,
    height: 14,
    borderRadius: 999,
    backgroundColor: skeletonColor,
    marginTop: 8,
    marginBottom: 12,
  },
  skeletonCard: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.58)",
    borderWidth: 1,
    borderColor: "rgba(17,26,50,0.07)",
    overflow: "hidden",
    marginBottom: 14,
  },
  skeletonRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(17,26,50,0.06)",
  },
  skeletonRowIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: skeletonColor,
  },
  skeletonRowContent: {
    flex: 1,
    gap: 7,
  },
  skeletonRowLine: {
    width: "58%",
    height: 15,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
  skeletonRowSubLine: {
    width: "74%",
    height: 12,
    borderRadius: 999,
    backgroundColor: skeletonColor,
  },
});