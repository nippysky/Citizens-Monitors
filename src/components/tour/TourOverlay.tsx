import { usePathname } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isTabPathname } from "@/constants/tabRoutes";
import { useTour } from "@/context/TourContext";
import TourSkipConfirmation from "./TourSkipConfirmation";
import TourTooltipCard from "./TourTooltipCard";

const TOOLTIP_WIDTH = 280;
const ARROW_SIZE = 10;
const TOOLTIP_MARGIN = 16;
const SCREEN_PADDING = 16;
const TAB_COUNT = 5;
const FADE_DURATION = 240;

export default function TourOverlay() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const pathname = usePathname();

  const {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    isLastStep,
    targets,
    next,
    skip,
  } = useTour();

  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [tooltipHeight, setTooltipHeight] = useState(180);

  useEffect(() => {
    if (!isActive) {
      setShowSkipConfirm(false);
    }
  }, [isActive]);

  const targetRect = currentStep ? targets[currentStep.targetId] : undefined;

  const tooltipPosition = useMemo(() => {
    if (!currentStep) return null;

    const placement = currentStep.placement ?? "auto";
    const arrowAtTab = currentStep.arrowAtTab;

    const safeTop = insets.top + 12;
    const safeBottom = screenHeight - insets.bottom - 12;

    /*
     * Fallback protection:
     * Never return null while the tour is active.
     * If the final target is not measured yet, this keeps 7/7 visible
     * instead of leaving the tour active and forcing navigation back to Me.
     */
    if (!targetRect) {
      const fallbackTooltipX = Math.max(
        SCREEN_PADDING,
        Math.min(
          screenWidth / 2 - TOOLTIP_WIDTH / 2,
          screenWidth - TOOLTIP_WIDTH - SCREEN_PADDING
        )
      );

      const fallbackTooltipY = Math.max(
        safeTop,
        Math.min(
          screenHeight - insets.bottom - tooltipHeight - 110,
          safeBottom - tooltipHeight
        )
      );

      let fallbackArrowAbsX: number | null = null;

      if (arrowAtTab !== undefined) {
        fallbackArrowAbsX = (arrowAtTab + 0.5) * (screenWidth / TAB_COUNT);
      }

      const fallbackArrowX =
        fallbackArrowAbsX === null
          ? TOOLTIP_WIDTH / 2
          : Math.max(
              26,
              Math.min(
                TOOLTIP_WIDTH - 26,
                fallbackArrowAbsX - fallbackTooltipX
              )
            );

      return {
        tooltipX: fallbackTooltipX,
        tooltipY: fallbackTooltipY,
        placeBelow: false,
        arrowX: fallbackArrowX,
        showArrow: arrowAtTab !== undefined,
      };
    }

    const targetBottomY = targetRect.y + targetRect.height;
    const targetCenterX = targetRect.x + targetRect.width / 2;

    const spaceBelow = safeBottom - targetBottomY - TOOLTIP_MARGIN;
    const spaceAbove = targetRect.y - safeTop - TOOLTIP_MARGIN;

    let placeBelow: boolean;

    if (placement === "below") {
      placeBelow = true;
    } else if (placement === "above") {
      placeBelow = false;
    } else {
      placeBelow = spaceBelow >= tooltipHeight || spaceBelow > spaceAbove;
    }

    let tooltipY = placeBelow
      ? targetBottomY + TOOLTIP_MARGIN
      : targetRect.y - TOOLTIP_MARGIN - tooltipHeight;

    tooltipY = Math.max(
      safeTop,
      Math.min(tooltipY, safeBottom - tooltipHeight)
    );

    let arrowAbsX: number;

    if (arrowAtTab !== undefined) {
      arrowAbsX = (arrowAtTab + 0.5) * (screenWidth / TAB_COUNT);
    } else {
      arrowAbsX = targetCenterX;
    }

    let tooltipX = arrowAbsX - TOOLTIP_WIDTH / 2;
    const maxX = screenWidth - TOOLTIP_WIDTH - SCREEN_PADDING;

    tooltipX = Math.max(SCREEN_PADDING, Math.min(tooltipX, maxX));

    const arrowX = Math.max(
      26,
      Math.min(TOOLTIP_WIDTH - 26, arrowAbsX - tooltipX)
    );

    return {
      tooltipX,
      tooltipY,
      placeBelow,
      arrowX,
      showArrow: true,
    };
  }, [
    currentStep,
    targetRect,
    tooltipHeight,
    screenWidth,
    screenHeight,
    insets.top,
    insets.bottom,
  ]);

  // Don't render the overlay when the user has navigated away from the tabs
  // (e.g. to /notifications, /help-support, etc.). The tour stays "active" in
  // state so it resumes correctly when they return to the tabs layout.
  // NOTE: usePathname() never includes group segments like "(tabs)", so we
  // must match against the flat tab pathnames.
  const isInTabsLayout = isTabPathname(pathname);

  if (!isActive || !currentStep || !tooltipPosition || !isInTabsLayout) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(FADE_DURATION)}
      exiting={FadeOut.duration(180)}
      style={styles.root}
      pointerEvents="box-none"
    >
      <View style={styles.backdrop} pointerEvents="none" />

      {/* Backdrop: tapping anywhere outside the tooltip advances the tour.
          pointerEvents="auto" intentionally blocks underlying UI touches while
          the tour is active so the user can't accidentally navigate away. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={next}
        pointerEvents="auto"
      />

      <Animated.View
        key={`tour-tooltip-${currentStepIndex}`}
        entering={FadeIn.duration(FADE_DURATION).easing(
          Easing.out(Easing.cubic)
        )}
        exiting={FadeOut.duration(150)}
        style={[
          styles.tooltipWrap,
          {
            top: tooltipPosition.tooltipY,
            left: tooltipPosition.tooltipX,
            width: TOOLTIP_WIDTH,
          },
        ]}
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height;

          if (Math.abs(nextHeight - tooltipHeight) > 4) {
            setTooltipHeight(nextHeight);
          }
        }}
      >
        {tooltipPosition.showArrow ? (
          <View
            style={[
              styles.arrow,
              tooltipPosition.placeBelow
                ? {
                    top: -ARROW_SIZE,
                    left: tooltipPosition.arrowX - ARROW_SIZE,
                    borderBottomWidth: ARROW_SIZE,
                    borderBottomColor: "#FBF4C7",
                    borderLeftWidth: ARROW_SIZE,
                    borderRightWidth: ARROW_SIZE,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                  }
                : {
                    bottom: -ARROW_SIZE,
                    left: tooltipPosition.arrowX - ARROW_SIZE,
                    borderTopWidth: ARROW_SIZE,
                    borderTopColor: "#FBF4C7",
                    borderLeftWidth: ARROW_SIZE,
                    borderRightWidth: ARROW_SIZE,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                  },
            ]}
          />
        ) : null}

        <TourTooltipCard
          title={currentStep.title}
          description={currentStep.description}
          stepNumber={currentStepIndex + 1}
          totalSteps={totalSteps}
          isLastStep={isLastStep}
          onProceed={next}
          onClose={() => setShowSkipConfirm(true)}
        />
      </Animated.View>

      <TourSkipConfirmation
        visible={showSkipConfirm}
        onConfirm={() => {
          setShowSkipConfirm(false);
          skip();
        }}
        onCancel={() => setShowSkipConfirm(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9998,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10, 14, 28, 0.72)",
  },
  tooltipWrap: {
    position: "absolute",
    zIndex: 9999,
  },
  arrow: {
    position: "absolute",
    width: 0,
    height: 0,
    zIndex: 3,
  },
});
