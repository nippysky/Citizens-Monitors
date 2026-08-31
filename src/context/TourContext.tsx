import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from "expo-router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ScrollView } from "react-native";

import { TOUR_STEPS, TourStep } from "@/components/tour/tourSteps";
import { isTabPathname } from "@/constants/tabRoutes";

const TOUR_STORAGE_KEY = "@citizen-monitors/tour-seen-v1";

export type TourTargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TourContextValue = {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  isLastStep: boolean;
  totalSteps: number;
  targets: Record<string, TourTargetRect>;

  startTour: () => void;
  endTour: () => Promise<void>;
  next: () => void;
  prev: () => void;
  skip: () => void;
  resetTour: () => Promise<void>;

  registerTarget: (id: string, rect: TourTargetRect) => void;
  unregisterTarget: (id: string) => void;
};

const TourContext = createContext<TourContextValue | null>(null);

function tabFromRoute(route: string): string {
  return route.split("/").filter(Boolean).pop() ?? "";
}

export function TourProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targets, setTargets] = useState<Record<string, TourTargetRect>>({});

  const hasCheckedStorageRef = useRef(false);
  const isEndingTourRef = useRef(false);
  const currentStepIndexRef = useRef(0);
  const autoStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  const clearAutoStartTimer = useCallback(() => {
    if (autoStartTimerRef.current) {
      clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }
  }, []);

  // ── Auto-start the tour once after onboarding

  useEffect(() => {
    let cancelled = false;

    if (hasCheckedStorageRef.current) return;
    if (!pathname.endsWith("/home")) return;

    hasCheckedStorageRef.current = true;

    void AsyncStorage.getItem(TOUR_STORAGE_KEY)
      .then((value) => {
        if (cancelled) return;
        if (value === "true") return;

        autoStartTimerRef.current = setTimeout(() => {
          if (cancelled) return;
          if (isEndingTourRef.current) return;

          setCurrentStepIndex(0);
          setIsActive(true);
        }, 900);
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn("[TourProvider] failed to read tour state:", error);
        }
      });

    return () => {
      cancelled = true;
      clearAutoStartTimer();
    };
  }, [clearAutoStartTimer, pathname]);

  const currentStep = useMemo<TourStep | null>(
    () => (isActive ? TOUR_STEPS[currentStepIndex] ?? null : null),
    [isActive, currentStepIndex]
  );

  const isLastStep = currentStepIndex >= TOUR_STEPS.length - 1;

  const registerTarget = useCallback((id: string, rect: TourTargetRect) => {
    setTargets((prev) => {
      const existing = prev[id];

      if (
        existing &&
        existing.x === rect.x &&
        existing.y === rect.y &&
        existing.width === rect.width &&
        existing.height === rect.height
      ) {
        return prev;
      }

      return { ...prev, [id]: rect };
    });
  }, []);

  const unregisterTarget = useCallback((id: string) => {
    setTargets((prev) => {
      if (!prev[id]) return prev;

      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // ── Cross-tab navigation

  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Only redirect the user if they are currently inside the tabs layout.
    // If they have navigated to a non-tab screen (e.g. /notifications,
    // /help-support) we must NOT force them back — that's what was causing
    // the notification bell to immediately bounce back to home.
    // NOTE: usePathname() never includes group segments like "(tabs)", so we
    // must match against the flat tab pathnames.
    if (!isTabPathname(pathname)) return;

    const targetTab = tabFromRoute(currentStep.route);
    const currentTab = tabFromRoute(pathname);

    if (targetTab && targetTab !== currentTab) {
      router.navigate(currentStep.route as never);
    }
  }, [isActive, currentStep, pathname]);

  const startTour = useCallback(() => {
    clearAutoStartTimer();
    isEndingTourRef.current = false;

    setTargets({});
    setCurrentStepIndex(0);
    setIsActive(true);
  }, [clearAutoStartTimer]);

  const endTour = useCallback(async () => {
    if (isEndingTourRef.current) return;

    isEndingTourRef.current = true;
    clearAutoStartTimer();
    hasCheckedStorageRef.current = true;

    // Close the overlay immediately so it cannot keep blocking tab touches.
    setIsActive(false);
    setCurrentStepIndex(0);
    setTargets({});

    try {
      await AsyncStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch (error) {
      if (__DEV__) {
        console.warn("[TourProvider] failed to save tour state:", error);
      }
    } finally {
      isEndingTourRef.current = false;
    }
  }, [clearAutoStartTimer]);

  const next = useCallback(() => {
    if (isEndingTourRef.current) return;

    const currentIndex = currentStepIndexRef.current;
    const nextIndex = currentIndex + 1;

    if (nextIndex >= TOUR_STEPS.length) {
      void endTour();
      return;
    }

    currentStepIndexRef.current = nextIndex;
    setCurrentStepIndex(nextIndex);
  }, [endTour]);

  const prev = useCallback(() => {
    if (isEndingTourRef.current) return;

    setCurrentStepIndex((current) => {
      const previousIndex = Math.max(0, current - 1);
      currentStepIndexRef.current = previousIndex;
      return previousIndex;
    });
  }, []);

  const skip = useCallback(() => {
    void endTour();
  }, [endTour]);

  const resetTour = useCallback(async () => {
    clearAutoStartTimer();

    await AsyncStorage.removeItem(TOUR_STORAGE_KEY);

    hasCheckedStorageRef.current = false;
    isEndingTourRef.current = false;
    currentStepIndexRef.current = 0;

    setTargets({});
    setIsActive(false);
    setCurrentStepIndex(0);
  }, [clearAutoStartTimer]);

  const value = useMemo<TourContextValue>(
    () => ({
      isActive,
      currentStepIndex,
      currentStep,
      isLastStep,
      totalSteps: TOUR_STEPS.length,
      targets,
      startTour,
      endTour,
      next,
      prev,
      skip,
      resetTour,
      registerTarget,
      unregisterTarget,
    }),
    [
      isActive,
      currentStepIndex,
      currentStep,
      isLastStep,
      targets,
      startTour,
      endTour,
      next,
      prev,
      skip,
      resetTour,
      registerTarget,
      unregisterTarget,
    ]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);

  if (!ctx) {
    throw new Error("useTour must be used within TourProvider");
  }

  return ctx;
}

/**
 * Hook for screens with a ScrollView that contains tour targets.
 * When any of the listed `targetIds` becomes the active step, it scrolls
 * the screen back to top so the highlighted target is in view.
 */
export function useTourScrollReset(
  scrollRef: React.RefObject<ScrollView | null>,
  targetIds: string[]
) {
  const { isActive, currentStep } = useTour();

  useEffect(() => {
    if (!isActive || !currentStep) return;
    if (!targetIds.includes(currentStep.targetId)) return;

    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 220);

    return () => clearTimeout(timer);
  }, [isActive, currentStep, targetIds, scrollRef]);
}