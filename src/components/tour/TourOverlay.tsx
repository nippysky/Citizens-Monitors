import { useMemo, useState } from "react";
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

  const targetRect = currentStep ? targets[currentStep.targetId] : undefined;

  const tooltipPosition = useMemo(() => {
    if (!targetRect || !currentStep) return null;

    const placement = currentStep.placement ?? "auto";
    const arrowAtTab = currentStep.arrowAtTab;

    const safeTop = insets.top + 12;
    const safeBottom = screenHeight - insets.bottom - 12;

    const targetCenterY = targetRect.y + targetRect.height / 2;
    const targetBottomY = targetRect.y + targetRect.height;
    const targetCenterX = targetRect.x + targetRect.width / 2;

    const spaceBelow = safeBottom - targetBottomY - TOOLTIP_MARGIN;
    const spaceAbove = targetRect.y - safeTop - TOOLTIP_MARGIN;

    let placeBelow: boolean;
    if (placement === "below") placeBelow = true;
    else if (placement === "above") placeBelow = false;
    else placeBelow = spaceBelow >= tooltipHeight || spaceBelow > spaceAbove;

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
      targetCenterY,
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

  if (!isActive || !currentStep || !tooltipPosition) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(FADE_DURATION)}
      exiting={FadeOut.duration(180)}
      style={styles.root}
      pointerEvents="box-none"
    >
      {/* Full dark overlay only — no cutout, no highlight */}
      <View style={styles.backdrop} pointerEvents="none" />

      {/* Block touches behind tour */}
      <Pressable style={StyleSheet.absoluteFillObject} onPress={() => {}} />

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
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (Math.abs(h - tooltipHeight) > 4) {
            setTooltipHeight(h);
          }
        }}
      >
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
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 14, 28, 0.72)",
  },
  tooltipWrap: {
    position: "absolute",
  },
  arrow: {
    position: "absolute",
    width: 0,
    height: 0,
    zIndex: 3,
  },
});