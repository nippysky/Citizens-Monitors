import { ReactNode, useCallback, useEffect, useRef } from "react";
import { View } from "react-native";

import { useTour } from "@/context/TourContext";

type Props = {
  id: string;
  children: ReactNode;
};

export default function TourTarget({ id, children }: Props) {
  const ref = useRef<View>(null);
  const { registerTarget, unregisterTarget, isActive, currentStep } = useTour();

  const measure = useCallback(() => {
    requestAnimationFrame(() => {
      ref.current?.measureInWindow((x, y, width, height) => {
        if (width === 0 || height === 0) return;
        registerTarget(id, { x, y, width, height });
      });
    });
  }, [id, registerTarget]);

  // Re-measure whenever this target becomes the current step's target
  useEffect(() => {
    if (isActive && currentStep?.targetId === id) {
      const t = setTimeout(measure, 120);
      return () => clearTimeout(t);
    }
  }, [isActive, currentStep?.targetId, id, measure]);

  // Clean up registry on unmount
  useEffect(() => {
    return () => unregisterTarget(id);
  }, [id, unregisterTarget]);

  return (
    <View ref={ref} collapsable={false} onLayout={measure}>
      {children}
    </View>
  );
}