import { ReactNode, useCallback, useEffect, useRef } from "react";
import { Dimensions, StyleProp, View, ViewStyle } from "react-native";

import { useTour } from "@/context/TourContext";

type Props = {
  id: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function TourTarget({ id, children, style }: Props) {
  const ref = useRef<View>(null);
  const rafRef = useRef<number | null>(null);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { registerTarget, unregisterTarget, isActive, currentStep } = useTour();

  const clearPending = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const measureNow = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return;
      registerTarget(id, { x, y, width, height });
    });
  }, [id, registerTarget]);

  const scheduleMeasure = useCallback(() => {
    clearPending();

    // InteractionManager is deprecated in RN 0.86 — staggered retries after a
    // frame cover the same "wait for transitions to settle" purpose.
    rafRef.current = requestAnimationFrame(() => {
      measureNow();

      timeoutRefs.current = [
        setTimeout(measureNow, 60),
        setTimeout(measureNow, 140),
        setTimeout(measureNow, 260),
      ];
    });
  }, [clearPending, measureNow]);

  useEffect(() => {
    if (isActive && currentStep?.targetId === id) {
      scheduleMeasure();
    }
  }, [isActive, currentStep?.targetId, id, scheduleMeasure]);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", () => {
      if (isActive && currentStep?.targetId === id) {
        scheduleMeasure();
      }
    });

    return () => {
      sub.remove();
    };
  }, [currentStep?.targetId, id, isActive, scheduleMeasure]);

  useEffect(() => {
    return () => {
      clearPending();
      unregisterTarget(id);
    };
  }, [clearPending, id, unregisterTarget]);

  return (
    <View ref={ref} collapsable={false} onLayout={scheduleMeasure} style={style}>
      {children}
    </View>
  );
}