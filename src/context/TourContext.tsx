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

function tabFromRoute(route: string) {
  return route.split("/").filter(Boolean).pop() ?? "";
}

export function TourProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targets, setTargets] = useState<Record<string, TourTargetRect>>({});

  const hasCheckedStorage = useRef(false);

  /* ── Auto-start the tour once after onboarding ── */
  useEffect(() => {
    if (hasCheckedStorage.current) return;
    if (!pathname.endsWith("/home")) return;

    hasCheckedStorage.current = true;

    AsyncStorage.getItem(TOUR_STORAGE_KEY).then((value) => {
      if (value === "true") return;

      setTimeout(() => {
        setCurrentStepIndex(0);
        setIsActive(true);
      }, 900);
    });
  }, [pathname]);

  const currentStep = useMemo<TourStep | null>(
    () => (isActive ? TOUR_STEPS[currentStepIndex] ?? null : null),
    [isActive, currentStepIndex]
  );

  const isLastStep = currentStepIndex >= TOUR_STEPS.length - 1;

  /* ── Target registry ── */
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

  /* ── Cross-tab navigation — handled in an effect (NOT inside state setters) ── */
  useEffect(() => {
    if (!isActive || !currentStep) return;
    const targetTab = tabFromRoute(currentStep.route);
    const currentTab = tabFromRoute(pathname);
    if (targetTab && targetTab !== currentTab) {
      router.navigate(currentStep.route as never);
    }
  }, [isActive, currentStep, pathname]);

  /* ── Actions ── */
  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(async () => {
    setIsActive(false);
    setCurrentStepIndex(0);
    await AsyncStorage.setItem(TOUR_STORAGE_KEY, "true");
  }, []);

  const next = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= TOUR_STEPS.length) {
        // Defer side effect — never call setState/navigate from inside an updater.
        queueMicrotask(() => {
          endTour();
        });
        return prev;
      }
      return nextIndex;
    });
  }, [endTour]);

  const prev = useCallback(() => {
    setCurrentStepIndex((cur) => Math.max(0, cur - 1));
  }, []);

  const skip = useCallback(() => {
    endTour();
  }, [endTour]);

  const resetTour = useCallback(async () => {
    await AsyncStorage.removeItem(TOUR_STORAGE_KEY);
    hasCheckedStorage.current = false;
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

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
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}

/**
 * Hook for screens with a ScrollView that contains tour targets.
 * When any of the listed `targetIds` becomes the active step, it scrolls
 * the screen back to top so the highlighted target is in view.
 *
 * Usage:
 *   const scrollRef = useRef<ScrollView>(null);
 *   useTourScrollReset(scrollRef, ["me.my-account"]);
 *   <ScrollView ref={scrollRef}>...</ScrollView>
 */
export function useTourScrollReset(
  scrollRef: React.RefObject<ScrollView | null>,
  targetIds: string[]
) {
  const { isActive, currentStep } = useTour();

  useEffect(() => {
    if (!isActive || !currentStep) return;
    if (!targetIds.includes(currentStep.targetId)) return;

    // Wait for any tab navigation animation to settle, then snap to top.
    // animated:false avoids visible motion behind the tour overlay
    // and ensures the target is at its final position when measured.
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 220);

    return () => clearTimeout(t);
  }, [isActive, currentStep, targetIds, scrollRef]);
}