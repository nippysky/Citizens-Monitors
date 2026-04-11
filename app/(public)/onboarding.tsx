import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import Animated, {
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import OnboardingReady from "@/components/onboarding/OnboardingReady";
import OnboardingStepFour from "@/components/onboarding/OnboardingStepFour";
import OnboardingStepOne from "@/components/onboarding/OnboardingStepOne";
import OnboardingStepThree from "@/components/onboarding/OnboardingStepThree";
import OnboardingStepTwo from "@/components/onboarding/OnboardingStepTwo";
import OnboardingVerifyIdetity from "@/components/onboarding/OnboardingVerifyIdetity";
import AppButton from "@/components/ui/AppButton";
import AppPageShell from "@/components/ui/AppPageShell";
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

export default function OnboardingIndexScreen() {
  useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<number>(1);
  const [showReady, setShowReady] = useState<boolean>(false);

  const directionRef = useRef<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState<{
    step: number;
    dir: "forward" | "back";
  }>({
    step: 1,
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
  const totalVisibleSteps = isObserver ? 5 : 4;

  const canContinueStep1 = useMemo((): boolean => {
    const { stepOne } = draft;
    return (
      stepOne.firstName.trim().length > 0 &&
      stepOne.lastName.trim().length > 0 &&
      stepOne.birthday.trim().length > 0 &&
      stepOne.gender.trim().length > 0 &&
      stepOne.nationality.trim().length > 0 &&
      stepOne.cityCountry.trim().length > 0
    );
  }, [draft]);

  const canContinuePollingUnit = useMemo((): boolean => {
    const { stepFour } = draft;
    return (
      stepFour.pollingState.trim().length > 0 &&
      stepFour.localGovernmentArea.trim().length > 0 &&
      stepFour.ward.trim().length > 0 &&
      stepFour.pollingUnit.trim().length > 0
    );
  }, [draft]);

  const canContinueCitizenType = useMemo((): boolean => {
    return draft.citizenType !== "";
  }, [draft.citizenType]);

  const canContinueCoverage = useMemo((): boolean => {
    const { citizenType, stepThree } = draft;
    const isPublicViewer = citizenType === "public-viewer";
    const baseValid =
      stepThree.registeredVoter !== "" &&
      stepThree.firstElection !== "" &&
      stepThree.interestedInSurveys !== "" &&
      stepThree.joinReasons.length > 0;

    if (isPublicViewer) return baseValid;
    return (
      baseValid &&
      stepThree.monitoringExperience !== "" &&
      stepThree.willingToTestify !== ""
    );
  }, [draft]);

  // ─── Navigation ────────────────────────────────────────────────────────────
  const goToStep = (nextStep: number, dir: "forward" | "back") => {
    directionRef.current = dir;
    setStep(nextStep);
    setAnimKey({ step: nextStep, dir });
  };

  const handleBack = (): void => {
    if (showReady) {
      setShowReady(false);
      goToStep(isObserver ? 5 : 4, "back");
      return;
    }
    if (step === 1) {
      router.back();
      return;
    }
    goToStep(Math.max(1, step - 1), "back");
  };

  const handleContinue = (): void => {
    if (step === 1 && canContinueStep1) {
      goToStep(2, "forward");
      return;
    }
    if (step === 2 && canContinuePollingUnit) {
      goToStep(3, "forward");
      return;
    }
    if (step === 3 && canContinueCitizenType) {
      goToStep(4, "forward");
      return;
    }
    if (step === 4 && canContinueCoverage) {
      if (isObserver) {
        goToStep(5, "forward");
        return;
      }
      setShowReady(true);
    }
  };

  const handleStepOneChange = (v: StepOneForm) =>
    setDraft((d) => ({ ...d, stepOne: v }));
  const handleCitizenTypeChange = (v: CitizenType) =>
    setDraft((d) => ({ ...d, citizenType: v }));
  const handleStepThreeChange = (v: StepThreeForm) =>
    setDraft((d) => ({ ...d, stepThree: v }));
  const handleStepFourChange = (v: StepFourForm) =>
    setDraft((d) => ({ ...d, stepFour: v }));
  const handleVerifyComplete = () => setShowReady(true);
  const handleVerifySkip = () => setShowReady(true);

  // ─── Ready screen ──────────────────────────────────────────────────────────
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

  const continueDisabled =
    (step === 1 && !canContinueStep1) ||
    (step === 2 && !canContinuePollingUnit) ||
    (step === 3 && !canContinueCitizenType) ||
    (step === 4 && !canContinueCoverage);

  const shouldShowFooterButton = step !== 5;

  const isForward = animKey.dir === "forward";

  const enteringAnimation = FadeIn.duration(DURATION).withInitialValues({
    opacity: 0,
    transform: [{ translateX: isForward ? OFFSET : -OFFSET }],
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <OnboardingStepOne
            value={draft.stepOne}
            onChange={handleStepOneChange}
          />
        );
      case 2:
        return (
          <OnboardingStepFour
            value={draft.stepFour}
            onChange={handleStepFourChange}
          />
        );
      case 3:
        return (
          <OnboardingStepTwo
            value={draft.citizenType}
            onChange={handleCitizenTypeChange}
          />
        );
      case 4:
        return (
          <OnboardingStepThree
            citizenType={draft.citizenType}
            value={draft.stepThree}
            onChange={handleStepThreeChange}
          />
        );
      case 5:
        return (
          <OnboardingVerifyIdetity
            onComplete={handleVerifyComplete}
            onSkip={handleVerifySkip}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppPageShell
      scrollKey={`step-${step}`}
      footer={
        shouldShowFooterButton ? (
          <AppButton
            title="Save & Continue"
            onPress={handleContinue}
            disabled={continueDisabled}
          />
        ) : undefined
      }
    >
      <OnboardingHeader
        step={step}
        total={totalVisibleSteps}
        leading={step === 1 ? "logo" : "back"}
        onBack={handleBack}
        onHelp={() => {}}
      />

      <Animated.View
        key={`step-${animKey.step}-${animKey.dir}`}
        entering={enteringAnimation}
        exiting={FadeOut.duration(EXIT_DURATION)}
        style={{ flex: 1 }}
        collapsable={false}
      >
        {renderStep()}
      </Animated.View>
    </AppPageShell>
  );
}