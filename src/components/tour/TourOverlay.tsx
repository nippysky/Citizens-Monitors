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
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Mask, Rect } from "react-native-svg";

import { useTour } from "@/context/TourContext";
import type { StepPadding } from "./tourSteps";
import TourSkipConfirmation from "./TourSkipConfirmation";
import TourTooltipCard from "./TourTooltipCard";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const TOOLTIP_WIDTH = 280;
const ARROW_SIZE = 10;
const TOOLTIP_MARGIN = 16;
const SCREEN_PADDING = 16;
const MORPH_DURATION = 360;
const FADE_DURATION = 260;
const TAB_COUNT = 5;

function resolvePadding(p: StepPadding | undefined) {
  if (p === undefined) return { top: 10, bottom: 10, horizontal: 10 };
  if (typeof p === "number") return { top: p, bottom: p, horizontal: p };
  return p;
}

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

  const spotX = useSharedValue(0);
  const spotY = useSharedValue(0);
  const spotW = useSharedValue(0);
  const spotH = useSharedValue(0);
  const spotR = useSharedValue(16);

  const targetRect = currentStep ? targets[currentStep.targetId] : undefined;
  const padding = resolvePadding(currentStep?.highlightPadding);
  const radius = currentStep?.highlightRadius ?? 16;

  const expandedRect = useMemo(() => {
    if (!targetRect) return null;
    const x = targetRect.x - padding.horizontal;
    const y = targetRect.y - padding.top;
    const width = targetRect.width + padding.horizontal * 2;
    const height = targetRect.height + padding.top + padding.bottom;
    return {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.min(screenWidth, width),
      height: Math.max(0, height),
    };
  }, [targetRect, padding, screenWidth]);

  useEffect(() => {
    if (!expandedRect) {
      spotW.value = withTiming(0, {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      });
      spotH.value = withTiming(0, {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      });
      return;
    }

    const isFirstRender =
      spotW.value === 0 && spotH.value === 0 && spotX.value === 0;

    if (isFirstRender) {
      spotX.value = expandedRect.x + expandedRect.width / 2;
      spotY.value = expandedRect.y + expandedRect.height / 2;
      spotW.value = 0;
      spotH.value = 0;
    }

    const timing = {
      duration: MORPH_DURATION,
      easing: Easing.inOut(Easing.cubic),
    };

    spotX.value = withTiming(expandedRect.x, timing);
    spotY.value = withTiming(expandedRect.y, timing);
    spotW.value = withTiming(expandedRect.width, timing);
    spotH.value = withTiming(expandedRect.height, timing);
  }, [
    expandedRect?.x,
    expandedRect?.y,
    expandedRect?.width,
    expandedRect?.height,
    spotX,
    spotY,
    spotW,
    spotH,
    expandedRect,
  ]);

  useEffect(() => {
    spotR.value = withTiming(radius, {
      duration: MORPH_DURATION,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [radius, spotR]);

  useEffect(() => {
    if (!isActive) {
      spotX.value = 0;
      spotY.value = 0;
      spotW.value = 0;
      spotH.value = 0;
    }
  }, [isActive, spotX, spotY, spotW, spotH]);

  const animatedCutoutProps = useAnimatedProps(() => ({
    x: spotX.value,
    y: spotY.value,
    width: spotW.value,
    height: spotH.value,
    rx: spotR.value,
    ry: spotR.value,
  }));

  const tooltipPosition = useMemo(() => {
    if (!expandedRect) return null;

    const placement = currentStep?.placement ?? "auto";
    const arrowAtTab = currentStep?.arrowAtTab;
    const safeTop = insets.top + 12;
    const safeBottom = screenHeight - insets.bottom - 12;

    const spaceBelow =
      safeBottom - (expandedRect.y + expandedRect.height) - TOOLTIP_MARGIN;
    const spaceAbove = expandedRect.y - safeTop - TOOLTIP_MARGIN;

    let placeBelow: boolean;
    if (placement === "below") placeBelow = true;
    else if (placement === "above") placeBelow = false;
    else placeBelow = spaceBelow >= tooltipHeight || spaceBelow > spaceAbove;

    const tooltipY = placeBelow
      ? expandedRect.y + expandedRect.height + TOOLTIP_MARGIN
      : expandedRect.y - TOOLTIP_MARGIN - tooltipHeight;

    let tooltipX: number;
    if (arrowAtTab !== undefined) {
      const tabCenterX = (arrowAtTab + 0.5) * (screenWidth / TAB_COUNT);
      tooltipX = tabCenterX - TOOLTIP_WIDTH / 2;
    } else {
      tooltipX = expandedRect.x;
    }
    const maxX = screenWidth - TOOLTIP_WIDTH - SCREEN_PADDING;
    tooltipX = Math.max(SCREEN_PADDING, Math.min(tooltipX, maxX));

    const arrowAbsX =
      arrowAtTab !== undefined
        ? (arrowAtTab + 0.5) * (screenWidth / TAB_COUNT)
        : expandedRect.x + expandedRect.width / 2;

    const arrowX = Math.max(
      24,
      Math.min(TOOLTIP_WIDTH - 24, arrowAbsX - tooltipX)
    );

    return { tooltipX, tooltipY, placeBelow, arrowX };
  }, [
    expandedRect,
    tooltipHeight,
    screenHeight,
    screenWidth,
    insets.top,
    insets.bottom,
    currentStep?.placement,
    currentStep?.arrowAtTab,
  ]);

  if (!isActive || !currentStep) return null;

  const isTargetReady = !!expandedRect && !!tooltipPosition;

  return (
    <Animated.View
      entering={FadeIn.duration(FADE_DURATION)}
      exiting={FadeOut.duration(200)}
      style={styles.root}
      pointerEvents="box-none"
    >
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <Mask id="tour-spot-mask">
            <Rect
              x={0}
              y={0}
              width={screenWidth}
              height={screenHeight}
              fill="white"
            />
            <AnimatedRect animatedProps={animatedCutoutProps} fill="black" />
          </Mask>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={screenWidth}
          height={screenHeight}
          fill="rgba(10, 14, 28, 0.72)"
          mask="url(#tour-spot-mask)"
        />
      </Svg>

      <Pressable style={StyleSheet.absoluteFillObject} onPress={() => {}} />

      {isTargetReady ? (
        <Animated.View
          key={`tour-tooltip-${currentStepIndex}`}
          entering={FadeIn.duration(FADE_DURATION).easing(
            Easing.out(Easing.cubic)
          )}
          exiting={FadeOut.duration(160)}
          style={[
            styles.tooltipWrap,
            {
              top: tooltipPosition!.tooltipY,
              left: tooltipPosition!.tooltipX,
              width: TOOLTIP_WIDTH,
            },
          ]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (Math.abs(h - tooltipHeight) > 4) setTooltipHeight(h);
          }}
        >
          <View
            style={[
              styles.arrow,
              tooltipPosition!.placeBelow
                ? {
                    top: -ARROW_SIZE,
                    left: tooltipPosition!.arrowX - ARROW_SIZE,
                    borderBottomWidth: ARROW_SIZE,
                    borderBottomColor: "#FBF4C7",
                    borderLeftWidth: ARROW_SIZE,
                    borderRightWidth: ARROW_SIZE,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                  }
                : {
                    bottom: -ARROW_SIZE,
                    left: tooltipPosition!.arrowX - ARROW_SIZE,
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
      ) : null}

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