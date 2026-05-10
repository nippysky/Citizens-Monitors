import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import OnboardingReady from "@/components/onboarding/OnboardingReady";
import OnboardingStepFourVerifyIdentity from "@/components/onboarding/OnboardingStepFourVerifyIdentity";
import OnboardingStepOnePersonal from "@/components/onboarding/OnboardingStepOnePersonal";
import OnboardingStepOnePollingUnit from "@/components/onboarding/OnboardingStepOnePollingUnit";
import OnboardingStepThreeCitizenType from "@/components/onboarding/OnboardingStepThreeCitizenType";
import OnboardingStepTwoCoverage from "@/components/onboarding/OnboardingStepTwoCoverage";
import AppButton from "@/components/ui/AppButton";
import AppPageShell from "@/components/ui/AppPageShell";
import { Paths } from "@/constants/paths";
import { useAuth } from "@/context/AuthContext";
import { useAppToast } from "@/hooks/useAppToast";
import { useSelectRoleMutation } from "@/hooks/api/useSelectRoleMutation";
import { useSubmitDetailsMutation } from "@/hooks/api/useSubmitDetailsMutation";
import { useSubmitObserverRoleMutation } from "@/hooks/api/useSubmitObserverRoleMutation";
import { mapMobileUserToAuthUser } from "@/lib/auth/mapMobileUserToAuthUser";
import {
  buildSubmitDetailsFingerprint,
  buildSubmitDetailsPayload,
} from "@/lib/onboarding/onboardingPayload";
import {
  CitizenType,
  OnboardingDraft,
  StepFourForm,
  StepOneForm,
  StepThreeForm,
} from "@/types/onboarding";

const DURATION = 260;
const EXIT_DURATION = 160;
const OFFSET = 18;

type ScreenKey = 1 | 2 | 3 | 4 | 5;

function getProgressStep(screen: ScreenKey): number {
  switch (screen) {
    case 1:
    case 2:
      return 1;
    case 3:
      return 2;
    case 4:
      return 3;
    case 5:
      return 4;
    default:
      return 1;
  }
}

function isFinalRole(role: CitizenType): role is "volunteer" | "public-viewer" {
  return role === "volunteer" || role === "public-viewer";
}

export default function OnboardingIndexScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email : "";

  const { showToast } = useAppToast();
  const { completeOnboarding } = useAuth();

  const submitDetailsMutation = useSubmitDetailsMutation();
  const selectRoleMutation = useSelectRoleMutation();
  const submitObserverRoleMutation = useSubmitObserverRoleMutation();

  const [screen, setScreen] = useState<ScreenKey>(1);
  const [showReady, setShowReady] = useState(false);
  const [observerSlotTaken, setObserverSlotTaken] = useState(false);
  const [lastSubmittedDetailsFingerprint, setLastSubmittedDetailsFingerprint] =
    useState<string | null>(null);

  const directionRef = useRef<"forward" | "back">("forward");

  const [animKey, setAnimKey] = useState<{
    screen: ScreenKey;
    dir: "forward" | "back";
  }>({
    screen: 1,
    dir: "forward",
  });

  const [draft, setDraft] = useState<OnboardingDraft>({
    stepOne: {
      firstName: "",
      lastName: "",
      birthday: "",
      gender: "",
      nationality: "",
      cityCountry: "",
    },
    citizenType: "",
    stepThree: {
      registeredVoter: "",
      firstElection: "",
      monitoringExperience: "",
      partyAffiliation: false,
      partyName: "",
      willingToTestify: "",
      interestedInSurveys: "",
      joinReasons: [],
    },
    stepFour: {
      pollingState: "",
      localGovernmentArea: "",
      ward: "",
      pollingUnit: "",
    },
  });

  const isObserver = draft.citizenType === "observer";
  const progressStep = getProgressStep(screen);
  const progressTotal = 4;

  const isBusy =
    submitDetailsMutation.isPending ||
    selectRoleMutation.isPending ||
    submitObserverRoleMutation.isPending;

  const currentDetailsFingerprint = useMemo(() => {
    if (!email) return "";
    return buildSubmitDetailsFingerprint(email, draft);
  }, [email, draft]);

  const canContinuePersonal = useMemo(() => {
    const { stepOne } = draft;

    return (
      stepOne.firstName.trim().length > 0 &&
      stepOne.lastName.trim().length > 0 &&
      stepOne.birthday.trim().length > 0 &&
      stepOne.gender.trim().length > 0 &&
      stepOne.nationality.trim().length > 0
    );
  }, [draft]);

  const canContinuePollingUnit = useMemo(() => {
    const { stepFour } = draft;

    return (
      stepFour.pollingState.trim().length > 0 &&
      stepFour.localGovernmentArea.trim().length > 0 &&
      stepFour.ward.trim().length > 0 &&
      stepFour.pollingUnit.trim().length > 0
    );
  }, [draft]);

  const canContinueCoverage = useMemo(() => {
    const { stepThree } = draft;

    return (
      stepThree.registeredVoter !== "" &&
      stepThree.willingToTestify !== "" &&
      stepThree.interestedInSurveys !== "" &&
      stepThree.joinReasons.length > 0
    );
  }, [draft]);

  const canContinueCitizenType = useMemo(() => {
    if (draft.citizenType === "observer" && observerSlotTaken) {
      return false;
    }

    return draft.citizenType !== "";
  }, [draft.citizenType, observerSlotTaken]);

  const continueDisabled =
    isBusy ||
    (screen === 1 && !canContinuePersonal) ||
    (screen === 2 && !canContinuePollingUnit) ||
    (screen === 3 && !canContinueCoverage) ||
    (screen === 4 && !canContinueCitizenType);

  const shouldShowFooterButton = screen !== 5;
  const isForward = animKey.dir === "forward";

  const enteringAnimation = FadeIn.duration(DURATION).withInitialValues({
    opacity: 0,
    transform: [{ translateX: isForward ? OFFSET : -OFFSET }],
  });

  const goToScreen = (nextScreen: ScreenKey, dir: "forward" | "back") => {
    directionRef.current = dir;
    setScreen(nextScreen);
    setAnimKey({ screen: nextScreen, dir });
  };

  const requireEmailOrRestart = (): boolean => {
    if (email) return true;

    showToast({
      type: "error",
      message: "Email address is missing. Please sign up again.",
    });

    router.replace(Paths.signUp);
    return false;
  };

  const handleBack = (): void => {
    if (isBusy) return;

    if (showReady) {
      setShowReady(false);
      goToScreen(isObserver ? 5 : 4, "back");
      return;
    }

    if (screen === 1) {
      router.back();
      return;
    }

    goToScreen((screen - 1) as ScreenKey, "back");
  };

  const submitDetailsAndContinue = async (): Promise<void> => {
    if (!requireEmailOrRestart()) return;

    try {
      if (lastSubmittedDetailsFingerprint !== currentDetailsFingerprint) {
        const response = await submitDetailsMutation.mutateAsync(
          buildSubmitDetailsPayload(email, draft)
        );

        const slotTaken = Boolean(response.isObserverInPollingUnit);

        setObserverSlotTaken(slotTaken);
        setLastSubmittedDetailsFingerprint(currentDetailsFingerprint);

        if (slotTaken && draft.citizenType === "observer") {
          setDraft((prev) => ({
            ...prev,
            citizenType: "",
          }));
        }

        showToast({
          type: "success",
          message:
            response.message ??
            "Details submitted successfully. You can now select your role.",
        });
      }

      goToScreen(4, "forward");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit your details.";

      showToast({
        type: "error",
        message,
      });

      console.log("Submit details error:", error);
    }
  };

  const submitSelectedRole = async (): Promise<void> => {
    if (!requireEmailOrRestart()) return;
    if (!draft.citizenType) return;

    try {
      const response = await selectRoleMutation.mutateAsync({
        email,
        role: draft.citizenType,
      });

      showToast({
        type: "success",
        message: response.message,
      });

      if (draft.citizenType === "observer") {
        goToScreen(5, "forward");
        return;
      }

      if (isFinalRole(draft.citizenType)) {
        if (!response.token) {
          throw new Error("Registration completed but no session token was returned.");
        }

        await completeOnboarding(mapMobileUserToAuthUser(response.user, email), {
          token: response.token,
        });

        setShowReady(true);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to select role.";

      showToast({
        type: "error",
        message,
      });

      console.log("Select role error:", error);
    }
  };

  const handleContinue = async (): Promise<void> => {
    if (isBusy) return;

    if (screen === 1 && canContinuePersonal) {
      goToScreen(2, "forward");
      return;
    }

    if (screen === 2 && canContinuePollingUnit) {
      goToScreen(3, "forward");
      return;
    }

    if (screen === 3 && canContinueCoverage) {
      await submitDetailsAndContinue();
      return;
    }

    if (screen === 4 && canContinueCitizenType) {
      await submitSelectedRole();
    }
  };

  const handleStepOneChange = (value: StepOneForm) => {
    setLastSubmittedDetailsFingerprint(null);
    setDraft((prev) => ({ ...prev, stepOne: value }));
  };

  const handleStepFourChange = (value: StepFourForm) => {
    setLastSubmittedDetailsFingerprint(null);
    setObserverSlotTaken(false);

    setDraft((prev) => ({
      ...prev,
      stepFour: value,
      citizenType:
        prev.citizenType === "observer" && observerSlotTaken
          ? ""
          : prev.citizenType,
    }));
  };

  const handleStepThreeChange = (value: StepThreeForm) => {
    setLastSubmittedDetailsFingerprint(null);
    setDraft((prev) => ({ ...prev, stepThree: value }));
  };

  const handleCitizenTypeChange = (value: CitizenType) => {
    setDraft((prev) => ({ ...prev, citizenType: value }));
  };

  const handleVerifyComplete = async (payload: {
    frontPvcUri: string;
    backPvcUri: string;
  }): Promise<void> => {
    if (!requireEmailOrRestart()) return;

    try {
      const response = await submitObserverRoleMutation.mutateAsync({
        email,
        frontPvcUri: payload.frontPvcUri,
        backPvcUri: payload.backPvcUri,
      });

      if (!response.token) {
        throw new Error("Observer details submitted but no session token was returned.");
      }

      showToast({
        type: "success",
        message:
          response.message ??
          "Observer details submitted successfully, pending admin verification.",
      });

      await completeOnboarding(mapMobileUserToAuthUser(response.user, email), {
        token: response.token,
      });

      setShowReady(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit observer details.";

      showToast({
        type: "error",
        message,
      });

      console.log("Submit observer role error:", error);
    }
  };

  const handleVerifySkip = (): void => {
    showToast({
      type: "error",
      message: "Upload your PVC to continue as an observer.",
    });
  };

  const renderScreen = () => {
    switch (screen) {
      case 1:
        return (
          <OnboardingStepOnePersonal
            value={draft.stepOne}
            onChange={handleStepOneChange}
          />
        );

      case 2:
        return (
          <OnboardingStepOnePollingUnit
            value={draft.stepFour}
            onChange={handleStepFourChange}
          />
        );

      case 3:
        return (
          <OnboardingStepTwoCoverage
            value={draft.stepThree}
            onChange={handleStepThreeChange}
          />
        );

      case 4:
        return (
          <OnboardingStepThreeCitizenType
            value={draft.citizenType}
            onChange={handleCitizenTypeChange}
            observerSlotTaken={observerSlotTaken}
          />
        );

      case 5:
        return (
          <OnboardingStepFourVerifyIdentity
            loading={submitObserverRoleMutation.isPending}
            onComplete={(payload) => {
              void handleVerifyComplete(payload);
            }}
            onSkip={handleVerifySkip}
          />
        );

      default:
        return null;
    }
  };

  if (showReady) {
    return (
      <Animated.View
        entering={FadeIn.duration(380)}
        exiting={FadeOut.duration(200)}
        style={{ flex: 1 }}
        collapsable={false}
      >
        <OnboardingReady draft={draft} />
      </Animated.View>
    );
  }

  return (
    <>
      <AppPageShell
        scrollKey={`onboarding-screen-${screen}`}
        footer={
          shouldShowFooterButton ? (
            <AppButton
              title="Save & Continue"
              onPress={() => {
                void handleContinue();
              }}
              disabled={continueDisabled}
              loading={
                submitDetailsMutation.isPending || selectRoleMutation.isPending
              }
            />
          ) : undefined
        }
      >
        <OnboardingHeader
          step={progressStep}
          total={progressTotal}
          leading={screen === 1 ? "logo" : "back"}
          onBack={handleBack}
          onHelp={() => {}}
        />

        <Animated.View
          key={`screen-${animKey.screen}-${animKey.dir}`}
          entering={enteringAnimation}
          exiting={FadeOut.duration(EXIT_DURATION)}
          style={{ flex: 1 }}
          collapsable={false}
        >
          {renderScreen()}
        </Animated.View>
      </AppPageShell>

      <AppScreenLoader visible={isBusy} />
    </>
  );
}