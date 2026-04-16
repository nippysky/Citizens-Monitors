import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import OnboardingReady from "@/components/onboarding/OnboardingReady";
import AppButton from "@/components/ui/AppButton";
import AppPageShell from "@/components/ui/AppPageShell";
import {
  CitizenType,
  OnboardingDraft,
  StepFourForm,
  StepOneForm,
  StepThreeForm,
} from "@/types/onboarding";
import OnboardingStepFourVerifyIdentity from "@/components/onboarding/OnboardingStepFourVerifyIdentity";
import OnboardingStepOnePersonal from "@/components/onboarding/OnboardingStepOnePersonal";
import OnboardingStepOnePollingUnit from "@/components/onboarding/OnboardingStepOnePollingUnit";
import OnboardingStepThreeCitizenType from "@/components/onboarding/OnboardingStepThreeCitizenType";
import OnboardingStepTwoCoverage from "@/components/onboarding/OnboardingStepTwoCoverage";

const DURATION = 260;
const EXIT_DURATION = 160;
const OFFSET = 18;

type ScreenKey = 1 | 2 | 3 | 4 | 5;

function buildPollingUnitKey(stepFour: StepFourForm): string {
  return [
    stepFour.pollingState,
    stepFour.localGovernmentArea,
    stepFour.ward,
    stepFour.pollingUnit,
  ]
    .map((item) => item.trim())
    .join("|");
}

const TAKEN_OBSERVER_SLOTS = new Set<string>([
  "Lagos|Ikeja|Ward A|PU 001",
]);

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

export default function OnboardingIndexScreen() {
  useLocalSearchParams<{ email?: string }>();

  const [screen, setScreen] = useState<ScreenKey>(1);
  const [showReady, setShowReady] = useState(false);

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

  const observerSlotTaken = useMemo(() => {
    const key = buildPollingUnitKey(draft.stepFour);
    return TAKEN_OBSERVER_SLOTS.has(key);
  }, [draft.stepFour]);

  const isObserver = draft.citizenType === "observer";
  const progressStep = getProgressStep(screen);
  const progressTotal = 4;

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

  const goToScreen = (nextScreen: ScreenKey, dir: "forward" | "back") => {
    directionRef.current = dir;
    setScreen(nextScreen);
    setAnimKey({ screen: nextScreen, dir });
  };

  const handleBack = (): void => {
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

  const handleContinue = (): void => {
    if (screen === 1 && canContinuePersonal) {
      goToScreen(2, "forward");
      return;
    }

    if (screen === 2 && canContinuePollingUnit) {
      goToScreen(3, "forward");
      return;
    }

    if (screen === 3 && canContinueCoverage) {
      goToScreen(4, "forward");
      return;
    }

    if (screen === 4 && canContinueCitizenType) {
      if (isObserver) {
        goToScreen(5, "forward");
        return;
      }

      setShowReady(true);
    }
  };

  const handleStepOneChange = (value: StepOneForm) =>
    setDraft((prev) => ({ ...prev, stepOne: value }));

  const handleStepFourChange = (value: StepFourForm) =>
    setDraft((prev) => ({
      ...prev,
      stepFour: value,
      citizenType:
        prev.citizenType === "observer" &&
        TAKEN_OBSERVER_SLOTS.has(buildPollingUnitKey(value))
          ? ""
          : prev.citizenType,
    }));

  const handleStepThreeChange = (value: StepThreeForm) =>
    setDraft((prev) => ({ ...prev, stepThree: value }));

  const handleCitizenTypeChange = (value: CitizenType) =>
    setDraft((prev) => ({ ...prev, citizenType: value }));

  const handleVerifyComplete = () => setShowReady(true);
  const handleVerifySkip = () => setShowReady(true);

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
      scrollKey={`onboarding-screen-${screen}`}
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
  );
}