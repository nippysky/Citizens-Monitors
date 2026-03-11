import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";

import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import OnboardingReady from "@/components/onboarding/OnboardingReady";
import OnboardingStepFour from "@/components/onboarding/OnboardingStepFour";
import OnboardingStepOne from "@/components/onboarding/OnboardingStepOne";
import OnboardingStepThree from "@/components/onboarding/OnboardingStepThree";
import OnboardingStepTwo from "@/components/onboarding/OnboardingStepTwo";
import AppButton from "@/components/ui/AppButton";
import AppPageShell from "@/components/ui/AppPageShell";
import { CitizenType, OnboardingDraft, StepFourForm, StepOneForm, StepThreeForm } from "@/types/onboarding";

export default function OnboardingIndexScreen() {
  useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<number>(1);

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

  const canContinueStep2 = useMemo((): boolean => {
    return draft.citizenType !== "";
  }, [draft.citizenType]);

  const canContinueStep3 = useMemo((): boolean => {
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

  const canContinueStep4 = useMemo((): boolean => {
    const { stepFour } = draft;

    return (
      stepFour.pollingState.trim().length > 0 &&
      stepFour.localGovernmentArea.trim().length > 0 &&
      stepFour.ward.trim().length > 0 &&
      stepFour.pollingUnit.trim().length > 0
    );
  }, [draft]);

  const handleBack = (): void => {
    if (step === 1) {
      router.back();
      return;
    }

    if (step === 5) {
      setStep(4);
      return;
    }

    setStep((prevStep: number) => Math.max(1, prevStep - 1));
  };

  const handleContinue = (): void => {
    if (step === 1 && canContinueStep1) {
      setStep(2);
      return;
    }

    if (step === 2 && canContinueStep2) {
      setStep(3);
      return;
    }

    if (step === 3 && canContinueStep3) {
      setStep(4);
      return;
    }

    if (step === 4 && canContinueStep4) {
      setStep(5);
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

  if (step === 5) {
    return <OnboardingReady draft={draft} />;
  }

  const continueLabel = step === 4 ? "Finish Setup" : "Save & Continue";

  const continueDisabled =
    (step === 1 && !canContinueStep1) ||
    (step === 2 && !canContinueStep2) ||
    (step === 3 && !canContinueStep3) ||
    (step === 4 && !canContinueStep4);

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
          <OnboardingStepTwo
            value={draft.citizenType}
            onChange={handleCitizenTypeChange}
          />
        );

      case 3:
        return (
          <OnboardingStepThree
            citizenType={draft.citizenType}
            value={draft.stepThree}
            onChange={handleStepThreeChange}
          />
        );

      case 4:
        return (
          <OnboardingStepFour
            value={draft.stepFour}
            onChange={handleStepFourChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AppPageShell
      key={step}
      footer={
        <AppButton
          title={continueLabel}
          onPress={handleContinue}
          disabled={continueDisabled}
        />
      }
    >
      <OnboardingHeader
        step={step}
        total={4}
        leading={step === 1 ? "logo" : "back"}
        onBack={handleBack}
        onHelp={() => {}}
      />

      {renderStep()}
    </AppPageShell>
  );
}