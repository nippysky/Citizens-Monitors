import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";

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

export default function OnboardingIndexScreen() {
  useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<number>(1);
  const [showReady, setShowReady] = useState<boolean>(false);

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

    if (isPublicViewer) {
      return baseValid;
    }

    return (
      baseValid &&
      stepThree.monitoringExperience !== "" &&
      stepThree.willingToTestify !== ""
    );
  }, [draft]);

  const handleBack = (): void => {
    if (showReady) {
      setShowReady(false);

      if (isObserver) {
        setStep(5);
      } else {
        setStep(4);
      }
      return;
    }

    if (step === 1) {
      router.back();
      return;
    }

    setStep((prevStep: number) => Math.max(1, prevStep - 1));
  };

  const handleContinue = (): void => {
    if (step === 1 && canContinueStep1) {
      setStep(2);
      return;
    }

    if (step === 2 && canContinuePollingUnit) {
      setStep(3);
      return;
    }

    if (step === 3 && canContinueCitizenType) {
      setStep(4);
      return;
    }

    if (step === 4 && canContinueCoverage) {
      if (isObserver) {
        setStep(5);
        return;
      }

      setShowReady(true);
    }
  };

  const handleStepOneChange = (value: StepOneForm): void => {
    setDraft((prevDraft: OnboardingDraft) => ({
      ...prevDraft,
      stepOne: value,
    }));
  };

  const handleCitizenTypeChange = (value: CitizenType): void => {
    setDraft((prevDraft: OnboardingDraft) => ({
      ...prevDraft,
      citizenType: value,
    }));
  };

  const handleStepThreeChange = (value: StepThreeForm): void => {
    setDraft((prevDraft: OnboardingDraft) => ({
      ...prevDraft,
      stepThree: value,
    }));
  };

  const handleStepFourChange = (value: StepFourForm): void => {
    setDraft((prevDraft: OnboardingDraft) => ({
      ...prevDraft,
      stepFour: value,
    }));
  };

  const handleVerifyComplete = (): void => {
    setShowReady(true);
  };

  const handleVerifySkip = (): void => {
    setShowReady(true);
  };

  if (showReady) {
    return <OnboardingReady draft={draft} />;
  }

  const continueLabel = step === 4 ? "Save & Continue" : "Save & Continue";

  const continueDisabled =
    (step === 1 && !canContinueStep1) ||
    (step === 2 && !canContinuePollingUnit) ||
    (step === 3 && !canContinueCitizenType) ||
    (step === 4 && !canContinueCoverage);

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

  const shouldShowFooterButton = step !== 5;

  return (
    <AppPageShell
      key={`${step}-${draft.citizenType}`}
      footer={
        shouldShowFooterButton ? (
          <AppButton
            title={continueLabel}
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

      {renderStep()}
    </AppPageShell>
  );
}