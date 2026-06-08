/**
 * Intercepts Android hardware back button when a BottomSheetModal is open,
 * dismissing the sheet instead of navigating away.
 *
 * Usage:
 *   const { handleSheetChange } = useBottomSheetBackHandler(sheetRef);
 *   <BottomSheetModal ... onChange={handleSheetChange} />
 */
import { useCallback, useEffect, useRef } from "react";
import { BackHandler } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";

export function useBottomSheetBackHandler(
  ref: React.RefObject<BottomSheetModal | null>
) {
  const isOpenRef = useRef(false);

  const handleSheetChange = useCallback((index: number) => {
    isOpenRef.current = index >= 0;
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isOpenRef.current && ref.current) {
          ref.current.dismiss();
          return true; // consume the event — prevent navigation
        }
        return false;
      }
    );

    return () => subscription.remove();
  }, [ref]);

  return { handleSheetChange };
}
