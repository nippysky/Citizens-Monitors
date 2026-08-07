// ─── src/hooks/useAnimatedValue.ts ───────────────────────────────────────────
import { useState } from "react";
import { Animated } from "react-native";

/**
 * A stable `Animated.Value` for the lifetime of a component.
 *
 * Replaces the long-standing `useRef(new Animated.Value(0)).current` idiom.
 * That pattern reads `ref.current` during render, which the React Compiler
 * (react-hooks/refs) flags — refs aren't guaranteed stable across the
 * concurrent-render attempts React may discard.
 *
 * Lazy state gives identical semantics with none of that risk:
 *   • the initialiser runs exactly once,
 *   • the value keeps a stable identity across re-renders,
 *   • nothing is read from a ref during render.
 *
 * The setter is intentionally not exposed — an Animated.Value is mutated
 * through the animation APIs, never replaced.
 */
export function useAnimatedValue(initialValue: number): Animated.Value {
  const [value] = useState(() => new Animated.Value(initialValue));
  return value;
}

/** Same, for the multi-axis `Animated.ValueXY`. */
export function useAnimatedValueXY(initialValue?: {
  x: number;
  y: number;
}): Animated.ValueXY {
  const [value] = useState(() => new Animated.ValueXY(initialValue));
  return value;
}

/**
 * A stable ARRAY of Animated.Values — for list/staggered animations where one
 * value per item is needed (e.g. loading dots).
 */
export function useAnimatedValues(
  count: number,
  initialValue: number
): Animated.Value[] {
  const [values] = useState(() =>
    Array.from({ length: count }, () => new Animated.Value(initialValue))
  );

  return values;
}
